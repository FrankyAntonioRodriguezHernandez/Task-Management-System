import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import TaskCategory from '#models/task_category'
import Task from '#models/task'

export default class extends BaseSeeder {
  public async run () {
    const users = await User.updateOrCreateMany('email', [
      { email: 'alice@example.com', full_name: 'Alice', avatar_url: null },
      { email: 'bob@example.com', full_name: 'Bob', avatar_url: null },
      { email: 'carol@example.com', full_name: 'Carol', avatar_url: null },
      { email: 'dave@example.com', full_name: 'Dave', avatar_url: null },
      { email: 'erin@example.com', full_name: 'Erin', avatar_url: null },
    ])

    const [ux, design, dev, mkt] = await TaskCategory.updateOrCreateMany('name', [
      { name: 'UX/UI', color: '#8b5cf6' },
      { name: 'Design', color: '#f59e0b' },
      { name: 'Development', color: '#10b981' },
      { name: 'Marketing', color: '#3b82f6' },
    ])

    const titles = [
      'Test Planning','User Acceptance Test','Landing Redesign','API Contract','Marketing Brief',
      'Onboarding Flow','Fix Upload Limits','Optimize Queries','Review Copy','Finalize Icons',
      'QA Round','Improve Accessibility','Refactor Auth','Dashboard Metrics','Content Calendar',
      'Campaign Assets','Bug Triage','Sprint Retro','Deploy Script','Docs Update'
    ]

    for (let i = 0; i < 18; i++) {
      const creator = users[i % users.length]
      const t = await Task.create({
        title: titles[i],
        status: (['in_progress','reviews','completed','done'] as const)[i % 4],
        created_by: creator.id,
      })
      await t.related('categories').attach({ [ [ux,design,dev,mkt][i % 4].id ]: {} })
      await t.related('assignees').attach([ users[(i+1)%users.length].id, users[(i+2)%users.length].id ])
    }
  }
}
