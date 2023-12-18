<script setup>
import HeadPortrait from "@/components/h5/head/HeadPortrait.vue";
import { ref, onMounted, onUnmounted } from "vue";
import { getRecords, getUserRecords } from "@/network/api/battle";
import { useRouter } from "vue-router";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import Tabs from "@/components/h5/home/Tabs.vue";
import TabsFlex from "@/components/h5/home/TabsFlex.vue";
import Currency from "@/components/h5/common/Currency.vue";
import { tokenName } from "@/config"
import { useI18n } from "vue-i18n";

const { t } = useI18n()

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
});

function onClickTab(tab) {
	activeTab.value = tab;
	if (tab == 1) {
		startRecordTime();
	} else if (tab == 2) {
		startRecordTime();
	}
}

function startRecordTime() {
	stopRecordTime();

	if (activeTab.value == 1) {
		allPageIndex.value = 1;
		allFinished.value = false;
		getAllRecords();
	} else if (activeTab.value == 2) {
		mePageIndex.value = 1;
		meFinished.value = false;
		getUserAllRecords();
	}

	// recordTimer = setInterval(() => {
	if (activeTab.value == 1) {
		allPageIndex.value = 1;
		allFinished.value = false;
		getAllRecords();
	} else if (activeTab.value == 2) {
		mePageIndex.value = 1;
		meFinished.value = false;
		getUserAllRecords();
	}
	// }, 3500);
}

function stopRecordTime() {
	if (recordTimer != null) {
		clearInterval(recordTimer);
		recordTimer = null;
	}
}

async function getAllRecords() {
	const res = await getRecords({
		limit: 20,
		page: allPageIndex.value,
		sortType: 1,
	});
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
			window.$dev && console.log(">>>>>>>>>>>>>>>>>>");
			allFinished.value = true;
		}
	} else {
		allLoading.value = false;
		allFinished.value = true;
	}
}

