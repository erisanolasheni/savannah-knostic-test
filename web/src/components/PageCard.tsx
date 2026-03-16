interface PageCardProps {
  children: React.ReactNode;
  className?: string;
}

export function PageCard({ children, className = '' }: PageCardProps) {
  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-md p-6 ${className}`}>
      {children}
    </div>
  );
}
