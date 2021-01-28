// ツール全体で参照するイベント管理
// ※同期処理
export default {
    // 登録されているイベントとそのコールバック
    callbacks: {},
    // イベント登録
    register: function(eventName, callback) {
        if (!(eventName in this.callbacks)) {
            // 未登録なら新規作成
            this.callbacks[eventName] = [callback];
        }
        else {
            // 登録済みなら追加
            this.callbacks[eventName].push(callback);
        }
    },
    // イベント削除
    unregister: function(eventName, callback) {
        if (eventName in this.callbacks) {
            const index = this.callbacks[eventName].indexOf(callback);
            if (index !== -1) {
                this.callbacks[eventName].splice(index, 1);
            }
        }
    },
    // イベント発火
    invoke: function(eventName, params) {
        if (eventName in this.callbacks) {
            this.callbacks[eventName].forEach(callback => {
                callback(params);
            });
        }
    },
}