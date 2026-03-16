interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="py-12 text-center text-gray-500">
      {message}
    </div>
  );
}
