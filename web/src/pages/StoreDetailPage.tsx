import { useState, useEffect } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStoreById, fetchStoreInventoryValue, deleteStore } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCurrency, formatNumber } from '../lib/utils';
import {
  PageCard,
  LoadingState,
  ErrorState,
  DeleteConfirmDialog,
} from '../components';
import { Button } from '../components/ui/button';

export function StoreDetailPage() {
  const [, params] = useRoute('/stores/:id');
  const id = params?.id;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showSavedMessage, setShowSavedMessage] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('saved') === '1'
  );

  useEffect(() => {
    if (!showSavedMessage) return;
    const t = setTimeout(() => setShowSavedMessage(false), 4000);
    return () => clearTimeout(t);
  }, [showSavedMessage]);

  const { data: store, isLoading, isError } = useQuery({
    queryKey: ['store', id],
    queryFn: () => fetchStoreById(id!),
    enabled: !!id,
  });

  const { data: inventory } = useQuery({
    queryKey: ['store-inventory', id],
    queryFn: () => fetchStoreInventoryValue(id!),
    enabled: !!id && !!store,
  });

  useDocumentTitle(store ? store.name : 'Store');

  const deleteMutation = useMutation({
    mutationFn: () => deleteStore(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setLocation('/stores');
    },
  });

  if (isLoading) return <LoadingState message="Loading store…" />;
  if (isError || !store) return <ErrorState message="Failed to load store." />;

  return (
    <PageCard
      title={store.name}
      action={
        <div className="flex gap-2">
          <Link href={`/stores/${id}/edit`}>
            <Button size="sm" className="transition-colors">
              Edit
            </Button>
          </Link>
          <DeleteConfirmDialog
            triggerLabel="Delete"
            title="Delete store?"
            description="This will permanently remove this store and cannot be undone."
            onConfirm={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          />
        </div>
      }
    >
      <div className="space-y-4">
        {showSavedMessage && (
          <div
            className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary transition-opacity"
            role="status"
          >
            Store updated successfully.
          </div>
        )}
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="font-medium text-muted-foreground">Location</dt>
            <dd className="text-foreground">{store.location}</dd>
          </div>
          {inventory != null && (
            <div>
              <dt className="font-medium text-muted-foreground">Inventory value</dt>
              <dd className="text-foreground">
                {formatNumber(inventory.totalItems)} items, {formatCurrency(inventory.totalValue)} total value
              </dd>
            </div>
          )}
        </dl>
        <div>
          <Link href={`/stores/${id}/products`}>
            <Button variant="outline" size="sm" className="transition-colors">
              View products in this store
            </Button>
          </Link>
        </div>
      </div>
    </PageCard>
  );
}
