<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import HeadPortrait from "@/components/h5/head/HeadPortrait.vue";
import BattleAction from "./BattleAction.vue";
import { onMounted, ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { GoodImageBgType } from "@/util/util";
import { getGoodsLevelColor, FormatNickname } from "@/util/common";

import Currency from "@/components/h5/common/Currency.vue";

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
]);
const emit = defineEmits([
	"endTransition",
	"randGoodsComplete",

	"slideEnd",
	"joinRoomSuc",
	"onJoinRoom",
]);
defineExpose({
	startPostTransition,
	startNextRound,
	openPrize,
});

watch(
	() => {
		props.roomRound;
	},
	(newValue, oldValue) => {
		window.$dev && console.log("props.roomRound newValue", newValue, oldValue);
	}
);

const store = useStore();

const waiting = ref(true); //等待||结束/进行中
const usedPrice = ref(0); //初始价格
const userPrice = ref(0); //开箱获得价格

const usedAmmunition = ref(0); //初始弹壳
const userAmmunition = ref(0); //开箱获得弹壳

const winGoodsItems = ref([]); //开箱获得
const clientRoomStatus = ref(1); //房间状态(自行控制) 1等待 2进行 3结束

const battleActRef = ref(null);

const sticker = ref([]);
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
	showWinFlag.value = false;
	battleActRef.value.randomGoodsList();
}

function randGoodsComplete() {
	emit("randGoodsComplete");
}

function startPostTransition() {
	clientRoomStatus.value = 2;
	waiting.value = false;
	battleActRef.value.postTransition();
}

const processPrice = computed(() => {
	let p = 0;
	p += Number(props.userData.openBoxDatas[props.roomRound].goods.price);
	return p;
});

