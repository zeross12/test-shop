<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { nextTick, onMounted, onUnmounted, provide, ref } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { wsurl, tokenName } from "./config";
import { _isMobile } from "./util/common";
import { isPCFunc } from "@/util/common";
import { Notify } from "vant";

const store = useStore();
const route = useRoute();
const router = useRouter();

const isRouterAlive = ref(true);
provide("reloadView", { reloadView });

// let websocket = null;
// let socketState = false;
// let activeCloseSocket = false;
// let breakHeartTimer = null;
// let reconnectTimer = null;

onMounted(() => {
	initTSSVid();
	initBdVid();
	store.commit("initLocalData");
	store.dispatch("refreshToken");
	store.dispatch("initConfigList");
	store.dispatch("initModuleList");
	store.dispatch("initGoodsBgList");
	store.dispatch("getOtherConfig");
	// initSocket();
	initResizeView();
	window.addEventListener("resize", viewChangeListener);
	window.addEventListener("orientationchange", viewChangeListener);
});

onUnmounted(() => {
	// activeCloseWebsocket();
	window.removeEventListener("resize", viewChangeListener);
	window.removeEventListener("orientationchange", viewChangeListener);
});

function initResizeView() {
	let isPC = isPCFunc();
	store.commit("setPCClient", isPC);
}

function viewChangeListener() {
	// let isPC = isPCFunc();
	// store.commit("setPCClient", isPC);
	// if (isPC && route.path.startsWith("/m/")) {
	// 	let params = { path: "/p/home" };
	// 	// let url = "https://pc.199skins.com";
	// 	if (route.query.code) {
	// 		params.query = { code: route.query.code };
	// 		// url += "?code=" + route.query.code;
	// 	}
	// 	router.replace(params);
	// 	// window.open(url, "_self");
	// }
	// if (!isPC && route.path.startsWith("/p/")) {
	// 	let params = { path: "/m/home" };
	// 	// let url = "http://test.199skins.com";

	// 	if (route.query.code) {
	// 		params.query = { code: route.query.code };
	// 		// url += "?code=" + route.query.code;
	// 	}
	// 	router.replace(params);
	// 	// window.open(url, "_self");
	// }
}

function initTSSVid() {
	let tssquery = {
		qhclickid: "",
	};
	location.search
		.substring(1)
		.split("&")
		.forEach((item) => {
			tssquery[item.split("=")[0]] = item.split("=")[1];
		});
	if (tssquery.qhclickid) {
		let bz = _isMobile() ? 2 : 1;
		let snnid = tssquery.qhclickid + "," + bz;
		localStorage.setItem("bd_vid", snnid);
	}
}

function initBdVid() {
	let query = {
		bd_vid: "",
	};
	location.search
		.substring(1)
		.split("&")
		.forEach((item) => {
			query[item.split("=")[0]] = item.split("=")[1];
		});
	localStorage.setItem("bd_vid", query.bd_vid);
}

// function initSocket() {
//	 if (websocket) {
//		 websocket.close();
//		 websocket = null;
//	 }
//	 websocket = new WebSocket(wsurl);
//	 websocket.onmessage = onSocketMessage;
//	 websocket.onerror = onSocketError;
//	 websocket.onopen = onSocketOpen;
//	 websocket.onclose = onSocketClose;

//	 Window.webSocketSend = webSocketSend;
//	 Window.closeWebSocketSend = activeCloseWebsocket;
// }

// function activeCloseWebsocket(act = true) {
//	 activeCloseSocket = act;
//	 websocket.close();
//	 websocket = null;
// }

// function webSocketSend(data) {
//	 if (websocket && socketState) {
//		 websocket.send(JSON.stringify(data));
//	 }
// }

// function onSocketOpen() {
//	 socketState = true;
//	 activeCloseSocket = false;
//	 if (breakHeartTimer) {
//		 clearInterval(breakHeartTimer);
//	 }
//	 breakHeartTimer = setInterval(() => {
//		 Window.webSocketSend({ cid: 1 });
//	 }, 7000);

