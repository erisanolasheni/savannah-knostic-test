import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchStores } from '../api';
import { Link } from 'wouter';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  PageCard,
  DataTable,
  FilterBar,
  Pagination,
  LoadingState,
  ErrorState,
} from '../components';

export function ProductsPage() {
  useDocumentTitle('Products');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [storeId, setStoreId] = useState('');

  const { data: storesData } = useQuery({
    queryKey: ['stores'],
    queryFn: fetchStores,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { page, category, storeId }],
    queryFn: () => fetchProducts({ page, limit: 10, category, storeId }),
  });

  if (isError) {
    return <ErrorState message="Failed to load products." />;
  }

  type ProductRow = {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    store?: { name: string };
  };

  const products = data?.data ?? [];
  const columns: Array<{
    key: string;
    header: string;
    align?: 'left' | 'right';
    render: (p: ProductRow) => ReactNode;
  }> = [
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <span className="font-medium text-gray-900">{p.name}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => p.category,
    },
    {
      key: 'store',
      header: 'Store',
      render: (p) => p.store?.name ?? '—',
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (p) => `$${p.price.toFixed(2)}`,
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      render: (p) => (
        <span className={p.quantity <= 10 ? 'text-red-600 font-medium' : ''}>
          {p.quantity}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <Link href={`/products/${p.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
          Manage
        </Link>
      ),
    },
  ];

  return (
    <PageCard>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-medium text-gray-900">Inventory Management</h2>
          <Link
            href="/products/new"
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Product
          </Link>
        </div>
        <FilterBar
          storeId={storeId}
          category={category}
          stores={storesData ?? []}
          onStoreChange={(id) => {
            setStoreId(id);
            setPage(1);
          }}
          onCategoryChange={(cat) => {
            setCategory(cat);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <LoadingState message="Loading inventory..." />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={products}
            keyFn={(p) => p.id}
            emptyMessage="No products found matching filters."
          />
          {products.length > 0 && (
            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.totalPages ?? 1}
              total={data?.total ?? 0}
              onPrevious={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          )}
        </>
      )}
    </PageCard>
  );
}
