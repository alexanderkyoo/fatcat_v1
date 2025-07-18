import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cn } from "@/utils";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Chili's FatCat",
  description: "FatCat Chili's Voice Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          "flex flex-col min-h-screen"
        )}
      >
          {children}
          <Toaster position="top-center" richColors={true} />
      </body>
    </html>
  );
}
