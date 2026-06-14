import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="text-5xl">😢</div>
          <h2 className="text-lg font-semibold text-gray-800">문제가 발생했어요</h2>
          <p className="max-w-xs text-sm text-gray-500">
            화면을 다시 불러오면 대부분 해결됩니다. 저장된 구절은 그대로 보관되어 있어요.
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            다시 불러오기
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
