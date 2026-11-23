# Condenser next-bytemd 开发计划（bytemd 编辑器引入）

- 日期：2026-11-24（同日修订：吸收计划评审意见，功能点升格为 PR）
- 关联：基线 `next` 分支 @ `b7928961`；集成分支 `next-bytemd`
- 状态：执行中（进度见 `.cursor/bytemd-editor-status.md`）
- 说明：本文定义工程范围、目标架构与功能点拆分；每个功能点的实现过程记录在对应的 PR 中。

## 0. 结论先行

1. **需求可全部满足，但"预览与发布页一致"的前提是把阅读端渲染内核也切到 bytemd**（markdown-it 与 remark 两套管线的渲染差异实测）。本轮范围 = 阅读端渲染内核迁移 + 发文/评论编辑器替换，共 11 个受审功能点（FP1–FP11）+ 1 个不占 FP 编号的步骤 0（基线与文档）。
2. **1:1 的实现机制是"两端共用同一份配置"**：`lib/markdown/config.ts` 是唯一配置源；编辑器用 bytemd 内置预览（不用 `overridePreview`），阅读端用同一份配置经同一个 `getProcessor` 渲染；由渲染一致性测试与 ESLint 导入限制防止漂移（§3.1）。
3. **"评论默认不开预览"零定制；"发文默认开预览"需要包装层自算分屏阈值**。bytemd 的 `mode="tab"` 默认停在写作页；但提交页中栏在 1280/1366 视口下只有 688/774px，低于 bytemd `auto` 的 800px 阈值，按默认值发文编辑器在主流笔记本上**没有预览**——因此由 `MarkdownEditor` 按容器宽度自行决定 `split`/`tab`（阈值 600px，§9-C5）。
4. **存量兼容有一批必须移植的 Steemit 语义**（#tag/@mention、视频嵌入识别与白名单、图片代理、链接加固与钓鱼拦截、raw-HTML 帖、`center`/`pull-right` 等），分布在 FP1–FP3；安全基线按 legacy 的 11 个分区、69 条用例逐分区重建（§4-FP2）。
5. **技术评审实测出一个必须在 FP1 解决的安全回归**：新管线对病态输入不是线性的（64KiB 的 `<b>`×21800：legacy 0.17 秒，新管线 22.1 秒；`> `×32768：6.9 秒；5 万层嵌套：约 28 秒），而帖子页正文在访问者浏览器里渲染。处置 = 解析前的线性前置守卫 + 提交侧拒绝（§3.3、FP1、FP4）。
6. **相对初版的结构性调整**：FP 顺序改为「阅读端亮色 → 正文暗色 → YouTube → 发文编辑器 → 评论编辑器 → 编辑器暗色」（初版把暗色排在编辑器之前，验收无法进行）；阅读端改为经 `renderMarkdown()` 自行渲染（出货路径即被测路径）；回滚开关改为 context 传递；每个 FP 升格为远端 PR。

## 1. 目标与非目标

### 1.1 需求拆解

| # | 需求 | 落地方式 | 对应 FP |
|---|---|---|---|
| R1 | 发新文章的编辑框用 bytemd 替换 | `MarkdownEditor` 替换 `PostEditor` 的正文 textarea，外围表单不动 | FP8 |
| R2 | 发评论的编辑框用 bytemd 替换 | 同一组件；评论回复与评论编辑共用 | FP9 |
| R3 | 评论编辑器默认不开启预览 | `mode="tab"`（默认写作页） | FP9 |
| R4 | 发文编辑器默认开启预览 | 包装层按容器宽度选 `split`（≥600px）否则 `tab` | FP8 |
| R5 | 预览效果 = 发文后页面渲染效果 | 阅读端内核切 bytemd + 单一配置源 + 一致性守卫 | FP1–FP7 |
| R6 | 每个功能点：独立分支与 PR（base `next-bytemd`），经三路评审（规格与正确性 / 安全 / 工程一致性）与门禁后 squash 合入 | 见各 PR 与状态文件 | 全部 |

### 1.2 非目标（本轮不做，列入后续）

- math / highlight / mermaid 插件、medium-zoom
- 自定义语法扩展（如 `:::player`；另经可行性验证）
- `lib/extract-content.ts`（摘要卡片首图/摘要文本）迁移——继续使用 legacy 模块
- legacy 渲染管线（`lib/html-ready.ts`、`lib/sanitize-config.ts` 的 sanitize-html 部分、`markdown-it` 依赖）的移除——保留为回滚路径，生产验证后另立计划清理
- 把 `next-bytemd` 合并进 `next`/`master`

## 2. 对前期调研与初版计划的修正（2026-11-24 验证）

| # | 原说法 | 验证结果 | 对计划的影响 |
|---|---|---|---|
| S1 | 调研未涉及 GFM tagfilter 对内联 `<iframe>` 的影响 | **不是问题**：`micromark-extension-gfm@2.0.3` 的 tagfilter 只在"直出 HTML"扩展里，remark 管线不启用；内联 iframe 在 schema 放行后完整保留 | 无需绕开 |
| S2 | 调研未涉及 GFM 方言差异 | stock gfm：单波浪线 `~5~` 加删除线；`www.x.com`、`me@steemit.com` 被自动加链接（来自 `mdast-util-gfm` 聚合内的 autolink transform）。legacy（markdown-it `linkify:false` + `linksAny`，只处理 `https?://`）两者都不做 | 自定义 GFM 组合对齐 legacy（§3.4-B） |
| S3 | 初版：class 白名单需在 sanitize 之后做策略 | bytemd 先把 `className` 推进 `attributes['*']`，**再**调用 `sanitize` 回调（`bytemd/dist/index.mjs` L2526–2529）；可在 schema 内移除通配放行并用**单条** `['className', …]` 定义逐 class 过滤（多条并列只有最后一条生效） | class 策略落在 schema |
| S4 | 调研：自研 rehype 插件在 sanitize 之后 | 确认。remark 阶段生成的 `link` 与带 `data.hName` 的自定义节点会正常经过 sanitize；rehype 阶段给 `a` 加的 target/rel/title/class 不会被剥 | 链接化/嵌入放 remark 阶段，加固放 rehype 阶段 |
| S5 | 调研：原始 HTML 帖需组件层特判 | 置于首位的 remark 插件可复刻：命中 `^<html>…</html>$`（去壳）或 `^<p>…` 时把树替换为单个 html 节点，不做 markdown 解析 | 作为共享插件，预览与阅读端同路径 |
| S6 | 调研未说明 tab 默认页 | 非 split 时 `activeTab === "preview"` 才显示预览，否则显示写作页；初始 `activeTab` 为 undefined → 默认写作页（L3469–3489） | R3 零定制 |
| S7 | 调研只提了 remark-directive 的版本约束 | bytemd 1.22.0 = unified 10 家族；`mdast-util-gfm-*` 必须用 **1.x**，且三个 mdast 扩展以**对象**形态注册（不是工厂函数）；装成 2.x 时表格解析抛 `Cannot set properties of undefined (setting 'inTable')` | FP1 加版本家族守卫测试 |
| S8 | 调研：bytemd 无 CSS 变量 | 确认（`.bytemd` 等均为硬编码亮色；无运行时 `<style>` 注入；预览区规则 `.bytemd-preview .markdown-body{max-width:800px;margin:0 auto;padding:16px 4%}`） | 编辑器暗色需手写覆盖（FP10） |
| S9 | 调研的体积实验放在临时目录 | 已被系统临时文件清理部分删除，不可复现 | 开发期验证一律以入库的测试/脚本为准；FP5 记录 Turbopack 实际产物体积 |
| S10 | 调研：React 版 Viewer 仅提及 viewerEffect | 纯 React 包装（`useMemo` 调 `getProcessor(...).processSync(value)`，`try/catch` 失败回退空串），根节点 `div.markdown-body`，命名导出 `Editor`/`Viewer` | 阅读端不依赖它：改为经 `renderMarkdown()` 自行渲染 |
| S11 | 初版未覆盖 legacy 安全测试全貌 | `__tests__/lib/sanitize-pipeline.test.ts` 共 11 个分区、69 条；其中钓鱼判定存在 legacy 已知缺陷（`steemit.com.evil.com` 按前缀匹配被当作内链，测试 6.3、6.4 以"钉死现状"方式固定） | FP2 逐一迁移；钓鱼与内链改精确主机匹配（§3.4-A D10） |
| S12 | 初版未说明处理器抛错时的行为 | React Viewer 抛错时渲染空串；**Svelte Viewer（编辑器预览）首次抛错显示字面量 `undefined`，之后保留旧内容**（`bytemd/dist/index.mjs` L2638–2644） | 阅读端 `renderMarkdown` 自带 try/catch；预览侧靠前置守卫避免抛错 |
| S13 | 初版未考虑 bytemd 预览的输出形态 | Svelte Viewer 在 HTML 末尾追加渲染计数注释 `<!--N-->`（L2646–2649） | 1:1 契约的定义与断言需剥离该注释（§3.1） |
| S14 | 初版：github-markdown-css 可提取"变量块"做暗色 | `github-markdown-css@5.9.0` 的亮/暗两个文件里**没有任何自定义属性**，颜色是规则内字面量 | 暗色改为"把 dark 文件全部选择器加 `.dark ` 前缀后入库"（FP6） |
| S15 | 初版：未处理 sanitize 的全局属性表 | hast-util-sanitize 默认 schema 的 `'*'` 含约 70 个全局属性（`id`、`name`、`rel`、`target`、`title`、`type`、`value`…）；不收敛则作者可给链接带 `rel="opener"`、`href="/\evil.com"` 会被当作内链 | schema 把 `'*'` 收敛为站点白名单；链接属性由 `harden` 从零重建（FP1、FP2） |
| S16 | 调研与初版：注释与深嵌套"线性解析，无需缓解" | **不成立**：见 §0-5 的实测耗时；异常在 rehype-raw 或 micromark parse 阶段就发生，早于任何插件 | 解析前线性前置守卫（FP1）+ 提交侧拒绝（FP4） |
| S17 | 调研与初版多处写 "CodeMirror 6" | bytemd 1.22.0 用的是 **CodeMirror 5**（`codemirror-ssr@0.65.0`）；Tab 键被编辑器捕获为缩进（L3242–3245），键盘用户无法用 Tab 离开编辑器 | FP8 处理 Tab 键；FP9 的 IME 人工验收权重提高 |
| S18 | 初版：bytemd `mode="auto"` 可满足"发文默认开预览" | 提交页中栏宽度 = min(视口 − 560, 896) − 32：视口 1280 → 688px、1366 → 774px，均小于 bytemd `auto` 的 800px 阈值 → 默认无预览 | 包装层自算阈值（FP8、§9-C5） |
| S19 | 初版假设步骤 0 从零开始 | 步骤 0 的分支、worktree、安装、基线、远端分支在技术评审期间已完成 | 步骤 0 改写为"现状 + 剩余事项" |

