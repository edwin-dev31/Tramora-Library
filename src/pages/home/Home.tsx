import { useState, useEffect, useCallback, useRef } from 'react';
import './Home.css';

import type { Book, SearchOptions, SearchField } from '@/types/books';
import type { Page } from '@/types/api';
import BookCard from '@/components/book/BookCard';
import { API_ROUTES } from '@/constants/api.constants';
import { useFetch } from '@/hooks/useFetch';
import { SEARCH_CATEGORIES, ALL_FIELDS } from '@/components/search/searchCategories';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Sparkles, Search, Loader2, ChevronRight } from 'lucide-react';

const POPULAR_SEARCHES = [
  { query: 'fantasy', field: 'subject' as SearchField, label: 'Fantasy' },
  { query: 'science fiction', field: 'subject' as SearchField, label: 'Sci-Fi' },
  { query: 'mystery', field: 'subject' as SearchField, label: 'Mystery' },
  { query: 'romance', field: 'subject' as SearchField, label: 'Romance' },
  { query: 'history', field: 'subject' as SearchField, label: 'History' },
  { query: 'biography', field: 'subject' as SearchField, label: 'Biography' },
];

const Home = () => {
  const [searchPath, setSearchPath] = useState<string | null>(null);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<SearchField>('all');
  const heroSearchRef = useRef<HTMLInputElement>(null);

  const { data, error, isLoading, refetch } = useFetch<Page<Book>>(searchPath);

  const buildSearchPath = useCallback((options: SearchOptions) => {
    const params = new URLSearchParams({
      query: options.query,
      field: options.field ?? 'all',
      limit: String(options.limit ?? 20),
      offset: String(options.offset ?? 0),
    });
    return `${API_ROUTES.BOOKS}?${params}`;
  }, []);

  const handleSearch = useCallback((options: SearchOptions) => {
    setSearchPath(buildSearchPath(options));
    setShowSearchResults(true);
    setSearchQuery(options.query);
    setSearchField(options.field ?? 'all');
    heroSearchRef.current?.blur();
  }, [buildSearchPath]);

  const handleHeroSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query') as string;
    const field = formData.get('field') as SearchField;
    if (query?.trim()) {
      handleSearch({ query: query.trim(), field: field ?? 'all' });
    }
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch(buildSearchPath({ query: 'fantasy', field: 'subject', limit: 8 }));
        const data = await response.json();
        setFeaturedBooks(data.items || []);
      } catch (err) {
        console.error('Failed to fetch featured books:', err);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    fetchFeatured();
  }, [buildSearchPath]);

  const books = data?.items ?? [];
  const totalItems = data?.pagination?.total ?? 0;
  const hasSearched = searchPath !== null;
  const hasResults = books.length > 0;
  const isEmpty = hasSearched && !isLoading && !error && !hasResults;

  const renderBookSkeleton = () => (
    <Skeleton className="book-card-skeleton">
      <div className="book-cover-skeleton" />
      <div className="book-info-skeleton">
        <div className="skeleton-title" />
        <div className="skeleton-authors" />
        <div className="skeleton-meta" />
        <div className="skeleton-description" />
        <div className="skeleton-description short" />
      </div>
    </Skeleton>
  );

  const renderCategoryCard = (category: typeof POPULAR_SEARCHES[0]) => (
    <Button
      variant="outline"
      className="category-card h-auto p-4 text-left gap-2 transition-all hover:shadow-md hover:border-primary/50"
      onClick={() => handleSearch({ query: category.query, field: category.field })}
    >
      <BookOpen className="size-5 text-primary shrink-0" aria-hidden="true" />
      <span className="font-medium truncate">{category.label}</span>
      <ChevronRight className="size-4 text-muted-foreground shrink-0 ml-auto" aria-hidden="true" />
    </Button>
  );

  return (
    <div className="home-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <header className="hero-header">
            <div className="hero-badge" aria-hidden="true">
              <Sparkles className="size-3" />
              <span>Discover your next favorite book</span>
            </div>
            <h1 id="hero-title" className="hero-title">
              Your personal <span className="text-primary">library</span> awaits
            </h1>
            <p className="hero-description">
              Search millions of books by title, author, subject, or ISBN.
              Find new reads, revisit classics, and build your reading list.
            </p>
          </header>

          <form onSubmit={handleHeroSearch} className="hero-search" role="search">
            <div className="hero-search-fields">
              <div className="hero-search-select">
                <Select
                  value={searchField}
                  onValueChange={(value) => setSearchField(value as SearchField)}
                >
                  <SelectTrigger aria-label="Search field">
                    <SelectValue placeholder="All fields" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={5}>
                    <SelectItem key={ALL_FIELDS.keyword} value={ALL_FIELDS.keyword}>
                      {ALL_FIELDS.label}
                    </SelectItem>
                    {SEARCH_CATEGORIES.map((field) => (
                      <SelectItem key={field.keyword} value={field.keyword}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="hero-search-input-wrapper">
                <Search className="hero-search-icon" aria-hidden="true" />
                <input
                  ref={heroSearchRef}
                  name="query"
                  type="search"
                  placeholder="Search books, authors, subjects..."
                  autoComplete="off"
                  className="hero-search-input"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="hero-search-btn"
              disabled={isLoading}
              aria-label="Search"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="size-4" aria-hidden="true" />
                  <span>Search</span>
                </>
              )}
            </Button>
            <input type="hidden" name="field" value={searchField} />
          </form>

          <div className="hero-hints" aria-label="Popular searches">
            <span className="hero-hints-label">Popular:</span>
            <div className="hero-hints-list" role="list">
              {POPULAR_SEARCHES.slice(0, 4).map((search) => (
                <button
                  key={search.label}
                  type="button"
                  className="hero-hint-btn"
                  onClick={() => handleSearch({ query: search.query, field: search.field })}
                  role="listitem"
                >
                  {search.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {!showSearchResults && (
        <>
          <section className="categories" aria-labelledby="categories-title">
            <header className="section-header">
              <h2 id="categories-title" className="section-title">
                <BookOpen className="size-5" aria-hidden="true" />
                Browse by Genre
              </h2>
              <p className="section-description">
                Explore curated categories to find your next read
              </p>
            </header>
            <div className="categories-grid" role="list">
              {POPULAR_SEARCHES.map((category) => (
                <article key={category.label} className="category-item" role="listitem">
                  {renderCategoryCard(category)}
                </article>
              ))}
            </div>
          </section>

          <section className="featured" aria-labelledby="featured-title">
            <header className="section-header">
              <h2 id="featured-title" className="section-title">
                <Sparkles className="size-5" aria-hidden="true" />
                Featured Books
              </h2>
              <p className="section-description">
                Hand-picked recommendations for you
              </p>
            </header>
            {isLoadingFeatured ? (
              <div className="books-grid" aria-busy="true" aria-label="Loading featured books">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i}>{renderBookSkeleton()}</div>
                ))}
              </div>
            ) : featuredBooks.length > 0 ? (
              <div className="books-grid" role="list">
                {featuredBooks.map((book) => (
                  <article key={book.id} className="book-item" role="listitem">
                    <BookCard book={book} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen className="size-12 text-muted-foreground/50" aria-hidden="true" />
                <p className="empty-state-text">No featured books available</p>
              </div>
            )}
          </section>
        </>
      )}

      {showSearchResults && (
        <section className="search-results" aria-labelledby="results-title">
          <header className="results-header">
            <div className="results-header-content">
              <Button
                variant="ghost"
                size="icon"
                className="results-back-btn"
                onClick={() => {
                  setShowSearchResults(false);
                  setSearchPath(null);
                }}
                aria-label="Back to home"
              >
                <Search className="size-4" aria-hidden="true" />
              </Button>
              <div>
                <h2 id="results-title" className="results-title">
                  {searchQuery ? `Results for "${searchQuery}"` : 'Search Results'}
                </h2>
                <p className="results-meta">
                  {searchField !== 'all' && `in ${SEARCH_CATEGORIES.find(f => f.keyword === searchField)?.label ?? searchField}`}
                  {totalItems && ` · ${totalItems.toLocaleString()} found`}
                </p>
              </div>
            </div>
          </header>

          {isLoading && (
            <div className="books-grid" aria-busy="true" aria-label="Loading search results">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>{renderBookSkeleton()}</div>
              ))}
            </div>
          )}

          {error && (
            <div className="error-state" role="alert">
              <p className="error-text">{error}</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          )}

          {isEmpty && (
            <div className="empty-state empty-state--search">
              <Search className="size-12 text-muted-foreground/50" aria-hidden="true" />
              <h3 className="empty-state-title">No books found</h3>
              <p className="empty-state-text">
                We couldn't find any books matching "{searchQuery}".
                Try a different search term or browse our categories below.
              </p>
              <div className="empty-state-actions">
                <Button variant="outline" onClick={() => { setShowSearchResults(false); setSearchPath(null); }}>
                  Clear search
                </Button>
              </div>
            </div>
          )}

          {hasResults && (
            <>
              <div className="books-grid" role="list">
                {books.map((book) => (
                  <article key={book.id} className="book-item" role="listitem">
                    <BookCard book={book} />
                  </article>
                ))}
              </div>

              {totalItems > books.length && (
                <div className="load-more">
                  <Button
                    variant="outline"
                    className="load-more-btn"
                    onClick={() => {
                      const nextOffset = books.length;
                      setSearchPath(buildSearchPath({
                        query: searchQuery,
                        field: searchField,
                        limit: 20,
                        offset: nextOffset,
                      }));
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        <span>Loading more...</span>
                      </>
                    ) : (
                      <>
                        <span>Load more books</span>
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;