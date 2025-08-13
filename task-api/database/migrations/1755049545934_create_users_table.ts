import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') 
      table.string('email').notNullable().unique()
      table.string('full_name').notNullable()
      table.string('avatar_url').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down () {
    this.schema.dropTable(this.tableName)
  }
}
