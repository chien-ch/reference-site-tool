# 參考站案例助手

這是一個可直接部署到 GitHub Pages 的靜態網站。

## 檔案

- `index.html`：網站入口
- `styles.css`：畫面樣式
- `app.js`：互動功能與分類邏輯
- `.nojekyll`：讓 GitHub Pages 直接提供靜態檔案

## 上傳 GitHub Pages

1. 在 GitHub 建立一個新的 repository。
2. 將這個資料夾內的所有檔案上傳到 repository 根目錄。
3. 到 repository 的 `Settings`。
4. 點選 `Pages`。
5. `Build and deployment` 選擇 `Deploy from a branch`。
6. Branch 選擇 `main`，資料夾選擇 `/root`。
7. 儲存後等待 GitHub 產生網址。

## 注意

目前使用者匯入的參考站資料會存放在瀏覽器本機的 localStorage。
如果你要把已匯入資料也一起分享給別人，需要先把資料匯出或改成固定資料檔。
