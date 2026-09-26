import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { DemoHeader } from "@/components/demo-header";
import { DemoSidebar, MobileNav } from "@/components/demo-nav";
import "./globals.css";

// Numbers are always IBM Plex Mono (tabular). Satoshi (words) loads from Fontshare below.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Social Analytics — Rafael Schwart · Arqentia", template: "%s · Social Analytics" },
  description: "Engagement and post analytics across X, LinkedIn and Instagram for the Personal and Arqentia accounts.",
  robots: { index: false, follow: false },
};

// Theme before first paint (follows the OS until chosen; ?theme=light|dark previews).
const PRE_PAINT = `(function(){try{var d=document.documentElement;var q=new URLSearchParams(location.search).get('theme');var t=q==='light'||q==='dark'?q:localStorage.getItem('smm.theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plexMono.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
        />
      </head>
      <body>
        <div className="flex min-h-dvh">
          <DemoSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <DemoHeader />
            <MobileNav />
            <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">{children}</main>
            <footer className="border-t border-[var(--color-border)] px-4 py-5 text-center text-[11px] text-[var(--color-faint)]">
              Read-only snapshot · data via Zernio · recommendations by platform specialist agents · built by Arqentia
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
