<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, onUnmounted, nextTick, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { tokenName } from "@/config";
import {
	getSigninRecords,
	signin,
	getUserSticker,
	getRewardRecords,
} from "@/network/api/user";
import {
	exchangeReward,
	getRewardList,
	getTodayRecharge,
} from "@/network/api/activity";

import { getActivityList, openRedPacket } from "@/network/api/redpacket";

import Fire from "@/util/fire";

import font0 from "@/assets/pcimg/activity/10.1/font-0.png";
import font1 from "@/assets/pcimg/activity/10.1/font-1.png";
import font2 from "@/assets/pcimg/activity/10.1/font-2.png";
import font3 from "@/assets/pcimg/activity/10.1/font-3.png";

import font4 from "@/assets/pcimg/activity/10.1/font-4.png";
import font5 from "@/assets/pcimg/activity/10.1/font-5.png";
import font6 from "@/assets/pcimg/activity/10.1/font-6.png";
import font7 from "@/assets/pcimg/activity/10.1/font-7.png";

import font_0 from "@/assets/pcimg/activity/10.1/font_0.png";
import font_1 from "@/assets/pcimg/activity/10.1/font_1.png";
import font_2 from "@/assets/pcimg/activity/10.1/font_2.png";
import font_3 from "@/assets/pcimg/activity/10.1/font_3.png";

import font_4 from "@/assets/pcimg/activity/10.1/font_4.png";
import font_5 from "@/assets/pcimg/activity/10.1/font_5.png";
import font_6 from "@/assets/pcimg/activity/10.1/font_6.png";
import font_7 from "@/assets/pcimg/activity/10.1/font_7.png";

import tip0 from "@/assets/pcimg/activity/10.1/ju.png";
import tip1 from "@/assets/pcimg/activity/10.1/guo.png";
import tip2 from "@/assets/pcimg/activity/10.1/tong.png";
import tip3 from "@/assets/pcimg/activity/10.1/qing.png";
import tip4 from "@/assets/pcimg/activity/10.1/yao.png";
import tip5 from "@/assets/pcimg/activity/10.1/ling.png";
import tip6 from "@/assets/pcimg/activity/10.1/xian.png";

const router = useRouter();
const route = useRoute();
const store = useStore();
const sticker = ref([]);

const stickerTop = ref([]);
const stickerBottom = ref([]);
const showRule = ref(false);
const showRedPacketRule = ref(false);

const rewardList = ref([]);
const exchangeRecord = ref([]);

const redPackets = ref([]);
const showCloseBtn = ref(false);

const fire = ref(null);

///	可兑换的红包数量
const reward = ref([3.99, 5.99, 9.99, 19.9, 39.9, 99.9, 199, 399, 999]);
async function getActivityLists() {
	let res = await getActivityList({ platformId: 1 });

	if (res.code == 0) {
		// window.$dev && console.log( res.data )
		redPackets.value = res.data.items.reverse();
		// window.$dev && console.log( redPackets.value )
	}
}

async function getExchangeRecord() {
	let param = {
		limit: 10,
		page: 1,
		sortType: 2,
	};
	let res = await getRewardRecords(param);
	if (res.code == 0) {
		exchangeRecord.value = res.data.items;
	}
}

async function getRewardLists() {
	let res = await getRewardList();

	if (res.code == 0) {
		window.$dev && console.log(res.data);
		rewardList.value = res.data.items;
	}
}

/**
 * 联系客服
 */
function service() {
	if (!hasLogin.value) {
		router.push({
			path: "/m/sign",
		});
	} else {
		if (localStorage.getItem(tokenName)) {
			let channelId =
				store.getters.getConfigItem("CustomerServiceUrl") || "A12fdC";

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
					名称: store.state.userInfoBase.nickName,
					手机: store.state.userInfoBase.mobile,
					终端: "MODILE",
					会员账号: store.state.userInfoBase.account,
				});
				_AIHECONG("showChat");
			} else {
				_AIHECONG("showChat");
			}
		} else {
			store.commit("setSignView", true);
		}
	}
}

async function getStickerList() {
	let res = await getUserSticker();
	if (res.code == 0) {
		sticker.value = res.data.items;

		stickerTop.value = sticker.value.slice(0, 4);
		stickerBottom.value = sticker.value.slice(4);
		stickerBottom.value.splice(1, 0, stickerBottom.value[0]);
	}
}

function onClickGroup() {
	if (navigator.userAgent.indexOf("UCBrowser") > -1) {
		alert( t( 'menu.browserNotSupport' ) );
	} else {
		let item = store.state.otherConfig.qqGroup[0];
		let qqGroupLink = item || store.getters.getConfigItem("GroupChatUrl");
		window.open(qqGroupLink);
	}
}

const font = ref([font0, font1, font2, font3, font4, font5, font6, font7]);

const fontNil = ref([
	font_0,
	font_1,
	font_2,
	font_3,
	font_4,
	font_5,
	font_6,
	font_7,
]);

const tip = ref([tip0, tip1, tip2, tip3, tip4, tip5, tip6]);

const rewardId = ref(0);

const showExchange = ref(false);
const curReward = ref({});
const step = ref(1); ///	当前兑换步骤
const count = ref(1);

/**
 * 关闭兑奖窗口
 */
