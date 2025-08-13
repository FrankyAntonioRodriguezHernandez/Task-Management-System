import vine from '@vinejs/vine'

export const createAttachmentValidator = vine.compile(
  vine.object({
    file: vine.file({
      size: '5mb',
      extnames: ['pdf','doc','docx','png','jpg','jpeg'],
    }),
  })
)
