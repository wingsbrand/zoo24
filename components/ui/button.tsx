import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold no-underline transition-colors duration-150 ease-[var(--ease-out)] " +
  "disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 select-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  accent: "bg-accent text-white hover:bg-accent-dark",
  secondary: "bg-surface text-brand border border-line-strong hover:border-brand hover:bg-brand-tint",
  ghost: "text-brand hover:bg-brand-soft",
  danger: "bg-danger text-white hover:brightness-95",
  link: "text-brand underline underline-offset-4 hover:text-brand-dark px-0",
};

// Cele dotykowe: md/lg ≥ 44 px wysokości; sm (40 px) tylko w gęstych tabelach panelu.
const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3 text-sm rounded-[var(--radius-sm)]",
  md: "min-h-11 px-4 text-[0.95rem] rounded-[var(--radius-md)]",
  lg: "min-h-12 px-6 text-base rounded-[var(--radius-md)]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string) {
  return cn(base, variants[variant], variant === "link" ? "min-h-0" : sizes[size], extra);
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode };

export function Button({ variant = "primary", size = "md", icon, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

type LinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode };

export function ButtonLink({ variant = "primary", size = "md", icon, className, children, ...rest }: LinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