function closeExchange() {
	showExchange.value = false;
	rewardId.value = 0;
	step.value = 1;
	curReward.value = {};
	count.value = 1;
}

/**
 * 选择奖品
 * @param item Object
 * @param id Number
 */
function selectReward(item, id) {
	rewardId.value = id;
	curReward.value = item;
}

/**
 * 点击进入下一步
 * @returns mixed
 */
function next() {
	if (rewardId.value == 0) {
		return Notify( t( 'activity.changeReward' ) );
	}

	// if( curReward.value.rewardType == 2 )
	// {
	// 	return service()
	// }
	switch (rewardId.value) {
		case 1:
			if (sticker.value[1].stickerCount < 1)
				return Notify("对不起！您的“国”字字符不够");
			if (sticker.value[3].stickerCount < 1)
				return Notify("对不起！您的”庆“字字符不够");
			break;

		case 2:
			if (sticker.value[0].stickerCount < 1)
				return Notify("对不起！您的“举”字字符不够");
			if (sticker.value[1].stickerCount < 1)
				return Notify("对不起！您的“国”字字符不够");
			if (sticker.value[2].stickerCount < 1)
				return Notify("对不起！您的”同“字字符不够");
			if (sticker.value[3].stickerCount < 1)
				return Notify("对不起！您的”庆“字字符不够");
			break;

		case 3:
			if (sticker.value[5].stickerCount < 1)
				return Notify("对不起！您的“领”字字符不够");
			if (sticker.value[6].stickerCount < 1)
				return Notify("对不起！您的”先“字字符不够");
			break;

		case 4:
			if (sticker.value[4].stickerCount < 2)
				return Notify("对不起！您的“遥”字字符不够");
			if (sticker.value[5].stickerCount < 1)
				return Notify("对不起！您的“领”字字符不够");
			if (sticker.value[6].stickerCount < 1)
				return Notify("对不起！您的”先“字字符不够");
			break;
	}

	step.value = 2;
}

const exchanging = ref(false);
/**
 * 兑换奖品
 */
async function exchange() {
	// window.$dev && console.log( rewardId.value )
	if (exchanging.value) return Notify("您的奖品正在兑换中，请稍后再试");
	let param = {
		count: count.value,
		rewardId: rewardId.value,
	};
	// window.$dev && console.log( param )
	exchanging.value = true;
	let res = await exchangeReward(param);
	exchanging.value = false;

	if (res.code == 0) {
		if (curReward.value.rewardType == 2) service();

		Notify(`恭喜您！兑换成功`);
		getStickerList();
		getExchangeRecord();
		store.dispatch("getUserInfo");
		closeExchange();
	}
}

/**
 * 减少兑换数量
 */
function reduce() {
	if (count.value <= 1) return;

	count.value--;
}

/**
 * 增加兑换数量
 */
function add() {
	switch (rewardId.value) {
		case 1:
			if (sticker.value[1].stickerCount < count.value + 1)
				return Notify("对不起！您的“国”字字符不够");
			if (sticker.value[3].stickerCount < count.value + 1)
				return Notify("对不起！您的”庆“字字符不够");
			break;

		case 2:
			if (sticker.value[0].stickerCount < count.value + 1)
				return Notify("对不起！您的“举”字字符不够");
			if (sticker.value[1].stickerCount < count.value + 1)
				return Notify("对不起！您的“国”字字符不够");
			if (sticker.value[2].stickerCount < count.value + 1)
				return Notify("对不起！您的”同“字字符不够");
			if (sticker.value[3].stickerCount < count.value + 1)
				return Notify("对不起！您的”庆“字字符不够");
			break;

		case 3:
			if (sticker.value[5].stickerCount < count.value + 1)
				return Notify("对不起！您的“领”字字符不够");
			if (sticker.value[6].stickerCount < count.value + 1)
				return Notify("对不起！您的”先“字字符不够");
			break;

		case 4:
			if (sticker.value[4].stickerCount < count.value + 1)
				return Notify("对不起！您的“遥”字字符不够");
			if (sticker.value[5].stickerCount < count.value + 1)
				return Notify("对不起！您的“领”字字符不够");
			if (sticker.value[6].stickerCount < count.value + 1)
				return Notify("对不起！您的”先“字字符不够");
			break;
	}
	count.value++;
}

function scrollTo(el) {
	let section = document.querySelector(el);
	window.$dev && console.log(section);

	window.scrollTo({
		top: section.offsetTop,
		behavior: "smooth",
	});
}

function onClickRed() {
	store.commit("setPassRed", true);
}

function getRedTitle(val) {
	return val.replace(/[^\d]/g, "");
}

/**
 * 领取红包
 */
async function getRedPacket(item) {
	if (item.isGet) return Notify("您已领取过此红包");

	let res = await getTodayRecharge();
	// window.$dev && console.log( res, item )
	if (res.code == 0) {
		// window.$dev && console.log( item, Number( res.data.amount ) )
		if (Number(item.needConsumeAmount) <= Number(res.data.amount)) {
			let $res = await openRedPacket({ id: item.id });

			if ($res.code == 0) {
				Notify("红包领取成功");
				getActivityLists();
				// store.dispatch( 'getUserInfo' )
				store.dispatch("getUserInfo");
			} else {
				router.push("/m/recharge");
			}
		} else {
			Notify("对不起！请先充值后再领取");
		}
	}
}

