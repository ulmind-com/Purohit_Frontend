"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  error: Error | null;
}

/**
 * Class-based boundary (React has no hook equivalent) used around each
 * dashboard's data-heavy subtree so a render crash in one widget — a bad map
 * response, a malformed booking payload — doesn't take down the whole page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 p-10 text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <div>
            <p className="font-medium">
              {this.props.fallbackTitle ?? "Something went wrong"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {this.state.error.message || "Please try again."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={this.reset}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
