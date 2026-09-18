"use client";

import { motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { pressFamily, pressResident, pressTransition } from "@/lib/motion";

type Variant = "primary" | "secondary" | "quiet";
type Scale = "resident" | "family";

interface ButtonProps extends Omit<ComponentProps<typeof motion.button>, "children"> {
  variant?: Variant;
  scale?: Scale;
  /** Required. An icon-only button is never acceptable in the resident view. */
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-3 font-semibold transition-colors " +
  "disabled:opacity-40 disabled:pointer-events-none select-none";

const scales: Record<Scale, string> = {
  resident: "min-h-[72px] px-8 text-r-body rounded-[16px]",
  family: "min-h-[44px] px-4 text-[0.9375rem] rounded-[12px]",
};

// The resident view is tap-only — hover is not a thing on an iPad on a stand,
// and a hover style that never fires is just dead code.
const variants: Record<Variant, Record<Scale, string>> = {
  primary: {
    resident: "bg-primary text-white",
    family: "bg-primary text-white hover:bg-primary-hover",
  },
  secondary: {
    resident: "bg-tint text-primary",
    family: "bg-tint text-primary hover:bg-[#d4e2d3]",
  },
  quiet: {
    resident: "bg-surface text-primary border border-tint",
    family: "bg-surface text-muted border border-tint hover:bg-bg",
  },
};

export function Button({
  variant = "primary",
  scale = "family",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      // whileTap fires on pointer-down, not on release, and cancels if the
      // finger slides off — which is what makes a press feel connected.
      whileTap={scale === "resident" ? pressResident : pressFamily}
      transition={pressTransition}
      className={`${base} ${scales[scale]} ${variants[variant][scale]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
