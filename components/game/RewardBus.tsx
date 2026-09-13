"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CompleteTaskResult } from "@/lib/types";

type RewardState = {
  result: CompleteTaskResult | null;
  push: (result: CompleteTaskResult) => void;
  message: string;
};

const RewardContext = createContext<RewardState | null>(null);

export function useRewards() {
  const ctx = useContext(RewardContext);
  if (!ctx) throw new Error("useRewards must be used within RewardProvider");
  return ctx;
}

export function RewardProvider({ children }: { children: React.ReactNode }) {
  const [result, setResult] = useState<CompleteTaskResult | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => setResult(null), 4200);
    return () => window.clearTimeout(timer);
  }, [result]);
  const message = result
    ? `Gained ${result.xp} XP, ${result.gold} gold, ${result.attribute} plus ${result.attribute_pts}${result.leveled_up ? `, level ${result.level}` : ""}`
    : "";

  const value = useMemo(
    () => ({
      result,
      push: setResult,
      message,
    }),
    [result, message]
  );

  return (
    <RewardContext.Provider value={value}>
      {children}
      <div className="sr-only" aria-live="polite">
        {message}
      </div>
      <AnimatePresence>
        {result ? (
          <motion.div
            role="status"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto w-[min(92vw,28rem)]"
          >
            <div className="panel rune-frame px-5 py-4 text-center shadow-rune">
              <p className="font-display text-lg text-ember">Contract sealed</p>
              <p className="mt-1 text-sm text-parchment/80">
                +{result.xp} XP · +{result.gold} gold · {result.attribute} +
                {result.attribute_pts}
              </p>
              {result.leveled_up ? (
                <p className="mt-2 font-display text-glow">
                  Level {result.previous_level} → {result.level}
                </p>
              ) : null}
              {result.granted_items?.length ? (
                <p className="mt-1 text-xs text-moss">
                  Relics: {result.granted_items.map((item) => item.name).join(", ")}
                </p>
              ) : null}
              <button
                type="button"
                className="pointer-events-auto mt-3 text-xs uppercase tracking-[0.2em] text-parchment/60"
                onClick={() => setResult(null)}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </RewardContext.Provider>
  );
}
