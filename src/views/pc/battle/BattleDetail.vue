<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import Operation from './components/Operation.vue'
import BattleRoomItem from './components/BattleRoomItem.vue'
import Result from '../openbox/components/BoxResult.vue'
import BattleJoinNotice from './BattleJoinNotice.vue'
import { leaveBattleRoom, getBattleDetails, createBattleRoom } from "@/network/api/battle"
import timeProcess from '@/assets/audio/time_6s.mp3'
import { inject, nextTick, onMounted, onUnmounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { add, bignumber } from 'mathjs';
import audioWin from '@/assets/audio/battle_win.mp3';
import { pageChangeShowHide, playAudio, stopAudio, Success } from '@/util/common';
import BattleVerify from "@/views/pc/battle/BattleVerify.vue";
import { Dialog } from "vant";
import useClipboard from "vue-clipboard3";

const { toClipboard } = useClipboard();

const store = useStore();
const route = useRoute();
const router = useRouter();

const start = ref({ manage: false, round: -1, });
const timeAudio = new Audio(timeProcess);//声音
let winaudio = new Audio(audioWin);

let userTransition = [];//所有子组件过渡类名
let endSlide = [];//所有子组件过渡结束
let userRandGoods = [];//所有子组件动画前置处理完毕

const battleId = ref(0);
const battleInfo = ref({});
const userItems = ref([]);
const roomRound = ref(-1);//轮数
const roomStatus = ref(0);//房间状态 1.等待中 2.对战中 3.已结束 4.已解散

const boxList = ref([]);//箱子列表

const selfJoinStatus = ref(false);//是否已加入

const battleRoomRef = ref([]);

const battleJoinNotice = ref(null);
const showVerifyBtn = ref(false);
const battleVerifyRef = ref(null);

const showXCDialog = ref(true);

const resultRef = ref(null);
const isBattle = ref(true);
const resultData = ref({ price: '0', name: '', ammon: 0 });

const showCopyAdd = ref(false)

let detailTimer = null;

const { reloadView } = inject('reloadView')
let { hidden, visState, visibilityChange } = pageChangeShowHide()

/// 集字卡
const sticker = ref([])

onMounted(() => {
	status.value = Number(route.query.status)
	// roomStatus.value = Number( route.query.status )
	battleId.value = Number(route.query.id);
	startDetailTime();

	nextTick(() => {
		document.addEventListener(visibilityChange, reload);
	})
})

onUnmounted(() => {
	stopAudio(winaudio)
	stopAudio(timeAudio)

	leaveRoom();
	stopDetailTime();

	document.removeEventListener(visibilityChange, reload);
})

function share() {
	copy(location.href)
}

async function copy(value) {
	try {
		await toClipboard(value);
		Success(t('common.copySuccess'));
	} catch (e) {
		Warn(t('common.copyFail'))
	}
}

function reload() {
	window.$dev && console.log('reload');
	if (document[visState] == 'visible') {
		reloadView();
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

/// >>>>>>>>>>>>>>>>>>>>>>
/// 新增字段，用来传递游戏结束状态
const gameover = ref(false)
/// <<<<<<<<<<<<<<<<<<<<<<
async function getDetails() {

	const res = await getBattleDetails({ battleId: battleId.value, isSettle: gameover.value });
	if (res.code === 0) {
		let item = res.data.details;
		battleInfo.value = item;

		/// 如果发起时已经是游戏结束状态，但是后台结果未拿到分解状态的话 直接返回 继续轮训
		if (gameover.value && item.status < 3) return

		if (boxList.value.length == 0) {
			boxList.value = getRoomBoxList(item)
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
		}
		else {
			/// 如果开始了对战,停止计时器
			stopDetailTime()
		}

		if (item.status > 2 && userItems.value.length == 0) {
			roomRound.value = item.round - 1;
			start.value.round = roomRound.value;
			userItems.value = item.battleUserDatas;
		}

		// if (item.status > 2 && userItems.value.length == 0) {
		//	 userItems.value = item.battleUserDatas;
		// }

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

			roomRound.value = Math.floor(item.elapsedTime / 6)
			//开始
			nextTick(() => {
				for (let i = 0; i < battleRoomRef.value.length; i++) {
					battleRoomRef.value[i].startNextRound()
				}
			})

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
				battleRoomRef.value[i].openPrize()
			}

			store.dispatch("getUserInfo");
			showVerifyBtn.value = true;
			playWinAudio();
			showResult()
		}

		if (showXCDialog.value && item.battleType == 2) {
			Dialog.confirm({
				message: t('battle.XModeTip'),
				showCancelButton: false,
			})
				.then(() => { })
			showXCDialog.value = false;
		}
	}
}
/// <<<<<<<<<<<<<<<<<<<<<<<<

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
	userRandGoods.push('start')
	if (userRandGoods.length == battleInfo.value.peoples) {
		setTimeout(() => {
			startBattle()
		}, 500)
	}
}

