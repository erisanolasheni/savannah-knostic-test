import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { cn } from "../lib/utils";

interface Column<T> {
  key: string;
  header: ReactNode;
  align?: "left" | "right";
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyFn: (item: T) => string;
  emptyMessage?: string;
  /** One cell per column; use null for empty cells. Shown as a totals row when provided. */
  footerCells?: ReactNode[];
}

export function DataTable<T>({
  columns,
  data,
  keyFn,
  emptyMessage = "No items found.",
  footerCells,
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
        <TableRow className="bg-muted/50 hover:bg-muted/50">
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
      {footerCells &&
        footerCells.length === columns.length && (
          <TableFooter>
            <TableRow className="hover:bg-transparent">
              {columns.map((col, i) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    "border-b-0 bg-transparent py-3 font-semibold text-foreground",
                    col.align === "right" && "text-right"
                  )}
                >
                  {footerCells[i]}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        )}
    </Table>
  );
}
