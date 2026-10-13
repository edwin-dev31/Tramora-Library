import type { Book } from '@/features/books/types';
import { Link } from 'react-router';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/cn';
import './BookCard.css';

interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact';
}

const BookCard = ({ book, variant = 'default' }: BookCardProps) => {
  const cover = book.coverUrl;

  return (
    <article className="book-card-item">
      <Card
        className={cn(
          'h-full py-0 ring-[0.0625rem] transition-all duration-200',
          'book-card-wrapper',
        )}
      >
        <CardContent className={cn('book-card', variant === 'compact' && 'book-card--compact')}>
          <div className="book-cover-wrapper">
            {cover ? (
              <img
                src={cover}
                alt={`Cover of ${book.title}`}
                className="book-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div
                className="book-cover book-cover--placeholder"
                aria-hidden="true"
              >
                <span className="book-cover-initial">{book.title.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div
              className="book-cover-overlay"
              aria-hidden="true"
            />
          </div>

          <div className="book-info">
            <h3
              className="book-title"
              title={book.title}
            >
              {book.title}
            </h3>
            <p className="book-authors">{book.authors.join(', ') || 'Unknown author'}</p>

            {book.publishedDate && <p className="book-meta">{book.publishedDate}</p>}

            {book.description && <p className="book-description">{book.description}</p>}
            <Link
              to={`/books/${encodeURIComponent(book.id)}`}
              className="library-text-link"
            >
              View details
            </Link>
          </div>
        </CardContent>
      </Card>
    </article>
  );
};

export default BookCard;
