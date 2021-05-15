<template>
    <div :class="alertClass">
        {{ message }}
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'Alert',
    props: {
        type: String,
        message: String
    },
    computed: {
        ...mapState({
            alertTypes: state => state.app.alertTypes
        }),
        alertClass() {
            const className = 'spb-alert spb--rounded-small spb--font-weight-medium spb--font-size-medium spb--flex'
            return `${className} spb-alert--${this.type}`
        }
    }
}
</script>

<style scoped>
.spb-alert {
    width: 100%;
    min-height: 40px;
    margin: 4px 0px;
    color: var(--main-text-color);
    box-shadow: 0 0 70px rgb(0 0 0 / 60%);
}

.spb-alert--info {
    background-color: var(--active-color);
}

.spb-alert--success {
    background-color: var(--accepted-color);
}

.spb-alert--error {
    background-color: var(--cancelled-color);
}
</style>