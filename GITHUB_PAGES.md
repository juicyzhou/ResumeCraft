# GitHub Pages 部署说明

本项目保留原有的 Sites / Vinext 构建，同时新增纯静态的 GitHub Pages 构建。

## 自动部署

推送 `main` 分支后，`.github/workflows/deploy-pages.yml` 会：

1. 使用 Node.js 22 安装依赖；
2. 执行 `npm run build:pages`；
3. 将 `gh-pages-dist` 发布到 GitHub Pages。

首次发布前，请在 GitHub 仓库的 **Settings → Pages → Build and deployment**
中将 Source 设为 **GitHub Actions**。

目标地址通常为：

`https://juicyzhou.github.io/ResumeCraft/`

## 本地验证

```bash
npm run build:pages
npm run preview:pages
```

静态版本仍使用浏览器 `localStorage` 保存简历，不会把简历内容上传到 GitHub，
不同用户之间也不会互相看到编辑内容。

## 回滚

静态化改造前的稳定版本：

- 提交：`8095a2b`
- 标签：`pre-github-pages-static-20260716`

如需从稳定版本创建修复分支：

```bash
git switch -c rollback/pre-github-pages-static pre-github-pages-static-20260716
```
