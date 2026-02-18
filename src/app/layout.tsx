import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Mission Control for OpenClaw",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const links = [
    { href: "/", label: "Home" },
    { href: "/tasks", label: "Tasks" },
    { href: "/content", label: "Content" },
    { href: "/calendar", label: "Calendar" },
    { href: "/memory", label: "Memory" },
    { href: "/team", label: "Team" },
    { href: "/office", label: "Office" },
  ];
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b" style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)'}}>
          <div className="app-container py-3 flex items-center gap-4 justify-between">
            <div className="flex items-center gap-6">
              <div className="font-semibold">Mission Control</div>
              <nav className="flex gap-3 text-sm muted">
                {links.map(l => (
                  <Link key={l.href} href={l.href} className="hover:underline">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="app-container py-6 space-y-6">{children}</main>
      </body>
    </html>
  );
}
