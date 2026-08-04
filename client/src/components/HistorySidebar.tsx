import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { proposalsApi, type ProposalListItem } from '../api/endpoints';
import { ApiError } from '../api/client';
import { useToast } from './toast';
import s from './historysidebar.module.css';

export function HistorySidebar({
  onSelect,
  onDeleted,
}: {
  onSelect: (item: ProposalListItem) => void;
  onDeleted?: (id: string) => void;
}) {
  const toast = useToast();
  const [items, setItems] = useState<ProposalListItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    proposalsApi
      .list()
      .then(setItems)
      .catch((e) => toast.error(e instanceof ApiError ? e.message : 'Failed to load history'))
      .finally(() => setLoading(false));
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        (i.jobDescription?.title ?? '').toLowerCase().includes(q) ||
        (i.jobDescription?.company ?? '').toLowerCase().includes(q) ||
        (i.aiResponse?.generatedText ?? '').toLowerCase().includes(q)
    );
  }, [items, query]);

  async function handleDelete(e: MouseEvent, id: string) {
    e.stopPropagation();
    try {
      await proposalsApi.remove(id);
      setItems((list) => list.filter((i) => i.id !== id));
      onDeleted?.(id);
      toast.success('Proposal deleted');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed');
    }
  }

  return (
    <aside className={s.sidebar}>
      <div className={s.title}>History</div>
      <input
        className={s.search}
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading ? (
        <p className={s.empty}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p className={s.empty}>No proposals yet.</p>
      ) : (
        <div className={s.list}>
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`${s.item} ${item.aiResponse ? '' : s.itemDisabled}`}
              onClick={() => item.aiResponse && onSelect(item)}
            >
              <button className={s.del} onClick={(e) => handleDelete(e, item.id)} aria-label="Delete proposal">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
              <div className={s.itemTitle}>
                {item.jobDescription
                  ? `${item.jobDescription.title} — ${item.jobDescription.company}`
                  : 'Proposal'}
              </div>
              <div className={s.snippet}>
                {(item.aiResponse?.generatedText ?? 'Not generated').replace(/[#*]/g, '')}
              </div>
              <div className={s.date}>{new Date(item.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
