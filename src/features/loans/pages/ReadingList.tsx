import { Link } from 'react-router';
import { SavedBookCard } from '@/shared/components/book/SavedBookCard';
import { ListFeedback, ListMore } from '@/shared/components/layout/ListFeedback';
import { useLibraryList } from '@/shared/hooks/useLibraryList';
import { loansService } from '@/features/loans/api/loans.service';
import type { ReadingEntry } from '@/features/wishlist/types';
import '../loans.css';

export default function ReadingList() {
  const list = useLibraryList<ReadingEntry>('loans:reading', loansService.getReadingList);
  return (
    <div className="library-page reading-page">
      <header className="page-header">
        <h1 className="page-title">Currently Reading</h1>
        <p className="page-description">Books marked as Reading in your wishlist.</p>
      </header>
      <ListFeedback
        {...list}
        empty={!list.items.length}
        emptyText="Nothing in progress. Set a wishlist book to Reading to see it here."
        retry={list.refetch}
      />
      <div
        className="library-grid reading-grid"
        role="list"
      >
        {list.items.map((item) => (
          <SavedBookCard
            key={item.id}
            book={item.book}
          >
            <span className="text-sm">Reading</span>
          </SavedBookCard>
        ))}
      </div>
      <ListMore {...list} />
      <Link
        to="/wishlist"
        className="library-text-link"
      >
        Manage reading in wishlist
      </Link>
    </div>
  );
}
