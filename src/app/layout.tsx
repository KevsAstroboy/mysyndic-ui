import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const ANTI_FLASH_SCRIPT = `(function(){try{var raw=localStorage.getItem("mysyndic-theme");var dark=null;if(raw){var state=JSON.parse(raw).state;if(state&&typeof state.dark==="boolean"){dark=state.dark;}}if(dark===null){dark=window.matchMedia("(prefers-color-scheme: dark)").matches;}document.documentElement.classList.toggle("dark",dark);}catch(err){}})();`;

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MySyndic",
  description: "Gestion de cité résidentielle — Côte d'Ivoire",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0D6E5A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANTI_FLASH_SCRIPT }} />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
