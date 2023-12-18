<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import HeadPortrait from '@/components/pc/head/HeadPortrait.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { getBattleList, joinBattleRoom, enterBattleRoom, getRecords } from "@/network/api/battle"
import { Dialog } from 'vant';
import goldImgUrl from '@/assets/pcimg/common/coin.png';
import xcBgImgUrl from '@/assets/romimg/battle/xc_room_bg.png';
import { GoodImageBgType } from '@/util/util'
import Price from '@/components/pc/common/Price.vue'

const store = useStore();
const router = useRouter();
const route = useRoute();

const listRoom = ref([]);

const roomList = ref([]);
const recordList = ref([]);

const pager = ref({ pageIndex: 1, limit: 16, });

const loading = ref(false);
const finished = ref(false);

const roomSort = ref('default');

const showJoinDialog = ref(false);
const joinDialogPrice = ref(0);
const joinDialogId = ref(0);
const notJoinNotice = computed(() => store.state.notJoinRoomNotice);

let roomListTimer = null;

onMounted(() => {
	pager.value.pageIndex = 1;
	pager.value.limit = 16;
	startRoomListTime();
})

onUnmounted(() => {
	stopRoomListTime();
})

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
	const res = await getBattleList({ limit: pager.value.limit, page: pager.value.pageIndex });
	if (res.code === 0) {
		let items = res.data.items || [];

		if (store.state.battleListSort == 3) {
			items.sort((a, b) => (b.joinPrice - a.joinPrice));
		}
		roomList.value = items;
		// await getRecordList(1);
		handleListRoom();
	}
}

async function getRecordList(pageIndex) {
	const res = await getRecords({ limit: pager.value.limit, page: pageIndex, sortType: store.state.battleListSort });
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
	// pager.value.pageIndex += 1;
	// getRecordList(pager.value.pageIndex);
}

/// >>>>>>>>>>>>>>
function openBattleDetail(id, status) {
	router.push({ path: '/p/battleDetail', query: { id: id, status: status } })
}

function enterRoom(item) {
	// if (item.status > 2) {
	//	 openBattleDetail(item.id);
	// } else {
	enterBattleRoom({ battleId: item.id }).then(res => {
		if (res.code == 0) {
			openBattleDetail(item.id, res.data.status);
		}
	})
	// }
}
/// <<<<<<<<<<<<<<<<<

async function joinRoom(item) {
	let userItems = item.userItems || [];
	for (const user of userItems) {
		if (user.isSelf) {
			Warn({ offset: 100, message: t('battle.isJoined'), customClass: 'error' })
			return;
		}
	}
	if (item.battleType == 2) {
		Dialog.confirm({
			message: t('battle.XModeTip'),
			showCancelButton: false,
		}).then(() => {
			joinRoomContinue(item);
		})
	}
	else {
		joinRoomContinue(item);
	}
	// if (!notJoinNotice.value) {
	//	 showJoinDialog.value = true;
	//	 joinDialogPrice.value = item.joinPrice;
	//	 joinDialogId.value = item.id;
	// } else {
	//	 joinBattleDetail(item.id);
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
	store.commit('setBattleNotJoinNoitce', !notJoinNotice.value);
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
	joinBattleRoom({ battleId: id }).then(res => {
		if (res.code == 0) {
			Success({ offset: 100, message: t('battle.joinSuccess') });
			store.dispatch("getUserInfo");
			openBattleDetail(id);
		}
	}
	);
}

/**
 * 判断值是否在数组中
 * @param val mixed
 * @param array array
 * @returns boolean
 */
function inArray(val, array) {
	if (!Array.isArray(array)) return false

	// window.$dev && console.log( val, array )
	for (let i = 0, j = array.length; i < j; i++) {
		if (array[i].boxId == val) return true
	}
	return false
}

