import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "SupportApp — SLA Dashboard",
  description: "eSignature support SLA monitoring, incident tracking, and compliance reporting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="app-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
