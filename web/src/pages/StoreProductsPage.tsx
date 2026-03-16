import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { fetchStoreById, fetchStoreProducts } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  PageCard,
  DataTable,
  Pagination,
  LoadingState,
  ErrorState,
} from '../components';

export function StoreProductsPage() {
  const [, params] = useRoute('/stores/:id/products');
  const id = params?.id;
  const [page, setPage] = useState(1);

  const { data: store, isLoading: storeLoading, isError: storeError } = useQuery({
    queryKey: ['store', id],
    queryFn: () => fetchStoreById(id!),
    enabled: !!id,
  });

  const { data, isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ['store-products', id, page],
    queryFn: () => fetchStoreProducts(id!, { page, limit: 10 }),
    enabled: !!id,
  });

  const isLoading = storeLoading || productsLoading;
  const isError = storeError || productsError;

  useDocumentTitle(store ? `Products: ${store.name}` : 'Store Products');

  if (isLoading) return <LoadingState message="Loading..." />;
  if (isError || !store) return <ErrorState message="Failed to load store or products." />;

  const products = data?.data ?? [];
  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (p: { id: string; name: string }) => (
        <span className="font-medium text-gray-900">{p.name}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p: { category: string }) => p.category,
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right' as const,
      render: (p: { price: number }) => `$${p.price.toFixed(2)}`,
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right' as const,
      render: (p: { quantity: number }) => p.quantity,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (p: { id: string }) => (
        <Link href={`/products/${p.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
          Manage
        </Link>
      ),
    },
  ];

  const totalPages = data?.total ? Math.ceil(data.total / (data?.limit ?? 10)) : 1;

  return (
    <PageCard>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">Products at {store.name}</h2>
        <Link href={`/stores/${id}`} className="text-blue-600 hover:text-blue-900 text-sm">
          Back to Store
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={products}
        keyFn={(p: { id: string }) => p.id}
        emptyMessage="No products in this store."
      />
      {products.length > 0 && data && (
        <Pagination
          page={data.page}
          totalPages={totalPages}
          total={data.total}
          onPrevious={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      )}
    </PageCard>
  );
}
