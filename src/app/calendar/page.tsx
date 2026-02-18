import { listItems, upsertItem } from '@/lib/store';
import { revalidatePath } from 'next/cache';

function fmtDate(iso?: string){ try { return new Date(iso||'').toLocaleDateString(); } catch { return iso||''; } }
function fmtTime(iso?: string){ try { return new Date(iso||'').toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); } catch { return iso||''; } }

function buildMonthGrid(date = new Date()){
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay()+6)%7)); // Monday-start grid
  const cells: Date[] = [];
  for (let i=0;i<42;i++){ const d = new Date(start); d.setDate(start.getDate()+i); cells.push(d); }
  return { year, month, cells };
}

export default async function CalendarPage(props: { searchParams?: Promise<{ m?: string }>}) {
  async function addEvent(formData: FormData) {
    'use server';
    const title = String(formData.get('title') || '').trim();
    const when = String(formData.get('when') || '').trim();
    const kind = String(formData.get('kind') || 'event');
    if (title && when) await upsertItem('events', { title, when, kind });
    revalidatePath('/calendar');
  }

  const events = await listItems<any>('events');
  const sp = await props.searchParams;
  const m = sp?.m; // YYYY-MM
  const base = m && /^\d{4}-\d{2}$/.test(m) ? new Date(m + '-01T00:00:00Z') : new Date();
  const { month, year, cells } = buildMonthGrid(base);
  const byDay: Record<string, any[]> = {};
  for (const e of events){
    const key = (e.when||'').slice(0,10);
    if (!byDay[key]) byDay[key] = []; byDay[key].push(e);
  }
  const monthName = new Intl.DateTimeFormat(undefined, { month: 'long' }).format(new Date(year, month, 1));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Calendar</h1>
      <div className="flex items-center gap-3 muted">
        <a className="btn" href={`/calendar?m=${new Date(year, month-1, 1).toISOString().slice(0,7)}`}>← Prev</a>
        <div className="text-base" style={{color:'var(--fg)'}}>{monthName} {year}</div>
        <a className="btn" href={`/calendar?m=${new Date(year, month+1, 1).toISOString().slice(0,7)}`}>Next →</a>
      </div>
      <div className="grid grid-cols-7 gap-2 text-sm">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
          <div key={d} className="px-2 py-1 text-slate-500">{d}</div>
        ))}
        {cells.map((d, i) => {
          const key = d.toISOString().slice(0,10);
          const inMonth = d.getMonth() === month;
          const dayEvents = byDay[key] || [];
          return (
            <div key={i} className={`min-h-24 card p-2 ${inMonth?'':'opacity-50'}`}>
              <div className="text-[11px] muted">{d.getDate()}</div>
              <div className="mt-1 space-y-1">
                {dayEvents.map((e:any)=> (
                  <div key={e.id} className="rounded bg-slate-100 px-2 py-1">
                    <div className="text-xs font-medium">{e.title}</div>
                    <div className="text-[11px] text-slate-500">{fmtTime(e.when)} • {e.kind||'event'}</div>
                  </div>
                ))}
                {dayEvents.length===0 && <div className="text-[11px] text-slate-300">No events</div>}
              </div>
            </div>
          );
        })}
      </div>
      <form action={addEvent} className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input name="title" placeholder="Event title" className="rounded border px-3 py-2" />
        <input name="when" placeholder="2026-02-20T17:00:00Z" className="rounded border px-3 py-2" />
        <input name="kind" placeholder="cron|deadline|event" className="rounded border px-3 py-2" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">Add</button>
      </form>
    </div>
  );
}
