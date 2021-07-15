const actionsFreezer = {
    data() {
        return {
            actionsDisabled: false
        }
    },
    methods: {
        disableActions(promise) {
            this.actionsDisabled = true
            promise.finally(() => this.actionsDisabled = false)
        }
    }
}

export { actionsFreezer }