function getRoomBoxList(item) {
	let boxItems = item.boxItems || [];
	let boxIds = item.boxIds || [];
	// let list = [];

	let collect = []
	// window.$dev && console.log( boxIds )

	for (let i = 0; i < boxIds.length; i++) {
		const id = boxIds[i];
		if (boxItems[id]) {
			// list.push(boxItems[id]);

			if (inArray(id, collect)) {
				collect.forEach(item => {
					if (item.boxId == id)
						item.total++
				})
			}
			else {
				collect.push({ ...boxItems[id], total: 1 })
			}
		}
	}
	// window.$dev && console.log( list )
	return collect	//list;
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


function getBoxImageStyle(item) {
	if (item.imageUrl) {
		return 'background-image: url(' + item.imageUrl + ');'
	} else {
		return ''
	}
}

function isAnchorRoom(item) {
	let userItems = item.userItems || [];
	let result = false;
	for (const user of userItems) {
		if (user.isAnchor) {
			result = true;
		}
	}
	return result;
}


</script>
		
<template>
	<div id="pc-battle-room-list">
		<div class="list-header" v-if="listRoom.length > 0">
			<p class="header1">{{ t('battle.round') }}</p>
			<p class="header2">{{ t('common.box') }}</p>
			<p class="header3">{{ t('battle.price') }}</p>
			<p class="header4">{{ t('common.users') }}</p>
			<p class="header5">{{ t('common.action') }}</p>
		</div>
		<van-list v-model="loading" :finished="finished" :finished-text="t('battle.noMoreRoom')" @load="onLoad"
			:immediate-check="false">
			<div class="room_list">
				<transition-group name="animation">
					<div class="room_item" v-for="(item) in listRoom" :key="item.id"
						:class="[{ 'over': item.status > 2 }, { 'look': item.status == 2 }, { 'anchor': isAnchorRoom(item) }]"
						@click="enterRoom(item)">
						<div class="round">{{ item.round }}</div>
						<div class="boxs">
							<div class="box-item" v-for="(value, index) in getRoomBoxList(item)" :key="index">
								<div class="box-item-bg" :style="getBoxImageStyle(value)">
									<div class="total" v-if="value.total > 1">X {{ value.total }}</div>
									<img :src="value.weaponImageUrl" alt="">
								</div>
								<!-- <p> {{ value.goodsName }}</p> -->
							</div>
						</div>
						<div class="price">
							<!-- <img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt="" /> -->
							<!-- {{item.joinPrice }} -->
							<Price :value="item.joinPrice" show-icon before-size="20px" after-size="16px" color="#75DC9E">
							</Price>
						</div>
						<div class="player">
							<div class="player-wrap">
								<div class="player-item" v-for="(playItem, index) in item.peoples " :key="playItem">
									<div class="player-icon"
										v-if="item.userItems[index] && item.userItems[index].avater != null">
										<HeadPortrait :userModel='item.userItems[index]' :size="'pc-battle-header'"
											:hide-frame="true">
										</HeadPortrait>
									</div>
									<div class="player-icon add" v-else @click.stop="joinRoom(item)">
										<img src="@/assets/pcimg/battle/add.png" alt="">
									</div>
								</div>
							</div>
						</div>
						<div class="btn-wrap">
							<div class="item-btn" v-if="item.status == 1" @click.stop="joinRoom(item)">
								{{ t('battle.start') }}
							</div>
							<div class="item-btn" v-if="item.status == 2">
								{{ t('battle.watch') }}
							</div>
							<div class="item-btn" v-if="item.status == 3">
								{{ t('battle.view') }}
							</div>
						</div>
						<div class="anchor" v-if="isAnchorRoom(item)">{{ t('battle.anchorRoom') }}</div>
					</div>
				</transition-group>
			</div>
		</van-list>
		<van-dialog v-model:show="showJoinDialog" show-cancel-button class="join-dialog">
			<div class="join-dialog-wrap">
				<div class="join-content-wrap" v-html="t('battle.joinRoomTip', { money: joinDialogPrice })"></div>
			</div>
			<template #footer>
				<div class="join-dialog-bottom">
					<div class="bottom-btn-wrap">
						<div class="join-dialog-btn" @click="onClickJoinCancel">{{ t('notify.cancel') }}</div>
						<div class="join-dialog-btn" @click="onClickJoinSure">{{ t('battle.confirm') }}</div>
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
	</div>
</template>
		
<style lang="scss">
#pc-battle-room-list {
	min-height: 500px;

	.list-header {
		width: 100%;
		height: 80px;
		color: #6D6C82;
		font-size: 12px;
		text-align: left;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;

		p {
			box-sizing: border-box;
			display: flex;
			justify-content: center;
			// text-align: left;
		}

		.header1 {
			width: 135px;
			// padding-left: 10px;
		}

		.header2 {
			flex: 1;
			justify-content: flex-start;
			padding-left: calc((100px - 18px) / 2);
		}

		.header3 {
			width: 120px;
			justify-content: flex-start;
			// border-right: 1px solid red;
			// border-left: 1px solid red;
		}

		.header4 {
			margin-left: 14px;
			width: 178px;
			justify-content: flex-start;
		}

		.header5 {
			width: 162px;
			margin-left: 56px;
			margin-right: 50px;
		}
	}

	.room_list {
		display: flex;
		flex-direction: column;
		width: 100%;
		box-sizing: border-box;

		.room_item {
			position: relative;
			width: 100%;
			display: flex;
			height: 138px;
			align-items: center;
			transition: all 0.3s;
			opacity: 1;
			background: url(@/assets/pcimg/battle/row_item1.png) center no-repeat;
			background-size: 100% 100%;
			margin-bottom: 2px;

			.round {
				width: 135px;
				height: 123px;
				display: flex;
				align-items: center;
				justify-content: center;
				text-align: center;
				color: #FFF;

				font-size: 20px;
				position: relative;
			}

			.boxs {
				display: flex;
				flex: 1;
				overflow-y: scroll;
				height: 100%;
				gap: 12px;

				&::-webkit-scrollbar {
					width: 0;
				}

				.box-item {
					display: flex;
					justify-content: center;
					align-items: center;
					flex-direction: column;
					position: relative;
					background-size: contain;
					background-repeat: no-repeat;
					background-position: center;
					width: 100px;
					margin-right: 3px;
					flex-shrink: 0;

					.box-item-bg {
						display: flex;
						justify-content: center;
						align-items: center;
						background-size: contain;
						background-repeat: no-repeat;
						background-position: center;
						width: 100px;
						height: 100px;
						position: relative;

						.total {
							background: #292937;
							color: #F1F1F1;
							position: absolute;
							top: 0;
							right: 0;
							z-index: 199;
							padding: 4px 10px;
							border-radius: 4px;
							display: flex;
							align-items: center;
							line-height: 1.2em;
						}

						img {
							max-width: 100%;
							max-height: 100%;
						}

					}

					p {
						color: #999;
						text-align: center;
						font-size: 12px;
						margin-top: 3px;
					}
				}
			}

			.price {
				color: #75DC9E;

				font-size: 20px;
				font-weight: 700;
				width: 120px;
				// border-left: 1px solid red;
				// border-right: 1px solid red;

				img {
					width: 18px;
					height: 18px;
					margin-bottom: -3px;
				}
			}

			.player {
				display: flex;
				align-items: center;
				// margin-left: 14px;
				width: 178px;

				.player-wrap {
					display: flex;
					align-items: center;
					justify-content: center;

					.player-item {
						width: 46px;
						height: 46px;
						display: flex;
						margin-right: 10px;

						.player-icon {
							width: 46px;
							height: 46px;

							&.add {
								width: 46px;
								height: 46px;
								border: none;
								background: none;
								cursor: pointer;

								img {
									width: 100%;
									height: 100%;
								}
							}
						}
					}
				}

			}

			.btn-wrap {
				width: 162px;
				margin-left: 56px;
				margin-right: 50px;

				.item-btn {
					display: flex;
					width: 162px;
					height: 54px;
					justify-content: center;
					align-items: center;
					flex-shrink: 0;
					color: #CFCEE8;
					text-align: center;
					font-size: 13px;
					font-weight: 700;
					cursor: pointer;
					border-radius: 4px;
					background: #3A34B0;
				}
			}

			.anchor {
				position: absolute;
				width: 100px;
				height: 29px;
				border-radius: 0px 0px 5px 0px;
				background: #DA3F3F;
				left: 0;
				top: 0;
				color: #F6E0E0;
				font-size: 16px;
				font-weight: 300;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			&.look {
				// background: url(@/assets/pcimg/battle/row_item2.png) center no-repeat;
				// background-size: 100% 100%;

				.btn-wrap {
					.item-btn {
						background: #8E61F3;
					}
				}
			}

			&.over {
				background: url(@/assets/pcimg/battle/row_item3.png) center no-repeat;
				background-size: 100% 100%;

				.btn-wrap {
					.item-btn {
						background: #494D72;
					}
				}
			}

			&.anchor {
				background: url(@/assets/pcimg/battle/row_item2.png) center no-repeat;
				background-size: 100% 100%;
			}
		}

	}


	.animation-enter-from,
	.animation-leave-to {
		opacity: 0;
	}

	.animation-leave-active {
		position: absolute;

	}

	.join-dialog {
		.join-dialog-wrap {
			display: flex;
			flex-direction: column;
			align-items: center;
			color: #fff;
			font-size: 22px;
			line-height: 1.75em;

			.join-content-wrap {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-top: 40px;

				img {
					width: 34px;
				}

				p {
					color: #75DC9E;

					font-size: 22px;
					font-weight: 700;
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
					align-items: center;
					justify-content: center;
					width: 140px;
					height: 60px;
					background: #3A34B0;
					color: #fff;
					font-size: 18px;
					font-weight: bold;
					margin: 0 20px;

					&::after {
						display: none;
					}

					&:nth-child(2) {
						background: #7D51DF;
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
						background: #16182E;
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
}

@media (max-width: 1600PX) {

	.header5,
	.btn-wrap {
		margin: 0 !important;
	}
}
</style>