## 3. 总体架构（目标态）

### 3.1 "1:1 契约"的定义、机制与守卫

**定义**：对任意同一份 markdown 文本 M，在下列参数下，编辑器预览面板 `.markdown-body` 的 innerHTML **剥离末尾的渲染计数注释 `<!--N-->` 后**，与发布后页面 `MarkdownViewer` 输出的 `.markdown-body` HTML **逐字节相同**，且两侧套用同一份 `.markdown-body` 样式表。

参数约定（预览侧用常量，阅读侧由调用点决定）：

| 场景 | 预览侧参数 | 阅读侧实际参数 | 一致性 |
|---|---|---|---|
| 发文（`PostFull` 传入 `large`、`highQualityPost = payout > 10.0`、`noImage = stats.gray`） | `STORY_PLUGINS = createSitePlugins({ large: true, highQualityPost: false })` | 新帖 payout 为 0 → `highQualityPost=false` | 逐字节相同 |
| 评论（`Comment.tsx` 不传选项，取默认 `large=false`、`highQualityPost=true`） | `COMMENT_PLUGINS = createSitePlugins({ large: false, highQualityPost: true })` | 同左 | 逐字节相同 |

**允许存在的差异**（均为阅读期上下文，非内容）：

- ① 帖子 payout > 10.0 时外链 `rel` 不含 `nofollow`（不可见）；
- ② 低评分帖的 `noImage`、以及 `hideImages`/`isProxifyImages`（当前仓库无调用点传入后两者，属保留能力）；
- ③ 预览侧末尾的 `<!--N-->` 计数注释（定义中已剥离）。

**机制**（靠同源而非对齐两套实现）：

- 单一配置源 `lib/markdown/config.ts`：导出 `createSitePlugins(options)`、`siteSanitize(schema)`、`STORY_PLUGINS`、`COMMENT_PLUGINS`；
- 编辑器：`<Editor plugins={…PLUGINS} sanitize={siteSanitize} …>`，使用 bytemd **内置预览**（Editor 内部实例化 bytemd 的 Svelte Viewer，传入同一组 plugins/sanitize，`index.mjs` L2677–2696）；
- 阅读端：`MarkdownViewer` 调 `renderMarkdown(text, options)`——内部是与 Viewer 完全相同的 `getProcessor({ plugins, sanitize }).processSync(body)`——产出 HTML 与元信息，并以与 `@bytemd/react` Viewer 相同的方式分发 `viewerEffect`。选它而非直接用 `<Viewer>` 的原因：出货路径即被测路径（安全基线全部测在 `renderMarkdown` 上）、单次渲染即可拿到 `isHtml`/`noImageActive`、可承载前置守卫与异常降级。

**守卫**（FP5 落地）：

1. 渲染一致性测试 `__tests__/lib/markdown/parity.test.ts`：对固定语料，分别用 bytemd 的 Svelte `Viewer`（Editor 预览所用组件）与 `MarkdownViewer` 渲染，剥离 `<!--N-->` 后断言 innerHTML 相等；语料须覆盖：标题/段落/列表/表格/代码块、任务列表、删除线、`#tag`/`@mention`、裸 URL、图片、raw HTML（`center`、`pull-right`、内联 iframe）、五家视频嵌入、raw-HTML 帖、钓鱼链接、外链与内链；
2. ESLint：`no-restricted-imports` 规定 `bytemd`、`@bytemd/*`、`remark-*`、`rehype-*`、`mdast-util-*`、`micromark-extension-*`、`hast-util-*` 只允许在 `lib/markdown/**`、`components/elements/MarkdownViewer.tsx`、`components/elements/MarkdownEditor.tsx`、`__tests__/lib/markdown/**`、`scripts/compare-markdown-engines.ts` 中导入；`no-restricted-syntax` 禁止 JSX 属性 `overridePreview`；
3. 配置对象引用稳定：plugins/sanitize/locale 必须是模块级常量或 `useMemo`（bytemd 在 plugins 引用变化时重跑 effect 并重建 processor）。

### 3.2 模块布局

```
lib/markdown/                      # 新增：唯一允许接触 bytemd / unified 生态的目录
  config.ts        createSitePlugins(options) / siteSanitize / STORY_PLUGINS / COMMENT_PLUGINS
  schema.ts        siteSanitize：github 默认 schema + 站点收敛与扩展；导出 schema 快照锚点
  gfm.ts           remarkSiteGfm：strikethrough(singleTilde:false) + table + task-list；无 autolink、无 footnote
  gfm-actions.ts   工具栏按钮（删除线/任务列表/表格），移植自 @bytemd/plugin-gfm（MIT，文件头保留版权声明）— FP8
  raw-html-post.ts remarkRawHtmlPosts：raw-HTML 帖识别（同 legacy 正则）
  pathology.ts     isPathological(body)：解析前的线性前置守卫
  linkify.ts       remark 阶段：#tag / @mention / 裸 URL / 裸图片 URL / 裸视频 URL → 链接与嵌入节点；带 collector
  harden.ts        rehype 阶段（sanitize 之后）：链接属性重建、钓鱼拦截、图片处理、iframe 白名单、3Speak 图文组合、td.style 过滤、script 陷阱
  embed.ts         YouTube 轻量预览占位 + viewerEffect — FP7
  render.ts        renderMarkdown(body, options) → { html, isHtml, noImageActive, file }
  analyze.ts       analyzePost(body) → { disallowedTags, hashtags, usertags, images, links, pathological } — FP4
  engine.ts        MarkdownEngine context：'bytemd' | 'legacy' — FP5
  locales.ts       condenser locale → bytemd locale 懒加载 — FP8
components/elements/
  MarkdownViewer.tsx        阅读端（保留现有 props 与 4 处调用点签名）
  MarkdownViewerLegacy.tsx  现 MarkdownViewer 实现原样迁入（回滚路径）— FP5
  MarkdownEditor.tsx        bytemd Editor 包装（唯一导入 @bytemd/react 的模块）— FP8
__tests__/lib/markdown/      与上述模块一一对应
scripts/compare-markdown-engines.ts   legacy 管线 vs 新管线的语料对比 — FP5
scripts/build-markdown-theme.mjs      生成 `.dark ` 前缀的正文暗色样式 — FP6
```