async function getUserAllRecords() {
	meLoading.value = true;

	window.$dev && console.log(allFinished.value);
	if (allFinished.value) return;

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
				if (user.winFlag != 2 && user.winGoodsItems != null) {
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

/// >>>>>>>>>>>>>>
function openDetail(id) {
	router.push({ path: "/m/battleDetail", query: { id: id, status: 3 } });
}
/// <<<<<<<<<<<<<<<

function judgeSelfWin(item) {
	let battleUserDatas = item.battleUserDatas;
	for (const user of battleUserDatas) {
		if (user.isSelf) {
			return user.winFlag == 2;
		}
	}
	return false;
}

let tabItems = ref([ t( 'router.battleHistory' ), t( 'router.battleRank' ),	t( 'common.gameIntroduction' ) ]);
function tabChangedEvent(event) {
	if (event == 1) {
		onClickRank();
	} else if (event == 2) {
		onClickHelp();
	}
}

function onClickRank() {
	router.push("/m/battle/battleRank");
}

function onClickCreate() {
	router.push("/m/createbattle");
}
function onClickHistory() {
	router.push("/m/battle/battleHistory");
}
function tabFlexChangedEvent(event) {
	if (!localStorage.getItem(tokenName)) {
		router.push("/m/sign");
		return;
	}

	activeTab.value = event + 1;
	if (activeTab.value == 1) {
		getAllRecords();
	} else {
		getUserAllRecords();
	}
}
</script>

<template>
	<div id="battleHistory" class="min-wrap-height">
		<!-- <TabsFlex
			@tabFlexChangedEvent="tabFlexChangedEvent"
			:paddingTop="20"
			:item-height="34"
			:fontsize="14"
			:items="[ t( 'router.battleHistory' ), t( 'router.myBattleHistory' ) ]"
		></TabsFlex> -->
		<div v-if="activeTab == 1">
			<van-list
				v-model:loading="allLoading"
				:finished="allFinished"
				:finished-text="t( 'battle.noMoreRoom' )"
				@load="onLoad"
				:immediate-check="false"
			>
				<div
					class="history_item"
					v-for="(item, index) in recordList"
					:key="index"
					@click="openDetail(item.id)"
				>
					<div class="center" :class="{ active: judgeSelfWin(item) }">
						<div class="price" :class="{ fail: judgeSelfWin(item) }">
							<!-- ${{ item.maxWinPrice.toFixed(2) }} -->
							<Currency
								fontcolor="white"
								:currency="item.maxWinPrice"
							></Currency>
							<div class="round">
								<span class="number_span">{{ item.round }}</span
								>{{ t( 'router.round' ) }}
							</div>
						</div>

						<div class="user">
							<div
								class="user_item"
								v-for="(son, index) in item.battleUserDatas"
								:key="index"
							>
								<!-- <div class="line_bg" v-show="son.winFlag != 2"></div> -->

								<HeadPortrait
									:userModel="son"
									:size="'history'"
									:style="'opacity: ' + (son.winFlag != 2 ? 1 : 0.4) + ';'"
								></HeadPortrait>
							</div>
						</div>
					</div>
					<div class="goods-list">
						<div
							class="goods-item"
							v-for="(value, index) in getRoomBoxList(item)"
							:key="index"
							:style="'background-image: url(' + value.imageUrl + ');'"
						>
							<img :src="value.weaponImageUrl" alt="" />
						</div>
					</div>
					<div class="top-info">
						<div class="num">{{ t( 'battle.boxNo' ) }} {{ item.serialNum }}</div>
						<div>{{ item.createTime }}</div>
					</div>
				</div>
			</van-list>
		</div>
		<div v-if="activeTab == 2" class="me-wrap">
			<!-- <div class="top-wrap">
				<div class="top-item">
					<span class="item-title">参与场数</span>
					<span class="item-num">{{ statistics.battleNum }}</span>
				</div>
				<div class="top-item">
					<span class="item-title">历史最佳拼箱金额</span>
					<div class="item-num" v-show="Number(statistics.maxAmount) > 0">
						<img src="@/assets/romimg/common/gold.png" />{{
							statistics.maxAmount
						}}
					</div>
					<span class="item-time" v-show="Number(statistics.maxAmount) > 0">{{
						statistics.maxTime
					}}</span>
					<div class="item-nodata" v-show="Number(statistics.maxAmount) <= 0">
						还没记录，赶紧去参加吧
					</div>
				</div>
				<div class="top-item">
					<span class="item-title">今日最佳拼箱金额</span>
					<div class="item-num" v-show="Number(statistics.dayMaxAmount) > 0">
						<img src="@/assets/romimg/common/gold.png" />{{
							statistics.dayMaxAmount
						}}
					</div>
					<span
						class="item-time"
						v-show="Number(statistics.dayMaxAmount) > 0"
						>{{ statistics.dayMaxTime }}</span
					>
					<div
						class="item-nodata"
						v-show="Number(statistics.dayMaxAmount) <= 0"
					>
						还没记录，赶紧去参加吧
					</div>
				</div>
			</div> -->
			<van-list
				v-model:loading="meLoading"
				:finished="meFinished"
				:finished-text="t( 'common.noMore' )"
				@load="onMeLoad"
				:immediate-check="false"
			>
				<div
					class="history_item"
					v-for="(item, index) in meRecordList"
					:key="index"
					@click="openDetail(item.id)"
				>
					<div class="center" :class="{ active: judgeSelfWin(item) }">
						<div class="price" :class="{ fail: judgeSelfWin(item) }">
							<Currency
								fontcolor="white"
								:currency="item.maxWinPrice"
							></Currency>
							<div class="round">
								<span class="number_span">{{ item.round }}</span
								>{{ t( 'battle.round' ) }}
							</div>
						</div>

						<div class="user">
							<div
								class="user_item"
								v-for="(son, index) in item.battleUserDatas"
								:key="index"
							>
								<!-- <div class="line_bg" v-show="son.winFlag != 2"></div> -->
								<HeadPortrait
									:userModel="son"
									:size="'history'"
									:style="'opacity: ' + (son.winFlag != 2 ? 1 : 0.4) + ';'"
								></HeadPortrait>
							</div>
						</div>
					</div>
					<div class="bottom-wrap">
						<div class="goods-list">
							<div
								class="goods-item"
								v-for="(value, index) in getRoomBoxList(item)"
								:key="index"
								:style="'background-image: url(' + value.imageUrl + ');'"
							>
								<img :src="value.weaponImageUrl" alt="" />
							</div>
						</div>
						<!-- <div class="bottom-result result-win" v-if="judgeSelfWin(item)">
							胜利
						</div>
						<div class="bottom-result result-lose" v-else>惜败</div> -->
					</div>
					<div class="top-info">
						<div class="num">{{ t( 'battle.boxNo' ) }} {{ item.serialNum }}</div>
						<div>{{ item.createTime }}</div>
					</div>
				</div>
			</van-list>
		</div>
	</div>
</template>

<style lang="scss">
#battleHistory {
	box-sizing: border-box;
	width: 750px;
	padding-bottom: 20px;

	.battle-top-wrap {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 26px 0px 23px 35px;
		background-color: #111324;
		// width: 100%;
		height: 160px;
		box-sizing: border-box;
		z-index: 180;

		.top-item1 {
			background-color: #554bf7;
			border-radius: 6px;
			width: 163px;
			height: 80px;
			width: 212px;
			color: #fff;
			font-size: 28px;
			text-align: center;
			line-height: 75px;
			font-weight: 400;
			box-sizing: border-box;
			span {
				font-size: 32px;
			}
		}

		.top-item2 {
			width: 520px;
		}
		.top-item3 {
			border-radius: 12px;
			border: 1px solid #1e2037;
			width: 140px;
			height: 80px;
			color: #b4b6c8;
			font-size: 24px;
			text-align: center;
			line-height: 75px;
			font-weight: 400;
			box-sizing: border-box;
		}
	}

	.common-nav {
		margin-left: 25px;
		width: 700px;
	}

	.history_item {
		box-sizing: border-box;
		// background: url(@/assets/romimg/battle/history/back.png) no-repeat center;
		// background-size: contain;
		width: 710px;
		height: 280px;
		margin: 0px auto;
		// padding: 10px 16px;
		border-radius: 8px 0px 0px 0px;

		.top-info {
			background: #111324;
			display: flex;
			align-items: center;
			justify-content: space-between;
			color: #4c4f5d;
			height: 60px;
			line-height: 60px;
			font-size: 24px;

			font-style: normal;
			font-weight: 400;
			box-sizing: border-box;
			padding: 0 10px;
			.num {
				flex: 1;
				text-align: left;
			}
		}

		.center {
			display: flex;
			height: 90px;
			align-items: center;
			justify-content: space-between;
			border-top-left-radius: 12px;
			padding: 0;

			// background-repeat: no-repeat;
			background: linear-gradient(
				91deg,
				rgba(117, 219, 157, 0.4) 0.23%,
				rgba(117, 219, 157, 0.01) 51.09%,
				rgba(117, 219, 157, 0) 90.68%
			);

			// background-position: 0 0;
			// background-repeat: no-repeat;
			&.active {
				background: linear-gradient(
					91deg,
					rgba(247, 80, 68, 0.4) 0.23%,
					rgba(247, 80, 68, 0.01) 51.09%,
					rgba(247, 80, 68, 0) 90.68%
				);
			}

			// line-height: 90px;
			font-size: 30px;
			font-style: normal;
			font-weight: 700;

			.user {
				display: flex;
				align-items: center;

				.user_item {
					position: relative;
					width: 64px;
					height: 64px;
					margin-right: 40px;
					z-index: 2 !important;

					.line_bg {
						display: block;
						position: absolute;
						width: 115px;
						height: 115px;
						background: url("@/assets/romimg/battle/lightUrl.png") no-repeat
							center;
						background-size: 100% 100%;
						left: -22px;
						top: -25px;
						animation: rotato_ani 2s linear infinite;
						z-index: -1 !important;
					}
				}
			}

			.price {
				background: url(@/assets/romimg/battle/history/w-history-bg.png);
				background-size: 100% 90px;
				&.fail {
					background: url(@/assets/romimg/battle/history/f-history-bg.png);
				}
				height: 80px;
				display: flex;
				justify-content: center;
				align-items: center;
				// height: 100px;
				// color: #fff;
				// font-size: 30px;
				// font-weight: bold;
				// padding-left: 30px;
				margin-left: 20px;

				.round {
					color: #fff;
					font-size: 24px;
					font-style: normal;
					font-weight: 500;
					margin-left: 40px;
					span {
						font-size: 26px;
					}
				}
			}
		}

		.goods-list {
			display: flex;
			align-items: center;
			height: 110px;
			background: #111324;
			box-sizing: border-box;
			padding: 0 10px;
			.goods-item {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-top: 0px;
				width: 110px;
				height: 110px;
				background-size: contain;
				background-position: center;
				background-repeat: no-repeat;
				margin-right: 8px;

				img {
					max-width: 110px;
					max-height: 110px;
				}
			}
		}

		.bottom-wrap {
			background: #111324;
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 110px;
			// margin: 10px auto;

			box-sizing: border-box;

			.bottom-result {
				font-size: 34px;
				margin-right: 12px;
			}

			.result-win {
				color: #ff6355;
			}

			.result-lose {
				color: #9c9c9c;
			}
		}

		&:nth-child(1) {
			margin-top: 5px;
		}
	}

	.top-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		// margin-left: 25px;
		width: 750px;
		margin-top: 21px;

		.top-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			background: url(@/assets/romimg/battle/history/me_bg1.png) no-repeat
				center;
			background-size: contain;
			width: 228px;
			height: 131px;
			margin-right: 9px;

			.item-title {
				color: #fff;
				font-size: 18px;
				margin-top: 6px;
			}

			.item-num {
				display: flex;
				align-items: center;
				flex: 1;
				color: #fffe00;
				font-size: 30px;
				margin-top: 10px;

				img {
					width: 42px;
					height: 42px;
				}
			}

			.item-time {
				color: #cdaf66;
				font-size: 17px;
				margin-bottom: 9px;
			}

			.item-nodata {
				color: #9c9c9c;
				font-size: 17px;
				display: flex;
				align-items: center;
				flex: 1;
				text-align: center;
			}

			&:first-child {
				margin-left: 8px;
			}
		}

		&::after,
		&::before {
			content: "";
			display: block;
		}
	}

	.me-wrap {
		min-height: calc(100vh - 440px);
	}
	@keyframes rotato_ani {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(359deg);
		}
	}
}
</style>