//接收所有子组件本次过渡时间
function endTransition(res) {
	userTransition.push(res)
	if (userTransition.length == battleInfo.value.peoples) {
		playAudio(timeAudio);
	}
}

//接受所有子组件动画结束后
function slideEnd() {
	endSlide.push('end')
	if (endSlide.length == battleInfo.value.peoples) {
		if ((roomRound.value + 1) < boxList.value.length) {
			userRandGoods = []
			userTransition = []
			endSlide = []
			setTimeout(() => {
				roomRound.value += 1
				nextTick(() => {
					/// 这只能分开两部走
					/// 把各用户的当前金币数储存起来
					let battler = battleRoomRef.value.map(room => {
						return { id: room.roomId, price: room.userPrice }
					})

					/// 按金币数量从高到低顺序排序
					battler.sort((a, b) => b.price - a.price)

					let price = 0	/// 金币数
					let rank = 0	 /// 排名
					let same = 0	 /// 同名

					battler.forEach((item, index) => {
						if (item.price == price) {
							item.rank = 1
							same++
						}
						else {
							/// 默认按金币数排名
							rank++
							price = item.price
							same = 0
							item.rank = rank
						}
					})

					battler.forEach(item => {
						battleRoomRef.value[item.id].curRoundBattleRank = item.rank
					})
					// window.$dev && console.log( battler, battleRoomRef.value[0].rank, battleRoomRef.value[1].rank )

					for (let i = 0; i < battleRoomRef.value.length; i++) {
						battleRoomRef.value[i].startNextRound()
					}
				})
			}, 500)
		} else {
			/// >>>>>>>>>>>>>>>>>>>>>
			gameover.value = true

			/// 开始游戏结束后的，结果查询轮训
			detailTimer = setInterval(getDetails, 1000)

			// setTimeout(() => {
			//	 for (let i = 0; i < battleRoomRef.value.length; i++) {
			//		 battleRoomRef.value[i].openPrize()
			//	 }
			//	 store.dispatch("getUserInfo");
			//	 showVerifyBtn.value = true;
			//	 playWinAudio();
			//	 setTimeout(() => {
			//		 showResult();
			//	 }, 1000)
			// }, 1000)
			/// <<<<<<<<<<<<<<<<<<<<<<<
		}
	}
}

//开始对战
function startBattle() {
	start.value.manage = true
	start.value.round = roomRound.value
	for (let i = 0; i < battleRoomRef.value.length; i++) {
		battleRoomRef.value[i].startPostTransition()
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
	};
}

/// >>>>>>>>>>>>>>>>>
/**
 * 从list传过来进入时的游戏状态
 * 用来解决如果游戏已结束时，会弹出分解窗口的问题
 * list页面接口已添加了返回值
 */
