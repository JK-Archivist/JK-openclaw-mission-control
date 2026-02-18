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
  async function setOrder(formData: FormData){
    'use server';
    const id = String(formData.get('id') || '');
    const delta = Number(formData.get('delta') || 0);
    const all = await listItems<any>('tasks');
    const t = all.find(x=>x.id===id);
    if (!t) return;
    const col = t.status || 'todo';
    const colTasks = all.filter(x=>(x.status||'todo')===col).sort((a,b)=>(a.order??0)-(b.order??0));
    const idx = colTasks.findIndex(x=>x.id===id);
    const newIdx = Math.max(0, Math.min(colTasks.length-1, idx+delta));
    if (newIdx===idx) return;
    // simple reindex: set order to newIdx, compact others
    colTasks.splice(idx,1);
    colTasks.splice(newIdx,0,t);
    for (let i=0;i<colTasks.length;i++){
      await upsertItem('tasks', { id: colTasks[i].id, order: i });
    }
    revalidatePath('/tasks');
  }

  const tasks = await listItems<any>('tasks');
  const cols = ['todo','doing','done','blocked'];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tasks Board</h1>
      <TaskBoard cols={cols} tasks={tasks} moveAction={moveTask} addAction={addTask} orderAction={setOrder} />
    </div>
  );
}
