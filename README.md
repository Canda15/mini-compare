# mini-compare

一个基于 Tauri + React + Rust 的桌面文本对比工具，专注于轻量、快速和直观的双栏差异查看体验。

## 功能特性

- 双栏文本输入（带行号）
- 行级对比 + 字符级高亮
- 左右滚动联动（输入区和对比区均支持）
- 快速输入时的防抖与防竞态更新
- 跨平台桌面运行（macOS / Windows / Linux）

## 技术栈

- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Rust + Tauri 2
- Diff Engine: `similar`

## 环境要求

- Node.js 18+
- pnpm 8+
- Rust stable（含 Cargo）
- Tauri 2 运行依赖（按你的操作系统安装）

## 本地开发

```bash
pnpm install
pnpm tauri dev
```

## 构建发布

前端构建：

```bash
pnpm build
```

桌面应用打包：

```bash
pnpm tauri build
```

## 项目结构

```text
src/            React 前端
src-tauri/      Tauri + Rust 后端
```

## 规划中的能力

- 文件导入与文件对比
- 文件夹级对比
- 更多差异视图模式（例如只看变更）

## 许可证

本项目采用 [MIT License](./LICENSE)。
