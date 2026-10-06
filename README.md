# 案例助手 GitHub Pages 發布包

此版本使用 GitHub Pages 提供入口網址，嵌入既有 Google Apps Script 線上服務。
不是完全獨立的靜態版本；請保留 Google Apps Script 的公開部署與發布資料夾。
Google Sites 可不再使用，但 Apps Script 與 Drive 仍提供案例、圖片及網址檢查。

## 上傳

1. 解壓縮本發布包。
2. 將 `index.html`、`.nojekyll`、`README.md` 放到 GitHub 儲存庫根目錄。
3. 在儲存庫 Settings > Pages 選擇 Deploy from a branch，指定發布分支與 /(root)。
4. 等待 GitHub Pages 部署完成，再開啟 Pages 顯示的網址。

若沿用既有儲存庫，只需更新根目錄的 index.html；舊版 app.js、styles.css 等不再被此入口引用。
不要將 ZIP 本身當成網頁上傳，也不要公開本機後台、原始 Excel、備份資料或授權資訊。

## 功能與資料

- 保留現有案例、圖片、分類、付費功能、搜尋、篩選及網址檢查。
- 包內沒有後台、編輯介面、帳號密碼或 Google OAuth 憑證。
- 619 個案例與 244 張已建立的預覽圖由現有 Google 服務提供。
- 未建立的預覽圖不會因上傳此包而自動新增。
- 收藏及檢查狀態依瀏覽器儲存；部分瀏覽器會限制第三方嵌入儲存。
- 本機後台的修改不會自動同步，仍需依 cloud/DEPLOYMENT.md 的流程發布資料。
- 公開 Google 服務或資料夾若刪除、撤銷授權或達到配額，網站功能可能無法使用。

如需完全離開 Google，需另外建置可執行網址檢查的後端並遷移資料與圖片。
