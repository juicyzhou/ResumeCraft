"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildAtsText, validateAtsResume } from "./ats-validation.mjs";

type Template = "classic" | "modern" | "calm" | "neural" | "compiler" | "blueprint" | "markdown" | "sidebar" | "timeline" | "jake" | "research" | "compact" | "bandBlue" | "bandGreen" | "bandWine";
type TemplateCategory = "all" | "engineering" | "ai" | "general" | "visual";
type SkillsMode = "keywords" | "detailed";
type AtsTheme = "standard" | "markdown" | "business" | "academic" | "mono";
type BuiltInSectionId = "basic" | "summary" | "experience" | "project" | "education" | "skills";
type CustomSectionId = `custom-${string}`;
type SectionId = BuiltInSectionId | CustomSectionId;
type ExportMode = "original" | "ats";
type SamplePreset = "compact" | "extended" | "campus" | "senior" | "ai" | "product";
type CustomSectionKind = "text" | "list" | "timeline";
type SectionLibraryKey = "custom" | "campus" | "awards" | "certificates" | "publications" | "patents" | "opensource" | "portfolio" | "languages";
type WorkExperience = { id: string; company: string; role: string; date: string; detail: string };
type ProjectExperience = { id: string; name: string; role: string; date: string; detail: string };
type EducationExperience = { id: string; school: string; degree: string; date: string; detail: string };
type StructuredEntry = { id: string; title: string; subtitle: string; date: string; detail: string };
type CustomSection = { id: CustomSectionId; title: string; content: string; kind: CustomSectionKind; libraryKey: SectionLibraryKey; entries: StructuredEntry[] };

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
  customSections: CustomSection[];
};
type TextFieldKey = { [K in keyof ResumeData]: ResumeData[K] extends string ? K : never }[keyof ResumeData];
type WorkspaceSnapshot = {
  data: ResumeData;
  template: Template;
  skillsMode: SkillsMode;
  atsMode: boolean;
  atsTheme: AtsTheme;
  sectionOrder: SectionId[];
  samplePreset: SamplePreset;
};

const builtInSectionOrder: BuiltInSectionId[] = ["basic", "summary", "experience", "project", "education", "skills"];

const sectionLibrary: { key: SectionLibraryKey; title: string; note: string; kind: CustomSectionKind; primaryLabel: string; secondaryLabel: string; dateLabel: string; detailLabel: string }[] = [
  { key: "custom", title: "自定义章节", note: "适合补充说明、个人优势等自由内容", kind: "text", primaryLabel: "标题", secondaryLabel: "补充信息", dateLabel: "时间", detailLabel: "内容" },
  { key: "campus", title: "校园经历", note: "组织、社团、学生工作与志愿经历", kind: "timeline", primaryLabel: "组织 / 活动", secondaryLabel: "担任角色", dateLabel: "时间", detailLabel: "职责与成果" },
  { key: "awards", title: "荣誉奖项", note: "奖学金、竞赛名次与业务荣誉", kind: "list", primaryLabel: "奖项名称", secondaryLabel: "颁发单位 / 级别", dateLabel: "时间", detailLabel: "获奖说明" },
  { key: "certificates", title: "证书认证", note: "职业证书、语言成绩与技术认证", kind: "list", primaryLabel: "证书名称", secondaryLabel: "认证机构 / 成绩", dateLabel: "时间", detailLabel: "补充说明" },
  { key: "publications", title: "论文发表", note: "论文、会议、期刊与研究成果", kind: "timeline", primaryLabel: "论文题目", secondaryLabel: "会议 / 期刊", dateLabel: "时间", detailLabel: "作者顺序、方向与成果" },
  { key: "patents", title: "专利成果", note: "发明专利、软件著作权等", kind: "list", primaryLabel: "专利 / 软著名称", secondaryLabel: "状态 / 编号", dateLabel: "时间", detailLabel: "个人贡献" },
  { key: "opensource", title: "开源贡献", note: "GitHub、Hugging Face 与社区项目", kind: "timeline", primaryLabel: "项目名称", secondaryLabel: "角色 / 链接", dateLabel: "时间", detailLabel: "贡献与影响" },
  { key: "portfolio", title: "作品集", note: "产品案例、设计作品与在线演示", kind: "list", primaryLabel: "作品名称", secondaryLabel: "链接 / 类型", dateLabel: "时间", detailLabel: "作品说明与结果" },
  { key: "languages", title: "语言能力", note: "外语水平与专业使用场景", kind: "list", primaryLabel: "语言", secondaryLabel: "熟练程度 / 成绩", dateLabel: "认证时间", detailLabel: "使用场景" },
];

const makeStructuredSection = (id: string, key: SectionLibraryKey, entries: Omit<StructuredEntry, "id">[]): CustomSection => {
  const meta = sectionLibrary.find((item) => item.key === key)!;
  return {
    id: `custom-${id}`,
    title: meta.title,
    content: "",
    kind: meta.kind,
    libraryKey: key,
    entries: entries.map((entry, index) => ({ ...entry, id: `${id}-${index + 1}` })),
  };
};

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
  customSections: [],
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

