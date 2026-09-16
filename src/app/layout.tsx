import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "500", "600"],
});

export const metadata: Metadata = {
  title: "Daily 1-5s",
  description: "A daily standup replacement: today's tasks, blockers, and yesterday's follow-up.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans font-light">
        {children}
      </body>
    </html>
  );
}
