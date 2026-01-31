"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/components/ui";

interface SlidingNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  padStart?: number;
  decimalPlaces?: number;
  formatFn?: (value: number) => string;
}

function Digit({
  digit,
  className,
}: {
  digit: string;
  className?: string;
}) {
  return (
    <div className={cn("relative h-[1em] w-[0.65em] overflow-hidden", className)}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function SlidingNumber({
  value,
  padStart = 0,
  decimalPlaces = 0,
  formatFn,
  className,
  ...props
}: SlidingNumberProps) {
  const displayValue = React.useMemo(() => {
    if (formatFn) {
      return formatFn(value);
    }
    const fixed = value.toFixed(decimalPlaces);
    if (padStart > 0) {
      const [intPart, decPart] = fixed.split(".");
      const paddedInt = intPart.padStart(padStart, "0");
      return decPart ? `${paddedInt}.${decPart}` : paddedInt;
    }
    return fixed;
  }, [value, padStart, decimalPlaces, formatFn]);

  const digits = displayValue.split("");

  return (
    <span
      className={cn("inline-flex items-center tabular-nums", className)}
      {...props}
    >
      {digits.map((digit, index) => {
        // Non-numeric characters (like commas, periods) don't animate
        if (!/\d/.test(digit)) {
          return (
            <span key={`sep-${index}`} className="w-auto">
              {digit}
            </span>
          );
        }
        return <Digit key={`${index}-${digit}`} digit={digit} />;
      })}
    </span>
  );
}
