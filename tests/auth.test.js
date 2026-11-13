// Characterization tests: record what /auth and the auth middleware do at `baseline`.
// They must keep passing after refactoring.
import { api, createUser, signedInUser, bearer } from './helpers'

describe('POST /auth/signin', () => {
  test('valid credentials return token, public user fields and set cookie "t"', async () => {
    const { email, password, name } = await createUser()
    const res = await api().post('/auth/signin').send({ email, password })

    expect(res.status).toBe(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.user).toEqual({ _id: expect.any(String), name, email, seller: false })
    expect(res.headers['set-cookie'].join()).toMatch(/^t=/)
  })

  test('unknown email -> 401 "User not found"', async () => {
    const res = await api().post('/auth/signin').send({ email: 'nobody@test.com', password: 'x' })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'User not found' })
  })

  test('wrong password -> 401 "Email and password don\'t match."', async () => {
    const { email } = await createUser()
    const res = await api().post('/auth/signin').send({ email, password: 'wrongpass' })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Email and password don't match." })
  })
})

describe('GET /auth/signout', () => {
  test('clears cookie "t" and returns message', async () => {
    const res = await api().get('/auth/signout')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'signed out' })
    expect(res.headers['set-cookie'].join()).toMatch(/^t=;/)
  })
})

describe('requireSignin / hasAuthorization', () => {
  test('protected route without token -> 401 UnauthorizedError', async () => {
    const { user } = await signedInUser()
    const res = await api().get(`/api/users/${user._id}`)
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'UnauthorizedError: No authorization token was found' })
  })

  test('invalid token -> 401 UnauthorizedError', async () => {
    const { user } = await signedInUser()
    const res = await api().get(`/api/users/${user._id}`).set(bearer('not.a.token'))
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/^UnauthorizedError: /)
  })

  test("editing another user's profile -> 403 \"User is not authorized\"", async () => {
    const alice = await signedInUser()
    const bob = await signedInUser()
    const res = await api().put(`/api/users/${bob.user._id}`).set(bearer(alice.token)).send({ name: 'hacked' })
    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'User is not authorized' })
  })
})
