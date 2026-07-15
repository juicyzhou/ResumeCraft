"use client";

import { useEffect, useMemo, useState } from "react";

type Template = "classic" | "modern" | "calm";

type ResumeData = {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  summary: string;
  skills: string;
  school: string;
  degree: string;
  educationDate: string;
  educationDetail: string;
  company: string;
  role: string;
  workDate: string;
  workDetail: string;
  project: string;
  projectRole: string;
  projectDate: string;
  projectDetail: string;
};

const initialData: ResumeData = {
  name: "林知夏",
  title: "产品设计师",
  location: "上海",
  phone: "138 0013 8000",
  email: "zhixia.lin@example.com",
  website: "linzhixia.design",
  summary: "5 年数字产品设计经验，擅长把复杂业务转化为清晰、自然的用户体验。关注策略、体验与商业目标之间的平衡，乐于推动跨团队共创并让好想法真正落地。",
  skills: "产品策略、用户研究、交互设计、Figma、设计系统",
  school: "江南大学",
  degree: "工业设计 · 本科",
  educationDate: "2015.09 — 2019.06",
  educationDetail: "专业前 10%，主修用户体验设计、服务设计与视觉传达。",
  company: "远望科技",
  role: "高级产品设计师",
  workDate: "2022.03 — 至今",
  workDetail: "负责企业协作产品从 0 到 1 的体验设计，建立覆盖 Web 与移动端的设计系统。\n重构核心工作流，使新用户任务完成率提升 31%，客户满意度提升至 4.8/5。\n协同产品、研发与市场团队推进 6 次大型版本发布。",
  project: "Flow 智能工作台",
  projectRole: "体验负责人",
  projectDate: "2023.06 — 2024.02",
  projectDetail: "主导调研、信息架构与关键交互设计，将分散的审批、项目与知识流程整合为统一工作台，上线三个月后周活跃用户增长 42%。",
};

