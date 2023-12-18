<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, onUnmounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { getGoodsLevelColor } from "@/util/common";
import { GoodImageBgType } from "@/util/util";

import { getGoodsAttributes } from "@/network/api/index";
import {
	getLuckyGoods,
	getLuckyTypes,
	getLuckyRecords,
	getLuckyStats,
	getLuckyCustom,
} from "@/network/api/lucky";
const route = useRoute();
const router = useRouter();
const store = useStore();
const tabType = ref(1); //1-hot 2-record 3-统计 4-十佳
const searchKey = ref("");
const roomSort = ref(store.state.fliterParams.roomSort);
const filterScreenShow = ref(false);
const typeItemsArray = ref([{ name: "推荐", id: 1 }]);
// const filterSelect = ref({ type: 0, subType: 0 });
const filterSelect = computed(() => store.state.fliterParams);
const curFliterTypeItem = ref({});
const fliterInputMin = ref("");
const fliterInputMax = ref("");

const filterPriceArray = ref([
	{ id: 1, min: 0, max: 50 },
	{ id: 2, min: 50, max: 100 },
	{ id: 3, min: 100, max: 200 },
	{ id: 4, min: 200, max: 500 },
]);
const curFliterPriceItem = ref({});

//触底加载
const loading = ref(false);
const finished = ref(false);
const pager = ref({ pageIndex: 1, limit: 20 });
const goodsList = ref([]);

const historyShowDetails = ref(false);
const dropList = ref([]);
const dropLoading = ref(false);
const dropFinished = ref(false);
const dropPager = ref({ pageIndex: 1, limit: 20, userType: 1, details: false });
let dropTimer = null;
const exteriorItems = ref([]);

const statList = ref([]);
const allStat = ref({});
const statPopup = ref(false);
const statInputMin = ref("");
const statInputMax = ref("");

const bottomFilterShow = ref(false);
const bottomFilterData = ref({ userType: 1, details: false });

const meJoinedCard = ref(true);

onMounted(() => {
	getGoodsList();
	getGoodsTypes();
	getAttributes();
	getCustomStats();
});

onUnmounted(() => {
	stopDropTime();
});

async function getGoodsList() {
	let params = {};
	params.page = pager.value.pageIndex;
	params.limit = pager.value.limit;
	params.sortType = roomSort.value;
	if (searchKey.value) {
		params.goodsName = searchKey.value;
	}
	if (filterSelect.value.type == 0) {
		params.hotStatus = 1;
	} else if (filterSelect.value.type == -1) {
		params.hotStatus = 2;
	} else {
		params.type = filterSelect.value.type;
	}
	if (filterSelect.value.subType != 0) {
		params.subType = filterSelect.value.subType;
	}
	if (fliterInputMin.value != "" && fliterInputMax.value != "") {
		params.minPrice = fliterInputMin.value;
		params.maxPrice = fliterInputMax.value;
	}

	let res = await getLuckyGoods(params);
	if (res.code == 0) {
		let items = res.data.items || [];
		let preList = goodsList.value;
		if (res.data.page == 1) {
			preList = [];
		}
		goodsList.value = [...preList, ...items];
		loading.value = false;

		if (items.length < res.data.limit) {
			finished.value = true;
		}
	} else {
		loading.value = false;
		finished.value = true;
	}
}

async function getGoodsTypes() {
	let res = await getLuckyTypes();
	if (res.code == 0) {
		typeItemsArray.value = res.data.typeItems || [];
		typeItemsArray.value.unshift({ id: 0, name: "推荐", subTypes: [] });
		typeItemsArray.value.push({ id: -1, name: "终极武器", subTypes: [] });

		let subTypeItems = res.data.subTypeItems || [];

		for (let index = 0; index < typeItemsArray.value.length; index++) {
			const typeItem = typeItemsArray.value[index];
			let subTypes = [];
			if (typeItem.id != -1 && typeItem.id != 0) {
				subTypes.push({ id: 0, name: "推荐" });
			}
			for (let j = 0; j < subTypeItems.length; j++) {
				const subTypeItem = subTypeItems[j];
				if (subTypeItem.type == typeItem.id) {
					subTypes.push(subTypeItem);
				}
			}
			if (typeItem.id == -1) {
				subTypes.push({ id: 0, name: "推荐" });
			}
			typeItem.subTypes = subTypes;
		}
	}
}

