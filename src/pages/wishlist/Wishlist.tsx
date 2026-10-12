import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { SavedBookCard } from '@/components/book/SavedBookCard';
import { ListFeedback, ListMore } from '@/components/layout/ListFeedback';
import { useLibraryList } from '@/hooks/useLibraryList';
import { useLibraryAction } from '@/hooks/useLibraryAction';
import { READING_LABELS, type ReadingEntry } from '@/types/library';

export default function WishlistPage() {
  const list = useLibraryList<ReadingEntry>('/wishlist');
  const action = useLibraryAction();
  return <div className="wishlist-page">
    <header className="page-header"><h1 className="page-title">Wishlist</h1><p className="page-description">Save books and track your reading progress.</p></header>
    {action.error && <p role="alert" className="text-destructive">{action.error}</p>}
    <ListFeedback {...list} empty={!list.items.length} emptyText="Your wishlist is empty. Add a book from the catalog to get started." retry={list.refetch} />
    <div className="wishlist-grid" role="list">
      {list.items.map(item => <SavedBookCard key={item.id} book={item.book}>
        <label className="text-sm font-medium" htmlFor={`reading-${item.id}`}>Reading status</label>
        <select id={`reading-${item.id}`} className="library-select" value={item.reading_status} disabled={action.busy} onChange={async event => {
          if (await action.run(`/wishlist/${item.id}`, 'PUT', { status: event.target.value })) await list.refetch();
        }}>{Object.entries(READING_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <Button variant="outline" disabled={action.busy} onClick={async () => {
          if (await action.run(`/wishlist/${item.id}`, 'DELETE')) await list.refetch();
        }}>Remove from wishlist</Button>
      </SavedBookCard>)}
    </div>
    <ListMore {...list} />
    <Link to="/" className="library-text-link">Browse books</Link>
  </div>;
}

