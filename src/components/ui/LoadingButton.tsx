import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export function LoadingButton({
  loading = false,
  loadingLabel = "Please wait...",
  children,
  variant = "primary",
  className,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className={clsx("btn", variant === "primary" ? "btn-primary" : "btn-ghost", className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