async function getLuckyDrop() {
	const res = await getLuckyRecords({
		limit: dropPager.value.limit,
		page: dropPager.value.pageIndex,
		userType: dropPager.value.userType,
	});
	if (res.code == 0) {
		let items = res.data.items || [];
		let preList = dropList.value;
		if (res.data.page == 1) {
			preList = [];
		}
		dropList.value = [...preList, ...items];
		dropLoading.value = false;

		if (items.length < res.data.limit) {
			dropFinished.value = true;
		}
	} else {
		dropLoading.value = false;
		dropFinished.value = true;
	}
}

async function getAttributes() {
	let res = await getGoodsAttributes();
	if (res.code == 0) {
		let data = res.data || {};
		exteriorItems.value = data.exteriorItems;
	}
}

async function getStats() {
	let res = await getLuckyStats();
	if (res.code == 0) {
		let data = res.data || {};
		statList.value = data.items || [];
	}
}

async function getCustomStats(start, end) {
	let res = await getLuckyCustom({ startProbs: start, endProbs: end });
	if (res.code == 0) {
		let data = res.data || {};
		allStat.value = data.item || {};

		let startProbs = allStat.value.startProbs;
		let endProbs = allStat.value.endProbs;
		let name = "";
		if (startProbs == 1 && endProbs == 100) {
			name = "全部";
		} else {
			name = startProbs + "-" + endProbs + "%";
		}
		allStat.value.name = name;
	}
}

function startDropTime() {
	stopDropTime();
	getLuckyDrop();
	dropTimer = setInterval(() => {
		getLuckyDrop();
	}, 5000);
}

function stopDropTime() {
	if (dropTimer != null) {
		clearInterval(dropTimer);
		dropTimer = null;
	}
}

function onDropLoading() {
	dropPager.value.pageIndex += 1;
	getLuckyDrop();
}

function onShowBottomFliter() {
	bottomFilterData.value.userType = dropPager.value.userType;
	bottomFilterData.value.details = historyShowDetails.value;
	bottomFilterShow.value = true;
}
function onClickDropFliterSure() {
	historyShowDetails.value = bottomFilterData.value.details;
	dropPager.value.userType = bottomFilterData.value.userType;
	dropPager.value.pageIndex = 1;
	bottomFilterShow.value = false;
	getLuckyDrop();
}

function onClickTab(type) {
	tabType.value = type;
	if (type == 2) {
		startDropTime();
	} else {
		stopDropTime();
	}

	if (type == 3) {
		getStats();
		getCustomStats(0, 0);
	}
}

function onSearchData() {
	pager.value.pageIndex = 1;
	getGoodsList();
}

function onClickSort(sortType) {
	roomSort.value = sortType;
	filterSelect.value.roomSort = sortType;
	pager.value.pageIndex = 1;
	getGoodsList();
}

function onLoad() {
	pager.value.pageIndex += 1;
	getGoodsList();
}

function onClickGoodsItem(item) {
	store.commit("setFliterParams", filterSelect.value);
	router.push({ path: "/m/luckyDetails", query: { id: item.id } });
}

function onClickDropItem(item) {
	store.commit("setFliterParams", filterSelect.value);
	router.push({ path: "/m/luckyDetails", query: { id: item.luckyGoodsId } });
}

function onClickStatSearch() {
	statPopup.value = true;
}

function onClickStatCancel() {
	statPopup.value = false;
}

function onClickStatSure() {
	statPopup.value = false;
	let min = Number(statInputMin.value);
	let max = Number(statInputMax.value);
	if (min > max) {
		NotifyF("输入错误，最小概率大于最大概率");
		return;
	}
	getCustomStats(min, max);
}

function refreshStat() {
	statList.value = [];
	getStats();
	onClickStatSure();
}

function onClickFliterType(item) {
	filterSelect.value.type = item.id;
	curFliterTypeItem.value = item;
}
function onClickFliterSubType(item) {
	filterSelect.value.subType = item.id;
}

function clearFliterPrice() {
	fliterInputMin.value = "";
	fliterInputMax.value = "";
}

function onClickFliterPrice(item) {
	curFliterPriceItem.value = item;
	fliterInputMin.value = item.min + "";
	fliterInputMax.value = item.max + "";
}

function onClickFliterSure() {
	if (fliterInputMin.value != "" && fliterInputMax.value != "") {
		if (Number(fliterInputMin.value) > Number(fliterInputMax.value)) {
			NotifyF(t( 'openbox.inputFailForMoney' ));
			return;
		}
	}
	filterScreenShow.value = false;
	pager.value.pageIndex = 1;
	getGoodsList();
}

