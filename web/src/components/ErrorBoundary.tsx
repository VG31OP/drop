import React, { Component, ErrorInfo, ReactNode } from 'react';
import { IoAlertCircleOutline } from 'react-icons/io5';

import styles from './ErrorBoundary.module.scss';
import { Button } from './Button.js';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.fallback}>
          <div className={styles.card}>
            <IoAlertCircleOutline className={styles.icon} />
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>
              An unexpected error occurred while rendering this view. You can reload
              the page or return to the main screen.
            </p>
            <div className={styles.actions}>
              <Button type="button" onClick={this.handleReload}>
                Reload Page
              </Button>
              <Button type="button" onClick={this.handleReset}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
