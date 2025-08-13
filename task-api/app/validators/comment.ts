import vine from '@vinejs/vine'

export const createCommentValidator = vine.compile(
  vine.object({
    comment: vine.string().trim().minLength(1),
  })
)

export const updateCommentValidator = vine.compile(
  vine.object({
    comment: vine.string().trim().minLength(1).maxLength(1000),
  })
)