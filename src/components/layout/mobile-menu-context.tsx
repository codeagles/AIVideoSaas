"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface MobileMenuContextType {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(
  undefined
);

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <MobileMenuContext.Provider
      value={{ mobileMenuOpen, setMobileMenuOpen, toggleMobileMenu }}
    >
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  const context = useContext(MobileMenuContext);
  if (context === undefined) {
    throw new Error("useMobileMenu must be used within a MobileMenuProvider");
  }
  return context;
}
