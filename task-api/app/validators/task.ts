import vine from '@vinejs/vine'

export const createTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    status: vine.enum(['in_progress', 'reviews', 'completed', 'done'] as const),
    category_ids: vine.array(vine.number()).optional(),
    assignee_ids: vine.array(vine.number()).optional(),
  })
)

export const updateTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).optional(),
    status: vine.enum(['in_progress', 'reviews', 'completed', 'done'] as const).optional(),
    category_ids: vine.array(vine.number()).optional(), 
    assignee_ids: vine.array(vine.number()).optional(),  
  })
)
