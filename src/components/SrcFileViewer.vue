<template>
    <div class="border border-dark rounded p-1 d-flex flex-column">
        <div class="d-flex flex-row align-items-center mb-1">
            <div class="flex-grow-1 mr-1">
                <div class="m-0">ファイル一覧</div>
            </div>
            <div class="mr-1 src-description text-black-50 border rounded border-light p-1">
                ラベリング済みファイル数：{{ labeledFileNum }}
            </div>
            <div class="mr-1">
                <div class="m-0">表示列数</div>
            </div>
            <div class="ml-1">
                <input type="number" class="column-num-spin-button" min="1" max="8"
                    v-model="columnNum" @change="columnNumChanged" />
            </div>
        </div>
        <div ref="baseDiv" class="flex-grow-1 border border-dark">
            <div ref="scrollArea" class="w-100 overflow-y-scroll h-100">
                <div ref="scrollContent" class="d-flex flex-row flex-wrap user-select-none" @click="clickedOther($event)">
                    <div ref="files" v-for="(file, i) in files" :key="i"
                        class="p-1">
                        <div class="w-100 h-100" @click="clickedFile($event, i)">
                            <thumbnail-item ref="items" :file-path="getFullPath(file.name)" :selected="selectedIndex == i"></thumbnail-item>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ThumbnailItem from './ThumbnailItem.vue'
import LocalFileAccess from '../models/local_file_access.js'
import path from 'path'
import GlobalEventListener from '../models/global_event_listener.js'
import GlobalDefines from '../models/global_defines.js'
import GlobalVariables from '../models/global_variables.js'

export default {
    components: {
        ThumbnailItem,
    },
    mounted: function() {
        window.addEventListener('resize', () => {
            this.refleshSize();
        });
        this.$nextTick(() => {
            this.refleshSize();
        });
        // イベント登録
        GlobalEventListener.register(GlobalDefines.events.changedDestFolder, () => {
            // 仕分け先のフォルダパスが変更されたら付与したラベルを全て削除
            this.clearLabelsAll();
        });
    },
    computed: {
        // 横幅に対する高さの割合
        aspectRate: function() {
            return 3 / 4;
        },
        // 選択中のファイルオブジェクト
        selectingFile: function() {
            if (this.selectedIndex < 0) return null;
            return this.$refs.items[this.selectedIndex];
        },
    },
    methods: {
        // ファイルのフルパスを取得
        getFullPath: function(name) {
            return path.join(this.folderPath, name);
        },
        // 表示列数変更イベント
        columnNumChanged: function() {
            this.applyColumnNum(this.columnNum);
        },
        // 表示列数反映
        applyColumnNum: function(num) {
            if (!this.$refs.files) return; // files の要素数が 0 の場合 undefined になる

            const widthPercent = 100.0 / num;
            this.$refs.files.forEach((element) => {
                element.style.width = widthPercent + '%';
            });
            // 横幅が反映されてから高さを指定
            this.$nextTick(() => {
                this.$refs.files.forEach((element) => {
                    const height = element.clientWidth * this.aspectRate;
                    element.style.height = height + 'px';
                });
            });
        },
        // スクロールエリアのサイズを指定
        // ※高さを厳密に指定しないと中身のサイズに応じて広がってしまう為実装
        applyScrollAreaHeight: function() {
            const baseHeight = this.$refs.baseDiv.clientHeight;
            this.$refs.scrollArea.style.maxHeight = baseHeight + 'px';
        },
        // ウィンドウサイズが変更された際に大きさを再計算
        refleshSize: function() {
            this.$refs.scrollArea.style.maxHeight = "0px";
            this.$nextTick(() => {
                this.applyColumnNum(this.columnNum);
                this.applyScrollAreaHeight();
            });
        },
        // フォルダパス更新
        setFolderPath: function(path) {
            this.folderPath = path;
            this.files = []; // ファイルを一旦削除
            this.updateFileList(); // ファイルリスト更新
            this.selectedIndex = -1;
            this.invokeChangedSelectingFile();
        },
        // ファイルリスト更新
        updateFileList: function() {
            LocalFileAccess.getFileNameList(this.folderPath, (files) => {
                this.files = files.map((file) => {
                    return {
                        name: file, // ファイル名
                    };
                });
                this.$emit('changed-file-list', {
                    files: this.files.map((file) => file.name),
                });

                // ファイル数 0 から変更される場合は列数による表示が反映されていない為更新
                this.refleshSize();
            });
        },
        // リスト中のファイルがクリックされた時の処理
        clickedFile: function(e, index) {
            if (this.selectedIndex != index) {
                this.selectedIndex = index;
                this.invokeChangedSelectingFile();
            }
            e.stopPropagation();
        },
        // ファイル以外の部分をクリックしたら選択解除
        clickedOther: function(e) {
            this.selectedIndex = -1;
            this.invokeChangedSelectingFile();
            e.stopPropagation();
        },
        // 選択ファイル変更を親に伝達
        invokeChangedSelectingFile: function() {
            const name = (this.selectedIndex < 0) ? '' : this.files[this.selectedIndex].name;
            this.$emit('changed-selecting-file', {
                index: this.selectedIndex,
                name: name,
                labels: (this.selectingFile) ? this.selectingFile.getLabels() : [],
            });
        },
        // 仕分け先フォルダ(ラベル)の選択状態をファイルに反映
        changedDestLabelSelecting: function(e) {
            if (this.selectedIndex < 0) return;
            
            const beforeNum = this.selectingFile.getLabels().length;
            this.selectingFile.changedDestLabelSelecting(e);

            // ラベルが付いているファイル数の変化
            const afterNum = this.selectingFile.getLabels().length;
            if (beforeNum == 0 && afterNum > 0 ) {
                GlobalVariables.labeledFileNum += 1;
            }
            else if (beforeNum > 0 && afterNum == 0) {
                GlobalVariables.labeledFileNum += 1;
            }
        },
        // ラベル付与クリア
        clearLabelsAll() {
            if (this.$refs.items) {
                this.$refs.items.forEach((item) => {
                    item.clearLabels();
                });
                GlobalVariables.labeledFileNum = 0;
            }
        },
        // ラベル済みファイル数更新
        setLabeledFileNum: function(num) {
            this.labeledFileNum = num;
        },
    },
    data: function() {
        return {
            columnNum: 3, // 表示列数
            folderPath: '', // 対象のフォルダパス
            files: [], // 表示するファイル情報リスト
            selectedIndex: -1, // 選択中のファイルのインデックス(非選択中は -1)
            labeledFileNum: 0, // ラベリング済みファイル数
        };
    },
}
</script>

<style>
    .column-num-spin-button {
        width: 64px;
    }
    /* スピンボックスのボタンを常時表示 */
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
        opacity: 1;
    }
    /* bootstrap に scroll が無いので定義 */
    .overflow-y-scroll {
        overflow-y: scroll;
    }

    .src-description {
        font-size: 0.7em;
        line-height: 1.2em;
    }
</style>