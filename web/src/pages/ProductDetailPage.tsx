import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductById, updateProduct, deleteProduct } from '../api';
import { useRoute, useLocation, Link } from 'wouter';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  PageCard,
  ProductForm,
  type ProductFormData,
  LoadingState,
  ErrorState,
  ConfirmButton,
} from '../components';

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
      setLocation('/');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setLocation('/');
    },
  });

  useDocumentTitle(product ? `Edit: ${product.name}` : 'Product');

  if (isLoading) return <LoadingState message="Loading product details..." />;
  if (isError || !product) return <ErrorState message="Failed to load product." />;

  return (
    <PageCard className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Edit Product: {product.name}</h2>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-blue-600 hover:text-blue-900 text-sm py-2">
            Back to List
          </Link>
          <ConfirmButton
            label="Delete"
            confirmLabel="Click again to delete"
            onConfirm={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          />
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        Store: <span className="font-medium text-gray-900">{product.store?.name}</span>
      </div>

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
        submitLabel="Save Changes"
      />
    </PageCard>
  );
}
