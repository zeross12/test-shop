<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, onUnmounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

import { getGoodsAttributes } from "@/network/api/index";
import { getGoodsNamePre, getGoodsNameSec } from "@/util/common";
import imgShotgun from "@/assets/pcimg/lucky/shotgun.png";
import imgMachinegun from "@/assets/pcimg/lucky/machinegun.png";
import imgSmg from "@/assets/pcimg/lucky/smg.png";
import imgSniperrifle from "@/assets/pcimg/lucky/sniperrifle.png";
import imgKnife from "@/assets/pcimg/lucky/knife.png";
import imgHands from "@/assets/pcimg/lucky/hands.png";
import imgPistol from "@/assets/pcimg/lucky/pistol.png";
import imgRifle from "@/assets/pcimg/lucky/rifle.png";
import imgQuan from "@/assets/pcimg/lucky/quan.png";
import imgRecom from "@/assets/pcimg/lucky/recom.png";
import { GoodImageBgType } from "@/util/util";
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
const typeItemsArray = ref([{ name: t('openbox.recommend'), id: 1 }]);
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
const goodsLoading = ref(false);
const finished = ref(false);
const pager = ref({ pageIndex: 1, limit: 20 });
const goodsList = ref([]);

const dropList = ref([]);
const dropLoading = ref(false);
const dropFinished = ref(false);
const dropPager = ref({ pageIndex: 1, limit: 20, userType: 1, details: false });
let dropTimer = null;
const exteriorItems = ref([]);

const statList = ref([]);
const allStat = ref({});
const statInputMin = ref("");
const statInputMax = ref("");

const typeFilterShow = ref(false);
const typeShowLeft = ref(0);
const mainFilterRef = ref(null);

// const typeImgArr = [imgShotgun, imgMachinegun, imgSmg, imgSniperrifle, imgKnife, imgHands, imgPistol, imgRifle];
const typeImgArr = [
	imgRecom,
	imgHands,
	imgKnife,
	imgPistol,
	imgSmg,
	imgRifle,
	imgSniperrifle,
	imgQuan,
];

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
	// if (filterSelect.value.type == 0) {
	//	 params.hotStatus = 1;
	// } else if (filterSelect.value.type == -1) {
	//	 params.hotStatus = 2;
	// } else {
	params.type = filterSelect.value.type;
	// }
	if (filterSelect.value.subType) {
		params.subType = filterSelect.value.subType;
	}
	if (fliterInputMin.value != "" && fliterInputMax.value != "") {
		params.minPrice = fliterInputMin.value;
		params.maxPrice = fliterInputMax.value;
	}
	goodsLoading.value = true;
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
	goodsLoading.value = false;
}

