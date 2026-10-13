import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BookCard from '@/features/books/components/book/BookCard';
import type { Book } from '@/features/books/types';

const mockBook: Book = {
  id: '1',
  title: 'The Great Gatsby',
  authors: ['F. Scott Fitzgerald'],
  publishedDate: '1925',
  description: 'A classic American novel',
  coverUrl: 'https://example.com/cover.jpg',
};

describe('BookCard', () => {
  it('renders book title', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
  });

  it('renders book authors', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText('F. Scott Fitzgerald')).toBeInTheDocument();
  });

  it('renders published date when available', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText('1925')).toBeInTheDocument();
  });

  it('renders description when available', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText('A classic American novel')).toBeInTheDocument();
  });

  it('displays cover image when coverUrl is provided', () => {
    render(<BookCard book={mockBook} />);
    const img = screen.getByAltText('Cover of The Great Gatsby');
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('displays placeholder with initial when no coverUrl', () => {
    const bookWithoutCover: Book = { ...mockBook, coverUrl: null };
    render(<BookCard book={bookWithoutCover} />);
    const placeholder = screen.getByText('T');
    expect(placeholder).toBeInTheDocument();
    expect(screen.queryByAltText('Cover of The Great Gatsby')).not.toBeInTheDocument();
  });

  it('applies compact variant class when variant is compact', () => {
    const { container } = render(<BookCard book={mockBook} variant="compact" />);
    const card = container.querySelector('.book-card--compact');
    expect(card).toBeInTheDocument();
  });

  it('does not apply compact variant class when variant is default', () => {
    const { container } = render(<BookCard book={mockBook} variant="default" />);
    const card = container.querySelector('.book-card--compact');
    expect(card).not.toBeInTheDocument();
  });

  it('renders article element with book-card-item class', () => {
    const { container } = render(<BookCard book={mockBook} />);
    const article = container.querySelector('article.book-card-item');
    expect(article).toBeInTheDocument();
  });

  it('handles multiple authors correctly', () => {
    const bookWithMultipleAuthors: Book = {
      ...mockBook,
      authors: ['Author One', 'Author Two', 'Author Three'],
    };
    render(<BookCard book={bookWithMultipleAuthors} />);
    expect(screen.getByText('Author One, Author Two, Author Three')).toBeInTheDocument();
  });

  it('shows "Unknown author" when authors array is empty', () => {
    const bookWithoutAuthors: Book = { ...mockBook, authors: [] };
    render(<BookCard book={bookWithoutAuthors} />);
    expect(screen.getByText('Unknown author')).toBeInTheDocument();
  });

  it('does not render published date when not provided', () => {
    const bookWithoutDate: Book = { ...mockBook, publishedDate: null };
    render(<BookCard book={bookWithoutDate} />);
    expect(screen.queryByText('1925')).not.toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const bookWithoutDescription: Book = { ...mockBook, description: null };
    render(<BookCard book={bookWithoutDescription} />);
    expect(screen.queryByText('A classic American novel')).not.toBeInTheDocument();
  });

  it('has overlay element', () => {
    const { container } = render(<BookCard book={mockBook} />);
    const overlay = container.querySelector('.book-cover-overlay');
    expect(overlay).toBeInTheDocument();
  });
});
