<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import HeadPortrait from "@/components/pc/head/HeadPortrait.vue";
import { ref, onMounted, onUnmounted } from "vue";
import { getRecords, getUserRecords } from "@/network/api/battle";
import { useRouter } from "vue-router";
import Price from '@/components/pc/common/Price.vue'

const router = useRouter();
const activeTab = ref(1); //1-全部 2-我的

const recordList = ref([]);

const allLoading = ref(false);
const allFinished = ref(false);
const allPageIndex = ref(1);

const meLoading = ref(false);
const meFinished = ref(false);
const mePageIndex = ref(1);
const meRecordList = ref([]);
const statistics = ref({});

let recordTimer = null;

onMounted(() => {
	// allPageIndex.value = 1;
	// getAllRecords();
	startRecordTime();
});

onUnmounted(() => {
	stopRecordTime();
})

function onClickTab(tab) {
	activeTab.value = tab;
	if (tab == 1) {
		// allPageIndex.value = 1;
		// getAllRecords();
		startRecordTime();
	} else if (tab == 2) {
		// mePageIndex.value = 1;
		// getUserAllRecords();
		startRecordTime();
	}
}

function startRecordTime() {
	stopRecordTime();

	if (activeTab.value == 1) {
		allPageIndex.value = 1;
		getAllRecords();
	} else if (activeTab.value == 2) {
		mePageIndex.value = 1;
		getUserAllRecords();
	}

	recordTimer = setInterval(() => {
		if (activeTab.value == 1) {
			allPageIndex.value = 1;
			getAllRecords();
		} else if (activeTab.value == 2) {
			mePageIndex.value = 1;
			getUserAllRecords();
		}
	}, 3500);
}

function stopRecordTime() {
	if (recordTimer != null) {
		clearInterval(recordTimer);
		recordTimer = null;
	}
}


async function getAllRecords() {
	const res = await getRecords({ limit: 20, page: allPageIndex.value, sortType: 1 });
	if (res.code === 0) {
		let items = res.data.items || [];

		for (let index = 0; index < items.length; index++) {
			const item = items[index];
			let battleUserDatas = item.battleUserDatas;
			let maxWinPrice = 0;
			for (let i = 0; i < battleUserDatas.length; i++) {
				let user = battleUserDatas[i];
				let price = 0;
				if (user.winFlag != 2) {
					for (let j = 0; j < user.winGoodsItems.length; j++) {
						price += Number(user.winGoodsItems[j].price);
					}
					price += Number(user.winAmount);
				}
				if (price > maxWinPrice) {
					maxWinPrice = price;
				}
			}
			item.maxWinPrice = maxWinPrice;
		}



		let preGoods = recordList.value;
		if (res.data.page == 1) {
			preGoods = [];
		}
		if (items) {
			recordList.value = [...preGoods, ...items];
		} else {
			recordList.value = preGoods;
		}

		// 加载状态结束
		allLoading.value = false;

		// 数据全部加载完成
		if (items.length < res.data.limit) {
			allFinished.value = true;
		}
	} else {
		allLoading.value = false;
		allFinished.value = true;
	}
}

async function getUserAllRecords() {
	const res = await getUserRecords({ limit: 20, page: mePageIndex.value });
	if (res.code === 0) {
		let items = res.data.items || [];
		for (let index = 0; index < items.length; index++) {
			const item = items[index];
			let battleUserDatas = item.battleUserDatas;
			let maxWinPrice = 0;
			for (let i = 0; i < battleUserDatas.length; i++) {
				let user = battleUserDatas[i];
				let price = 0;
				if (user.winFlag != 2) {
					for (let j = 0; j < user.winGoodsItems.length; j++) {
						price += Number(user.winGoodsItems[j].price);
					}
					price += Number(user.winAmount);
				}
				if (price > maxWinPrice) {
					maxWinPrice = price;
				}
			}
			item.maxWinPrice = maxWinPrice;
		}


		statistics.value = res.data.statistics || {};
		let preGoods = meRecordList.value;
		if (res.data.page == 1) {
			preGoods = [];
		}
		if (items) {
			meRecordList.value = [...preGoods, ...items];
		} else {
			meRecordList.value = preGoods;
		}

		// 加载状态结束
		meLoading.value = false;

		// 数据全部加载完成
		if (res.data.items == null || items.length < res.data.limit) {
			meFinished.value = true;
		}
	} else {
		meLoading.value = false;
		meFinished.value = true;
	}
}

function onLoad() {
	allPageIndex.value += 1;
	getAllRecords();
}

function onMeLoad() {
	mePageIndex.value += 1;
	getUserAllRecords();
}

