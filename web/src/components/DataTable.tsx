import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { cn } from "../lib/utils";

interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyFn: (item: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyFn,
  emptyMessage = "No items found.",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={cn(
                "text-muted-foreground font-medium",
                col.align === "right" && "text-right"
              )}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={keyFn(item)} className="transition-colors">
            {columns.map((col) => (
              <TableCell
                key={col.key}
                className={cn(
                  "text-foreground",
                  col.align === "right" && "text-right"
                )}
              >
                {col.render(item)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