let showWinFlag = ref(false);
function slideEnd() {
	emit("slideEnd");
	setTimeout(() => {
		winGoodsItems.value.unshift(
			props.userData.openBoxDatas[props.roomRound].goods
		);
		if (
			typeof props.userData.openBoxDatas[props.roomRound].sticker !=
			"undefined" &&
			props.userData.openBoxDatas[props.roomRound].sticker
		)
			sticker.value.unshift({
				goodsLevel: 6,
				goodsName: `“${props.userData.openBoxDatas[props.roomRound].sticker.stickerLabel
					}”集字卡 | 不可分解`,
				price: "0.00",
				iconUrl:
					props.userData.openBoxDatas[props.roomRound].sticker.stickerIconUrl,
			});

		userPrice.value += Number(
			props.userData.openBoxDatas[props.roomRound].goods.price
		);
		userAmmunition.value += Number(
			props.userData.openBoxDatas[props.roomRound].ammon
		);
		showWinFlag.value = true;
	}, 300);
	setTimeout(() => {
		usedPrice.value = userPrice.value;
		usedAmmunition.value = userAmmunition.value;
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
	for (let i = 0; i < props.userData.winGoodsItems.length; i++) {
		price += Number(props.userData.winGoodsItems[i].price);
	}

	for (let i = 0; i < props.userData.openBoxDatas.length; i++) {
		ammo += Number(props.userData.openBoxDatas[i].ammon);
	}
	userPrice.value = price;
	userAmmunition.value = ammo;
}
//中途进入
function handlePrize() {
	for (let i = 0; i < props.roomRound; i++) {
		winGoodsItems.value.unshift(props.userData.openBoxDatas[i].goods);
		userPrice.value += Number(props.userData.openBoxDatas[i].goods.price);
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
	//						 Notify('加入成功');
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
	<div id="room-item" :class="[{ 'two-pep': peoples == 2 }, { 'three-pep': peoples == 3 }]">
		<div class="room-main-wrap">
			<div class="user-info-wrap" v-if="clientRoomStatus == 3">
				<div class="user-header-wrap" :class="{ lost: userData.winFlag == 2 }">
					<!-- <div class="user-win-else" :class="{ lost: userData.winFlag == 2 }"> -->

					<p style="color: #4af1cc" v-if="userData.winFlag == 1 || userData.winFlag == 3" class="win-text-wrap">
						{{ t('battle.winner') }}
					</p>
					<div class="win" v-if="userData.winFlag == 1 || userData.winFlag == 3">
						<count-to :startVal="usedPrice" :endVal="userPrice" :duration="800" :decimals="2">
						</count-to>
					</div>

					<p class="win-text-wrap" style="color: #f83c76" v-if="userData.winFlag == 2">
						{{ t('battle.loser') }}:
					</p>
					<div class="lost" v-if="userData.winFlag == 2">
						<count-to :startVal="usedPrice" :endVal="userPrice" :duration="800" :decimals="2">
						</count-to>
					</div>
				</div>
				<div class="head-bottom">
					<HeadPortrait :userModel="userData" :size="'battleDetail'"></HeadPortrait>
					<div class="head-bottom-right">
						<p class="nickname hide">{{ FormatNickname(userData.nickName) }}</p>
					</div>
				</div>
			</div>

			<div class="user-info-wrap" v-show="clientRoomStatus == 2">
				<div class="user-header-wrap" :class="{
					lost:
						showWinFlag &&
						userData.roundWinFlag != null &&
						userData.roundWinFlag[roomRound] != 1,
				}">
					<BattleAction v-show="!waiting && clientRoomStatus == 2" :order="userData.orderList" :boxList="boxList"
						ref="battleActRef" :openBoxItems="userData.openBoxDatas" :roomRound="roomRound" :start="props.start"
						@randGoodsComplete="randGoodsComplete" @slideEnd="slideEnd" @endTransition="endTransition">
					</BattleAction>
				</div>
				<div class="head-bottom">
					<!-- :class="{ lost: userData.openBoxDatas[roomRound].goods.win == -1 }" -->
					<HeadPortrait :userModel="userData" :size="'battleDetail'"></HeadPortrait>
					<div class="head-bottom-right">
						<p class="nickname hide">{{ FormatNickname(userData.nickName) }}</p>
						<Currency :hide="true" :fontWeight="700" :currency="userPrice"></Currency>
					</div>
				</div>
				<!-- <div class="user-price-wrap">
					<div class="price">
						<img src="@/assets/romimg/common/gold.png" alt="" />
						<count-to
							:startVal="usedPrice"
							:endVal="userPrice"
							:duration="800"
							:decimals="2"
						>
						</count-to>
					</div>
					<div class="price" style="color: #7ae6a6">
						<img src="@/assets/romimg/common/danyao.png" alt="" />
						<count-to
							:startVal="usedAmmunition"
							:endVal="userAmmunition"
							:duration="800"
							:decimals="2"
						>
						</count-to>
					</div>
				</div> -->
			</div>

			<div class="user-info-wrap" v-if="!userData.noBody && clientRoomStatus == 1">
				<div class="user-header-wrap">
					<img class="ready" src="@/assets/romimg/battle/room/two/ready.png" />
					<p class="ready-text">{{ t('battle.ready') }}</p>

					<!-- <HeadPortrait
						:userModel="userData"
						:size="'battleDetail'"
					></HeadPortrait> -->
				</div>
				<div class="head-bottom">
					<HeadPortrait :userModel="userData" :size="'battleDetail'"></HeadPortrait>
					<div class="head-bottom-right">
						<p class="nickname hide">
							{{ FormatNickname(userData.nickName) }}
							<!-- {{ JSON.stringify(userData) }} -->
						</p>
					</div>
				</div>
				<!-- <div class="user-price-wrap">
					<div class="price">
						<img src="@/assets/romimg/common/gold.png" alt="" />
						<count-to
							:startVal="usedPrice"
							:endVal="userPrice"
							:duration="800"
							:decimals="2"
						>
						</count-to>
					</div>
					<div class="price" style="color: #7ae6a6">
						<img src="@/assets/romimg/common/danyao.png" alt="" />
						<count-to
							:startVal="usedAmmunition"
							:endVal="userAmmunition"
							:duration="800"
							:decimals="2"
						>
						</count-to>
					</div>
				</div> -->
			</div>
			<div class="wait-join-wrap" v-if="userData.noBody && clientRoomStatus == 1">
				<div class="join-wrap">
					<!-- <img
						v-show="!selfJoinStatus"
						class="add-wrap"
						src="@/assets/romimg/battle/add.png"
						alt=""
						@click="joinRoom"
					/> -->
					<!-- <span v-show="selfJoinStatus" class="icon iconfont">&#xe64c;</span> -->
					<img class="wait" src="@/assets/romimg/battle/room/two/wait.png" />
					<!-- <span class="icon iconfont circular"> &#xe658;</span> -->
					<img class="circular" src="@/assets/romimg/battle/room/two/circular.png" />
					<p class="hide">{{ t('battle.waiting') }}</p>
				</div>
				<div class="head-bottom">
					<div v-show="!selfJoinStatus" class="join-btn" @click="joinRoom">
						{{ t('battle.join') }}
					</div>
				</div>
			</div>
			<div class="room-center">
				<!-- <div class="state" v-show="waiting && clientRoomStatus == 1">
					<div class="wait">
						<p v-show="!userData.noBody" style="color: #ffc400">已准备</p>
						<p v-show="userData.noBody">等待中</p>
					</div>
				</div>
				<div class="state" v-show="waiting && clientRoomStatus != 1">
					<div class="wait">
						<p style="color: #ffc400">准备中</p>
					</div>
				</div>
				<div class="state" v-show="!waiting && clientRoomStatus == 3">
					<div class="result">
						<img
							class="win"
							v-show="userData.winFlag != 2"
							src="@/assets/romimg/battle/win_icon.png"
							alt=""
						/>
						<img
							class="fail"
							v-show="userData.winFlag == 2"
							src="@/assets/romimg/battle/fail_icon.png"
							alt=""
						/>
					</div>
				</div> -->
			</div>
		</div>

		<div class="goods-list-wrap" :class="{ win: clientRoomStatus == 3 && userData.winFlag != 2 }">
			<div class="goods-list" v-show="clientRoomStatus != 1">
				<div class="goods-item" v-for="(item, index) in sticker" :key="index">
					<div class="pic">
						<img :src="item.iconUrl" alt="" />
					</div>
					<div class="price">
						<!-- ${{ item.price }} -->
						<Currency :fontsize="13" :currency="item.price"></Currency>
					</div>
					<p class="name hide">
						{{ FormatNickname(item.goodsName, 14) }}
					</p>
				</div>
				<transition-group name="animation">
					<div class="goods-item" v-for="(item, index) in winGoodsItems" :key="index"
						:style="'background-image: url(' + getImageBg(item) + ');'">
						<div class="pic">
							<img :src="item.iconUrl" alt="" />
						</div>
						<div class="price">
							<!-- ${{ item.price }} -->
							<Currency :fontsize="13" :currency="item.price"></Currency>
						</div>
						<p class="name hide">
							{{ FormatNickname(item.goodsName, 14) }}
						</p>
					</div>
				</transition-group>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#room-item {
	.room-main-wrap {
		width: 100%;
		height: 310px;
		background-color: transparent;

		.user-info-wrap {
			width: 100%;
			height: 168px;
			overflow: hidden;

			.user-header-wrap {
				position: relative;
				width: 42px;
				height: 42px;
				// margin: 13px auto 12px;

				.user-win {
					display: block;
					position: absolute;
					width: 90px;
					height: 90px;
					background: url("@/assets/romimg/battle/lightUrl.png") no-repeat center;
					background-size: 100% 100%;
					left: -25px;
					top: -25px;
					animation: shake 2s linear infinite;
				}

				.win-text-wrap {
					font-size: 32px;
				}

				&.win {
					&::after {
						opacity: 1;
					}

					img {
						border-color: #eee131;
					}
				}
			}

			p {
				text-align: center;
				font-size: 16px;
			}

			.user-price-wrap {
				margin-top: 6px;

				.price {
					display: flex;
					justify-content: center;
					align-items: center;
					color: #eee131;
					font-size: 18px;
					font-weight: bold;
					margin-top: 2px;

					img {
						width: 25px;
					}
				}
			}
		}

		.wait-join-wrap {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 100%;
			height: 168px;
			overflow: hidden;
			position: relative;

			.join {
				background: url("@/assets/romimg/battle/detail/wait_bg.png") no-repeat center;
				background-size: 100% 100%;
				position: relative;
				width: 60px;
				height: 60px;
				margin: 18px auto 16px;

				img {
					border-color: transparent;
				}

				span {
					color: #fff;
					font-size: 50px;
				}
			}

			p {
				font-size: 14px;
			}

			.circular {
				position: absolute;
				font-size: 40px;
				width: 40px;
				top: 115px;
				color: #fff;
				animation: ani-rotate 2s linear infinite;
			}
		}

		.room-center {
			width: 100%;
			height: 140px;

			.state {
				width: 100%;
				height: 100%;

				.wait {
					display: flex;
					justify-content: center;
					align-items: center;
					box-sizing: border-box;
					width: 100%;
					height: 100%;
					padding-bottom: 16px;

					p {
						font-size: 26px;
					}
				}

				.result {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100%;
					height: 100%;

					.win {
						width: 223px;
						margin-bottom: 60px;
					}

					.fail {
						width: 223px;
						height: 196px;
						margin-bottom: 60px;
					}
				}
			}
		}
	}

	.goods-list-wrap {
		width: 100%;
		// min-height: 880px;
		// background: rgba($color: #1d1d23, $alpha: 0.6);
		// background: #15172c;
		// overflow: hidden;

		// &.win {
		//	 background: rgba($color: #eee131, $alpha: 0.06);
		// }

		.goods-list {
			box-sizing: border-box;
			margin-top: 20px;
			width: 100%;
			//	 height: 480px;
			overflow-y: auto;
			overflow-x: hidden;
			text-align: center;
			padding: 0 20px;

			.goods-item {
				display: inline-block;
				transition: all 0.3s;
				width: 100%;
				height: 300px;
				background-repeat: no-repeat;
				background-position: center;
				background-size: contain;
				overflow: hidden;

				.pic {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 175px;
					height: 130px;
					// margin-top: 10px;
					margin: auto;

					img {
						margin: auto;
						max-width: 100%;
						max-height: 100%;
					}
				}

				p {
					box-sizing: border-box;
					font-size: 14px;
					text-align: center;
					padding: 0 10px;
					margin-top: 14px;
				}

				.price {
					display: flex;
					justify-content: center;
					align-items: center;
					margin-top: 10px;

					color: #7ef2ad;

					font-size: 24px;
					font-style: normal;
					font-weight: 500;

					img {
						width: 23px;
					}
				}
			}

			&::-webkit-scrollbar {
				width: 4px;
				background-color: #c8c5c0;
				border-radius: 10px;
			}

			&::-webkit-scrollbar-track {
				border-radius: 10px;
				background-color: #41403e;
			}

			&::-webkit-scrollbar-thumb {
				border-radius: 10px;
				background-color: rgba($color: #fff, $alpha: 0.2);
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
		width: 324px;

		.room-main-wrap {
			height: 476px;
			width: 324px;

			.user-info-wrap {
				// background: #1b1d33;
				height: 476px;
				width: 324px;
				box-sizing: border-box;

				.user-header-wrap {
					border-top: 2px solid #75dc9e;
					width: 324px;
					height: 300px;
					font-size: 26px;
					margin: auto;
					display: flex;
					justify-content: center;
					align-items: center;
					flex-direction: column;
					// background-color: #1b1d33;
					//	 background: url("@/assets/romimg/battle/detail/win_bg.png") no-repeat
					//		 center;
					//	 background-size: 100% 100%;
					position: relative;
					opacity: 0.8;
					background: linear-gradient(0deg,
							rgba(126, 242, 173, 0) 60%,
							rgba(126, 242, 173, 0.1) 100%);
					background-color: #1b1d33;

					p {
						font-size: 26px;
					}

					.win-text-wrap {
						font-size: 32px;
					}

					span {
						color: #fff;
						font-size: 50px;
						margin-bottom: 20px;
					}

					// p {
					//	 font-size: 36px;
					//	 font-weight: 700;
					//	 font-weight: 400;
					//	 margin-bottom: 30px;
					//	 color: #f83c76;
					//	 &.active {
					//		 color: #4af1cc;
					//	 }
					// }
					// span {
					//	 color: #fff;
					//	 font-size: 28px;
					//	 font-weight: 700;

					//	 // margin-bottom: 20px;
					// }
					.ready {
						width: 180px;
						height: 156px;
					}

					.win {
						width: 204px;
						height: 110px;
						background: url(@/assets/romimg/battle/detail/win_bg1.png) no-repeat;
						background-size: contain;
						line-height: 110px;
						text-align: center;

						span {
							font-size: 28px;
							font-weight: 700;
						}
					}

					.lost {
						width: 204px;
						height: 110px;
						background: url(@/assets/romimg/battle/detail/lost_bg1.png) no-repeat;
						background-size: contain;
						line-height: 110px;
						text-align: center;

						span {
							font-size: 28px;
							font-weight: 700;
						}
					}

					&.lost {
						border-top: 2px solid rgba(247, 80, 68);
						background: linear-gradient(0deg,
								rgba(247, 80, 68, 0) 60%,
								rgba(247, 80, 68, 0.1) 100%);
						background-color: #1d1f36;
					}

					// .user-win-else {
					//	 margin-top: 36px;
					//	 // background: url("@/assets/romimg/battle/detail/win_bg.png")
					//	 //	 no-repeat center;
					//	 // background-size: 100% 100%;
					//	 position: relative;
					//	 display: flex;
					//	 justify-content: center;
					//	 align-items: center;
					//	 flex-direction: column;
					//	 margin: auto;
					//	 width: 212px;
					//	 height: 220px;
					//	 .ready {
					//		 width: 180px;
					//		 height: 156px;
					//	 }
					//	 span {
					//		 color: #fff;
					//		 font-size: 50px;
					//		 margin-bottom: 20px;
					//	 }
					//	 .price-wrap {
					//		 .win {
					//			 font-size: 30px;
					//			 font-weight: 700;
					//			 margin-bottom: 10px;
					//			 text-align: center;
					//		 }
					//		 color: #fff;
					//		 font-size: 28px !important;
					//		 font-style: normal;
					//		 font-weight: 500;
					//		 text-transform: uppercase;
					//		 span {
					//			 
					//			 font-size: 28px !important;
					//		 }
					//		 img {
					//			 width: 32px;
					//			 height: 32px;
					//			 margin-right: 10px;
					//			 vertical-align: middle;
					//			 margin-bottom: 5px;
					//		 }
					//	 }
					//	 &.lost {
					//		 background: url("@/assets/romimg/battle/detail/wait_bg.png")
					//			 no-repeat center;
					//		 background-size: 100% 100%;
					//	 }
					// }
				}

				.head-bottom {
					height: 170px;
					margin-top: 6px;
					//	 padding-bottom: 20px;
					box-sizing: border-box;
					display: flex;
					// flex-direction: column;
					justify-content: center;
					align-items: center;

					// border-bottom: 2px solid #75dc9e;

					// background: linear-gradient(
					//	 180deg,
					//	 rgba(126, 242, 173, 0) 0%,
					//	 rgba(126, 242, 173, 0.1) 150%
					// );
					background-color: #1d1f36;

					.head-bottom-right {
						display: flex;
						flex-direction: column;
						justify-content: start;
						align-items: start;
						padding-left: 20px;

						.nickname {
							margin-top: 5px;
							margin-bottom: 10px;
							font-size: 24px;
							// margin-left: 10px;
						}
					}

					// &.lost {
					//	 border-bottom: 2px solid rgba(247, 80, 68, 0.5);
					//	 background: linear-gradient(
					//		 180deg,
					//		 rgba(247, 80, 68, 0) 0%,
					//		 rgba(247, 80, 68, 0.1) 100%
					//	 );
					//	 background-color: #1d1f36;
					// }
				}
			}

			.wait-join-wrap {
				height: 476px;
				// background: #1b1d33;
				box-sizing: border-box;

				.join-wrap {
					width: 324px;
					height: 300px;
					background: #181b2f;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;

					border-top: 2px solid #f83c76;

					background: linear-gradient(0deg,
							rgba(247, 80, 68, 0) 60%,
							rgba(247, 80, 68, 0.1) 100%);
					background-color: #1d1f36;

					.wait {
						width: 180px;
						height: 157px;
					}

					p {
						font-size: 26px;
						font-weight: 700;
					}
				}

				.head-bottom {
					height: 170px;
					width: 324px;
					margin-top: 6px;
					//	 padding-bottom: 20px;
					box-sizing: border-box;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;

					// border-bottom: 2px solid #f83c76;
					// border-radius: 2px;

					// background: linear-gradient(
					//	 180deg,
					//	 rgba(247, 80, 68, 0) 0%,
					//	 rgba(247, 80, 68, 0.1) 100%
					// );
					background-color: #1d1f36;

					.nickname {
						margin-top: 5px;
						margin-bottom: 5px;
					}

					.join-btn {
						width: 128px;
						height: 56px;
						justify-content: center;
						align-items: center;
						display: flex;
						border-radius: 4px;
						background: #b24186;
					}

					// &.lost {
					//	 border-bottom: 2px solid rgba(247, 80, 68, 0.5);
					//	 background: linear-gradient(
					//		 180deg,
					//		 rgba(247, 80, 68, 0) 0%,
					//		 rgba(247, 80, 68, 0.1) 100%
					//	 );
					// }
				}
			}
		}

		.goods-list-wrap {
			.goods-list {
				flex-wrap: wrap;
				justify-content: space-between;
				display: flex;
				padding: unset;
				width: 326px;
				margin-bottom: 50px;

				.goods-item {
					margin-top: 10px;
					width: 100%;
					height: 300px;
					border-radius: 5px;
					background-position: center;
					background-size: 100% 100%;

					// background-color: #1b1e38;
					.price {
						margin-top: 30px;
					}

					.pic {
						margin-top: 30px;
					}

					.name {
						color: #cbccd6;
						font-size: 24px;
						margin-top: 10px;
					}
				}
			}
		}
	}

	&.three-pep {
		width: 220px;

		.room-main-wrap {
			width: 220px;
			height: 466px;

			.user-info-wrap {
				// background: #1b1d33;
				width: 220px;
				height: 466px;
				box-sizing: border-box;

				.user-header-wrap {
					width: 220px;
					height: 300px;
					margin: auto;
					display: flex;
					justify-content: center;
					align-items: center;
					flex-direction: column;

					opacity: 0.8;
					border-top: 2px solid #75dc9e;
					background: linear-gradient(0deg,
							rgba(126, 242, 173, 0) 60%,
							rgba(126, 242, 173, 0.1) 100%);
					background-color: #1b1d33;
					//	 background: url("@/assets/romimg/battle/detail/win_bg.png") no-repeat
					//		 center;
					//	 background-size: 100% 100%;
					position: relative;

					span {
						color: #fff;
						font-size: 50px;
						margin-bottom: 20px;
					}

					.win-text-wrap {
						font-size: 32px;
					}

					.ready {
						width: 180px;
						height: 157px;
					}

					.win {
						width: 136px;
						height: 136px;
					}

					p {
						font-size: 26px;
						font-weight: 700;
					}

					&.lost {
						border-top: 2px solid rgba(247, 80, 68);
						background: linear-gradient(0deg,
								rgba(247, 80, 68, 0) 60%,
								rgba(247, 80, 68, 0.1) 100%);
						background-color: #1d1f36;
					}

					.win {
						width: 204px;
						height: 110px;
						background: url(@/assets/romimg/battle/detail/win_bg1.png) no-repeat;
						background-size: contain;
						line-height: 110px;
						text-align: center;

						span {
							font-size: 28px;
							font-weight: 700;
						}
					}

					.lost {
						width: 204px;
						height: 110px;
						background: url(@/assets/romimg/battle/detail/lost_bg1.png) no-repeat;
						background-size: contain;
						line-height: 110px;
						text-align: center;

						span {
							font-size: 28px;
							font-weight: 700;
						}
					}

					// &.lost {
					//	 border-top: 2px solid rgba(247, 80, 68);
					//	 background: linear-gradient(
					//		 0deg,
					//		 rgba(247, 80, 68, 0) 60%,
					//		 rgba(247, 80, 68, 0.1) 100%
					//	 );
					//	 background-color: #1d1f36;
					// }
				}

				.head-bottom {
					height: 160px;
					margin-top: 6px;
					//	 margin-top: 70px;
					//	 padding-bottom: 20px;
					box-sizing: border-box;
					display: flex;
					justify-content: center;
					// flex-direction: column;
					align-items: center;
					// border-bottom: 2px solid rgba(116, 217, 156, 0.5);
					// background: linear-gradient(
					//	 180deg,
					//	 rgba(116, 217, 156, 0) 0%,
					//	 rgba(116, 217, 156, 0.1) 100%
					// );
					background-color: #1d1f36;

					.head-bottom-right {
						display: flex;
						flex-direction: column;
						justify-content: start;
						align-items: start;
						padding-left: 20px;

						.nickname {
							margin-top: 5px;
							margin-bottom: 10px;
							font-size: 24px;
							// margin-left: 10px;
						}
					}

					// &.lost {
					//	 border-bottom: 2px solid rgba(247, 80, 68, 0.5);
					//	 background: linear-gradient(
					//		 180deg,
					//		 rgba(247, 80, 68, 0) 0%,
					//		 rgba(247, 80, 68, 0.1) 100%
					//	 );
					//	 background-color: #1d1f36;
					// }
				}
			}

			.wait-join-wrap {
				height: 466px;
				// background: #1b1d33;

				box-sizing: border-box;

				.join-wrap {
					width: 220px;
					height: 300px;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;

					border-top: 2px solid #f83c76;

					border-radius: 2px;

					background: linear-gradient(0deg,
							rgba(247, 80, 68, 0) 60%,
							rgba(247, 80, 68, 0.1) 100%);
					background-color: #1b1d33;

					.wait {
						width: 180px;
						height: 157px;
					}

					p {
						font-size: 26px;
						font-weight: 700;
					}

					// .join {
					//	 background: url("@/assets/romimg/battle/detail/wait_bg.png")
					//		 no-repeat center;
					//	 background-size: 100% 100%;
					//	 position: relative;
					//	 width: 165px;
					//	 height: 170px;
					//	 margin: 36px auto auto;
					//	 justify-content: center;
					//	 flex-direction: column;
					//	 display: flex;
					//	 align-items: center;

					//	 span {
					//		 color: #fff;
					//		 font-size: 50px;
					//		 margin-bottom: 20px;
					//	 }
					// }
				}
			}

			.head-bottom {
				height: 160px;
				width: 220px;
				margin-top: 6px;
				//	 padding-bottom: 20px;
				box-sizing: border-box;
				display: flex;
				// flex-direction: column;
				justify-content: center;
				align-items: center;

				// border-bottom: 2px solid #f83c76;

				// border-radius: 2px;

				// background: linear-gradient(
				//	 0deg,
				//	 rgba(247, 80, 68, 0) 60%,
				//	 rgba(247, 80, 68, 0.1) 100%
				// );
				background-color: #1d1f36;

				.head-bottom-right {
					display: flex;
					flex-direction: column;
					justify-content: start;
					align-items: start;
					padding-left: 20px;

					.nickname {
						margin-top: 5px;
						margin-bottom: 10px;
						font-size: 24px;
						// margin-left: 10px;
					}

					// .nickname {
					//	 margin-top: 5px;
					//	 margin-bottom: 5px;
					// }
				}

				.join-btn {
					width: 128px;
					height: 56px;
					justify-content: center;
					align-items: center;
					display: flex;
					border-radius: 4px;
					background: #b24186;
				}

				&.lost {
					border-bottom: 2px solid rgba(247, 80, 68, 0.5);
					background: linear-gradient(180deg,
							rgba(247, 80, 68, 0) 0%,
							rgba(247, 80, 68, 0.1) 100%);
				}
			}
		}

		.goods-list-wrap {
			.goods-list {
				flex-wrap: wrap;
				justify-content: space-between;
				display: flex;
				padding: unset;
				margin-bottom: 50px;

				.goods-item {
					margin: auto;
					margin-top: 10px;
					width: 220px;
					height: 300px;
					border-radius: 5px;
					// background-color: #1b1e38;
					background-position: center;
					background-size: 100% 100%;

					.pic {
						margin-top: 30px;
					}

					.price {
						margin-top: 30px;
					}

					.name {
						color: #cbccd6;
						margin-top: 10px;
						font-size: 24px;
					}
				}
			}
		}
	}

	.add-wrap {
		width: 60px;
		height: 60px;
	}

	@keyframes shake {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(359deg);
		}
	}
}
</style>
