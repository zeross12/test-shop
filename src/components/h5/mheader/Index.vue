<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { computed, ref, inject, nextTick } from "vue";
import HeadPortrait from "../head/HeadPortrait.vue";
import { logout } from "@/network/api/login";

import { UserType } from "@/util/util";
import { getShowName } from "@/util/common";
import logoIcon from "@/assets/pcimg/common/logo.png";
import Currency from "../common/Currency.vue";
import { tokenName } from "../../../config";

const store = useStore();
const route = useRoute();
const router = useRouter();
const { reloadView } = inject("reloadView");
const qqGroupDialog = ref(false);

const userInfoBase = computed(() => {
	return store.state.userInfoBase;
});
const userInfoAssets = computed(() => {
	return store.state.userInfoAssets;
});
const noReadMessages = computed(() => store.state.noReadMessages);
const hasLogin = computed(() => store.getters.hasLogin);

const leftMemuData = computed(() => {
	return [
		{
			active: route.name == "m_home",
			show: true,
			icon: "menu_home",
			text: t( 'menu.home' ),
			hot: false,
			clickHandler: function () {
				jumpRoute("/");
			},
		},

		{
			active:
				route.name == "m_battle_list" ||
				route.name == "m_battle_history" ||
				route.name == "m_battle_help" ||
				route.name == "m_battle",
			show:
				!store.state.beiAnExamine &&
				store.state.moduleBattle &&
				store.state.reserveStatus == 1,
			icon: "menu_battle",
			text: t( 'menu.battle' ),
			hot: true,
			clickHandler: function () {
				jumpRoute("/m/battle/list");
			},
		},
		{
			active: route.name == "m_roll" || route.name == "roll_details",
			show: !store.state.beiAnExamine && store.state.moduleRoll,
			icon: "menu_roll",
			text: t( 'menu.rollRoom' ),
			hot: false,
			clickHandler: function () {
				jumpRoute("/m/roll");
			},
		},
		{
			active: route.name == "m_lucky",
			show: store.state.moduleLucky,
			icon: "menu_sp",
			text: t( 'menu.lucky' ),
			hot: false,
			clickHandler: function () {
				jumpRoute("/m/lucky");
			},
		},
		{
			 active: route.name == "m_battle_rank",
			 show: store.state.moduleBattleRank,
			 icon: "menu_battle_rank",
			 text: t( 'menu.rank' ),
			 hot: false,
			 clickHandler: function () {
				 jumpRoute("/m/battleRank");
			 },
		},
		{
			active: route.name == "m_grade",
			show: store.state.moduleGrade,
			icon: "menu_fli",
			text: t( 'menu.gradeBox' ),
			hot: false,
			clickHandler: function () {
				jumpRoute("/m/grade");
			},
		},
		{
			active: route.name == "m_timebox",
			show: store.state.moduleTiming,
			icon: "menu_time",
			text: t( 'menu.timeBox' ),
			hot: false,
			clickHandler: function () {
				jumpRoute("/m/timebox");
			},
		},
		// {
		// 	active: route.name == "m_mall",
		// 	show: store.state.moduleRecharge,
		// 	icon: "menu_mall",
		// 	text: t( 'menu.goldMall' ),
		// 	hot: false,
		// 	clickHandler: function () {
		// 		jumpRoute("/m/mall");
		// 	},
		// },
	];
});

