import { userPreset } from "@/api/conduit";
import alertType from "@/enums/alertType";

export default {
  namespaced: true,
  state: () => ({
    loaded: null,
    presets: new Map([
      [
        0,
        {
          name: "default",
          deal: 15,
          dealMargin: 50,
          minPrice: 1.0,
          maxPrice: 100.0,
          runDelay: 4.0,
          search: "",
        },
      ],
    ]),
  }),
  getters: {
    preset: (state) => (id) => {
      return state.presets.get(id);
    },
    sortedPresets: (state) => (sortAsc) => {
      return [...state.presets].sort(
        (a, b) => (a[1].maxPrice - b[1].maxPrice) * (sortAsc ? 1 : -1),
      );
    },
  },
  mutations: {
    setLoaded(state, value) {
      state.loaded = value;
    },
    setPreset(state, { id, preset }) {
      state.presets.set(id, preset);
    },
    removePreset(state, id) {
      state.presets.delete(id);
    },
  },
  actions: {
    async loadPresets({ rootState, commit }) {
      const limit = 50;
      let loopLimit = 1;

      let loaded = true;

      for (let i = 0; i < loopLimit; i++) {
        const { success, data } = await userPreset.all(
          rootState.session.token,
          { offset: i * limit, limit },
        );

        if (!success) {
          loaded = false;

          break;
        }

        for (const preset of data) {
          commit("setPreset", {
            id: preset.id,
            preset: preset.preset,
          });
        }

        if (data.length === limit) {
          loopLimit++;
        }
      }

      commit("setLoaded", loaded);
    },
    async addPreset({ rootState, commit, dispatch }, preset) {
      const { success, data, error_message } = await userPreset.create(
        rootState.session.token,
        preset,
      );

      const alert = {
        type: alertType.SUCCESS,
        message: "Preset created",
      };

      if (success) {
        commit("setPreset", {
          id: data.id,
          preset: data.preset,
        });
      } else {
        alert.type = alertType.ERROR;
        alert.message = error_message;
      }

      dispatch("app/pushAlert", alert, { root: true });
    },
    async updatePreset({ rootState, commit, dispatch }, preset) {
      const { success, data, error_message } = await userPreset.update(
        rootState.session.token,
        preset,
      );

      const alert = {
        type: alertType.SUCCESS,
        message: "Preset updated",
      };

      if (success) {
        commit("setPreset", {
          id: data.id,
          preset: data.preset,
        });
      } else {
        alert.type = alertType.ERROR;
        alert.message = error_message;
      }

      dispatch("app/pushAlert", alert, { root: true });
    },
    async deletePreset({ rootState, commit, dispatch }, id) {
      const { success, data, error_message } = await userPreset.remove(
        rootState.session.token,
        id,
      );

      const alert = {
        type: alertType.SUCCESS,
        message: "Preset deleted",
      };

      if (success) {
        commit("removePreset", data.id);
      } else {
        alert.type = alertType.ERROR;
        alert.message = error_message;
      }

      dispatch("app/pushAlert", alert, { root: true });

      return success;
    },
  },
};
