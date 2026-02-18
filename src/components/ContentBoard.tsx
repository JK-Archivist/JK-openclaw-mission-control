"use client";
import React, { useRef } from 'react';
import Badge from './Badge';

export type ContentItem = { id: string; idea?: string; title?: string; status?: string; thumbnailUrl?: string; script?: string; updatedAt?: string };

type Props = {
  stages: string[];
  items: ContentItem[];
  moveAction: (formData: FormData)=>void; // server action
  addAction: (formData: FormData)=>void; // server action
};

export default function ContentBoard({ stages, items, moveAction, addAction }: Props){
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

  const groups: Record<string, ContentItem[]> = Object.fromEntries(stages.map(s=>[s,[]]));
  for (const c of items) groups[c.status || stages[0]]?.push(c);

  return (
    <div className="space-y-4">
      <form action={addAction} className="flex gap-2">
        <input name="idea" placeholder="New content idea" className="w-full rounded border px-3 py-2" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">Add Idea</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map(stage => (
          <div key={stage} className="card card-hover" data-stage={stage} onDragOver={onDragOver} onDrop={(e)=>onDrop(e,stage)}>
            <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-medium capitalize hr">
              <span>{stage}</span>
              <Badge variant={stage==='publish'?'success':stage==='thumb'?'info':'muted'}>{groups[stage].length}</Badge>
            </div>
            <div className="p-3 space-y-2 min-h-24">
              {groups[stage].length === 0 && <div className="text-slate-400 text-sm">Drop content here</div>}
              {groups[stage].map(c => (
                <div key={c.id} draggable data-content-id={c.id} onDragStart={(e)=>onDragStart(e, c.id)} className="rounded border p-2 cursor-move bg-white hover:bg-slate-50">
                  <div className="font-medium">{c.idea || c.title || c.id}</div>
                  {c.thumbnailUrl && <img src={c.thumbnailUrl} alt="thumb" className="mt-1 rounded max-h-24" />}
                  {c.updatedAt && <div className="text-[11px] text-slate-500">updated {new Date(c.updatedAt).toLocaleString()}</div>}
                </div>
              ))}
            </div>
            <form ref={el=>{forms.current[stage]=el}} action={moveAction} className="hidden">
              <input name="id" />
              <input name="status" defaultValue={stage} />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