const rightMemuData = computed(() => {
	return [
		// {
		//	 active: route.name == "m_mall",
		//	 show: store.state.moduleRecharge,
		//	 icon: "menu_mall",
		//	 text: "金币商城",
		//	 clickHandler: function () {
		//		 jumpRoute("/m/mall");
		//	 },
		// },
		{
			active: route.name == "m_personal",
			show: true,
			icon: "menu_user",
			text: t( 'menu.userCenter' ),
			clickHandler: function () {
				jumpRoute("/m/personal");
			},
		},
		{
			active: route.name == "m_recharge",
			show: store.state.moduleRecharge,
			icon: "menu_pay",
			text: t( 'menu.rechargeCenter' ),
			clickHandler: function () {
				jumpRoute("/m/recharge");
			},
		},

		// {
		//	 active: route.name == "m_record",
		//	 show: true,
		//	 icon: "&#xe630;",
		//	 text: "个人明细",
		//	 clickHandler: function () {
		//		 jumpRoute("/m/record");
		//	 },
		// },
		// {
		//	 active: route.name == "m_spreadUser",
		//	 show: store.state.userInfoBase.userType == UserType.anchor,
		//	 icon: "&#xe624;",
		//	 text: "推广分红",
		//	 clickHandler: function () {
		//		 jumpRoute("/m/spreadUser");
		//	 },
		// },
		// {
		//	 active: route.name == "m_information",
		//	 show: true,
		//	 icon: "&#xe631;",
		//	 text: "站内信息",
		//	 clickHandler: function () {
		//		 jumpRoute("/m/information");
		//	 },
		// },
		{
			active:
				route.name == "m_contact" ||
				route.name == "m_problem" ||
				route.name == "m_privacy" ||
				route.name == "m_regulations",
			show: true,
			icon: "menu_help",
			text: t( 'menu.supportCenter' ),
			clickHandler: function () {
				jumpRoute("/m/help");
			},
		},
		// {
		//	 active: false,
		//	 show: true,
		//	 icon: "&#xe629;",
		//	 text: "退出登录",
		//	 clickHandler: onClickExitLogin,
		// },
	];
});

const getAssetURL = (image) => {
	return new URL(`../../../assets/romimg/header/${image}.png`, import.meta.url)
		.href;
};

const indexActive = ref(true);
const navShow = ref(false);
const userShow = ref(false);

const needReturn = [
	// "m_createbattle",
	// "m_battleDetail",
	// "m_battle_rank",
	// "m_battle_history",
	// "m_battle_box_details",
	// "m_lucky_details",
	// "m_roll_detail",
	// "m_battleverify",
];
//导航||返回
function isback() {
	return needReturn.includes(route.name);
}

//路由跳转
function jumpRoute(v) {
	router.push(v);
	navShow.value = false;
	userShow.value = false;
}

//左nav
function setNavShow() {
	navShow.value = !navShow.value;
	userShow.value = false;
}

//返回
function routerReturn() {
	router.go(-1);
}

//右nav
function setUserShow() {
	userShow.value = !userShow.value;
	navShow.value = false;
}

// function onClickSign() {
//	 store.commit("setSignView", true);
// }

// 登陆界面
function onClickSign() {
	router.push({
		path: "/m/sign",
	});
}

function onClickRegister() {
	store.commit("setRegisterView", true);
}

async function onClickExitLogin() {
	const res = await logout();
	if (res.code === 0) {
		// userShow.value = false;
		Notify( t( 'menu.loggedOut' ) );
		store.commit("logout");
		nextTick(() => {
			reloadView();
		});
	}
}

function getLogo() {
	if (Window.channelInfo.logoUrl1) {
		return Window.channelInfo.logoUrl1;
	} else {
		return logoIcon;
	}
}

function getTitle() {
	if (route.name == "m_home" || route.name == "m_openbox") {
		route.meta.name = getShowName();
	}
	return route.meta.name;
}

function onClickRed() {
	store.commit("setPassRed", true);
	navShow.value = false;
	userShow.value = false;
}

function onClickService() {
	navShow.value = false;
	userShow.value = false;
	if (localStorage.getItem(tokenName)) {
		let channelId =
			store.getters.getConfigItem("CustomerServiceUrl") || "e5V7gB";

		if (!window._AIHECONG) {
			(function (d, w, c) {
				if (w[c]) return;
				var s = d.createElement("script");
				w[c] = function () {
					(w[c].z = w[c].z || []).push(arguments);
				};
				s.async = true;
				s.src = "https://static.ahc.ink/hecong.js";
				if (d.head) d.head.appendChild(s);
			})(document, window, "_AIHECONG");

			_AIHECONG("ini", {
				channelId: channelId,
				uniqueId: `199skins${store.state.userInfoBase.account}`,
				button: false,
			});
			_AIHECONG("customer", {
				名称 : store.state.userInfoBase.nickName,
				手机 : store.state.userInfoBase.mobile,
				终端 : "MODILE",
				会员账号 : store.state.userInfoBase.account,
			});
			_AIHECONG("showChat");
		} else {
			_AIHECONG("showChat");
		}
	} else {
		router.push("/m/sign");
	}
}

