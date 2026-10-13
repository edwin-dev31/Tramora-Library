import { Link } from 'react-router';

const NotFound = () => (
  <section className="mx-auto max-w-md space-y-4 py-12 text-center">
    <p className="text-sm text-muted-foreground">404</p>
    <h1 className="text-2xl font-semibold">Page not found</h1>
    <p className="text-muted-foreground">This page is not available. Head back to the library to explore books.</p>
    <Link to="/" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
  Back to library
</Link>
  </section>
);

export default NotFound;
