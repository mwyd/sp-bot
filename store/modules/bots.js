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
            let merged = [];
            for(let instance of state.instances) {
                switch(type) {
                    case 'toConfirm':
                        merged = [...merged, ...instance.items.toConfirm];
                        break;

                    case 'active':
                        merged = [...merged, ...instance.items.pending];
                        break;

                    case 'finished':
                        merged = [...merged, ...instance.items.finished];
                        break;
                }
            }

            let unique = [];
            for(let item of merged) {
                if(unique.findIndex(_item => _item.id == item.id) == -1) unique.push(item);
            }
            
            return unique;
        },
        getPresets(state) {
            return state.presets;
        },
        botsOptions(state) {
            let options = [];
            
            for(let instance of state.instances) options.push({
                index: instance.index,
                isRunning: instance.isRunning,
                preset: instance.preset
            });

            return options;
        }
    },
    mutations: {
        addBot(state, instance) {
            state.instances.push(instance);
        },
        closeBot(state, index) {
            let id = state.instances.findIndex(instance => instance.index == index);
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