import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, fetchStores } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageCard, ProductForm, type ProductFormData, LoadingState, ErrorState } from '../components';

const initialData: ProductFormData = {
  name: '',
  category: '',
  price: 0,
  quantity: 0,
  storeId: '',
};

export function AddProductPage() {
  useDocumentTitle('Add Product');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProductFormData>(initialData);

  const { data: stores, isLoading: storesLoading, isError: storesError } = useQuery({
    queryKey: ['stores'],
    queryFn: fetchStores,
  });

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      createProduct({
        storeId: data.storeId!,
        name: data.name,
        category: data.category,
        price: data.price,
        quantity: data.quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setLocation('/');
    },
  });

  if (storesLoading) return <LoadingState message="Loading stores..." />;
  if (storesError) return <ErrorState message="Failed to load stores." />;

  return (
    <PageCard className="max-w-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">Add Product</h2>
        <Link href="/" className="text-blue-600 hover:text-blue-900 text-sm">
          Back to Products
        </Link>
      </div>
      <ProductForm
        data={formData}
        onChange={setFormData}
        onSubmit={() => formData.storeId && mutation.mutate(formData)}
        isSubmitting={mutation.isPending}
        submitLabel="Create Product"
        showStoreSelect
        storeOptions={stores ?? []}
      />
      {mutation.isError && (
        <p className="mt-4 text-sm text-red-500">{mutation.error?.message}</p>
      )}
    </PageCard>
  );
}
