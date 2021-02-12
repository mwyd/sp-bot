const gsBots = {
    state: () => ({
        instances: [],
        presets: [{
            name: "default",
            deal: 50,
            dealMargin: 0,
            minPrice: 1.00,
            maxPrice: 10.00,
            toSpend: 10.00,
            runDelay: 4.0,
            search: '',
        }],
    }),
    getters: {
        getItems: (state) => (type) => {
            let unique = [];
            for(let bot of state.instances) {
                switch(type) {
                    case 'toConfirm':
                        bot.instance.items.toConfirm.forEach(v => {if(unique.findIndex(x => x.id == v.id) == -1) unique.push(v)});
                        break;

                    case 'active':
                        bot.instance.items.pending.forEach(v => {if(unique.findIndex(x => x.id == v.id) == -1) unique.push(v)});
                        break;

                    case 'finished':
                        bot.instance.items.finished.forEach(v => {if(unique.findIndex(x => x.id == v.id) == -1) unique.push(v)});
                        break;
                }
            }
            return unique;
        },
        getPresets(state) {
            return state.presets;
        }
    },
    mutations: {
        addBot(state, data) {
            state.instances.push(data);
        },
        closeBot(state, index) {
            let id = state.instances.findIndex(bot => bot.index == index);
            if(id > -1) state.instances.splice(id, 1);
        },
        setPresets(state, presets) {
            state.presets = [...state.presets, ...presets];
        }
    },
    actions: {
        loadPresets(context) {
            fetch(chrome.extension.getURL('presets.json'))
            .then(res => res.json())
            .then(data => context.commit('setPresets', data));
        }
    }
}