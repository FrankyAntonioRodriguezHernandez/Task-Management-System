import { test } from '@japa/runner'
import Task from '#models/task'

test('hay tareas creadas por el seeder', async ({ assert }) => {
  const rows = await Task.query().withScopes((scopes) => scopes.notTrashed()).count('* as total')
  const total = Number(rows[0].$extras.total)
  assert.isAbove(total, 0)
})
