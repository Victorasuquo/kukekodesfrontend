import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

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

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        logger.error('React Error Boundary caught an error', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: undefined });
        window.location.href = '/';
    };

    handleRetry = (): void => {
        this.setState({ hasError: false, error: undefined });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="text-center space-y-6 max-w-md mx-auto">
                        <div className="relative">
                            <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
                            <AlertTriangle className="relative w-16 h-16 text-destructive mx-auto" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
                            <p className="text-muted-foreground">
                                We're sorry, but something unexpected happened. Please try again.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="bg-muted/50 rounded-lg p-4 text-left">
                                <p className="text-sm font-mono text-muted-foreground break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={this.handleReset}>
                                Go Home
                            </Button>
                            <Button onClick={this.handleRetry}>
                                <RefreshCw className="w-4 h-4 mr-2" />
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

export default ErrorBoundary;
