import { listItems, upsertItem } from '@/lib/store';
import { revalidatePath } from 'next/cache';
import TaskBoard from '@/components/TaskBoard';

export default async function TasksPage() {
  async function addTask(formData: FormData) {
    'use server';
    const title = String(formData.get('title') || '').trim();
    const assignee = String(formData.get('assignee') || 'agent:main');
    const priority = String(formData.get('priority') || 'medium');
    if (title) await upsertItem('tasks', { title, status: 'todo', assignee, priority });
    revalidatePath('/tasks');
  }
  async function moveTask(formData: FormData) {
    'use server';
    const id = String(formData.get('id') || '');
    const status = String(formData.get('status') || 'todo');
    if (id) await upsertItem('tasks', { id, status });
    revalidatePath('/tasks');
  }

  const tasks = await listItems<any>('tasks');
  const cols = ['todo','doing','done','blocked'];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tasks Board</h1>
      <TaskBoard cols={cols} tasks={tasks} moveAction={moveTask} addAction={addTask} />
    </div>
  );
}