///	2023-9-30 feat
const hasLogin = computed(() => store.getters.hasLogin);

onMounted(() => {
	if (hasLogin.value) {
		init();
	}

	window.addEventListener("scroll", (e) => {
		if (document.documentElement.scrollTop > 60) showCloseBtn.value = true;
		else showCloseBtn.value = false;
	});
});

/**
 * 请求数据
 */
function init() {
	getStickerList();
	getRewardLists();
	getExchangeRecord();
	getActivityLists();
}

/**
 * 点击立即兑换
 */
function exchangeRedPacket() {
	if (!hasLogin.value) {
		router.push({
			path: "/m/sign",
		});
	}
	showExchange.value = true;
}

/**
 * 点击红包显示弹窗
 */
function openRedPacketDialog() {
	///	如果用户未登录直接弹窗登录
	if (!hasLogin.value) {
		router.push({
			path: "/m/sign",
		});
	}

	showRedPacketRule.value = true;
}

function onclickSignRoll() {
	if (!hasLogin.value) {
		router.push({
			path: "/m/sign",
		});
	} else {
		router.push(
			"/m/roll_detail?rollId=" + store.state.activityConfig.roll_id_500
		);
	}
}

const showRewardDialog = ref(true);
const showReward = ref({
	show: false,
	index: 0,
	classs: ["reward", "reward2", "reward3"],
});

const ani = ref(false);

async function showRewardWindow() {
	showReward.value.show = true;
	showRewardDialog.value = false;
	setTimeout(() => (ani.value = true), 300);

	await nextTick();
	fire.value = new Fire("#fire-container", {
		left: -100,
		top: -100,
		height: 500,
	});
	fire.value.run();
}

