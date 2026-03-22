import React from 'react';
import { logError } from '../utils/logger';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, nonce: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    logError(this.props.context || 'ui', error, info);
  }

  handleRetry = () => {
    this.setState((current) => ({
      hasError: false,
      error: null,
      nonce: current.nonce + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="glass-card" style={{ padding: 'var(--sp-6)', textAlign: 'center', marginTop: 'var(--sp-6)' }}>
          <div className="font-amiri" style={{ fontSize: '1.6rem', color: 'var(--emerald-700)', marginBottom: 'var(--sp-2)' }}>
            Something went wrong.
          </div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 'var(--sp-4)' }}>
            Tap to retry.
          </div>
          <button type="button" className="ritual-primary-btn" onClick={this.handleRetry}>
            Retry
          </button>
        </section>
      );
    }

    return <React.Fragment key={this.state.nonce}>{this.props.children}</React.Fragment>;
  }
}
