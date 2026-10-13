import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { SavedBook } from '@/shared/types/books';

export function SavedBookCard({
  book,
  children,
  to,
}: {
  book: SavedBook;
  children?: ReactNode;
  to?: string;
}) {
  return (
    <article
      className="library-card"
      role="listitem"
    >
      <div className="library-card-heading">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            className="library-thumbnail"
          />
        ) : (
          <div
            className="library-thumbnail library-placeholder"
            aria-hidden="true"
          >
            {book.title.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-semibold break-words">
            <Link
              className="underline-offset-4 hover:underline"
              to={to ?? `/books/${encodeURIComponent(book.id)}`}
            >
              {book.title}
            </Link>
          </h2>
          <p className="text-sm text-muted-foreground break-words">
            {book.author || 'Unknown author'}
          </p>
        </div>
      </div>
      {children}
    </article>
  );
}
