"use client";

import * as React from "react";
import confetti, {
  type GlobalOptions,
  type CreateTypes,
  type Options,
} from "canvas-confetti";

import { cn } from "@/components/ui";

// Type for the confetti function
type ConfettiInstance = CreateTypes | null;

interface ConfettiProps extends React.ComponentPropsWithoutRef<"canvas"> {
  options?: Options;
  globalOptions?: GlobalOptions;
  manualStart?: boolean;
  onInit?: (params: { confetti: CreateTypes }) => void;
}

interface ConfettiRef {
  fire: (options?: Options) => void;
}

const Confetti = React.forwardRef<ConfettiRef, ConfettiProps>(
  (
    { options, globalOptions = { resize: true, useWorker: true }, manualStart = false, className, onInit, ...props },
    ref,
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const confettiRef = React.useRef<ConfettiInstance>(null);

    const fire = React.useCallback(
      (opts?: Options) => {
        confettiRef.current?.(opts || options);
      },
      [options],
    );

    React.useImperativeHandle(ref, () => ({
      fire,
    }));

    React.useEffect(() => {
      if (!canvasRef.current) return;

      confettiRef.current = confetti.create(canvasRef.current, globalOptions);

      onInit?.({ confetti: confettiRef.current });

      return () => {
        confettiRef.current?.reset();
      };
    }, [globalOptions, onInit]);

    React.useEffect(() => {
      if (!manualStart) {
        fire();
      }
    }, [manualStart, fire]);

    return (
      <canvas
        ref={canvasRef}
        className={cn("pointer-events-none fixed inset-0 z-50 h-full w-full", className)}
        {...props}
      />
    );
  },
);

Confetti.displayName = "Confetti";

// Preset confetti functions
const fireConfetti = (opts?: Options) => {
  const count = 200;
  const defaults: Options = {
    origin: { y: 0.7 },
    ...opts,
  };

  function fire(particleRatio: number, opts: Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

const fireSideConfetti = () => {
  const end = Date.now() + 3 * 1000;
  const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors,
    });

    requestAnimationFrame(frame);
  };

  frame();
};

const fireStarsConfetti = () => {
  const defaults: Options = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ["star"],
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ["circle"],
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
};

export {
  Confetti,
  fireConfetti,
  fireSideConfetti,
  fireStarsConfetti,
  type ConfettiRef,
  type ConfettiProps,
};
