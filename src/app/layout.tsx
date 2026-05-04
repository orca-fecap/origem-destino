import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/ui/nav";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SP Urban Data",
  description: "Dados urbanos da cidade de São Paulo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={geist.className}>
        <div className="min-h-screen flex flex-col">
          <Nav />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}