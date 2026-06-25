import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App render error:', error, info);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            The page failed to load. Try refreshing or clearing browser storage for this site.
          </p>
          <p className="mt-4 max-w-lg truncate font-mono text-xs text-red-600">{error.message}</p>
          <div className="mt-6 flex gap-3">
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              Reload page
            </button>
            <Link to="/" className="btn-outline">
              Patient login
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
