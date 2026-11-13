// Characterization tests: record what /api/users does at `baseline`,
// including the weak spots (D-08) so any change to them is deliberate.
import { api, createUser } from './helpers'
import User from '../server/models/user.model'

describe('POST /api/users (sign up)', () => {
  test('valid user -> 200 success message', async () => {
    const res = await api().post('/api/users').send({ name: 'A', email: 'a@test.com', password: 'secret123' })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'Successfully signed up!' })
  })

  test('password is stored hashed with a salt, never in plain text', async () => {
    await createUser({ email: 'h@test.com', password: 'secret123' })
    const u = await User.findOne({ email: 'h@test.com' })
    expect(u.hashed_password).toBeTruthy()
    expect(u.hashed_password).not.toBe('secret123')
    expect(u.salt).toBeTruthy()
  })

  test.each([
    [{ email: 'a@test.com', password: 'secret123' }, 'Name is required'],
    [{ name: 'A', password: 'secret123' }, 'Email is required'],
    [{ name: 'A', email: 'not-an-email', password: 'secret123' }, 'Please fill a valid email address'],
    [{ name: 'A', email: 'a@test.com', password: '123' }, 'Password must be at least 6 characters.'],
    [{ name: 'A', email: 'a@test.com' }, 'Password is required'],
  ])('invalid body %j -> 400 "%s"', async (body, error) => {
    const res = await api().post('/api/users').send(body)
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error })
  })

  // Baseline quirk: dbErrorHandler slices Mongo's raw message, so the text is mangled
  // (e.g. "11000 duplicate key error collection: <db>.users index: email already exists")
  // and varies with DB name / Mongo version. Only the stable part is pinned.
  test('duplicate email -> 400 with "already exists" error', async () => {
    const { email } = await createUser()
    const res = await api().post('/api/users').send({ name: 'Dup', email, password: 'secret123' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/email already exists$/)
  })
})

describe('GET /api/users', () => {
  test('is public (D-08) and returns only _id, name, email, created, updated', async () => {
    await createUser()
    const res = await api().get('/api/users')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    // `updated` is absent until the user is first updated
    expect(Object.keys(res.body[0]).sort()).toEqual(['_id', 'created', 'email', 'name'])
  })
})

