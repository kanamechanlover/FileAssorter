<template>
    <div class="h-100 p-1 d-flex flex-column">
        <folder-selector label="仕分け元" class="p-1 mb-1"
            @change="changedFolderPath"></folder-selector>
        <src-file-viewer ref="viewer" class="flex-grow-1"
            @changed-selecting-file="changedSrcSelectingFile"
            @changed-file-list="changedSrcFileList"></src-file-viewer>
    </div>
</template>

<script>
import FolderSelector from './FolderSelector.vue'
import SrcFileViewer from './SrcFileViewer.vue'

export default {
    components: {
        FolderSelector,
        SrcFileViewer,
    },
    methods: {
        // フォルダパスが変わった時の処理
        changedFolderPath: function(e) {
            console.log(e);
            this.folderPath = e.path;
            this.$refs.viewer.setFolderPath(e.path);
            this.$emit('changed-folder-path', {
                path: e.path,
            });
        },
        // 仕分け先のラベルリストが更新されたらビュアのサイズ更新
        changedDestLabelList: function(e) {
            this.$refs.viewer.refleshSize();
        },
        // 仕分け先フォルダ(ラベル)の選択状態を仕分け元のビュアに伝達
        changedDestLabelSelecting: function(e) {
            this.$refs.viewer.changedDestLabelSelecting(e);
        },
        // 仕分け元のファイルリスト更新を伝達
        changedSrcFileList: function(e) {
            this.$emit('changed-file-list', e);
        },
        // 仕分け元ファイルの選択状態を仕分け先に伝達
        changedSrcSelectingFile: function(e) {
            this.$emit('changed-selecting-file', e);
        },
        // ラベリング済みファイル数を更新
        setLabeledFileNum: function(num) {
            this.$refs.viewer.setLabeledFileNum(num);
        },
        // 仕分け元のファイルの再取得が必要
        refleshFileList: function() {
            this.$refs.viewer.setFolderPath(this.folderPath);
        }
    },
    data: function() {
        return {
            folderPath: '', // フォルダパス
        };
    },
}
</script>

<style>

</style>