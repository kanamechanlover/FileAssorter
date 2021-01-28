<template>
    <div :class="['border', 'rounded', 'p-1', 'w-100', 'h-100', 'text-center', 'position-relative', 'selectable',
            fileDecolationClass]">
        <div v-if="isImage && !isLoaded" class="w-100 h-100 progress-area position-absolute position-left-top">
            <div class="progress-area position-relative w-100 h-100">
                <div class="progress w-75 position-absolute progress-bar-position">
                    <div class="progress-bar progress-bar-striped progress-bar-animated w-100"
                        role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
        </div>
        <label-view-area ref="labelViewArea" class="w-100 h-100 label-view-area position-absolute position-left-top">

        </label-view-area>
        <div v-if="isImage" ref="imageArea" :class="[
                'w-100', 'h-100', 'd-flex', 'align-items-center', (isLandscape) ? 'flex-row' : 'flex-column']">
            <img ref="image" :class="[imageSizeClass]" :src="filePath" />
        </div>
        <div v-else class="w-100 h-100 d-flex flex-row align-items-center other-text">
            <div class="flex-grow-1">{{ fileName }}</div>
        </div>
        <div v-if="isImage" ref="fileNameArea" class="file-name position-absolute">
            {{ fileName }}
        </div>
    </div>
</template>

<script>
import LabelViewArea from './LabelViewArea.vue'
import path from 'path'

export default {
    components: {
        LabelViewArea,
    },
    mounted: function() {
        this.loadImage();
    },
    computed: {
        allowExtensions: function() {
            return ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
        },
        isImage: function() {
            return (this.allowExtensions.some((ext) => this.filePath.toLowerCase().endsWith(ext)));
        },
        isUnsupported: function() {
            return !this.isImage;
        },
        fileName: function() {
            return path.basename(this.filePath);
        },
        imageAspectRate: function() {
            return this.imageWidth / this.imageHeight;
        },
        isLandscape: function() {
            return (this.imageAspectRate > this.getAreaAspectRate());
        },
        imageSizeClass: function() {
            return (this.isLandscape) ? 'image-size-landscape' : 'image-size-portrait';
        },
        fileDecolationClass: function() {
            return (this.selected) ? 'selected-file': (this.hasLabels()) ? 'has-labels': '';
        },
    },
    methods: {
        onImageLoaded: function() {
            this.isLoaded = true;
            console.log(this.filePath + ' is loaded.');
            this.$emit('onImageLoaded');
        },
        onError: function(e) {
            console.error(e);
            this.hasError = true;
        },
        loadImage: function() {
            this.isLoaded = false;
            this.hasError = false;
            let image = new Image();
            image.onload = () => {
                this.isLoaded = true;
                this.imageWidth = image.naturalWidth;
                this.imageHeight = image.naturalHeight;
            };
            image.onerror = () => {
                this.hasError = true;
            }
            image.src = this.filePath;
        },
        // 画像表示エリアのアスペクト比
        // ※↓算出プロパティに入れたかったが、this.$refs.imageArea にアクセス出来ないのでメソッド化
        getAreaAspectRate: function() {
            if (!this.$refs.imageArea) return 1;
            return this.$refs.imageArea.clientWidth / this.$refs.imageArea.clientHeight;
        },
        // 仕分け先フォルダ(ラベル)の選択状態をファイルに反映
        changedDestLabelSelecting: function(e) {
            if (this.selectedIndex < 0) return;
            this.$refs.labelViewArea.setLabels(e.labels);
        },
        // ラベル付与状態
        getLabels: function() {
            return this.$refs.labelViewArea.getLabels();
        },
        hasLabels: function() {
            return (!this.$refs.labelViewArea) ? false : this.$refs.labelViewArea.getLabels().length > 0;
        },
        clearLabels: function() {
            this.$refs.labelViewArea.clearLabels();
        }
    },
    props: {
        filePath: String, // ファイルパス
        selected: { // 選択中か
            type: Boolean,
            'default': false,
        },
    },
    data: function() {
        return {
            isLoaded: false, // 読込完了フラグ
            hasError: false, // エラーの有無
            imageWidth: 0, // 画像の横幅
            imageHeight: 0, // 画像の高さ

        };
    },
    watch: {
        // パスが変わったら画像読み込み直し
        filePath: function(n, o) {
            if (n) this.loadImage();
        },
    },
}
</script>

<style>
    .other-text {
        word-break: break-all;
        background: whitesmoke;
    }
    .position-left-top {
        left: 0px;
        top: 0px;
    }
    .position-center {
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
    }
    .progress-area {
        background-color: rgba(0, 0, 0, 0.2);
        z-index: 2;
    }
    .progress-bar-position {
        left: 50%;
        bottom: 10%;
        transform: translateX(-50%);
    }
    .image-size-portrait {
        width: auto;
        height: 100%;
    }
    .image-size-landscape {
        width: 100%;
        height: auto;
    }
    .label-view-area {
        z-index: 1;
    }
    /* 選択中のファイルに対する装飾 */
    .selected-file {
        border-width: 2px !important;
        border-color: royalblue !important;
        background-color: lightsteelblue;
    }
    /* ラベルが付与されているファイルに対する装飾 */
    .has-labels {
        background-color: whitesmoke;
    }
    /* ファイル名 */
    .file-name {
        font-size: 0.75em;
        color: gray;
        left: 50%;
        bottom: 0px;
        transform: translateX(-50%);
        background: white;
        overflow: hidden;
    }
</style>