const campusInitialData: ResumeData = {
  name: "周屿",
  title: "校招后端开发工程师",
  location: "杭州",
  phone: "138 0013 8000",
  email: "zhouyu.dev@example.com",
  website: "github.com/zhouyu-dev",
  summary: "计算机科学与技术硕士应届生，具备扎实的 Java、数据库与计算机网络基础。拥有两段后端项目及互联网实习经历，能够独立完成需求拆解、接口设计、编码测试和部署，重视代码质量与问题复盘。",
  skills: "Java、Spring Boot、MySQL、Redis、Kafka、Docker、Linux、Git",
  skillsDetail: "编程基础：熟练使用 Java，掌握数据结构、算法、计算机网络、操作系统和常用设计模式。\n后端开发：熟悉 Spring Boot、MyBatis、MySQL、Redis，能够完成 RESTful API、缓存和消息队列设计。\n工程实践：熟悉 Git、Maven、Docker、Linux，了解单元测试、接口测试和 CI/CD 基本流程。",
  workExperiences: [
    { id: "campus-work-1", company: "云杉科技", role: "后端开发实习生", date: "2025.06 — 2025.09", detail: "参与营销活动平台接口开发，使用 Spring Boot 完成优惠资格校验与领取链路，支持日均 80 万次请求。\n针对热点活动引入 Redis 缓存和分布式锁，将核心接口 P95 延迟由 210ms 降至 95ms。\n补充 42 个单元测试与接口用例，协助定位并修复 6 个线上边界问题。" },
  ],
  projects: [
    { id: "campus-project-1", name: "校园二手交易平台", role: "后端负责人", date: "2024.10 — 2025.03", detail: "基于 Spring Boot、MySQL、Redis 实现商品发布、搜索、收藏与订单模块；设计库存扣减和订单幂等方案，完成 Docker 部署，课程验收并发测试稳定通过 500 QPS。" },
    { id: "campus-project-2", name: "代码评测与学习助手", role: "核心开发者", date: "2025.03 — 2025.06", detail: "使用 Java 与 Docker 构建隔离执行环境，支持 4 种语言在线评测；负责任务队列、超时控制与结果回传，异常任务自动恢复率达到 98%。" },
  ],
  educations: [
    { id: "campus-education-1", school: "浙江工业大学", degree: "计算机科学与技术 · 硕士", date: "2023.09 — 2026.06", detail: "GPA 3.7/4.0，专业前 10%；主修分布式系统、机器学习、数据库系统，获研究生一等奖学金。" },
    { id: "campus-education-2", school: "杭州电子科技大学", degree: "软件工程 · 本科", date: "2019.09 — 2023.06", detail: "获校优秀毕业生、程序设计竞赛一等奖。" },
  ],
  customSections: [
    makeStructuredSection("campus-awards", "awards", [
      { title: "全国大学生计算机设计大赛二等奖", subtitle: "国家级 · 团队负责人", date: "2024.08", detail: "负责后端架构与答辩，作品在 300 余支参赛队中进入全国决赛。" },
      { title: "研究生一等奖学金", subtitle: "浙江工业大学", date: "2024.11", detail: "学年综合成绩专业前 10%。" },
    ]),
    makeStructuredSection("campus-activity", "campus", [
      { title: "校开源技术协会", subtitle: "后端组负责人", date: "2024.03 — 2025.03", detail: "组织 8 场技术分享，维护新人任务库，帮助 20 余名成员完成首个开源贡献。" },
    ]),
  ],
};

const seniorInitialData: ResumeData = {
  ...extendedInitialData,
  title: "资深后端工程师 / 技术负责人",
  summary: "10 年大型互联网后端与平台架构经验，负责过交易、开放平台和研发效能系统。擅长高并发架构、稳定性治理、成本优化与团队建设，主导多个千万级调用系统从重构到稳定运营，具备跨产品、算法、运维团队推动复杂项目落地的经验。",
  skillsDetail: "架构能力：熟悉高并发、微服务、事件驱动、服务治理和多活容灾，能够完成容量规划与技术风险评审。\n后端与数据：精通 Java、Spring Boot、MySQL、Redis、Kafka、Elasticsearch，熟悉性能分析和数据一致性设计。\n云原生：熟悉 Kubernetes、Service Mesh、Prometheus、Grafana，具备弹性伸缩、灰度发布与成本治理经验。\n技术管理：带领 8—12 人研发团队，负责路线图、人才培养、跨团队协作和质量体系建设。",
  customSections: [makeStructuredSection("senior-open-source", "opensource", [
    { title: "FlowGuard 服务治理组件", subtitle: "发起人 · github.com/zhouyu/flowguard", date: "2022.05 — 至今", detail: "沉淀限流、熔断与自适应保护能力，在公司 60 余个服务落地，开源后获得 1.8k Stars。" },
  ])],
};

const aiInitialData: ResumeData = {
  ...compactInitialData,
  title: "AI 算法工程师",
  summary: "4 年自然语言处理与大模型算法经验，聚焦检索增强生成、信息抽取和模型评测。具备从数据构建、训练微调、离线评测到线上推理优化的完整实践，能够同时关注算法指标、系统性能和业务收益。",
  skills: "Python、PyTorch、Transformers、LLaMA、RAG、LoRA、vLLM、FAISS、Triton、LLM Evaluation",
  skillsDetail: "算法与框架：熟练使用 Python、PyTorch、Transformers，熟悉预训练、LoRA 微调、蒸馏、量化与推理加速。\n大模型应用：熟悉 RAG、Embedding、重排、Agent 与自动化评测，能够设计端到端实验和消融分析。\n数据与工程：熟悉数据清洗、弱监督、实验追踪、GPU 训练与 vLLM 部署，掌握 SQL、Docker 和 Kubernetes。",
  workExperiences: [
    { id: "ai-work-1", company: "星河人工智能实验室", role: "高级算法工程师", date: "2022.07 — 至今", detail: "负责金融知识问答算法，构建 5.2 万条评测集与混合检索链路，答案准确率由 71.3% 提升至 88.6%。\n基于 LoRA 微调 14B 模型，结合难例挖掘与偏好数据迭代，使复杂指令遵循率提升 12.4 个百分点。\n使用 vLLM、INT4 量化和动态批处理优化推理，P95 延迟降低 41%，GPU 单请求成本降低 33%。" },
    { id: "ai-work-2", company: "启明数据", role: "NLP 算法工程师", date: "2020.07 — 2022.06", detail: "负责实体识别与关系抽取模型，处理 1200 万条行业文本；通过领域继续预训练与多任务学习将实体识别 F1 从 84.2% 提升至 90.1%。" },
  ],
  projects: [
    { id: "ai-project-1", name: "统一大模型评测平台", role: "算法负责人", date: "2023.10 — 2024.06", detail: "设计准确性、忠实度、安全性、时延和成本五维评测体系，接入 11 个模型、28 个业务场景；通过质量门禁将模型回归问题平均发现时间缩短至 45 分钟。" },
  ],
  customSections: [makeStructuredSection("ai-publications", "publications", [
    { title: "Domain-adaptive Retrieval for Chinese Knowledge QA", subtitle: "ACL Industry Track · 第二作者", date: "2024.08", detail: "提出领域自适应难负例构造方法，在三个行业数据集上平均提升 Recall@10 5.8 个百分点。" },
  ])],
};