const status = ref(0)
// const roomStatus = ref(0);//房间状态 1.等待中 2.对战中 3.已结束 4.已解散
function showResult() {
	/// 如果进入时游戏已经分解直接返回
	if (status.value == 3) return

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
				/// >>>>>>>>>>>>>>>>>>
				let result = { ...winGoodsItems[index] };
				result.id = result.rucksackGoodsId;
				/// <<<<<<<<<<<<<<<<<<
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
	resultRef.value.showReuslt(resultList);
}
/// <<<<<<<<<<<<<<<<<<<<<<<<<<<

/**
 * 关闭后重置路由
 */
function onResultClose() {
	/// >>>>>>>>>>>>>>>>>>>
	router.replace({ path: '/p/battleDetail', query: { id: route.query.id, status: 3 } })
	/// <<<<<<<<<<<<<<<<<<
}

function onJoinRoom() {
	battleJoinNotice.value.joinRoom();
}

function joinRoomSuc() {
	startDetailTime();
}

function onClickBack() {
	router.back();
}

function onVerifyBattle() {
	battleVerifyRef.value.showBattleVerify();
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
		Success(t('battle.createSuccess'));
		store.dispatch("getUserInfo");
		router.push("/p/transfor?id=" + res.data.battleIds[0]);
	}
}

const notJoinNotice = computed(() => store.state.notJoinRoomNotice);

function onCheckNotNotice() {
	store.commit("setBattleNotJoinNoitce", !notJoinNotice.value);
}

function createCopyAdd() {
	if (notJoinNotice.value)
		onClickAdd()
	else
		showCopyAdd.value = true
}
</script>
		
