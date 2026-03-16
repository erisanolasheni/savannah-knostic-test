import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  onPrevious,
  onNext,
}: PaginationProps) {
  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-gray-700">
        Showing page <span className="font-medium">{page}</span> of{' '}
        <span className="font-medium">{totalPages}</span> ({total} total items)
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page === 1} onClick={onPrevious}>
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
