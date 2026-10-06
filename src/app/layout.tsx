import type { Metadata } from "next";
import { Space_Grotesk, Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const spaceGrotesk = Space_Grotesk({
    variable: "--font-heading",
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

const figtree = Figtree({
    variable: "--font-figtree",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
    variable: "--font-jetbrains",
    subsets: ["latin"],
    weight: ["400", "500"],
});

export const metadata: Metadata = {
    title: "Synta - AI Code Auditor",
    description:
        "An AI Senior Developer That Understands Your Codebase - Health Reports, Issues, And Chat Grounded In Your Real Code.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            suppressHydrationWarning
            lang="en"
            className={`${spaceGrotesk.variable} ${figtree.variable} ${jetbrains.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
