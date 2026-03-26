"use client";

import {ThemeProvider as NextThemesProvider, ThemeProviderProps} from "next-themes"
import Header from "../layout/header";
import { cn } from "@/lib/utils";

interface ExtendedThemeProvider extends ThemeProviderProps{
    containerClassName ?: string;
}

export function ThemeProvider({
    children, 
    containerClassName,
    ...props
}: ExtendedThemeProvider) {
 
  return (
    <div>

        <NextThemesProvider {...props}>
            <Header/>
            <main className={cn("container mx-auto px-4 ", containerClassName)}>
                {children}
            </main>

            {/* footer content */}

        </NextThemesProvider>
      
    </div>
  )
}

