import type { Metadata } from "next";

import { ChatErrorBoundary } from "@/components/chat-error-boundary";
import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Portal MCP Dev",
  description: "Portal para testar MCPs com LLMs publicos e internos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="pt-BR" suppressHydrationWarning>
      <body>
        <AppProviders>
          <ChatErrorBoundary>{children}</ChatErrorBoundary>
        </AppProviders>
      </body>
    </html>
  );
}