/**
 * 判断值是否在数组中
 * @param val mixed
 * @param array array
 * @returns boolean
 */
function inArray(val, array) {
	if (!Array.isArray(array)) return false

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
	return collect	//list;
}

/// >>>>>>>>>>>>>>
function openDetail(id) {
	router.push({ path: '/p/battleDetail', query: { id: id, status: 3 } })
}
/// <<<<<<<<<<<<<<<

function judgeSelfWin(item) {
	let battleUserDatas = item.battleUserDatas;
	for (const user of battleUserDatas) {
		if (user.isSelf) {
			return user.winFlag != 2;
		}
	}
	return false;
}
function getBoxImageStyle(item) {
	if (item.imageUrl) {
		return 'background-image: url(' + item.imageUrl + ');'
	} else {
		return ''
	}
}

function isAnchorRoom(item) {
	let userItems = item.battleUserDatas || [];
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
	<div id="pc-battleHistory">
		<div class="list-header" v-if="recordList.length > 0">
			<p class="header1">{{ t('battle.round') }}</p>
			<p class="header2">{{ t('common.box') }}</p>
			<p class="header3">{{ t('battle.price') }}</p>
			<p class="header4">{{ t('common.users') }}</p>
			<p class="header5">{{ t('common.action') }}</p>
		</div>
		<div>
			<van-list v-model:loading="allLoading" :finished="allFinished" :finished-text="t('common.noMore')"
				@load="onLoad" :immediate-check="false">
				<div class="room_list">
					<div class="room_item" v-for="(item, index) in recordList" :key="index" @click="openDetail(item.id)">
						<div class="round">{{ item.round }}</div>
						<div class="boxs">
							<div class="box-item" v-for="(value, index) in getRoomBoxList(item)" :key="index">
								<div class="box-item-bg" :style="getBoxImageStyle(value)">
									<div class="total" v-if="value.total > 1">X {{ value.total }}</div>
									<img :src="value.weaponImageUrl" alt="">
								</div>
								<p> {{ value.goodsName }}</p>
							</div>
						</div>
						<div class="price">
							<!-- <img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" /> -->
							<!-- {{item.joinPrice }} -->
							<Price :value="item.joinPrice" color="#75DC9R" before-size="20px" after-size="14px" show-icon>
							</Price>
						</div>
						<div class="player">
							<div class="player-wrap">
								<div class="player-item" v-for="(playItem, index) in item.peoples " :key="playItem">
									<div class="player-icon" :class="{ lose: item.battleUserDatas[index].winFlag == 2 }">
										<HeadPortrait :userModel='item.battleUserDatas[index]' :size="'pc-battle-header'"
											:hide-frame="true">
										</HeadPortrait>
										<!-- <div class="win-flag" v-if="item.battleUserDatas[index].winFlag != 2"><img
												src="@/assets/pcimg/battle/win.png" alt="" /></div> -->
									</div>
								</div>
							</div>
						</div>
						<div class="btn-wrap">
							<div class="item-btn">
								{{ t('battle.view') }}
							</div>
						</div>
						<div class="anchor" v-if="isAnchorRoom(item)">{{ t('battle.anchorRoom') }}</div>
					</div>
				</div>
			</van-list>
		</div>
		<div v-if="false" v-show="activeTab == 2" class="me-wrap">
			<div class="top-wrap">
				<div class="top-item">
					<span class="item-title">{{ t('battle.battleTotal') }}</span>
					<span class="item-num">{{ statistics.battleNum }}</span>

				</div>
				<div class="top-item">
					<span class="item-title">{{ t('battle.bestInHistory') }}</span>
					<div class="item-num" v-show="Number(statistics.maxAmount) > 0"><img
							src="@/assets/pcimg/common/coin.svg" />{{ statistics.maxAmount }}</div>
					<span class="item-time" v-show="Number(statistics.maxAmount) > 0">{{ statistics.maxTime }}</span>
					<div class="item-nodata" v-show="Number(statistics.maxAmount) <= 0">{{ t('battle.historyNil') }}</div>
				</div>
				<div class="top-item">
					<span class="item-title">{{ t('battle.bestInToday') }}</span>
					<div class="item-num" v-show="Number(statistics.dayMaxAmount) > 0"><img
							src="@/assets/pcimg/common/coin.svg" />{{ statistics.dayMaxAmount }}</div>
					<span class="item-time" v-show="Number(statistics.dayMaxAmount) > 0">{{ statistics.dayMaxTime }}</span>
					<div class="item-nodata" v-show="Number(statistics.dayMaxAmount) <= 0">{{ t('battle.historyNil') }}
					</div>
				</div>
			</div>
			<van-list v-model:loading="meLoading" :finished="meFinished" :finished-text="t('common.noMore')"
				@load="onMeLoad" :immediate-check="false">
				<div class="history_item" v-for="(item, index) in meRecordList" :key="index" @click="openDetail(item.id)">
					<div class="top-info">
						<div>{{ t('battle.time') }}：{{ item.createTime }}</div>
						<div class="num">{{ t('battle.boxNo') }} {{ item.serialNum }}</div>
					</div>
					<div class="center">
						<div class="user">
							<div class="user_item" v-for="(son, index) in item.battleUserDatas" :key="index">
								<div class="line_bg" v-show="son.winFlag != 2"></div>
								<HeadPortrait :userModel="son" :size="'history'"></HeadPortrait>
							</div>
						</div>
						<div class="price">
							<img src="@/assets/pcimg/common/coin.svg" alt="" />{{
								item.maxWinPrice.toFixed(2)
							}}
						</div>
					</div>
					<div class="bottom-wrap">
						<div class="goods-list">
							<div class="goods-item" v-for="(value, index) in getRoomBoxList(item)" :key="index"
								:style="'background-image: url(' + value.imageUrl + ');'">
								<img :src="value.weaponImageUrl" alt="" />
							</div>
						</div>
						<div class="bottom-result result-win" v-if="judgeSelfWin(item)">{{ t('battle.victory') }}</div>
						<div class="bottom-result result-lose" v-else>{{ t('battle.fail') }}</div>
					</div>
				</div>
			</van-list>
		</div>
	</div>
</template>

<style lang="scss">
#pc-battleHistory {
	width: 100%;
	color: #fff;
	min-height: 975px;
	position: relative;
	max-width: 1120px;
	margin: auto;

	.list-header {
		width: 100%;
		margin-top: 24px;
		margin-bottom: 16px;
		color: #727391;
		text-transform: uppercase;
		font-size: 16px;
		font-weight: 500;
		text-align: left;
		display: flex;
		align-items: center;
		box-sizing: border-box;

		p {
			box-sizing: border-box;
			// display: flex;
			// justify-content: center;
			// text-align: left;
		}



		.header1 {
			width: 135px;
			text-align: left;
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
		gap: 8px;

		.room_item {
			position: relative;
			width: 100%;
			display: flex;
			// height: 138px;
			align-items: center;
			transition: all 0.3s;
			opacity: 1;
			// background: url(@/assets/pcimg/battle/row_item3.png) center no-repeat;
			// background-size: 100% 100%;
			// margin-bottom: 2px;
			border-radius: 12px;
			background: linear-gradient(89deg, rgba(136, 71, 255, 0.20) 0%, rgba(0, 0, 0, 0.00) 100%), #1B1D35;

			* {
				position: relative;
				z-index: 1;

			}

			&::before {
				content: "";
				position: absolute;
				inset: 0;
				background: url(@/assets/pcimg/battle/box_bg.png) no-repeat;
				background-size: contain;
				background-position: left;
				z-index: 0;
			}

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
				overflow-y: auto;
				height: 100%;

				// &::-webkit-scrollbar {
				// 	width: 0;
				// }

				.box-item {
					display: flex;
					justify-content: center;
					align-items: center;
					flex-direction: column;
					// position: relative;
					// background-size: contain;
					// background-repeat: no-repeat;
					// background-position: center;
					// width: 100px;
					// margin-right: 3px;
					// flex-shrink: 0;

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
				// color: #75DC9E;

				font-size: 20px;
				font-weight: 700;
				line-height: 28px;
				width: 120px;
				text-transform: uppercase;

				img {
					width: 18px;
					height: 18px;
					margin-bottom: -3px;
				}
			}

			.player {
				display: flex;
				align-items: center;
				margin-left: 14px;
				width: 178px;

				.player-wrap {
					display: flex;
					align-items: center;
					justify-content: center;

					.player-item {
						width: 46px;
						height: 46px;

						border-radius: 100%;
						overflow: hidden;

						&:not(:first-child) {
							margin-left: -8px;
						}

						.player-icon {
							width: 46px;
							height: 46px;
							border-radius: 100%;
							position: relative;

							.win-flag {
								position: absolute;
								top: -25px;
								right: -20px;
								z-index: 2;

								img {
									width: 55px;
									height: 47px;
								}
							}

							&.lose {
								-webkit-filter: brightness(40%);
								filter: brightness(40%);
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
					color: #151515;
					text-align: center;
					font-size: 16px;
					font-weight: 700;
					cursor: pointer;
					border-radius: 8px;
					background: #FFE063;
					cursor: pointer;
					transition: .3s all;
					border: 1px solid #FFE063;

					&:hover {
						background: transparent;
						color: #ffe063;
					}
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
