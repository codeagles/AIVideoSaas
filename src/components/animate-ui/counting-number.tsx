"use client";

import * as React from "react";
import {
  motion,
  useSpring,
  useTransform,
  useInView,
  type SpringOptions,
} from "framer-motion";

import { cn } from "@/components/ui";

interface CountingNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  decimalPlaces?: number;
  formatFn?: (value: number) => string;
  springOptions?: SpringOptions;
  startOnView?: boolean;
}

export function CountingNumber({
  value,
  direction = "up",
  delay = 0,
  duration = 2,
  decimalPlaces = 0,
  formatFn,
  springOptions,
  startOnView = true,
  className,
  ...props
}: CountingNumberProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hasStarted, setHasStarted] = React.useState(!startOnView);

  React.useEffect(() => {
    if (startOnView && isInView) {
      const timer = setTimeout(() => setHasStarted(true), delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay, startOnView]);

  const motionValue = useSpring(direction === "up" ? 0 : value, {
    damping: 60,
    stiffness: 100,
    duration: duration,
    ...springOptions,
  });

  const displayValue = useTransform(motionValue, (current) => {
    const rounded = Number(current.toFixed(decimalPlaces));
    if (formatFn) {
      return formatFn(rounded);
    }
    return Intl.NumberFormat("en-US").format(rounded);
  });

  React.useEffect(() => {
    if (hasStarted) {
      motionValue.set(direction === "up" ? value : 0);
    }
  }, [hasStarted, motionValue, value, direction]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)} {...props}>
      <motion.span>{displayValue}</motion.span>
    </span>
  );
}
