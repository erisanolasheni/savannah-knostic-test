import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductById, updateProduct } from '../api';
import { useRoute, useLocation, Link } from 'wouter';

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

  const productData = product || {
    price: 0,
    quantity: 0,
    category: '',
  };

  const [formData, setFormData] = useState<Partial<typeof productData> | null>(null);

  const currentData = formData || productData;

  const mutation = useMutation({
    mutationFn: (data: Partial<typeof formData>) => updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setLocation('/');
    },
  });

  if (isLoading) return <div className="p-4 text-gray-500">Loading product details...</div>;
  if (isError || !product) return <div className="p-4 text-red-500">Failed to load product.</div>;

  return (
    <div className="bg-white shadow sm:rounded-md p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Edit Product: {product.name}</h2>
        <Link href="/" className="text-blue-600 hover:text-blue-900 text-sm">
          Back to List
        </Link>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        Store: <span className="font-medium text-gray-900">{product.store?.name}</span>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (formData) mutation.mutate(formData);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={currentData.category}
            onChange={(e) => setFormData({ ...currentData, category: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={currentData.price}
            onChange={(e) => setFormData({ ...currentData, price: parseFloat(e.target.value) })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <input
            type="number"
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={currentData.quantity}
            onChange={(e) => setFormData({ ...currentData, quantity: parseInt(e.target.value, 10) })}
            required
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
