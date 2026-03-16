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

export function StoresPage() {
  useDocumentTitle('Stores');
  const { data: stores, isLoading, isError } = useQuery({
    queryKey: ['stores'],
    queryFn: fetchStores,
  });

  if (isLoading) return <LoadingState message="Loading stores..." />;
  if (isError) return <ErrorState message="Failed to load stores." />;

  const columns = [
    {
      key: 'name',
      header: 'Store',
      render: (s: { id: string; name: string }) => (
        <span className="font-medium text-gray-900">{s.name}</span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (s: { location: string }) => s.location,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (s: { id: string }) => (
        <span className="flex justify-end gap-2">
          <Link href={`/stores/${s.id}`} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
            View
          </Link>
          <Link href={`/stores/${s.id}/edit`} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
            Edit
          </Link>
        </span>
      ),
    },
  ];

  return (
    <PageCard>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-medium text-gray-900">Stores</h2>
        <Link
          href="/stores/new"
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Store
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={stores ?? []}
        keyFn={(s: { id: string }) => s.id}
        emptyMessage="No stores yet. Add one to get started."
      />
    </PageCard>
  );
}
