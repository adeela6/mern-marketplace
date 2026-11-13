import User from '../models/user.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'
import request from 'request'
import config from './../../config/config'
import stripe from 'stripe'
import { asyncHandler, HttpError } from '../helpers/errors'

const myStripe = stripe(config.stripe_test_secret_key)

const create = asyncHandler(async (req, res) => {
  const user = new User(req.body)
  await user.save()
  return res.status(200).json({
    message: "Successfully signed up!"
  })
})

/**
 * Load user and append to req.
 */
const userByID = asyncHandler(async (req, res, next, id) => {
  const user = await User.findById(id)
  if (!user) throw new HttpError(400, "User not found")
  req.profile = user
  next()
}, new HttpError(400, "Could not retrieve user"))

const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

const list = asyncHandler(async (req, res) => {
  const users = await User.find().select('name email updated created')
  res.json(users)
})

const update = asyncHandler(async (req, res) => {
  let user = req.profile
  user = extend(user, req.body)
  user.updated = Date.now()
  await user.save()
  user.hashed_password = undefined
  user.salt = undefined
  res.json(user)
})

const remove = asyncHandler(async (req, res) => {
  const deletedUser = await req.profile.remove()
  deletedUser.hashed_password = undefined
  deletedUser.salt = undefined
  res.json(deletedUser)
})

const isSeller = (req, res, next) => {
  const isSeller = req.profile && req.profile.seller
  if (!isSeller) return next(new HttpError(403, "User is not a seller"))
  next()
}

const stripe_auth = (req, res, next) => {
  request({
    url: "https://connect.stripe.com/oauth/token",
    method: "POST",
    json: true,
    body: {client_secret:config.stripe_test_secret_key,code:req.body.stripe, grant_type:'authorization_code'}
  }, (error, response, body) => {
    if (error) {
      return res.status(400).json({
        error: "Could not connect Stripe account"
      })
    }
    //update user
    if(body.error){
      return res.status('400').json({
        error: body.error_description
      })
    }
    req.body.stripe_seller = body
    next()
  })
}

const stripeCustomer = (req, res, next) => {
  if(req.profile.stripe_customer){
      //update stripe customer
      myStripe.customers.update(req.profile.stripe_customer, {
          source: req.body.token
      }, (err, customer) => {
        if(err){
          return res.status(400).send({
            error: "Could not update charge details"
          })
        }
        req.body.order.payment_id = customer.id
        next()
      })
  }else{
      myStripe.customers.create({
            email: req.profile.email,
            source: req.body.token
      }).then((customer) => {
          User.update({'_id':req.profile._id},
            {'$set': { 'stripe_customer': customer.id }},
            (err, order) => {
              if (err) {
                return res.status(400).send({
                  error: errorHandler.getErrorMessage(err)
                })
              }
              req.body.order.payment_id = customer.id
              next()
            })
      }, (err) => {
        return res.status(400).send({
          error: "Could not update charge details"
        })
      })
  }
}

const createCharge = (req, res, next) => {
  if(!req.profile.stripe_seller){
    return res.status('400').json({
      error: "Please connect your Stripe account"
    })
  }
  myStripe.tokens.create({
    customer: req.order.payment_id,
  }, {
    stripeAccount: req.profile.stripe_seller.stripe_user_id,
  }).then((token) => {
      return myStripe.charges.create({
        amount: req.body.amount * 100, //amount in cents
        currency: "usd",
        source: token.id,
      }, {
        stripeAccount: req.profile.stripe_seller.stripe_user_id,
      })
  }).then((charge) => {
      next()
  }, (err) => {
      return res.status(400).json({
        error: "Could not process charge"
      })
  })
}

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update,
  isSeller,
  stripe_auth,
  stripeCustomer,
  createCharge
}
