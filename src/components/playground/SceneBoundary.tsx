import { Component, type ReactNode } from "react";
export class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void; fallback: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch() {
    this.props.onFailure();
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