function closeRewardWindow() {
	showReward.value.show = false;
	ani.value = false;
	showRewardDialog.value = true;
}
function rewardWindowLeft() {
	showReward.value.index = showReward.value.index - 1;
}
function rewardWindowRight() {
	showReward.value.index = showReward.value.index + 1;
}
</script>
<template>
	<div class="act-container">
		<div
			class="close-btn"
			v-show="showCloseBtn"
			@click="router.push('/')"
		></div>
		<div
			class="mini-dialog-container"
			v-if="showRewardDialog && hasLogin"
			@click="showRewardWindow"
		>
			<div class="close" @click.stop="showRewardDialog = false"></div>
		</div>
		<div class="act-header">
			<img src="@/assets/romimg/activity/10.1/header-bg.png" />

			<div class="close" @click="router.push('/')">
				<img src="@/assets/romimg/activity/10.1/close.png" />
			</div>
		</div>
		<div class="act-body">
			<div class="top-btn-group">
				<div class="btn" @click="scrollTo('.section-text-1-subtitle')">
					<img src="@/assets/romimg/activity/10.1/top-btn-1.png" />
				</div>
				<div class="btn" @click="scrollTo('#red-packet')">
					<img src="@/assets/romimg/activity/10.1/top-btn-2.png" />
				</div>
				<div class="btn" @click="scrollTo('#roll')">
					<img src="@/assets/romimg/activity/10.1/top-btn-3.png" />
				</div>
				<div class="btn" @click="scrollTo('#group')">
					<img src="@/assets/romimg/activity/10.1/top-btn-4.png" />
				</div>
			</div>

			<div class="section-1">
				<div class="card-container">
					<img
						src="@/assets/romimg/activity/10.1/section-1-text.png"
						class="title-1"
					/>
					<div class="section-text-1-subtitle">
						<img
							@click="showRule = true"
							src="@/assets/romimg/activity/10.1/section-1-text-subtitle.png"
						/>
					</div>
					<div class="card-items">
						<div class="items-title-test" v-if="!hasLogin">
							<img src="@/assets/romimg/activity/10.1/nil.png" />
						</div>

						<template v-else>
							<div class="items-title">
								<img src="@/assets/romimg/activity/10.1/card-text-1.png" />
								<img src="@/assets/pcimg/activity/10.1/card-subtext-1.png" />
							</div>
							<div class="card-item">
								<div
									class="item"
									v-for="(item, index) in stickerTop"
									:key="index"
								>
									<div class="word">
										<img :src="font[index]" v-if="item.stickerCount > 0" />
										<img :src="fontNil[index]" v-else />
									</div>
									<div class="total">已收集：{{ item.stickerCount }}</div>
								</div>
							</div>

							<div class="items-title margin-top">
								<img src="@/assets/romimg/activity/10.1/card-text-2.png" />
								<img src="@/assets/pcimg/activity/10.1/card-subtext-2.png" />
							</div>
							<div class="card-item">
								<div
									class="item"
									v-for="(item, index) in stickerBottom"
									:key="index"
								>
									<div class="word">
										<img
											:src="font[index + 4]"
											v-if="item.stickerCount > 0 || index == 1"
										/>
										<img :src="fontNil[index + 4]" v-else />
									</div>
									<div class="total" v-if="index != 1">
										已收集：{{ item.stickerCount }}
									</div>
								</div>
							</div>
						</template>
						<!-- <div class="card-help">
							<img src="@/assets/pcimg/activity/10.1/card-text-3.png">
						</div> -->
					</div>

					<div class="card-btn-group">
						<div @click="showRule = true"></div>
						<div @click="exchangeRedPacket"></div>
					</div>
				</div>
			</div>

			<div class="section-2">
				<div class="act-list-container">
					<img src="@/assets/romimg/activity/10.1/section-2-text.png" />
					<div class="section-text-2-subtitle">
						<img
							src="@/assets/romimg/activity/10.1/section-2-text-subtitle.png"
						/>
					</div>

					<div class="card-items">
						<!-- feat:添加弹窗判断是否登录 -->
						<div class="card-item" id="red-packet" @click="openRedPacketDialog">
							<!-- /feat -->
							<div class="icon">
								<img src="@/assets/pcimg/activity/10.1/act-title-1.png" />
								<img src="@/assets/pcimg/activity/10.1/act-icon-1.png" />
							</div>
							<div class="content">
								<div class="header">
									<img src="@/assets/romimg/activity/10.1/act-subtitle-1.png" />
									<!-- <div class="show-rule" @click="showRedPacketRule = true" >
										<img src="@/assets/pcimg/activity/10.1/act-red-rule.png">
									</div>
									<img @click="onClickRed" class="act-btn-1" src="@/assets/pcimg/activity/10.1/act-btn-1.png"> -->
									<img src="@/assets/pcimg/activity/10.1/act-btn-1.png" />
								</div>
								<img src="@/assets/romimg/activity/10.1/act-text-1.png" />
							</div>
						</div>
						<div class="card-item" id="roll" @click="onclickSignRoll">
							<div class="icon">
								<img src="@/assets/pcimg/activity/10.1/act-title-2.png" />
								<img
									src="@/assets/pcimg/activity/10.1/act-icon-2.png"
									class="icon2"
								/>
							</div>
							<div class="content">
								<div class="header">
									<img src="@/assets/romimg/activity/10.1/act-subtitle-2.png" />
									<img
										src="@/assets/pcimg/activity/10.1/act-btn-2.png"
										class="btn2"
									/>
								</div>
								<img src="@/assets/romimg/activity/10.1/act-text-2.png" />
							</div>
						</div>
						<div class="card-item" id="group" @click="onClickGroup">
							<div class="icon">
								<img src="@/assets/pcimg/activity/10.1/act-title-3.png" />
								<img src="@/assets/pcimg/activity/10.1/act-icon-3.png" />
							</div>
							<div class="content">
								<div class="header">
									<img src="@/assets/romimg/activity/10.1/act-subtitle-3.png" />
									<img src="@/assets/pcimg/activity/10.1/act-btn-3.png" />
								</div>
								<img src="@/assets/romimg/activity/10.1/act-text-3.png" />
							</div>
						</div>
					</div>

					<div class="more">
						<img src="@/assets/romimg/activity/10.1/more.png" />
					</div>
				</div>
			</div>
			<div class="act-footer">
				<div>
					<img src="@/assets/pcimg/activity/10.1/beian.png" />
					琼公网安备46020302000293号
				</div>
				<div>琼ICP备 2023003937号-3</div>
				<div>版权所属：海南群友科技有限公司</div>
			</div>
		</div>

		<van-overlay
			:show="showRule"
			style="background: rgba(0, 0, 0, 0.7)"
			z-index="200"
		>
			<div class="rule-container">
				<div class="close-btn" @click="showRule = false">
					<img src="@/assets/pcimg/activity/10.1/close-btn.png" />
				</div>
				<div class="service" @click="service"></div>
			</div>
		</van-overlay>

		<van-overlay
			:show="showRedPacketRule"
			style="background: rgba(0, 0, 0, 0.7)"
			z-index="200"
		>
			<div class="red-packet-rule-container">
				<div class="close-btn" @click="showRedPacketRule = false">
					<img src="@/assets/pcimg/activity/10.1/close-btn.png" />
				</div>
				<div class="red-packet-table">
					<div class="table">
						<div class="th head">当日累计充值</div>
						<div class="td">对应领取红包</div>
					</div>
					<div class="table" v-for="(item, index) in redPackets" :key="index">
						<div class="th">{{ getRedTitle(item.title) }}</div>
						<div class="td">
							<div class="val">{{ reward[index] }}</div>
							<div
								class="btn"
								:class="{ disabled: item.isGet }"
								@click="getRedPacket(item)"
							></div>
						</div>
					</div>
				</div>
			</div>
		</van-overlay>

		<van-overlay
			:show="showExchange"
			style="background: rgba(0, 0, 0, 0.7)"
			z-index="200"
		>
			<div class="exchange-container">
				<div class="close-btn" @click="closeExchange">
					<img src="@/assets/pcimg/activity/10.1/close-btn.png" />
				</div>

				<div class="header">
					<div class="right">
						<div v-for="(item, index) in sticker" :key="index">
							<img :src="tip[index]" />
							<div class="count" v-if="item.stickerCount > 0">
								{{ item.stickerCount }}
							</div>
						</div>
					</div>
				</div>

				<div class="body" v-if="step == 1">
					<div class="body-title">
						请选择您要兑换的奖励：
						<div class="record" @click="step = 3">兑换记录</div>
					</div>
					<div class="items">
						<div
							class="item"
							v-for="(item, index) in rewardList"
							:key="index"
							@click="selectReward(item, index + 1)"
						>
							<img
								src="@/assets/pcimg/activity/10.1/19.9.png"
								v-if="index + 1 == 1"
							/>
							<img
								src="@/assets/pcimg/activity/10.1/199.png"
								v-if="index + 1 == 2"
							/>
							<img
								src="@/assets/pcimg/activity/10.1/1999.png"
								v-if="index + 1 == 3"
							/>
							<img
								src="@/assets/pcimg/activity/10.1/mate60.png"
								v-if="index + 1 == 4"
							/>

							<img
								class="selected"
								src="@/assets/pcimg/activity/10.1/mark.png"
								v-if="rewardId == index + 1"
							/>
						</div>
					</div>
				</div>

				<div class="body row" v-if="step == 2">
					<div class="reward-icon">
						<img
							src="@/assets/pcimg/activity/10.1/19.9.png"
							v-if="rewardId == 1"
						/>
						<img
							src="@/assets/pcimg/activity/10.1/199.png"
							v-if="rewardId == 2"
						/>
						<img
							src="@/assets/pcimg/activity/10.1/1999.png"
							v-if="rewardId == 3"
						/>
						<img
							src="@/assets/pcimg/activity/10.1/mate60.png"
							v-if="rewardId == 4"
						/>
					</div>

					<div class="form">
						<div class="re-title">{{ curReward.rewardName }}</div>
						<div class="input">
							<div>兑换数量：</div>
							<div class="input-number">
								<button @click="reduce">-</button>
								<input readonly v-model="count" />
								<button @click="add">+</button>
							</div>
						</div>
						<div class="desc">
							<div v-if="rewardId == 1">本次兑换将消耗"国"、"庆"字符各1个</div>
							<div v-if="rewardId == 2">
								本次兑换将消耗"举"、"国"、"欢"、"庆"字符各1个
							</div>
							<div v-if="rewardId == 3">本次兑换将消耗"领"、"先"字符各1个</div>
						</div>
					</div>
				</div>

				<div class="body column" v-if="step == 3">
					<div class="table-header">
						<div class="date">兑换日期</div>
						<div class="reward">兑换奖品</div>
						<!-- <div class="spend">消耗字符卡</div> -->
					</div>
					<div class="table-body">
						<div
							class="table-item"
							v-for="(item, index) in exchangeRecord"
							:key="index"
						>
							<div class="date">{{ item.createTime }}</div>
							<div class="reward">{{ item.rewardName }}</div>
							<!-- <div class="spend">
								<div
									class="spend-list"
									v-for="( card, i ) in item.consumeStickerItems"
									:key="i"
								>
									<img :src="card.iconUrl"> ✖️ {{ card.stickerCount }}
								</div>
							</div> -->
						</div>
					</div>
				</div>

				<div class="footer">
					<div class="next-btn" v-if="step == 1">
						<img
							src="@/assets/pcimg/activity/10.1/next-btn.png"
							@click="next"
						/>
					</div>
					<div class="next-btn" v-if="step == 2">
						<img
							src="@/assets/pcimg/activity/10.1/exchange-btn.png"
							@click="exchange"
						/>
					</div>
					<div class="next-btn" v-if="step == 3">
						<img
							src="@/assets/pcimg/activity/10.1/back-btn.png"
							@click="step = 1"
						/>
					</div>
					<img src="@/assets/pcimg/activity/10.1/exchange-tip.png" />
				</div>
			</div>
		</van-overlay>
		<van-overlay
			:show="showReward.show"
			style="background: rgba(0, 0, 0, 0.7)"
			z-index="200"
		>
			<div class="flower" :class="{ ani: ani }"></div>
			<div
				:class="{
					reward1: showReward.classs[showReward.index] == 'reward',
					reward2: showReward.classs[showReward.index] == 'reward2',
					reward3: showReward.classs[showReward.index] == 'reward3',
				}"
				class="reward-container"
				id="fire-container"
			>
				<div class="close" @click="closeRewardWindow"></div>
				<div class="left">
					<img
						v-if="showReward.index > 0"
						@click="rewardWindowLeft"
						src="@/assets/romimg/activity/10.1/allow_left.png"
						alt=""
					/>
					<img
						style="transform: rotate(180deg)"
						v-else
						src="@/assets/romimg/activity/10.1/allow_right.png"
						alt=""
					/>
				</div>
				<div class="right">
					<img
						v-if="showReward.index < showReward.classs.length - 1"
						@click="rewardWindowRight"
						style="transform: rotate(180deg)"
						src="@/assets/romimg/activity/10.1/allow_left.png"
						alt=""
					/>
					<img
						v-else
						src="@/assets/romimg/activity/10.1/allow_right.png"
						alt=""
					/>
				</div>
			</div>
		</van-overlay>
	</div>
