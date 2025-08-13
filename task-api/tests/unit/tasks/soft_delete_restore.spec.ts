import { test } from '@japa/runner'
import TaskService from '#services/task_service'
import Task from '#models/task'

test.group('tasks soft delete & restore', () => {
  test('soft delete mueve la tarea a la papelera y restore la regresa', async ({ assert }) => {
    const service = new TaskService()
    
    const created = await service.create({ title: 'Para borrar', status: 'in_progress' }, 1)

    const del = await service.softDelete(created.id)
    assert.exists(del.deleted_at, 'debería tener timestamp de borrado')

    const active = await service.list()
    assert.isFalse(active.some(t => t.id === created.id))

    const trashed = await service.listDeleted()
    assert.isTrue(trashed.some(t => t.id === created.id))

    const restored = await service.restore(created.id)
    assert.equal(restored.id, created.id)

    const active2 = await service.list()
    assert.isTrue(active2.some(t => t.id === created.id))
  })
})
