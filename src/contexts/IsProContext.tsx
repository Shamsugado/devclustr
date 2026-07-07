"use client";

import { createContext, useContext } from "react";

const IsProContext = createContext<boolean>(false);

export function IsProProvider({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  return <IsProContext.Provider value={value}>{children}</IsProContext.Provider>;
}

export function useIsPro(): boolean {
  return useContext(IsProContext);
}
