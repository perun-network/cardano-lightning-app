import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-6">
            <span className="material-symbols-outlined text-6xl text-error">error</span>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface">
              Something went wrong
            </h1>
            <p className="font-body text-on-surface-variant">
              An unexpected error occurred. Please reload the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-primary-container to-primary text-on-primary px-8 py-4 rounded-2xl font-headline font-extrabold shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