const productInitialData: ResumeData = {
  name: "周屿",
  title: "AI 产品经理",
  location: "上海",
  phone: "138 0013 8000",
  email: "zhouyu.pm@example.com",
  website: "zhouyu-product.example.com",
  summary: "6 年 B 端与 AI 产品经验，负责过企业知识助手、数据分析平台和开放平台产品。擅长从用户研究、产品策略到跨团队交付的完整闭环，能够将模型能力转化为可衡量、可运营的产品价值。",
  skills: "产品规划、用户研究、需求分析、数据分析、A/B 测试、AI 产品设计、Figma、SQL、Axure",
  skillsDetail: "产品策略：具备市场分析、用户研究、产品定位、路线图与商业化设计经验。\nAI 产品：理解大模型、RAG、Agent 与评测基本原理，能够定义效果指标和人机协作流程。\n数据能力：熟悉 SQL、漏斗分析、留存分析和 A/B 测试，能够用数据推动产品决策。\n协作交付：熟悉敏捷研发、项目管理与跨部门沟通，具备复杂 B 端产品落地经验。",
  workExperiences: [
    { id: "pm-work-1", company: "星河智能科技", role: "高级 AI 产品经理", date: "2022.04 — 至今", detail: "负责企业知识助手产品，从 42 场用户访谈中识别客服与销售知识检索痛点，制定检索、问答和权限管理路线图。\n推动算法、研发和实施团队完成 3 个行业版本交付，6 个月内覆盖 80 家企业，月活用户达到 3.6 万。\n建立答案采纳率、引用准确率和问题解决率指标体系，产品问题解决率由 62% 提升至 84%，续费率提升 9 个百分点。" },
    { id: "pm-work-2", company: "云栈网络科技", role: "平台产品经理", date: "2019.07 — 2022.03", detail: "负责开放平台与数据分析产品，重构开发者接入流程，将平均接入周期从 12 天缩短至 5 天；推动自助分析功能上线，报表创建效率提升 45%。" },
  ],
  projects: [
    { id: "pm-project-1", name: "销售 Copilot 0—1 建设", role: "产品负责人", date: "2023.05 — 2024.01", detail: "围绕商机准备、客户问答和跟进总结设计核心场景；通过灰度试点和反馈闭环迭代 Prompt 与知识库流程，销售资料准备时间降低 55%，试点团队周活跃率达到 78%。" },
    { id: "pm-project-2", name: "企业数据洞察平台", role: "核心产品经理", date: "2020.03 — 2021.06", detail: "设计指标中心、自助分析和权限体系，联合 5 个业务部门统一 260 个核心指标，月均人工取数工时减少 1200 小时。" },
  ],
  educations: [
    { id: "pm-education-1", school: "同济大学", degree: "信息管理与信息系统 · 本科", date: "2015.09 — 2019.06", detail: "主修产品设计、数据分析和管理信息系统。" },
  ],
  customSections: [makeStructuredSection("pm-portfolio", "portfolio", [
    { title: "企业知识助手产品案例集", subtitle: "zhouyu-product.example.com/ai-copilot", date: "2024", detail: "包含用户研究、产品框架、指标体系和版本复盘，已脱敏处理。" },
  ])],
};

