import { useQuery } from "@tanstack/react-query";
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
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatCurrency, formatNumber } from "../lib/utils";

const chartConfig = {
  value: {
    label: "Inventory value",
    color: "hsl(var(--chart-1))",
  },
};

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
      (s: { storeId: string; storeName: string; totalValue: number }) => ({
        name: s.storeName,
        value: Number(s.totalValue),
      })
    ) ?? [];

  return (
    <PageCard title="Inventory overview">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Stores", value: formatNumber(data.totalStores) },
            { label: "Products", value: formatNumber(data.totalProducts) },
            { label: "Total stock (units)", value: formatNumber(data.totalItems) },
            {
              label: "Total inventory value",
              value: formatCurrency(Number(data.totalValue)),
            },
          ].map(({ label, value }) => (
            <Card key={label} className="transition-shadow hover:shadow-md">
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
          ))}
        </div>

        {chartData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-foreground">
                Inventory value by store
              </h3>
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
                    <div key={s.storeId} className="space-y-1.5">
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
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-muted-foreground">Store</TableHead>
                    <TableHead className="text-right text-muted-foreground">
                      Summary
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
                          {s.storeName}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {s.productCount === 0 ? (
                            <span className="italic">No products</span>
                          ) : (
                            <>
                              {s.productCount} products,{" "}
                              {formatNumber(s.totalItems)} items,{" "}
                              {formatCurrency(Number(s.totalValue))}
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-medium text-foreground">
                By category
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground">
                      Summary
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
                          {c.category}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatNumber(c.totalItems)} items,{" "}
                          {formatCurrency(Number(c.totalValue))}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageCard>
  );
}
