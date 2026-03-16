import { useRoute, useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStoreById, deleteStore } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  PageCard,
  LoadingState,
  ErrorState,
  ConfirmButton,
} from '../components';

export function StoreDetailPage() {
  const [, params] = useRoute('/stores/:id');
  const id = params?.id;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: store, isLoading, isError } = useQuery({
    queryKey: ['store', id],
    queryFn: () => fetchStoreById(id!),
    enabled: !!id,
  });

  useDocumentTitle(store ? store.name : 'Store');

  const deleteMutation = useMutation({
    mutationFn: () => deleteStore(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setLocation('/stores');
    },
  });

  if (isLoading) return <LoadingState message="Loading store..." />;
  if (isError || !store) return <ErrorState message="Failed to load store." />;

  return (
    <PageCard>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">{store.name}</h2>
        <div className="flex gap-2">
          <Link
            href={`/stores/${id}/edit`}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Edit
          </Link>
          <ConfirmButton
            label="Delete"
            confirmLabel="Click again to delete"
            onConfirm={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          />
        </div>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p><span className="font-medium text-gray-700">Location:</span> {store.location}</p>
      </div>
      <div className="mt-6">
        <Link href={`/stores/${id}/products`} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
          View products in this store
        </Link>
      </div>
    </PageCard>
  );
}
