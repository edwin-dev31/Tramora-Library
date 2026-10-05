import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

const NotFound = () => (
  <section className="mx-auto max-w-md space-y-4 py-12 text-center">
    <p className="text-sm text-muted-foreground">404</p>
    <h1 className="text-2xl font-semibold">Page not found</h1>
    <p className="text-muted-foreground">This page is not available. Head back to the library to explore books.</p>
    <Button asChild><Link to="/">Back to library</Link></Button>
  </section>
);

export default NotFound;
