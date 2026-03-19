import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { fetchDashboard } from "../api";
import { PageCard, LoadingState, ErrorState } from "../components";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart";
import { Progress } from "../components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { cn, formatCurrency, formatNumber } from "../lib/utils";

const chartConfig = {
  value: {
    label: "Inventory value",
    color: "hsl(var(--chart-1))",
  },
};

const linkCardClass =
  "block rounded-lg outline-none ring-offset-background transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function DashboardPage() {
  useDocumentTitle("Dashboard");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  if (isLoading) return <LoadingState message="Loading dashboard…" />;
  if (isError || !data) return <ErrorState message="Failed to load dashboard." />;

  const maxValue =
    data.byStore?.length &&
    Math.max(
      ...data.byStore.map((s: { totalValue: number }) => Number(s.totalValue)),
      1
    );
  const chartData =
    data.byStore?.map(
      (s: { storeName: string; totalValue: number }) => ({
        name: s.storeName,
        value: Number(s.totalValue),
      })
    ) ?? [];

  const storeTotals = (data.byStore ?? []).reduce(
    (
      acc: { products: number; items: number; value: number },
      s: {
        productCount: number;
        totalItems: number;
        totalValue: number;
      }
    ) => ({
      products: acc.products + s.productCount,
      items: acc.items + s.totalItems,
      value: acc.value + Number(s.totalValue),
    }),
    { products: 0, items: 0, value: 0 }
  );

  const categoryTotals = (data.byCategory ?? []).reduce(
    (
      acc: { items: number; value: number },
      c: { totalItems: number; totalValue: number }
    ) => ({
      items: acc.items + c.totalItems,
      value: acc.value + Number(c.totalValue),
    }),
    { items: 0, value: 0 }
  );

  const statCards: { label: string; value: string; href: string }[] = [
    { label: "Stores", value: formatNumber(data.totalStores), href: "/stores" },
    { label: "Products", value: formatNumber(data.totalProducts), href: "/" },
    {
      label: "Total stock (units)",
      value: formatNumber(data.totalItems),
      href: "/",
    },
    {
      label: "Total inventory value",
      value: formatCurrency(Number(data.totalValue)),
      href: "/",
    },
  ];

  return (
    <PageCard title="Inventory overview">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, href }) => (
            <Link key={label} href={href} className={linkCardClass}>
              <Card className="h-full border-border transition-colors hover:border-primary/30">
                <CardHeader className="pb-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold tracking-tight text-foreground">
                    {value}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {chartData.length > 0 && (
          <Link href="/" className={cn(linkCardClass, "block")}>
            <Card className="border-border transition-colors hover:border-primary/30">
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium text-foreground">
                  Inventory value by store
                </h3>
                <p className="text-xs text-muted-foreground">
                  Click to open product inventory
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[240px] w-full">
                  <BarChart data={chartData} margin={{ left: 0, right: 8 }}>
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      }
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--chart-1))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </Link>
        )}

        {data.byStore?.length > 0 && maxValue && (
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-foreground">
                Value by store (progress)
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.byStore.map(
                  (s: {
                    storeId: string;
                    storeName: string;
                    totalValue: number;
                  }) => (
                    <Link
                      key={s.storeId}
                      href={`/stores/${s.storeId}/products`}
                      className={cn(
                        linkCardClass,
                        "block rounded-md border border-transparent p-2 -m-2 hover:border-border hover:bg-muted/40"
                      )}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span
                            className="truncate font-medium text-foreground"
                            title={s.storeName}
                          >
                            {s.storeName}
                          </span>
                          <span className="shrink-0 text-muted-foreground">
                            {formatCurrency(Number(s.totalValue))}
                          </span>
                        </div>
                        <Progress
                          value={(Number(s.totalValue) / maxValue) * 100}
                          className="h-2"
                        />
                      </div>
                    </Link>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-foreground">By store</h3>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-muted-foreground">Store</TableHead>
                    <TableHead className="text-right text-muted-foreground">
                      Products
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground">
                      Items
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground">
                      Value
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byStore?.map(
                    (s: {
                      storeId: string;
                      storeName: string;
                      productCount: number;
                      totalItems: number;
                      totalValue: number;
                    }) => (
                      <TableRow key={s.storeId}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/stores/${s.storeId}/products`}
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {s.storeName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {s.productCount === 0 ? (
                            <span className="italic">0</span>
                          ) : (
                            formatNumber(s.productCount)
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatNumber(s.totalItems)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatCurrency(Number(s.totalValue))}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
                {(data.byStore?.length ?? 0) > 0 && (
                  <TableFooter>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="font-semibold text-foreground">
                        Totals
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatNumber(storeTotals.products)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatNumber(storeTotals.items)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCurrency(storeTotals.value)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-foreground">By category</h3>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-right text-muted-foreground">
                      Items
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground">
                      Value
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byCategory?.map(
                    (c: {
                      category: string;
                      totalItems: number;
                      totalValue: number;
                    }) => (
                      <TableRow key={c.category}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/?category=${encodeURIComponent(c.category)}`}
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {c.category}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatNumber(c.totalItems)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatCurrency(Number(c.totalValue))}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
                {(data.byCategory?.length ?? 0) > 0 && (
                  <TableFooter>
                    <TableRow className="hover:bg-transparent">
                      <TableCell className="font-semibold text-foreground">
                        Totals
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatNumber(categoryTotals.items)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCurrency(categoryTotals.value)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageCard>
  );
}