</template>
<style lang="scss" scoped>
.act-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
	height: calc(100% - 233px);
	background: #15050e;
	width: 750px;
	overflow: hidden;

	.flower {
		width: 430px;
		height: 400px;
		position: absolute;
		top: calc(50% - 750px / 2);
		left: calc(50% - 430px / 2);
		z-index: 199;
		background: url(@/assets/pcimg/activity/flower.png) no-repeat;
		background-position: center top;
		background-size: contain;

		&.ani {
			transition: 1s;
			transform: scale(1.8);
		}
	}

	.reward-container {
		// border: 1px solid red;
		width: 550px;
		height: 900px;
		position: fixed;
		top: calc(50% - 900px / 2);
		left: calc(50% - 550px / 2);
		background: url(@/assets/pcimg/activity/reward.png) no-repeat;
		background-size: contain;
		z-index: 202;

		&.reward1 {
			background: url(@/assets/pcimg/activity/reward.png) no-repeat;
			background-size: contain;
		}

		&.reward2 {
			background: url(@/assets/pcimg/activity/reward2.png) no-repeat;
			background-size: contain;
		}
		&.reward3 {
			background: url(@/assets/pcimg/activity/reward3.png) no-repeat;
			background-size: contain;
		}

		.close {
			width: 42px;
			height: 42px;
			// border: 1px solid red;
			right: 0;
			position: absolute;
		}
		.left {
			width: 60px;
			height: 60px;
			// border: 1px solid red;
			left: -70px;
			top: 420px;
			position: absolute;
			img {
				width: 60px;
				height: 60px;
			}
			// background-color: #78081d;
		}
		.right {
			width: 60px;
			height: 60px;
			// border: 1px solid red;
			// background-color: #78081d;
			right: -70px;
			top: 420px;
			position: absolute;
			img {
				width: 60px;
				height: 60px;
			}
		}
	}

	.mini-dialog-container {
		position: fixed;
		width: 194px;
		height: 303px;
		// border: 1px solid red;
		left: 32px;
		bottom: 32px;
		background: url(@/assets/romimg/activity/10.1/dialog.png) no-repeat;
		background-size: contain;
		z-index: 1;
		.close {
			// border: 1px solid red;
			width: 42px;
			height: 42px;
			position: absolute;
			right: 0;
		}
	}

	.close-btn {
		// border: 1px solid red;
		width: 76px;
		height: 76px;
		background: url(@/assets/romimg/activity/10.1/close-btn.png) no-repeat;
		background-size: contain;
		position: fixed;
		z-index: 200;
		right: 32px;
		top: 32px;
	}

	.exchange-container {
		background: url(@/assets/romimg/activity/10.1/exchange-bg.png) no-repeat;
		background-size: contain;
		position: fixed;
		width: 716px;
		height: 697px;
		top: calc(50% - 697px / 2);
		left: calc(50% - 716px / 2);
		padding: 42px 43px;
		box-sizing: border-box;

		.footer {
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			// border: 1px solid red;
			padding: 0px 0;

			.next-btn {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-bottom: 24px;
				img {
					width: 40%;
				}
			}

			img {
				width: 80%;
			}
		}

		.body {
			width: 100%;
			height: 310px;
			box-sizing: border-box;
			// border: 1px solid red;
			margin-top: 24px;
			padding: 28px 30px 12px 30px;

			&.column {
				flex-direction: column;
				// border: 1px solid red;
				color: #910c22;
				padding: 28px 48px;

				.table-header {
					display: flex;
					width: 100%;
					font-size: 18px;
					border-bottom: 1px solid #e6aa44;
					padding-bottom: 12px;

					.date {
						width: 240px;
					}

					.reward {
						width: 300px;
						display: flex;
						align-content: center;
					}
				}

				.table-body {
					display: flex;
					flex-direction: column;
					font-size: 16px;
					font-weight: 400;
					// border: 1px solid red;
					height: 220px;
					overflow: hidden;
					overflow-y: scroll;
					// flex: 1;

					.table-item {
						width: 100%;
						display: flex;
						height: 64px;
						border-bottom: 1px solid #e6aa44;
						align-items: center;
						flex: 1 0 auto;

						.date {
							width: 240px;
						}

						.reward {
							width: 300px;
							display: flex;
							align-content: center;
						}
					}
				}
			}

			&.row {
				display: flex;
				padding: 40px 30px 65px 30px;
				gap: 24px;

				.reward-icon {
					height: 200px;

					img {
						height: 100%;
					}
				}

				.form {
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					justify-content: center;
					gap: 12px;
					font-weight: 300;

					.input {
						display: flex;
						align-items: center;
						color: #910c22;
						font-size: 16px;

						.input-number {
							display: flex;
							border: 2px solid #78081d;
							background: #fadb99;
							border-radius: 38px;
							width: 120px;
							height: 38px;
							justify-content: center;
							align-items: center;
							box-sizing: border-box;

							button {
								background: transparent;
								border: none;
								outline: none;
								height: 100%;
								width: 36px;
								// border: 1px solid red;
							}

							input {
								background: transparent;
								border: none;
								outline: none;
								text-align: center;
								height: 100%;
								border-right: 2px solid #78081d;
								border-left: 2px solid #78081d;
								width: calc(120px - 36px * 2);
							}
						}
					}

					.re-title {
						font-size: 24px;
						color: #910c22;
						margin-bottom: 14px;
						font-weight: 700;
					}

					.desc {
						color: #910c22;
						font-size: 18px;
					}
				}
			}

			.items {
				display: flex;
				// border: 1px solid red;
				justify-content: center;
				padding: 0px 0;
				gap: 30px;
				width: 100%; //calc( 190px * 4 + 40px * 3 );

				.item {
					// border: 1px solid red;
					// width: 25%;	//188px;
					height: 220px;
					flex: 0 0 0;
					display: flex;
					align-items: center;
					justify-content: center;

					img {
						width: 130px;
						// height: 100%;
					}

					.selected {
						position: absolute;
					}
				}
			}

			.body-title {
				color: #910c22;
				position: relative;
				width: 100%;
				display: flex;
				justify-content: space-between;
				font-size: 24px;

				.record {
					position: absolute;
					top: 0;
					right: 0;
					text-decoration: underline;
					user-select: none;
					cursor: default;
				}
			}
		}

		.close-btn {
			position: absolute;
			top: 10px;
			right: -5px;
			width: 40px;
			height: 40px;

			img {
				width: 100%;
			}
		}

		.header {
			width: 100%;
			display: flex;
			justify-content: center;
			padding: 74px 0 0 0;
			align-items: center;

			.right {
				display: flex;
				gap: 12px;
				width: 465px;
				justify-content: center;

				div {
					width: 55px;
					height: 65px;
					// border: 1px solid red;
					position: relative;

					img {
						width: 100%;
					}

					.count {
						position: absolute;
						width: 26px;
						color: #fff;
						height: 26px;
						background: #d91e46;
						border-radius: 50%;
						display: flex;
						justify-content: center;
						align-items: center;
						top: -13px;
						right: -10px;
						font-size: 12px;
					}
				}
			}
		}
	}

	.red-packet-rule-container {
		background: url(@/assets/romimg/activity/10.1/red-packet-rule.png) no-repeat;
		background-size: contain;
		width: 678px;
		height: 860px;
		position: fixed;
		top: calc(50% - 860px / 2);
		left: calc(50% - 678px / 2);

		.red-packet-table {
			display: flex;
			// border: 1px solid red;
			// padding-top: 100px;
			margin-top: 200px;
			flex-direction: column;
			padding: 0 48px 0 48px;

			.table {
				border: 1px solid #efc16b;
				height: 240px;
				flex: 1;
				display: flex;

				.th {
					background: #f4c779;
					color: #910c22;
					font-size: 18px;
					display: flex;
					justify-content: center;
					align-items: center;
					width: 40%;
					// height: 100px;
					padding: 0 20px;

					// &.head
					// {
					// 	// width: 110px;
					// }
				}

				.td {
					background: #f9ce87;
					display: flex;
					justify-content: center;
					align-items: center;
					color: #910c22;
					font-size: 18px;
					height: 58px;
					// flex-direction: column;
					width: 60%;
					gap: 18px;
					// min-width: ;

					.btn {
						background: url(@/assets/pcimg/activity/10.1/able.png) no-repeat;
						background-size: contain;
						width: 72px;
						height: 34px;

						&.disabled {
							background: url(@/assets/pcimg/activity/10.1/dis.png) no-repeat !important;
							background-size: contain !important;
						}

						&:hover {
							background: url(@/assets/pcimg/activity/10.1/hover.png) no-repeat;
							background-size: contain;
						}
					}
				}
			}
		}

		.close-btn {
			position: absolute;
			top: 12px;
			right: -20px;
			width: 40px;
			height: 40px;

			img {
				width: 100%;
			}
		}
	}

	.rule-container {
		background: url(@/assets/romimg/activity/10.1/rule-1.png) no-repeat;
		background-size: contain;
		width: 706px;
		height: 705px;
		position: fixed;
		top: calc(50% - 705px / 2);
		left: calc(50% - 706px / 2);

		.close-btn {
			position: absolute;
			top: 17px;
			right: 1px;
			width: 40px;
			height: 40px;

			img {
				width: 100%;
			}
		}

		.service {
			// border: 1px solid red;
			width: 110px;
			height: 24px;
			bottom: 165px;
			position: absolute;
			left: 265px;
			background: #fff;
			opacity: 0;
			background-color: #d91e46;
		}
	}

	.act-header {
		z-index: 10;
		position: relative;
		width: 100%;

		img {
			width: 100%;
		}

		.close {
			position: absolute;
			top: 0;
			right: 41px;
		}
	}

	.act-body {
		// border: 1px solid red;
		height: calc(100% - 233px);
		padding: 110px 0 0 0;
		width: 100%;
		background: url(@/assets/romimg/activity/10.1/bgimg.png) no-repeat;
		background-size: contain;
		margin-top: -62px;

		.act-footer {
			width: 750px;
			height: 200px;
			// border: 1px solid red;
			background-color: rgba(0, 0, 0, 0.25);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 4px;

			div {
				display: flex;
				justify-content: center;
				align-items: center;
				color: #555;
				font-size: 16px;
				gap: 8px;
			}
		}

		.top-btn-group {
			display: flex;
			// border: 1px solid red;
			// width: ;
			gap: 36px;
			justify-content: center;
			padding: 0 54px;
			// border: 1px solid red;
			position: relative;

			.btn {
				width: 155px;
				// height: 131px;

				&:first-child {
					position: absolute;
					top: -30px;
					left: 36px;
				}
				&:last-child {
					// margin-top: -30px;
					position: absolute;
					top: -30px;
					right: 36px;
				}

				img {
					width: 100%;
					height: 100%;
				}
			}
		}

		.section-2 {
			width: 100%;
			display: flex;
			flex-direction: column;
			// height: 100px;
			// border: 1px solid red;
			// justify-content: center;
			align-items: center;
			padding: 44px 0 0 0;

			.act-list-container {
				width: 1009px;
				// border: 1px solid red;
				display: flex;
				flex-direction: column;
				align-items: center;

				img {
					&:first-child {
						width: 446px;
					}
				}

				.section-text-2-subtitle {
					margin-top: 40px;

					img {
						width: 347px;
					}
				}

				.card-items {
					display: flex;
					// border: 1px solid red;
					flex-direction: column;
					margin-top: 30px;
					gap: 48px;
					justify-content: space-between;
					// position: absolute;

					.card-item {
						width: 588px;
						height: 187px;
						background: url(@/assets/pcimg/activity/10.1/act-card-bg.png)
							no-repeat;
						background-size: 100% 100%;
						display: flex;
						padding: 36px 36px 24px 42px;
						box-sizing: border-box;
						justify-content: space-between;
						// align-content: ;

						.icon {
							display: flex;
							flex-direction: column;
							width: 110px;
							position: relative;
							justify-content: flex-end;
							align-items: center;

							.icon2 {
								// width: 241px;
								height: 110px;
								// width: 185px;
								margin-bottom: 6px;
							}

							img {
								height: 110px;

								&:first-child {
									width: 60px;
									height: 20px;
									position: absolute;
									top: -22px;
									left: 4px;
								}
							}
						}

						.content {
							display: flex;
							flex-direction: column;
							width: 380px;
							height: 100%;
							justify-content: flex-start;
							padding-bottom: 12px;
							box-sizing: border-box;
							gap: 4px;

							img {
								width: 90%;
							}

							.header {
								display: flex;
								justify-content: space-between;
								height: 53px;
								align-items: center;

								// .show-rule
								// {
								// 	// margin-left: -30px;
								// 	margin-left: 4px;
								// }

								// .act-btn-1
								// {
								// 	margin-left: -50px;
								// }

								img {
									&:first-child {
										width: 130px;
									}

									&:last-child {
										width: 136px;
									}
								}
							}
						}
					}
				}

				.more {
					width: 100%;
					// margin-top: 100px;
					padding: 80px 0 40px 0;
					display: flex;
					justify-content: center;
				}
			}
		}

		.section-1 {
			display: flex;
			// justify-content: center;
			padding-top: 30px;
			// border: 1px solid red;
			flex-direction: column;
			width: 100%;
			// height: 1000px;
			align-items: center;

			.card-container {
				width: 675px;
				display: flex;
				flex-direction: column;
				align-items: center;
				flex-grow: 0;
				box-sizing: border-box;
				// justify-content: center;
				// border: 1px solid red;
				// height: 800px;

				.title-1 {
					width: 531px;
				}

				// .pc-rule
				// {
				// }

				.section-text-1-subtitle {
					margin-top: 80px;
					margin-bottom: 24px;
					width: 100%;
					// border: 1px solid red;
					display: flex;
					justify-content: flex-end;
					padding-right: 31px;
					box-sizing: border-box;

					img {
						width: 585px;
					}
				}
			}

			.card-items {
				height: 531px;
				width: 675px;
				// border: 1px solid red;
				padding: 48px 30px;
				box-sizing: border-box;
				background: url(@/assets/romimg/activity/10.1/card-bg.png) no-repeat;
				background-position: top center;
				background-size: contain;
				display: flex;
				display: flex;
				flex-direction: column;
				// align-items: flex-start;
				justify-content: center;
				// align-content: center;
				align-items: center;
				// position: absolute;
				.items-title-test {
					// border: 1px solid blue;
					position: absolute;
					left: 300;
					top: 300;
					img {
						width: 675px;
						height: 531px;
					}
				}

				.items-title {
					margin-bottom: 16px;

					img {
						width: 566px;
						&:last-child {
							height: 20px;
							// width: auto;
							width: auto;
							max-width: 100%;
							margin-top: 12px;
						}
					}

					&.margin-top {
						margin-top: 48px;
					}
				}

				.card-item {
					display: flex;
					justify-content: space-between;
					width: 100%;

					.item {
						height: 120px;
						width: 135px;
						// border: 1px solid red;
						background: url(@/assets/romimg/activity/10.1/card-item-bg.png)
							no-repeat;
						background-size: contain;
						display: flex;
						flex-direction: column;

						.word {
							width: 100%;
							height: 96px;
							// border: 1px solid red;
							box-sizing: border-box;
							display: flex;
							justify-content: center;
							align-items: center;

							img {
								width: 38px;
							}
						}

						.total {
							width: 100%;
							height: 24px;
							// border: 1px solid red;
							justify-content: center;
							align-items: center;
							display: flex;
							color: #fbe28d;
							font-size: 16px;
						}
					}
				}

				.card-help {
					display: flex;
					justify-content: center;
					width: 100%;
					padding: 24px 0 0 0;
				}
			}

			.card-btn-group {
				display: flex;
				// border: 1px solid red;
				width: 100%;
				height: 68px;
				justify-content: center;
				margin-top: 20px;
				gap: 12px;

				div {
					// width: 497px;
					// height: 68px;

					&:first-child {
						width: 356px;
						height: 61px;
						background: url(@/assets/romimg/activity/10.1/rule-btn.png)
							no-repeat;
						background-size: contain;
					}

					&:last-child {
						width: 286px;
						height: 61px;
						background: url(@/assets/romimg/activity/10.1/change-btn.png)
							no-repeat;
						background-size: contain;
					}
				}
			}
		}
	}
}
</style>