<template>
	<div id="pc-battleDetail" class="min-wrap-height">
		<!-- <van-overlay style="background: rgab( 0, 0, 0, .7 )" z-index="300" :show="showCopyAdd">
			<div class="copy-add-container">
				<div class="header">提示<img src="@/assets/pcimg/common/close.png" @click="showCopyAdd = false"></div>
				<div class="body">
					确定要消耗 <img src="@/assets/pcimg/common/coin.png"> {{battleInfo.joinPrice}} 来创建相同的房间吗？
				</div>
				
				<div class="footer" @click="onClickAdd"> <button>{{ t( 'notify.confirm' ) }}</button> </div>
			</div>
		</van-overlay> -->
		<van-dialog v-model:show="showCopyAdd" show-cancel-button class="pc-join-dialog">
			<div class="join-dialog-wrap">
				<div class="join-content-wrap">
					{{ t('battle.confirmCopy') }} <img src="@/assets/pcimg/common/coin.png">
					<span>{{ battleInfo.joinPrice }}</span> {{ t('battle.copyBattleRoom') }}？
				</div>
			</div>
			<template #footer>
				<div class="join-dialog-bottom">
					<div class="bottom-btn-wrap">
						<div class="join-dialog-btn" @click="showCopyAdd = false">{{ t('notify.cancel') }}</div>
						<div class="join-dialog-btn" @click="onClickAdd">{{ t('notify.confirm') }}</div>
					</div>

					<div class="not-join-notice">
						<div class="check-icon" @click="onCheckNotNotice">
							<img v-if="notJoinNotice" class="checked-wrap" src="@/assets/pcimg/sign/checkbox__inner.png"
								alt="" />
							<div v-else class="check-wrap"></div>
						</div>
						<p>{{ t('battle.noPopupAgain') }}</p>
					</div>
				</div>
			</template>
		</van-dialog>
		<div class="pc-battle-title">
			<div class="title-c">
				<img src="@/assets/pcimg/home/icon_battle2.png" alt="" />
				<p>{{ t('router.battle') }}</p>
				<div class="question"><img src="@/assets/pcimg/battle/question.png" alt="" /></div>
			</div>
			<div class="opts">
				<div class="opt" @click="share">
					<img src="@/assets/pcimg/battle/share.png">{{ t('battle.copyBattleLink') }}
				</div>

				<div class="opt" @click="createCopyAdd">
					<img src="@/assets/pcimg/battle/copy.png">{{ t('battle.copyBattleRoom') }}}
					<p><img src="@/assets/pcimg/common/coin.png"><span>{{ battleInfo.joinPrice }}</span></p>
				</div>

				<div class="opt" @click="onClickBack">
					<img src="@/assets/pcimg/common/back.png" alt="" />{{ t('common.back') }}
				</div>
			</div>
		</div>
		<div class="top-info" v-if="false">
			{{ t('battle.boxNo') }} {{ battleInfo.serialNum }}
			<div class="top-rand-info" v-if="battleInfo.randValue">
				{{ t('battle.randomValue') }} {{ battleInfo.randValue }}
				<span class="info-verify" @click="onVerifyBattle" v-if="showVerifyBtn">{{ t('battle.verifyTitle')
				}}</span>
			</div>
			<p class="bat-type-wrap">{{ battleInfo.battleType == 1 ? t('battle.defaultBattleTitle') : t(
				'battle.XBattleTitle') }}</p>
		</div>
		<Operation :boxList="boxList" :watchCount="battleInfo.watchUserCount" :start="start"
			:joinPrice="battleInfo.joinPrice"></Operation>
		<div class="room-list">
			<BattleRoomItem v-for="(item, index) in userItems" :key="index" :battleId="battleId" :userData="item"
				:roomId="index" :roomStatus="battleInfo.status" ref="battleRoomRef" :roomRound="roomRound"
				:boxList="boxList" :start="start" :roomPrice="battleInfo.joinPrice" @endTransition="endTransition"
				:peoples="battleInfo.peoples" @slideEnd="slideEnd" @randGoodsComplete="randGoodsComplete"
				@onJoinRoom="onJoinRoom" @joinRoomSuc="joinRoomSuc" :selfJoinStatus="selfJoinStatus"></BattleRoomItem>
		</div>
		<!-- 奖品展示 -->
		<Result :goodsList="boxList.goodsList" :isBattle="isBattle" :titleData="resultData" @onClose="onResultClose"
			ref="resultRef"></Result>
		<BattleVerify :serialNum="battleInfo.serialNum" ref="battleVerifyRef"></BattleVerify>
		<BattleJoinNotice :battleId="battleId" :joinPrice="battleInfo.joinPrice" @joinRoomSuc="joinRoomSuc"
			ref="battleJoinNotice"></BattleJoinNotice>
	</div>
</template>
		
