import { test } from '@japa/runner'
import CommentService from '#services/comment_service'
import TaskService from '#services/task_service'

test.group('comments', () => {
  test('crear y listar comentarios de una tarea', async ({ assert }) => {
    const tasks = new TaskService()
    const comments = new CommentService()

    const t = await tasks.create({ title: 'Con comentarios', status: 'reviews' }, 1)

    const c1 = await comments.create(t.id, 1, 'Primer comentario')
    const c2 = await comments.create(t.id, 1, 'Segundo comentario')

    assert.exists(c1.id)
    assert.exists(c2.id)

    const list = await comments.listByTask(t.id)
    assert.equal(list.length, 2)
    assert.equal(list[0].comment, 'Primer comentario')
    assert.equal(list[1].comment, 'Segundo comentario')
  })
})
