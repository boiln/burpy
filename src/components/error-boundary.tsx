"use client";

import React from "react";
import { Component, type PropsWithChildren } from "react";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

interface Props extends PropsWithChildren {
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <Card className="m-4">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertCircle className="h-5 w-5" />
                                <h2 className="text-lg font-semibold">Something went wrong</h2>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {this.state.error?.message || "An unexpected error occurred"}
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => this.setState({ hasError: false, error: undefined })}
                            >
                                Try again
                            </Button>
                        </CardHeader>
                    </Card>
                )
            );
        }

        return this.props.children;
    }
}