<style lang="scss" >
#pc-battleDetail {
	max-width: 1440px;
	width: 100%;
	margin: auto;
	padding: 0 15px;
	box-sizing: border-box;
	min-height: 900px;

	.pc-join-dialog {
		width: 710px !important;
		background-color: #191c34 !important;

		.van-dialog__content {
			.join-dialog-wrap {
				display: flex;
				flex-direction: column;
				align-items: center;
				color: #fff;
				font-size: 20px;
				line-height: 1.75em;

				.join-content-wrap {
					display: flex;
					align-items: center;
					justify-content: center;
					margin-top: 40px;

					img {
						width: 22px;
						margin: 0 6px;
					}

					span {
						color: #75dc9e;
						font-size: 22px;
						font-weight: 700;
						padding-right: 6px;
					}
				}
			}
		}

		.join-dialog-bottom {
			display: flex;
			flex-direction: column;
			align-items: center;

			.bottom-btn-wrap {
				height: 60px;
				margin-top: 30px;
				display: flex;
				text-align: center;
				justify-content: center;

				&::after {
					display: none;
				}

				.join-dialog-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 140px;
					height: 60px;
					background: #3a34b0;
					color: #fff;
					font-size: 18px;
					font-weight: bold;
					margin: 0 20px;

					&::after {
						display: none;
					}

					&:nth-child(2) {
						background: #7d51df;
					}
				}
			}

			.not-join-notice {
				display: flex;
				align-items: center;
				justify-content: center;
				margin: 35px auto 0;

				.check-icon {
					display: flex;
					align-items: center;
					width: 19px;
					margin-right: 10px;
					margin-top: 3px;

					.checked-wrap {
						width: 19px;
						height: 17px;
					}

					.check-wrap {
						width: 17px;
						height: 17px;
						background: #16182e;
						border-radius: 3px;
					}
				}

				p {
					color: #fff;
					font-size: 17px;
				}
			}
		}
	}

	// .copy-add-container
	// {
	//	 display: flex;
	//	 position: fixed;
	//	 width: 420px;
	//	 height: 232px;
	//	 background: #2A2F56;
	//	 flex-direction: column;
	//	 top: calc( 50% - 232px / 2 );
	//	 left: calc( 50% - 360px / 2 );
	//	 justify-content: space-between;
	//	 box-sizing: border-box;
	//	 color: #fff;
	//	 border-radius: 4px;
	//	 overflow: hidden;

	//	 .header
	//	 {
	//		 background: #191C33;
	//		 padding: 20px 40px;
	//		 position: relative;
	//		 font-size: 18px;
	//		 font-weight: 600;

	//		 img
	//		 {
	//			 position: absolute;
	//			 top: 20px;
	//			 right: 20px;
	//		 }
	//	 }

	//	 .body
	//	 {
	//		 font-size: 16px;
	//		 display: flex;
	//		 align-items: center;
	//		 padding: 30px;

	//		 img
	//		 {
	//			 margin: 0 6px;
	//		 }
	//	 }

	//	 .footer
	//	 {
	//		 padding: 0 30px 40px 30px;

	//		 button
	//		 {
	//			 border-radius: 5px;
	//			 background: #0985ED;
	//			 color: #fff;
	//			 width: 100%;
	//			 height: 44px;
	//			 border: none;
	//			 font-size: 16px;
	//			 font-weight: 700;
	//		 }
	//	 }
	// }

	.bg-layer {
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		z-index: 8;
	}

	.pc-battle-title {
		height: 138px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		position: relative;

		.title-c {
			color: #fff;
			font-size: 27px;
			display: flex;
			align-items: center;
			position: relative;

			img {
				width: 28px;
				height: 28px;
				margin-right: 10px;
			}

			.question {
				position: absolute;
				top: -10px;
				right: -36px;

				img {
					width: 17px;
					height: 17px;
				}
			}
		}

		.opts {
			display: flex;
			justify-content: center;
			align-items: center;
			color: #cfd4ff;
			font-size: 14px;

			.opt {
				cursor: pointer;
				margin: 10px;
				display: flex;
				align-items: center;
				padding: 0 50px;
				height: 60px;
				flex-shrink: 0;
				vertical-align: middle;
				border-radius: 4px;
				border: 1px solid #313350;


				img {
					width: 17px;
					height: 17px;
					margin-right: 15px;
				}

				p {
					display: flex;
					align-items: center;
					padding-left: 15px;

					span {

						font-weight: 700;
						font-size: 14px;
						color: #7BDCA2;
					}

					img {
						margin-right: 8px;
					}
				}

			}
		}
	}


	.top-info {
		display: flex;
		flex-direction: column;
		margin-bottom: 8px;
		margin-left: 17px;
		color: #acacac;
		line-height: 32px;
		font-size: 20px;

		p {
			width: 100%;
		}

		.top-rand-info {
			width: 100%;
			display: flex;
			font-size: 20px;

			.info-verify {
				color: #FBFA02;
				margin-left: 10px;
				font-size: 18px;
			}
		}

		.bat-type-wrap {
			color: #FBFA02;
			font-weight: bold;
		}
	}

	.room-list {
		display: flex;
		justify-content: space-between;
		box-sizing: border-box;
		width: 100%;
		margin-top: 16px;
	}
}
</style>