依赖归属：FP1 加 `bytemd@1.22.0`、`@bytemd/plugin-breaks@1.22.0`、`mdast-util-gfm-{strikethrough,table,task-list-item}@^1`、`micromark-extension-gfm-{strikethrough,table,task-list-item}@^1`、`hast-util-raw`、`hast-util-sanitize`（与 bytemd 所用同版）及所需 `@types/*`；FP5 加 `github-markdown-css@5.9.0`（精确）；FP8 加 `@bytemd/react@1.22.0`。`lib/html-ready.ts`、`lib/sanitize-config.ts`、`lib/media/links.ts`、`lib/media/proxify-url.ts`、`lib/phishing.ts` 保持原样：前两者服务回滚路径与 `extract-content`；后三者（正则、图片代理、钓鱼判定）被新管线**直接复用**，不复制。

版本家族表（新增任何 unified 生态包时对照；FP1 的守卫测试固化）：

| 包 | 家族 | 说明 |
|---|---|---|
| `unified` | 10.x | bytemd 1.22.0 所依赖 |
| `remark-parse` / `remark-rehype` / `rehype-raw` / `rehype-sanitize` / `rehype-stringify` | 10 / 10 / 6 / 5 / 9 | bytemd 直接依赖 |
| `mdast-util-from-markdown` | 1.x | remark-parse 所依赖 |
| `mdast-util-gfm-*`、`micromark-extension-gfm-*` | 1.x | 本计划直接依赖（2.x 属 unified 11 家族，不可用） |
| `hast-util-sanitize`、`hast-util-raw` | 4.x / 7.x | 与 rehype-sanitize / rehype-raw 的依赖一致 |

### 3.3 管线阶段与 legacy 语义对照

新管线 = bytemd `getProcessor` 的固定顺序（`bytemd/dist/index.mjs` L2514–2537）：**remark 插件 → remark-rehype(allowDangerousHtml) → rehype-raw → rehype-sanitize(schema) → 插件的 rehype 钩子 → stringify**。`renderMarkdown` 在其前后各加一层：前置 `isPathological` 守卫、后置无（script 陷阱已在管线末端以结构检查完成）；整体包在 try/catch 中，任何异常 → 空串 + `console.error`。

| 阶段 | legacy 实现 | 新实现 | 位置 |
|---|---|---|---|
| 病态输入防护 | 无（靠 `html-ready.ts:135-145` 的 catch 降级，耗时可达秒级） | `pathology.ts`：线性扫描源文本，超限直接返回空 | 解析前 |
| raw-HTML 帖识别与去壳 | `MarkdownViewer.tsx:71-77`、`PostEditor.tsx:284-290` | `raw-html-post.ts`（同一对正则） | remark，首位 |
| HTML 注释 | `MarkdownViewer.tsx:80` 渲染前全文替换为可读文本 | 完整注释由 sanitize 丢弃；未闭合注释按转义文本显示 | sanitize |
| markdown 方言 | markdown-it（html、breaks）`MarkdownViewer.tsx:29-35` | remark-parse + `@bytemd/plugin-breaks` + `gfm.ts` | remark |
| #tag / @mention / 裸 URL / 裸图片链接化 | `html-ready.ts:297-384` | `linkify.ts`（父节点为 link/inlineCode/code 时跳过） | remark（产物过 sanitize） |
| 视频嵌入识别 | `html-ready.ts:400-640` | `linkify.ts` → `div.videoWrapper > iframe`（FP7 起 YouTube 为轻量占位） | remark |
| 3Speak dApp 的图文组合 | `html-ready.ts:148-152, 473-508` | `harden.ts`：识别 `a[href*=3speak.online/watch?v=] > img` 结构（mdast 中该组合可能被拆成多个节点，须在 hast 上匹配） | rehype |
| 链接属性重建与钓鱼拦截 | `html-ready.ts:170-195`、`sanitize-config.ts:246-274` | `harden.ts`：丢弃作者提供的全部链接属性后按策略重建；主机精确匹配 | rehype |
| iframe 包裹 videoWrapper | `html-ready.ts:198-218` | `harden.ts` | rehype |
| 图片 https 归一、包可点击链接、代理、srcset | `html-ready.ts:220-272`、`sanitize-config.ts:202-216` | `harden.ts` | rehype |
| 标签/属性/协议白名单 | `sanitize-config.ts:102-177` | `schema.ts`（rehype-sanitize；`'*'` 收敛、className 收敛、协议对齐 legacy） | sanitize |
| iframe 白名单与归一化、非法占位 | `sanitize-config.ts:37-77, 179-201` | `harden.ts`（复用 `iframeWhitelist`） | rehype |
| div class 白名单 | `sanitize-config.ts:217-238` | `schema.ts`（单条 `['className', …]` 定义） | sanitize |
| td style | `sanitize-config.ts:239-245` | `harden.ts`（仅保留 `text-align:right`） | rehype |
| `<script>` 二级陷阱 | `MarkdownViewer.tsx:105-108`（对输出字符串正则） | `harden.ts` 末端结构检查（存在 script 元素 → 整体置空并 console.error） | rehype，末位 |
| 异常降级 | `html-ready.ts:135-145` | `render.ts` try/catch → 空串 | 外层 |
| `~~~ embed:` 占位切片 → 播放器 | `MarkdownViewer.tsx:120-189` | 无文本占位符；YouTube 轻量预览由 `embed.ts` 的 viewerEffect 挂载 | FP7 |

`isPathological` 的判定项与阈值（FP1 以基准测试定稿并固化为常量）：单行连续 `>` 引用标记数、HTML 标签嵌套深度（按标签 token 做栈扫描的线性估计）、列表缩进层级。任何一项超限即判为病态。

### 3.4 行为差异清单

**A. 相对现状（legacy）的有意差异**

| # | 差异 | 性质 |
|---|---|---|
| D1 | HTML 注释：由"替换为可读文本、未闭合则截断到末尾"变为"完整注释移除、未闭合注释按转义文本显示" | 简化；安全等价（两种形态下注释内载荷都不成立） |
| D2 | 删除线 `~~x~~` 正常渲染（现状 `<s>` 被 sanitize 剥掉） | 修复 |
| D3 | 新增任务列表语法 | 增强 |
| D4 | 允许标签集按 github schema 扩大（span/details/summary/kbd/mark/small/ins/dl 等），保留 `center` 与 `iframe`；`<img>` 的 width/height/align/title 生效 | 放宽；最终清单以 FP2 入库的标签与属性快照为准 |
| D5 | div 的 class 过滤由"整体精确匹配"变为"逐 class 过滤" | 略宽松，安全等价 |
| D6 | 钓鱼与内链判定改为**精确主机匹配**（修复 `steemit.com.evil.com` 被前缀匹配当作内链的 legacy 缺陷） | 安全修复 |
| D7 | 裸图片 URL：legacy 会把所在文本节点整体替换成图片（周围文字丢失；同段两个裸图片 URL 时整帖渲染为空），新实现只替换 URL 本身 | 修复 |
| D8 | 正文排版由 `.Markdown*`（globals.css:143-385）换为 github-markdown-css 的 `.markdown-body` | **视觉改版**（"向 bytemd 预览对齐"的直接结果） |
| D9 | 病态输入（超深嵌套、超长引用链）直接不渲染 | 防护；legacy 是"卡顿数秒后降级为空" |
| D10 | HTML 中不再出现 `~~~ embed:` 文本占位符 | 内部实现变化 |

**B. 相对 stock bytemd 的取舍（均为与 legacy 对齐）**

| # | 取舍 |
|---|---|
| B1 | 不启用自动链接字面量（裸域名、邮箱保持纯文本） |
| B2 | 不启用单波浪线删除线 |
| B3 | 不启用 footnote |
| B4 | 链接协议只认 `http`/`https`/`steem`/`esteem`（默认 schema 另放行 mailto/xmpp/irc/ircs） |
| B5 | 全局属性表 `'*'` 收敛为站点白名单（默认约 70 项） |

FP5 的对比脚本把每条差异归到上表编号；无法归类的差异必须在 FP5 合并前逐条裁定。

### 3.5 回滚开关 `MARKDOWN_ENGINE`

