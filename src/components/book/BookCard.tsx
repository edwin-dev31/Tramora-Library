import type { Book } from '@/types/books';
import { Card, CardContent } from '@/components/ui/card';
import './BookCard.css';

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  const cover = book.coverUrl;

  return (
    <article>
      <Card className="h-full py-0 ring-[0.0625rem]">
        <CardContent className="book-card">
          {cover ? (
            <img
              src={cover}
              alt={`Cover of ${book.title}`}
              className="book-cover"
            />
          ) : (
            <div className="book-cover book-cover--placeholder">{book.title}</div>
          )}

          <div className="book-info">
            <h3 className="book-title" title={book.title}>{book.title}</h3>
            <p className="book-authors">{book.authors.join(', ') || 'Unknown author'}</p>

            {book.publishedDate && (
              <p className="book-meta">{book.publishedDate}</p>
            )}

            {book.description && (
              <p className="book-description">{book.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </article>
  );
};

export default BookCard;