function getExteriorName(exterior) {
	for (let index = 0; index < exteriorItems.value.length; index++) {
		const item = exteriorItems.value[index];
		if (item.id == exterior) {
			return item.name;
		}
	}
}

function onClickHistory() {
	router.push("/m/ammonCardRank");
}

watch(route, (newRoute, oldRoute) => {
	if (newRoute.path != "/m/luckyDetails") {
		store.commit("setFliterParams", { type: 0, subType: 0, roomSort: 0 });
	}
});
</script>
<template>
	<div id="luckybox">
		<div class="common-nav">
			<div
				class="common-nav-item"
				:class="{ active: tabType == 1 }"
				@click="onClickTab(1)"
			>
				抢卡炼金
			</div>
			<div
				class="common-nav-item"
				:class="{ active: tabType == 2 }"
				@click="onClickTab(2)"
			>
				历史记录
			</div>
			<div
				class="common-nav-item"
				:class="{ active: tabType == 3 }"
				@click="onClickHistory()"
			>
				抢卡排行
			</div>
		</div>
		<div v-show="tabType == 1" class="goods-wrap">
			<div class="top-sort">
				<div class="fliter-wrap">
					<van-checkbox
						v-model="meJoinedCard"
						checked-color="#FBFA02"
						shape="square"
						>查看我参与的卡片
					</van-checkbox>
				</div>
			</div>

			<div class="goods_list_main">
				<van-list
					v-if="goodsList.length > 0"
					v-model="loading"
					:finished="finished"
					:finished-text="t( 'common.noMore' )"
					@load="onLoad"
					:key="pager.pageIndex"
					:immediate-check="false"
				>
					<div class="goods_list">
						<div
							class="goods_list_item"
							v-for="(item, index) in goodsList"
							:key="index"
							@click="onClickGoodsItem(item)"
						>
							<div class="pic">
								<img :src="item.iconUrl" :alt="item.goodsName" />
							</div>
							<p class="hide">{{ item.goodsName }}</p>
							<div class="price">
								<img src="@/assets/romimg/lucky/item_gold.png" alt="" />{{
									item.price
								}}
							</div>
						</div>
					</div>
				</van-list>
				<div class="not_yet" v-else>{{ t( 'common.noMore' ) }}</div>
			</div>
		</div>
		<div v-show="tabType == 2" class="history-wrap">
			<div class="sort-wrap" @click="onShowBottomFliter()">
				<div class="sort-item">
					{{ dropPager.userType == 1 ? "会员" : "主播" }}
				</div>
				<div class="sort-item">
					{{ historyShowDetails ? "详细查看" : "简洁查看" }} &nbsp;>
				</div>
			</div>
			<div class="drop-wrap">
				<van-list
					v-if="goodsList.length > 0"
					v-model="dropLoading"
					:finished="dropFinished"
					:finished-text="t( 'common.noMore' )"
					@load="onDropLoading"
					:key="dropPager.pageIndex"
					:immediate-check="false"
				>
					<div class="drop-list" v-if="!historyShowDetails">
						<div
							class="drop-item"
							v-for="(item, index) in dropList"
							:key="index"
							:class="{ active: item.isWin }"
							@click="onClickDropItem(item)"
						>
							<div class="drop-jj-item-wrap">
								<div class="item-head">
									<HeadPortrait
										:userModel="item"
										:size="'head_n_lucky_tab_his'"
									></HeadPortrait>
									<div v-if="dropPager.userType == 2">
										<img
											class="item-anchor"
											v-if="!item.isWin"
											src="@/assets/romimg/lucky/tab_his_anchor1.png"
											alt=""
										/>
										<img
											class="item-anchor"
											v-else
											src="@/assets/romimg/lucky/tab_his_anchor2.png"
											alt=""
										/>
									</div>
								</div>
								<div class="item-goods-info">
									<div class="item-goods-name">{{ item.goodsName }}</div>
									<div class="item-goods-attr">
										<img :src="item.iconUrl" alt="" />
										<div class="item-goods-wg">
											{{ getExteriorName(item.exterior) }}
										</div>
										<div class="item-goods-price">{{ item.price }}</div>
									</div>
								</div>
								<div class="item-right">
									<div class="per">{{ item.probability }}%</div>
									<div class="goods-wrap">
										<img v-show="item.isWin" :src="item.iconUrl" alt="" />
										<img :src="item.rewardIconUrl" alt="" />
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="drop-list" v-else>
						<div
							class="drop-detail-item"
							v-for="(item, index) in dropList"
							:key="index"
							:class="{ active: item.isWin }"
							@click="onClickDropItem(item)"
						>
							<div class="drop-jj-item-wrap">
								<div class="his-top-wrap">
									<div class="item-head-bg">
										<HeadPortrait
											:userModel="item"
											:size="'head_n_lucky_detail'"
											class="head"
										></HeadPortrait>
										<p class="hide">{{ item.nickName }}</p>
										<div class="anchor" v-if="dropPager.userType == 2">
											<img
												src="@/assets/romimg/lucky/item_anchor1.png"
												alt=""
											/>
											主播
										</div>
									</div>
									<div class="his-item-time">{{ item.createTime }}</div>
								</div>
								<div class="his-bottom-wrap">
									<div class="item-goods-info">
										<div class="item-goods-name hide">{{ item.goodsName }}</div>
										<div class="item-goods-attr">
											<img :src="item.iconUrl" alt="" />
											<div class="item-goods-wg">
												{{ getExteriorName(item.exterior) }}
											</div>
											<div class="item-goods-price">{{ item.price }}</div>
										</div>
									</div>
									<div class="per">{{ item.probability }}%</div>

									<div class="goods-wrap">
										<img :src="item.iconUrl" alt="" />
										<img :src="item.rewardIconUrl" alt="" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</van-list>
			</div>
		</div>
		<div v-show="tabType == 3" class="stat-wrap">
			<div class="top-wrap">
				<span class="text">公平展示</span>
				<div class="refresh-wrap" @click="refreshStat">
					最近3天记录统计
					<img src="@/assets/romimg/lucky/refresh.png" alt="" />
				</div>
			</div>
			<div class="tab-wrap">
				<div class="tab-title">
					<p>成功概率</p>
					<p>次数统计</p>
					<div class="title-img">
						<img src="@/assets/romimg/openbox/baolv7.png" alt="" />
						<span>次数/占比</span>
					</div>
					<div class="title-img">
						<img src="@/assets/romimg/openbox/baolv2.png" alt="" />
						<span>次数/占比</span>
					</div>
				</div>
				<div class="table">
					<div v-for="(item, index) in statList" :key="index" class="table-item">
						<p>{{ item.startProbs + "-" + item.endProbs + "%" }}</p>
						<p>{{ item.winCount + item.failCount }}</p>
						<p>
							{{ item.winCount }} |
							{{ (Number(item.winRatio) * 100).toFixed(2) }}%
						</p>
						<p>
							{{ item.failCount }} |
							{{ (Number(item.failRatio) * 100).toFixed(2) }}%
						</p>
					</div>
				</div>
				<div class="search-wrap" @click="onClickStatSearch">
					<div class="range">全部</div>
					<span>修改</span>
				</div>
				<div class="all-stat-item">
					<p>{{ allStat.name }}</p>
					<p>{{ allStat.winCount + allStat.failCount }}</p>
					<p>
						{{ allStat.winCount }} |
						{{ (Number(allStat.winRatio) * 100).toFixed(2) }}%
					</p>
					<p>
						{{ allStat.failCount }} |
						{{ (Number(allStat.failRatio) * 100).toFixed(2) }}%
					</p>
				</div>
			</div>
		</div>
		<van-popup
			v-model:show="filterScreenShow"
			position="right"
			:style="{ height: '100%' }"
		>
			<div class="stat-pop-wrap">
				<div class="stat-pop-title">类别</div>
				<div class="filter-type-wrap">
					<div
						v-for="item in typeItemsArray"
						class="filter-type-item"
						:key="item.id"
						:class="{ active: filterSelect.type == item.id }"
						@click="onClickFliterType(item)"
					>
						{{ item.name }}
					</div>
				</div>
				<div
					class="stat-pop-title"
					v-if="
						curFliterTypeItem.subTypes && curFliterTypeItem.subTypes.length > 0
					"
				>
					型号
				</div>
				<div
					class="filter-type-wrap"
					v-if="
						curFliterTypeItem.subTypes && curFliterTypeItem.subTypes.length > 0
					"
				>
					<div
						v-for="item in curFliterTypeItem.subTypes"
						class="filter-type-item"
						:key="item.id"
						:class="{ active: filterSelect.subType == item.id }"
						@click="onClickFliterSubType(item)"
					>
						{{ item.name }}
					</div>
				</div>

				<div class="lucky-pop-title">
					<div class="pop-l-title">价格</div>
					<div class="pop-r-title" @click="clearFliterPrice()">清空价格</div>
				</div>
				<div class="input-wrap">
					<div class="input-item">
						<input type="text" v-model="fliterInputMin" placeholder="最低价" />
					</div>
					<span>一</span>
					<div class="input-item">
						<input type="text" v-model="fliterInputMax" placeholder="最高价" />
					</div>
				</div>
				<div class="filter-type-wrap">
					<div
						v-for="item in filterPriceArray"
						class="filter-type-item"
						:key="item.id"
						:class="{ active: curFliterPriceItem.id == item.id }"
						@click="onClickFliterPrice(item)"
					>
						{{ item.min }}- {{ item.max }}
					</div>
				</div>
				<div class="btn-wrap fliter-btn-height">
					<div class="stat-btn" @click="filterScreenShow = false">{{ t( 'notify.cancel' ) }}</div>
					<div class="stat-btn" @click="onClickFliterSure()">{{ t( 'notify.confirm' ) }}</div>
				</div>
			</div>
		</van-popup>
		<van-popup
			v-model:show="statPopup"
			position="right"
			:style="{ height: '100%' }"
		>
			<div class="stat-pop-wrap">
				<div class="stat-pop-title">概率范围</div>
				<div class="input-wrap">
					<div class="input-item">
						<input type="text" v-model="statInputMin" placeholder="最低概率" />
					</div>
					<span>一</span>
					<div class="input-item">
						<input type="text" v-model="statInputMax" placeholder="最高概率" />
					</div>
				</div>
				<div class="btn-wrap">
					<div class="stat-btn" @click="onClickStatCancel()">{{ t( 'notify.cancel' ) }}</div>
					<div class="stat-btn" @click="onClickStatSure()">{{ t( 'notify.confirm' ) }}</div>
				</div>
			</div>
		</van-popup>
		<van-popup
			v-model:show="bottomFilterShow"
			position="bottom"
			class="bottom-filter"
		>
			<div class="bottom-filter-wrap">
				<div class="bottom-title">
					<img src="@/assets/romimg/lucky/icon_pepole.png" alt="" />
					<span>记录类型</span>
				</div>
				<div class="bottom-btn-wrap">
					<div
						class="bottom-btn1"
						:class="{ active: bottomFilterData.userType == 1 }"
						@click="bottomFilterData.userType = 1"
					>
						会员
					</div>
					<div
						class="bottom-btn1"
						:class="{ active: bottomFilterData.userType == 2 }"
						@click="bottomFilterData.userType = 2"
					>
						主播
					</div>
				</div>
				<div class="bottom-title">
					<img src="@/assets/romimg/lucky/icon_category.png" alt="" />
					<span>展示类型</span>
				</div>
				<div class="bottom-btn-wrap">
					<div
						class="bottom-btn1"
						:class="{ active: !bottomFilterData.details }"
						@click="bottomFilterData.details = false"
					>
						简洁查看
					</div>
					<div
						class="bottom-btn1"
						:class="{ active: bottomFilterData.details }"
						@click="bottomFilterData.details = true"
					>
						详细查看
					</div>
				</div>
				<div class="start-btn-wrap">
					<div class="start-btn" @click="onClickDropFliterSure()">{{ t( 'notify.confirm' ) }}</div>
				</div>
			</div>
		</van-popup>
	</div>
