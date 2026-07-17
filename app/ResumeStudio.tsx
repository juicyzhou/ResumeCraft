"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Template = "classic" | "modern" | "calm" | "neural" | "compiler" | "blueprint" | "markdown" | "sidebar" | "timeline" | "jake" | "research" | "compact" | "bandBlue" | "bandGreen" | "bandWine";
type TemplateCategory = "all" | "engineering" | "ai" | "general" | "visual";
type SkillsMode = "keywords" | "detailed";
type AtsTheme = "standard" | "markdown" | "business" | "academic" | "mono";
type SectionId = "basic" | "summary" | "experience" | "project" | "education" | "skills";
type ExportMode = "original" | "ats";
type SamplePreset = "compact" | "extended";
type WorkExperience = { id: string; company: string; role: string; date: string; detail: string };
type ProjectExperience = { id: string; name: string; role: string; date: string; detail: string };
type EducationExperience = { id: string; school: string; degree: string; date: string; detail: string };

type ResumeData = {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  summary: string;
  skills: string;
  skillsDetail: string;
  workExperiences: WorkExperience[];
  projects: ProjectExperience[];
  educations: EducationExperience[];
};
type TextFieldKey = { [K in keyof ResumeData]: ResumeData[K] extends string ? K : never }[keyof ResumeData];

const compactInitialData: ResumeData = {
  name: "周屿",
  title: "AI / 大模型应用工程师",
  location: "杭州",
  phone: "138 0013 8000",
  email: "zhouyu.ai@example.com",
  website: "github.com/zhouyu-ai",
  summary: "5 年后端与 AI 应用研发经验，专注大模型落地、RAG 检索增强与高并发服务架构。具备从数据治理、模型评测到服务部署的完整工程经验，能够将不确定的算法能力转化为稳定、可观测、可迭代的业务系统。",
  skills: "Python、PyTorch、LangChain、RAG、Agent、FastAPI、Java、Redis、Kafka、Kubernetes、LLM Evaluation",
  skillsDetail: "编程语言：熟练使用 Python、Java，掌握 TypeScript 与 SQL，具备良好的数据结构、并发编程和代码工程化基础。\nAI 与模型工程：熟悉 PyTorch、Transformers、LangChain、RAG、Agent、Embedding 与模型评测，具有大模型微调和推理优化经验。\n后端与数据：熟悉 FastAPI、Spring Boot、MySQL、Redis、Kafka、Elasticsearch，能够设计高并发、可观测的分布式服务。\n云原生与工程实践：熟悉 Docker、Kubernetes、GitHub Actions、Prometheus，重视自动化测试、性能压测与持续交付。",
  workExperiences: [
    { id: "work-1", company: "星河智能科技", role: "高级 AI 应用工程师", date: "2023.04 — 至今", detail: "主导企业知识助手从 0 到 1 建设，设计混合检索、重排与引用溯源链路，回答准确率由 68% 提升至 89%。\n搭建覆盖 12 类业务场景的自动化评测集与回归流水线，将模型版本验证周期从 3 天缩短至 4 小时。\n使用 vLLM、Kubernetes 完成推理服务部署与弹性扩缩容，峰值吞吐提升 2.6 倍，单次调用成本降低 37%。" },
    { id: "work-2", company: "云栈网络科技", role: "后端开发工程师", date: "2020.07 — 2023.03", detail: "负责交易中台与开放平台核心服务，基于 Java、Spring Boot、Kafka 支撑日均 3000 万次调用。\n推动慢查询治理、缓存分层与链路压测，核心接口 P99 延迟从 420ms 降至 160ms。" },
  ],
  projects: [
    { id: "project-1", name: "Atlas 企业级 RAG 平台", role: "技术负责人", date: "2023.08 — 2024.05", detail: "构建文档解析、向量化、权限过滤、检索评测一体化平台，支持 PDF、网页与结构化数据接入；服务 18 个业务团队，累计沉淀 600 万知识切片，月活用户超过 1.2 万。" },
    { id: "project-2", name: "多智能体代码审查助手", role: "核心开发者", date: "2024.06 — 2024.11", detail: "设计规划、检索、审查与验证四类 Agent 协作流程，结合 AST 与代码仓库上下文生成可溯源建议；试点团队缺陷发现率提升 23%，误报率控制在 8% 以内。" },
  ],
  educations: [
    { id: "education-1", school: "浙江大学", degree: "计算机科学与技术 · 硕士", date: "2017.09 — 2020.06", detail: "研究方向为自然语言处理与知识图谱；核心课程 GPA 3.8/4.0，获研究生一等奖学金。" },
  ],
};