const templateMeta: { id: Template; name: string; note: string; color: string }[] = [
  { id: "classic", name: "清简", note: "通用稳妥", color: "#1f2a24" },
  { id: "modern", name: "新章", note: "现代醒目", color: "#3d5afe" },
  { id: "calm", name: "松岚", note: "克制独特", color: "#34675c" },
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

  useEffect(() => {
    const stored = window.localStorage.getItem("jianxu-resume");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { data: ResumeData; template: Template };
        setData(parsed.data);
        setTemplate(parsed.template);
      } catch { /* keep the polished default */ }
    }
  }, []);

  useEffect(() => {
    setSaved(false);
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem("jianxu-resume", JSON.stringify({ data, template }));
      setSaved(true);
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [data, template]);

  const update = (key: keyof ResumeData, value: string) => setData((current) => ({ ...current, [key]: value }));
  const currentTemplate = useMemo(() => templateMeta.find((item) => item.id === template)!, [template]);
  const lines = (value: string) => value.split("\n").filter(Boolean);

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
        {activeSection === "skills" && <div className="form-grid"><Field label="专业技能（用顿号分隔）" value={data.skills} onChange={(v) => update("skills", v)} multiline /></div>}
        {activeSection === "experience" && <div className="form-grid">
          <Field label="公司" value={data.company} onChange={(v) => update("company", v)} />
          <Field label="职位" value={data.role} onChange={(v) => update("role", v)} />
          <Field label="时间" value={data.workDate} onChange={(v) => update("workDate", v)} />
          <Field label="工作成果（每行一条）" value={data.workDetail} onChange={(v) => update("workDetail", v)} multiline />
        </div>}
        {activeSection === "project" && <div className="form-grid">
          <Field label="项目名称" value={data.project} onChange={(v) => update("project", v)} />
          <Field label="担任角色" value={data.projectRole} onChange={(v) => update("projectRole", v)} />
          <Field label="时间" value={data.projectDate} onChange={(v) => update("projectDate", v)} />
          <Field label="项目成果" value={data.projectDetail} onChange={(v) => update("projectDetail", v)} multiline />
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="简序首页"><span>简</span><strong>简序</strong><em>RESUME</em></a>
        <div className="document-name"><span className="document-dot" />{data.name || "未命名"}的简历 <small>{saved ? "已保存" : "保存中…"}</small></div>
        <div className="top-actions">
          <button className="plain-button" onClick={() => setShowTemplates(true)}><span className="button-icon">▦</span>选择模板</button>
          <button className="plain-button" onClick={() => window.print()}><span className="button-icon">↗</span>打印预览</button>
          <button className="primary-button" onClick={() => window.print()}><span>↓</span> 导出 PDF</button>
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
            <p>点击简历文字即可编辑</p>
            <div className="zoom-control"><button onClick={() => setZoom((v) => Math.max(65, v - 5))}>−</button><span>{zoom}%</span><button onClick={() => setZoom((v) => Math.min(105, v + 5))}>＋</button></div>
          </div>
          <div className="paper-stage">
            <article className={`resume-paper template-${template}`} style={{ "--zoom": zoom / 100 } as React.CSSProperties}>
              <header className="resume-header">
                <div className="name-block"><Editable value={data.name} onChange={(v) => update("name", v)} className="resume-name" /><Editable value={data.title} onChange={(v) => update("title", v)} className="resume-title" /></div>
                <div className="contact-grid">
                  <span>⌖ <Editable value={data.location} onChange={(v) => update("location", v)} /></span>
                  <span>◍ <Editable value={data.phone} onChange={(v) => update("phone", v)} /></span>
                  <span>✉ <Editable value={data.email} onChange={(v) => update("email", v)} /></span>
                  <span>◎ <Editable value={data.website} onChange={(v) => update("website", v)} /></span>
                </div>
              </header>
              <div className="accent-rule"><i /></div>
              <section className="resume-section summary-section"><h3>个人简介 <small>PROFILE</small></h3><Editable value={data.summary} onChange={(v) => update("summary", v)} className="body-copy" multiline /></section>
              <section className="resume-section"><h3>工作经历 <small>EXPERIENCE</small></h3>
                <div className="entry-head"><div><Editable value={data.company} onChange={(v) => update("company", v)} className="entry-title" /><Editable value={data.role} onChange={(v) => update("role", v)} className="entry-subtitle" /></div><Editable value={data.workDate} onChange={(v) => update("workDate", v)} className="entry-date" /></div>
                <ul>{lines(data.workDetail).map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}</ul>
              </section>
              <section className="resume-section"><h3>项目经历 <small>PROJECTS</small></h3>
                <div className="entry-head"><div><Editable value={data.project} onChange={(v) => update("project", v)} className="entry-title" /><Editable value={data.projectRole} onChange={(v) => update("projectRole", v)} className="entry-subtitle" /></div><Editable value={data.projectDate} onChange={(v) => update("projectDate", v)} className="entry-date" /></div>
                <Editable value={data.projectDetail} onChange={(v) => update("projectDetail", v)} className="body-copy" multiline />
              </section>
              <section className="resume-section"><h3>教育经历 <small>EDUCATION</small></h3>
                <div className="entry-head"><div><Editable value={data.school} onChange={(v) => update("school", v)} className="entry-title" /><Editable value={data.degree} onChange={(v) => update("degree", v)} className="entry-subtitle" /></div><Editable value={data.educationDate} onChange={(v) => update("educationDate", v)} className="entry-date" /></div>
                <Editable value={data.educationDetail} onChange={(v) => update("educationDetail", v)} className="body-copy" multiline />
              </section>
              <section className="resume-section skills-section"><h3>专业技能 <small>SKILLS</small></h3><div className="skill-list">{data.skills.split(/[、,，]/).filter(Boolean).map((skill) => <span key={skill}>{skill.trim()}</span>)}</div></section>
            </article>
          </div>
        </section>
      </div>

      {showTemplates && <div className="modal-backdrop" onMouseDown={() => setShowTemplates(false)}>
        <section className="template-modal" role="dialog" aria-modal="true" aria-label="选择简历模板" onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-head"><div><p className="eyebrow">模板中心</p><h2>选择最适合你的表达</h2><span>内容不会改变，随时都能切换。</span></div><button onClick={() => setShowTemplates(false)} aria-label="关闭">×</button></div>
          <div className="template-grid">{templateMeta.map((item) => <button key={item.id} className={`template-card ${template === item.id ? "active" : ""}`} onClick={() => { setTemplate(item.id); setShowTemplates(false); }}>
            <div className={`mini-paper mini-${item.id}`}><i /><b /><span /><span /><strong /><span /><span /></div>
            <div><strong>{item.name}</strong><span>{item.note}</span>{template === item.id && <em>✓ 当前使用</em>}</div>
          </button>)}</div>
        </section>
      </div>}
    </main>
  );
}
