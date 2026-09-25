import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AzureX — Private Investment OS",
  description: "Private investment operating system for HNWI cryptocurrency and equities portfolios.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
