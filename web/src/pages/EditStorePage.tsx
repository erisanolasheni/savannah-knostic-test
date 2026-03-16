import { useState, useEffect } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStoreById, updateStore } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageCard, StoreForm, type StoreFormData, LoadingState, ErrorState } from '../components';

export function EditStorePage() {
  const [, params] = useRoute('/stores/:id/edit');
  const id = params?.id;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: store, isLoading, isError } = useQuery({
    queryKey: ['store', id],
    queryFn: () => fetchStoreById(id!),
    enabled: !!id,
  });

  const [formData, setFormData] = useState<StoreFormData>({ name: '', location: '' });

  useEffect(() => {
    if (store) {
      setFormData({ name: store.name, location: store.location });
    }
  }, [store]);

  useDocumentTitle(store ? `Edit: ${store.name}` : 'Edit Store');

  const mutation = useMutation({
    mutationFn: (data: StoreFormData) => updateStore(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['store', id] });
      setLocation(`/stores/${id}`);
    },
  });

  if (isLoading) return <LoadingState message="Loading store..." />;
  if (isError || !store) return <ErrorState message="Failed to load store." />;

  return (
    <PageCard className="max-w-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">Edit Store: {store.name}</h2>
        <Link href={`/stores/${id}`} className="text-blue-600 hover:text-blue-900 text-sm">
          Back to Store
        </Link>
      </div>
      <StoreForm
        data={formData}
        onChange={setFormData}
        onSubmit={() => mutation.mutate(formData)}
        isSubmitting={mutation.isPending}
        submitLabel="Save Changes"
      />
      {mutation.isError && (
        <p className="mt-4 text-sm text-red-500">{mutation.error?.message}</p>
      )}
    </PageCard>
  );
}
