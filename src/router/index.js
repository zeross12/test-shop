import { createRouter, createWebHashHistory, createWebHistory } from "vue-router"
import store from "../store";
import { tokenName, routerHistoryType } from "../config";
import Router from './router'
const routes = Router
const router = createRouter({
	history: routerHistoryType == 1 ? createWebHashHistory() : createWebHistory(),
	routes
});

const needToken = ['/m/roll_detail', '/m/contract',
	'/m/createbattle',
	'/m/battleBoxDetails'
	, '/m/battleHistory', '/m/battleDetail', '/m/recharge', '/m/personal'
	, '/m/bag', '/m/record', '/m/spread', '/m/information', '/m/informationDetail', "/m/vip",
	"/p/createbattle"
];

const needReserve = ['/m/battle', '/m/battle/list',
	'/m/createbattle'
	, '/m/battleBoxDetails', '/m/battleHistory', '/m/battleRank', '/m/battleDetail'];

const notShowFooter = ['/m/createbattle', '/m/activity', '/p/activity'];
const notShowHeader = ['/m/createbattle', '/m/activity', '/p/activity'];

//全局路由守卫
router.beforeEach((to, from, next) => {
	window._hmt.push(['_trackPageview', to.fullPath]);
	if (!needToken.includes(to.path)) {
		setCommonView(to.path);
		next();
		return;
	}

	if (store.state.reserveStatus != 1 && needReserve.includes(to.path)) {
		next('/');
		return;
	}

	if (localStorage.getItem(tokenName)) {
		setCommonView(to.path);
		next();
	} else {

		localStorage.setItem("returnURL", to.fullPath)

		if (needToken.includes(from.path)) {
			setCommonView('/');
			next('/');
		} else {
			setCommonView(from.path);
			next(from.path);
		}
		store.commit('setSignView', true);
		// next("")
	}
})

router.afterEach((to, from) => {
	if (store.state.reserveStatus != 1 && needReserve.includes(to.path)) {
		router.replace('/');
		return;
	}
})

function setCommonView(path) {
	store.commit('setFooterView', !notShowFooter.includes(path));
	store.commit('setHeaderView', !notShowHeader.includes(path));
}

export default router