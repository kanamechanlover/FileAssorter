import fs, { copyFile } from 'fs'

// 参考URL: https://qiita.com/shisama/items/affb219514eb1166198e

export default {
    // フォルダ名リストを取得
    // folderPath : 対象のフォルダパス
    // callback: 取得した際に実施したい処理
    getFolderNameList: function(folderPath, callback) {
        fs.readdir(folderPath, { withFileTypes: true }, (err, dirents) => {
            if (err) {
                callback([]);
            }
            const fileNameList =
                dirents.filter((dirent) => dirent.isDirectory())
                    .map((dirent) => dirent.name);
            callback(fileNameList);
        });
    },
    // ファイル名リストを取得
    // folderPath : 対象のフォルダパス
    // callback: 取得した際に実施したい処理
    getFileNameList: function(folderPath, callback) {
        fs.readdir(folderPath, { withFileTypes: true }, (err, dirents) => {
            if (err) {
                callback([]);
            }
            const fileNameList =
                dirents.filter((dirent) => dirent.isFile())
                    .map((dirent) => dirent.name);
            callback(fileNameList);
        });
    },
    // ファイルの存在チェック
    existsFile: function(path) {
        return fs.existsSync(path);
    },
    // ファイルコピー(非同期)
    // from : コピー元のファイルパス
    // to : コピー先のファイルパス
    // successFunc : 成功時に呼び出す関数
    // errorFunc : 失敗時に呼び出す関数
    copyFile: function(from, to, successFunc, errorFunc) {
        fs.copyFile(from, to, (err) => {
            if (err && errorFunc) errorFunc();
            else if(!err && successFunc) successFunc();
        });
    },
    // ファイルコピー(同期)
    // from : コピー元のファイルパス
    // to : コピー先のファイルパス
    copyFileSync: function(from, to) {
        fs.copyFileSync(from, to);
    },
    // ファイル削除
    // file : 削除するファイルパス
    // successFunc : 成功時に呼び出す関数
    // errorFunc : 失敗時に呼び出す関数
    removeFile: function(file, successFunc, errorFunc) {
        fs.unlink(file, (err) => {
            if (err && errorFunc) errorFunc();
            else if(!err && successFunc) successFunc();
        });
    },
    // ファイル削除(同期)
    // file : 削除するファイルパス
    removeFileSync: function(file) {
        fs.unlinkSync(file);
    },
}