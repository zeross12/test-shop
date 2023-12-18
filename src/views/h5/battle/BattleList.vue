<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import HeadPortrait from "@/components/h5/head/HeadPortrait.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import {
	getBattleList,
	joinBattleRoom,
	enterBattleRoom,
	getRecords,
} from "@/network/api/battle";

import { tokenName } from "@/config";

import BattleBoxListSwiper from "./components/BattleBoxListSwiper.vue";
import xcBgImgUrl from "@/assets/romimg/battle/xc_room_bg.png";
import { GoodImageBgType } from "@/util/util";
import Currency from "@/components/h5/common/Currency.vue";
import BattleJoinNotice from "./BattleJoinNotice.vue";

const store = useStore();
const router = useRouter();
const route = useRoute();

const listRoom = ref([]);

const roomList = ref([]);
const recordList = ref([]);

const pager = ref({ pageIndex: 1, limit: 16, sortType: 1 });
const loading = ref(false);
const finished = ref(false);

const roomSort = ref("default");
const battleJoinNotice = ref(null);
const showJoinDialog = ref(false);
const joinDialogPrice = ref(0);
const joinDialogId = ref(0);
const notJoinNotice = computed(() => store.state.notJoinRoomNotice);

let roomListTimer = null;

onMounted(() => {
	pager.value.pageIndex = 1;
	pager.value.limit = 16;
	startRoomListTime();
});

onUnmounted(() => {
	stopRoomListTime();
});

function startRoomListTime() {
	stopRoomListTime();
	getRoomList();
	roomListTimer = setInterval(() => {
		getRoomList();
	}, 3000);
}

function stopRoomListTime() {
	if (roomListTimer != null) {
		clearInterval(roomListTimer);
		roomListTimer = null;
	}
}

async function getRoomList() {
	const res = await getBattleList({
		limit: pager.value.limit,
		page: pager.value.pageIndex,
	});
	if (res.code === 0) {
		let items = res.data.items || [];

		if (pager.value.sortType == 3) {
			items.sort((a, b) => b.joinPrice - a.joinPrice);
		}
		roomList.value = items;
		await getRecordList(1);
		handleListRoom();
	}
}

async function getRecordList(pageIndex) {
	const res = await getRecords({
		limit: pager.value.limit,
		page: pageIndex,
		sortType: pager.value.sortType,
	});
	if (res.code === 0) {
		let recordItems = res.data.items || [];

		if (res.data.page == 1) {
			for (let i = 0; i < recordItems.length; i++) {
				let recordItem = recordItems[i];
				recordItem.userItems = recordItem.battleUserDatas;
				recordList.value[i] = recordItem;
			}
		} else {
			for (let i = 0; i < recordItems.length; i++) {
				let recordItem = recordItems[i];
				recordItem.userItems = recordItem.battleUserDatas;
				recordList.value.push(recordItem);
			}
		}

		loading.value = false;
		// 数据全部加载完成
		if (recordItems == null || recordItems.length < res.data.limit) {
			finished.value = true;
		}
		handleListRoom();
	}
}

function handleListRoom() {
	listRoom.value = [...roomList.value, ...recordList.value];
}

function onLoad() {
	pager.value.pageIndex += 1;
	getRecordList(pager.value.pageIndex);
}

/// >>>>>>>>>>>>>>
function openBattleDetail(id, status) {
	router.push({ path: "/m/battleDetail", query: { id: id, status: status } });
}

function enterRoom(item) {
	if (!localStorage.getItem(tokenName)) {
		router.push("/m/sign");
		return;
	}

	// if (item.status > 2) {
	//	 openBattleDetail(item.id);
	// } else {
	enterBattleRoom({ battleId: item.id }).then((res) => {
		if (res.code == 0) {
			openBattleDetail(item.id, res.data.status);
		}
	});
	// }
}