- 取值 `bytemd`（默认）| `legacy`。根 layout（服务端）读 `process.env.MARKDOWN_ENGINE`，经 React context 传给客户端（`MarkdownEngineProvider`），`MarkdownViewer` 通过 `useMarkdownEngine()` 读取——SSR 与水合取值天然一致，不使用 `window` 全局量。
- `legacy` 时渲染 `MarkdownViewerLegacy`（`next/dynamic` 懒加载现实现；Client Component 中 `next/dynamic` 默认仍做 SSR，legacy 路径不丢服务端渲染）。
- 回滚模式下阅读端为 legacy、编辑器预览仍为 bytemd，二者不一致——应急回滚的已知代价，写入 `docs/CONFIGURATION.md`。
- 生命周期：本轮保留；生产验证后的移除另立计划。

### 3.6 样式

- `app/globals.css` 仍是唯一样式表入口：`@import` github-markdown-css 亮色文件（FP5）与生成的暗色文件（FP6）。
- 站点对正文的补充规则（`videoWrapper`、`youtube`/`play`、`phishy`、`pull-*`/`text-*`、评论小字号）的选择器**扩展**为 `:is(.Markdown, .markdown-body)`——不能直接改挂到 `.markdown-body`，否则回滚路径会丢失这些样式。
- 新路径的外层容器不带 `.Markdown` 类（`.Markdown a`、`.Markdown img` 等规则与 `.markdown-body` 的选择器同特异性，会互相覆盖）；外层保留 `MarkdownViewer`（低评分提示样式的钩子）。
- 阅读端 `.markdown-body` 的背景设为透明，继承卡片底色；预览区与帖子页共用同一份排版规则，差异只允许出现在容器宽度与评论字号。

## 4. 功能点拆分

所有 FP 的共同验收门槛：`pnpm lint`（0 error，`scripts/lint-budget.mjs` 的 `BUDGET = 0`）、`pnpm typecheck`、`pnpm test`、`pnpm test:proxy`、`pnpm build` 全绿，且 PR 的 CI 全绿（CI 对所有 `pull_request` 触发，内容为 typecheck / lint:ci / test / test:proxy / build）。

### 步骤 0（非功能点）基线与文档 — `bytemd/fp-00-bootstrap`

建立集成分支 `next-bytemd`（自 `next` @ `b7928961`），在干净检出上记录基线：lint 0 error / 7 warning；typecheck 通过；92 个测试文件、1171 条用例全过；test:proxy 通过；build 成功。以本 PR 提交本计划与 `.cursor/bytemd-editor-status.md`。只有文档，不走三路评审。

### FP1 渲染内核骨架与依赖 — `bytemd/fp-01-render-core`

- 目标：bytemd 接入仓库，建立 `lib/markdown/` 骨架、`renderMarkdown` 与病态输入前置守卫；不接入任何页面（零行为变化）。
- 改动：
  - 依赖（§3.2 归属表）；同步 `pnpm-lock.yaml`；`pnpm-workspace.yaml` 的 `allowBuilds` 仅在新包确有构建脚本且确需放行时才加；
  - `lib/markdown/{gfm,raw-html-post,pathology,schema,config,render}.ts`；
  - `schema.ts` 初版：(a) `'*'` 收敛为显式的站点全局属性白名单（至少移除 `id`、`name`、`target`、`rel`、`action`、`method`、`encType`、`htmlFor`、`useMap`、`isMap`、`prompt`）；(b) 移除 `className` 通配放行，给出 `div` 的**单条**定义 `['className', 'pull-right', 'pull-left', 'text-justify', 'text-rtl', 'text-center', 'text-right', 'videoWrapper', 'phishy']`（同 `sanitize-config.ts:219-228`）；任务列表的 `ul`/`li`/`input` 规则沿用 github schema；(c) 放行 `center`；(d) `protocols` 对齐 legacy（§3.4-B B4）；**iframe 的放行留给 FP2，与白名单强制同批落地**；
  - `render.ts`：`renderMarkdown(body, options)` → `{ html, isHtml, noImageActive, file }`；`isHtml` 用 legacy 同一对正则判定；`noImageActive` 为输出是否含 `noImageText`；整体 try/catch；
  - `pathology.ts` + 基准测试：对评审实测的三类病态输入（`<b>`×21800、`> `×32768、5 万层 `<div>` 嵌套）断言"判为病态、返回空串、单次耗时 < 50ms"；对 64KiB 平铺正文断言可正常渲染并记录耗时；
  - `__tests__/lib/markdown/version-guard.test.ts`：按 §3.2 版本家族表断言主版本（经 `remark-parse`、`rehype-sanitize` 的真实解析路径取包，防 pnpm 严格模式下误判）。
- 测试：方言基线（软换行、表格、任务列表、`~~x~~`、`~x~` 不加删除线、裸域名/邮箱/URL 保持纯文本、raw-HTML 帖不解析 markdown、完整注释被移除且不出现标记文本、未闭合注释按转义文本输出且不含 script 标签、`<center>` 保留、div class 白名单、作者提供的 `id`/`name`/`target`/`rel` 被移除）；schema 快照（标签、属性、协议）。
- 验收：共同门槛 + 上述测试全绿 + **Turbopack 冒烟**（在分支上临时加两处引用并 `pnpm build`：`SubmitPostClient` 内的 `next/dynamic` 客户端导入，以及一个服务端层导入；通过后还原，不入库；结果写入状态文件）。
- 评审重点：版本家族与 `fromMarkdownExtensions` 注册形态、`'*'` 收敛是否有遗漏的可利用属性、守卫的线性性与阈值合理性、无页面行为变化。

### FP2 加固与安全基线 — `bytemd/fp-02-harden-schema`

- 目标：新管线的 XSS 防线与 legacy 加固语义到位；iframe 放行与白名单强制同批落地。
- 改动：
  - `schema.ts` 定稿：iframe 属性（src/width/height/frameborder/allowfullscreen 等）、`a` 仅保留 `href`/`title`、`img` 的 src/alt/width/height/align/title、`td`/`th` 的 align 与 colspan/rowspan、`ol` 的 start；
  - `harden.ts`：
    1. 链接：**丢弃作者提供的全部属性后重建**（同 legacy a-transform 的做法，`sanitize-config.ts:246-274`）。href 归一：仅当以 `#`、`/`（且非 `/\`）、或 `http(s)://`、`steem://`、`esteem://` 开头才视为合法，否则补 `https://`；内链/CDN 图片链接/外链的判定一律**精确主机匹配**（§3.4-A D6）；钓鱼判定复用 `looksPhishy` → 替换为 `div.phishy`（`title` 为常量消息）；`highQualityPost=false` 时外链 `rel` 含 `nofollow`；
    2. 图片：`noImage` → `noImageText` 占位；非 http(s) src → `brokenimg.jpg`；`http://` → `//`；默认尺寸补 `srcset`；父节点非 `a` 时包 `<a href=proxifyImageUrl(src,'0x0/') target=_blank>`；`hideImages` → `pre.image-url-only`；`isProxifyImages` → 仅剥 legacy 代理壳；其余非本地图片走 `proxifyImageUrl(src, true)`；
    3. iframe：逐条套用 `iframeWhitelist`（从 `lib/sanitize-config.ts` 导入，保持单一来源），命中则归一为 frameborder=0 + allowfullscreen 属性 + 按 `large` 设 640×360 / 480×270，未命中 → `<div>(Unsupported …)</div>`；外层无 `div.videoWrapper` 时包裹；
    4. `td.style` 仅保留 `text-align:right`；
    5. 末端结构检查：树中存在 script 元素 → 清空根节点并 `console.error`。
