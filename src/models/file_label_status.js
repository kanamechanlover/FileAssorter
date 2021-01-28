// ファイルのラベル付与状況保持クラス
export default class FileLabelStatus {
    constructor() {
        this.status = [];
        this.labeledFileNum = 0;
    }
    getFileNames() {
        return this.status.map((item) => item.name);
    }
    getLabels(name) {
        const item = this.status.find((item) => item.name == name);
        if (!item) return [];
        return item.labels.map((v) => v);
    }
    getLabeledFileNum() {
        return this.labeledFileNum;
    }
    setFiles(fileNames) {
        this.status = fileNames.map((name) => {
            return {
                name: name,
                labels: [],
            }
        });
        this.labeledFileNum = 0;
    }
    setLabels(name, labels) {
        const index = this.status.findIndex(item => item.name === name);
        if (index < 0) return;
        console.log(labels === this.status[index].labels);
        const prevLabelNum = this.status[index].labels.length;
        this.status[index].labels = labels;
        const newLabelNum = labels.length;
        if (prevLabelNum == 0 && newLabelNum > 0) {
            this.labeledFileNum ++;
        }
        else if (prevLabelNum > 0 && newLabelNum == 0) {
            this.labeledFileNum --;
        }
    }
    clear() {
        this.status = [];
        this.labeledFileNum = 0;
    }
}