function onClickGroup() {
	navShow.value = false;
	userShow.value = false;
	if (navigator.userAgent.indexOf("UCBrowser") > -1) {
		alert( t( 'menu.browserNotSupport' ) );
	} else {
		if (
			store.state.otherConfig.qqGroup &&
			store.state.otherConfig.qqGroup.length > 0
		) {
			qqGroupDialog.value = true;
			return;
		}
		let qqGroupLink =
			store.getters.getConfigItem("GroupChatUrl") ||
			"https://jq.qq.com/?_wv=1027&k=e1Zb57os";
		window.open(qqGroupLink);
	}
}

function onClickGroupItem(item) {
	window.$dev && console.log(item);
	let qqGroupLink =
		item ||
		store.getters.getConfigItem("GroupChatUrl") ||
		"https://jq.qq.com/?_wv=1027&k=e1Zb57os";
	window.open(qqGroupLink);
}

function formatName(str) {
	if (typeof str == "undefined" || str == null) {
		return "";
	}
	if (typeof str != "string") {
		return "";
	}
	let bytesLen = str.replace(/[^\x00-\xff]/g, "xx").length;
	if (bytesLen > 6) {
		let index = 0;
		let byteLen = 0;
		for (var i = 0; i < str.length; i++) {
			if (str.charCodeAt(i) > 255) {
				byteLen += 2;
			} else {
				byteLen += 1;
			}
			if (byteLen >= 6) {
				index = i;
				break;
			}
		}
		str = str.substr(0, index + 1);
		str = str + "...";
	}
	//cc.log(str, "str+++++++++++++++++ = = ")
	return str;
}
</script>

