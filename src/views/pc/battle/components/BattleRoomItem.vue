<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import HeadPortrait from "@/components/pc/head/HeadPortrait.vue";
import BattleAction from "./BattleAction.vue";
import { onMounted, ref, computed, watch } from "vue";

import { useStore } from "vuex";
import { GoodImageBgType } from "@/util/util";
import { getGoodsLevelColor } from "@/util/common";
import { getGoodsNamePre, getGoodsNameSec } from "@/util/common";

const props = defineProps([
	"battleId",
	"start",
	"peoples",
	"userData",
	"roomStatus",
	"boxList",
	"roomRound",
	"roomPrice",
	"selfJoinStatus",
	"roomId",
]);
const emit = defineEmits([
	"endTransition",
	"randGoodsComplete",
	"slideEnd",
	"joinRoomSuc",
	"onJoinRoom",
]);

const store = useStore();

const waiting = ref(true); //等待||结束/进行中
const usedPrice = ref(0); //初始价格
const userPrice = ref(0); //开箱获得价格
const curPrice = ref(0)	///	当前的价格

const usedAmmunition = ref(0); //初始弹壳
const userAmmunition = ref(0); //开箱获得弹壳

const winGoodsItems = ref([]); //开箱获得
const clientRoomStatus = ref(1); //房间状态(自行控制) 1等待 2进行 3结束

const battleActRef = ref(null);

const curBattleWinFlag = ref(0); /// 当前回合对战结果 1胜 2负 3平
const curBattleRound = computed(() => props.start.round); /// 当前回合
const curRoundBattleRank = ref(0); /// 当前回合对战排名
const roomId = ref(props.roomId); /// 当前房间ID
defineExpose({
	startPostTransition,
	startNextRound,
	openPrize,
	userPrice,
	curRoundBattleRank,
	roomId,
});

onMounted(() => {
	clientRoomStatus.value = props.roomStatus;
	if (clientRoomStatus.value == 3) {
		openPrize();
	} else if (
		clientRoomStatus.value == 2 &&
		props.roomRound != 0 &&
		props.roomRound != -1
	) {
		waiting.value = false;
		handlePrize();
	}
});

function startNextRound() {
	curBattleWinFlag.value = props.userData.roundWinFlag[curBattleRound.value];
	setTimeout(() => {
		battleActRef.value.randomGoodsList();
		curBattleWinFlag.value = 0;
	}, 1000);
}

function randGoodsComplete() {
	emit("randGoodsComplete");
}

function startPostTransition() {
	clientRoomStatus.value = 2;
	waiting.value = false;
	battleActRef.value.postTransition();
}

const sticker = ref([])
function slideEnd() {
	emit("slideEnd");
	/// 获取单局对战结果
	// curBattleWinFlag.value = props.userData.roundWinFlag[curBattleRound.value]

	setTimeout(() => {
		winGoodsItems.value.unshift(
			props.userData.openBoxDatas[props.roomRound].goods
		);

		if (typeof props.userData.openBoxDatas[props.roomRound].sticker != 'undefined' && props.userData.openBoxDatas[props.roomRound].sticker)
			sticker.value.unshift(
				{
					goodsLevel: 6,
					goodsName: `“${props.userData.openBoxDatas[props.roomRound].sticker.stickerLabel}”集字卡`,
					goodsName2: '不可分解',
					price: '0.00',
					iconUrl: props.userData.openBoxDatas[props.roomRound].sticker.stickerIconUrl
				}
			)

		userPrice.value += Number(
			props.userData.openBoxDatas[props.roomRound].goods.price
		);
		curPrice.value += Number(
			props.userData.openBoxDatas[props.roomRound].goods.price
		);
		userAmmunition.value += Number(
			props.userData.openBoxDatas[props.roomRound].ammon
		);
	}, 300);
	setTimeout(() => {
		usedPrice.value = userPrice.value;
		usedAmmunition.value = userAmmunition.value
	}, 500);
}
function endTransition(res) {
	emit("endTransition", res);
}

