import * as React from "react";
import { Button as UIButton, type ButtonProps as UIButtonProps } from "./ui/button";

type LegacyVariant = "primary" | "secondary" | "danger";
const variantMap: Record<LegacyVariant, UIButtonProps["variant"]> = {
  primary: "default",
  secondary: "outline",
  danger: "destructive",
};

export interface ButtonProps extends Omit<UIButtonProps, "variant"> {
  variant?: LegacyVariant | UIButtonProps["variant"];
}

export function Button({ variant, ...props }: ButtonProps) {
  const mappedVariant =
    variant && variant in variantMap
      ? variantMap[variant as LegacyVariant]
      : (variant as UIButtonProps["variant"]);
  return <UIButton variant={mappedVariant} {...props} />;
}