<template>
	<div
		id="top-header"
		:class="[{ active: route.name == 'm_home' }]"
		v-if="store.state.showHeaderView"
	>
		<div class="header_top" :class="{ active: indexActive }">
			<div class="opt-wrap">
				<div class="nav-btn">
					<img
						class="back"
						v-if="isback()"
						src="@/assets/romimg/header/return.png"
						alt=""
						@click="routerReturn"
					/>
					<img
						v-else
						src="@/assets/romimg/header/left_nav_btn.png"
						alt=""
						@click="setNavShow"
					/>
				</div>
				<div class="logo-wrap">
					<div class="logo">
						<img :src="getLogo()" alt="" @click="jumpRoute('/')" />
						<!-- {{
							getTitle()
						}} -->
					</div>
				</div>
			</div>

			<div class="login-wrap" v-show="!hasLogin" @click="onClickSign">
				<img src="@/assets/romimg/sign/login.png" alt="" srcset="" />
				{{ t( 'router.login' ) }}
			</div>

			<div class="user-wrap" @click="setUserShow" v-show="hasLogin">
				<div class="user-info-wrap">
					<div class="nickname">
						<!-- <span>{{ userInfoAssets.amount }}</span> -->
						{{ formatName(userInfoBase.nickName) }}
					</div>
					<!-- <div class="balance" v-html="showFloat(userInfoAssets.amount)"></div> -->
					<Currency
						:fontsize="12"
						:font-weight="700"
						size="minis"
						:currency="userInfoAssets.amount"
					></Currency>
				</div>
				<div class="user-header">
					<HeadPortrait :userModel="userInfoBase" :size="'one'"></HeadPortrait>
					<div v-if="noReadMessages > 0" class="user-note"></div>
				</div>
			</div>
		</div>
		<div class="header_height"></div>

		<van-popup
			v-model:show="navShow"
			position="left"
			:style="{ height: '100%' }"
		>
			<div
				v-for="(item, index) in leftMemuData"
				:key="index"
				class="nav_item"
				:class="{ active: item.active }"
				@click="item.clickHandler"
			>
				<img :src="getAssetURL(item.icon)" />
				{{ item.text }}
				<div v-if="item.hot" class="hot"></div>
				<span class="icon iconfont">&#xe61e;</span>
			</div>
			<!-- <div
				class="nav_item"
				:class="{ active: route.name == 'm_home' }"
				@click="jumpRoute('/')"
			>
				<img src="@/assets/romimg/nav/home.png" alt="" />首页
			</div>
			<div
				class="nav_item"
				:class="{ active: route.name == 'm_lucky' }"
				v-if="store.state.moduleLucky"
				@click="jumpRoute('/m/lucky')"
			>
				<img src="@/assets/romimg/nav/lucky.png" alt="" />幸运饰品
			</div>
			<div
				class="nav_item"
				v-if="
					!store.state.beiAnExamine &&
					store.state.moduleBattle &&
					store.state.reserveStatus == 1
				"
				:class="{
					active:
						route.name == 'm_battle_list' ||
						route.name == 'm_battle_history' ||
						route.name == 'm_battle',
				}"
				@click="jumpRoute('/m/battle')"
			>
				<img src="@/assets/romimg/nav/battle.png" alt="" />决战沙场
				<div class="fire"><img src="@/assets/romimg/nav/fire.gif" /></div>
			</div>
			<div
				class="nav_item"
				:class="{
					active: route.name == 'm_roll' || route.name == 'roll_details',
				}"
				v-if="!store.state.beiAnExamine && store.state.moduleRoll"
				@click="jumpRoute('/m/roll')"
			>
				<img src="@/assets/romimg/nav/roll.png" alt="" />roll房
			</div> 
			<div
				class="nav_item"
				:class="{ active: route.name == 'm_replacement' }"
				@click="jumpRoute('/m/replacement')"
				v-if="store.state.moduleContract"
			>
				<img src="@/assets/romimg/nav/contract.png" alt="" />饰品置换
			</div>
			<div
				class="nav_item"
				:class="{ active: route.name == 'm_grade' }"
				@click="jumpRoute('/m/grade')"
				v-if="store.state.moduleGrade"
			>
				<img src="@/assets/romimg/nav/grade.png" alt="" />福利盲盒
			</div>
			<div
				class="nav_item"
				:class="{ active: route.name == 'm_timebox' }"
				@click="jumpRoute('/m/timebox')"
				v-if="store.state.moduleTiming"
			>
				<img src="@/assets/romimg/nav/timing.png" alt="" />时间盲盒
			</div>
			<div
				class="nav_item"
				:class="{ active: route.name == 'm_mall' }"
				@click="jumpRoute('/m/mall')"
				v-if="store.state.moduleMall"
			>
				<img src="@/assets/romimg/nav/shop.png" alt="" />弹壳商城
			</div>
			<div
				class="nav_item"
				:class="{ active: route.name == 'm_ammonbox' }"
				@click="jumpRoute('/m/ammonbox')"
				v-if="store.state.moduleAmmonBox"
			>
				<img src="@/assets/romimg/nav/ammonbox.png" alt="" />弹壳盲盒
			</div> -->
		</van-popup>
		<van-popup
			v-model:show="userShow"
			position="right"
			class="user-pop"
			:style="{ height: '100%' }"
		>
			<div class="user_area">
				<div class="user-header">
					<HeadPortrait :userModel="userInfoBase" :size="'two'"></HeadPortrait>
				</div>
				<div class="user-wrap">
					<div class="user_name hide">{{ userInfoBase.nickName }}</div>
					<div class="user_level">
						LV.{{ userInfoBase.userLevel }}
						<!-- <img
							v-for="index in userInfoBase.userLevel"
							:key="index"
							src="@/assets/romimg/header/stars.png"
							alt=""
						/> -->
					</div>
					<div class="user_level">ID:{{ store.state.userId }}</div>
				</div>
			</div>
			<!-- <div class="nav_btn">
				<div class="nav_btn_mall" @click="jumpRoute('/m/mall')">弹壳商城</div>
				<div class="nav_btn_recharge" @click="jumpRoute('/m/recharge')">
					充值
				</div>
			</div> -->

			<div
				v-for="(item, index) in rightMemuData"
				:key="index"
				class="nav_item"
				:class="{ active: item.active }"
				@click="item.clickHandler"
			>
				<img :src="getAssetURL(item.icon)" />
				{{ item.text }}
				<div v-if="item.hot" class="hot"></div>
				<span class="icon iconfont">&#xe61e;</span>
			</div>
			<!-- 
			<div
				class="nav_item"
				:class="{ active: route.name == 'm_personal' }"
				@click="jumpRoute('/m/personal')"
			>
				<img src="@/assets/romimg/nav/personal.png" alt="" />个人资料
			</div>
			<div
				class="nav_item"
				:class="{ active: route.name == 'm_bag' }"
				@click="jumpRoute('/m/bag')"
				v-if="store.state.moduleRucksack"
			>
				<img src="@/assets/romimg/nav/bag.png" alt="" />我的背包
			</div>
			<div
				class="nav_item"
				:class="{ active: route.name == 'm_recharge' }"
				@click="jumpRoute('/m/recharge')"
				v-if="store.state.moduleRecharge"
			>
				<img src="@/assets/romimg/nav/recharge.png" alt="" />账户充值
			</div>
			<div
				class="nav_item"
				:class="{ active: route.name == 'm_record' }"
				@click="jumpRoute('/m/record')"
			>
				<img src="@/assets/romimg/nav/details.png" alt="" />个人明细
			</div>
			<div
				class="nav_item"
				:class="{ active: route.name == 'm_spreadUser' }"
				@click="jumpRoute('/m/spreadUser')"
				v-if="store.state.userInfoBase.userType == UserType.anchor"
			>
				<img src="@/assets/romimg/nav/spread.png" alt="" />推广分红
			</div>
			<div
				class="nav_item"
				:class="{ active: route.name == 'm_information' }"
				@click="jumpRoute('/m/information')"
			>
				<img src="@/assets/romimg/nav/infomation.png" alt="" />站内信息
				<div
					v-if="noReadMessages > 0"
					class="remind"
					:class="{ active: noReadMessages >= 10 }"
				>
					{{ noReadMessages < 100 ? noReadMessages : 99 }}
				</div>
			</div>
			<div
				class="nav_item"
				:class="{
					active:
						route.name == 'm_contact' ||
						route.name == 'm_problem' ||
						route.name == 'm_privacy' ||
						route.name == 'm_regulations',
				}"
				@click="jumpRoute('/m/help')"
			>
				<img src="@/assets/romimg/nav/help.png" alt="" />用户指南
			</div>
		 <div class="sign_out" @click="onClickExitLogin()">退出登录</div> -->
			<!-- <div class="userid-wrap">ID:{{ store.state.userId }}</div> -->
			<div class="tool-wrap">
				<div class="tool-item-wrap" @click="onClickRed">
					<img src="@/assets/romimg/header/red_icon.png" alt="" />
					{{ t( 'menu.redPack' ) }}
				</div>
				<!-- <div class="tool-item-wrap" @click="onClickGroup">
					<img src="@/assets/romimg/header/qq_icon.png" alt="" />
					{{ t( 'menu.groupChat' ) }}
				</div>
				<div class="tool-item-wrap" @click="onClickService">
					<img src="@/assets/romimg/header/kefu_icon.png" alt="" />
					{{ t( 'menu.costomerService' ) }}
				</div> -->
			</div>

			<div class="sign_out" @click="onClickExitLogin()">
				<span class="icon iconfont">&#xe629;</span>
				{{ t( 'menu.logout' ) }}
			</div>
		</van-popup>
		<van-dialog
			v-model:show="qqGroupDialog"
			:showConfirmButton="false"
			:show-cancel-button="true"
		>
			<div class="qqGroup-list-dialog">
				<div
					class="qqGroup-item-wrap"
					v-for="(item, index) in store.state.otherConfig.qqGroup"
					:key="index"
					@click="onClickGroupItem(item)"
				>
					<img src="@/assets/romimg/sidebar/btn_qq.png" alt="" />
					<p>{{ t( 'menu.groupChat' ) }}{{ index + 1 }}</p>
				</div>
			</div>
		</van-dialog>
	</div>