- 测试（安全基线重建）：把 `__tests__/lib/sanitize-pipeline.test.ts` 的 11 个分区迁移到 `__tests__/lib/markdown/security-baseline.test.ts`，以 `renderMarkdown` 为被测对象。断言原则：沿用原测试"危险构造不成立"的行为断言，并尽量以**解析后的 DOM 语义**（属性、textContent）而非原始字符串形态来表达——新管线的转义形态与 legacy 不同（rehype-stringify 把 `<` 输出为 `&#x3C;`、`>` 不转义）。

  | legacy 分区 | 迁移方式 |
  |---|---|
  | 1 script 与事件属性（1.1–1.10） | 原样迁移；**新增**负向用例：内链不得携带作者的 `target`/`rel`；`href="/\evil.com"` 不得被当作内链 |
  | 2 URL 协议（2.1–2.8） | 迁移；2.2 在 legacy 下通过属巧合，改为语义断言（链接无 href 且无脚本元素） |
  | 3 iframe 白名单（3.1–3.12） | 迁移；3.5 需改写：sanitize 先剥掉 `javascript:` 的 src，占位文本不含原始 URL，断言"无 iframe、存在占位、无脚本" |
  | 4 mXSS（4.1–4.13） | 迁移；防御方式可能由"转义成文本"变为"移除"，逐条确认载荷不成立 |
  | 5 DOM clobbering | 迁移；FP1 的 `'*'` 收敛后 id/name 被移除（不再是带前缀存活），`<img` 以 `brokenimg.jpg` 形态出现 |
  | 6 钓鱼（6.1–6.4） | 6.1/6.2 迁移；**6.3 与 6.4 均反转为正向断言**（`steemit.com.evil.com` 须按外链处理或被拦截） |
  | 7 HTML 注释 | 已在 FP1 按新语义覆盖（D1），不重复 |
  | 8 深递归降级 | 改写：输入保留但经前置守卫拦截，断言"不抛错、输出空串、耗时 < 50ms"；不保留 30s 超时 |
  | 9 嵌套代码转义（audit F36） | 迁移；断言改为 DOM 语义（代码元素的 textContent 等于原始载荷） |
  | 10 良性内容通过 | 迁移 |
  | 11 二级陷阱边界 | 迁移（整份语料的输出均不得匹配 `/<\s*script/gi`） |

  依赖裸文本链接化的用例（如 6.1）在 FP2 先以 markdown 链接形态覆盖，FP3 补齐裸文本形态；新增 `options` **五个**开关（`large`、`highQualityPost`、`noImage`、`hideImages`、`isProxifyImages`）的用例；标签、属性、协议三份快照入库。
- 验收：共同门槛 + 安全基线全绿。
- 评审重点（以安全为主）：sanitize 顺序理解、`harden` 自产属性是否全部来自常量或已校验数据、iframe 白名单绕过（大小写、协议相对、userinfo、lookalike 域）、`td.style` 是否仍可承载 CSS 注入、`'*'` 收敛的完整性。

### FP3 Steemit 语义移植 — `bytemd/fp-03-legacy-semantics`

- 目标：存量帖子在新管线下的可见行为与 legacy 对齐。
- 改动：
  - `linkify.ts`（remark 阶段）：遍历 text 节点（父为 `link`/`inlineCode`/`code` 时跳过），识别顺序同 `html-ready.ts:308-312, 340-382`：先裸视频 URL（YouTube、Vimeo、Twitch、DTube、3Speak，正则复用 `lib/media/links.ts`），再 #tag（纯数字标签忽略，链接 `/trending/<tag>`）、@mention（`validateAccountName` 校验，链接 `/@<user>`），最后 `linksAny` 命中的 URL。替换以 **URL 子串**为单位：图片扩展名 → `image` 节点；`.zip`/`.exe` 不链接；钓鱼 URL → `div.phishy` 节点（`title` 由 `harden.ts` 以常量补上，不经 schema 放行）；其余 → `link` 节点；周围文字保留（D7）；
  - 嵌入节点：由白名单内的规范 URL 模板构造 `div.videoWrapper > iframe`（Vimeo 带起始时间、Twitch 区分 videos/channel、DTube、3Speak），并登记 `links`/缩略图到 collector；YouTube 本 FP 先输出直连 iframe（FP7 换轻量占位）；
  - `harden.ts` 增补 3Speak 图文组合识别（`links.ts` 的 `threespeakImageLink` 所描述的结构，在 hast 上匹配）；
  - 仅含嵌入节点的段落提升为块级节点（避免残留空 `<p>`）；
  - collector：`options.collect` 记录 hashtags / usertags / images / links，语义同 `htmlReady(html, { mutate: false })`（记录作者书写的原始 URL）。
- 测试：把 `__tests__/lib/html-ready.test.ts` 与 `scripts/compare-render-pipeline.ts` 的样例改写为 `renderMarkdown` 用例；每家嵌入 provider 各至少 1 条正例 + 1 条仿冒域反例；链接化不发生在代码与已有链接内；裸图片 URL 保留周围文字、同段两个裸图片 URL 均正常渲染（D7 回归）；补齐 FP2 预留的裸文本钓鱼用例；3Speak 组合在块级包裹与行内两种位置下均被识别。
- 验收：共同门槛 + 上述用例全绿。
- 评审重点：与 legacy 逐条对照的完整性、链接化产生的 href 是否只来自受控模板或已通过协议的 URL、嵌入节点是否必然满足 FP2 的白名单。

### FP4 提交侧校验迁移 — `bytemd/fp-04-analyze-submit`

- 目标：写作侧不再依赖 legacy 管线，为编辑器替换清障。
- 改动：
  - `analyze.ts`：`analyzePost(body)` → `{ disallowedTags, hashtags, usertags, images, links, pathological }`；
  - `disallowedTags` 的判定使用**真实 sanitizer 的结果**而非另写一份规则：对作者原始 HTML 片段（mdast 的 `html` 节点；raw-HTML 帖为整个 body）用 `hast-util-raw` 解析为 hast，统计标签多重集；再以同一个 `siteSanitize(defaultSchema)` 调 `hast-util-sanitize`，统计前后减少的标签——同时覆盖"标签不在白名单"与"违反 `ancestors` 规则（如表外的 `td`/`tr`/`th`）"两种情形；`<html>` 外壳按 legacy 规则豁免（`PostEditor.tsx:298-301`）；
  - `pathological` 为真时拒绝提交（新增 i18n 文案，9 个 overlay 文件齐全）；
  - `PostEditor.tsx`：`buildJsonMetadata` 与"非法标签拒绝"改用 `analyzePost`（L88-118、L290、L298-309），移除对 `markdown-it`、`@/lib/html-ready`、`allowedTags` 的导入；其余逻辑（字节上限、permlink、payout/受益人、广播、草稿）不动。
- 测试：`__tests__/components/PostEditor.test.tsx` 现有 17 条**不改断言**全部通过；新增 `analyze.test.ts`（json_metadata 的 tags/users/image/links 与 legacy 输出对照的固定样例；表外 `td` 被判为不允许；病态输入被拒绝）。
- 验收：共同门槛 + 现有测试零改动通过。
- 评审重点：`disallowedTags` 是否可能漏判、是否确实与阅读端共用同一个 schema 对象、新增 i18n key 的覆盖率。

### FP5 阅读端切换 — `bytemd/fp-05-reader-switch`

- 目标：帖子页/评论/帮助页/公告的正文改由新管线渲染（默认引擎），带回滚开关、亮色排版与对比工具。
- 改动：
  - `MarkdownViewer.tsx` 重写：引擎开关 + `renderMarkdown` + viewerEffect 分发（与 `@bytemd/react` Viewer 的 effect 处理等价：`plugins.map(p => p.viewerEffect?.({ markdownBody, file }))`，清理函数成对）；现实现迁至 `MarkdownViewerLegacy.tsx`；`engine.ts` 与根 layout 的 `MarkdownEngineProvider`；
  - CSS：`globals.css` 引入 github-markdown-css 亮色；补充规则的选择器扩展为 `:is(.Markdown, .markdown-body)`；新路径外层不带 `.Markdown`；
  - `scripts/compare-markdown-engines.ts`（`pnpm test:render:engines`）：输入 = 仓库固定语料 +（可选）从 API 拉取的若干真实帖；输出 = 逐条差异并归类到 §3.4 编号或"未归类"；
  - 守卫落地：`parity.test.ts` + ESLint 两条规则（§3.1）；`lib/csp.ts` 对 `IFRAME_EMBED_HOSTS` 的导入路径保持有效，`__tests__/lib/csp.test.ts` 不变；
  - `docs/CONFIGURATION.md` 补 `MARKDOWN_ENGINE`；
  - 记录 Turbopack 实际产物中阅读端渲染 chunk 的体积（与现状管线对照）写入状态文件。
- 测试：新路径渲染用例（标题/列表/表格/代码块/图片代理/链接属性/嵌入）；`__tests__/components/cards/PostFull.nsfw.test.tsx` 在新路径下通过；`legacy` 引擎下回滚用例；`parity.test.ts`。
- 验收：共同门槛 + 对比脚本在固定语料上的差异全部已归类 + dev server 实测（视口 1440，亮色）：典型帖子页、含视频帖、含表格/代码帖、评论区、帮助页、公告显示正常；`legacy` 开关下渲染与 `next` 分支一致。
- 评审重点：是否存在第二个 `dangerouslySetInnerHTML` 落点、`.Markdown` 规则是否泄漏到新路径、回滚路径的样式是否完整、Tailwind preflight 与 github-markdown-css 的冲突、五个阅读期开关是否全部生效、viewerEffect 清理是否成对、legacy 代码是否确为懒加载。

