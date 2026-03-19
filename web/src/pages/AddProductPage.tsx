import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createProduct, fetchStores, fetchCategories } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageCard, ProductForm, type ProductFormData, LoadingState, ErrorState } from '../components';
import { Button } from '../components/ui/button';

const initialData: ProductFormData = {
  name: '',
  category: '',
  price: 0,
  quantity: 0,
  storeId: undefined,
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

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Product created');
      setLocation('/');
    },
  });

  if (storesLoading) return <LoadingState message="Loading stores…" />;
  if (storesError) return <ErrorState message="Failed to load stores." />;

  return (
    <PageCard
      className="max-w-xl"
      title="Add product"
      action={
        <Link href="/">
          <Button variant="outline" size="sm" className="transition-colors">
            Back to Products
          </Button>
        </Link>
      }
    >
      <div className="space-y-4">
        <ProductForm
          data={formData}
          onChange={setFormData}
          onSubmit={() => formData.storeId && mutation.mutate(formData)}
          isSubmitting={mutation.isPending}
          submitLabel="Create product"
          showStoreSelect
          storeOptions={stores ?? []}
          categoryOptions={categories}
        />
        {mutation.isError && (
          <p className="text-sm text-destructive">{mutation.error?.message}</p>
        )}
      </div>
    </PageCard>
  );
}
