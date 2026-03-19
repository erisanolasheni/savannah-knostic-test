import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createStore } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageCard, StoreForm, type StoreFormData } from '../components';
import { Button } from '../components/ui/button';

export function AddStorePage() {
  useDocumentTitle('Add Store');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<StoreFormData>({ name: '', location: '' });

  const mutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast.success('Store created');
      setLocation('/stores');
    },
  });

  return (
    <PageCard
      className="max-w-xl"
      title="Add store"
      action={
        <Link href="/stores">
          <Button variant="outline" size="sm" className="transition-colors">
            Back to Stores
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
          submitLabel="Create store"
        />
        {mutation.isError && (
          <p className="text-sm text-destructive">{mutation.error?.message}</p>
        )}
      </div>
    </PageCard>
  );
}
