# 《市长模拟器：城市账本》项目部署说明 (DEPLOYMENT)

由于本项目为无后端的纯单机前端 Web 应用程序，打包后的产物为标准的静态资源，因此可以非常方便地托管在任何静态网页托管平台上。

## 1. 静态打包
在发布前，请先执行生产环境打包命令：
```bash
npm run build
```
打包成功后，项目根目录下会生成 `dist/` 文件夹。该文件夹内包含 HTML、JS、CSS、JSON 数据和图片等所有静态资产。

## 2. 静态托管平台部署

### GitHub Pages 部署
1. 在 GitHub 上创建一个新仓库。
2. 将本地代码推送到该仓库中。
3. 在 GitHub 仓库设置的 `Pages` 选项卡中：
   - 选择部署源为 `GitHub Actions`。
   - 或者使用 `gh-pages` 分支进行部署。若使用分支，可通过命令推送 `dist` 目录：
     ```bash
     npx gh-pages -d dist
     ```

### Cloudflare Pages / Netlify 部署
1. 登录 Cloudflare / Netlify 后台，导入你的 GitHub 仓库。
2. 配置构建命令：
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. 点击部署，平台将自动监听 main 分支的提交进行 CI/CD 打包。

### 任意 Nginx/Apache 静态服务器部署
1. 将打包好的 `dist/` 目录下的所有文件上传到服务器的静态网站根目录（例如 `/var/www/html/`）。
2. Nginx 配置示例：
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           root /var/www/html;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```
   *注意：由于本项目在 Router 中使用了 `createWebHashHistory()`，即使不配置 `try_files`，刷新页面亦不会出现 404 错误，对普通静态服务器托管非常友好。*

## 3. 中国大陆公开运营及分发合规提示

> [!IMPORTANT]
> **合规风险提示**：
> 如拟面向中国大陆境内公开运营、上架分发或进行商业化发行：
> 1. **ICP 备案**: 运营方须根据互联网服务提供者规范，为域名办理 ICP 备案（如涉及经营性服务，还需办理增值电信业务经营许可证，即 ICP 许可证）。
> 2. **网络游戏审批**: 根据国家新闻出版署要求，网络游戏公开上线运营（含内测收费、广告变现等商业活动）必须依法申请并取得游戏版号。
> 3. **未成年人防沉迷与实名认证**: 须接入国家新闻出版署实名认证系统，严格执行未成年人游戏时长及付费充值限制限制。
> 4. **用户隐私合规**: 须根据《个人信息保护法》编制并展示清晰的隐私政策，并在收集数据（如有）前征得用户同意。
