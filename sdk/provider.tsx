// sdk/provider.tsx
"use client";
import React, { createContext, useContext } from "react";
import { YieldConfig } from "./types";

const YieldContext = createContext<YieldConfig | null>(null);

export const YieldProvider = ({
  config,
  children,
}: {
  config: YieldConfig;
  children: React.ReactNode;
}) => {
  return (
    <YieldContext.Provider value={config}>
      {children}
    </YieldContext.Provider>
  );
};

export const useYield = () => {
  const ctx = useContext(YieldContext);
  if (!ctx) {
    throw new Error("YieldProvider missing");
  }
  return ctx;
};