"use client";

import { cn } from "@workspace/tailwind-config/utils";
import type React from "react";

export interface BeveledContainerProps {
  children: React.ReactNode;
  className?: string;
  withTopFlare?: boolean;
  as?: "div" | "article" | "section" | "nav" | "aside";
  id?: string;
}

export function BeveledContainer({
  children,
  className = "",
  as: Component = "div",
  id,
}: Readonly<BeveledContainerProps>) {
  return (
    <Component
      className={cn(
        "site-chassis relative overflow-hidden rounded-2xl",
        className
      )}
      id={id}
    >
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
