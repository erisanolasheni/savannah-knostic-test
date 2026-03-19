import { useState, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchStores, fetchCategories, type ProductSortBy, type SortOrder } from '../api';
import { Link, useLocation } from 'wouter';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  PageCard,
  DataTable,
  FilterBar,
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
import { Separator } from '../components/ui/separator';
import { Search, SquarePen } from 'lucide-react';
import { formatCurrency, formatNumber } from '../lib/utils';

function getParamsFromSearch(): {
  page: number;
  category: string;
  storeId: string;
  q: string;
  sortBy: ProductSortBy;
  sortOrder: SortOrder;
} {
  const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  return {
    page: Math.max(1, parseInt(p.get('page') || '1', 10)),
    category: p.get('category') || '',
    storeId: p.get('storeId') || '',
    q: p.get('q') || '',
    sortBy: (p.get('sortBy') as ProductSortBy) || 'name',
    sortOrder: (p.get('sortOrder') as SortOrder) || 'asc',
  };
}

function buildSearchString(params: ReturnType<typeof getParamsFromSearch>): string {
  const p = new URLSearchParams();
  if (params.page > 1) p.set('page', String(params.page));
  if (params.category) p.set('category', params.category);
  if (params.storeId) p.set('storeId', params.storeId);
  if (params.q) p.set('q', params.q);
  if (params.sortBy !== 'name') p.set('sortBy', params.sortBy);
  if (params.sortOrder !== 'asc') p.set('sortOrder', params.sortOrder);
  const s = p.toString();
  return s ? `?${s}` : '';
}

const SORT_OPTIONS: { value: ProductSortBy; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'category', label: 'Category' },
  { value: 'price', label: 'Price' },
  { value: 'quantity', label: 'Quantity' },
];

export function ProductsPage() {
  useDocumentTitle('Products');
  const [, setLocation] = useLocation();
  const [params, setParams] = useState(getParamsFromSearch);
  const { page, category, storeId, q, sortBy, sortOrder } = params;

  const debouncedQ = useDebouncedValue(q, 300);

  const updateParams = (updates: Partial<ReturnType<typeof getParamsFromSearch>>) => {
    setParams((prev) => {
      const next = { ...prev, ...updates };
      if (updates.category !== undefined || updates.storeId !== undefined || updates.q !== undefined || updates.sortBy !== undefined || updates.sortOrder !== undefined) {
        next.page = 1;
      }
      return next;
    });
  };

  useEffect(() => {
    const search = buildSearchString(params);
    const current = typeof window !== 'undefined' ? window.location.search : '';
    if (search !== current) {
      setLocation(search ? `/${search}` : '/', { replace: true });
    }
  }, [params, setLocation]);

  const { data: storesData } = useQuery({
    queryKey: ['stores'],
    queryFn: fetchStores,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { page, category, storeId, q: debouncedQ, sortBy, sortOrder }],
    queryFn: () =>
      fetchProducts({
        page,
        limit: 10,
        category: category || undefined,
        storeId: storeId || undefined,
        q: debouncedQ || undefined,
        sortBy,
        sortOrder,
      }),
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
  const pageTotalQty = products.reduce((sum, p) => sum + p.quantity, 0);
  const pageTotalValue = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
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
        <span className="font-medium text-foreground">{p.name}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => <span className="text-muted-foreground">{p.category}</span>,
    },
    {
      key: 'store',
      header: 'Store',
      render: (p) => p.store?.name ?? '—',
    },
    {
      key: 'unitPrice',
      header: 'Unit price',
      align: 'right',
      render: (p) => (
        <span className="tabular-nums">{formatCurrency(p.price)}</span>
      ),
    },
    {
      key: 'lineValue',
      header: 'Line value',
      align: 'right',
      render: (p) => (
        <span className="tabular-nums font-medium">
          {formatCurrency(p.price * p.quantity)}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      render: (p) => (
        <span className="inline-flex items-center gap-1.5">
          {p.quantity === 0 ? (
            <Badge variant="secondary">Out of stock</Badge>
          ) : (
            <>
              <span className={p.quantity <= 10 ? 'font-medium text-destructive' : ''}>{p.quantity}</span>
              {p.quantity <= 10 && <Badge variant="destructive">Low stock</Badge>}
            </>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Manage product</span>,
      align: 'right',
      render: (p) => (
        <Link href={`/products/${p.id}`}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            aria-label={`Manage ${p.name}`}
          >
            <SquarePen className="h-4 w-4" aria-hidden />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <PageCard
      title="Inventory Management"
      action={
        <Link href="/products/new">
          <Button size="sm" className="transition-colors">
            Add Product
          </Button>
        </Link>
      }
    >
      <div className="space-y-4">
        <section
          className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 sm:px-4"
          aria-label="Filters and search"
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <FilterBar
              storeId={storeId}
              category={category}
              stores={storesData ?? []}
              categoryOptions={categories}
              onStoreChange={(id) => updateParams({ storeId: id })}
              onCategoryChange={(cat) => updateParams({ category: cat })}
            />
            <Separator
              orientation="vertical"
              className="hidden h-8 w-px sm:block"
            />
            <div className="w-52 min-w-[10rem] shrink-0">
              <InputWithIcon
                type="search"
                placeholder="Search by name or category…"
                value={q}
                onChange={(e) => updateParams({ q: e.target.value })}
                className="h-9"
                aria-label="Search products"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={(v) => updateParams({ sortBy: v as ProductSortBy })}
            >
              <SelectTrigger
                className="h-9 w-[7.5rem] shrink-0 sm:w-32"
                aria-label="Sort by"
              >
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
              <SelectTrigger
                className="h-9 w-[7.5rem] shrink-0 sm:w-[7.5rem]"
                aria-label="Sort order"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {isLoading ? (
          <LoadingState message="Loading inventory…" />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={products}
              keyFn={(p) => p.id}
              emptyMessage="No products found matching filters or search."
              footerCells={
                products.length > 0
                  ? [
                      <span key="label" className="text-muted-foreground">
                        Totals <span className="font-normal">(this page)</span>
                      </span>,
                      null,
                      null,
                      <span key="unit-foot" className="text-muted-foreground">
                        —
                      </span>,
                      <span key="line" className="tabular-nums font-semibold">
                        {formatCurrency(pageTotalValue)}
                      </span>,
                      <span key="qty" className="tabular-nums font-semibold">
                        {formatNumber(pageTotalQty)}
                      </span>,
                      null,
                    ]
                  : undefined
              }
            />
            {products.length > 0 && (
              <Pagination
                page={data?.page ?? 1}
                totalPages={data?.totalPages ?? 1}
                total={data?.total ?? 0}
                onPrevious={() => setParams((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                onNext={() => setParams((prev) => ({ ...prev, page: prev.page + 1 }))}
              />
            )}
          </>
        )}
      </div>
    </PageCard>
  );
}
