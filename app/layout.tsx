import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "简序 · 在线简历编辑器",
  description: "支持 ATS 检查、结构化章节、本机备份和岗位示例的所见即所得在线简历编辑器。",
  metadataBase: new URL("https://juicyzhou.github.io/ResumeCraft/"),
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "简序 · 专业简历编辑器",
    description: "ATS 检查、结构化章节、本机备份与专业岗位示例。",
    images: [{ url: "og.png", width: 1200, height: 630, alt: "简序专业简历编辑器" }],
  },
  twitter: { card: "summary_large_image", images: ["og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
