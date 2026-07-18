const sectionLabels = {
  basic: "基本信息",
  summary: "个人简介",
  experience: "工作经历",
  project: "项目经历",
  education: "教育经历",
  skills: "专业技能",
};

const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
const lines = (value) => String(value || "").split("\n").map(clean).filter(Boolean);

function entryLines(entry) {
  const heading = [entry.title, entry.subtitle, entry.date].map(clean).filter(Boolean).join(" | ");
  return [heading, ...lines(entry.detail)].filter(Boolean);
}

export function buildAtsText(data, sectionOrder, skillsMode = "detailed") {
  const blocks = [];
  for (const sectionId of sectionOrder) {
    if (sectionId === "basic") {
      blocks.push([
        clean(data.name),
        clean(data.title),
        [data.location, data.phone, data.email, data.website].map(clean).filter(Boolean).join(" | "),
      ].filter(Boolean).join("\n"));
    } else if (sectionId === "summary" && clean(data.summary)) {
      blocks.push(`${sectionLabels.summary}\n${clean(data.summary)}`);
    } else if (sectionId === "experience" && data.workExperiences?.length) {
      const entries = data.workExperiences.flatMap((item) => entryLines({ title: item.company, subtitle: item.role, date: item.date, detail: item.detail }));
      blocks.push(`${sectionLabels.experience}\n${entries.join("\n")}`);
    } else if (sectionId === "project" && data.projects?.length) {
      const entries = data.projects.flatMap((item) => entryLines({ title: item.name, subtitle: item.role, date: item.date, detail: item.detail }));
      blocks.push(`${sectionLabels.project}\n${entries.join("\n")}`);
    } else if (sectionId === "education" && data.educations?.length) {
      const entries = data.educations.flatMap((item) => entryLines({ title: item.school, subtitle: item.degree, date: item.date, detail: item.detail }));
      blocks.push(`${sectionLabels.education}\n${entries.join("\n")}`);
    } else if (sectionId === "skills") {
      const skills = skillsMode === "detailed" ? lines(data.skillsDetail) : String(data.skills || "").split(/[、,，]/).map(clean).filter(Boolean);
      if (skills.length) blocks.push(`${sectionLabels.skills}\n${skills.join("\n")}`);
    } else if (String(sectionId).startsWith("custom-")) {
      const section = data.customSections?.find((item) => item.id === sectionId);
      if (!section) continue;
      const content = section.kind === "text"
        ? lines(section.content)
        : (section.entries || []).flatMap(entryLines);
      if (clean(section.title) && content.length) blocks.push(`${clean(section.title)}\n${content.join("\n")}`);
    }
  }
  return blocks.filter(Boolean).join("\n\n").trim();
}

export function validateAtsResume(data, sectionOrder, skillsMode = "detailed", pageCount = 1) {
  const atsText = buildAtsText(data, sectionOrder, skillsMode);
  const checks = [];
  const add = (id, label, status, detail) => checks.push({ id, label, status, detail });
  add("identity", "姓名与求职方向", clean(data.name) && clean(data.title) ? "pass" : "fail", clean(data.name) && clean(data.title) ? "信息完整" : "姓名或求职方向为空");
  add("contact", "联系方式", clean(data.phone) && clean(data.email) ? "pass" : "fail", clean(data.phone) && clean(data.email) ? "手机和邮箱均已填写" : "建议同时填写手机和邮箱");
  add("email", "邮箱格式", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(data.email)) ? "pass" : "warn", "检查邮箱是否可被招聘系统识别");
  const substantiveSections = [data.summary, data.skillsDetail, ...(data.workExperiences || []).map((item) => item.detail), ...(data.projects || []).map((item) => item.detail)].filter((item) => clean(item)).length;
  add("content", "正文完整度", substantiveSections >= 3 ? "pass" : "warn", substantiveSections >= 3 ? "包含多段可解析内容" : "正文较少，建议补充经历或项目成果");
  const riskySymbols = atsText.match(/[★◆■▪☑✅❖]/g) || [];
  add("symbols", "特殊符号", riskySymbols.length ? "warn" : "pass", riskySymbols.length ? `发现 ${riskySymbols.length} 个可能影响解析的装饰符号` : "未发现高风险装饰符号");
  add("order", "标准阅读顺序", sectionOrder[0] === "basic" ? "pass" : "warn", sectionOrder[0] === "basic" ? "基本信息位于首位" : "建议将基本信息放在第一位");
  add("pages", "页数控制", pageCount <= 3 ? "pass" : "warn", pageCount <= 3 ? `当前 ${pageCount} 页` : `当前 ${pageCount} 页，建议检查是否可以精简`);
  const duplicateBlocks = atsText.split(/\n\n+/).filter((block, index, values) => values.indexOf(block) !== index);
  add("duplicates", "内容唯一性", duplicateBlocks.length ? "fail" : "pass", duplicateBlocks.length ? "发现重复章节，请检查导出内容" : "规范化文本中无重复章节");
  const score = Math.max(0, checks.reduce((total, item) => total - (item.status === "fail" ? 20 : item.status === "warn" ? 7 : 0), 100));
  return { score, checks, atsText, passed: checks.every((item) => item.status !== "fail") };
}
