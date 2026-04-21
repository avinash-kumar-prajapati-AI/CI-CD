import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container-shell flex min-h-[60vh] items-center justify-center py-20">
      <div className="glass-card max-w-xl p-10 text-center">
        <p className="theme-accent text-sm uppercase tracking-[0.3em]">404</p>
        <h1 className="theme-title mt-4 font-display text-4xl">Route not found</h1>
        <p className="theme-muted mt-4 text-sm leading-7">
          The page you requested doesn’t exist in this single-page app.
        </p>
        <Link
          to="/"
          className="button-primary mt-8 inline-flex"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
