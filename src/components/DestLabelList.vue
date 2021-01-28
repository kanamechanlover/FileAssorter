<template>
    <div class="d-flex flex-row flex-wrap">
        <div v-for="(label, i) in labels" :key="i" class="mr-1 mb-1">
            <button :class="['btn', 'py-0',
                    (selectedIndexes.indexOf(i) !== -1) ? 'btn-secondary' : 'btn-outline-secondary']"
                @click="clickedLabel(i)" :disabled="!selectable">{{ label }}</button>
        </div>
    </div>
</template>

<script>
const { dialog, BrowserWindow } = require('electron').remote;
import LocalFileAccess from '../models/local_file_access.js'
import GlobalVariables from '../models/global_variables.js'

export default {
    methods: {
        // 選択されてるフォルダ名トグル(同じフォルダ名をクリックしたら選択解除)
        clickedLabel: function(index) {
            const i = this.selectedIndexes.indexOf(index);
            if (i < 0) { // 無ければ追加
                this.selectedIndexes.push(index);
                this.selectedLabels.push(this.labels[index]);
                GlobalVariables.usingLabelNum += 1;
            }
            else { // あれば削除
                this.selectedIndexes.splice(i, 1);
                this.selectedLabels.splice(i, 1);
                GlobalVariables.usingLabelNum -= 1;
            }
            console.log(index, this.selectedIndexes, this.selectedLabels);

            this.$emit('changed-selecting', {
                labels: this.selectedLabels.map((v) => v),
            });
        },
        // フォルダパス更新
        setFolderPath: function(path) {
            if (this.folderPath) {
                // フォルダパスが変わる際ラベルは一旦削除される為こちらの選択状態もリセットしておく
                this.selectedLabels = [];
                this.selectedIndexes = [];
            }
            this.folderPath = path;
            this.updateLabels(); // ファイルリスト更新
        },
        // ファイルリスト更新
        updateLabels: function() {
            LocalFileAccess.getFolderNameList(this.folderPath, (folders) => {
                this.labels = folders;
                this.$emit('changed-label-list', {
                    labels: this.labels,
                });
            });
        },
        // 選択中のフォルダ名リストを設定
        setSelectedLabels: function(labels) {
            this.selectedLabels = labels;
            this.selectedIndexes = labels.map((name) => {
                return this.labels.indexOf(name);
            });
        },
        // 仕分け元ファイルの選択状態受け取り
        changedSrcSelectingFile: function(e) {
            if (e.index < 0) {
                // ファイル非選択状態になったらフォルダ選択状態解除
                this.selectedLabels = [];
                this.selectedIndexes = [];
                // 選択出来ない状態にする
                this.selectable = false;
            }
            else {
                // ファイルが選択されたらラベル付与状態を同期
                this.selectedLabels = e.labels;
                this.selectedIndexes = e.labels.map((label) => {
                    return this.labels.indexOf(label);
                });
                // 選択できる状態にする
                this.selectable = true;
            }
        },
    },
    data: function() {
        return {
            folderPath: '', // 仕分け先フォルダパス
            labels: [], // フォルダ(ラベル)名リスト
            selectedLabels: [], // 選択中のフォルダ(ラベル)名リスト
            selectedIndexes: [], // 選択中のフォルダ名のインデックスリスト
            selectable: false, // 選択できる状態かどうか
        };
    },
}
</script>

<style>
</style>