async function joinRoom(item) {
	if (!localStorage.getItem(tokenName)) {
		router.push("/m/sign");
		return;
	}

	let userItems = item.userItems || [];
	for (const user of userItems) {
		if (user.isSelf) {
			NotifyF(t( 'battle.isJoined' ));
			return;
		}
	}
	joinDialogPrice.value = item.joinPrice;
	joinDialogId.value = item.id;
	battleJoinNotice.value.joinRoom();
	// if (item.battleType == 2) {
	//	 Dialog.confirm({
	//		 message: t( 'battle.XModeTip' ),
	//		 showCancelButton: false,
	//	 }).then(() => {
	//		 joinRoomContinue(item);
	//	 });
	// } else {
	//	 joinRoomContinue(item);
	// }

	// if (!notJoinNotice.value) {
	//		 showJoinDialog.value = true;
	//		 joinDialogPrice.value = item.joinPrice;
	//		 joinDialogId.value = item.id;
	// } else {
	//		 joinBattleDetail(item.id);
	// }
}

function joinRoomContinue(item) {
	if (!notJoinNotice.value) {
		showJoinDialog.value = true;
		joinDialogPrice.value = item.joinPrice;
		joinDialogId.value = item.id;
	} else {
		joinBattleDetail(item.id);
	}
}

function onCheckNotNotice() {
	store.commit("setBattleNotJoinNoitce", !notJoinNotice.value);
}

function onClickJoinCancel() {
	showJoinDialog.value = false;
	joinDialogId.value = 0;
	joinDialogPrice.value = 0;
}

function onClickJoinSure() {
	if (joinDialogId.value != 0) {
		joinBattleDetail(joinDialogId.value);
	}
}

async function joinBattleDetail(id) {
	joinBattleRoom({ battleId: id }).then((res) => {
		if (res.code == 0) {
			Notify("加入成功");
			store.dispatch("getUserInfo");
			openBattleDetail(item.id, res.data.status);
		}
	});
}

function getRoomBoxList(item) {
	let boxItems = item.boxItems || [];
	let boxIds = item.boxIds || [];
	let list = [];
	for (let i = 0; i < boxIds.length; i++) {
		const id = boxIds[i];
		if (boxItems[id]) {
			list.push(boxItems[id]);
		}
	}
	return list;
}

function getImageBg(item) {
	if (item.battleType == 2) return xcBgImgUrl;

	let level = 1;
	if (item.status <= 2) {
		let joinProce = Number(item.joinPrice);
		if (joinProce < 10) {
			level = 3;
		} else if (joinProce < 100) {
			level = 4;
		} else if (joinProce < 500) {
			level = 6;
		} else {
			level = 7;
		}
	}
	return store.getters.getGoodsBgImage(GoodImageBgType.battleList, level);
}

function onClickSort(sortType) {
	roomSort.value = sortType;

	let type = 1;
	if (sortType == "default") {
		type = 1;
	} else if (sortType == "price") {
		type = 3;
	}
	pager.value.sortType = type;
	getRecordList(pager.value.pageIndex);
}

function getBoxImageStyle(item) {
	if (item.imageUrl) {
		return "background-image: url(" + item.imageUrl + ");";
	} else {
		return "";
	}
}
</script>

