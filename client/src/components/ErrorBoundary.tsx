import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Begenarxiv ErrorBoundary caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-black p-8 font-mono max-w-3xl mx-auto flex flex-col justify-center">
          <div className="border border-red-300 bg-red-50 p-6 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm uppercase tracking-wider">
              <span>⚠ Application Rendering Error</span>
            </div>
            <p className="text-xs text-red-900 font-semibold">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            {this.state.error?.stack && (
              <pre className="text-[11px] bg-white border border-red-200 p-4 rounded-lg overflow-x-auto text-zinc-800 leading-relaxed max-h-60 overflow-y-auto">
                {this.state.error.stack}
              </pre>
            )}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('begenarxiv_admin_token');
                  } catch {}
                  window.location.reload();
                }}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded cursor-pointer hover:bg-zinc-800 transition-colors"
              >
                Reset Session &amp; Reload
              </button>
              <a
                href="/catalogue"
                className="px-4 py-2 border border-zinc-300 text-zinc-700 text-xs font-bold rounded cursor-pointer hover:border-black transition-colors"
              >
                Return to Catalogue
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

