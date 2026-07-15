import type { Metadata } from "next";
import ResumeStudio from "./ResumeStudio";

export const metadata: Metadata = {
  title: "简序 · 在线简历编辑器",
  description: "选择专业模板，实时编辑并导出一份真正好看的中文简历。",
};

export default function Home() {
  return <ResumeStudio />;
}
