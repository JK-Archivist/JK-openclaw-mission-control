"use client";
import React, { useRef } from 'react';
import Badge from './Badge';

export type Task = { id: string; title?: string; status?: string; assignee?: string; priority?: 'low'|'medium'|'high'|string; order?: number; updatedAt?: string };

type Props = {
  cols: string[];
  tasks: Task[];
  moveAction: (formData: FormData)=>void; // server action
  addAction: (formData: FormData)=>void; // server action
  orderAction?: (formData: FormData)=>void; // server action optional
};

export default function TaskBoard({ cols, tasks, moveAction, addAction, orderAction }: Props){
  const forms = useRef<Record<string, HTMLFormElement | null>>({});

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const onDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const form = forms.current[status];
    if (form) {
      const fd = new FormData(form);
      fd.set('id', id);
      fd.set('status', status);
      moveAction(fd);
    }
  };

  const groups: Record<string, Task[]> = Object.fromEntries(cols.map(c=>[c,[]]));
  for (const t of tasks) groups[t.status || cols[0]]?.push(t);
  for (const c of cols) groups[c].sort((a,b)=> (a.order??0) - (b.order??0));

  return (
    <div className="space-y-4">
      <form action={addAction} className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input name="title" placeholder="New task title" className="rounded border px-3 py-2 md:col-span-2" />
        <div className="flex gap-2">
          <input name="assignee" placeholder="assignee (human|agent:main)" className="rounded border px-3 py-2" />
          <select name="priority" defaultValue="medium" className="rounded border px-2 py-2">
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
          <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">Add</button>
        </div>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cols.map(col => (
          <div key={col} className="rounded-md border bg-white" data-col={col} onDragOver={onDragOver} onDrop={(e)=>onDrop(e,col)}>
            <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-medium capitalize">
              <span>{col}</span>
              <Badge variant={col==='done'?'success':col==='blocked'?'danger':col==='doing'?'info':'muted'}>{groups[col].length}</Badge>
            </div>
            <div className="p-3 space-y-2 min-h-24">
              {groups[col].length === 0 && <div className="text-slate-400 text-sm">Drop tasks here</div>}
              {groups[col].map(t => (
                <div key={t.id} draggable data-task-id={t.id} onDragStart={(e)=>onDragStart(e, t.id)} className="rounded border p-2 cursor-move bg-white hover:bg-slate-50">
                  <div className="font-medium flex items-center gap-2">{t.title || t.id}
                    {t.priority && <Badge variant={t.priority==='high'?'danger':t.priority==='medium'?'info':'muted'}>{t.priority}</Badge>}
                    {t.assignee && <Badge variant={t.assignee.startsWith('agent')?'info':'muted'}>{t.assignee}</Badge>}
                  </div>
                  {t.updatedAt && <div className="text-[11px] text-slate-500">updated {new Date(t.updatedAt).toLocaleString()}</div>}
                  {orderAction && (
                    <div className="mt-1 flex gap-1 text-xs">
                      <button type="button" className="rounded border px-2 py-0.5" onClick={()=>{ const fd=new FormData(); fd.set('id', t.id); fd.set('delta','-1'); orderAction(fd); }}>↑</button>
                      <button type="button" className="rounded border px-2 py-0.5" onClick={()=>{ const fd=new FormData(); fd.set('id', t.id); fd.set('delta','1'); orderAction(fd); }}>↓</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* hidden form for server action submit */}
            <form ref={el=>{forms.current[col]=el}} action={moveAction} className="hidden">
              <input name="id" />
              <input name="status" defaultValue={col} />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
