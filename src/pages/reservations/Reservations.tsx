import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { SavedBookCard } from '@/components/book/SavedBookCard';
import { ListFeedback, ListMore } from '@/components/layout/ListFeedback';
import { useLibraryList } from '@/hooks/useLibraryList';
import { useLibraryAction } from '@/hooks/useLibraryAction';
import { loansService } from '@/services/loans.service';
import type { Reservation } from '@/types/library';

const LABELS: Record<Reservation['status'], string> = { waiting: 'Waiting', ready: 'Ready to collect', expired: 'Expired', collected: 'Collected', cancelled: 'Cancelled' };

function ReservationList({ history }: { history: boolean }) {
  const list = useLibraryList<Reservation>(`/reservations/${history ? 'history' : 'active'}`);
  const action = useLibraryAction();
  const update = async (path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown) => {
    if (await action.run(path, method, body)) await list.refetch();
  };
  return <>
    {action.error && <p role="alert" className="text-destructive">{action.error}</p>}
    <ListFeedback {...list} empty={!list.items.length} emptyText={history ? 'No reservation history.' : 'No active reservations. Reserve an unavailable book from its details.'} retry={list.refetch} />
    <div className="reservations-grid" role="list">{list.items.map(item => <SavedBookCard key={item.id} book={item.book}>
      <p className="font-medium">{LABELS[item.status]}</p>
      <p className="text-sm">Requested: {new Date(item.created_at).toLocaleDateString()}</p>
      {item.status === 'waiting' && <p className="text-sm">Queue position: {item.position}</p>}
      {item.estimated_available_at && <p className="text-sm">Estimated availability: {new Date(item.estimated_available_at).toLocaleDateString()}</p>}
      {item.status === 'ready' && item.expires_at && <p className="text-sm">Collect before: {new Date(item.expires_at).toLocaleString()}</p>}
      {!history && <>
        <label className="flex items-center gap-3 min-h-11 text-sm"><input type="checkbox" checked={item.notifications_enabled} disabled={action.busy} onChange={event => void update(`/reservations/${item.id}/notifications`, 'PUT', { notificationsEnabled: event.target.checked })} />Reservation notifications</label>
        {item.status === 'ready' && <Button disabled={action.busy} onClick={async () => {
          if (await action.runOperation((token, signal) => loansService.borrow(item.book.id, token, signal))) await list.refetch();
        }}>Borrow book</Button>}
        <Button variant="outline" disabled={action.busy} onClick={() => void update(`/reservations/${item.id}`, 'DELETE')}>Cancel reservation</Button>
      </>}
    </SavedBookCard>)}</div>
    <ListMore {...list} />
  </>;
}

export default function ReservationsPage() {
  const [history, setHistory] = useState(false);
  return <div className="reservations-page">
    <header className="page-header"><h1 className="page-title">Reservations</h1><p className="page-description">Manage your book reservations</p></header>
    <div className="reservation-tabs" aria-label="Reservation filters">{[false, true].map(value => <button key={String(value)} type="button" aria-pressed={history === value} className={`reservation-tab ${history === value ? 'active' : ''}`} onClick={() => setHistory(value)}>{value ? 'History' : 'Active'}</button>)}</div>
    <ReservationList key={String(history)} history={history} />
    <Link to="/" className="library-text-link">Browse books</Link>
  </div>;
}

