<template>
    <div class="spb-input spb--font-size-medium spb--rounded-small">
        <input 
            v-model="internalModel"
            :class="inputClass"
            :type="type"
            :placeholder="placeholder"
            :disabled="disabled"
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
        disabled: Boolean,
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
            const className = `spb-input__field`
            return className + 
                (this.synchronized ? ' spb-input__field--ok' : ' spb-input__field--wrong') +
                (this.disabled ? ' spb--cursor-not-allowed' : '')
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
        }
    }
}
</script>

<style>
.spb-input {
    background-color: var(--secondary-background-color);
    color: var(--main-text-color);
    height: 32px;
}

.spb-input__field  {
    width: 100%;
    height: 100%;
    padding-left: 10px;
    box-shadow: none;
    outline: none;
    border: none;
    background: transparent;
    color: inherit;
    border-radius: inherit;
}

.spb-input__field--ok {
    border-left: 2px solid var(--accepted-color);
}

.spb-input__field--wrong {
    border-left: 2px solid var(--cancelled-color);
}
</style>