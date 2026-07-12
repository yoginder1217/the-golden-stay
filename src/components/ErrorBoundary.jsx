import React from 'react';

const Fallback = ({ error, onReset }) => (
  <div className="min-h-[60vh] flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 bg-golden/10 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-golden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-charcoal mb-2 font-serif">Something went wrong</h2>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        We hit an unexpected error on this page. Your bookings and account are safe.
      </p>
      {import.meta.env.DEV && error && (
        <pre className="text-left text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-4 mb-6 overflow-auto max-h-36">
          {error.message}
        </pre>
      )}
      <div className="flex gap-3 justify-center">
        <button
          onClick={onReset}
          className="px-5 py-2.5 bg-golden hover:bg-golden-dark text-white font-bold text-sm rounded-xl transition"
        >
          Try Again
        </button>
        <a
          href="/"
          className="px-5 py-2.5 border border-gray-200 hover:border-golden text-gray-600 hover:text-golden font-bold text-sm rounded-xl transition"
        >
          Go Home
        </a>
      </div>
    </div>
  </div>
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
        ? this.props.fallback(this.state.error, this.reset)
        : <Fallback error={this.state.error} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
