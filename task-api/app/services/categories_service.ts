import TaskCategory from '#models/task_category'

export default class CategoriesService {
  async list() {
    return TaskCategory.query()
      .select(['id', 'name', 'color'])
      .orderBy('id', 'asc')
  }
}
