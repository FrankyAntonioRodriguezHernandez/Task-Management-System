import router from '@adonisjs/core/services/router'

const TasksController = () => import('#controllers/tasks_controller')
const UsersController = () => import('#controllers/users_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const TaskCommentsController = () => import('#controllers/task_comments_controller')
const TaskAttachmentsController = () => import('#controllers/task_attachments_controller')

// Healthcheck opcional
router.get('/health', async () => ({ ok: true }))

// Listados base para selects
router.get('/users', [UsersController, 'index'])
router.get('/categories', [CategoriesController, 'index'])

// Tasks CRUD + soft delete/restore
router.get('/tasks', [TasksController, 'index'])
router.get('/tasks/counts', [TasksController, 'counts'])
router.get('/tasks/deleted', [TasksController, 'deleted'])
router.post('/tasks', [TasksController, 'store'])
router.get('/tasks/:id', [TasksController, 'show'])
router.put('/tasks/:id', [TasksController, 'update'])
router.patch('/tasks/:id', [TasksController, 'update'])
router.delete('/tasks/:id', [TasksController, 'destroy'])
router.post('/tasks/:id/restore', [TasksController, 'restore'])

// Comentarios por tarea// Comentarios por tarea
router.get('/tasks/:taskId/comments', [TaskCommentsController, 'index'])
router.post('/tasks/:taskId/comments', [TaskCommentsController, 'store'])
router.put('/tasks/:taskId/comments/:id', [TaskCommentsController, 'update'])   
router.patch('/tasks/:taskId/comments/:id', [TaskCommentsController, 'update']) 
router.delete('/tasks/:taskId/comments/:id', [TaskCommentsController, 'destroy']) 


// Adjuntos por tarea
router.get('/tasks/:id/attachments', [TaskAttachmentsController, 'index'])
router.post('/tasks/:id/attachments', [TaskAttachmentsController, 'store'])

// Descargar adjunto por ID de attachment
router.get('/attachments/:id/download', [TaskAttachmentsController, 'download'])