async function getGoodsTypes() {
	let res = await getLuckyTypes();
	if (res.code == 0) {
		typeItemsArray.value = res.data.typeItems || [];
		// typeItemsArray.value.unshift({ id: 0, name: t( 'openbox.recommend' ), subTypes: [] });
		// typeItemsArray.value.push({ id: -1, name: "终极武器", subTypes: [] });

		for (let index = 0; index < typeImgArr.length; index++) {
			if (typeItemsArray.value[index]) {
				typeItemsArray.value[index].icon = typeImgArr[index + 1];
			}
		}

		let subTypeItems = res.data.subTypeItems || [];

		for (let index = 0; index < typeItemsArray.value.length; index++) {
			const typeItem = typeItemsArray.value[index];
			let subTypes = [];
			if (typeItem.id != -1 && typeItem.id != 0) {
				subTypes.push({ id: 0, name: t('openbox.all') });
			}
			for (let j = 0; j < subTypeItems.length; j++) {
				const subTypeItem = subTypeItems[j];
				if (subTypeItem.type == typeItem.id) {
					subTypes.push(subTypeItem);
				}
			}
			// if (typeItem.id == -1) {
			//	 subTypes.push({ id: 0, name: t( 'openbox.all' ) });
			// }
			typeItem.subTypes = subTypes;
			if (typeItemsArray.value.length > 0)
				onClickFliterType(typeItemsArray.value[0]);
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
			name = t('openbox.all');
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
		dropPager.value.pageIndex = 1;
		dropFinished.value = false;
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

function onClickHistoryType(type) {
	dropPager.value.userType = type;
	dropPager.value.pageIndex = 1;
	dropFinished.value = false;
	getLuckyDrop();
}

function onClickTab(type) {
	tabType.value = type;
	if (type == 2) {
		dropPager.value.pageIndex = 1;
		dropFinished.value = false;
		startDropTime();
	} else {
		stopDropTime();
	}

	if (type == 3) {
		getStats();
		getCustomStats(0, 0);
	}
}

function onSearchPriceData() {
	curFliterPriceItem.value = {};
	pager.value.pageIndex = 1;
	finished.value = false;
	getGoodsList();
}

function onSearchData() {
	pager.value.pageIndex = 1;
	finished.value = false;
	getGoodsList();
}

function onClickSort(sortType) {
	roomSort.value = sortType;
	filterSelect.value.roomSort = sortType;
	pager.value.pageIndex = 1;
	finished.value = false;
	getGoodsList();
}

function onLoad() {
	if (goodsLoading.value) return;
	pager.value.pageIndex += 1;
	getGoodsList();
}

function onClickGoodsItem(item) {
	store.commit("setFliterParams", filterSelect.value);
	router.push({ path: "/p/luckyDetails", query: { id: item.id } });
}

function onClickDropItem(item) {
	store.commit("setFliterParams", filterSelect.value);
	router.push({ path: "/p/luckyDetails", query: { id: item.luckyGoodsId } });
}

function onClickStatSure() {
	let min = Number(statInputMin.value);
	let max = Number(statInputMax.value);
	if (min > max) {
		Warn({
			offset: 100,
			message: "输入错误，最小概率大于最大概率",
			customClass: "error",
		});
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
	filterSelect.value.subType = item.subTypes[0].id;
	onClickFliterSure();
}

function onClickFliterSubType(item) {
	filterSelect.value.type = curFliterTypeItem.value.id;
	filterSelect.value.subType = item.id;
	onClickFliterSure();
}

function onClickFliterPrice(item) {
	curFliterPriceItem.value = item;
	fliterInputMin.value = item.min + "";
	fliterInputMax.value = item.max + "";
	onClickFliterSure();
}

function onClickFliterSure() {
	if (fliterInputMin.value != "" && fliterInputMax.value != "") {
		if (Number(fliterInputMin.value) > Number(fliterInputMax.value)) {
			Warn({
				offset: 100,
				message: t('openbox.inputFailForMoney'),
				customClass: "error",
			});
			return;
		}
	}
	typeFilterShow.value = false;
	pager.value.pageIndex = 1;
	finished.value = false;
	getGoodsList();
}

function onMouseEnterType(item, index) {
	curFliterTypeItem.value = item;
	let node = mainFilterRef.value.children[index];
	if (node) {
		typeShowLeft.value = node.offsetLeft + node.clientWidth / 2;
		typeFilterShow.value = true;
	}
}

function onMouseEnterSubType() {
	typeFilterShow.value = true;
}

function onMouseLeaveSubType() {
	typeFilterShow.value = false;
}

function onMouseLeaveType(item) {
	typeFilterShow.value = false;
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.box, item.goodsLevel);
}

watch(route, (newRoute, oldRoute) => {
	if (newRoute.path != "/p/luckyDetails") {
		store.commit("setFliterParams", { type: 1, subType: 0, roomSort: 0 });
	}
});
</script>
<template>
	<div id="pc-luckybox">
		<div class="page-head">
			<div class="page-title">
				{{ t('router.lucky') }}
			</div>
		</div>
		<div class="lucky-top">
			<div class="type-items">
				<div class="type-item" :class="{ active: filterSelect.type == item.id }"
					v-for="(item, index) in typeItemsArray" :key="index" @click="onClickFliterType(item)">
					<div class="icon-container">
						<img :src="item.icon" alt="" />
					</div>
					<p>{{ item.name }}</p>
				</div>
			</div>
			<div class="sub-type-items" v-if="curFliterTypeItem &&
				curFliterTypeItem.subTypes &&
				curFliterTypeItem.subTypes.length > 0
				">
				<!-- <div class="sub-title">{{ t('mall.goodsType') }}</div> -->
				<div v-for="item in curFliterTypeItem.subTypes" class="sub-type-item" :key="item.id"
					:class="{ active: filterSelect.subType == item.id }" @click="onClickFliterSubType(item)">
					{{ item.name }}
				</div>
			</div>
		</div>
		<div class="separate" />
		<div class="goods-wrap">
			<div class="goods-header">
				<div class="header-left">
					<!-- <svg class="icon-cubes">
						<use xlink:href="@/assets/icon.svg#cubes" ng-href="@/assets/icon.svg#cubes"></use>
					</svg> -->
					<span>{{ t('lucky.changeGoods') }}</span>
				</div>
				<div class="header-right">
					<div class="search-btn" @click="onSearchData()">
						<svg class="icon-search">
							<use xlink:href="@/assets/icon.svg#search" ng-href="@/assets/icon.svg#search"></use>
						</svg>
					</div>
					<input type="text" v-model="searchKey" :placeholder="t('battle.searchByName')" />

				</div>
			</div>
			<div class="fliter-wrap">
				<div class="fliter-left">
					<div class="top-sort-item">
						<div class="top-sort-up" :class="{ active: roomSort != 2 }" @click="onClickSort(1)">
							<svg class="icon-arrow">
								<use xlink:href="@/assets/icon2.svg#arrow-up" ng-href="@/assets/icon2.svg#arrow-up"></use>
							</svg>
						</div>
						<div class="top-sort-up" :class="{ active: roomSort == 2 }" @click="onClickSort(2)">
							<svg class="icon-arrow">
								<use xlink:href="@/assets/icon2.svg#arrow-down" ng-href="@/assets/icon2.svg#arrow-down">
								</use>
							</svg>
						</div>
					</div>
					<div class="filter-type-wrap">
						<div v-for="item in filterPriceArray" class="filter-type-item" :key="item.id"
							:class="{ active: curFliterPriceItem.id == item.id }" @click="onClickFliterPrice(item)">
							{{ item.min }}- {{ item.max }}
							<img src="@/assets/pcimg/common/coin.svg" width="20px" height="20px" alt="" />
						</div>
					</div>
				</div>
				<div class="fliter-right">
					<div class="input-item">
						<input type="text" v-model="fliterInputMin" :placeholder="t('lucky.minPrice')" />

						<img src="@/assets/pcimg/common/coin.svg" width="20px" height="20px" alt="" />
					</div>
					<div class="input-item">
						<input type="text" v-model="fliterInputMax" :placeholder="t('lucky.maxPrice')" />

						<img src="@/assets/pcimg/common/coin.svg" width="20px" height="20px" alt="" />
					</div>
					<div class="opt-btn-item" @click="onClickFliterSure()">{{ t('notify.confirm') }}</div>
				</div>
			</div>

			<div class="separate" style="height: 1px; margin-top: 24px;"></div>
			<div class="goods_list_main">
				<van-list v-if="goodsList.length > 0" v-model="loading" :finished="finished"
					:finished-text="t('common.noMore')" @load="onLoad" :key="pager.pageIndex" :immediate-check="false">
					<div class="pc-weapon-list">
						<div class="weapon-item" v-for="(item, index) in goodsList" :key="index"
							@click="onClickGoodsItem(item)" :style="'background-image: url(' + getImageBg(item) + ');'">
							<div class="weapon-item-pic">
								<img :src="item.iconUrl" :alt="item.goodsName" />
							</div>
							<div class="item-info">
								<p class="item-info1">{{ getGoodsNamePre(item.goodsName) }}</p>
								<p class="item-info2">{{ getGoodsNameSec(item.goodsName) }}</p>
							</div>
							<div class="price">
								<img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />{{ item.price }}
							</div>
						</div>
					</div>
				</van-list>
				<div class="not_yet" v-else>{{ t('common.noMore') }}</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
#pc-luckybox {
	padding-bottom: 60px;
	padding-top: 40px;
	max-width: 1120px;
	width: 100%;
	margin: 0 auto;
	position: relative;
	box-sizing: border-box;

	.page-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #15172c;
		margin-bottom: 30px;

		.page-title {
			display: flex;
			align-items: center;
			color: #fff;
			font-weight: 700;
			font-size: 40px;
			text-transform: uppercase;
		}
	}

	.lucky-top {
		display: block;
		// background-color: #0e0f1e;
		// box-shadow: 0 24px 31px rgba(15, 16, 31, 0.71);
		overflow: hidden;
		// margin-bottom: 36px;

		.type-items {
			// margin-left: -4px;
			// overflow: hidden;
			display: flex;
			// background-color: #0d0e1d;
			width: 100%;
			// justify-items: center;
			align-items: center;
			gap: 32px;
			// justify-content: space-evenly;
			// height: 100%;

			.type-item {
				position: relative;
				z-index: 0;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: space-evenly;

				height: 160px;
				width: 160px;
				// height: 100px;
				// padding-left: 10px;
				// padding-right: 10px;
				border-bottom: 1px solid #15172c;
				cursor: pointer;
				outline: 0;
				// flex: 1;
				box-sizing: border-box;
				position: relative;

				::before {
					content: "";
					background-image: url("@/assets/pcimg/common/bg_lucky.png");
					background-repeat: no-repeat;
					background-size: contain;
					background-position: center;
					position: absolute;
					inset: 0;
					opacity: 0;
					transition: .3s all;

				}

				p {
					font-size: 14px;
					color: #62626c;
				}

				.icon-container {
					height: 78px;
					max-width: 144px;
					display: flex;
					justify-content: center;
					align-items: center;

					img {
						position: relative;
						z-index: 1;
						// opacity: 0.3;
						filter: grayscale(100%);
						max-width: 100%;
						height: auto;
						max-height: 100%;
						opacity: 1;
						transition: .3s all;
						// filter: none;
					}
				}

				img {
					position: relative;
					z-index: 1;
					opacity: 0.3;
					filter: grayscale(100%);
					max-width: 80%;
					height: auto;
					max-height: 78px;
				}

				&.active {



					::before {
						opacity: .7;
					}

					img {
						opacity: 1;
						filter: none;

					}

					p {
						color: #fff;
					}

					&::before {
						content: "";
						position: absolute;
						top: 44%;
						left: 50%;
						width: 2px;
						height: 2px;
						border-radius: 50%;
						transform: translate(-50%, -50%);
						background: rgba(67, 42, 192, 0.3);
						box-shadow: 0 0 55px 30px #432ac0;
					}

					// &::after {
					// 	content: "";
					// 	position: absolute;
					// 	z-index: -1;
					// 	top: 0;
					// 	bottom: 0;
					// 	left: 0;
					// 	right: 0;
					// 	background: linear-gradient(to top,
					// 			#0d0e1d 30px,
					// 			rgba(13, 14, 29, 0) 90%);
					// }
				}
			}
		}

		.sub-type-items {
			display: flex;
			justify-content: center;
			flex-wrap: wrap;
			align-items: baseline;
			padding: 24px 0px;
			// height: 140px;
			box-sizing: border-box;
			gap: 8px;

			.sub-title {
				font-size: 19px;
				color: #b8b9cc;
				font-weight: 500;
				margin-top: 3px;
				margin-right: 28px;
				box-sizing: border-box;
			}

			.sub-type-item {
				color: #727391;
				box-sizing: border-box;
				font-weight: 500;
				font-size: 16px;
				border-radius: 8px;
				padding: 8px 12px;
				transition: .3s all;
				cursor: pointer;

				&.active {
					background-color: #FFE063;
					color: #151515;

					border: 0;
				}
			}
		}
	}

	.goods-wrap {
		.goods-header {
			display: flex;
			align-items: center;
			position: relative;
			z-index: 0;
			margin-top: 24px;
			// height: 88px;
			// padding-left: 30px;
			// background: url(@/assets/pcimg/lucky/sec_title.svg) left center/contain no-repeat #1b1d35;
			box-sizing: border-box;

			.header-left {
				display: flex;
				align-items: center;
				color: #fff;
				font-size: 18px;
				font-weight: 500;
				box-sizing: border-box;

				.icon-cubes {
					position: relative;
					top: -3px;
					flex-shrink: 0;
					color: #7349ca;
					margin-right: 18px;
					width: 24px;
					height: 24px;
					display: inline-block;
					vertical-align: middle;
					fill: currentColor;
				}

				span {
					color: #fff;
					font-size: 21px;
					font-weight: 500;
				}
			}

			.header-right {
				display: flex;
				position: relative;
				margin-left: auto;
				width: 100%;
				max-width: 404px;
				box-sizing: border-box;

				input {
					width: 100%;
					height: 100%;
					padding: 12px 16px 12px 56px;
					font-size: 18px;
					background-color: transparent;
					font-weight: 500;
					color: white;
					outline: 0;
					border: 1px solid #4B4F71;
					border-radius: 12px;

					&::placeholder {
						color: #676c90;
					}
				}

				.search-btn {
					display: flex;
					align-items: center;
					position: absolute;
					// r: 50%;
					left: 16px;
					top: 50%;
					color: #dbdded;
					transition: none;
					transform: translateY(-50%);
					cursor: pointer;
					box-sizing: border-box;

					.icon-search {
						width: 20px;
						height: 20px;
						display: inline-block;
						vertical-align: middle;
						fill: currentColor;
						color: #dbdded;
						cursor: pointer;
						box-sizing: border-box;
					}
				}
			}
		}

		.fliter-wrap {
			display: flex;
			width: 100%;
			margin-top: 16px;
			align-items: center;
			justify-content: space-between;

			.fliter-left {
				display: flex;
				gap: 40px;

				.top-sort-item {
					display: flex;

					.top-sort-up {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 48px;
						height: 40px;
						border-radius: 4px;
						// background: ;
						border-radius: 8px;
						border: 1px solid #4B4F71;
						transition: .3s all;
						color: #151515;

						svg {
							fill: #151515;
						}

						&:last-child {
							margin-left: 10px;
						}

						.icon-arrow {
							width: 16px;
							height: 16px;
							display: inline-block;
							vertical-align: middle;
							fill: currentColor;
							color: white;
							cursor: pointer;
							box-sizing: border-box;
						}

						&.active {
							background: #FFE063;

							.icon-arrow {
								color: #151515;
							}
						}
					}
				}

				.filter-type-wrap {
					display: flex;
					gap: 8px;

					.filter-type-item {
						display: flex;
						justify-content: center;
						align-items: center;
						border-radius: 4px;
						color: #fff;
						border-radius: 8px;
						border: 1px solid #4B4F71;
						padding: 8px;
						gap: 8px;
						font-size: 16px;
						font-weight: 500;
						cursor: pointer;
						transition: .3s all;

						&.active {
							background: #FFE063;
							color: #151515;
						}


					}
				}
			}

			.fliter-right {
				display: flex;
				gap: 8px;

				.input-item {
					display: flex;
					align-items: center;
					border: 1px solid #4B4F71;
					padding: 8px;
					border-radius: 8px;
					color: #727391;
					max-width: 128px;

					input {
						width: 100%;
						border: none;
						background: none;
						color: #fff;
						font-size: 16px;
						font-weight: 500;
						padding-right: 8px;

						&::placeholder {
							color: #878b91;
						}
					}
				}

				.opt-btn-item {
					display: flex;
					justify-content: center;
					align-items: center;
					color: #fff;
					font-size: 16px;
					border-radius: 8px;
					background: #555BC7;
					cursor: pointer;
					font-weight: 500;
					padding: 8px 12px;
					transition: .3s all;

					&:hover {
						background: #555bc7c7;
					}
				}
			}
		}

		.goods_list_main {
			.not_yet {
				text-align: center;
				font-size: 20px;
				color: #878b91;
			}

			.pc-weapon-list {
				margin-top: 24px;
				display: grid;
				grid-template-columns: repeat(auto-fill, 205px);
				grid-template-rows: repeat(auto-fill, 205px);
				gap: 16px;
				box-sizing: border-box;
				width: 100%;
				margin-bottom: 20px;
				// justify-content: space-between;

				.weapon-item {
					position: relative;
					width: 205px;
					height: 205px;
					background-size: cover;
					background-position: center;
					background-repeat: no-repeat;
					border: 1px solid #1e2138;
					box-sizing: border-box;

					.weapon-item-pic {
						width: 120px;
						height: 120px;
						display: flex;
						justify-content: center;
						align-items: center;
						margin: 20px auto 0;

						img {
							max-width: 100%;
							max-height: 100%;
						}
					}

					.item-info {
						display: flex;
						flex-direction: column;
						position: absolute;
						bottom: 22px;
						left: 20px;

						.item-info1 {
							font-size: 12px;
							color: #cbccd6;
						}

						.item-info2 {
							font-size: 12px;
							color: #fff;
							font-weight: bold;
							margin-top: 3px;
						}
					}

					.price {
						display: flex;
						align-items: center;
						color: #7bdca2;

						font-size: 13px;
						font-weight: 700;
						position: absolute;
						right: 20px;
						top: 25px;
					}
				}
			}
		}
	}
}
</style>
