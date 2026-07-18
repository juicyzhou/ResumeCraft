import assert from "node:assert/strict";
import test from "node:test";
import { buildAtsText, validateAtsResume } from "../app/ats-validation.mjs";

const data = {
  name: "周屿", title: "后端开发工程师", location: "杭州", phone: "13800138000", email: "zhouyu@example.com", website: "github.com/zhouyu",
  summary: "具备后端系统研发经验。", skills: "Java、MySQL", skillsDetail: "编程语言：Java\n数据库：MySQL",
  workExperiences: [{ company: "示例科技", role: "开发工程师", date: "2023 — 至今", detail: "负责核心服务。\n接口延迟降低 30%。" }],
  projects: [{ name: "交易平台", role: "核心开发", date: "2024", detail: "支撑日均百万请求。" }],
  educations: [{ school: "示例大学", degree: "计算机本科", date: "2019 — 2023", detail: "GPA 3.8/4.0" }],
  customSections: [{ id: "custom-awards", title: "荣誉奖项", kind: "list", content: "", entries: [{ title: "优秀员工", subtitle: "公司级", date: "2024", detail: "年度技术贡献奖" }] }],
};
const order = ["basic", "summary", "experience", "project", "education", "skills", "custom-awards"];

test("ATS text follows configured section order and includes structured sections once", () => {
  const text = buildAtsText(data, order, "detailed");
  const labels = ["周屿", "个人简介", "工作经历", "项目经历", "教育经历", "专业技能", "荣誉奖项"];
  let previous = -1;
  for (const label of labels) {
    const index = text.indexOf(label);
    assert.ok(index > previous, `${label} should appear in reading order`);
    previous = index;
    assert.equal(text.indexOf(label, index + label.length), -1, `${label} should not be duplicated`);
  }
});

test("ATS validation reports a passing complete resume", () => {
  const report = validateAtsResume(data, order, "detailed", 2);
  assert.equal(report.passed, true);
  assert.ok(report.score >= 90);
  assert.equal(report.checks.find((item) => item.id === "duplicates")?.status, "pass");
});

test("ATS validation catches missing identity and contact details", () => {
  const report = validateAtsResume({ ...data, name: "", phone: "" }, order, "detailed", 1);
  assert.equal(report.passed, false);
  assert.equal(report.checks.find((item) => item.id === "identity")?.status, "fail");
  assert.equal(report.checks.find((item) => item.id === "contact")?.status, "fail");
});
