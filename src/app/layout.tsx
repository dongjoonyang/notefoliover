import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body 
        className="antialiased bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300"
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}