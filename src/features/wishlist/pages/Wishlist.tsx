import { Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { SavedBookCard } from '@/shared/components/book/SavedBookCard';
import { ListFeedback, ListMore } from '@/shared/components/layout/ListFeedback';
import { useLibraryList } from '@/shared/hooks/useLibraryList';
import { useLibraryAction } from '@/shared/hooks/useLibraryAction';
import { wishlistService } from '@/features/wishlist/api/wishlist.service';
import { READING_LABELS, type ReadingEntry, type ReadingStatus } from '@/features/wishlist/types';

export default function WishlistPage() {
  const list = useLibraryList<ReadingEntry>('wishlist', wishlistService.getAll);
  const action = useLibraryAction();
  return (
    <div className="library-page wishlist-page">
      <header className="page-header">
        <h1 className="page-title">Wishlist</h1>
        <p className="page-description">Save books and track your reading progress.</p>
      </header>
      {action.error && (
        <p
          role="alert"
          className="text-destructive"
        >
          {action.error}
        </p>
      )}
      <ListFeedback
        {...list}
        empty={!list.items.length}
        emptyText="Your wishlist is empty. Add a book from the catalog to get started."
        retry={list.refetch}
      />
      <div
        className="library-grid wishlist-grid"
        role="list"
      >
        {list.items.map((item) => (
          <SavedBookCard
            key={item.id}
            book={item.book}
          >
            <label
              className="text-sm font-medium"
              htmlFor={`reading-${item.id}`}
            >
              Reading status
            </label>
            <select
              id={`reading-${item.id}`}
              className="library-select"
              value={item.reading_status}
              disabled={action.isPending(item.id)}
              onChange={async (event) => {
                const status = event.target.value as ReadingStatus;
                if (
                  await action.runOperation(item.id, (token, signal) =>
                    wishlistService.updateStatus(item.id, status, token, signal),
                  )
                )
                  await list.refetch();
              }}
            >
              {Object.entries(READING_LABELS).map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              disabled={action.isPending(item.id)}
              onClick={async () => {
                if (
                  await action.runOperation(item.id, (token, signal) =>
                    wishlistService.remove(item.id, token, signal),
                  )
                )
                  await list.refetch();
              }}
            >
              Remove from wishlist
            </Button>
          </SavedBookCard>
        ))}
      </div>
      <ListMore {...list} />
      <Link
        to="/"
        className="library-text-link"
      >
        Browse books
      </Link>
    </div>
  );
}
