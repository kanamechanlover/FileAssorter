<template>
    <div class="d-flex flex-row align-items-center justify-items-stretch">
        <div class="mr-1">
            <p class="m-0">{{ label }}</p>
        </div>
        <div class="mr-1 flex-grow-1">
            <input v-model="path" class="w-100 text-under-border"
                placeholder="対象のフォルダを選択してください" disabled />
        </div>
        <div class="">
            <button class="btn btn-outline-secondary button-alignment"
                @click="clickedOpenButton">参照</button>
        </div>
    </div>
</template>

<script>
const { dialog, BrowserWindow } = require('electron').remote;

export default {
    props: {
        label: String, // 見出し
        confirm: Function, // フォルダ変更時の確認処理(戻り値が true ならフォルダ変更実行)
    },
    methods: {
        changed: function() {
            console.log('doya');
        },
        clickedOpenButton: function() {
            if (!this.confirm || this.confirm()) {
                // 確認処理が無いまたは確認処理でOKが出たらダイアログを出す
                this.showFileDialog();
            }
        },
        // ファイルオープンダイアログを表示
        showFileDialog: function() {
            const win = BrowserWindow.getFocusedWindow();
            dialog.showOpenDialog(win,
                {
                    properties: ['openDirectory'],
                    title: this.label + 'のフォルダ選択',
                    defaultPath: '.',
                }).then((result) => {
                    if (!result.canceled && result.filePaths.length) {
                        this.path = result.filePaths[0];
                        this.invokeChangeEvent()
                    }
                }
            );
        },
        invokeChangeEvent: function() {
            this.$emit('change', {
                path: this.path,
            });
        },
    },
    data: function() {
        return {
            path: '',
        };
    }
}
</script>

<style>
    .text-under-border {
        border-width: 1px 0px;
        border-top-color: transparent;
        border-radius: 4px;
        border-bottom-color: gray;
        background: whitesmoke;
    }
    .button-alignment {
        padding-top: 1px;
        padding-bottom: 1px;
        line-height: inherit;
    }
</style>