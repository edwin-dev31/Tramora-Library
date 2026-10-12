import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { useFetch } from '@/hooks/useFetch';
import { useLibraryAction } from '@/hooks/useLibraryAction';
import { useAuth } from '@/context/auth/useAuth';
import type { Book } from '@/types/books';

interface BookDetailData extends Book {
  availability: { status: string; canBorrow: boolean; canReserve: boolean; borrowedByMe: boolean; reservedByMe: boolean };
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { data: book, error, isLoading, refetch } = useFetch<BookDetailData>(id ? `/books/${encodeURIComponent(id)}` : null, accessToken);
  const action = useLibraryAction();
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const perform = async (path: string, success: string) => {
    setMessage('');
    if (await action.run(path, 'POST', { bookId: id })) {
      setMessage(success);
      if (path === '/wishlist') setSaved(true);
      else refetch();
    }
  };
  return <div className="loan-detail-page">
    <Link to="/" className="library-text-link">Back to books</Link>
    {isLoading && <p role="status">Loading book…</p>}
    {error && <div role="alert" className="error-state"><h1 className="page-title">Book details unavailable</h1><p>{error}</p><p>Your saved lists remain available from the menu.</p></div>}
    {action.error && <p role="alert" className="text-destructive">{action.error}</p>}
    {message && <p role="status" className="library-notice">{message}</p>}
    {book && <article className="library-card">
      <div className="library-card-heading">
        {book.coverUrl && <img className="library-thumbnail" src={book.coverUrl} alt={`Cover of ${book.title}`} />}
        <div className="min-w-0"><h1 className="page-title break-words">{book.title}</h1><p>{book.authors.join(', ') || 'Unknown author'}</p></div>
      </div>
      <p className="text-sm">{book.availability.borrowedByMe ? 'You have borrowed this book.' : book.availability.reservedByMe ? 'You have reserved this book.' : `Availability: ${book.availability.status}`}</p>
      <div className="library-actions">
        <Button disabled={action.busy || !book.availability.canBorrow} onClick={() => void perform('/loans', 'Book borrowed. You can manage it in Active Loans.')}>Borrow book</Button>
        <Button variant="outline" disabled={action.busy || saved} onClick={() => void perform('/wishlist', 'Added to your wishlist.')}>{saved ? 'Added to wishlist' : 'Add to wishlist'}</Button>
        {book.availability.canReserve && <Button variant="outline" disabled={action.busy} onClick={() => void perform('/reservations', 'Reservation created. Check Reservations for your queue position.')}>Reserve book</Button>}
      </div>
      {book.description && <p className="whitespace-pre-line break-words text-sm leading-relaxed">{book.description.replace(/<[^>]*>/g, '')}</p>}
      <nav className="flex flex-wrap gap-4"><Link className="library-text-link" to="/loans">Active loans</Link><Link className="library-text-link" to="/wishlist">Wishlist</Link><Link className="library-text-link" to="/reservations">Reservations</Link></nav>
    </article>}
  </div>;
}

