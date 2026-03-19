import { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { fetchStoreById, fetchStoreProducts, type ProductSortBy, type SortOrder } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  PageCard,
  DataTable,
  Pagination,
  LoadingState,
  ErrorState,
} from '../components';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { InputWithIcon } from '../components/ui/input-with-icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Search } from 'lucide-react';
import { Separator } from '../components/ui/separator';
import { formatCurrency, formatNumber } from '../lib/utils';

function getStoreProductParamsFromSearch(): {
  page: number;
  q: string;
  sortBy: ProductSortBy;
  sortOrder: SortOrder;
} {
  const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  return {
    page: Math.max(1, parseInt(p.get('page') || '1', 10)),
    q: p.get('q') || '',
    sortBy: (p.get('sortBy') as ProductSortBy) || 'name',
    sortOrder: (p.get('sortOrder') as SortOrder) || 'asc',
  };
}

function buildStoreProductSearchString(params: ReturnType<typeof getStoreProductParamsFromSearch>): string {
  const sp = new URLSearchParams();
  if (params.page > 1) sp.set('page', String(params.page));
  if (params.q) sp.set('q', params.q);
  if (params.sortBy !== 'name') sp.set('sortBy', params.sortBy);
  if (params.sortOrder !== 'asc') sp.set('sortOrder', params.sortOrder);
  const s = sp.toString();
  return s ? `?${s}` : '';
}

const SORT_OPTIONS: { value: ProductSortBy; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'category', label: 'Category' },
  { value: 'price', label: 'Price' },
  { value: 'quantity', label: 'Quantity' },
];

export function StoreProductsPage() {
  const [, routeParams] = useRoute('/stores/:id/products');
  const id = routeParams?.id;
  const [, setLocation] = useLocation();
  const [params, setParams] = useState(getStoreProductParamsFromSearch);
  const { page, q, sortBy, sortOrder } = params;
  const debouncedQ = useDebouncedValue(q, 300);

  const updateParams = (updates: Partial<ReturnType<typeof getStoreProductParamsFromSearch>>) => {
    setParams((prev) => {
      const next = { ...prev, ...updates };
      if (updates.q !== undefined || updates.sortBy !== undefined || updates.sortOrder !== undefined) {
        next.page = 1;
      }
      return next;
    });
  };

  useEffect(() => {
    if (!id) return;
    const search = buildStoreProductSearchString(params);
    const current = typeof window !== 'undefined' ? window.location.search : '';
    if (search !== current) {
      setLocation(`/stores/${id}/products${search}`, { replace: true });
    }
  }, [params, setLocation, id]);

  const { data: store, isLoading: storeLoading, isError: storeError } = useQuery({
    queryKey: ['store', id],
    queryFn: () => fetchStoreById(id!),
    enabled: !!id,
  });

  const { data, isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ['store-products', id, page, debouncedQ, sortBy, sortOrder],
    queryFn: () =>
      fetchStoreProducts(id!, {
        page,
        limit: 10,
        q: debouncedQ || undefined,
        sortBy,
        sortOrder,
      }),
    enabled: !!id,
  });

  const isLoading = storeLoading || productsLoading;
  const isError = storeError || productsError;

  useDocumentTitle(store ? `Products: ${store.name}` : 'Store Products');

  if (isLoading) return <LoadingState message="Loading…" />;
  if (isError || !store) return <ErrorState message="Failed to load store or products." />;

  const products = data?.data ?? [];
  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (p: { id: string; name: string }) => (
        <span className="font-medium text-foreground">{p.name}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p: { category: string }) => (
        <span className="text-muted-foreground">{p.category}</span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right' as const,
      render: (p: { price: number }) => formatCurrency(p.price),
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right' as const,
      render: (p: { quantity: number }) => (
        <span className="inline-flex items-center gap-1.5">
          {p.quantity === 0 ? (
            <Badge variant="secondary">Out of stock</Badge>
          ) : p.quantity <= 10 ? (
            <>
              <span className="font-medium text-destructive">{p.quantity}</span>
              <Badge variant="destructive">Low stock</Badge>
            </>
          ) : (
            <span>{p.quantity}</span>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (p: { id: string }) => (
        <Link href={`/products/${p.id}`}>
          <Button variant="link" className="h-auto p-0 text-primary font-medium">
            Manage
          </Button>
        </Link>
      ),
    },
  ];

  const totalPages = data?.total ? Math.ceil(data.total / (data?.limit ?? 10)) : 1;

  return (
    <PageCard
      title={`Products at ${store.name}`}
      action={
        <Link href={`/stores/${id}`}>
          <Button variant="outline" size="sm" className="transition-colors">
            Back to Store
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/stores">
                <Button variant="link" className="h-auto p-0 text-primary text-sm font-normal">
                  Stores
                </Button>
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/stores/${id}`}>
                <Button variant="link" className="h-auto p-0 text-primary text-sm font-normal">
                  {store.name}
                </Button>
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-foreground">Products</li>
          </ol>
        </nav>

        <div className="rounded-lg border border-border bg-muted/30 px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <InputWithIcon
              type="search"
              placeholder="Search by name or category…"
              value={q}
              onChange={(e) => updateParams({ q: e.target.value })}
              className="w-56"
              aria-label="Search products in store"
              icon={<Search className="h-4 w-4" />}
            />
            <Select
              value={sortBy}
              onValueChange={(v) => updateParams({ sortBy: v as ProductSortBy })}
            >
              <SelectTrigger className="h-9 w-[130px]" aria-label="Sort by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sortOrder}
              onValueChange={(v) => updateParams({ sortOrder: v as SortOrder })}
            >
              <SelectTrigger className="h-9 w-[120px]" aria-label="Sort order">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={products}
          keyFn={(p: { id: string }) => p.id}
          emptyMessage="No products in this store matching search."
        />
        {products.length > 0 && (
          <div className="flex items-center border-t border-border pt-3 text-sm text-muted-foreground">
            <span>
              Total on this page: {formatNumber(products.reduce((sum: number, p: { quantity: number }) => sum + p.quantity, 0))} units
              <span className="ml-2">
                ({formatCurrency(products.reduce((sum: number, p: { price: number; quantity: number }) => sum + p.price * p.quantity, 0))} value)
              </span>
            </span>
          </div>
        )}
        {products.length > 0 && data && (
          <Pagination
            page={data.page}
            totalPages={totalPages}
            total={data.total}
            onPrevious={() => setParams((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            onNext={() => setParams((prev) => ({ ...prev, page: prev.page + 1 }))}
          />
        )}
      </div>
    </PageCard>
  );
}