//开奖
function openPrize() {
	clientRoomStatus.value = 3;
	waiting.value = false;
	winGoodsItems.value = props.userData.winGoodsItems;

	let price = 0;
	let ammo = 0;
	let cur = 0
	for (let i = 0; i < props.userData.winGoodsItems.length; i++) {
		price += Number(props.userData.winGoodsItems[i].price);
	}

	for (let i = 0; i < props.userData.openBoxDatas.length; i++) {
		ammo += Number(props.userData.openBoxDatas[i].ammon);
		cur += Number(props.userData.openBoxDatas[i].goods.price)
	}
	userPrice.value = price;
	curPrice.value = cur
	userAmmunition.value = ammo;
}
//中途进入
function handlePrize() {
	for (let i = 0; i < props.roomRound; i++) {
		winGoodsItems.value.unshift(props.userData.openBoxDatas[i].goods);
		userPrice.value += Number(props.userData.openBoxDatas[i].goods.price);
		curPrice.value += Number(props.userData.openBoxDatas[i].goods.price);
		userAmmunition.value += Number(props.userData.openBoxDatas[i].ammon);
	}
}

async function joinRoom() {
	if (props.selfJoinStatus) {
		return;
	}
	emit("onJoinRoom");
	// Dialog.confirm({
	//		 message: `确定消耗<img src=${goldImgUrl} >${props.roomPrice}加入房间吗?`,
	//		 allowHtml: true
	// }).then(() => {
	//		 joinBattleRoom({ battleId: props.battleId }).then(res => {
	//				 if (res.code == 0) {
	//						 ElNotifcation.success('加入成功');
	//						 store.dispatch("getUserInfo");
	//						 emit('joinRoomSuc');
	//				 }
	//		 }
	//		 )
	// });
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.battle, item.goodsLevel);
}

//颜色--
function getColor(v) {
	return "color:" + getGoodsLevelColor(v);
}

function getWinItemKey(item, index) {
	return item.rucksackGoodsId + "%" + index;
}
</script>

