import User from '#models/user'

export default class UsersService {
  async list() {
    return User.query()
      .select(['id', 'full_name', 'email', 'avatar_url'])
      .orderBy('id', 'asc')
  }
}