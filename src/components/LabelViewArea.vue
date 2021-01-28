<template>
    <div class="p-1 overflow-hidden">
        <div class="w-100 h-100 d-flex flex-row flex-wrap align-items-start align-content-start">
            <span v-for="(label, i) in labels" :key="i" class="label-style py-0 px-1 ml-1 mt-1">
                {{ label }}
            </span>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        getLabels: function() {
            return this.labels;
        },
        addLabel: function(label) {
            if (label in this.labels) return;
            this.labels.push(label);
        },
        setLabels: function(labels) {
            this.labels = labels;
        },
        removeLabel: function(label) {
            const index = this.labels.indexOf(label);
            if (index >= 0) {
                delete this.labels[index];
            }
        },
        clearLabels: function() {
            this.labels.splice(0);
        },
    },
    data: function() {
        return {
            labels: [], // 表示するラベルリスト
        };
    },
}
</script>

<style>
    .label-style {
        border: 1px solid gray;
        border-radius: 4px;
        background: whitesmoke;
        white-space: nowrap;
        font-size: 0.75rem;
    }
</style>