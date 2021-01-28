// Electronの実行に必要なモジュールを取り込む
const electron = require('electron');
const path = require('path');
const url = require('url');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

// Electronのライフサイクルを定義
let mainWindow; // メインウィンドウを表す変数
app.on('ready', createWindow);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
})
app.on('activate', function () {
    if (mainWindow === null) createWindow();
})

// ウィンドウを作成してコンテンツを読み込む
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280, height: 600,
        minWidth: 480, minHeight: 600,
        // Electron 5.0.0 以降は nodeIntegration を有効化しないと Node.js を内部で実行できない
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
        webSecurity: process.env.NODE_ENV !== 'development',
    });
    mainWindow.loadURL(url.format({ // 読み込むコンテンツを指定
        pathname: path.join(__dirname, 'public', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    // ウィンドウが閉じる時の処理
    mainWindow.on('closed', function () {
        mainWindow = null
    });
    // devtools を開いた状態で起動
    mainWindow.webContents.openDevTools();
}