//	 let token = localStorage.getItem(tokenName);
//	 if (token) {
//		 Window.webSocketSend({ cid: 11, data: JSON.stringify({ token: token }) });
//	 }
// }

// function onSocketMessage(res) {
//	 const data = JSON.parse(res.data);
//	 if (data.cid == 2) return;
//	 if (data.cid == 12) {
//		 let isValid = data.isValid;
//	 } else if (data.cid == 101) {
//		 //roll开奖
//		 let rollData = JSON.parse(data.data);
//		 store.commit("setOpenResultRollId", rollData.rollId);
//		 store.dispatch("getUserInfo");
//	 }
// }

// function onSocketError() {
//	 window.$dev && console.log("onSocketError");
//	 websocket.close();
// }

// function onSocketClose() {
//	 window.$dev && console.log("onSocketClose");
//	 socketState = false;
//	 if (breakHeartTimer) {
//		 clearInterval(breakHeartTimer);
//	 }
//	 if (reconnectTimer) {
//		 clearInterval(reconnectTimer);
//	 }
//	 //重连
//	 if (!activeCloseSocket) {
//		 reconnectTimer = setInterval(() => {
//			 if (!socketState) {
//				 initSocket();
//			 } else {
//				 clearInterval(reconnectTimer);
//			 }
//		 }, 5000);
//	 }
// }

function reloadView() {
	isRouterAlive.value = false;
	nextTick(() => {
		isRouterAlive.value = true;
	});
}

Date.prototype.format = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		S: this.getMilliseconds(), //毫秒
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(
			RegExp.$1,
			(this.getFullYear() + "").substr(4 - RegExp.$1.length)
		);
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(
				RegExp.$1,
				RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
			);
		}
	}
	return fmt;
};

// Notify({ type: 'success', message: '通知内容' });
window.NotifyF = (msg) => {
	Notify({ type: "danger", message: msg });
	// Notify({
	//	 message: msg,
	//	 color: "red",
	//	 background: "#ffe1e1",
	// });
};

window.NotifyS = (msg) => {
	Notify({ type: "success", message: msg });
	// Notify({
	//	 message: msg,
	//	 color: "red",
	//	 background: "#ffe1e1",
	// });
};

window.Notify = (msg) => {
	Notify({ type: "success", message: msg });
	// Notify({
	//	 message: msg,
	//	 color: "red",
	//	 background: "#ffe1e1",
	// });
};
</script>

<template>
	<div :class="store.state.isPCClient ? 'pc-root' : 'root'">
		<router-view v-if="isRouterAlive" />
	</div>
</template>

<style lang="scss">
// .root {
// 	// width: 750px;
// }

.pc-root {
	width: 100%;
}

