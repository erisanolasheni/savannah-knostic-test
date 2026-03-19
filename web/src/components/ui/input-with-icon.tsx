import * as React from "react";
import { Input } from "./input";
import { cn } from "../../lib/utils";

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  iconClassName?: string;
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, icon, iconClassName, ...props }, ref) => (
    <div className="relative w-full">
      <span
        className={cn(
          "pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground",
          iconClassName
        )}
        aria-hidden
      >
        {icon}
      </span>
      <Input
        ref={ref}
        className={cn("h-9 pl-9", className)}
        {...props}
      />
    </div>
  )
);
InputWithIcon.displayName = "InputWithIcon";

export { InputWithIcon };
