import { Card, CardContent, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";

interface PageCardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
}

export function PageCard({
  children,
  className = "",
  title,
  action,
}: PageCardProps) {
  const hasHeader = Boolean(title || action);

  return (
    <Card className={cn(className)}>
      {hasHeader && (
        <>
          <div className="px-6 pt-4 pb-4 sm:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              {title && (
                <CardTitle className="text-xl font-semibold leading-tight tracking-tight">
                  {title}
                </CardTitle>
              )}
              {action && <div className="shrink-0">{action}</div>}
            </div>
          </div>
          <Separator />
        </>
      )}
      <CardContent className={cn("p-6 sm:p-8", hasHeader && "pt-6")}>
        {children}
      </CardContent>
    </Card>
  );
}
