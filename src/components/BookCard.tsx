import type { GoogleBook } from '../types/googleBooks';
import './BookCard.css';

interface BookCardProps {
  book: GoogleBook;
}

const BookCard = ({ book }: BookCardProps) => {
  const { volumeInfo } = book;
  const cover = volumeInfo.imageLinks?.thumbnail;

  return (
    <article className="book-card">
      {cover ? (
        <img
          src={cover}
          alt={`Cover of ${volumeInfo.title}`}
          className="book-cover"
        />
      ) : (
        <div className="book-cover book-cover--placeholder">{volumeInfo.title}</div>
      )}

      <div className="book-info">
        <h3 className="book-title">{volumeInfo.title}</h3>
        <p className="book-authors">{volumeInfo.authors?.join(', ') ?? 'Unknown author'}</p>

        {volumeInfo.publishedDate && (
          <p className="book-meta">{volumeInfo.publishedDate}</p>
        )}

        {volumeInfo.description && (
          <p className="book-description">{volumeInfo.description}</p>
        )}
      </div>
    </article>
  );
};

export default BookCard;