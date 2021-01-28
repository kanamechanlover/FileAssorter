<template>
    <div class="p-1">
        <div class="d-flex flex-row align-items-center">
            <div class="flex-grow-1 border rounded border-secondary pl-1 py-0 d-flex flex-row align-items-center bg-secondary">
                <div class="mr-1 font-weight-bold text-white">Log</div>
                <div class="pl-1 message-area flex-grow-1 text-nowrap overflow-hidden">{{ message }}</div>
            </div>
            <button class="btn btn-primary button-alignment ml-1" :disabled="!executable"
                @click="clickedCopyButton">仕分け実行</button>
            <button class="btn btn-primary button-alignment ml-1" :disabled="!executable"
                @click="clickedRemoveButton">仕分け元削除</button>
        </div>
    </div>
</template>

<script>
const { dialog, BrowserWindow } = require('electron').remote;
import path from 'path'
import GlobalDefines from '../models/global_defines.js'
import GlobalVariables from '../models/global_variables.js'
import GlobalEventListener from '../models/global_event_listener.js'
import LocalFileAccess from '../models/local_file_access.js'

export default {
    computed: {
        executable: function() {
            return (this.existTarget && !this.executing);
        },
        overwriteMode: function() {
            return {
                force: 0, // 強制上書き
                conform: 1, // 都度確認
                skip: 2, // スキップ
                cancel: 3, // 処理中止 
            };
        },
        overwriteConform: function() {
            return {
                overwrite: 0, // 上書き
                skip: 1, // スキップ
                cancel: 2, // 以降全て中止
            };
        },
        removeConform: function() {
            return {
                remove: 0, // 上書き
                cancel: 1, // 中止
            };
        },
    },
    methods: {
        setTargetFileNum: function(num) {
            this.existTarget = (num > 0);
        },
        clickedCopyButton: function() {
            this.$emit('execute-copy-command')
        },
        clickedRemoveButton: function() {
            this.$emit('execute-remove-command');
        },
        executeCopy: function(srcFolderPath, destFolderPath, status) {
            // 事前に上書きモード確認
            const mode = this.showOverwriteModeSelectDialog();
            if (mode == this.overwriteMode.cancel) {
                // 中止する場合はメッセージを残して戻る
                this.message = 'コピーを中止しました';
                return;
            }
            
            this.executing = true;
            const srcFileNames = status.getFileNames()
            const labeledFileNames = srcFileNames.filter((name) => {
                return status.getLabels(name).length > 0;
            });
            const max = status.getLabeledFileNum();
            let allCancel = false;
            if (max > 0) {
                this.message = 'コピーを開始しました。';
                let current = 1;
                labeledFileNames.forEach((fileName) => {
                    if (allCancel) return;
                    const from = path.join(srcFolderPath, fileName);
                    const labels = status.getLabels(fileName)
                    labels.forEach((label) => {
                        if (allCancel) return;
                        const to = path.join(destFolderPath, label, fileName);
                        this.message = `coping (${current}/${max}) '${fileName}' to '${label}' ...`;
                        console.log(this.message);
                        if (LocalFileAccess.existsFile(to)) {
                            // 既にコピー先にファイルがある場合
                            if (mode == this.overwriteMode.skip) {
                                // 「スキップ」モードの場合は次の処理へ
                                return;
                            }
                            else if (mode == this.overwriteMode.conform) {
                                //「都度確認」モードの場合は確認ダイアログを出す
                                const result = this.showOverwriteConformDialog(to);
                                if (result == this.overwriteConform.skip) {
                                    this.message += ' -> skiped.';
                                    console.log('  -> skiped.');
                                    return; // スキップなら次の処理へ
                                }
                                if (result == this.overwriteConform.cancel) {
                                    allCancel = true;
                                    return; // 中止なら全ループを抜ける
                                }
                                // 上書きなら実行
                            }
                        }
                        LocalFileAccess.copyFileSync(from, to);
                    });
                    current ++;
                });
                this.message = (allCancel) ? 'コピーを中止しました。' : 'コピー処理完了しました。'
            }
            this.executing = false;
            // 終了を通知
            this.$emit('finished-command', {
                reflesh: false, // 仕分け元ファイルリスト更新が必要か
            });
        },
        executeRemove: function(srcFolderPath, status) {
            // 削除事前確認
            const result = this.showRemoveConformDialog();
            if (result == this.removeConform.cancel) {
                // キャンセルする場合
                this.message = '削除を中止しました。';
                return;
            }
            this.executing = true;
            const srcFileNames = status.getFileNames()
            const labeledFileNames = srcFileNames.filter((name) => {
                return status.getLabels(name).length > 0;
            });
            const max = status.getLabeledFileNum();
            if (max > 0) {
                this.message = 'ファイル削除を開始します。';
                let current = 1;
                labeledFileNames.forEach((fileName) => {
                    const filePath = path.join(srcFolderPath, fileName);
                    this.message = `removing (${current}/${max}) '${fileName}' ...`;
                    console.log(this.message);
                    LocalFileAccess.removeFileSync(filePath);
                    current ++;
                })
                this.message = '削除処理が完了しました。'
            }
            this.executing = false;
            // 終了を通知
            this.$emit('finished-command', {
                reflesh: true, // 仕分け元ファイルリスト更新が必要か
            });
        },
        // ファイル上書きモード選択ダイアログを表示
        // return 0: 強制上書き 1: 都度確認 2: スキップ 3: 選ばず中止
        showOverwriteModeSelectDialog: function() {
            const win = BrowserWindow.getFocusedWindow();
            return dialog.showMessageBoxSync(win,
                {
                    type: 'info',
                    title: 'File Assorter',
                    message: 'ファイル上書きモード選択',
                    detail: ['コピー先に同名のファイルがあった時の動作を選択してください。',
                            'コピー処理を中止する場合は「選ばず中止」を選択します。'].join('\n'),
                    buttons: ['強制上書き', '都度確認', 'スキップ', '選ばず中止'],
                    cancelId: this.overwriteMode.cancel,
                });
        },
        // ファイル上書き確認ダイアログを表示
        // return 0: 上書き 1: スキップ 2: 中止
        showOverwriteConformDialog: function(path) {
            const win = BrowserWindow.getFocusedWindow();
            return dialog.showMessageBoxSync(win,
                {
                    type: 'warning',
                    title: 'File Assorter',
                    message: 'ファイル上書き確認',
                    detail: [
                        path,
                        '仕分け先に同名のファイルが見つかりました。',
                        '上書きしてよろしいですか？'].join('\n'),
                    buttons: ['上書き', 'スキップ', '以降全て中止'],
                    cancelId: this.overwriteConform.cancel,
                });
        },
        // ファイル削除確認ダイアログを表示
        // return 0: 上書き 1: スキップ 2: 中止
        showRemoveConformDialog: function(path) {
            const win = BrowserWindow.getFocusedWindow();
            return dialog.showMessageBoxSync(win,
                {
                    type: 'warning',
                    title: 'File Assorter',
                    message: 'ファイル削除確認',
                    detail: [
                        path,
                        '仕分け元のラベル付きファイルを全て削除します。',
                        '削除してよろしいですか？'].join('\n'),
                    buttons: ['削除', 'キャンセル'],
                    cancelId: this.removeConform.cancel,
                });
        },
    },
    data: function() {
        return {
            message: 'ready.', // ステータスメッセージ
            existTarget: false, // コマンド実行対象ファイルがあるか
            executing: false, // コマンド実行中か

        };
    },
}
</script>

<style>
    .button-alignment {
        padding-top: 1px;
        padding-bottom: 1px;
        line-height: inherit;
    }
    .message-area {
        background: white;
        padding-top: 1px;
        padding-bottom: 1px;
    }
</style>