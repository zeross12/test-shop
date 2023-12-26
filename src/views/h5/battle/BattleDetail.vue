<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import Operation from "./components/Operation.vue";
import BattleRoomItem from "./components/BattleRoomItem.vue";
import Result from "../openbox/components/Result.vue";
import BattleJoinNotice from "./BattleJoinNotice.vue";
import BattleRule from "./BattleRule.vue";
import {
	leaveBattleRoom,
	getBattleDetails,
	createBattleRoom,
} from "@/network/api/battle";

import timeProcess from "@/assets/audio/time_6s.mp3";
import { inject, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { add, bignumber } from "mathjs";
import audioWin from "@/assets/audio/battle_win.mp3";
import { pageChangeShowHide, playAudio } from "@/util/common";
import { Dialog } from "vant";
import useClipboard from "vue-clipboard3";
import Currency from "@/components/h5/common/Currency.vue";
import ShowDialog from "@/components/h5/common/ShowDialog.vue"

const { toClipboard } = useClipboard();

const store = useStore();
const route = useRoute();
const router = useRouter();

const start = ref({ manage: false, round: -1 });
const timeAudio = new Audio(timeProcess); //声音
let winaudio = new Audio(audioWin);

let userTransition = []; //所有子组件过渡类名
let endSlide = []; //所有子组件过渡结束
let userRandGoods = []; //所有子组件动画前置处理完毕

const battleId = ref(0);
const battleInfo = ref({});
const userItems = ref([]);
const roomRound = ref(-1); //轮数
const roomStatus = ref(0); //房间状态 1.等待中 2.对战中 3.已结束 4.已解散

const boxList = ref([]); //箱子列表

const selfJoinStatus = ref(false); //是否已加入

const battleRoomRef = ref([]);

const battleJoinNotice = ref(null);
const battleRuleRef = ref(null);
const showVerifyBtn = ref(true);
const ruleDisVerify = ref(false);

const showXCDialog = ref(true);

const bgLayer = ref(null);
const resultRef = ref(null);
const isBattle = ref(true);
const resultData = ref({ price: "0", name: "", ammon: 0 });

let detailTimer = null;

// const { reloadView } = inject("reloadView");
let { hidden, visState, visibilityChange } = pageChangeShowHide();

onMounted(() => {
	status.value = Number(route.query.status);
	battleId.value = Number(route.query.id);
	startDetailTime();

	nextTick(() => {
		document.addEventListener(visibilityChange, reload);
	});
});

onUnmounted(() => {
	leaveRoom();
	stopDetailTime();

	document.removeEventListener(visibilityChange, reload);
});

function reload() {
	if (document[visState] == "visible") {
		// reloadView();
	} else {
		stopDetailTime();
	}
}

function startDetailTime() {
	stopDetailTime();
	getDetails();
	detailTimer = setInterval(() => {
		getDetails();
	}, 3000);
}

function stopDetailTime() {
	if (detailTimer != null) {
		clearInterval(detailTimer);
		detailTimer = null;
	}
}

async function leaveRoom() {
	if (roomStatus.value < 3) {
		await leaveBattleRoom({ battleId: battleId.value });
	}
}

const gameover = ref(false);

async function getDetails() {
	const res = await getBattleDetails({
		battleId: battleId.value,
		isSettle: gameover.value,
	});

	if (res.code === 0) {
		let item = res.data.details;
		battleInfo.value = item;

		/// 如果发起时已经是游戏结束状态，但是后台结果未拿到分解状态的话 直接返回 继续轮训
		if (gameover.value && item.status < 3) return;

		if (boxList.value.length == 0) {
			boxList.value = getRoomBoxList(item);
		}
		if (item.status < 2) {
			userItems.value = item.battleUserDatas;
			let offset = item.peoples - userItems.value.length;
			if (offset > 0) {
				for (let i = 0; i < offset; i++) {
					userItems.value.push({ noBody: true });
				}
			}
			for (const user of userItems.value) {
				if (user.isSelf) {
					selfJoinStatus.value = true;
				}
			}
		} else {
			/// 如果开始了对战,停止计时器
			stopDetailTime();
		}

		if (item.status > 2 && userItems.value.length == 0) {
			roomRound.value = item.round - 1;
			start.value.round = roomRound.value;
			userItems.value = item.battleUserDatas;
		}

		//开始游戏
		if (roomStatus.value < 2 && item.status == 2) {
			//goodlist
			let boxItems = item.boxItems;
			let boxLength = boxList.value.length;
			for (let i = 0; i < boxLength; i++) {
				let box = boxList.value[i];
				let boxItem = boxItems[box.boxId];
				if (boxItem) {
					box.goodsList = boxItem.goodsItems;
				}
			}

			//orderlist
			userItems.value = item.battleUserDatas;
			for (let i = 0; i < userItems.value.length; i++) {
				userItems.value[i].orderList = [];
			}
			for (let i = 0; i < boxLength; i++) {
				let nineIndex = Math.floor(Math.random() * item.peoples);
				userItems.value[nineIndex].orderList.push(9);
				for (let j = 0; j < userItems.value.length; j++) {
					if (j != nineIndex) {
						userItems.value[j].orderList.push(Math.floor(Math.random() * 9));
					}
				}
			}

			roomRound.value = Math.floor(item.elapsedTime / 6);
			//开始
			nextTick(() => {
				for (let i = 0; i < battleRoomRef.value.length; i++) {
					battleRoomRef.value[i].startNextRound();
				}
			});
		}
		if (roomStatus.value == 0 && item.status > 2) {
			showVerifyBtn.value = true;
		}

		roomStatus.value = item.status;
		// if (item.status > 2) {
		//	 stopDetailTime();
		// }

		if (item.status == 3) {
			userItems.value = item.battleUserDatas;
			for (let i = 0; i < battleRoomRef.value.length; i++) {
				battleRoomRef.value[i].openPrize();
			}

			store.dispatch("getUserInfo");
			showVerifyBtn.value = true;
			playWinAudio();
			showResult();
		}

		if (showXCDialog.value && item.battleType == 2) {
			Dialog.confirm({
				message: t('battle.XModeTip'),
				showCancelButton: false,
			}).then(() => { });
			showXCDialog.value = false;
		}
	}
}

function getRoomBoxList(item) {
	let boxItems = item.boxItems || [];
	let boxIds = item.boxIds || [];
	let list = [];
	for (let i = 0; i < boxIds.length; i++) {
		let id = boxIds[i];
		if (boxItems[id]) {
			list.push(boxItems[id]);
		}
	}
	return list;
}

//全部动画数组处理完成
function randGoodsComplete() {
	userRandGoods.push("start");
	if (userRandGoods.length == battleInfo.value.peoples) {
		setTimeout(() => {
			startBattle();
		}, 500);
	}
}

//接收所有子组件本次过渡时间
function endTransition(res) {
	userTransition.push(res);
	if (userTransition.length == battleInfo.value.peoples) {
		playAudio(timeAudio);
	}
}

//接受所有子组件动画结束后
function slideEnd() {
	endSlide.push("end");
	if (endSlide.length == battleInfo.value.peoples) {
		if (roomRound.value + 1 < boxList.value.length) {
			userRandGoods = [];
			userTransition = [];
			endSlide = [];
			setTimeout(() => {
				roomRound.value += 1;
				nextTick(() => {
					let battler = battleRoomRef.value.map((room) => {
						return { id: room.roomId, price: room.userPrice };
					});
					/// 按金币数量从高到低顺序排序
					battler.sort((a, b) => b.price - a.price);

					let price = 0; /// 金币数
					let rank = 0; /// 排名
					let same = 0; /// 同名

					battler.forEach((item, index) => {
						if (item.price == price) {
							item.rank = 1;
							same++;
						} else {
							/// 默认按金币数排名
							rank++;
							price = item.price;
							same = 0;
							item.rank = rank;
						}
					});

					// battler.forEach((item) => {
					//	 battleRoomRef.value[item.id].curRoundBattleRank = item.rank;
					// });

					for (let i = 0; i < battleRoomRef.value.length; i++) {
						battleRoomRef.value[i].startNextRound();
					}
				});
			}, 500);
		} else {
			/// >>>>>>>>>>>>>>>>>>>>>
			gameover.value = true;

			/// 开始游戏结束后的，结果查询轮训
			detailTimer = setInterval(getDetails, 1000);

			// setTimeout(() => {
			//	 for (let i = 0; i < battleRoomRef.value.length; i++) {
			//		 battleRoomRef.value[i].openPrize();
			//	 }
			//	 store.dispatch("getUserInfo");
			//	 showVerifyBtn.value = true;
			//	 playWinAudio();
			//	 setTimeout(() => {
			//		 showResult();
			//	 }, 1000);
			// }, 1000);
		}
	}
}

//开始对战
function startBattle() {
	start.value.manage = true;
	start.value.round = roomRound.value;
	for (let i = 0; i < battleRoomRef.value.length; i++) {
		battleRoomRef.value[i].startPostTransition();
	}
}

function playWinAudio() {
	let selfWin = false;
	for (let i = 0; i < userItems.value.length; i++) {
		let userItem = userItems.value[i];
		if (userItem.winFlag != 2 && userItem.isSelf) {
			selfWin = true;
			break;
		}
	}
	if (selfWin) {
		playAudio(winaudio);
	}
}
/**
 * 从list传过来进入时的游戏状态
 * 用来解决如果游戏已结束时，会弹出分解窗口的问题
 * list页面接口已添加了返回值
 */
const status = ref(0);

function showResult() {
	/// 如果进入时游戏已经分解直接返回
	if (status.value == 3) return;

	let resultList = [];
	let selfWin = false;
	for (let i = 0; i < userItems.value.length; i++) {
		let userItem = userItems.value[i];
		if (userItem.winFlag != 2 && userItem.isSelf) {
			let winGoodsItems = userItem.winGoodsItems;
			let openBoxDatas = userItem.openBoxDatas;

			let price = Number(userItem.winAmount);
			let ammon = 0;
			for (let index = 0; index < winGoodsItems.length; index++) {
				let result = { ...winGoodsItems[index] };
				result.id = result.rucksackGoodsId;
				resultList.push(result);
				price = add(bignumber(price), bignumber(winGoodsItems[index].price));
			}

			for (let index = 0; index < openBoxDatas.length; index++) {
				ammon += Number(openBoxDatas[index].ammon);
			}
			resultData.value.price = price;
			resultData.value.ammon = ammon;
			resultData.value.name = userItem.nickName;
			selfWin = true;
			break;
		}
	}
	if (!selfWin) return;
	bgLayer.value = true;
	resultRef.value.showReuslt(resultList);
}

function onResultClose() {
	bgLayer.value = false;
	/// >>>>>>>>>>>>>>>>>>>
	router.replace({
		path: "/m/battleDetail",
		query: { id: route.query.id, status: 3 },
	});
	/// <<<<<<<<<<<<<<<<<<
}

function onJoinRoom() {
	battleJoinNotice.value.joinRoom();
}

function joinRoomSuc() {
	startDetailTime();
}

function onVerifyBattle() {
	ruleDisVerify.value = false;
	battleRuleRef.value.showRule();
}

function goBattleVerify() {
	router.push({
		path: "/m/battleverify",
		query: { serialNum: battleInfo.value.serialNum },
	});
}

function onOpenRule() {
	ruleDisVerify.value = true;
	battleRuleRef.value.showRule();
}
function back() {
	router.go(-1);
}

async function copy() {
	try {
		await toClipboard(window.location.href);
		Notify(t('common.copySuccess'));
	} catch (e) {
		NotifyF('common.copyFail');
	}
}

async function onClickAdd() {
	let params = {};
	params.peoples = battleInfo.value.peoples;
	params.roomCount = 1;
	params.battleType = battleInfo.value.battleType;
	params.boxIds = battleInfo.value.boxIds;
	const res = await createBattleRoom(params);
	showCopyAdd.value = false;
	if (res.code === 0) {
		Notify(t('battle.createSuccess'));
		store.dispatch("getUserInfo");
		router.push("/m/transfor?id=" + res.data.battleIds[0]);
	}
}
let showCopyAdd = ref(false);
</script>

<template>
	<div id="battleDetail" class="min-wrap-height">
		<div class="bg-layer" v-show="bgLayer"></div>
		<div class="top-info">
			<p @click="back()">
				<span class="icon iconfont">&#xe61e;</span>

				<!-- {{ battleInfo.serialNum }} -->
			</p>
			<div class="top-rand-info">
				<!-- 随机数 {{ battleInfo.randValue }} -->
				<!-- <span class="info-verify" v-if="showVerifyBtn" @click="goBattleVerify"
					>关于公平性验证</span
				> -->
				<span @click="copy" class="icon iconfont">&#xe656;</span>
				<span @click="showCopyAdd = true" class="icon iconfont">&#xe655;</span>
				<Currency :currency="battleInfo.joinPrice" :font-weight="700"></Currency>
			</div>
			<!-- <p class="bat-type-wrap">
				{{
					battleInfo.battleType == 1
						? "经典对战(价值高者获得奖品)"
						: "小丑对战(价值低者获得奖品)"
				}}
			</p> -->
		</div>
		<Operation :boxList="boxList" :watchCount="battleInfo.watchUserCount" :start="start" @openRule="onOpenRule">
		</Operation>
		<div class="room-list">
			<BattleRoomItem v-for="(item, index) in userItems" :key="index" :battleId="battleId" :userData="item"
				:roomStatus="battleInfo.status" ref="battleRoomRef" :roomRound="roomRound" :boxList="boxList" :start="start"
				:roomPrice="battleInfo.joinPrice" @endTransition="endTransition" :peoples="battleInfo.peoples"
				@slideEnd="slideEnd" @randGoodsComplete="randGoodsComplete" @onJoinRoom="onJoinRoom"
				@joinRoomSuc="joinRoomSuc" :selfJoinStatus="selfJoinStatus"></BattleRoomItem>
		</div>
		<!-- 奖品展示 -->
		<Result :goodsList="boxList.goodsList" :isBattle="isBattle" :titleData="resultData" @onClose="onResultClose"
			ref="resultRef"></Result>
		<BattleJoinNotice :battleId="battleId" :joinPrice="battleInfo.joinPrice" @joinRoomSuc="joinRoomSuc"
			ref="battleJoinNotice"></BattleJoinNotice>
		<BattleRule :serialNum="battleInfo.serialNum" :disVerify="ruleDisVerify" ref="battleRuleRef" />

		<ShowDialog :btn-type="2" :title="t('battle.copyBattleRoom')" :show="showCopyAdd" @cancel="showCopyAdd = false"
			@ok="onClickAdd">
			<div class="dialog-x-content">
				<div class="dialog-row-wrap tips">
					{{ t('battle.confirmCopy') }} &nbsp;
					<Currency :currency="battleInfo.joinPrice" :font-weight="700" :fontsize="16"></Currency>&nbsp; {{ t(
						'battle.confirmText') }}
				</div>
			</div>
		</ShowDialog>

		<!-- <ShowDialog
			:btn-type="-1"
			title="决战沙场"
			:show="detailScreenShow"
			@ok="detailScreenShow = false"
			@cancel="detailScreenShow = false"
		>
			
		</ShowDialog> -->
	</div>
</template>

<style lang="scss">
#battleDetail {
	box-sizing: border-box;
	width: 100%;
	background: #15172c;
	color: #fff;

	.bg-layer {
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		z-index: 8;
	}

	.top-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 160px;
		width: 710px;
		margin: auto;
		box-sizing: border-box;
		// flex-direction: column;
		// margin-top: 8px;
		// margin-bottom: 8px;
		// margin-left: 17px;
		color: #4c4f5d;
		// line-height: 38px;
		font-size: 24px;

		p {
			color: #b4b8cd;

			// width: 100%;
			span {
				margin-right: 50px;
				font-size: 36px;
			}
		}

		.top-rand-info {
			display: flex;

			padding-right: 30px;

			.icon {
				font-size: 36px;
				color: #fff;
				margin-right: 30px;
			}

			.info-verify {
				color: #6a77ff;
				margin-left: 10px;
				font-size: 24px;
			}
		}

		.bat-type-wrap {
			color: #fbfa02;
			font-weight: bold;
		}
	}

	.room-list {
		display: flex;
		justify-content: space-around;
		box-sizing: border-box;
		width: 100%;
		margin-top: 20px;
		padding: 0 20px;
	}
}
</style>
