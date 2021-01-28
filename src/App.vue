<template>
    <div class="h-100 p-1 d-flex flex-column">
        <dest-control-area ref="dest"
            @changed-folder-path="changedDestFolderPath"
            @changed-label-list="changedLabelList"
            @changed-label-selecting="changedDestLabelSelecting">
        </dest-control-area>
        <src-control-area ref="src" class="flex-grow-1"
            @changed-folder-path="changedSrcFolderPath"
            @changed-selecting-file="changedSrcSelectingFile"
            @changed-file-list="changedSrcFileList">
        </src-control-area>
        <command-area ref="command"
            @execute-copy-command="executeCopyCommand"
            @execute-remove-command="executeRemoveCommand"
            @finished-command="finishedCommand">
        </command-area>
    </div>
</template>

<script>
import DestControlArea from './components/DestControlArea.vue'
import SrcControlArea from './components/SrcControlArea.vue'
import CommandArea from './components/CommandArea.vue'
import FileLabelStatus from './models/file_label_status.js'

export default {
    components: {
        DestControlArea,
        SrcControlArea,
        CommandArea,
    },
    methods: {
        // 仕分け先フォルダパスが変更された
        changedDestFolderPath: function(e) {
            this.destFolderPath = e.path;
            this.countOfLabeledFile = 0;
        },
        // 仕分け先のラベルリストが更新された
        changedLabelList: function(e) {
            this.$refs.src.changedDestLabelList(e);
        },
        // 仕分け先フォルダ(分類)の選択状態を仕分け元のビュアに伝達
        changedDestLabelSelecting: function(e) {
            if (this.selectingFileName) {
                this.fileLabelStatus.setLabels(this.selectingFileName, e.labels);
            }
            this.$refs.command.setTargetFileNum(this.fileLabelStatus.getLabeledFileNum());
            this.$refs.src.changedDestLabelSelecting(e);
            this.$refs.src.setLabeledFileNum(this.fileLabelStatus.getLabeledFileNum());
        },
        // 仕分け元フォルダパスが変更された
        changedSrcFolderPath: function(e) {
            this.srcFolderPath = e.path;
        },
        // 仕分け元のファイルリストが更新された
        changedSrcFileList: function(e) {
            this.fileLabelStatus.setFiles(e.files);
        },
        // 仕分け元ファイルの選択状態を仕分け先に伝達
        changedSrcSelectingFile: function(e) {
            this.selectingFileName = e.name;
            this.$refs.dest.changedSrcSelectingFile(e);
        },
        // コピーコマンド実行
        executeCopyCommand: function() {
            this.$refs.command.executeCopy(
                this.srcFolderPath,
                this.destFolderPath,
                this.fileLabelStatus);
            this.executingCommand = true;
        },
        // 削除コマンド実行
        executeRemoveCommand: function() {
            this.$refs.command.executeRemove(
                this.srcFolderPath,
                this.fileLabelStatus);
            this.executingCommand = true;
        },
        // コマンド実行終了通知
        finishedCommand: function(e) {
            this.executingCommand = false;
            if (e.reflesh) {
                this.$refs.src.refleshFileList();
                this.fileLabelStatus.clear();
            }
        }
    },
    data: function() {
        return {
            destFolderPath: '', // 仕分け先のフォルダパス
            srcFolderPath: '', // 仕分け元のフォルダパス
            selectingFileName: '', // 仕分け元で選択中のファイル名
            fileLabelStatus: new FileLabelStatus(), // ファイルのラベル付与状況
            executingCommand: false, // コマンド実行中か(実行中なら操作不可にする為)
        };
    },
}
</script>

<style>
    html, body {
        width: 100%;
        height: 100%;
    }
    body {
        overflow: hidden;
        margin: 0px;
        padding: 0px;
    }
</style>