### FP6 正文暗色主题 — `bytemd/fp-06-body-dark`

- 目标：暗色模式下帖子页正文的配色与 github-markdown 暗色一致。
- 改动：`scripts/build-markdown-theme.mjs` 读取 `github-markdown-dark.css`，把**全部选择器**加上 `.dark ` 前缀（特异性更高，与引入顺序无关），生成 `app/markdown-dark.css` 入库；`globals.css` 在亮色文件之后 `@import`；同步性测试（重新生成后与入库文件一致）；阅读端正文背景透明以继承卡片底色。
- 验收：共同门槛 + `pnpm build-markdown-theme` 幂等 + dev server 实测（暗色）：帖子页、评论区、帮助页、公告配色正确，无白底。
- 评审重点：生成物与依赖版本是否绑定、是否误改 legacy 路径样式、亮色下无回归。

### FP7 YouTube 轻量预览 — `bytemd/fp-07-youtube-lite`

- 目标：恢复 legacy 的"YouTube 缩略图 + 点击才加载 iframe"（`YoutubePreview.tsx`），且预览与帖子页同源同形。
- 改动：
  - `schema.ts`：放行占位所需的三个属性（`div` 上的 `dataSiteEmbed`、`dataId`、`dataStart`），更新快照；
  - `embed.ts`：`linkify.ts` 的 YouTube 分支改为输出占位 `<div class="videoWrapper" data-site-embed="youtube" data-id=… data-start=…>`，内含与 `YoutubePreview` 同 URL 的缩略图 `<img>`（保证 SSR 首屏与无布局抖动）；`viewerEffect({ markdownBody })` 查询占位并用 `createRoot` 挂载 `<YoutubePreview …/>`，返回卸载函数；
  - `harden.ts`：占位内的缩略图豁免"包可点击链接"规则。
- 测试：占位 HTML 快照；viewerEffect 挂载/卸载（jsdom）；一致性测试覆盖"YouTube 裸 URL、`<iframe>` 嵌入、markdown 链接包 URL"三种输入；缩略图未被包成链接。
- 验收：共同门槛 + dev server 实测：帖子页首屏不含 YouTube iframe、点击后加载；编辑器尚不存在，预览侧由一致性测试覆盖。
- 评审重点：React 根的挂载与清理是否成对、`data-*` 属性来源是否受控。

### FP8 发文编辑器 — `bytemd/fp-08-story-editor`

- 目标：`submit_story` 的正文输入替换为 bytemd，桌面宽度下默认开启预览。
- 改动：
  - 依赖 `@bytemd/react@1.22.0`；`lib/markdown/gfm-actions.ts`（MIT 头注）；`lib/markdown/locales.ts`（condenser 9 种 locale → bytemd locale，`it`、`uk` 回退 `en`，按 `lib/i18n/messages.ts` 的懒加载形态）；
  - `components/elements/MarkdownEditor.tsx`（`'use client'`，由 `next/dynamic` + `ssr:false` 加载的唯一入口）：`<Editor value onChange plugins sanitize mode locale uploadImages editorConfig />`；导入 `bytemd/dist/index.css`；高度约 70vh；
  - **分屏阈值自算**：包装层用 ResizeObserver 量容器宽度，`width >= 600 ? 'split' : 'tab'`（S18）；发文用 `STORY_PLUGINS`；
  - Tab 键：`editorConfig.extraKeys.Tab` 改为插入空格（或按配置移出编辑器），避免键盘用户被困（S17）；
  - `PostEditor.tsx`：`type === 'submit_story'` 时正文 textarea → `MarkdownEditor`；保留 `id="body"`（挂在包装元素上）、占位文案（`g.write_your_story`）与 markdown 提示；清空依赖受控 `value`；
  - `uploadImages` → `lib/media/upload-image.ts` 的 `uploadImage(file, username)`，失败走 i18n 提示；
  - 测试替身 `__tests__/helpers/mock-markdown-editor.tsx`：把 `MarkdownEditor` 替换为保留 `value/onChange/placeholder` 的 textarea，使 `PostEditor.test.tsx` 只需增加一行 `vi.mock`；`MarkdownEditor.test.tsx` 测受控 value 回写、`onChange`、`uploadImages` 接线、分屏阈值（mock 容器宽度）。
- 验收：共同门槛 + dev server 实测（浏览器自动化 + 人工）：**视口矩阵 1920 / 1440 / 1366 / 1280 / 1024 / 390**——前四者分屏且预览常显，后两者 tab 且默认写作页；工具栏/快捷键/全屏可用；拖拽粘贴图片上传；草稿恢复；清空；CSP 下工具栏 tooltip 正常；**1:1 实测**：取 FP11 完整回归清单②所列的 5 篇不同类型真实帖，把 body 注入草稿（`localStorage['replyEditorData-submit']`），剥离 `<!--N-->` 后比对预览 `.markdown-body` 与帖子页 `.markdown-body` 的 innerHTML；亮色下进行，暗色留给 FP10。
- 评审重点：plugins/sanitize/locale 引用稳定性、受控 value 是否有光标跳动风险、上传失败的错误路径、i18n key 覆盖、编辑器 chunk 是否懒加载、Tab 键处理。

### FP9 评论编辑器 — `bytemd/fp-09-comment-editor`

- 目标：评论回复与评论编辑替换为 bytemd，默认不开预览，按需挂载。
- 改动：
  - `PostEditor.tsx`：`submit_comment` / `edit` 时正文 → `MarkdownEditor`，`mode="tab"`、高度约 240px、用 `COMMENT_PLUGINS`（与评论阅读端同为 `large=false`）；
  - 懒挂载：`CommentsList.tsx:119-130` 的顶层回复框（登录即显示）改为"占位框获得焦点/点击后才挂载编辑器"，占位框外观与编辑器写作区一致以避免布局跳动；`Comment.tsx:230-260` 的回复/编辑框已是条件渲染，保持；
  - 编辑评论时 `body` 初值与 permlink 逻辑不变；16KiB 字节上限不变。
- 测试：`PostEditor.test.tsx` 评论相关用例；懒挂载用例（未交互时不渲染编辑器、交互后渲染）；`mode` 与插件常量传参用例。
- 验收：共同门槛 + dev server 实测（视口 1440 与 390）：默认只见写作区、切到预览页后与该评论发布后的展示逐字节一致（剥离 `<!--N-->`）、多层回复展开不卡顿、评论编辑回填正确；**中文输入法（IME）输入顺畅**——bytemd 基于 CodeMirror 5，此项无法自动化，合并后需人工确认（不阻塞合并，记入状态文件的待确认项）。
- 评审重点：懒挂载是否覆盖所有入口、卸载清理、`COMMENT_PLUGINS` 是否与评论阅读端参数一致。

### FP10 编辑器暗色主题 — `bytemd/fp-10-editor-dark`

- 目标：暗色模式下编辑器（工具栏、写作区、状态栏、预览区）可读，且预览与帖子页取同一套正文配色。
- 改动：`.dark .bytemd*` 覆盖（背景、边框、文字、工具栏、状态栏、分屏线、tippy `light-border` 主题、`.cm-s-default` 令牌色）；样式并入 `globals.css`；预览区背景与帖子页一致。
- 验收：共同门槛 + dev server 实测（暗色，视口 1440）：发文编辑器与评论编辑器的 chrome 可读、预览区与帖子页的标题/正文/链接/代码块/引用/表格观感一致；亮色下无回归。
- 评审重点：仅 `.dark` 下才暴露的对比度问题、是否误改正文暗色样式。

### FP11 文档与收尾 — `bytemd/fp-11-docs-wrapup`

- 改动：
  - 新增 `docs/MARKDOWN_RENDERING.md`（英文）：管线顺序、配置源、1:1 契约与守卫、`MARKDOWN_ENGINE`、行为差异清单、病态输入守卫、如何新增语法（自研 BytemdPlugin + 版本家族表）、安全红线；
  - 更新 `README.md` 中"正文渲染"的说明（L96-98 一带）；
  - `.cursor/bytemd-editor-status.md` 定稿；清理确认无用的死代码；
  - 本地文档（不入库、在主工作区）：`AGENTS.md` 的"帖子正文渲染管线"等条目、`docs/AI-driver/04-rendering-pipeline.md` 及其 README 规则 6——在本地修改，不入库（`docs/AI-driver/` 是未跟踪的本地文档）。
