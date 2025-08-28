import "./global.css";
import React from "react";
export const metadata = {
  title: "RAG Web Chat",
  description: "RAG over your documents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