</template>

<style lang="scss">
#top-header {
	background: rgba($color: #191c34, $alpha: 1);

	.header_top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		position: fixed;
		width: 100%;
		height: 124px;
		background: #191c34;
		opacity: 1;
		padding-left: 20px;

		left: 0;
		top: 0;
		z-index: 190;

		&.active {
			z-index: 200;
		}

		.opt-wrap {
			display: flex;
			align-items: center;
			display: flex;
			justify-content: center;

			.nav-btn {
				width: 65px;
				height: 64px;
				display: flex;
				align-items: center;
				justify-content: start;

				img {
					width: 65px;
					height: 64px;
				}

				.back {
					width: 65px;
				}
			}

			.logo-wrap {
				// margin-left: 14px;
				display: flex;
				align-items: center;

				.logo
				{
					display: flex;
					align-items: center;
					img {
						height: 80px;
						margin-top: 6px;
					}
				}
			}
		}

		.login-wrap {
			display: flex;
			align-items: center;
			justify-content: center;

			height: 124px;
			width: 312px;

			color: #fff;

			font-size: 32px;
			font-style: normal;
			font-weight: 300;
			border-bottom: 2px solid #373ab7;
			background: #1f2447;

			img {
				width: 64px;
				height: 64px;
				margin-right: 35px;
			}

			// background: url(@/assets/romimg/header/login_bg.png) no-repeat center;
			// background-size: 100% 100%;
		}

		.user-wrap {
			display: flex;
			height: 100%;
			align-items: center;

			.user-info-wrap {
				display: flex;
				flex-direction: column;
				align-items: end;
				justify-content: center;

				.nickname {
					color: #edeef3;
					font-size: 24px;
					font-style: normal;
					font-weight: 700;
					width: 120px;
					text-align: right;
					margin-bottom: 12px;
					// line-height: 50px;
				}
				// .balance {
				// height: 42px;
				// display: flex;
				// width: 100px;
				// color: #75dc9e;

				// line-height: 42px;
				// font-size: 28px;

				// height: 14px;
				// flex-direction: column;
				// justify-content: center;
				// flex-shrink: 0;
				// }
			}

			.user-header {
				position: relative;
				// margin-left: 12px;

				padding-right: 34px;
				padding-left: 24px;

				.user-note {
					box-sizing: border-box;
					position: absolute;
					width: 28px !important;
					height: 28px !important;
					background: #fa2b37;
					border: #191c34 6px solid;
					border-radius: 50%;
					right: 20px;
					bottom: -10px;
				}
			}
		}
	}

	.header_height {
		height: 124px;
	}

	.van-popup {
		z-index: 199 !important;
		background: #1b313f;
		color: #fff;
		width: 460px;

		.nav_item {
			width: 100%;
			height: 120px;
			padding-left: 10px;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			position: relative;

			font-size: 28px;
			color: #feffff;
			font-weight: 400;
			position: relative;
			border-bottom: 1px solid #233e4f;

			img {
				width: 50px;
				height: 50px;
				margin-left: 20px;
				margin-right: 20px;
				// font-size: 40px;
				// margin: 0px 30px;
				// color: #02f1f2;
			}

			span {
				transform: rotate(180deg);
				position: absolute;
				left: 400px;
				font-size: 30px;
				color: #8ba0b1;
			}

			// img {
			//	 width: 32px;
			//	 margin-bottom: 2px;
			//	 margin-left: 20px;
			//	 margin-right: 36px;
			// }

			&:first-child {
				margin-top: 124px;
			}

			.hot {
				position: absolute;
				left: 374px;
				top: 52px;
				width: 20px;
				height: 20px;
				background-color: red;
				border-radius: 50%;
			}

			// &::before {
			//	 display: block;
			//	 content: "＞";
			//	 position: absolute;
			//	 right: 10px;
			//	 color: #02f1f2;
			// }

			&.active {
				background: rgba($color: #1b313f, $alpha: 0.04);
				color: #fff;

				// &::after {
				//	 display: block;
				//	 content: "";
				//	 position: absolute;
				//	 left: 0;
				//	 top: 0;
				//	 width: 8px;
				//	 height: 100%;
				//	 background: #3a33ac;
				// }
				// &::before {
				//	 display: block;
				//	 content: "＞";
				//	 position: absolute;
				//	 right: 10px;
				//	 color: #02f1f2;
				// }
			}
		}

		&.user-pop {
			width: 460px;
			z-index: 201 !important;
			overflow: hidden;
			// background-color: rgba($color: #141221, $alpha: 1);
			background: #1b313f;
			.nav_btn {
				margin-top: 124px;
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: rgba($color: #11222c, $alpha: 1);
				color: #1a1c24;
				font-size: 20px;
				font-weight: 580;
				height: 90px;

				.nav_btn_mall {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 160px;
					height: 50px;
					background-color: rgba($color: #4e9af9, $alpha: 1);
					border-radius: 10px;
					margin: 10px;
					text-align: center;
					line-height: 50px;
				}

				.nav_btn_recharge {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 160px;
					height: 50px;
					background-color: rgba($color: #eee131, $alpha: 1);
					margin: 10px;
					border-radius: 10px;
					text-align: center;
					line-height: 50px;
				}
			}

			.nav_item {
				position: relative;
				display: flex;
				padding-left: 10px;
				align-items: center;
				background-color: #1b313f;

				img {
					width: 50px;
					height: 50px;
				}

				span {
					transform: rotate(180deg);
					position: absolute;
					left: 400px;
					font-size: 30px;
					color: #8ba0b1;
				}

				&.active {
					background: rgba($color: #fff, $alpha: 0.04);
					color: #fff;
					&::after {
						display: none;
					}
				}

				.remind {
					position: absolute;
					width: 30px;
					height: 30px;
					right: 100px;
					top: 50%;
					transform: translateY(-50%);
					background: rgb(229, 94, 88);
					border-radius: 50%;
					color: #fff;
					text-align: center;
					line-height: 32px;
					font-size: 20px;

					&.active {
						width: 34px;
						border-radius: 40%;
					}
				}
			}
		}

		.user_area {
			text-align: center;
			display: flex;
			align-items: center;
			height: 228px;
			padding: 0px 40px;
			background-color: #11222c;
		}
		.user-wrap {
			margin-left: 20px;
			text-align: left;
			.user_name {
				font-size: 26px;
				font-weight: bold;
				text-align: center;
				text-align: left;
				padding-left: 10px;
			}
			.user_level {
				padding-left: 10px;
				margin-top: 15px;
				text-align: left;
			}

			.user_balance {
				display: inline-block;
				color: #eee131;
				font-size: 26px;
				margin-top: 40px;
				text-align: left;

				p {
					margin-top: -20px;
					font-weight: bold;

					img {
						width: 40px;
						height: 40px;
						vertical-align: middle;
						margin-bottom: 4px;
					}

					.arrow {
						width: 20px;
						height: 22px;
						margin-left: 4px;
					}
				}
			}
		}

		.tool-wrap {
			width: 460px;
			height: 300px;
			// background-color: rgb(8, 28, 40);
			text-align: center;
			display: flex;
			justify-content: space-around;
			align-items: center;
			color: #fff;
			font-size: 28px;
			font-weight: 400;
			padding: 0 50px;

			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			box-sizing: border-box;
			bottom: 130px;

			.tool-item-wrap {
				display: flex;
				// flex-direction: column;
				justify-content: center;
				align-items: center;
				gap: 30px;
				img {
					width: 86px;
					height: 86px;
					// margin-bottom: 20px;
				}
			}
		}

		.sign_out {
			width: 460px;
			height: 120px;
			background-color: rgb(8, 28, 40);
			text-align: center;
			color: #fff;
			font-size: 28px;
			font-weight: 400;
			line-height: 120px;
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			box-sizing: border-box;
			bottom: 0px;
			span {
				font-size: 36px;
				color: #79faff;
				margin-right: 20px;
				vertical-align: middle;
			}
		}

		.fire {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 36px;
			margin-left: 10px;

			img {
				width: 36px;
				height: 48px;
				margin-bottom: 18px;
			}
		}

		.userid-wrap {
			position: absolute;
			bottom: 120px;
			text-align: center;
			width: 100%;
			color: #fff;
			font-size: 24px;
			font-style: normal;
			font-weight: 400;
			line-height: normal;
		}
	}

	.qqGroup-list-dialog {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 80px;

		.qqGroup-item-wrap {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			margin: 0 50px;

			img {
				width: 55px;
				height: 55px;
				margin-bottom: 5px;
			}

			p {
				font-size: 20px;
				color: #fff;
			}
		}
		.van-hairline--top {
			.van-button {
				display: unset !important;
			}
		}
	}
	.van-dialog__footer {
		height: 96px;
		.van-button {
			display: unset !important;
		}
		.van-dialog__cancel {
			width: 250px !important;
			height: 76px !important;
			// line-height: 66px;
			// display: unset !important;
			// .van-button__content {
			// 	// height: 96px !important;
			// 	// display: flex !important;
			// 	// justify-content: center !important;
			// 	// align-items: center;
			// }
			// display: flex !important;
			// justify-content: center !important;
			// align-items: center;
		}
		// display: flex !important;
		// justify-content: center !important;
		// align-items: center;
	}
}
</style>
