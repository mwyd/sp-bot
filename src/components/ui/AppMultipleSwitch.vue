<template>
    <div class="spb-multiple-switch-wrapper">
        <div class="spb-multiple-switch spb--cursor-pointer spb--rounded-small spb--flex">
            <div
                v-for="(option, index) in options"
                class="spb-multiple-switch__option spb--rounded-small"
                :key="`option-${sanitizedOption(option)}-${index}`"
                :class="{ 'spb-multiple-switch__option--active': option == selected }"
                @click="$emit('optionUpdate', option)"
            >
                {{ option }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AppMultipleSwitch',
    props: {
        options: {
            type: Array,
            required: true
        },
        selected: {
            type: String,
            required: true
        }
    },
    emits: ['optionUpdate'],
    methods: {
        sanitizedOption(option) {
            return option.replace(/ /g, '-').toLowerCase()
        }
    }
}
</script>

<style scoped>
.spb-multiple-switch-wrapper {
    width: 100%;
    padding: 10px 0px;
}

.spb-multiple-switch {
    background-color: var(--alternative-background-color);
}

.spb-multiple-switch__option {
    text-align: center;
    width: 100%;
}

.spb-multiple-switch__option--active {
    background-color: var(--secondary-background-color);
}
</style>