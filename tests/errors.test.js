// Characterization of the global error middleware in server/express.js.
import { api } from './helpers'

test('malformed JSON body -> 400 "SyntaxError: ..."', async () => {
  const res = await api().post('/api/users').set('Content-Type', 'application/json').send('{"name":')
  expect(res.status).toBe(400)
  expect(res.body.error).toMatch(/^SyntaxError: /)
})