<template>
	<div id="battle-room-list">
		<!-- <div class="top-sort">
			<div
				class="top-sort-up"
				@click="onClickSort('default')"
				v-show="roomSort == 'price'"
			>
				价格从高到低<img src="@/assets/romimg/common/sort_down.png" />
			</div>
			<div
				class="top-sort-up"
				@click="onClickSort('price')"
				v-show="roomSort == 'default'"
			>
				综合<img src="@/assets/romimg/battle/icon_sort_default.png" />
			</div>
		</div> -->
		<BattleBoxListSwiper></BattleBoxListSwiper>
		<van-list
			v-model="loading"
			:finished="finished"
			:finished-text="t( 'battle.noMoreRoom' )"
			@load="onLoad"
			:immediate-check="false"
		>
			<div class="room_list">
				<div
					class="room_item"
					v-for="item in listRoom"
					:key="item.id"
					:class="{ over: item.status > 2 }"
					@click="enterRoom(item)"
				>
					<lazy-component>
						<div
							class="player"
							:class="{ grey: item.status == 3, zise: item.status == 2 }"
						>
							<div class="player_row">
								<div
									class="player_wrap"
									v-for="(subitem, subindex) in item.peoples"
									:key="subindex"
								>
									<div
										class="player_icon add"
										v-if="item.userItems[subindex] === undefined"
										@click.stop="joinRoom(item)"
									>
										<img class="add-img" src="@/assets/romimg/battle/add.png" />
									</div>

									<div v-else class="player_icon">
										<HeadPortrait
											:userModel="item.userItems[subindex]"
											:size="'five'"
										></HeadPortrait>
									</div>
								</div>
							</div>
						</div>
						<div class="top_data">
							<div class="price">
								{{ t( 'battle.priceTotal' ) }}
								<div class="row">
									<Currency :hide="true" :currency="item.joinPrice"></Currency>
								</div>
							</div>

							<!-- <div class="price">
								<Currency :currency="item.joinPrice"></Currency>
							</div> -->
							<div class="round">
								{{ t( 'battle.round' ) }}
								<div class="row">
									<span class="text-num">{{ item.round }}</span>
								</div>
							</div>
							<!-- <div class="round">
								{{ t( 'common.users' ) }}
								<div class="row">
									<span class="text-num">{{ item.peoples }}</span>
								</div>
							</div> -->
							<!-- <div class="state scale" v-show="item.status == 1">
								等待中
								<div class="state_pic">
									<img src="@/assets/romimg/battle/etc_icon.png" alt="" />
								</div>
							</div>
							<div class="state rotate" v-show="item.status == 2">
								进行中
								<div class="state_pic">
									<img src="@/assets/romimg/battle/doing_icon.png" alt="" />
								</div>
							</div>
							<div class="state" v-show="item.status == 3">
								已结束
								<div class="no_state_pic">
									<img src="@/assets/romimg/battle/icon_over.png" alt="" />
								</div>
							</div>
							<div class="state scale" v-show="item.status == 4">已解散</div>
							<div class="lookcount">{{ item.watchUserCount }}人观看</div>
							<div class="round">{{ item.round }}{{ t( 'battle.round' ) }}</div> -->
						</div>
						<div class="operation">
							<div class="vs_box">
								<div
									class="vs_box_item"
									v-for="(value, index) in getRoomBoxList(item)"
									:key="index"
								>
									<!-- :style="getBoxImageStyle(value)" -->
									<div class="box_item_bg">
										<img :src="value.imageUrl" alt="" />
									</div>
								</div>
							</div>
						</div>
						<div class="item-btn-wrap">
							<div
								class="item-btn start"
								v-if="item.status == 1"
								@click.stop="joinRoom(item)"
							>
								{{ t( 'battle.start' ) }}
							</div>
							<div class="item-btn look" v-if="item.status == 2">{{ t( 'battle.watch' ) }}</div>
							<div class="item-btn over" v-if="item.status == 3">{{ t( 'battle.view' ) }}</div>
						</div>
						<!-- <img
							v-if="item.status > 2"
							class="over-status"
							src="@/assets/romimg/battle/over_flag.png"
						/> -->
					</lazy-component>
				</div>
			</div>
		</van-list>
		<van-dialog
			v-model:show="showJoinDialog"
			show-cancel-button
			class="join-dialog"
		>
			<div class="join-dialog-wrap">
				<div class="close" @click="onClickJoinCancel">
					<span class="icon iconfont">&#xe637;</span>
				</div>
				<div class="join-content-wrap">
					确定消耗
					<p><currency :currency="joinDialogPrice"></currency></p>
					&nbsp;加入房间吗?
				</div>
			</div>
			<template #footer>
				<div class="join-dialog-bottom">
					<div class="bottom-btn-wrap">
						<div class="join-dialog-btn" @click="onClickJoinCancel">{{ t( 'notify.cancel' ) }}</div>
						<div class="join-dialog-btn" @click="onClickJoinSure">确认</div>
					</div>

					<div class="not-join-notice">
						<div
							class="check-icon"
							:class="{ active: notJoinNotice }"
							@click="onCheckNotNotice"
						></div>
						<p>{{ t( 'battle.noPopupAgain' ) }}</p>
					</div>
				</div>
			</template>
		</van-dialog>

		<BattleJoinNotice
			:battleId="joinDialogId"
			:joinPrice="joinDialogPrice"
			ref="battleJoinNotice"
			@joinRoomSuc="openBattleDetail"
		></BattleJoinNotice>
	</div>
</template>

