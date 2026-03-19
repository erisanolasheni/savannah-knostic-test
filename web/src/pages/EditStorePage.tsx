import { useState, useEffect } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchStoreById, updateStore } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageCard, StoreForm, type StoreFormData, LoadingState, ErrorState } from '../components';
import { Button } from '../components/ui/button';

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
      toast.success('Store updated');
      setLocation(`/stores/${id}?saved=1`);
    },
  });

  if (isLoading) return <LoadingState message="Loading store…" />;
  if (isError || !store) return <ErrorState message="Failed to load store." />;

  return (
    <PageCard
      className="max-w-xl"
      title={`Edit: ${store.name}`}
      action={
        <Link href={`/stores/${id}`}>
          <Button variant="outline" size="sm" className="transition-colors">
            Back to Store
          </Button>
        </Link>
      }
    >
      <div className="space-y-4">
        <StoreForm
          data={formData}
          onChange={setFormData}
          onSubmit={() => mutation.mutate(formData)}
          isSubmitting={mutation.isPending}
          submitLabel="Save changes"
        />
        {mutation.isError && (
          <p className="text-sm text-destructive">{mutation.error?.message}</p>
        )}
      </div>
    </PageCard>
  );
}
