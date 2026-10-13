import { Button } from '@/shared/components/ui/button';

export function ListFeedback({ loading, error, empty, emptyText, retry }: {
  loading: boolean; error: string; empty: boolean; emptyText: string; retry: () => void;
}) {
  if (loading && empty) return <p role="status" className="py-8 text-center">Loading your library…</p>;
  if (error) return <div role="alert" className="error-state"><p>{error}</p><Button variant="outline" onClick={retry} disabled={loading}>Try again</Button></div>;
  if (empty) return <p className="empty-state text-muted-foreground">{emptyText}</p>;
  return null;
}

export function ListMore({ loading, hasMore, loadMore }: { loading: boolean; hasMore: boolean; loadMore: () => void }) {
  return hasMore ? <Button variant="outline" className="w-full" onClick={loadMore} disabled={loading}>{loading ? 'Loading more…' : 'Load more'}</Button> : null;
}
