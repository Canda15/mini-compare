# mini-compare 发版清单

适用于当前项目（Tauri + React + Rust）的标准发版流程。

## 1. 发版前准备

1. 确认工作区干净：

```bash
git status --short
```

2. 确认发版版本号（例如 `0.1.0` -> `0.1.1` / `0.2.0` / `1.0.0`）。
3. 确认本次发布说明范围（修复、功能、破坏性变更）。

## 2. 版本号与元数据

1. 更新前端版本：
   - `package.json` 的 `version`
2. 更新 Rust/Tauri 版本：
   - `src-tauri/Cargo.toml` 的 `version`
   - `src-tauri/tauri.conf.json` 的 `version`
3. 保持许可证信息正确：
   - `LICENSE` 为 MIT
   - `package.json` 的 `license` 为 `MIT`
   - `src-tauri/Cargo.toml` 的 `license` 为 `MIT`

## 3. 质量校验

1. 依赖安装：

```bash
pnpm install
```

2. 前端构建校验：

```bash
pnpm build
```

3. Rust 编译校验：

```bash
cargo check --manifest-path src-tauri/Cargo.toml
```

4. 手工验证关键场景：
   - 上方输入区长文本时，下方对比区仍可见
   - 上方左右输入框滚动联动
   - 下方左右 diff 列滚动联动
   - 文本包含 `< > &` 时按普通字符显示
   - 快速输入时 diff 不出现明显错位/旧结果覆盖

## 4. 打包产物

1. 构建桌面安装包：

```bash
pnpm tauri build
```

2. 检查产物目录：
   - `src-tauri/target/release/bundle/`
3. 抽样安装并启动验证（至少在当前开发机验证一次）。

## 5. 提交与打标签

1. 提交发版变更：

```bash
git add .
git commit -m "chore(release): vX.Y.Z"
```

2. 创建并推送 tag：

```bash
git tag vX.Y.Z
git push origin HEAD
git push origin vX.Y.Z
```

## 6. 发布说明模板（可直接复制）

```text
## mini-compare vX.Y.Z

### Highlights
- ...

### Fixes
- ...

### Improvements
- ...

### Notes
- License: MIT
- Platform: macOS / Windows / Linux
```

## 7. 发布后检查

1. 从 Release 页面下载产物并验证可用。
2. 检查版本号展示是否正确（应用信息/安装包信息）。
3. 记录发现的问题并纳入下个里程碑。
