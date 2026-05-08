import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fujitsu AI Assistant",
  description: "Fujitsu AI Assistant powered by IBM watsonx — intelligent enterprise support with source citations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
