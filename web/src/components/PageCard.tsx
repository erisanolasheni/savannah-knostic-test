import { Card, CardContent, CardHeader } from "./ui/card";
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
  return (
    <Card className={cn(className)}>
      {(title || action) && (
        <>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 px-8 pt-5 pb-10">
            {title && (
              <h2 className="text-xl font-semibold leading-tight tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {action && <div className="shrink-0">{action}</div>}
          </CardHeader>
          <Separator />
        </>
      )}
      <CardContent className={cn("p-8", (title || action) && "pt-10")}>
        {children}
      </CardContent>
    </Card>
  );
}