.hide {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.min-wrap-height {
	min-height: calc(100vh - 309px);
}

// .van-toast {
//	 width: 200px !important;
//	 height: 200px !important;

//	 .van-loading__spinner {
//		 width: 100px !important;
//		 height: 100px !important;
//	 }

//	 .van-toast__text {
//		 font-size: 24px !important;
//	 }
// }

.van-overlay {
	background: none;
	background-color: rgba(#000, 0.8);
	z-index: 198 !important;
}

.pc-price-coin {
	width: 14px;
	height: 14px;
	margin-right: 4px;
	margin-bottom: 1px;
}

.pc-common-tabs {
	background-color: #111324;
	font-size: 16px;
	color: #fff;
	display: flex;
	height: 80px;
	line-height: 80px;
	align-items: center;
	text-align: center;
	justify-content: flex-start;
	max-width: 1410px;
	margin: 0px auto;
	box-sizing: border-box;

	.tab-item {
		color: #9ca1c7;
		width: 300px;
		cursor: pointer;

		.icon {
			display: inline-block;
			vertical-align: middle;
			fill: currentColor;
			position: relative;
			top: -2px;
			width: 20px;
			height: 20px;
			color: #9ca1c7;
			margin-right: 12px;
			font-size: 16px;
			text-transform: uppercase;
			flex-shrink: 0;
		}

		&.active {
			color: #fff;
			border-bottom: solid 1px #4b56bc;

			.icon {
				color: #4b56bc;
			}
		}
	}
}

.common-nav {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	position: relative;
	width: 100%;
	border-bottom: 4px solid #fbfa02;

	.common-nav-item {
		width: 211px;
		height: 63px;
		text-align: center;
		line-height: 63px;
		color: #fff;
		font-size: 22px;
		font-weight: bold;
		background: url(@/assets/romimg/common/tab_item.png) no-repeat center;
		background-size: 100% 100%;
		margin-bottom: -4px;
		margin-left: -5px;

		&.active {
			background: url(@/assets/romimg/common/tab_item_active.png) no-repeat center;
			background-size: 100% 100%;
			color: #141427;
			height: 63px;
		}

		&:first-child {
			margin-left: 0px;
		}
	}

	.introduce {
		height: 48px;
		line-height: 48px;
		font-size: 20px;
		color: #fbfa02;
		position: absolute;
		right: 18px;
		top: 0;
	}
}

.common-tab-wrap {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	position: relative;
	width: 100%;

	.common-tab-item {
		width: 140px;
		height: 51px;
		text-align: center;
		line-height: 51px;
		color: #fff;
		font-size: 20px;
		font-weight: bold;
		background: url(@/assets/romimg/common/tab_item.png) no-repeat center;
		background-size: 100% 100%;
		margin-bottom: -4px;
		margin-left: -3px;

		&.active {
			background: url(@/assets/romimg/common/tab_item_active.png) no-repeat center;
			background-size: 100% 100%;
			color: #141427;
			height: 51px;
		}

		&:first-child {
			margin-left: 0px;
		}
	}
}

.common-tab-wrap2 {
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	position: relative;
	width: 100%;

	.common-tab-item {
		text-align: center;
		line-height: 63px;
		color: #f4f4f4;
		font-size: 24px;
		font-weight: bold;
		width: 208px;
		height: 63px;
		background: rgba(69, 69, 69, 0);
		border: 7px solid #fbfa02;

		&.active {
			background: #fbfa02;
			border: 7px solid #fbfa02;
			color: #1f1d2a;
		}
	}
}

.weapon-list {
	display: flex;
	flex-wrap: wrap;
	box-sizing: border-box;
	width: 100%;
	padding: 0 20px;

	.weapon-item {
		position: relative;
		width: 214px;
		height: 331px;
		background-size: contain;
		background-position: center;
		background-repeat: no-repeat;
		margin-right: 33px;
		margin-top: 30px;

		&:nth-child(3n) {
			margin-right: 0;
		}

		.weapon-item-pic {
			width: 180px;
			height: 180px;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 0 auto;

			img {
				max-width: 100%;
				max-height: 100%;
			}
		}

		.weapon-item-name {
			text-align: center;
			padding: 0 10px;
			box-sizing: border-box;
			color: #fff;
			font-weight: bold;
			font-size: 16px;
		}

		.weapon-all-name {
			left: 0px;
			bottom: -35px;
			width: 100%;
			text-align: center;
			background: #353748;
			position: absolute;
			color: #fff;
			line-height: 40px;
			font-size: 16px;
			padding: 0 20px;
			border-radius: 8px;
			z-index: 9;
			box-sizing: border-box;
			display: none;

			&.active {
				display: block;
			}

			&::after {
				display: block;
				content: "";
				width: 33px;
				height: 27px;
				background: url(@/assets/romimg/common/arrow_top.png) no-repeat center;
				background-size: contain;
				position: absolute;
				left: 50%;
				top: -20px;
				transform: translateX(-50%);
			}
		}

		.weapon-item-price {
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			color: #fbfa02;
			font-size: 20px;
			margin-top: 30px;

			.price {
				margin-top: 10px;
			}

			img {
				width: 31px;
				height: 31px;
			}
		}

		.weapon-info {
			display: flex;
			align-items: center;
			justify-content: space-around;
			margin-top: 15px;

			.weapon-item-price {
				margin-top: 0;
			}

			.rate {
				font-size: 18px;
			}
		}

		.join-user-wrap {
			.join-user-price {
				display: flex;
				justify-content: center;
				align-items: center;
				color: #fbfa02;
				font-size: 20px;

				img {
					width: 28px;
					height: 28px;
				}
			}

			.join-user-info {
				display: flex;
				justify-content: center;
				align-items: center;
				color: #fff;
				font-size: 20px;

				p {
					max-width: 130px;
				}
			}
		}

		.text {
			position: absolute;
			left: 100px;
			bottom: 60px;
			height: 40px;
			background: #353748;
			color: #fff;
			line-height: 40px;
			font-size: 16px;
			padding: 0 20px;
			border-radius: 8px;
			white-space: nowrap;
			z-index: 2;
			box-sizing: border-box;
			min-width: 100px;
			display: none;

			&::after {
				display: block;
				content: "";
				width: 33px;
				height: 27px;
				background: url(@/assets/romimg/common/arrow_top.png) no-repeat center;
				background-size: contain;
				position: absolute;
				left: 40px;
				top: 30px;
				transform: rotate(180deg);
			}

			&.show {
				display: block;
			}
		}

		&:nth-child(3n) {
			margin-right: 0;

			.text {
				left: auto;
				right: 10px;

				&::after {
					left: auto;
					right: 40px;
				}
			}
		}

		&:nth-child(3n - 1) {
			.text {
				left: 50%;
				transform: translateX(-1%);

				&::after {
					left: 40px;
				}
			}
		}
	}
}

input:-ms-input-placeholder {
	color: #fff;
}

input::-webkit-input-placeholder {
	color: #fff;
}

input::-moz-placeholder {
	color: #fff;
}

input:-moz-placeholder {
	color: #fff;
}

// .van-notify--danger {
// 	// width: 600px !important;
// 	// padding: 0 60px;
// 	// min-height: 80px;
// 	// border: 4px solid #FBFA02;
// 	// background-size: contain;
// 	// background-color: rgba($color: #1f222b, $alpha: 1) !important;
// 	// font-size: 28px !important;
// 	// font-weight: bold;
// 	// line-height: 1.7em !important;
// 	// top: 100px !important;
// 	// left: 75px !important;
// 	// z-index: 1001 !important;
// }

.van-dialog {
	width: 650px !important;
	height: 380px !important;
	border-radius: 7px;
	background: #272c51 !important;
	box-shadow: 0px 2px 200px 0px #000;

	.van-dialog__content {
		margin-top: 40px;

		.van-dialog__message {
			img {
				width: 34px;
				transform: translateY(8px);
			}

			color: #fff;
			font-size: 28px;
			line-height: 1.75em;
		}
	}

	.van-hairline--top {
		height: 60px;
		margin-top: 30px;
		display: block !important;
		text-align: center;

		&::after {
			display: none;
		}

		.van-button {
			display: flex;
			width: 120px;
			height: 40px;
			justify-content: center;
			align-items: center;
			color: #fff;
			text-align: center;
			font-size: 17px;
			font-style: normal;
			font-weight: 700;
			line-height: 25.5px;
			cursor: pointer;
			margin-right: 18px;
			border-radius: 4px;
			background: #3a34b0;

			.van-button__content {
				width: 100%;
			}

			&::after {
				display: none;
			}

			&:nth-child(2) {
				background: #7d51df;
			}
		}
	}
}
</style>
