import type { ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardDescription, CardHeader } from '@/shared/components/ui/card';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const AuthLayout = ({ title, description, children }: AuthLayoutProps) => (
  <section
    className="mx-auto flex w-full max-w-md flex-col gap-6 py-8 sm:py-12"
    aria-labelledby="auth-heading"
  >
    <Link
      to="/"
      className="mx-auto inline-flex items-center gap-2 rounded-md text-lg font-semibold outline-none focus-visible:ring-[0.125rem] focus-visible:ring-ring"
    >
      <BookOpen className="size-6" aria-hidden="true" />
      Library
    </Link>

    <Card className="gap-6 py-6">
      <CardHeader className="gap-2 px-6">
        <h1 id="auth-heading" className="text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        <CardDescription className="leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      {children}
    </Card>
  </section>
);

export default AuthLayout;
