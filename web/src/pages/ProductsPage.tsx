import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchStores } from '../api';
import { Link } from 'wouter';

export function ProductsPage() {
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
    return <div className="p-4 text-red-500">Failed to load products.</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-medium text-gray-900">Inventory Management</h2>
        <div className="flex flex-wrap gap-4">
          <select 
            className="border-gray-300 rounded-md shadow-sm p-2 bg-white border text-sm"
            value={storeId}
            onChange={(e) => {
              setStoreId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Stores</option>
            {storesData?.map((store: { id: string; name: string }) => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>

          <select 
            className="border-gray-300 rounded-md shadow-sm p-2 bg-white border text-sm"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
            <option value="Furniture">Furniture</option>
            <option value="Lighting">Lighting</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading inventory...</div>
      ) : data?.data?.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No products found matching filters.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data?.map((product: { id: string; name: string; category: string; price: number; quantity: number; store?: { name: string } }) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.store?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <span className={product.quantity <= 10 ? 'text-red-600 font-medium' : ''}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/products/${product.id}`} className="text-blue-600 hover:text-blue-900">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{data?.page}</span> of <span className="font-medium">{data?.totalPages}</span>
              {' '}({data?.total} total items)
            </p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={page >= (data?.totalPages || 1)}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
