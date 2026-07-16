"use client";

import { useEffect, useMemo, useState } from "react";

type Template = "classic" | "modern" | "calm" | "neural" | "compiler" | "blueprint" | "markdown" | "sidebar" | "timeline" | "jake" | "research" | "compact" | "bandBlue" | "bandGreen" | "bandWine";
type TemplateCategory = "all" | "engineering" | "ai" | "general" | "visual";
type SkillsMode = "keywords" | "detailed";
type AtsTheme = "standard" | "markdown" | "business" | "academic" | "mono";

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
  school: string;
  degree: string;
  educationDate: string;
  educationDetail: string;
  company: string;
  role: string;
  workDate: string;
  workDetail: string;
  company2: string;
  role2: string;
  workDate2: string;
  workDetail2: string;
  project: string;
  projectRole: string;
  projectDate: string;
  projectDetail: string;
  project2: string;
  projectRole2: string;
  projectDate2: string;
  projectDetail2: string;
};

const initialData: ResumeData = {
  name: "周屿",
  title: "AI / 大模型应用工程师",
  location: "杭州",
  phone: "138 0013 8000",
  email: "zhouyu.ai@example.com",
  website: "github.com/zhouyu-ai",
  summary: "5 年后端与 AI 应用研发经验，专注大模型落地、RAG 检索增强与高并发服务架构。具备从数据治理、模型评测到服务部署的完整工程经验，能够将不确定的算法能力转化为稳定、可观测、可迭代的业务系统。",
  skills: "Python、PyTorch、LangChain、RAG、Agent、FastAPI、Java、Redis、Kafka、Kubernetes、LLM Evaluation",
  skillsDetail: "编程语言：熟练使用 Python、Java，掌握 TypeScript 与 SQL，具备良好的数据结构、并发编程和代码工程化基础。\nAI 与模型工程：熟悉 PyTorch、Transformers、LangChain、RAG、Agent、Embedding 与模型评测，具有大模型微调和推理优化经验。\n后端与数据：熟悉 FastAPI、Spring Boot、MySQL、Redis、Kafka、Elasticsearch，能够设计高并发、可观测的分布式服务。\n云原生与工程实践：熟悉 Docker、Kubernetes、GitHub Actions、Prometheus，重视自动化测试、性能压测与持续交付。",
  school: "浙江大学",
  degree: "计算机科学与技术 · 硕士",
  educationDate: "2017.09 — 2020.06",
  educationDetail: "研究方向为自然语言处理与知识图谱；核心课程 GPA 3.8/4.0，获研究生一等奖学金。",
  company: "星河智能科技",
  role: "高级 AI 应用工程师",
  workDate: "2023.04 — 至今",
  workDetail: "主导企业知识助手从 0 到 1 建设，设计混合检索、重排与引用溯源链路，回答准确率由 68% 提升至 89%。\n搭建覆盖 12 类业务场景的自动化评测集与回归流水线，将模型版本验证周期从 3 天缩短至 4 小时。\n使用 vLLM、Kubernetes 完成推理服务部署与弹性扩缩容，峰值吞吐提升 2.6 倍，单次调用成本降低 37%。",
  company2: "云栈网络科技",
  role2: "后端开发工程师",
  workDate2: "2020.07 — 2023.03",
  workDetail2: "负责交易中台与开放平台核心服务，基于 Java、Spring Boot、Kafka 支撑日均 3000 万次调用。\n推动慢查询治理、缓存分层与链路压测，核心接口 P99 延迟从 420ms 降至 160ms。",
  project: "Atlas 企业级 RAG 平台",
  projectRole: "技术负责人",
  projectDate: "2023.08 — 2024.05",
  projectDetail: "构建文档解析、向量化、权限过滤、检索评测一体化平台，支持 PDF、网页与结构化数据接入；服务 18 个业务团队，累计沉淀 600 万知识切片，月活用户超过 1.2 万。",
  project2: "多智能体代码审查助手",
  projectRole2: "核心开发者",
  projectDate2: "2024.06 — 2024.11",
  projectDetail2: "设计规划、检索、审查与验证四类 Agent 协作流程，结合 AST 与代码仓库上下文生成可溯源建议；试点团队缺陷发现率提升 23%，误报率控制在 8% 以内。",
};

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
  { id: "bandWine", name: "柔玫瑰", note: "温暖 / 雅致", color: "#bd929a", category: "visual", source: "Pastel Rose Editorial" },
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

