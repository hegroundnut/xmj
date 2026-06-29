const allowedMenuPaths = ['/admin/teaching', '/admin/moment'];

const routesListModule = {
  namespaced: true,
  state: {
    routesList: [],
  },
  mutations: {
    // 设置路由，菜单中使用到（仅保留朋友圈和洗眉机）
    getRoutesList(state, data) {
      state.routesList = data.filter(
        (item) => item.path && allowedMenuPaths.some((p) => item.path.indexOf(p) === 0)
      );
    },
  },
  actions: {
    // 设置路由，菜单中使用到
    async setRoutesList({ commit }, data) {
      commit('getRoutesList', data);
    },
  },
};

export default routesListModule;