const samplePresets: { id: SamplePreset; label: string; note: string; data: ResumeData }[] = [
  { id: "campus", label: "校招开发", note: "一页优先", data: campusInitialData },
  { id: "senior", label: "资深工程", note: "架构与影响力", data: seniorInitialData },
  { id: "ai", label: "AI 算法", note: "模型与评测", data: aiInitialData },
  { id: "product", label: "产品经理", note: "产品与指标", data: productInitialData },
  { id: "compact", label: "AI 工程精简", note: "原一页示例", data: compactInitialData },
  { id: "extended", label: "AI 工程完整", note: "原多页示例", data: extendedInitialData },
];

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
  const customSections = Array.isArray(stored.customSections) ? stored.customSections.map((section, index) => ({
    id: (section.id || `custom-migrated-${index + 1}`) as CustomSectionId,
    title: section.title || "自定义章节",
    content: section.content || "",
    kind: section.kind || "text",
    libraryKey: section.libraryKey || "custom",
    entries: Array.isArray(section.entries) ? section.entries.map((entry, entryIndex) => ({
      id: entry.id || `custom-entry-${index + 1}-${entryIndex + 1}`,
      title: entry.title || "",
      subtitle: entry.subtitle || "",
      date: entry.date || "",
      detail: entry.detail || "",
    })) : [],
  })) : [];
  return {
    ...initialData,
    ...stored,
    name: stored.name === "尧舜禹" ? "周屿" : (stored.name || initialData.name),
    workExperiences: Array.isArray(stored.workExperiences) ? workExperiences : (workExperiences.length ? workExperiences : initialData.workExperiences),
    projects: Array.isArray(stored.projects) ? projects : (projects.length ? projects : initialData.projects),
    educations: Array.isArray(stored.educations) ? educations : (educations.length ? educations : initialData.educations),
    customSections,
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

const sectionFields: { id: BuiltInSectionId; label: string; mark: string }[] = [
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
  const [activeSection, setActiveSection] = useState<SectionId>("basic");
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
  const [showDataOptions, setShowDataOptions] = useState(false);
  const [showSectionLibrary, setShowSectionLibrary] = useState(false);
  const [showAtsValidation, setShowAtsValidation] = useState(false);
  const [samplePreset, setSamplePreset] = useState<SamplePreset>("extended");
  const [pageMetrics, setPageMetrics] = useState({ offsets: [0], contentHeight: 1019 });
  const [hydrated, setHydrated] = useState(false);
  const [historyState, setHistoryState] = useState({ undo: 0, redo: 0 });
  const measurePaperRef = useRef<HTMLElement>(null);
  const measureFlowRef = useRef<HTMLDivElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const undoStackRef = useRef<WorkspaceSnapshot[]>([]);
  const redoStackRef = useRef<WorkspaceSnapshot[]>([]);
  const lastSnapshotRef = useRef<string>("");
  const restoringHistoryRef = useRef(false);
  const syncHistoryState = () => setHistoryState({ undo: undoStackRef.current.length, redo: redoStackRef.current.length });

  const workspaceSnapshot = useMemo<WorkspaceSnapshot>(() => ({ data, template, skillsMode, atsMode, atsTheme, sectionOrder, samplePreset }), [data, template, skillsMode, atsMode, atsTheme, sectionOrder, samplePreset]);
  const createWorkspaceSnapshot = (): WorkspaceSnapshot => structuredClone(workspaceSnapshot);
  const restoreWorkspace = (snapshot: WorkspaceSnapshot) => {
    restoringHistoryRef.current = true;
    setData(normalizeResumeData(snapshot.data));
    setTemplate(templateMeta.some((item) => item.id === snapshot.template) ? snapshot.template : "classic");
    setSkillsMode(snapshot.skillsMode || "detailed");
    setAtsMode(snapshot.atsMode ?? true);
    setAtsTheme(atsThemes.some((item) => item.id === snapshot.atsTheme) ? snapshot.atsTheme : "standard");
    setSectionOrder(snapshot.sectionOrder);
    setSamplePreset(samplePresets.some((item) => item.id === snapshot.samplePreset) ? snapshot.samplePreset : "extended");
  };
  const checkpointHistory = () => {
    const current = createWorkspaceSnapshot();
    undoStackRef.current = [...undoStackRef.current.slice(-49), current];
    redoStackRef.current = [];
    lastSnapshotRef.current = JSON.stringify(current);
    restoringHistoryRef.current = true;
    syncHistoryState();
  };
  const undo = () => {
    const previous = undoStackRef.current.at(-1);
    if (!previous) return;
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    redoStackRef.current = [...redoStackRef.current.slice(-49), createWorkspaceSnapshot()];
    restoreWorkspace(previous);
    syncHistoryState();
  };
  const redo = () => {
    const next = redoStackRef.current.at(-1);
    if (!next) return;
    redoStackRef.current = redoStackRef.current.slice(0, -1);
    undoStackRef.current = [...undoStackRef.current.slice(-49), createWorkspaceSnapshot()];
    restoreWorkspace(next);
    syncHistoryState();
  };

  useEffect(() => {
    const stored = window.localStorage.getItem("jianxu-resume-v4") || window.localStorage.getItem("jianxu-resume-v3") || window.localStorage.getItem("jianxu-resume-v2") || window.localStorage.getItem("jianxu-resume");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { data: LegacyResumeData; template: Template; skillsMode?: SkillsMode; atsMode?: boolean; atsTheme?: AtsTheme; sectionOrder?: SectionId[]; samplePreset?: SamplePreset };
        const isOldExample = parsed.data?.title === "产品设计师" && !parsed.data?.company2;
        const normalizedData = isOldExample ? initialData : normalizeResumeData(parsed.data || {});
        // Hydrate the client-only editor from its local draft after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(normalizedData);
        setTemplate(templateMeta.some((item) => item.id === parsed.template) ? parsed.template : "classic");
        setSkillsMode(parsed.skillsMode || "detailed");
        setAtsMode(parsed.atsMode ?? true);
        setAtsTheme(atsThemes.some((item) => item.id === parsed.atsTheme) ? parsed.atsTheme! : "standard");
        setSamplePreset(samplePresets.some((item) => item.id === parsed.samplePreset) ? parsed.samplePreset! : (parsed.data?.workExperiences?.length === 3 ? "extended" : "compact"));
        const availableIds: SectionId[] = [...sectionFields.map((section) => section.id), ...normalizedData.customSections.map((section) => section.id)];
        const validOrder = (parsed.sectionOrder || []).filter((id, index, values) => availableIds.includes(id) && values.indexOf(id) === index);
        const missingIds = availableIds.filter((id) => !validOrder.includes(id));
        setSectionOrder([...validOrder, ...missingIds]);
      } catch { /* keep the polished default */ }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    // Saving status mirrors the debounced browser-storage write below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(false);
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem("jianxu-resume-v4", JSON.stringify({ data, template, skillsMode, atsMode, atsTheme, sectionOrder, samplePreset }));
      setSaved(true);
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [data, template, skillsMode, atsMode, atsTheme, sectionOrder, samplePreset, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const serialized = JSON.stringify(workspaceSnapshot);
    if (!lastSnapshotRef.current) {
      lastSnapshotRef.current = serialized;
      return;
    }
    if (restoringHistoryRef.current) {
      restoringHistoryRef.current = false;
      lastSnapshotRef.current = serialized;
      return;
    }
    if (serialized === lastSnapshotRef.current) return;
    const timeout = window.setTimeout(() => {
      const previous = JSON.parse(lastSnapshotRef.current) as WorkspaceSnapshot;
      undoStackRef.current = [...undoStackRef.current.slice(-49), previous];
      redoStackRef.current = [];
      lastSnapshotRef.current = serialized;
      syncHistoryState();
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [workspaceSnapshot, hydrated]);

  useEffect(() => {
    const paper = measurePaperRef.current;
    const flow = measureFlowRef.current;
    if (!paper || !flow) return;
    const measurePages = () => {
      const styles = window.getComputedStyle(paper);
      const contentHeight = Math.max(1, 1123 - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom));
      const flowTop = flow.getBoundingClientRect().top;
      const elementBreakCandidates = Array.from(flow.querySelectorAll<HTMLElement>(".resume-section h3, .timeline-entry, .resume-section li, .body-copy, .education-section .entry-head"))
        .map((element) => Math.round(element.getBoundingClientRect().top - flowTop))
      const textLineBreakCandidates = Array.from(flow.querySelectorAll<HTMLElement>(".body-copy, .resume-section li")).flatMap((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return Array.from(range.getClientRects()).map((rect) => Math.round(rect.top - flowTop));
      });
      const breakCandidates = [...elementBreakCandidates, ...textLineBreakCandidates]
        .filter((offset, index, values) => offset > 0 && values.indexOf(offset) === index)
        .sort((a, b) => a - b);
      const sectionHeadings = Array.from(flow.querySelectorAll<HTMLElement>(".resume-section h3"))
        .map((element) => ({
          offset: Math.round(element.getBoundingClientRect().top - flowTop),
          height: element.getBoundingClientRect().height,
        }))
        .sort((a, b) => a.offset - b.offset);
      const offsets = [0];
      let pageStart = 0;
      while (pageStart + contentHeight < flow.scrollHeight - 1) {
        const target = pageStart + contentHeight;
        const earliestBalancedBreak = pageStart + contentHeight * 0.58;
        const safeBreak = breakCandidates.filter((offset) => offset >= earliestBalancedBreak && offset <= target - 8).at(-1);
        let nextStart = safeBreak && safeBreak > pageStart + 80 ? safeBreak : target;
        const lastHeading = sectionHeadings.filter((heading) => heading.offset >= pageStart && heading.offset < nextStart).at(-1);
        const leavesHeadingOrphaned = lastHeading && nextStart - (lastHeading.offset + lastHeading.height) < 24;
        if (leavesHeadingOrphaned && lastHeading.offset > pageStart + 80) nextStart = lastHeading.offset;
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
  const addSectionFromLibrary = (libraryKey: SectionLibraryKey) => {
    const meta = sectionLibrary.find((item) => item.key === libraryKey)!;
    // IDs are created only from this user-triggered event handler.
    // eslint-disable-next-line react-hooks/purity
    const id = `custom-${Date.now()}` as CustomSectionId;
    // eslint-disable-next-line react-hooks/purity
    const entries = meta.kind === "text" ? [] : [{ id: `entry-${Date.now()}`, title: "", subtitle: "", date: "", detail: "" }];
    setData((current) => ({ ...current, customSections: [...current.customSections, { id, title: meta.title, content: "", kind: meta.kind, libraryKey, entries }] }));
    setSectionOrder((current) => [...current, id]);
    setActiveSection(id);
    setShowSectionLibrary(false);
  };
  const updateCustomSection = (id: CustomSectionId, key: "title" | "content", value: string) => setData((current) => ({
    ...current,
    customSections: current.customSections.map((item) => item.id === id ? { ...item, [key]: value } : item),
  }));
  const updateStructuredEntry = (sectionId: CustomSectionId, entryId: string, key: Exclude<keyof StructuredEntry, "id">, value: string) => setData((current) => ({
    ...current,
    customSections: current.customSections.map((section) => section.id === sectionId ? {
      ...section,
      entries: section.entries.map((entry) => entry.id === entryId ? { ...entry, [key]: value } : entry),
    } : section),
  }));
  const addStructuredEntry = (sectionId: CustomSectionId) => setData((current) => ({
    ...current,
    customSections: current.customSections.map((section) => section.id === sectionId ? {
      ...section,
      entries: [...section.entries, { id: `entry-${Date.now()}`, title: "", subtitle: "", date: "", detail: "" }],
    } : section),
  }));
  const removeStructuredEntry = (sectionId: CustomSectionId, entryId: string) => setData((current) => ({
    ...current,
    customSections: current.customSections.map((section) => section.id === sectionId ? {
      ...section,
      entries: section.entries.filter((entry) => entry.id !== entryId),
    } : section),
  }));
  const removeCustomSection = (id: CustomSectionId) => {
    setData((current) => ({ ...current, customSections: current.customSections.filter((item) => item.id !== id) }));
    setSectionOrder((current) => current.filter((sectionId) => sectionId !== id));
    setActiveSection((current) => current === id ? "basic" : current);
  };
  const applySamplePreset = (preset: SamplePreset) => {
    const presetMeta = samplePresets.find((item) => item.id === preset)!;
    if (!window.confirm(`切换到“${presetMeta.label}”示例会替换当前内容。替换后仍可使用撤销恢复，是否继续？`)) return;
    checkpointHistory();
    const source = structuredClone(presetMeta.data);
    setData(source);
    setSamplePreset(preset);
    setSkillsMode("detailed");
    setTemplate(preset === "ai" ? "research" : preset === "campus" ? "jake" : preset === "senior" ? "compact" : preset === "product" ? "bandBlue" : "classic");
    setSectionOrder([...builtInSectionOrder, ...source.customSections.map((section) => section.id)]);
  };
  const currentTemplate = useMemo(() => templateMeta.find((item) => item.id === template)!, [template]);
  const visibleTemplates = useMemo(() => templateCategory === "all" ? templateMeta : templateMeta.filter((item) => item.category === templateCategory), [templateCategory]);
  const allSectionFields = useMemo(() => [
    ...sectionFields,
    ...data.customSections.map((section, index) => ({ id: section.id as SectionId, label: section.title.trim() || `自定义章节 ${index + 1}`, mark: "+" })),
  ], [data.customSections]);
  const activeCustomSection = data.customSections.find((section) => section.id === activeSection);
  const activeCustomMeta = activeCustomSection ? sectionLibrary.find((item) => item.key === activeCustomSection.libraryKey) || sectionLibrary[0] : null;
  const lines = (value: string) => value.split("\n").filter(Boolean);
  const downloadFile = (content: string, type: string, filename: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const safeFilename = (suffix: string) => `${(data.name || "未命名").replace(/[\\/:*?"<>|]/g, "_")}_${suffix}`;
  const exportBackup = () => {
    const backup = { format: "jianxu-resume-backup", version: 4, createdAt: new Date().toISOString(), workspace: createWorkspaceSnapshot() };
    downloadFile(JSON.stringify(backup, null, 2), "application/json;charset=utf-8", safeFilename("简历备份.json"));
    setShowDataOptions(false);
  };
  const importBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as { format?: string; workspace?: WorkspaceSnapshot } | WorkspaceSnapshot;
      let workspace: WorkspaceSnapshot | undefined;
      if ("workspace" in parsed) workspace = parsed.workspace;
      else workspace = parsed as WorkspaceSnapshot;
      if (!workspace?.data || !Array.isArray(workspace.sectionOrder)) throw new Error("invalid backup");
      checkpointHistory();
      const normalizedData = normalizeResumeData(workspace.data);
      const availableIds: SectionId[] = [...builtInSectionOrder, ...normalizedData.customSections.map((section) => section.id)];
      const validOrder = workspace.sectionOrder.filter((id, index, values) => availableIds.includes(id) && values.indexOf(id) === index);
      restoreWorkspace({ ...workspace, data: normalizedData, sectionOrder: [...validOrder, ...availableIds.filter((id) => !validOrder.includes(id))] });
      setShowDataOptions(false);
    } catch {
      window.alert("无法读取该备份文件。请确认文件由简序导出且内容完整。");
    }
  };
  const printPdf = (mode: ExportMode) => {
    const previousMode = atsMode;
    setShowExportOptions(false);
    setShowAtsValidation(false);
    setAtsMode(mode === "ats");
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => setAtsMode(previousMode), 100);
    }, 150);
  };
  const prepareAtsExport = () => {
    setShowExportOptions(false);
    setAtsMode(true);
    setShowAtsValidation(true);
  };
  const atsReport = useMemo(() => validateAtsResume(data, sectionOrder, skillsMode, pageMetrics.offsets.length), [data, sectionOrder, skillsMode, pageMetrics.offsets.length]);
  const downloadAtsText = () => downloadFile(buildAtsText(data, sectionOrder, skillsMode), "text/plain;charset=utf-8", safeFilename("ATS校验文本.txt"));
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

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  const editor = (
    <aside className={`editor-panel ${mobileView === "preview" ? "mobile-hidden" : ""}`}>
      <div className="editor-head">
        <div>
          <p className="eyebrow">内容编辑</p>
          <h2>{allSectionFields.find((item) => item.id === activeSection)?.label}</h2>
        </div>
        <span className={`save-state ${saved ? "is-saved" : ""}`}><i />{saved ? "已保存到本机" : "保存中"}</span>
      </div>
      <div className="editor-scroll">
        <div className="sample-switch" role="group" aria-label="切换示例内容">
          <span><b>岗位示例</b><small>切换前会确认，可通过撤销恢复</small></span>
          <label className="sample-select"><span className="sr-only">选择岗位示例</span><select value={samplePreset} onChange={(event) => applySamplePreset(event.target.value as SamplePreset)}>{samplePresets.map((preset) => <option value={preset.id} key={preset.id}>{preset.label} · {preset.note}</option>)}</select></label>
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
        {activeCustomSection && <div className="custom-section-editor">
          <div className="custom-section-editor-head"><div><span>{activeCustomSection.kind === "text" ? "自由文本章节" : "结构化章节"}</span><small>{activeCustomMeta?.note || "章节会进入排序、分页和 PDF 导出"}</small></div><button onClick={() => removeCustomSection(activeCustomSection.id)}>删除章节</button></div>
          <div className="form-grid">
            <Field label="章节标题" value={activeCustomSection.title} onChange={(v) => updateCustomSection(activeCustomSection.id, "title", v)} />
            {activeCustomSection.kind === "text" && <Field label="章节内容" value={activeCustomSection.content} onChange={(v) => updateCustomSection(activeCustomSection.id, "content", v)} multiline />}
          </div>
          {activeCustomSection.kind !== "text" && <div className="structured-entry-list">
            {activeCustomSection.entries.map((entry, index) => <section className="repeatable-card" key={entry.id}>
              <div className="repeatable-head"><div><span>{String(index + 1).padStart(2, "0")}</span><b>{entry.title || `${activeCustomSection.title}条目 ${index + 1}`}</b></div><button onClick={() => removeStructuredEntry(activeCustomSection.id, entry.id)}>删除</button></div>
              <div className="form-grid">
                <Field label={activeCustomMeta?.primaryLabel || "名称"} value={entry.title} onChange={(value) => updateStructuredEntry(activeCustomSection.id, entry.id, "title", value)} />
                <Field label={activeCustomMeta?.secondaryLabel || "补充信息"} value={entry.subtitle} onChange={(value) => updateStructuredEntry(activeCustomSection.id, entry.id, "subtitle", value)} />
                <Field label={activeCustomMeta?.dateLabel || "时间"} value={entry.date} onChange={(value) => updateStructuredEntry(activeCustomSection.id, entry.id, "date", value)} />
                <Field label={activeCustomMeta?.detailLabel || "详细内容"} value={entry.detail} onChange={(value) => updateStructuredEntry(activeCustomSection.id, entry.id, "detail", value)} multiline />
              </div>
            </section>)}
            <button className="add-entry-button" onClick={() => addStructuredEntry(activeCustomSection.id)}><span>＋</span>新增{activeCustomSection.title}条目</button>
          </div>}
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

  const customSection = (section: CustomSection) => (
    <section className="resume-section custom-resume-section">
      <h3>{section.title.trim() || "自定义章节"} <small>CUSTOM</small></h3>
      {section.kind === "text" && section.content.trim() && <Editable value={section.content} onChange={(value) => updateCustomSection(section.id, "content", value)} className="body-copy custom-section-copy" multiline />}
      {section.kind !== "text" && section.entries.map((entry, entryIndex) => <div className={`${entryIndex ? "entry-secondary " : ""}timeline-entry structured-resume-entry`} key={entry.id}>
        <div className="entry-head"><div><Editable value={entry.title} onChange={(value) => updateStructuredEntry(section.id, entry.id, "title", value)} className="entry-title" /><Editable value={entry.subtitle} onChange={(value) => updateStructuredEntry(section.id, entry.id, "subtitle", value)} className="entry-subtitle" /></div><Editable value={entry.date} onChange={(value) => updateStructuredEntry(section.id, entry.id, "date", value)} className="entry-date" /></div>
        {entry.detail.trim() && <ul>{lines(entry.detail).map((line, index) => <li key={`${entry.id}-${index}`}>{line}</li>)}</ul>}
      </div>)}
    </section>
  );

  const orderedSection = (id: SectionId, includeHeaderRule = true) => {
    if (id === "basic") return <div key={id} className="ordered-basic">{resumeHeader}{includeHeaderRule && <div className="accent-rule"><i /></div>}</div>;
    if (id === "summary") return <div key={id}>{summarySection}</div>;
    if (id === "experience") return <div key={id}>{experienceSection}</div>;
    if (id === "project") return <div key={id}>{projectSection}</div>;
    if (id === "education") return <div key={id}>{educationSection}</div>;
    if (id === "skills") return <div key={id}>{skillsSection}</div>;
    const section = data.customSections.find((item) => item.id === id);
    return section ? <div key={id}>{customSection(section)}</div> : null;
  };
  const renderOrderedSections = (ids = sectionOrder, includeHeaderRule = true) => ids.map((id) => orderedSection(id, includeHeaderRule));
  const leftColumnOrder = sectionOrder.filter((id) => ["basic", "summary", "skills", "education"].includes(id));
  const mainColumnOrder = sectionOrder.filter((id) => ["experience", "project"].includes(id) || id.startsWith("custom-"));
  const timelineMainOrder = sectionOrder.filter((id) => ["experience", "project"].includes(id) || id.startsWith("custom-"));
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
        <div className="document-name"><span className="document-dot" />{data.name || "未命名"}的简历 <small>{saved ? "已保存到本机" : "保存中…"}</small></div>
        <div className="top-actions">
          <div className="history-actions" aria-label="编辑历史">
            <button onClick={undo} disabled={!historyState.undo} aria-label="撤销" title="撤销（Ctrl/⌘ + Z）">↶</button>
            <button onClick={redo} disabled={!historyState.redo} aria-label="重做" title="重做（Ctrl/⌘ + Shift + Z）">↷</button>
          </div>
          <div className="export-menu-wrap">
            <button className="plain-button data-button" onClick={() => setShowDataOptions((value) => !value)} aria-expanded={showDataOptions}><span className="button-icon">▣</span>本机数据</button>
            {showDataOptions && <div className="export-menu data-menu" role="menu">
              <button onClick={exportBackup} role="menuitem"><i>备</i><span><b>导出简历备份</b><small>保存内容、模板、顺序与 ATS 设置</small></span></button>
              <button onClick={() => importFileRef.current?.click()} role="menuitem"><i>入</i><span><b>导入简历备份</b><small>从本机 JSON 文件完整恢复</small></span></button>
              <small className="local-data-note">内容仅保存在当前浏览器；建议重要修改后下载备份。</small>
            </div>}
            <input ref={importFileRef} className="sr-only" type="file" accept="application/json,.json" onChange={importBackup} aria-label="选择简历备份文件" />
          </div>
          <button className="plain-button" onClick={() => setShowTemplates(true)}><span className="button-icon">▦</span>选择模板</button>
          <button className="plain-button" onClick={() => setAtsMode((value) => !value)}><span className="button-icon">↗</span>{atsMode ? "查看原版" : "查看 ATS 版"}</button>
          <div className="export-menu-wrap">
            <button className="primary-button" onClick={() => setShowExportOptions((value) => !value)} aria-expanded={showExportOptions}><span>↓</span> 导出 PDF <b>⌄</b></button>
            {showExportOptions && <div className="export-menu" role="menu">
              <button onClick={() => printPdf("original")} role="menuitem"><i>原</i><span><b>导出原版 PDF</b><small>保留当前模板、颜色与视觉布局</small></span></button>
              <button onClick={prepareAtsExport} role="menuitem"><i>ATS</i><span><b>验证并导出 ATS PDF</b><small>先检查字段、阅读顺序和规范化文本</small></span></button>
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
            const section = allSectionFields.find((item) => item.id === sectionId);
            if (!section) return null;
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
          <button className="add-custom-section" onClick={() => setShowSectionLibrary(true)}><span>＋</span>添加章节</button>
          <div className="nav-bottom"><button onClick={() => applySamplePreset(samplePreset)}>↺ <span>恢复当前示例</span></button></div>
        </nav>

        {editor}

        <section className={`preview-panel ${mobileView === "edit" ? "mobile-hidden" : ""}`}>
          <div className="preview-toolbar">
            <div className="preview-meta"><div className="template-chip"><i style={{ background: currentTemplate.color }} />{currentTemplate.name}<span>{currentTemplate.note}</span></div><small>A4 · 自动 {pageMetrics.offsets.length} 页</small></div>
            <div className="ats-toolbar">
              <button className="ats-check-button" onClick={() => setShowAtsValidation(true)}>✓ ATS 检查</button>
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
              {pageMetrics.offsets.map((pageOffset, pageIndex) => {
                const nextPageOffset = pageMetrics.offsets[pageIndex + 1];
                const pageContentHeight = nextPageOffset ? Math.min(pageMetrics.contentHeight, Math.max(1, nextPageOffset - pageOffset - 1)) : pageMetrics.contentHeight;
                return <div className="resume-page-shell" key={`resume-page-${pageIndex}`}>
                  <article className={`resume-paper resume-page template-${template} ${atsMode ? `ats-strict ats-theme-${atsTheme}` : ""}`} aria-label={`简历第 ${pageIndex + 1} 页，共 ${pageMetrics.offsets.length} 页`}>
                    <div className="resume-page-viewport" style={{ height: `${pageContentHeight}px` }}>
                      <div className="resume-flow-content" style={{ transform: `translateY(-${pageOffset}px)` }}>{renderResumeBody()}</div>
                    </div>
                    <span className="page-number" aria-hidden="true">{pageIndex + 1} / {pageMetrics.offsets.length}</span>
                  </article>
                </div>;
              })}
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
      {showSectionLibrary && <div className="modal-backdrop" onMouseDown={() => setShowSectionLibrary(false)}>
        <section className="section-library-modal" role="dialog" aria-modal="true" aria-label="添加简历章节" onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-head"><div><p className="eyebrow">结构化章节库</p><h2>添加适合你的专业章节</h2><span>结构化章节支持多条记录、时间、角色与成果，并兼容所有模板和 ATS 导出。</span></div><button onClick={() => setShowSectionLibrary(false)} aria-label="关闭">×</button></div>
          <div className="section-library-grid">{sectionLibrary.map((item) => <button key={item.key} onClick={() => addSectionFromLibrary(item.key)}><span>{item.kind === "text" ? "文" : item.kind === "timeline" ? "时" : "列"}</span><div><b>{item.title}</b><small>{item.note}</small></div><i>＋</i></button>)}</div>
        </section>
      </div>}
      {showAtsValidation && <div className="modal-backdrop" onMouseDown={() => setShowAtsValidation(false)}>
        <section className="ats-validation-modal" role="dialog" aria-modal="true" aria-label="ATS 导出验证" onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-head"><div><p className="eyebrow">ATS EXPORT CHECK</p><h2>导出前兼容性检查</h2><span>检查规范化文本、字段完整性和标准阅读顺序；结果用于降低解析风险，不代表任何招聘系统的录取结论。</span></div><button onClick={() => setShowAtsValidation(false)} aria-label="关闭">×</button></div>
          <div className="ats-score-row"><div className={`ats-score ${atsReport.passed ? "is-pass" : "has-fail"}`}><strong>{atsReport.score}</strong><span>兼容性检查分</span></div><div><b>{atsReport.passed ? "可以导出 ATS 版本" : "建议先修复必填问题"}</b><p>当前规范化文本约 {atsReport.atsText.length} 字符 · {pageMetrics.offsets.length} 页</p></div></div>
          <div className="ats-check-list">{atsReport.checks.map((check) => <div key={check.id} className={`ats-check-item status-${check.status}`}><span>{check.status === "pass" ? "✓" : check.status === "warn" ? "!" : "×"}</span><div><b>{check.label}</b><small>{check.detail}</small></div></div>)}</div>
          <details className="ats-text-preview"><summary>查看 ATS 规范化文本</summary><pre>{atsReport.atsText}</pre></details>
          <div className="modal-actions"><button onClick={downloadAtsText}>下载校验文本</button><button className="primary-button" onClick={() => printPdf("ats")} disabled={!atsReport.passed}>继续导出 ATS PDF</button></div>
        </section>
      </div>}
    </main>
  );
}