const extendedInitialData: ResumeData = {
  ...compactInitialData,
  name: "周屿",
  summary: "7 年 AI 平台与后端研发经验，专注大模型应用、RAG 检索增强、Agent 工作流与高并发服务架构。曾负责企业级 AI 平台从技术选型、数据治理、模型评测到生产部署的完整建设，带领跨职能团队交付多个千万级调用系统。擅长把实验性模型能力沉淀为稳定、可观测、可持续迭代的工程产品，并通过量化指标推动业务落地。",
  skills: "Python、PyTorch、Transformers、LangChain、RAG、Agent、FastAPI、Java、Spring Boot、Redis、Kafka、Elasticsearch、Kubernetes、vLLM、LLM Evaluation",
  skillsDetail: "编程语言：熟练使用 Python、Java 与 SQL，掌握 TypeScript，具备扎实的数据结构、并发编程、设计模式和代码工程化能力。\n大模型应用：熟悉 PyTorch、Transformers、LangChain、RAG、Agent、Embedding、重排与 Prompt Engineering，具有模型微调、推理加速和效果评测经验。\n后端与数据：熟悉 FastAPI、Spring Boot、MySQL、Redis、Kafka、Elasticsearch，能够设计高并发、高可用、可观测的分布式系统。\n云原生与 MLOps：熟悉 Docker、Kubernetes、vLLM、GitHub Actions、Prometheus 与 Grafana，具备 GPU 资源调度、灰度发布和成本治理经验。\n团队与交付：具备技术方案评审、任务拆解、跨团队协作和新人培养经验，重视自动化测试、性能压测、文档沉淀与持续交付。",
  educations: [
    { id: "education-long-1", school: "浙江大学", degree: "计算机科学与技术 · 硕士", date: "2017.09 — 2020.06", detail: "研究方向为自然语言处理、知识图谱与语义检索；核心课程 GPA 3.8/4.0，获研究生一等奖学金。参与省级重点实验室课题，在中文信息抽取与实体对齐方向完成工程验证。" },
    { id: "education-long-2", school: "杭州电子科技大学", degree: "软件工程 · 本科", date: "2013.09 — 2017.06", detail: "" },
  ],
  workExperiences: [
    { id: "work-long-1", company: "星河智能科技", role: "AI 平台技术负责人", date: "2023.04 — 至今", detail: "主导企业知识助手与 RAG 平台从 0 到 1 建设，设计文档解析、混合检索、重排、权限过滤与引用溯源链路，核心场景回答准确率由 68% 提升至 89%。\n搭建覆盖 12 类业务场景、3200 条高质量样本的自动化评测集与回归流水线，将模型版本验证周期从 3 天缩短至 4 小时。\n使用 vLLM、Kubernetes 与动态批处理完成推理服务部署及弹性扩缩容，峰值吞吐提升 2.6 倍，单次调用成本降低 37%。\n带领 6 人研发小组制定平台路线图和工程规范，推动 18 个业务团队接入，服务月活用户超过 1.2 万。" },
    { id: "work-long-2", company: "云栈网络科技", role: "高级后端开发工程师", date: "2020.07 — 2023.03", detail: "负责交易中台与开放平台核心服务，基于 Java、Spring Boot、Kafka 构建事件驱动架构，稳定支撑日均 3000 万次调用。\n推动慢查询治理、缓存分层与全链路压测，核心接口 P99 延迟从 420ms 降至 160ms，重大活动期间保持 99.99% 可用性。\n设计租户级限流、熔断降级和幂等机制，将重复交易异常降低 82%，并完善 Prometheus 告警与故障演练体系。\n推进 CI/CD 与自动化测试落地，核心仓库单元测试覆盖率提升至 78%，平均发布耗时由 50 分钟降低至 18 分钟。" },
    { id: "work-long-3", company: "启明数据实验室", role: "算法工程师（实习）", date: "2019.06 — 2020.05", detail: "参与中文知识图谱构建，完成实体识别、关系抽取与实体对齐流水线，处理超过 800 万条行业文本。\n基于 BERT 优化命名实体识别模型，F1 从 82.4% 提升至 88.7%，并封装为可复用推理服务供 3 个项目使用。" },
  ],
  projects: [
    { id: "project-long-1", name: "Atlas 企业级 RAG 平台", role: "技术负责人", date: "2023.08 — 2024.05", detail: "构建文档解析、向量化、权限过滤、混合检索、重排与评测一体化平台，支持 PDF、网页和结构化数据接入；累计沉淀 600 万知识切片。设计多租户隔离、增量索引与答案引用机制，使知识更新时延由小时级降低至分钟级，平台已服务 18 个业务团队。" },
    { id: "project-long-2", name: "多智能体代码审查助手", role: "核心开发者", date: "2024.06 — 2024.11", detail: "设计规划、检索、审查与验证四类 Agent 协作流程，结合 AST、代码仓库上下文和规则引擎生成可溯源建议；建立离线评测集和人工反馈闭环，试点团队缺陷发现率提升 23%，误报率控制在 8% 以内。" },
    { id: "project-long-3", name: "统一模型评测与观测中心", role: "架构设计", date: "2024.10 — 2025.03", detail: "建设覆盖准确性、安全性、延迟和成本的统一评测体系，接入 9 类模型与 26 个应用；通过版本对比、质量门禁和线上采样监控，将模型回归问题平均发现时间从 2 天缩短至 30 分钟。" },
  ],
};

const initialData = extendedInitialData;

type LegacyResumeData = Partial<ResumeData> & {
  school?: string; degree?: string; educationDate?: string; educationDetail?: string;
  company?: string; role?: string; workDate?: string; workDetail?: string;
  company2?: string; role2?: string; workDate2?: string; workDetail2?: string;
  project?: string; projectRole?: string; projectDate?: string; projectDetail?: string;
  project2?: string; projectRole2?: string; projectDate2?: string; projectDetail2?: string;
};

