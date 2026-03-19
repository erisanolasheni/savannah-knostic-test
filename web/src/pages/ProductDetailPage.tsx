import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchProductById, updateProduct, deleteProduct, fetchCategories } from '../api';
import { useRoute, useLocation, Link } from 'wouter';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  PageCard,
  ProductForm,
  type ProductFormData,
  LoadingState,
  ErrorState,
  DeleteConfirmDialog,
} from '../components';
import { Button } from '../components/ui/button';

export function ProductDetailPage() {
  const [, params] = useRoute('/products/:id');
  const id = params?.id;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const productData: ProductFormData = product
    ? {
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
      }
    : { name: '', category: '', price: 0, quantity: 0 };

  const [formData, setFormData] = useState<Partial<ProductFormData> | null>(null);
  const currentData = formData ?? productData;

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ProductFormData>) => updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Product saved');
      setLocation('/');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setLocation('/');
    },
  });

  useDocumentTitle(product ? `Edit: ${product.name}` : 'Product');

  if (isLoading) return <LoadingState message="Loading product…" />;
  if (isError || !product) return <ErrorState message="Failed to load product." />;

  return (
    <PageCard
      className="max-w-2xl"
      title={`Edit: ${product.name}`}
      action={
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline" size="sm" className="transition-colors">
              Back to List
            </Button>
          </Link>
          <DeleteConfirmDialog
            triggerLabel="Delete"
            title="Delete product?"
            description="This will permanently remove this product and cannot be undone."
            onConfirm={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          />
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Store: <span className="font-medium text-foreground">{product.store?.name}</span>
        </p>
        <ProductForm
          data={{
            name: currentData.name ?? '',
            category: currentData.category ?? '',
            price: currentData.price ?? 0,
            quantity: currentData.quantity ?? 0,
          }}
          onChange={(next) => setFormData(next)}
          onSubmit={() =>
            updateMutation.mutate({
              name: currentData.name,
              category: currentData.category,
              price: currentData.price,
              quantity: currentData.quantity,
            })
          }
          isSubmitting={updateMutation.isPending}
          submitLabel="Save changes"
          categoryOptions={categories}
        />
      </div>
    </PageCard>
  );
}