<template>
	<div id="pc-room-item" :class="[{ 'two-pep': peoples == 2 }, { 'three-pep': peoples == 3 }]">
		<div class="room-main-wrap" :class="[
			{ gameing: clientRoomStatus == 2 },
			{ win: clientRoomStatus == 3 && userData.winFlag != 2 },
			{ conduct: clientRoomStatus == 3 && userData.winFlag == 2 },
		]">
			<div class="room-center" :class="{
				nil: clientRoomStatus == 1 && waiting && userData.noBody,
				waiting: clientRoomStatus == 1 && waiting && !userData.noBody,
			}">
				<div class="state" v-show="waiting && clientRoomStatus == 1">
					<div class="wait">
						<div v-show="!userData.noBody" class="wait-item ready">
							<img src="@/assets/pcimg/battle/battle-user-reday-bg.png" alt="" />
							<!-- 准备 -->
						</div>
						<div v-show="userData.noBody" class="wait-item">
							<img src="@/assets/pcimg/battle/battle-user-waiting-bg.png" alt="" />
							<!-- 等待玩家 -->
							<img src="@/assets/pcimg/battle/waiting-spin.png" class="spin" />
						</div>
						<p></p>
					</div>
				</div>
				<div class="state" v-show="waiting && clientRoomStatus != 1">
					<div class="wait"></div>
				</div>
				<div class="state" v-show="!waiting && clientRoomStatus == 3">
					<div class="result" :class="{ userWin: userData.winFlag != 2 }">
						<div :class="[userData.winFlag != 1 ? 'loser' : 'winner']">
							<img v-if="userData.winFlag != 1" src='@/assets/pcimg/battle/flag.svg' alt="">
							<img v-else src='@/assets/pcimg/battle/winner-bg.png' alt="">
							<div class="text">
								{{ userData.winFlag != 1 ? t('battle.loser') : t('battle.winner') }}
							</div>
							<div class="price-result" :class="{
								is_win: userData.winFlag != 2,
								is_lose: userData.winFlag == 2,
							}">
								<div class="result-price">
									<img src="@/assets/pcimg/common/coin.svg" />
									<count-to :startVal="usedPrice" :endVal="userPrice || 0" :duration="800"
										:decimals="2"></count-to>
								</div>
							</div>
						</div>
						<!-- <img class="battle-result-bgimg" src="@/assets/pcimg/battle/winner-bg.png" v-if="userData.winFlag != 2">
							<img class="battle-result-bgimg" src="@/assets/pcimg/battle/loser-bg.png" v-else> -->
					</div>
				</div>
				<BattleAction v-show="!waiting && clientRoomStatus == 2" :order="userData.orderList" :boxList="boxList"
					:winFlag="curBattleWinFlag" ref="battleActRef" :openBoxItems="userData.openBoxDatas"
					:roomRound="roomRound" :props.="props.start" @randGoodsComplete="randGoodsComplete" @slideEnd="slideEnd"
					@endTransition="endTransition">
				</BattleAction>
			</div>
			<div class="user-info-wrap" v-if="!userData.noBody">
				<div class="user-header-wrap">
					<HeadPortrait :userModel="userData" :size="'pc-battle-header'"></HeadPortrait>
					<div class="txt-info">
						<p class="hide">{{ userData.nickName }}</p>
						<p>{{ t('battle.winnerRate') }}:{{ peoples == 3 ? "33.33" : "50" }}%</p>
					</div>
				</div>

				<div class="user-price-wrap" v-if="!waiting">
					<div :class="[
						'price',
						curRoundBattleRank
							? curRoundBattleRank == 1
								? 'winner'
								: 'loser'
							: clientRoomStatus == 3
								? userData.winFlag == 1
									? 'winner'
									: 'loser'
								: 'winner',
					]">
						<img src="@/assets/pcimg/common/coin.svg" alt="" />
						<count-to :startVal="usedPrice" :endVal="curPrice || 0" :duration="800" :decimals="2"></count-to>
					</div>
				</div>
			</div>
			<div class="wait-join-wrap" v-if="userData.noBody">
				<button :class="['join', selfJoinStatus ? 'disabled' : '']" :disabled="selfJoinStatus" @click="joinRoom">
					{{ t('battle.join') }}
				</button>
			</div>
		</div>

		<div class="goods-list-wrap" :class="{ win: clientRoomStatus == 3 && userData.winFlag != 2 }">
			<div class="goods-list" v-show="clientRoomStatus != 1">
				<div class="goods-item" v-for="( item, index ) in sticker" :key="index">
					<div class="price">
						<img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />{{ item.price }}
					</div>
					<div class="pic">
						<img :src="item.iconUrl" alt="" />
					</div>
					<div class="item-info">
						<p class="item-info1">{{ item.goodsName }}</p>
						<p class="item-info2">
							{{ item.goodsName2 }}
						</p>
					</div>
				</div>
				<transition-group name="animation">
					<div class="goods-item" v-for="item in winGoodsItems" :key="item"
						:style="{ background: `url( ${getImageBg(item)} )` }">
						<div class="price">
							<img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />{{ item.price }}
						</div>
						<div class="pic">
							<img :src="item.iconUrl" alt="" />
						</div>
						<div class="item-info">
							<p class="item-info1">{{ getGoodsNamePre(item.goodsName) }}</p>
							<p class="item-info2">
								{{ getGoodsNameSec(item.goodsName, item.goodsType) }}
							</p>
						</div>
					</div>
				</transition-group>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#pc-room-item {
	position: relative;

	.room-main-wrap {
		width: 100%;
		// height: 450px;
		// background: #1B1D33;
		position: relative;
		// padding: 24px 20px 0;
		box-sizing: border-box;

		.user-info-wrap {
			width: 100%;
			overflow: hidden;
			display: flex;
			justify-content: center;
			align-items: center;
			overflow: visible;
			box-sizing: border-box;
			background: transparent;
			margin: 40px 0;

			.user-header-wrap {
				display: flex;
				align-items: center;
				justify-content: center;
				position: relative;
				color: #fff;
				font-size: 14px;
				height: 100%;

				.txt-info {
					display: flex;
					flex-direction: column;
					margin-left: 15px;
					font-size: 20px;
					font-weight: 700;
					line-height: 28px;
					text-transform: uppercase;

					p {
						&:last-child {
							color: #8386a5;
							font-size: 16px;
							text-transform: none;
							font-weight: 500;
						}
					}
				}
			}

			.user-price-wrap {
				flex: 1;
				display: flex;
				justify-content: flex-end;
				padding-right: 20px;
				box-sizing: border-box;
				height: 100%;
				align-items: center;

				.price {
					display: flex;
					justify-content: center;
					align-items: center;
					// color: #fff;

					font-size: 24px;
					font-weight: 700;
					margin-top: 2px;

					&.winner {

						color: #42D7A1;
					}

					&.loser {
						color: #EB4C4B;
					}

					img {
						width: 22px;
						margin-right: 5px;
						margin-top: 2px;
					}
				}
			}
		}

		.wait-join-wrap {
			// display: flex;
			// flex-direction: column;
			// align-items: center;
			// width: 100%;
			// height: 168px;
			// overflow: hidden;
			width: 100%;
			height: 98px;
			overflow: hidden;
			display: flex;
			justify-content: center;
			align-items: center;
			overflow: visible;
			box-sizing: border-box;
			margin-top: 6px;
			background: #111324;

			.join {
				// display: flex;
				// justify-content: center;
				// align-items: center;
				// position: relative;
				// width: 120px;
				// height: 40px;
				// margin: 15px auto 0px;
				// border-radius: 4px;
				// border: 1px solid #313350;
				// color: #CFD4FF;
				// font-size: 14px;
				background: #b24186;
				border: none;
				color: #fff;
				width: 86px;
				height: 52px;
				border-radius: 2px;
				font-size: 18px;

				&.disabled {
					// opacity: .7;
					background: #b24186;
				}
			}

			p {
				font-size: 14px;
			}
		}

		.room-center {
			width: 100%;
			// height: 260px;
			box-sizing: border-box;

			background: #181b2f;

			&.waiting {
				background: #0d0e1a url(@/assets/pcimg/battle/battle-user-body-bg1.png) no-repeat;
				background-size: cover;
			}

			&.nil {
				background: #0d0e1a url(@/assets/pcimg/battle/battle-user-body-bg2.png) no-repeat;
				background-size: cover;
			}

			.state {
				width: 100%;
				height: 100%;

				.wait {
					.wait-item {
						display: flex;
						justify-content: center;
						align-items: center;
						flex-direction: column;
						width: 243px;
						height: 346px;
						// background: url(@/assets/pcimg/battle/detail_light2.png) center no-repeat;
						// background-size: 100% 100%;
						color: #fff;
						font-size: 14px;
						margin: 0 auto;

						img {
							height: 100%;
							// width: 32px;
							// height: 32px;
							// margin-bottom: 3px;

							&.spin {
								position: absolute;
								width: 28px;
								height: 28px;
								top: 148px;
								animation: rotate 1s linear infinite;
							}
						}

						// &.ready {
						//		 // background: url(@/assets/pcimg/battle/detail_light1.png) center no-repeat;
						//		 // background-size: 100% 100%;
						// }
					}
				}

				.result {
					display: flex;
					justify-content: center;
					align-items: center;
					// width: 243px;
					width: 100%;
					height: 346px;
					// background-size: 100% 100%;
					color: #fff;

					font-size: 18px;
					font-weight: 700;
					letter-spacing: 0.54px;
					// margin: 0 auto;
					position: relative;

					// .result-price
					// {
					//		 z-index: 200;
					// }

					.loser,
					.winner {
						// position: absolute;
						width: 100%;
						height: 100%;
						// top: 0;
						// left: 0;
						backdrop-filter: blur(60px);
						background: rgba(21, 23, 44, 0.50) url(@/assets/pcimg/battle/battle-user-body-bg1.png) no-repeat;
						background-size: 100% 100%;
						animation: light 1s ease;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-direction: column;
						gap: 8px;
						// padding-top: 30px;

						.text {
							// margin-bottom: 140px;
							font-weight: 700;
							font-size: 20px;
							color: #fff;
							text-transform: uppercase;
						}

						>img {
							opacity: .3;
						}

						.price-result {
							// width: 200px;
							// height: 80px;
							display: flex;
							justify-content: center;
							align-items: center;
							flex-direction: column;
							font-size: 24px;



							// &:before {
							// 	content: "";
							// 	// position: absolute;
							// 	// top: 30px;
							// 	width: 200px;
							// 	height: 200px;
							// 	opacity: .3;
							// 	// background: url(@/views/pc/battle/shield-tick.png) no-repeat;

							// 	background: url(@/assets/pcimg/battle/winner-bg.png) no-repeat;
							// }

							&.is_win {

								// background: url(@/views/pc/battle/shield-tick.png) no-repeat;
							}

							&.is_lose {
								background: url(@/assets/pcimg/battle/loser-bg.png) no-repeat;
							}

							.result-price {
								// width: 200px;
								display: flex;
								justify-content: center;
								align-items: center;
								position: absolute;
								top: 50%;
								transform: translateY(-50%);
								color: #FFE063;
								font-size: 24px;
								font-weight: 700;
								gap: 8px;

								img {
									margin: 0;
								}
							}

							img {
								margin-right: 6px;
								width: 24px;
							}
						}

						// z-index: 1;
					}

					.loser {
						background: #0d0e1a url(@/assets/pcimg/battle/battle-user-body-bg2.png) no-repeat;
						background-size: 100% 100%;

						.text {
							color: #f83c76;
						}
					}

					.battle-result-bgimg {
						position: absolute;
					}

					// &.userWin {
					//		 // background: url(@/assets/pcimg/battle/detail_light1.png) center no-repeat;
					//		 // background-size: 100% 100%;
					// }
				}
			}
		}

		.bottom-wrap {
			display: block;
			width: 100%;
			height: 42px;
			position: absolute;
			left: 50%;
			bottom: 0;
			transform: translateX(-50%);
			background: linear-gradient(180deg,
					rgba(116, 217, 156, 0) 0%,
					rgba(116, 217, 156, 0.1) 100%);
			border-bottom: 1px solid #75dc9e;
		}

		&.conduct {
			.bottom-wrap {
				background: linear-gradient(180deg,
						rgba(247, 80, 68, 0) 0%,
						rgba(247, 80, 68, 0.1) 100%);
				border-bottom: 1px solid #f75044;
			}
		}

		&.win {
			.bottom-wrap {
				background: linear-gradient(180deg,
						rgba(116, 217, 156, 0) 0%,
						rgba(116, 217, 156, 0.1) 100%);
				border-bottom: 1px solid #75dc9e;
			}
		}
	}

	.goods-list-wrap {
		width: 100%;
		overflow: hidden;
		margin-top: 15px;
		margin-bottom: 15px;
		min-height: 400px;

		.goods-list {
			box-sizing: border-box;
			width: 100%;
			overflow-y: auto;
			overflow-x: hidden;
			// text-align: center;
			// display: grid;
			flex-wrap: wrap;
			// grid-template-columns: repeat(auto-fill, 167px);
			// column-gap: 8px;
			// row-gap: 10px;
			display: flex;
			gap: 8px;

			.goods-item {
				// display: inline-block;
				display: flex;
				flex-direction: column;
				transition: all 0.3s;
				overflow: hidden;
				width: 167px;
				height: 180px;
				flex-shrink: 0;
				border-radius: 5px;
				background: #1b1e38;
				justify-content: space-between;
				background-position: center center !important;
				background-size: cover !important;

				.pic {
					display: flex;
					justify-content: center;
					align-items: center;
					background-repeat: no-repeat;
					background-position: center;
					background-size: cover;
					// width: 130px;
					// height: 116px;
					height: 84px;
					margin: 0 auto;

					img {
						max-width: 90%;
						max-height: 90%;
					}
				}

				.price {
					color: #7bdca2;
					// text-align: center;

					font-size: 14px;
					font-weight: 700;
					display: flex;
					justify-content: flex-end;
					align-items: center;
					padding: 18px 12px 0 0;
					// margin-top: 45px;

					img {
						vertical-align: -2px;
						margin-bottom: 0px;
					}
				}

				.item-info {
					display: flex;
					align-items: flex-start;
					flex-direction: column;
					padding: 0 22px 18px 22px;
					// margin-top: 3px;

					.item-info1 {
						color: rgba(255, 255, 255, 0.6);
						font-size: 13px;
						height: 19.5px;
						line-height: 19.5px;
						width: 100%;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

					.item-info2 {
						color: #fff;
						font-size: 13px;
						line-height: 19.5px;
						width: 100%;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}
			}
		}

		.animation-enter-from,
		.animation-leave-to {
			opacity: 0;
			transform: translateY(-30px);
		}

		.animation-leave-active {
			position: absolute;
		}
	}

	&.two-pep {
		width: 692px;
	}

	&.three-pep {
		width: 460px;

		.result {

			.winner,
			.loser {
				.text {
					font-size: 34px !important;
				}

				.price-result {
					font-size: 22px !important;
				}
			}
		}

		.goods-list-wrap {
			.goods-list {
				grid-template-columns: repeat(auto-fill, 150px);
				column-gap: 5px;
				row-gap: 5px;

				.goods-item {
					width: 145px;
					height: 162px;
					// background-color: #1B1E38 !important;

					.pic {
						height: 74px;
					}

					.price {
						padding: 15px 10px 0 0;
					}
				}
			}
		}
	}
}

@keyframes rotate {
	0% {
		transform: rotate(0);
	}

	25% {
		transform: rotate(90deg);
	}

	50% {
		transform: rotate(180deg);
	}

	75% {
		transform: rotate(270deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

@keyframes light {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}
</style>