<style lang="scss">
#battle-room-list {
	width: 100%;
	color: #fff;
	min-height: 975px;

	@keyframes scale {
		0% {
			transform: scale(1);
		}

		50% {
			transform: scale(0.8);
		}

		100% {
			transform: scale(1);
		}
	}

	@keyframes rotate {
		0% {
			transform: rotate(0);
		}

		100% {
			transform: rotate(180deg);
		}
	}

	.top-sort {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		margin-top: 10px;
		margin-bottom: 3px;

		.top-sort-up {
			color: #fffe00;
			font-size: 24px;
			align-items: center;
			display: flex;

			img {
				max-width: 26px;
				max-height: 25px;
				margin-left: 10px;
				margin-right: 13px;
			}
		}
	}

	.room_list {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		box-sizing: border-box;
		padding: 0px 20px;

		.room_item {
			box-sizing: border-box;
			margin-top: 20px;
			position: relative;
			width: 348px;
			height: 500px;
			background-repeat: no-repeat;
			background-position: 0px 30px;
			transition: all 0.3s;
			opacity: 1;
			border: 1px solid #2d2d67;
			box-shadow: 0px 0px 37.956241607666016px 0.6433261036872864px
				rgba(41, 34, 139, 0.15) inset;

			.top_data {
				display: flex;
				align-items: center;
				justify-content: center; /* 水平居中 */
				box-sizing: border-box;
				height: 84px;
				width: 100%;
				// margin: 8px 0;
				padding: 0 10px;
				color: #ffffff;
				gap: 50px;
				.state {
					display: flex;
					align-items: center;
					width: 100px;

					.state_pic {
						width: 22px;
						height: 22px;
						margin-left: 5px;

						img {
							width: 100%;
							height: 100%;
							animation: scale 1s linear infinite;
						}
					}

					.no_state_pic {
						width: 22px;
						height: 22px;
						margin-left: 5px;

						img {
							width: 100%;
							height: 100%;
						}
					}

					&.scale {
						.state_pic {
							img {
								width: 100%;
								height: 100%;
								animation: scale 1s linear infinite;
							}
						}
					}

					&.rotate {
						.state_pic {
							img {
								width: 100%;
								height: 100%;
								animation: rotate 2s linear infinite !important;
							}
						}
					}
				}

				.lookcount {
					flex: 1;
					text-align: center;
				}

				.round {
					color: #fffefe;
					text-align: center;
					font-size: 24px;
					font-style: normal;
					font-weight: 300;
					.row {
						padding-top: 8px;
						box-sizing: border-box;
						.text-num {
							color: #fff;
							font-size: 24px;
							font-style: normal;
							font-weight: 700;
						}
					}
				}
				.price {
					color: #fffefe;
					font-size: 24px;
					font-weight: 300;
					font-style: normal;
					.row {
						padding-top: 8px;
						box-sizing: border-box;
						span {
							font-size: 24px;
							font-weight: 700;
							color: #75dc9e;
						}
					}
				}
			}

			.player {
				display: flex;
				justify-content: center;
				// margin-top: 12px;
				flex-direction: column;
				height: 200px;
				box-sizing: border-box;
				background-image: url(@/assets/romimg/battle/room-blue.png);
				background-size: contain;
				&.grey {
					background-image: url(@/assets/romimg/battle/room-hui.png);
				}
				&.zise {
					background-image: url(@/assets/romimg/battle/room-zise.png);
				}
				.player_row {
					display: flex;
					justify-content: center;
					align-items: center;
					box-sizing: border-box;

					&.player3 {
						justify-content: center;
						padding: 0px 85px;
					}

					.player_wrap {
						display: flex;
						justify-content: center;
						box-sizing: border-box;
						margin: 0 10px;

						.player_icon {
							width: 76px;
							height: 76px;
							border-radius: 50%;
							background: #000;

							&.add {
								width: 76px;
								height: 76px;
								background: #6459d1;

								img {
									width: 100%;
									height: 100%;
								}
							}
						}
					}
				}
			}

			.item-btn-wrap {
				display: flex;
				justify-content: center;
				box-sizing: border-box;
				padding-top: 10px;
				.item-btn {
					width: 325px;
					height: 80px;
					font-size: 26px;
					color: #cfcee8;
					text-align: center;
					line-height: 80px;
					font-weight: bold;
					border-radius: 8px;
					box-sizing: border-box;
					background: #3a34b0;
					color: #cfcee8;
					font-style: normal;
					text-transform: uppercase;
					&.start {
						background: #4b56bc;
					}
					&.look {
						background: #8d61f2;
					}
					&.over {
						background: #494d72;
					}
				}

				.look {
					background: #494d72;
				}
			}

			.operation {
				display: flex;
				box-sizing: border-box;
				align-items: center;

				width: 317px;
				height: 110px;
				justify-content: start;
				margin: 0 auto;

				.vs_box {
					display: flex;
					padding-top: 10px;
					box-sizing: border-box;
					overflow-x: scroll;
					&::-webkit-scrollbar {
						display: none;
					}
					.vs_box_item {
						display: flex;
						justify-content: start;
						align-items: center;
						position: relative;
						margin-right: 5px;
						box-sizing: border-box;

						width: 114px;
						height: 100px;
						// margin-right: 3px;

						// background: url(@/assets/romimg/roll/box_bg.png) center no-repeat;
						// background-size: 100%;
						// background-color: #131528;

						.box_item_bg {
							// display: flex;
							// justify-content: center;
							// align-items: center;
							// background-size: contain;
							// background-repeat: no-repeat;
							// background-position: center;

							img {
								width: 114px;
								height: 100px;
								// max-width: 80%;
								// max-height: 100%;
							}
						}

						.num {
							width: 24px;
							height: 24px;
							border-radius: 50%;
							text-align: center;
							line-height: 24px;
							background: #ffc400;
							color: #20212b;
							font-size: 18px;
							position: absolute;
							z-index: 1;
							right: 5px;
							top: 5px;
						}
					}

					&::-webkit-scrollbar {
						width: 0px;
					}
				}
			}
			.over-status {
				width: 125px;
				height: 125px;
				position: absolute;
				right: 0;
				top: 0;
			}

			&.over {
				// -webkit-filter: brightness(10%);
				filter: brightness(70%);
			}
		}
	}

	.room_list::after {
		content: "";
		width: 330px;
		height: 0;
		margin: 0 9px;
	}

	.join-dialog {
		.join-dialog-wrap {
			display: flex;
			flex-direction: column;
			align-items: center;
			color: #dbdeea;
			font-size: 32px;
			font-style: normal;
			font-weight: 600;
			text-transform: uppercase;
			position: relative;
			.close {
				position: absolute;
				color: #fff;
				top: -100px;
				right: 20px;
				margin-right: 10px;
			}
			.join-content-wrap {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 30px;

				p {
					margin-left: 10px;
					color: #63bd87;
					font-weight: bold;
				}
			}
		}

		.join-dialog-bottom {
			display: flex;
			flex-direction: column;
			align-items: center;

			.bottom-btn-wrap {
				display: flex;
				justify-content: center;
				height: 60px;
				margin-top: 30px;
				text-align: center;

				&::after {
					display: none;
				}

				.join-dialog-btn {
					display: flex;
					width: 250px;
					height: 108px;

					justify-content: center;
					align-items: center;
					flex-shrink: 0;

					border-radius: 8px;
					background: #3a34b0;

					color: #cfcee8;
					font-size: 26px;
					font-weight: bold;
					margin: 0 20px;
					display: flex;
					align-items: center;
					justify-content: center;

					&::after {
						display: none;
					}

					&:nth-child(2) {
						background-color: #8e61f3;
					}
				}
			}

			.not-join-notice {
				display: flex;
				align-items: center;
				justify-content: center;
				margin: 90px auto 0;
				color: #535b70;

				font-size: 24px;
				font-style: normal;
				font-weight: 400;
				.check-icon {
					width: 30px;
					height: 30px;
					background: url(@/assets/romimg/common/unselected.png) no-repeat
						center;
					background-size: contain;
					margin-right: 10px;

					&.active {
						background: url(@/assets/romimg/common/selected.png) no-repeat
							center;
						background-size: contain;
					}
				}

				p {
					color: #fff;
					font-size: 17px;
				}
			}
		}
	}
}
</style>
