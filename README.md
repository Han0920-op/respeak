# 《这句话，我想重说》

一款可独立部署的沟通练习互动叙事作品。五个场景、七步体验、原创 SVG 插画、可点击物件、预设分支对话、私人暂停与本地练习手记。

**这是一部预设剧情作品，不是 AI 聊天产品。** 无模型、无密钥、无 Python 后端；输入不上传，不触发生成，也不决定故事结局。

完整交付在 [`competition/`](./competition/README.md)，可下载 [`respeak-competition-v1.0.0.zip`](./respeak-competition-v1.0.0.zip)。

## 立即体验

下载并解压 ZIP，双击 `competition/一键预览.html`，即可离线体验。不要直接从 GitHub 文件预览页运行 HTML，先下载到本地。

开发和标准静态部署：

```sh
git clone https://github.com/Han0920-op/respeak.git
cd respeak/competition
npm run build
npm run preview
```

终端会输出预览端口（默认 4173）。在本机浏览器访问该端口即可。需要 Node.js 20 或更新版本，无需安装第三方依赖。部署时上传 `competition/dist/` 全部内容。

- [作品介绍与演示脚本](./competition/docs/作品介绍.md)
- [秒哒导入说明](./competition/docs/秒哒导入说明.md)
- [验证报告与截图](./competition/docs/验证报告.md)
- [完整使用与部署说明](./competition/README.md)

参赛版源码、构建网页和交付文档一起维护；修改源码后运行构建，重新生成单文件与 `dist/`。
