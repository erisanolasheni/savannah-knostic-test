import { useQuery } from '@tanstack/react-query';
import { fetchStores } from '../api';
import { Link } from 'wouter';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  PageCard,
  DataTable,
  LoadingState,
  ErrorState,
} from '../components';
import { Button } from '../components/ui/button';
import { formatNumber } from '../lib/utils';

export function StoresPage() {
  useDocumentTitle('Stores');
  const { data: stores, isLoading, isError } = useQuery({
    queryKey: ['stores'],
    queryFn: fetchStores,
  });

  if (isLoading) return <LoadingState message="Loading stores…" />;
  if (isError) return <ErrorState message="Failed to load stores." />;

  const columns = [
    {
      key: 'name',
      header: 'Store',
      render: (s: { id: string; name: string }) => (
        <span className="font-medium text-foreground">{s.name}</span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (s: { location: string }) => (
        <span className="text-muted-foreground">{s.location}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (s: { id: string }) => (
        <span className="flex justify-end gap-2">
          <Link href={`/stores/${s.id}`}>
            <Button variant="ghost" size="sm" className="h-8 transition-colors">
              View
            </Button>
          </Link>
          <Link href={`/stores/${s.id}/edit`}>
            <Button variant="ghost" size="sm" className="h-8 transition-colors">
              Edit
            </Button>
          </Link>
        </span>
      ),
    },
  ];

  return (
    <PageCard
      title="Stores"
      action={
        <Link href="/stores/new">
          <Button size="sm" className="transition-colors">
            Add Store
          </Button>
        </Link>
      }
    >
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={stores ?? []}
          keyFn={(s: { id: string }) => s.id}
          emptyMessage="No stores yet. Add one to get started."
        />
        {(stores?.length ?? 0) > 0 && (
          <div className="flex items-center border-t border-border pt-3 text-sm text-muted-foreground">
            Total: {formatNumber((stores ?? []).length)} stores
          </div>
        )}
      </div>
    </PageCard>
  );
}
