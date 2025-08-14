"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      {children}
    </NextThemesProvider>
  );
}