function normalizeResumeData(stored: LegacyResumeData): ResumeData {
  const workExperiences = Array.isArray(stored.workExperiences) ? stored.workExperiences : [
    { id: "work-migrated-1", company: stored.company || "", role: stored.role || "", date: stored.workDate || "", detail: stored.workDetail || "" },
    { id: "work-migrated-2", company: stored.company2 || "", role: stored.role2 || "", date: stored.workDate2 || "", detail: stored.workDetail2 || "" },
  ].filter((item) => item.company || item.role || item.date || item.detail);
  const projects = Array.isArray(stored.projects) ? stored.projects : [
    { id: "project-migrated-1", name: stored.project || "", role: stored.projectRole || "", date: stored.projectDate || "", detail: stored.projectDetail || "" },
    { id: "project-migrated-2", name: stored.project2 || "", role: stored.projectRole2 || "", date: stored.projectDate2 || "", detail: stored.projectDetail2 || "" },
  ].filter((item) => item.name || item.role || item.date || item.detail);
  const educations = Array.isArray(stored.educations) ? stored.educations : [
    { id: "education-migrated-1", school: stored.school || "", degree: stored.degree || "", date: stored.educationDate || "", detail: stored.educationDetail || "" },
  ].filter((item) => item.school || item.degree || item.date || item.detail);
  return {
    ...initialData,
    ...stored,
    name: stored.name === "尧舜禹" ? "周屿" : (stored.name || initialData.name),
    workExperiences: workExperiences.length ? workExperiences : initialData.workExperiences,
    projects: projects.length ? projects : initialData.projects,
    educations: educations.length ? educations : initialData.educations,
  };
}

const templateMeta: { id: Template; name: string; note: string; color: string; category: Exclude<TemplateCategory, "all">; source: string }[] = [
  { id: "classic", name: "清简", note: "通用稳妥", color: "#1f2a24", category: "general", source: "经典中文简历" },
  { id: "modern", name: "新章", note: "现代醒目", color: "#3d5afe", category: "general", source: "Modern Classic" },
  { id: "calm", name: "松岚", note: "克制独特", color: "#34675c", category: "general", source: "Nordic Minimal" },
  { id: "neural", name: "神经元", note: "AI / 算法", color: "#6c4ff8", category: "ai", source: "Data-Driven" },
  { id: "compiler", name: "编译器", note: "后端 / 架构", color: "#087f5b", category: "engineering", source: "Developer Mono" },
  { id: "blueprint", name: "工程蓝", note: "全栈 / 研发", color: "#155eef", category: "engineering", source: "Graph Paper Grid" },
  { id: "markdown", name: "文档流", note: "Markdown / ATS", color: "#222222", category: "engineering", source: "Pandoc Markdown" },
  { id: "sidebar", name: "深栈", note: "双栏 / 技术栈", color: "#173f3b", category: "visual", source: "Deedy / Sidebar" },
  { id: "timeline", name: "时序", note: "时间轴 / 资深", color: "#b45309", category: "visual", source: "Asymmetric Timeline" },
  { id: "jake", name: "极客标准", note: "工程 / ATS", color: "#111827", category: "engineering", source: "Jake's Resume" },
  { id: "research", name: "研究序列", note: "算法 / 学术", color: "#5b21b6", category: "ai", source: "Academic CV Lite" },
  { id: "compact", name: "技术简报", note: "资深 / 高密度", color: "#0f4c5c", category: "engineering", source: "Investor Brief" },
  { id: "bandBlue", name: "雾蓝横章", note: "柔和 / 清爽", color: "#86a9b9", category: "visual", source: "Pastel Blue Resume" },
  { id: "bandGreen", name: "鼠尾草", note: "自然 / 稳重", color: "#8da99a", category: "visual", source: "Sage Professional" },
  { id: "bandWine", name: "雾紫横章", note: "含蓄 / 雅致", color: "#aaa3bd", category: "visual", source: "Misty Lavender Editorial" },
];

const atsThemes: { id: AtsTheme; name: string; note: string }[] = [
  { id: "standard", name: "标准工程", note: "均衡紧凑" },
  { id: "markdown", name: "Markdown", note: "章节醒目" },
  { id: "business", name: "商务留白", note: "舒展易读" },
  { id: "academic", name: "学术研究", note: "稳重衬线" },
  { id: "mono", name: "极简黑白", note: "最保守" },
];

const templateCategories: { id: TemplateCategory; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "engineering", label: "工程开发" },
  { id: "ai", label: "AI / 研究" },
  { id: "general", label: "通用商务" },
  { id: "visual", label: "视觉展示" },
];

const sectionFields: { id: SectionId; label: string; mark: string }[] = [
  { id: "basic", label: "基本信息", mark: "01" },
  { id: "summary", label: "个人简介", mark: "02" },
  { id: "experience", label: "工作经历", mark: "03" },
  { id: "project", label: "项目经历", mark: "04" },
  { id: "education", label: "教育经历", mark: "05" },
  { id: "skills", label: "专业技能", mark: "06" },
];

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const props = { value, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value), placeholder: `填写${label}` };
  return (
    <label className={`field ${multiline ? "field-wide" : ""}`}>
      <span>{label}</span>
      {multiline ? <textarea {...props} rows={4} /> : <input {...props} />}
    </label>
  );
}

function Editable({ value, onChange, className = "", multiline = false }: { value: string; onChange: (value: string) => void; className?: string; multiline?: boolean }) {
  return (
    <span
      className={`editable ${className}`}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline}
      onBlur={(event) => onChange(event.currentTarget.innerText.trim())}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {value}
    </span>
  );
}

