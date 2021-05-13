<template>
    <div>
        <input 
            v-model="internalModel"
            :class="inputClass"
            :type="type"
            @input="e => synchronized = (e.target.value == modelValue)"
            @focusout="rollbackInternalModel"
            @keydown.enter="validateInternalModel"
        >
    </div>
</template>

<script>
export default {
    name: 'InputField',
    props: {
        type: String,
        valid: Boolean,
        modelValue: [String, Number],
        validator: Function,
        modelUpdated: Function
    },
    emits: ['update:modelValue'],
    data() {
        return {
            internalModel: this.modelValue,
            synchronized: true
        }
    },
    watch: {
        modelValue(value) {
            this.internalModel = value
        }
    },
    computed: {
        inputClass() {
            const className = `spb-input-field spb--font-size-medium spb--rounded-small`
            return className + (this.synchronized && (this.valid ?? true) ? ' spb-input-field--ok' : ' spb-input-field--wrong')
        }
    },
    methods: {
        rollbackInternalModel() {
            this.synchronized = true
            this.internalModel = this.modelValue
        },
        validateInternalModel() {
            if(this.validator?.(this.internalModel) ?? true) this.saveModelValue()
        },
        saveModelValue() {
            this.synchronized = true
            this.$emit('update:modelValue', this.internalModel)
            this.modelUpdated?.()
        }
    }
}
</script>

<style>
.spb-input-field  {
    width: 100%;
    height: 32px;
    padding-left: 10px;
    box-shadow: none;
    outline: none;
    border: none;
    background-color: var(--secondary-background-color);
    color: var(--main-text-color);
}

.spb-input-field--ok {
    border-left: 2px solid var(--accepted-color);
}

.spb-input-field--wrong {
    border-left: 2px solid var(--cancelled-color);
}
</style>