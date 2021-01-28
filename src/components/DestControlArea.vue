<template>
    <div class="p-1">
        <folder-selector label="仕分け先" class="p-1 mb-1" @change="changedFolderPath" :confirm="changeConfirm"></folder-selector>
        <div class="border border-dark rounded p-1">
            <div class="d-flex flex-row align-items-center mb-1">
                <div class="flex-grow-1 d-flex flex-row flex-nowrap align-items-end">
                    <div class="m-0 flex-grow-1">フォルダ(ラベル)一覧</div>
                    <div v-show="!fileSelecting && folderPath" class="text-black-50 dest-description">
                        仕分け元のファイルを選択してください。
                    </div>
                </div>
            </div>
            <dest-label-list ref="labelList"
                @changed-label-list="changedLabelList"
                @changed-selecting="changedLabelSelecting"></dest-label-list>
        </div>
    </div>
</template>

<script>
const { dialog, BrowserWindow } = require('electron').remote;
import FolderSelector from './FolderSelector.vue'
import DestLabelList from './DestLabelList.vue'
import GlobalDefines from '../models/global_defines.js'
import GlobalVariables from '../models/global_variables.js'
import GlobalEventListener from '../models/global_event_listener.js'

export default {
    components: {
        FolderSelector,
        DestLabelList,
    },
    methods: {
        // フォルダ変更確認ダイアログ表示
        changeConfirm: function() {
            if (this.folderPath && GlobalVariables.usingLabelNum > 0) {
                // 1つでもラベルが付与されていてディレクトリが変更される場合は確認ダイアログを出す
                const result = this.showConfirmDialog();
                console.log(result);
                // ダイアログでOKが押されたら実行
                return result === 0;
            }
            else {
                return true
            }
        },
        // フォルダ変更確認ダイアログ表示
        // return : 0 でOK それ以外はキャンセル
        showConfirmDialog: function() {
            const win = BrowserWindow.getFocusedWindow();
            return dialog.showMessageBoxSync(win,
                {
                    type: 'question',
                    title: 'File Assorter',
                    message: '仕分け先フォルダ変更前確認',
                    detail: [
                        '仕分け先フォルダを変更すると今各ファイルに付与しているラベルは全て消えます。',
                        '変更してよろしいですか？'].join('\n'),
                    buttons: ['OK', 'Cancel'],
                    cancelId: -1,
                });
        },
        // フォルダパスが変わった時の処理
        changedFolderPath: function(e) {
            console.log(e);
            // パス更新
            this.folderPath = e.path;
            this.$refs.labelList.setFolderPath(e.path);
            // 親に伝達
            this.$emit('changed-folder-path', {
                path: this.folderPath,
            });
        },
        // ラベルリストが更新された
        changedLabelList: function(e) {
            this.$emit('changed-label-list', e);
        },
        // ラベル選択状態が変化した
        changedLabelSelecting: function(e) {
            // 親にそのまま伝搬
            this.$emit('changed-label-selecting', e);
        },
        // 仕分け元ファイルの選択状態を仕分け先に伝達
        changedSrcSelectingFile: function(e) {
            this.fileSelecting = (e.index >= 0);
            this.$refs.labelList.changedSrcSelectingFile(e);
        },
    },
    data: function() {
        return {
            folderPath: '', // フォルダパス
            fileSelecting: false, // 仕分け元ファイルが選択されているか
        };
    },
}
</script>

<style>
    .dest-description {
        font-size: 0.7em;
    }
</style>