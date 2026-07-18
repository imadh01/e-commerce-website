import { Component } from "react";
import "./ErrorBoundary.css";

// Error Boundaries must be class components — React does not provide
// a hook-based equivalent (no useErrorBoundary hook exists).
// This catches rendering errors anywhere in its children and shows a
// fallback UI instead of letting the whole app crash to a blank screen.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // React calls this automatically when a child component throws
  // during rendering. Returning new state here triggers a re-render
  // with the fallback UI.
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // Called after an error is caught — this is where you'd send the
  // error to a logging service (e.g. Sentry) in a real production app.
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <h1>Something went wrong</h1>
          <p>
            We're sorry — an unexpected error occurred. Please try reloading the
            page.
          </p>
          <button type="button" onClick={this.handleReload}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
