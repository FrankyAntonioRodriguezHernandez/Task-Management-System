import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return { message: 'API funcionando' }
})
const TasksController = () => import('#controllers/tasks_controller')
const UsersController = () => import('#controllers/users_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const TaskCommentsController = () => import('#controllers/task_comments_controller')
const TaskAttachmentsController = () => import('#controllers/task_attachments_controller')

router.get('/health', async () => ({ ok: true }))

router.get('/users', [UsersController, 'index'])
router.get('/categories', [CategoriesController, 'index'])

router.get('/tasks', [TasksController, 'index'])
router.get('/tasks/counts', [TasksController, 'counts'])
router.get('/tasks/deleted', [TasksController, 'deleted'])
router.post('/tasks', [TasksController, 'store'])
router.get('/tasks/:id', [TasksController, 'show'])
router.put('/tasks/:id', [TasksController, 'update'])
router.patch('/tasks/:id', [TasksController, 'update'])
router.delete('/tasks/:id', [TasksController, 'destroy'])
router.post('/tasks/:id/restore', [TasksController, 'restore'])

router.get('/tasks/:taskId/comments', [TaskCommentsController, 'index'])
router.post('/tasks/:taskId/comments', [TaskCommentsController, 'store'])
router.put('/tasks/:taskId/comments/:commentId', [TaskCommentsController, 'update'])
router.patch('/tasks/:taskId/comments/:commentId', [TaskCommentsController, 'update'])
router.delete('/tasks/:taskId/comments/:commentId', [TaskCommentsController, 'destroy'])


router.get('/tasks/:id/attachments', [TaskAttachmentsController, 'index'])
router.post('/tasks/:id/attachments', [TaskAttachmentsController, 'store'])
router.get('/attachments/:id/download', [TaskAttachmentsController, 'download'])
router.delete('/attachments/:id', [TaskAttachmentsController, 'destroy'])


