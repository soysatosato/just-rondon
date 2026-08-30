import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

/**
 * 呼び出し側が `p-5` のように全方向の余白を指定したかを見る。既定の余白は
 * CardHeader と CardContent を積む前提で `pt-0` を含み、しかも `sm:` 付きで
 * 指定されている。ここに `p-5` だけを渡すと tailwind-merge は変種の違う
 * `sm:pt-0` を消せず、640px 以上でだけ上の余白が消える。全方向を指定された
 * ときは既定の余白を丸ごと外して、書いたとおりの余白にする。
 */
const padding = (defaults: string, className?: string) =>
  className != null && /(?:^|\s)p-\d/.test(className) ? undefined : defaults;

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      padding("p-4 sm:p-6", className),
      className,
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * 既定では div で描画する。カードのタイトルが同時にページの見出しでもある場合は
 * asChild で h1〜h3 を渡すこと。div のままだと見出し階層に現れず、
 * ページに h1 が1つも無い状態になる。
 */
const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(padding("p-4 pt-0 sm:p-6 sm:pt-0", className), className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center",
      padding("p-4 pt-0 sm:p-6 sm:pt-0", className),
      className,
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
