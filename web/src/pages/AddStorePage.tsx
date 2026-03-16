import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStore } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageCard, StoreForm, type StoreFormData } from '../components';
import { Link } from 'wouter';

export function AddStorePage() {
  useDocumentTitle('Add Store');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<StoreFormData>({ name: '', location: '' });

  const mutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setLocation('/stores');
    },
  });

  return (
    <PageCard className="max-w-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">Add Store</h2>
        <Link href="/stores" className="text-blue-600 hover:text-blue-900 text-sm">
          Back to Stores
        </Link>
      </div>
      <StoreForm
        data={formData}
        onChange={setFormData}
        onSubmit={() => mutation.mutate(formData)}
        isSubmitting={mutation.isPending}
        submitLabel="Create Store"
      />
      {mutation.isError && (
        <p className="mt-4 text-sm text-red-500">{mutation.error?.message}</p>
      )}
    </PageCard>
  );
}
