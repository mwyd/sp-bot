<template>
    <div>
        <input 
            v-model="internalModel"
            :class="inputClass"
            :type="type"
            :placeholder="placeholder"
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
        modelValue: [String, Number],
        modelModifiers: {
            default: () => ({})
        },
        placeholder: {
            type: String,
            default: '',
            required: false
        },
        validator: {
            type: Function,
            default: () => true,
            required: false
        },
        modelUpdated: {
            type: Function,
            default: () => {},
            required: false
        }
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
            return className + (this.synchronized ? ' spb-input-field--ok' : ' spb-input-field--wrong')
        }
    },
    methods: {
        rollbackInternalModel() {
            this.synchronized = true
            this.internalModel = this.modelValue
        },
        validateInternalModel() {
            if(this.validator(this.internalModel)) this.saveModelValue()
        },
        saveModelValue() {
            this.synchronized = true
            this.$emit('update:modelValue', this.internalModel)
            this.modelUpdated()
        },
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