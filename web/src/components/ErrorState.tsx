interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message = 'Something went wrong.' }: ErrorStateProps) {
  return (
    <div className="p-4 text-red-500">
      {message}
    </div>
  );
}
