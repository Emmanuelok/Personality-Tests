import { Component, type ReactNode } from "react";

interface State {
  error: Error | null;
}

/** Catches render errors so a single bad screen never blanks the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Psyche Atlas render error:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container" style={{ padding: "60px 0" }}>
          <div className="panel">
            <h2 style={{ marginTop: 0 }}>Something hiccupped</h2>
            <p style={{ color: "var(--text-dim)" }}>
              A part of the experience ran into an error. Your data is safe on your device — reloading usually fixes it.
            </p>
            <button
              className="btn primary"
              onClick={() => {
                this.setState({ error: null });
                location.reload();
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