- 验收：共同门槛 + 状态表与 PR 列表一一对应 + 完整回归清单逐项勾选。
- 完整回归清单：① 三类页面（帖子页、评论区、submit）× 亮/暗主题；② 1:1 实测（FP8 方法）对 5 篇不同类型真实帖——普通图文、含外链与 `#tag`/`@mention`、含视频嵌入、raw-HTML 帖、含表格与代码；③ `MARKDOWN_ENGINE=legacy` 回滚可用；④ 安全基线全绿；⑤ 产物体积记录（FP5 的数据）。
- 评审重点：文档与代码是否一致、死代码清理是否误删 legacy 路径。

## 5. 依赖顺序

```
步骤0 ─► FP1 ─► FP2 ─► FP3 ─► FP4 ─► FP5 ─► FP6 ─► FP7 ─► FP8 ─► FP9 ─► FP10 ─► FP11
基线     渲染    加固与   Steemit  提交侧   阅读端   正文    YouTube  发文     评论    编辑器    文档与
与文档   内核    安全基线  语义     校验     切换     暗色    轻量预览  编辑器   编辑器   暗色      收尾
```

严格串行。理由：FP3 的嵌入节点依赖 FP2 的 iframe 放行；FP4 依赖 FP3 的 collector 与 FP2 定稿的 schema；FP5 依赖 FP1–FP4 的完整管线；FP6/FP7 修改 FP5 引入的路径；FP8/FP9 的"预览 = 发布页"以 FP5–FP7 为前提；FP10 的编辑器暗色以 FP8/FP9 的编辑器存在为前提；FP11 收尾。

## 6. 执行流程

每个功能点一个分支（`bytemd/fp-NN-<slug>`，自 `next-bytemd` 最新提交切出）与一个以 `next-bytemd` 为 base 的 PR。流程：开发 → 三路评审（并行、只读：A 规格与正确性、B 安全、C 工程一致性，各自亲自运行测试与 lint，输出 `P0/P1/P2 + 文件:行 + 证据 + 建议`）→ 修复与复核（修复由开发侧执行，评审方保持只读并各自复核自己提出的条目；最后一轮三方对完整 diff 做回归通读；退出条件 P0 = 0、P1 = 0，P2 或修复或记录接受理由；最多 4 轮）→ 门禁（`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm test:proxy`、`pnpm build` 五项 + FP5–FP10 的 dev server 实测 + PR 的 CI 全绿）→ squash 合并（`gh pr merge --squash --delete-branch`，合并后以 `gh pr view --json state,mergedAt,mergeCommit` 实证，并核对 `next-bytemd` 的树与合并前一致）。

`next-bytemd` 只通过 PR 的 squash 合并前进；状态文件随所属功能点的 squash 一起合入。

## 7. 进度记录

各功能点的状态、PR 链接、评审轮次与已接受的 P2 记录在 `.cursor/bytemd-editor-status.md`。

## 8. 风险与应对

| # | 风险 | 应对 |
|---|---|---|
| K1 | 生态包版本家族错配（unified 10 vs 11）导致静默失效 | FP1 版本守卫测试；依赖版本保守锁定；新增生态包时对照 §3.2 版本家族表 |
| K2 | 新管线出现 legacy 没有的 XSS 缺口 | FP1–FP3 重建 11 分区 69 条安全基线并补负向用例；`'*'` 属性收敛与快照；回滚开关；FP5 对比脚本 |
| K3 | 病态输入卡死访问者标签页 | FP1 解析前线性守卫 + 基准测试；FP4 提交侧拒绝；FP2 改写 8.x 用例 |
| K4 | Turbopack/Next 16 对 bytemd 产物的解析问题 | FP1 冒烟前置暴露（客户端与服务端两层）；不通过则先解决再继续 |
| K5 | CodeMirror 5 在 jsdom 下无法初始化导致测试不稳定 | 编辑器统一走测试替身（FP8），不在单测中实例化 CodeMirror |
| K6 | 评审与修复循环不收敛 | §6 规定最多 4 轮，超出即停并上报 |
| K7 | worktree 与主工作区的 `.env`/端口冲突 | dev server 使用独立端口；`.env` 仅本机复制 |
| K8 | 上游 bytemd v1 已停止维护、steemit fork 无自有提交 | 锁定 1.22.0；问题以本仓库内自研插件解决 |
| K9 | 新管线对正常长帖的渲染耗时高于 legacy（评审实测：64KiB 平铺正文 0.32–0.50 秒，legacy 0.035 秒） | FP1 基准测试记录耗时；FP5 实测长帖体验；若不可接受，后续把正文渲染下沉到服务端（服务端渲染形态） |
| K10 | 排版改版（D8）带来视觉回归 | FP5/FP6/FP10 浏览器实测清单；对比脚本的差异归类 |
| K11 | 编辑器预览侧出错时显示 `undefined`（S12） | 前置守卫避免抛错；提交侧拒绝病态输入 |

## 9. 决策记录

已确认按本计划执行，每个功能点升格为 PR。C1–C8 为初版即列出的决策；C9–C14 为评审中新识别、按推荐项执行并在此留痕的事项。

| # | 决策 | 取值 | 说明 |
|---|---|---|---|
| C1 | 基线分支 | `next` @ `b7928961` | 本地与 origin/next 同步 |
| C2 | 工作目录 | 独立 git worktree（与主工作区隔离） | 避免打断主工作区上的其它工作 |
| C3 | 阅读端迁移与排版改版纳入本轮 | 纳入 | "预览 = 发布页"的唯一自洽做法 |
| C4 | 回滚开关 | 保留 `MARKDOWN_ENGINE` | legacy 管线本轮不删除 |
| C5 | 发文编辑器分屏阈值 | 包装层自算：容器 ≥600px 分屏，否则 tab（默认写作页） | bytemd 默认阈值 800px 在 1280/1366 视口下无预览；600px 时每栏约 300px，仍可用 |
| C6 | 远端操作 | 每个 FP 一个 PR（base `next-bytemd`），squash 合并 | 已确认；不合并进 `next`/`master` |
| C7 | GFM 方言 | 对齐 legacy（§3.4-B） | — |
| C8 | FP 数量与粒度 | 11 个受审 FP | — |
| C9 | 钓鱼与内链判定改精确主机匹配（D6） | 执行 | 安全修复；legacy 测试 6.3/6.4 钉死的已知缺陷 |
| C10 | HTML 注释行为变化（D1） | 执行 | 安全等价 |
| C11 | 允许标签集放宽、`<img>` 尺寸属性生效（D4） | 执行 | 最终清单以快照为准 |
| C12 | 图片拖拽/粘贴上传（FP8） | 保留 | 需求未明确要求；bytemd 原生能力，沿用现有 `uploadImage`（posting key 签名），不新增后端 |
| C13 | 顶层回复框改为点击后挂载编辑器（FP9） | 保留 | 避免登录用户每次打开帖子页都加载编辑器 |
| C14 | 本地文档（`AGENTS.md`、`docs/AI-driver`）更新方式 | FP11 合并后在本地修改，不入库 | `docs/AI-driver/` 是未跟踪的本地文档 |

## 附录 A：仓库约定

代码注释、提交信息、错误字符串与 `docs/` 内容使用英文；包管理器为 pnpm；`pnpm lint` 维持 0 error；新 i18n key 只放 `messages/overlays/{locale}.json`；`app/globals.css` 为唯一样式表入口；渲染管线安全关键、顺序敏感，不得在管线之外用 `dangerouslySetInnerHTML` 渲染作者内容。PR 标题为英文 conventional commit，正文用中文，分 Summary / Changes / Test plan / Out of scope。

## 附录 B：验证记录

**B.1 验证实验（2026-11-24，node v24.18.0；脚本为一次性实验，结论已转为 FP1/FP2 的测试用例）**

