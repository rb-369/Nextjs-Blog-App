"use client";

import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes";
import Header from "../layout/header";
import Footer from "../layout/footer";
import { cn } from "@/lib/utils";

interface ExtendedThemeProvider extends ThemeProviderProps {
  containerClassName?: string;
}

export function ThemeProvider({
  children,
  containerClassName,
  ...props
}: ExtendedThemeProvider) {
  return (
    <NextThemesProvider {...props}>
      <div className="flex min-h-[100dvh] flex-col bg-background text-foreground antialiased selection:bg-primary/15 selection:text-primary">
        <Header />
        <div className={cn("flex-1 flex flex-col", containerClassName)}>
          {children}
        </div>
        <Footer />
      </div>
    </NextThemesProvider>
  );
}
