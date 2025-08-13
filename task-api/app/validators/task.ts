import vine from '@vinejs/vine'

export const createTaskValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3),
    status: vine.enum(['in_progress','reviews','completed','done'] as const),
    categoryIds: vine.array(vine.number()).optional(),
    assigneeIds: vine.array(vine.number()).optional(),
  })
)

export const updateTaskValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).optional(),
    status: vine.enum(['in_progress','reviews','completed','done'] as const).optional(),
    categoryIds: vine.array(vine.number()).optional(),
    assigneeIds: vine.array(vine.number()).optional(),
  })
)