export default function ResumeStudio() {
  const [data, setData] = useState<ResumeData>(initialData);
  const [template, setTemplate] = useState<Template>("classic");
  const [activeSection, setActiveSection] = useState("basic");
  const [showTemplates, setShowTemplates] = useState(false);
  const [saved, setSaved] = useState(true);
  const [zoom, setZoom] = useState(88);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("preview");
  const [skillsMode, setSkillsMode] = useState<SkillsMode>("detailed");
  const [atsMode, setAtsMode] = useState(true);
  const [atsTheme, setAtsTheme] = useState<AtsTheme>("standard");
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>("all");
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(sectionFields.map((section) => section.id));
  const [draggedSection, setDraggedSection] = useState<SectionId | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [samplePreset, setSamplePreset] = useState<SamplePreset>("extended");
  const [pageMetrics, setPageMetrics] = useState({ offsets: [0], contentHeight: 1019 });
  const measurePaperRef = useRef<HTMLElement>(null);
  const measureFlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("jianxu-resume-v3") || window.localStorage.getItem("jianxu-resume-v2") || window.localStorage.getItem("jianxu-resume");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { data: LegacyResumeData; template: Template; skillsMode?: SkillsMode; atsMode?: boolean; atsTheme?: AtsTheme; sectionOrder?: SectionId[]; samplePreset?: SamplePreset };
        const isOldExample = parsed.data?.title === "产品设计师" && !parsed.data?.company2;
        setData(isOldExample ? initialData : normalizeResumeData(parsed.data || {}));
        setTemplate(templateMeta.some((item) => item.id === parsed.template) ? parsed.template : "classic");
        setSkillsMode(parsed.skillsMode || "detailed");
        setAtsMode(parsed.atsMode ?? true);
        setAtsTheme(atsThemes.some((item) => item.id === parsed.atsTheme) ? parsed.atsTheme! : "standard");
        setSamplePreset(parsed.samplePreset || (parsed.data?.workExperiences?.length === 3 ? "extended" : "compact"));
        const validOrder = parsed.sectionOrder?.filter((id, index, values) => sectionFields.some((section) => section.id === id) && values.indexOf(id) === index);
        if (validOrder?.length === sectionFields.length) setSectionOrder(validOrder);
      } catch { /* keep the polished default */ }
    }
  }, []);

  useEffect(() => {
    setSaved(false);
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem("jianxu-resume-v3", JSON.stringify({ data, template, skillsMode, atsMode, atsTheme, sectionOrder, samplePreset }));
      setSaved(true);
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [data, template, skillsMode, atsMode, atsTheme, sectionOrder, samplePreset]);

  useEffect(() => {
    const paper = measurePaperRef.current;
    const flow = measureFlowRef.current;
    if (!paper || !flow) return;
    const measurePages = () => {
      const styles = window.getComputedStyle(paper);
      const contentHeight = Math.max(1, 1123 - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom));
      const flowTop = flow.getBoundingClientRect().top;
      const breakCandidates = Array.from(flow.querySelectorAll<HTMLElement>(".resume-section h3, .timeline-entry, .resume-section li, .body-copy, .education-section .entry-head"))
        .map((element) => Math.round(element.getBoundingClientRect().top - flowTop))
        .filter((offset, index, values) => offset > 0 && values.indexOf(offset) === index)
        .sort((a, b) => a - b);
      const offsets = [0];
      let pageStart = 0;
      while (pageStart + contentHeight < flow.scrollHeight - 1) {
        const target = pageStart + contentHeight;
        const earliestBalancedBreak = pageStart + contentHeight * 0.58;
        const safeBreak = breakCandidates.filter((offset) => offset >= earliestBalancedBreak && offset <= target - 8).at(-1);
        const nextStart = safeBreak && safeBreak > pageStart + 80 ? safeBreak : target;
        offsets.push(nextStart);
        pageStart = nextStart;
      }
      setPageMetrics((current) => {
        const unchanged = Math.abs(current.contentHeight - contentHeight) < 0.5 && current.offsets.length === offsets.length && current.offsets.every((offset, index) => Math.abs(offset - offsets[index]) < 0.5);
        return unchanged ? current : { offsets, contentHeight };
      });
    };
    const frame = window.requestAnimationFrame(measurePages);
    const observer = new ResizeObserver(measurePages);
    observer.observe(paper);
    observer.observe(flow);
    document.fonts?.ready.then(measurePages);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const update = (key: TextFieldKey, value: string) => setData((current) => ({ ...current, [key]: value }));
  const updateWorkExperience = (id: string, key: Exclude<keyof WorkExperience, "id">, value: string) => setData((current) => ({
    ...current,
    workExperiences: current.workExperiences.map((item) => item.id === id ? { ...item, [key]: value } : item),
  }));
  const updateProject = (id: string, key: Exclude<keyof ProjectExperience, "id">, value: string) => setData((current) => ({
    ...current,
    projects: current.projects.map((item) => item.id === id ? { ...item, [key]: value } : item),
  }));
  const updateEducation = (id: string, key: Exclude<keyof EducationExperience, "id">, value: string) => setData((current) => ({
    ...current,
    educations: current.educations.map((item) => item.id === id ? { ...item, [key]: value } : item),
  }));
  const addWorkExperience = () => setData((current) => ({
    ...current,
    workExperiences: [...current.workExperiences, { id: `work-${Date.now()}`, company: "", role: "", date: "", detail: "" }],
  }));
  const addProject = () => setData((current) => ({
    ...current,
    projects: [...current.projects, { id: `project-${Date.now()}`, name: "", role: "", date: "", detail: "" }],
  }));
  const addEducation = () => setData((current) => ({
    ...current,
    educations: [...current.educations, { id: `education-${Date.now()}`, school: "", degree: "", date: "", detail: "" }],
  }));
  const removeWorkExperience = (id: string) => setData((current) => ({
    ...current,
    workExperiences: current.workExperiences.filter((item) => item.id !== id),
  }));
  const removeProject = (id: string) => setData((current) => ({
    ...current,
    projects: current.projects.filter((item) => item.id !== id),
  }));
  const removeEducation = (id: string) => setData((current) => ({
    ...current,
    educations: current.educations.filter((item) => item.id !== id),
  }));
  const applySamplePreset = (preset: SamplePreset) => {
    const source = preset === "extended" ? extendedInitialData : compactInitialData;
    setData({
      ...source,
      workExperiences: source.workExperiences.map((item) => ({ ...item })),
      projects: source.projects.map((item) => ({ ...item })),
      educations: source.educations.map((item) => ({ ...item })),
    });
    setSamplePreset(preset);
    setTemplate("classic");
    setSectionOrder(sectionFields.map((section) => section.id));
  };
  const currentTemplate = useMemo(() => templateMeta.find((item) => item.id === template)!, [template]);
  const visibleTemplates = useMemo(() => templateCategory === "all" ? templateMeta : templateMeta.filter((item) => item.category === templateCategory), [templateCategory]);
  const lines = (value: string) => value.split("\n").filter(Boolean);
  const exportPdf = (mode: ExportMode) => {
    const previousMode = atsMode;
    setShowExportOptions(false);
    setAtsMode(mode === "ats");
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => setAtsMode(previousMode), 100);
    }, 150);
  };
  const reorderSection = (source: SectionId, target: SectionId) => {
    if (source === target) return;
    setSectionOrder((current) => {
      const sourceIndex = current.indexOf(source);
      const targetIndex = current.indexOf(target);
      const next = [...current];
      [next[sourceIndex], next[targetIndex]] = [next[targetIndex], next[sourceIndex]];
      return next;
    });
  };
  const moveSection = (id: SectionId, direction: -1 | 1) => {
    setSectionOrder((current) => {
      const index = current.indexOf(id);
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const editor = (
    <aside className={`editor-panel ${mobileView === "preview" ? "mobile-hidden" : ""}`}>
      <div className="editor-head">
        <div>
          <p className="eyebrow">内容编辑</p>
          <h2>{sectionFields.find((item) => item.id === activeSection)?.label}</h2>
        </div>
        <span className={`save-state ${saved ? "is-saved" : ""}`}><i />{saved ? "已自动保存" : "保存中"}</span>
      </div>
      <div className="editor-scroll">
        <div className="sample-switch" role="group" aria-label="切换示例内容">
          <span><b>示例内容</b><small>页数由内容和模板自动计算</small></span>
          <div>
            <button className={samplePreset === "compact" ? "active" : ""} onClick={() => applySamplePreset("compact")}>精简示例</button>
            <button className={samplePreset === "extended" ? "active" : ""} onClick={() => applySamplePreset("extended")}>完整示例</button>
          </div>
        </div>
        {activeSection === "basic" && <div className="form-grid">
          <Field label="姓名" value={data.name} onChange={(v) => update("name", v)} />
          <Field label="求职方向" value={data.title} onChange={(v) => update("title", v)} />
          <Field label="所在地" value={data.location} onChange={(v) => update("location", v)} />
          <Field label="手机" value={data.phone} onChange={(v) => update("phone", v)} />
          <Field label="邮箱" value={data.email} onChange={(v) => update("email", v)} />
          <Field label="个人网站" value={data.website} onChange={(v) => update("website", v)} />
        </div>}
        {activeSection === "summary" && <div className="form-grid"><Field label="个人简介" value={data.summary} onChange={(v) => update("summary", v)} multiline /></div>}
        {activeSection === "skills" && <div className="form-grid">
          <div className="mode-switch field-wide" role="group" aria-label="专业技能展示模式">
            <button className={skillsMode === "detailed" ? "active" : ""} onClick={() => setSkillsMode("detailed")}><b>分组详述</b><span>适合技术与专业岗位</span></button>
            <button className={skillsMode === "keywords" ? "active" : ""} onClick={() => setSkillsMode("keywords")}><b>关键词标签</b><span>适合通用与非技术岗位</span></button>
          </div>
          {skillsMode === "detailed"
            ? <Field label="专业技能（每行一个技能分组）" value={data.skillsDetail} onChange={(v) => update("skillsDetail", v)} multiline />
            : <Field label="专业技能（用顿号分隔）" value={data.skills} onChange={(v) => update("skills", v)} multiline />}
        </div>}
        {activeSection === "experience" && <div className="repeatable-list">
          {data.workExperiences.map((item, index) => <section className="repeatable-card" key={item.id}>
            <div className="repeatable-head"><div><span>{String(index + 1).padStart(2, "0")}</span><b>{item.company || `工作经历 ${index + 1}`}</b></div><button onClick={() => removeWorkExperience(item.id)} aria-label={`删除第 ${index + 1} 段工作经历`}>删除</button></div>
            <div className="form-grid">
              <Field label="公司" value={item.company} onChange={(v) => updateWorkExperience(item.id, "company", v)} />
              <Field label="职位" value={item.role} onChange={(v) => updateWorkExperience(item.id, "role", v)} />
              <Field label="时间" value={item.date} onChange={(v) => updateWorkExperience(item.id, "date", v)} />
              <Field label="工作成果（每行一条）" value={item.detail} onChange={(v) => updateWorkExperience(item.id, "detail", v)} multiline />
            </div>
          </section>)}
          <button className="add-entry-button" onClick={addWorkExperience}><span>＋</span>新增工作经历</button>
          {!data.workExperiences.length && <p className="empty-entry-tip">暂无工作经历，点击上方按钮添加。</p>}
        </div>}
        {activeSection === "project" && <div className="repeatable-list">
          {data.projects.map((item, index) => <section className="repeatable-card" key={item.id}>
            <div className="repeatable-head"><div><span>{String(index + 1).padStart(2, "0")}</span><b>{item.name || `项目经历 ${index + 1}`}</b></div><button onClick={() => removeProject(item.id)} aria-label={`删除第 ${index + 1} 段项目经历`}>删除</button></div>
            <div className="form-grid">
              <Field label="项目名称" value={item.name} onChange={(v) => updateProject(item.id, "name", v)} />
              <Field label="担任角色" value={item.role} onChange={(v) => updateProject(item.id, "role", v)} />
              <Field label="时间" value={item.date} onChange={(v) => updateProject(item.id, "date", v)} />
              <Field label="项目成果" value={item.detail} onChange={(v) => updateProject(item.id, "detail", v)} multiline />
            </div>
          </section>)}
          <button className="add-entry-button" onClick={addProject}><span>＋</span>新增项目经历</button>
          {!data.projects.length && <p className="empty-entry-tip">暂无项目经历，点击上方按钮添加。</p>}
        </div>}
        {activeSection === "education" && <div className="repeatable-list">
          {data.educations.map((item, index) => <section className="repeatable-card" key={item.id}>
            <div className="repeatable-head"><div><span>{String(index + 1).padStart(2, "0")}</span><b>{item.school || `教育经历 ${index + 1}`}</b></div><button onClick={() => removeEducation(item.id)} aria-label={`删除第 ${index + 1} 段教育经历`}>删除</button></div>
            <div className="form-grid">
              <Field label="学校" value={item.school} onChange={(v) => updateEducation(item.id, "school", v)} />
              <Field label="专业与学历" value={item.degree} onChange={(v) => updateEducation(item.id, "degree", v)} />
              <Field label="时间" value={item.date} onChange={(v) => updateEducation(item.id, "date", v)} />
              <Field label="在校经历（选填）" value={item.detail} onChange={(v) => updateEducation(item.id, "detail", v)} multiline />
            </div>
          </section>)}
          <button className="add-entry-button" onClick={addEducation}><span>＋</span>新增教育经历</button>
          {!data.educations.length && <p className="empty-entry-tip">暂无教育经历，点击上方按钮添加。</p>}
        </div>}
        <div className="editor-tip"><span>✦</span><p><b>小提示</b>右侧预览中的文字也可以直接点击修改，排版会保持不变。</p></div>
      </div>
    </aside>
  );

  const resumeHeader = (
    <header className="resume-header">
      <div className="name-block"><Editable value={data.name} onChange={(v) => update("name", v)} className="resume-name" /><Editable value={data.title} onChange={(v) => update("title", v)} className="resume-title" /></div>
      <div className="contact-grid">
        <span><i className="contact-icon">⌖</i><Editable value={data.location} onChange={(v) => update("location", v)} /></span>
        <span><i className="contact-icon">◍</i><Editable value={data.phone} onChange={(v) => update("phone", v)} /></span>
        <span><i className="contact-icon">✉</i><Editable value={data.email} onChange={(v) => update("email", v)} /></span>
        <span><i className="contact-icon">◎</i><Editable value={data.website} onChange={(v) => update("website", v)} /></span>
      </div>
    </header>
  );

  const summarySection = (
    <section className="resume-section summary-section"><h3>个人简介 <small>PROFILE</small></h3><Editable value={data.summary} onChange={(v) => update("summary", v)} className="body-copy" multiline /></section>
  );

  const experienceSection = (
    <section className="resume-section experience-section"><h3>工作经历 <small>EXPERIENCE</small></h3>
      {data.workExperiences.map((item, itemIndex) => <div className={`${itemIndex ? "entry-secondary " : ""}timeline-entry`} key={item.id}>
        <div className="entry-head"><div><Editable value={item.company} onChange={(v) => updateWorkExperience(item.id, "company", v)} className="entry-title" /><Editable value={item.role} onChange={(v) => updateWorkExperience(item.id, "role", v)} className="entry-subtitle" /></div><Editable value={item.date} onChange={(v) => updateWorkExperience(item.id, "date", v)} className="entry-date" /></div>
        <ul>{lines(item.detail).map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}</ul>
      </div>)}
    </section>
  );

  const projectSection = (
    <section className="resume-section project-section"><h3>项目经历 <small>PROJECTS</small></h3>
      {data.projects.map((item, itemIndex) => <div className={`${itemIndex ? "entry-secondary " : ""}timeline-entry`} key={item.id}>
        <div className="entry-head"><div><Editable value={item.name} onChange={(v) => updateProject(item.id, "name", v)} className="entry-title" /><Editable value={item.role} onChange={(v) => updateProject(item.id, "role", v)} className="entry-subtitle" /></div><Editable value={item.date} onChange={(v) => updateProject(item.id, "date", v)} className="entry-date" /></div>
        <Editable value={item.detail} onChange={(v) => updateProject(item.id, "detail", v)} className="body-copy" multiline />
      </div>)}
    </section>
  );

  const educationSection = data.educations.length ? (
    <section className="resume-section education-section"><h3>教育经历 <small>EDUCATION</small></h3>
      {data.educations.map((item, itemIndex) => <div className={itemIndex ? "entry-secondary education-entry" : "education-entry"} key={item.id}>
        <div className="entry-head"><div><Editable value={item.school} onChange={(v) => updateEducation(item.id, "school", v)} className="entry-title" /><Editable value={item.degree} onChange={(v) => updateEducation(item.id, "degree", v)} className="entry-subtitle" /></div><Editable value={item.date} onChange={(v) => updateEducation(item.id, "date", v)} className="entry-date" /></div>
        {item.detail.trim() && <Editable value={item.detail} onChange={(v) => updateEducation(item.id, "detail", v)} className="body-copy education-detail" multiline />}
      </div>)}
    </section>
  ) : null;

  const skillsSection = (
    <section className={`resume-section skills-section skills-${skillsMode}`}><h3>专业技能 <small>SKILLS</small></h3>
      {skillsMode === "detailed"
        ? <ul className="skill-detail-list">{lines(data.skillsDetail).map((skill, index) => <li key={`${skill}-${index}`}>{skill}</li>)}</ul>
        : <div className="skill-list">{data.skills.split(/[、,，]/).filter(Boolean).map((skill) => <span key={skill}>{skill.trim()}</span>)}</div>}
    </section>
  );

  const orderedSection = (id: SectionId, includeHeaderRule = true) => {
    if (id === "basic") return <div key={id} className="ordered-basic">{resumeHeader}{includeHeaderRule && <div className="accent-rule"><i /></div>}</div>;
    if (id === "summary") return <div key={id}>{summarySection}</div>;
    if (id === "experience") return <div key={id}>{experienceSection}</div>;
    if (id === "project") return <div key={id}>{projectSection}</div>;
    if (id === "education") return <div key={id}>{educationSection}</div>;
    return <div key={id}>{skillsSection}</div>;
  };
  const renderOrderedSections = (ids = sectionOrder, includeHeaderRule = true) => ids.map((id) => orderedSection(id, includeHeaderRule));
  const leftColumnOrder = sectionOrder.filter((id) => ["basic", "summary", "skills", "education"].includes(id));
  const mainColumnOrder = sectionOrder.filter((id) => ["experience", "project"].includes(id));
  const timelineMainOrder = sectionOrder.filter((id) => ["experience", "project"].includes(id));
  const timelineSideOrder = sectionOrder.filter((id) => ["summary", "skills", "education"].includes(id));
  const renderResumeBody = () => atsMode ? <>{renderOrderedSections()}</> : template === "markdown" || template === "research" ? <>{renderOrderedSections()}</> : template === "sidebar" ? <div className="resume-layout-sidebar">
    <aside className="resume-sidebar">{renderOrderedSections(leftColumnOrder, false)}</aside>
    <div className="resume-main">{renderOrderedSections(mainColumnOrder, false)}</div>
  </div> : template === "timeline" ? <>
    {resumeHeader}<div className="accent-rule"><i /></div>
    <div className="resume-layout-timeline"><main>{renderOrderedSections(timelineMainOrder, false)}</main><aside>{renderOrderedSections(timelineSideOrder, false)}</aside></div>
  </> : <>{renderOrderedSections()}</>;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="简序首页"><span>简</span><strong>简序</strong><em>RESUME</em></a>
        <div className="document-name"><span className="document-dot" />{data.name || "未命名"}的简历 <small>{saved ? "已保存" : "保存中…"}</small></div>
        <div className="top-actions">
          <button className="plain-button" onClick={() => setShowTemplates(true)}><span className="button-icon">▦</span>选择模板</button>
          <button className="plain-button" onClick={() => setAtsMode((value) => !value)}><span className="button-icon">↗</span>{atsMode ? "查看原版" : "查看 ATS 版"}</button>
          <div className="export-menu-wrap">
            <button className="primary-button" onClick={() => setShowExportOptions((value) => !value)} aria-expanded={showExportOptions}><span>↓</span> 导出 PDF <b>⌄</b></button>
            {showExportOptions && <div className="export-menu" role="menu">
              <button onClick={() => exportPdf("original")} role="menuitem"><i>原</i><span><b>导出原版 PDF</b><small>保留当前模板、颜色与视觉布局</small></span></button>
              <button onClick={() => exportPdf("ats")} role="menuitem"><i>ATS</i><span><b>导出 ATS PDF</b><small>单栏结构，适合招聘系统解析</small></span></button>
            </div>}
          </div>
        </div>
      </header>

      <div className="mobile-switch" role="tablist">
        <button className={mobileView === "edit" ? "active" : ""} onClick={() => setMobileView("edit")}>编辑内容</button>
        <button className={mobileView === "preview" ? "active" : ""} onClick={() => setMobileView("preview")}>实时预览</button>
      </div>

      <div className="workspace">
        <nav className={`section-nav ${mobileView === "preview" ? "mobile-hidden" : ""}`} aria-label="简历章节">
          <p>简历内容</p>
          {sectionOrder.map((sectionId, index) => {
            const section = sectionFields.find((item) => item.id === sectionId)!;
            return (
            <button
              key={section.id}
              data-section-id={section.id}
              draggable
              className={`${activeSection === section.id ? "active" : ""} ${draggedSection === section.id ? "is-dragging" : ""}`}
              onClick={() => setActiveSection(section.id)}
              onDragStart={(event) => {
                setDraggedSection(section.id);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", section.id);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (draggedSection) reorderSection(draggedSection, section.id);
              }}
              onDragEnd={() => setDraggedSection(null)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>{section.label}
              <span className="section-movers">
                <span className="drag-grip" aria-hidden="true">⠿</span>
                <span className="move-buttons">
                  <span role="button" tabIndex={0} aria-label={`上移${section.label}`} className={index === 0 ? "disabled" : ""} onClick={(event) => { event.stopPropagation(); moveSection(section.id, -1); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); moveSection(section.id, -1); } }}>↑</span>
                  <span role="button" tabIndex={0} aria-label={`下移${section.label}`} className={index === sectionOrder.length - 1 ? "disabled" : ""} onClick={(event) => { event.stopPropagation(); moveSection(section.id, 1); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); moveSection(section.id, 1); } }}>↓</span>
                </span>
              </span>
            </button>
          )})}
          <div className="nav-bottom"><button onClick={() => applySamplePreset(samplePreset)}>↺ <span>恢复当前示例</span></button></div>
        </nav>

        {editor}

        <section className={`preview-panel ${mobileView === "edit" ? "mobile-hidden" : ""}`}>
          <div className="preview-toolbar">
            <div className="preview-meta"><div className="template-chip"><i style={{ background: currentTemplate.color }} />{currentTemplate.name}<span>{currentTemplate.note}</span></div><small>A4 · 自动 {pageMetrics.offsets.length} 页</small></div>
            <div className="ats-toolbar">
              <details className="ats-explainer">
                <summary aria-label="了解什么是 ATS">?</summary>
                <div>
                  <b>什么是 ATS？</b>
                  <p>ATS（招聘管理系统）会读取简历文字、识别章节和关键词，帮助招聘方搜索与筛选候选人。</p>
                  <p><strong>严格模式</strong>会改用标准单栏顺序，减少图标、双栏和装饰元素造成的解析风险；视觉模板更适合人工阅读。</p>
                  <small>不同公司的 ATS 规则并不完全相同，因此无法承诺所有系统均 100% 一致。</small>
                </div>
              </details>
              <button className={`ats-toggle ${atsMode ? "active" : ""}`} onClick={() => setAtsMode((value) => !value)} aria-pressed={atsMode}>
                <span className="ats-toggle-track"><i /></span><b>ATS 严格模式</b>
              </button>
              {atsMode && <label className="ats-theme-picker"><span>主题</span><select value={atsTheme} onChange={(event) => setAtsTheme(event.target.value as AtsTheme)}>{atsThemes.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.note}</option>)}</select></label>}
            </div>
            <div className="zoom-control"><button onClick={() => setZoom((v) => Math.max(65, v - 5))}>−</button><span>{zoom}%</span><button onClick={() => setZoom((v) => Math.min(105, v + 5))}>＋</button></div>
          </div>
          <div className="paper-stage">
            <article ref={measurePaperRef} className={`resume-paper pagination-measure template-${template} ${atsMode ? `ats-strict ats-theme-${atsTheme}` : ""}`} aria-hidden="true">
              <div ref={measureFlowRef} className="resume-flow-content">{renderResumeBody()}</div>
            </article>
            <div className="resume-pages" style={{ "--zoom": zoom / 100 } as React.CSSProperties}>
              {pageMetrics.offsets.map((pageOffset, pageIndex) => <div className="resume-page-shell" key={`resume-page-${pageIndex}`}>
                <article className={`resume-paper resume-page template-${template} ${atsMode ? `ats-strict ats-theme-${atsTheme}` : ""}`} aria-label={`简历第 ${pageIndex + 1} 页，共 ${pageMetrics.offsets.length} 页`}>
                  <div className="resume-page-viewport" style={{ height: `${pageMetrics.contentHeight}px` }}>
                    <div className="resume-flow-content" style={{ transform: `translateY(-${pageOffset}px)` }}>{renderResumeBody()}</div>
                  </div>
                  <span className="page-number" aria-hidden="true">{pageIndex + 1} / {pageMetrics.offsets.length}</span>
                </article>
              </div>)}
            </div>
          </div>
        </section>
      </div>

      {showTemplates && <div className="modal-backdrop" onMouseDown={() => setShowTemplates(false)}>
        <section className="template-modal" role="dialog" aria-modal="true" aria-label="选择简历模板" onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-head"><div><p className="eyebrow">模板中心 · 15 套 + 5 套 ATS 主题</p><h2>按岗位选择优质模板</h2><span>视觉模板各有布局；ATS 主题保持相同单栏结构，只改变低风险样式。</span></div><button onClick={() => setShowTemplates(false)} aria-label="关闭">×</button></div>
          <div className="template-categories">{templateCategories.map((category) => <button key={category.id} className={templateCategory === category.id ? "active" : ""} onClick={() => setTemplateCategory(category.id)}>{category.label}</button>)}</div>
          <div className="template-grid">{visibleTemplates.map((item) => <button key={item.id} className={`template-card ${template === item.id ? "active" : ""}`} onClick={() => { setTemplate(item.id); setShowTemplates(false); }}>
            <div className={`mini-paper mini-${item.id}`}><i /><b /><span /><span /><strong /><span /><span /></div>
            <div><strong>{item.name}</strong><span>{item.note}</span>{template === item.id && <em>✓ 当前使用</em>}</div>
            <small className="template-source">参考：{item.source} · ATS 严格导出</small>
          </button>)}</div>
        </section>
      </div>}
    </main>
  );
}
