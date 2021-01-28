// ツール全体で参照する変数定義
import FileLabelStatus from './file_label_status.js'
import GlobalDefines from './global_defines.js'
import GlobalEventListener from './global_event_listener.js'

// 値変更通知
const send = function(name, value) {
    GlobalEventListener.invoke(
        GlobalDefines.events.updateGlobalVariables,
        { name: name });
};

const global_value = {
    // ファイルに使用しているラベルの総数
    usingLabelNum: {
        v: 0,
        get: function() { return this.v; },
        set: function(v) { this.v = v; send('usingLabelNum'); },
    },
    // ラベル付与済みファイルの総数
    labeledFileNum: {
        v: 0,
        get: function() { return this.v; },
        set: function(v) { this.v = v; send('labeledFileNum'); },
    },
    // ラベル付与状況
    fileLabelStatus: new FileLabelStatus(),
    // コマンド実行中か
    isExecuting: false,
}

export default global_value;