</template>

<style lang="scss">
#luckybox {
	width: 750px;
	min-height: 1280px;
	padding-top: 40px;
	padding-bottom: 30px;

	.goods-wrap {
		.search_top {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 30px;

			.search {
				width: 694px;
				height: 56px;
				position: relative;
				border: 2px solid #fbfa02;

				input {
					position: absolute;
					left: 0;
					top: 0;
					width: 100%;
					height: 100%;
					border: none;
					background: none;
					color: #fff;
					padding-left: 15px;
					padding-right: 116px;
					box-sizing: border-box;
					font-size: 18px;
				}

				.search_btn {
					width: 100px;
					height: 100%;
					position: absolute;
					right: 0;
					top: 0;
					display: flex;
					justify-content: center;
					align-items: center;
					padding-left: 30px;
					box-sizing: border-box;

					img {
						width: 26px;
					}
				}
			}
		}

		.top-sort {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			margin: 35px 25px 15px;

			.fliter-wrap {
				.van-checkbox {
					height: 30px;

					.van-checkbox__label {
						font-size: 22px;
						color: #fff;
						height: 30px;
						line-height: 32px;
					}

					i {
						width: 25px;
						height: 25px;
						border: 2px solid #fff;

						&::before {
							color: #000;
							width: 25px;
							height: 25px;
							line-height: 25px;
						}
					}
				}
			}
		}

		.goods_list_main {
			padding: 7px 25px;
			background-color: #201e2c;
			min-height: 900px;

			.goods_list {
				width: 100%;
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;

				.goods_list_item {
					width: 340px;
					height: 434px;
					background-repeat: no-repeat;
					background-size: contain;
					background-position: center;
					margin-bottom: 30px;
					position: relative;
					background-image: url(@/assets/romimg/card/bg.png);
					color: #fff;
					font-size: 26px;

					span {
						display: block;
						text-align: center;
						font-size: 16px;
						color: #eb4b4b;
						margin-top: 12px;
					}

					.pic {
						display: flex;
						align-items: center;
						box-sizing: border-box;
						justify-content: center;
						width: 234px;
						height: 135px;
						margin: 30px auto 0;

						img {
							max-width: 100%;
							max-height: 100%;
						}
					}

					p {
						padding: 0 20px;
						font-size: 28px;
						margin-top: 25px;
						text-align: center;
					}

					.price {
						display: flex;
						align-items: center;
						justify-content: center;
						color: #ffd135;
						font-weight: bold;
						font-size: 26px;
						width: 100%;
						height: 70px;
						margin-top: 6px;

						img {
							width: 25px;
							height: 25px;
							margin-right: 5px;
							margin-top: 1px;
						}
					}
				}
			}

			.not_yet {
				text-align: center;
				color: #ccc;
				font-size: 30px;
				text-align: center;
				line-height: 50px;
			}
		}

		&::-webkit-scrollbar {
			width: 0px;
		}
	}

	.history-wrap {
		width: 750px;
		position: relative;

		.sort-wrap {
			margin: 30px 5px 20px;
			display: flex;

			.sort-item {
				color: #fbfa02;
				font-size: 25px;

				&:nth-child(2) {
					margin-left: 36px;
				}
			}
		}

		.drop-wrap {
			box-sizing: border-box;
			min-height: 500px;

			.drop-list {
				.drop-item {
					width: 750px;
					height: 135px;
					display: flex;
					align-items: center;
					background: url(@/assets/romimg/lucky/tab_his_itembg1.png) no-repeat
						center;
					background-size: 100%;
					box-sizing: border-box;
					position: relative;
					margin: 0px;
					padding: 0px;

					.drop-jj-item-wrap {
						display: flex;
						align-items: center;
						width: 100%;

						.item-head {
							margin-left: 20px;
							position: relative;

							.item-anchor {
								width: 73px;
								height: 28px;
								position: absolute;
								top: -20px;
							}
						}

						.item-goods-info {
							margin-left: 10px;
							color: #bed5ff;

							.item-goods-name {
								font-size: 28px;
							}

							.item-goods-attr {
								display: flex;
								align-items: center;
								margin-top: 7px;

								img {
									width: 60px;
									height: 32px;
								}

								.item-goods-wg {
									font-size: 20px;
									margin-left: 17px;
								}

								.item-goods-price {
									font-size: 20px;
									font-weight: bold;
									margin-left: 24px;
								}
							}
						}

						.item-right {
							display: flex;
							flex: 1;
							justify-content: flex-end;

							.per {
								color: #fff;
								font-size: 30px;
								margin-right: 5px;
								text-align: center;
								line-height: 66px;
								width: 80px;
							}

							.goods-wrap {
								display: flex;
								width: 232px;
								justify-content: flex-end;

								img {
									max-width: 106px;
									max-height: 66px;
									margin-right: 10px;
								}
							}
						}
					}

					&:nth-child(2n) {
						background: url(@/assets/romimg/lucky/tab_his_itembg2.png) no-repeat
							center;
						background-size: 100%;
					}

					&.active {
						background: url(@/assets/romimg/lucky/tab_his_itembg3.png) no-repeat
							center;
						background-size: 100%;

						.item-goods-info {
							color: #ffe686;
						}

						.per {
							color: #ffcb00;
						}

						p {
							color: #ffe686;
						}
					}
				}

				.drop-detail-item {
					width: 750px;
					height: 219px;
					display: flex;
					align-items: center;
					background: url(@/assets/romimg/lucky/tab_his_detailitembg1.png)
						no-repeat center;
					background-size: 100%;
					box-sizing: border-box;
					position: relative;

					.drop-jj-item-wrap {
						width: 100%;
						height: 100%;
						display: flex;
						align-items: center;
						flex-direction: column;

						.his-top-wrap {
							width: 100%;
							display: flex;
							justify-content: space-between;
							position: relative;
							margin-top: 32px;
							align-items: center;

							.item-head-bg {
								background: url(@/assets/romimg/lucky/item_detail_bg1.png)
									no-repeat center;
								background-size: contain;
								width: 394px;
								height: 46px;
								position: relative;
								display: flex;
								align-items: center;
								color: #bed5ff;
								margin-left: 46px;

								.head {
									position: absolute;
									left: -25px;
								}

								p {
									margin-left: 44px;
								}

								.anchor {
									display: flex;
									margin-left: 34px;
									align-items: center;

									img {
										width: 21px;
										height: 20px;
										margin-right: 5px;
									}
								}
							}

							.his-item-time {
								color: #bec4d1;
								font-size: 20px;
								margin-right: 19px;
								display: flex;
								align-items: center;
							}
						}

						.his-bottom-wrap {
							display: flex;
							justify-content: space-between;
							width: 100%;
							margin-top: 25px;
							align-items: center;
							margin-left: 30px;

							.item-goods-info {
								margin-left: 10px;
								color: #bed5ff;

								.item-goods-name {
									font-size: 28px;
									width: 420px;
								}

								.item-goods-attr {
									display: flex;
									align-items: center;
									margin-top: 7px;

									img {
										width: 60px;
										height: 32px;
									}

									.item-goods-wg {
										font-size: 20px;
										margin-left: 17px;
									}

									.item-goods-price {
										font-size: 20px;
										font-weight: bold;
										margin-left: 24px;
									}
								}
							}

							.per {
								color: #fff;
								font-size: 30px;
								margin-right: 301px;
								font-weight: bold;
							}

							.goods-wrap {
								position: absolute;
								right: 16px;

								img {
									max-width: 106px;
									max-height: 66px;
									margin-right: 13px;
								}
							}
						}
					}

					&:nth-child(2n) {
						background: url(@/assets/romimg/lucky/tab_his_detailitembg2.png)
							no-repeat center;
						background-size: 100%;
					}

					&.active {
						background: url(@/assets/romimg/lucky/tab_his_detailitembg3.png)
							no-repeat center;
						background-size: 100%;

						.item-goods-info {
							color: #ffe686;
						}

						.per {
							color: #ffcb00;
						}

						p {
							color: #ffe686;
						}
					}
				}
			}
		}
	}

	.stat-wrap {
		.top-wrap {
			display: flex;
			justify-content: space-between;
			padding-top: 40px;
			padding-bottom: 30px;
			align-items: center;

			.text {
				font-size: 25px;
				color: #fff;
				font-weight: 700;
				margin-left: 13px;
			}

			.refresh-wrap {
				display: flex;
				align-items: center;
				padding-right: 18px;
				font-size: 25px;
				color: #9097ae;

				img {
					margin-left: 8px;
					width: 27px;
					height: 26px;
				}
			}
		}

		.tab-wrap {
			display: flex;
			align-items: center;
			flex-direction: column;

			.tab-title {
				background: url(@/assets/romimg/lucky/stat_item_title_bg.png) no-repeat
					center;
				background-size: 100%;
				color: #bed5ff;
				font-size: 24px;
				width: 750px;
				height: 60px;
				display: flex;
				justify-content: space-between;
				align-items: center;

				p {
					text-align: center;
					flex: 1;
				}

				.title-img {
					display: flex;
					justify-content: center;
					align-items: center;
					box-sizing: border-box;
					flex: 1;

					img {
						width: 17px;
						height: 17px;
						margin-right: 8px;
					}
				}
			}

			.table {
				.table-item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					background: url(@/assets/romimg/lucky/stat_item_bg2.png) no-repeat
						center;
					background-size: contain;
					position: relative;
					width: 750px;
					height: 105px;
					color: #fff;
					font-size: 26px;

					p {
						text-align: center;
						flex: 1;
					}

					:nth-child(3) {
						color: #fbfa02;
					}

					:nth-child(4) {
						color: #8fa9f7;
					}

					&:nth-child(2n) {
						background: url(@/assets/romimg/lucky/stat_item_bg1.png) no-repeat
							center;
					}
				}
			}
		}

		.search-wrap {
			display: flex;
			align-items: center;
			justify-content: space-between;
			position: relative;
			background: url(@/assets/romimg/lucky/stat_search_bg.png) no-repeat center;
			background-size: contain;
			width: 694px;
			height: 56px;
			margin-top: 46px;
			color: #fff;
			font-size: 21px;

			.range {
				margin-left: 19px;
			}

			span {
				color: #171c2c;
				font-size: 24px;
				font-weight: bold;
				margin-right: 16px;
			}
		}

		.all-stat-item {
			background: url(@/assets/romimg/lucky/stat_all_bg.png) no-repeat center;
			background-size: contain;
			width: 750px;
			height: 105px;
			margin-top: 44px;
			position: relative;
			color: #fff;
			font-size: 26px;
			display: flex;
			align-items: center;
			justify-content: space-between;

			p {
				flex: 1;
				text-align: center;
			}

			:nth-child(3) {
				color: #fbfa02;
			}

			:nth-child(4) {
				color: #8fa9f7;
			}
		}
	}

	.van-popup {
		z-index: 202 !important;
		background: #17171e;
		color: #fff;
		width: 580px;

		.stat-pop-wrap {
			margin-top: 56px;
			margin-left: 19px;
			// margin-right: 21px;

			.filter-type-wrap {
				width: 100%;
				display: flex;
				flex-wrap: wrap;
				box-sizing: border-box;
				align-content: flex-start;
				-webkit-align-content: flex-start;
				margin-top: 25px;

				.filter-type-item {
					width: 164px;
					height: 58px;
					background-color: transparent;
					border: 1px solid #eee131;
					text-align: center;
					line-height: 58px;
					color: #fff;
					font-size: 24px;
					margin-right: 10px;
					margin-bottom: 37px;

					&.active {
						background-color: #eee131;
						color: #171c2c;
						font-weight: bold;
					}
				}
			}

			.lucky-pop-title {
				margin-top: 13px;
				display: flex;
				justify-content: space-between;
				margin-right: 21px;

				.pop-r-title {
					font-size: 24px;
					color: #fbfa02;
				}

				.pop-l-title {
					font-size: 30px;
					color: #fff;
				}
			}

			.stat-pop-title {
				font-size: 30px;
				color: #fff;
			}

			.input-wrap {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 25px;
				margin-right: 21px;

				.input-item {
					input {
						width: 233px;
						height: 58px;
						border: none;
						background-color: transparent;
						border: 1px solid #eee131;
						color: #fff;
						font-size: 21px;
						padding-left: 15px;
						padding-right: 15px;
						box-sizing: border-box;
						text-align: center;
					}
				}

				span {
					font-size: 24px;
					color: #fbfa02;
				}
			}

			.btn-wrap {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-top: 55px;
				margin-right: 21px;

				.stat-btn {
					width: 246px;
					height: 62px;
					background-color: #eee131;
					text-align: center;
					line-height: 62px;
					color: #0e0d19;
					font-size: 24px;
					font-weight: bold;
					margin: 0 auto;
				}
			}

			.fliter-btn-height {
				margin-top: 10px;
			}
		}

		&.bottom-filter {
			background: transparent;
			height: 489px;
			width: 100%;

			.bottom-filter-wrap {
				display: flex;
				flex-direction: column;
				padding: 25px;
				width: 700px;
				background: #2d2e31;
				margin: 0px auto;

				.bottom-title {
					display: flex;
					align-items: center;
					color: #fff;
					font-size: 22px;
					margin-top: 10px;

					img {
						width: 24px;
						height: 23px;
						margin-right: 9px;
					}
				}

				.bottom-btn-wrap {
					display: flex;
					align-items: center;
					margin-top: 30px;
					margin-bottom: 50px;

					.bottom-btn1 {
						width: 175px;
						height: 58px;
						background-color: transparent;
						border: 1px solid #fbfa02;
						text-align: center;
						line-height: 58px;
						color: #fff;
						font-size: 24px;
						margin-right: 34px;

						&.active {
							background-color: #fbfa02;
							color: #171c2c;
							background-size: contain;
						}
					}
				}

				.start-btn-wrap {
					position: relative;

					.start-btn {
						width: 686px;
						height: 76px;
						background-color: #fbfa02;
						text-align: center;
						line-height: 76px;
						color: #000;
						font-size: 24px;
						font-weight: bold;
						margin: 0 auto;
					}
				}
			}
		}
	}
}
</style>
