import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nature Docs",
  description: "Unified document reader for multiple sources",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