| # | 实验 | 结果 |
|---|---|---|
| 1 | stock `@bytemd/plugin-gfm` + 放行 iframe 的 schema：单行 `<iframe>`、`<center><iframe></center>`、`Watch this: <iframe></iframe>` | 三种均完整保留（tagfilter 未生效） |
| 2 | stock gfm：`costs ~5~ dollars and ~~gone~~` | `<del>5</del>` 与 `<del>gone</del>` |
| 3 | stock gfm：`see www.example.com/x or mail me@steemit.com or https://a.b/c` | 三者均被自动加链接 |
| 4 | 自定义 GFM（统一 10 家族，三个 mdast 扩展以对象注册）：表格 + 任务列表 | `<table>…` 与 `<li class="task-list-item"><input type="checkbox" …>` 正常 |
| 5 | 同上：裸域名 / 邮箱 / URL | 保持纯文本 |
| 6 | 同上：`~5~ ~~gone~~`；`Watch: <iframe …></iframe>`（schema 放行） | `~5~` 原样、`<del>gone</del>`；iframe 保留 |
| 7 | `<div class="pull-right">`、`<div class="fixed inset-0">`、`<span class="hidden">`（单条 `['className', …]` 定义） | 保留 `pull-right`；`class=""`；span 的 class 被移除 |
| 8 | 反例：三条 `['className', X]` 并列定义 | 只有最后一条生效 → 白名单类被误剥 |
| 9 | `raw-html-post` remark 插件：`<html><body><p>Hello _world_ #x</p>…</body></html>`、`<p>Intro</p>\n\n**bold?**` | markdown 不被解析 |
| 10 | remark 阶段节点：`link{url:'/trending/steem'}`、`link{url:'/@ety001'}`、`div.videoWrapper > iframe` | 相对链接经 sanitize 保留；自定义节点正确成元素 |
| 11 | `<center>`（schema 放行）、`[t](/trending/x)`、`[j](javascript:alert(1))` | `<center>` 保留；相对链接保留；`javascript:` 的 href 被移除 |
| 12 | 版本家族反例：`mdast-util-gfm-table@2.0.1` + bytemd | 表格输入抛 `Cannot set properties of undefined (setting 'inTable')` |

**B.2 技术评审的实测结论（2026-11-24，独立复现 B.1 全部条目并补充）**

| 项目 | legacy | 新管线 |
|---|---|---|
| `<b>`×21800（64KiB） | 170 ms | 22.1 s（抛 `RangeError`；异常发生在 rehype-raw） |
| `> `×32768（64KiB） | 5 ms | 6.9 s（异常发生在 micromark parse，早于任何插件） |
| `> `×8128（16KiB 评论） | 3 ms | 0.7 s |
| 5 万层 `<div>` 嵌套（legacy 测试 8.1 的输入） | 0.18 s | 26.8–29.1 s |
| 正常 64KiB 平铺正文 | 35 ms | 322–509 ms |

其它结论：Svelte Viewer 的预览 HTML 末尾带 `<!--N-->`；`github-markdown-css@5.9.0` 亮暗两份文件的自定义属性数均为 0；默认 schema 的 `'*'` 约 70 项且 `id`/`name` 带 `user-content-` 前缀存活；按初版规格写的原型中 `<a href="/trending/x" target="_blank" rel="opener">` 原样输出、`href="/\evil.com"` 被判为内链；legacy 安全测试 62 条可移植用例中 20 条按原样断言在新管线下不成立（明细见 §4-FP2 映射表）；jsdom 中可直接实例化 Svelte Viewer；引用不变时重复 `$set` 不会重跑处理器；阅读端渲染 bundle 近似测量 322 KiB min / 90 KiB gz（现管线 407 / 146）。

**B.3 bytemd 1.22.0 编译产物事实**（`node_modules/bytemd/dist/`，供各 FP 直接引用）

`index.mjs`：L2514–2537（getProcessor 顺序，className 放行在 sanitize 回调之前）；L2638–2644（Svelte Viewer 的 try/catch）；L2646–2649（追加 `<!--N-->`）；L2677–2696（Editor 预览实例化 Viewer）；L3168–3176（Editor props）；L3242–3245（Tab 键捕获）；L3339–3340（ResizeObserver）；L3460（`split = mode === "split" || mode === "auto" && containerWidth >= 800`）；L3469–3491（非 split 时 `activeTab === "preview"` 才显示预览）；L3508–3515（外部 value 与编辑器不同才 `setValue`）。`types.d.ts`：L132–157（BytemdPlugin）、L158–205（EditorProps）、L206–229（ViewerProps）。`index.css`：`.bytemd{…color:#24292e;border:1px solid #e1e4e8;background-color:#fff;height:300px}`、`.bytemd-preview .markdown-body{max-width:800px;margin:0 auto;padding:16px 4%}`，无 CSS 变量，无运行时 `<style>` 注入。`@bytemd/react/dist/index.mjs`：L3（Editor）、L32（Viewer）、L40–47（try/catch）、L73（空串回退）、L77（命名导出）。`hast-util-sanitize@4.1.0/lib/schema.js`：L4–5（id/name 前缀）、L96–169（`'*'` 全局属性表）。

## 附录 C：现状证据索引（condenser `next` @ `b7928961`）

- `components/elements/PostEditor.tsx`：markdown-it 实例 L74–80；`buildJsonMetadata` L88–118；草稿 L189–217；`handleSubmit` L219–397；isHtml 判定 L284–288；非法标签拒绝 L298–309；广播原始 body L354；正文 textarea L473–481；清空 L617–632
- `components/elements/MarkdownViewer.tsx`：props L11–23（`highQualityPost` 默认 true、`large` 默认 false）；raw-HTML 识别 L71–77；注释替换 L80；管线 L83–98；script 陷阱 L105–108；低评分提示 L112、L200–213；`~~~ embed:` 切片 L120–189；外层类名 L191–198
- `components/cards/PostFull.tsx`：`highQualityPost = payout > 10.0` L65、`noImage = stats.gray` L66、调用 L142–147（传入 `large`、`highQualityPost`、`noImage`）
- `components/layout/FeedLayout.tsx` L38、L54：≥760px 两栏 `[240px_minmax(0,1fr)]`，≥1200px 三栏 `[240px_minmax(0,1fr)_320px]`，中栏 `px-4`；`app/(main)/submit/SubmitPostClient.tsx` L58：`centerClassName="md:max-w-4xl"`
- `lib/html-ready.ts`：签名 L86–89；catch 降级 L135–145；3Speak 预处理 L148–152；`link()` L170–195；`iframe()` L198–218；`img()` L220–248；代理 L251–272；裸图片/链接化 L275–330；`linkify()` L332–384；视频嵌入链 L386–640
- `lib/sanitize-config.ts`：`iframeWhitelist` L37–77；`IFRAME_EMBED_HOSTS` L88–95；`allowedTags` L102–138；属性 L157–176；协议 L177；iframe/img/div/td/a 变换 L179–274
- `lib/media/links.ts`（`any`/`local`/`image`/`youTube` 及 `linksRe` 默认导出）、`lib/media/proxify-url.ts`（`proxifyImageUrl` L131、`defaultSrcSet` L29、`isDefaultImageSize` L47）、`lib/phishing.ts:93`（`looksPhishy`）
- 调用点：`components/cards/PostFull.tsx:142`、`components/cards/Comment.tsx:185`（不传选项）、`components/elements/HelpArticle.tsx:140`、`components/layout/Announcement.tsx:52`；编辑器挂载：`components/cards/CommentsList.tsx:119–130`、`components/cards/Comment.tsx:230–260`、`app/(main)/submit/SubmitPostClient.tsx`
- 既有测试：`__tests__/lib/sanitize-pipeline.test.ts`（912 行，11 个 describe、69 条 it：script 与事件属性、URL 协议、iframe 白名单、mXSS、DOM clobbering、钓鱼、HTML 注释、深递归降级、嵌套代码转义、良性内容、二级陷阱边界）、`__tests__/lib/html-ready.test.ts`（49 行）、`__tests__/components/PostEditor.test.tsx`（528 行，17 条，正文输入以 `getByPlaceholderText('Write your story...')` 定位）、`__tests__/lib/csp.test.ts`、`__tests__/components/cards/PostFull.nsfw.test.tsx`
- 既有脚本：`scripts/compare-render-pipeline.ts`（legacy 逐字节对照）、`scripts/lint-budget.mjs`
- 配置与约定：`vitest.config.ts`、`vitest.setup.ts`、`pnpm-workspace.yaml`、`.github/workflows/ci.yml`（`pull_request` 与 push 到 next/master 触发）、`lib/csp.ts:61, 128–143`、`app/layout.tsx`（`__SDC_UPLOAD_IMAGE_URL__` 注入块）、`lib/i18n/config.ts:9`、`lib/i18n/messages.ts:11–22`、`app/globals.css:5, 92, 143–385`、`README.md:96-98`