const sectionFields = [
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

  useEffect(() => {
    const stored = window.localStorage.getItem("jianxu-resume-v3") || window.localStorage.getItem("jianxu-resume-v2") || window.localStorage.getItem("jianxu-resume");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { data: ResumeData; template: Template; skillsMode?: SkillsMode; atsMode?: boolean; atsTheme?: AtsTheme };
        const isOldExample = parsed.data?.title === "产品设计师" && !parsed.data?.company2;
        setData(isOldExample ? initialData : { ...initialData, ...parsed.data });
        setTemplate(templateMeta.some((item) => item.id === parsed.template) ? parsed.template : "classic");
        setSkillsMode(parsed.skillsMode || "detailed");
        setAtsMode(parsed.atsMode ?? true);
        setAtsTheme(atsThemes.some((item) => item.id === parsed.atsTheme) ? parsed.atsTheme! : "standard");
      } catch { /* keep the polished default */ }
    }
  }, []);

  useEffect(() => {
    setSaved(false);
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem("jianxu-resume-v3", JSON.stringify({ data, template, skillsMode, atsMode, atsTheme }));
      setSaved(true);
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [data, template, skillsMode, atsMode, atsTheme]);

  const update = (key: keyof ResumeData, value: string) => setData((current) => ({ ...current, [key]: value }));
  const currentTemplate = useMemo(() => templateMeta.find((item) => item.id === template)!, [template]);
  const visibleTemplates = useMemo(() => templateCategory === "all" ? templateMeta : templateMeta.filter((item) => item.category === templateCategory), [templateCategory]);
  const lines = (value: string) => value.split("\n").filter(Boolean);
  const exportAtsPdf = () => {
    setAtsMode(true);
    window.setTimeout(() => window.print(), 100);
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
        {activeSection === "experience" && <div className="form-grid">
          <p className="form-section-title">最近经历</p>
          <Field label="公司" value={data.company} onChange={(v) => update("company", v)} />
          <Field label="职位" value={data.role} onChange={(v) => update("role", v)} />
          <Field label="时间" value={data.workDate} onChange={(v) => update("workDate", v)} />
          <Field label="工作成果（每行一条）" value={data.workDetail} onChange={(v) => update("workDetail", v)} multiline />
          <p className="form-section-title">上一段经历</p>
          <Field label="公司" value={data.company2} onChange={(v) => update("company2", v)} />
          <Field label="职位" value={data.role2} onChange={(v) => update("role2", v)} />
          <Field label="时间" value={data.workDate2} onChange={(v) => update("workDate2", v)} />
          <Field label="工作成果（每行一条）" value={data.workDetail2} onChange={(v) => update("workDetail2", v)} multiline />
        </div>}
        {activeSection === "project" && <div className="form-grid">
          <p className="form-section-title">代表项目</p>
          <Field label="项目名称" value={data.project} onChange={(v) => update("project", v)} />
          <Field label="担任角色" value={data.projectRole} onChange={(v) => update("projectRole", v)} />
          <Field label="时间" value={data.projectDate} onChange={(v) => update("projectDate", v)} />
          <Field label="项目成果" value={data.projectDetail} onChange={(v) => update("projectDetail", v)} multiline />
          <p className="form-section-title">补充项目</p>
          <Field label="项目名称" value={data.project2} onChange={(v) => update("project2", v)} />
          <Field label="担任角色" value={data.projectRole2} onChange={(v) => update("projectRole2", v)} />
          <Field label="时间" value={data.projectDate2} onChange={(v) => update("projectDate2", v)} />
          <Field label="项目成果" value={data.projectDetail2} onChange={(v) => update("projectDetail2", v)} multiline />
        </div>}
        {activeSection === "education" && <div className="form-grid">
          <Field label="学校" value={data.school} onChange={(v) => update("school", v)} />
          <Field label="专业与学历" value={data.degree} onChange={(v) => update("degree", v)} />
          <Field label="时间" value={data.educationDate} onChange={(v) => update("educationDate", v)} />
          <Field label="在校经历" value={data.educationDetail} onChange={(v) => update("educationDetail", v)} multiline />
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
      <div className="timeline-entry">
        <div className="entry-head"><div><Editable value={data.company} onChange={(v) => update("company", v)} className="entry-title" /><Editable value={data.role} onChange={(v) => update("role", v)} className="entry-subtitle" /></div><Editable value={data.workDate} onChange={(v) => update("workDate", v)} className="entry-date" /></div>
        <ul>{lines(data.workDetail).map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}</ul>
      </div>
      <div className="entry-secondary timeline-entry">
        <div className="entry-head"><div><Editable value={data.company2} onChange={(v) => update("company2", v)} className="entry-title" /><Editable value={data.role2} onChange={(v) => update("role2", v)} className="entry-subtitle" /></div><Editable value={data.workDate2} onChange={(v) => update("workDate2", v)} className="entry-date" /></div>
        <ul>{lines(data.workDetail2).map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}</ul>
      </div>
    </section>
  );

  const projectSection = (
    <section className="resume-section project-section"><h3>项目经历 <small>PROJECTS</small></h3>
      <div className="timeline-entry">
        <div className="entry-head"><div><Editable value={data.project} onChange={(v) => update("project", v)} className="entry-title" /><Editable value={data.projectRole} onChange={(v) => update("projectRole", v)} className="entry-subtitle" /></div><Editable value={data.projectDate} onChange={(v) => update("projectDate", v)} className="entry-date" /></div>
        <Editable value={data.projectDetail} onChange={(v) => update("projectDetail", v)} className="body-copy" multiline />
      </div>
      <div className="entry-secondary timeline-entry">
        <div className="entry-head"><div><Editable value={data.project2} onChange={(v) => update("project2", v)} className="entry-title" /><Editable value={data.projectRole2} onChange={(v) => update("projectRole2", v)} className="entry-subtitle" /></div><Editable value={data.projectDate2} onChange={(v) => update("projectDate2", v)} className="entry-date" /></div>
        <Editable value={data.projectDetail2} onChange={(v) => update("projectDetail2", v)} className="body-copy" multiline />
      </div>
    </section>
  );

  const educationSection = (
    <section className="resume-section education-section"><h3>教育经历 <small>EDUCATION</small></h3>
      <div className="entry-head"><div><Editable value={data.school} onChange={(v) => update("school", v)} className="entry-title" /><Editable value={data.degree} onChange={(v) => update("degree", v)} className="entry-subtitle" /></div><Editable value={data.educationDate} onChange={(v) => update("educationDate", v)} className="entry-date" /></div>
      <Editable value={data.educationDetail} onChange={(v) => update("educationDetail", v)} className="body-copy" multiline />
    </section>
  );

  const skillsSection = (
    <section className={`resume-section skills-section skills-${skillsMode}`}><h3>专业技能 <small>SKILLS</small></h3>
      {skillsMode === "detailed"
        ? <ul className="skill-detail-list">{lines(data.skillsDetail).map((skill, index) => <li key={`${skill}-${index}`}>{skill}</li>)}</ul>
        : <div className="skill-list">{data.skills.split(/[、,，]/).filter(Boolean).map((skill) => <span key={skill}>{skill.trim()}</span>)}</div>}
    </section>
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="简序首页"><span>简</span><strong>简序</strong><em>RESUME</em></a>
        <div className="document-name"><span className="document-dot" />{data.name || "未命名"}的简历 <small>{saved ? "已保存" : "保存中…"}</small></div>
        <div className="top-actions">
          <button className="plain-button" onClick={() => setShowTemplates(true)}><span className="button-icon">▦</span>选择模板</button>
          <button className="plain-button" onClick={exportAtsPdf}><span className="button-icon">↗</span>ATS 预览</button>
          <button className="primary-button" onClick={exportAtsPdf}><span>↓</span> 导出 ATS PDF</button>
        </div>
      </header>

      <div className="mobile-switch" role="tablist">
        <button className={mobileView === "edit" ? "active" : ""} onClick={() => setMobileView("edit")}>编辑内容</button>
        <button className={mobileView === "preview" ? "active" : ""} onClick={() => setMobileView("preview")}>实时预览</button>
      </div>

      <div className="workspace">
        <nav className={`section-nav ${mobileView === "preview" ? "mobile-hidden" : ""}`} aria-label="简历章节">
          <p>简历内容</p>
          {sectionFields.map((section) => (
            <button key={section.id} className={activeSection === section.id ? "active" : ""} onClick={() => setActiveSection(section.id)}>
              <span>{section.mark}</span>{section.label}<i>›</i>
            </button>
          ))}
          <div className="nav-bottom"><button onClick={() => { setData(initialData); setTemplate("classic"); }}>↺ <span>恢复示例</span></button></div>
        </nav>

        {editor}

        <section className={`preview-panel ${mobileView === "edit" ? "mobile-hidden" : ""}`}>
          <div className="preview-toolbar">
            <div className="template-chip"><i style={{ background: currentTemplate.color }} />{currentTemplate.name}<span>{currentTemplate.note}</span></div>
            <div className="ats-toolbar">
              <button className={`ats-toggle ${atsMode ? "active" : ""}`} onClick={() => setAtsMode((value) => !value)} aria-pressed={atsMode}>
                <span className="ats-toggle-track"><i /></span><b>ATS 严格模式</b>
              </button>
              {atsMode && <label className="ats-theme-picker"><span>主题</span><select value={atsTheme} onChange={(event) => setAtsTheme(event.target.value as AtsTheme)}>{atsThemes.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.note}</option>)}</select></label>}
            </div>
            <div className="zoom-control"><button onClick={() => setZoom((v) => Math.max(65, v - 5))}>−</button><span>{zoom}%</span><button onClick={() => setZoom((v) => Math.min(105, v + 5))}>＋</button></div>
          </div>
          <div className="paper-stage">
            <article className={`resume-paper template-${template} ${atsMode ? `ats-strict ats-theme-${atsTheme}` : ""}`} style={{ "--zoom": zoom / 100 } as React.CSSProperties}>
              {atsMode ? <>
                {resumeHeader}<div className="accent-rule"><i /></div>
                {summarySection}{experienceSection}{projectSection}{educationSection}{skillsSection}
              </> : template === "markdown" ? <>
                {resumeHeader}<div className="accent-rule"><i /></div>
                {educationSection}{experienceSection}{projectSection}{skillsSection}{summarySection}
              </> : template === "research" ? <>
                {resumeHeader}<div className="accent-rule"><i /></div>
                {summarySection}{educationSection}{projectSection}{experienceSection}{skillsSection}
              </> : template === "sidebar" ? <div className="resume-layout-sidebar">
                <aside className="resume-sidebar">{resumeHeader}{summarySection}{skillsSection}{educationSection}</aside>
                <div className="resume-main">{experienceSection}{projectSection}</div>
              </div> : template === "timeline" ? <>
                {resumeHeader}<div className="accent-rule"><i /></div>
                <div className="resume-layout-timeline"><main>{experienceSection}{projectSection}</main><aside>{summarySection}{skillsSection}{educationSection}</aside></div>
              </> : <>
                {resumeHeader}<div className="accent-rule"><i /></div>
                {summarySection}{experienceSection}{projectSection}{educationSection}{skillsSection}
              </>}
            </article>
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
