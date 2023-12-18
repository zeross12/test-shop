<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, onUnmounted, nextTick, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import {
	getLuckyDetails,
	pullLuckyGoods,
	getLuckyRecords,
	getLuckyBestRecords,
	getLuckyStats,
	getLuckyCustom,
} from "@/network/api/lucky";
import { getGoodsAttributes } from "@/network/api/index";
import LuckyAni from "./components/LuckyAni.vue";
import ResultLayer from "../openbox/components/BoxResult.vue";
import imgRandIcon from "@/assets/pcimg/lucky/rand.png";
import { tokenName } from "@/config";
import HeadPortrait from "@/components/pc/head/HeadPortrait.vue";
import { getGoodsNamePre, getGoodsNameSec } from "@/util/common";
import { GoodImageBgType } from "@/util/util";

const store = useStore();
const route = useRoute();
const router = useRouter();

let luckyId = Number(route.query.id);
const luckyData = ref({});
const luckyGoodsItems = ref([]);
const curluckyGood = ref({});
const exteriorItems = ref([]);
const curProbability = ref(0);

const selectProbArray = ref([
	{ prob: 5 },
	{ prob: 10 },
	{ prob: 25 },
	{ prob: 50 },
	{ prob: 85 },
]);

const slideProgress = ref(0);
const randIconGoods = ref({
	iconUrl: imgRandIcon,
	goodsLevel: 1,
});
const goodsList = ref([]);

const goodsData = ref([]);

let dropTimer = null; //最近掉落定时器
const dropList = ref([]);
const dropPager = ref({ pageIndex: 1, limit: 20, userType: 1, details: false });

const historyShowDetails = ref(false);

const animationxRef = ref(null);
const resultRef = ref(null);
const aniLayer = ref(false);

// const isAnimation = computed(() => store.state.animationSwitch);
const isAnimation = computed(() => store.state.luckySoundSwitch);

const btnOpenActive = ref(true); //防快速开箱

const animationSound = computed(() => store.state.luckySoundSwitch);
const goodsResult = ref([]);

const showCountSelect = ref(false);
const curCount = ref(1);

onMounted(() => {
	luckyId = Number(route.query.id);
	getAttributes();
	getDetail();
	startDropTime();
	getLuckyDrop();
});

onUnmounted(() => {
	stopDropTime();
});

async function getDetail() {
	const res = await getLuckyDetails({ id: luckyId });
	if (res.code === 0) {
		luckyData.value = res.data;
		luckyGoodsItems.value = res.data.items;

		let findGood = false;
		for (let index = 0; index < luckyGoodsItems.value.length; index++) {
			const luckyGoodsItem = luckyGoodsItems.value[index];
			if (luckyGoodsItem.id == luckyId) {
				curluckyGood.value = luckyGoodsItem;
				findGood = true;
				break;
			}
		}
		if (!findGood) {
			curluckyGood.value = luckyGoodsItems.value[0] || {};
		}

		curProbability.value = Number(curluckyGood.value.minProbability);
		slideProgress.value = curProbability.value;
	}
}

async function getAttributes() {
	let res = await getGoodsAttributes();
	if (res.code == 0) {
		let data = res.data || {};
		exteriorItems.value = data.exteriorItems;
	}
}

function onClickTab(userType) {
	dropPager.value.userType = userType;
	startDropTime();
}

watch(
	() => dropPager.value.userType,
	(val, old) => {
		// window.$dev && console.log( val )
		if (val != old) getLuckyDrop();
	}
);

async function getLuckyDrop() {
	const res = await getLuckyRecords({
		id: luckyId,
		limit: dropPager.value.limit,
		page: dropPager.value.pageIndex,
		queryTime: 7,
		userType: dropPager.value.userType,
	});
	if (res.code === 0) {
		let items = res.data.items || [];
		dropList.value = items;
	}
}

function startDropTime() {
	stopDropTime();
	// getLuckyDrop();
	// dropTimer = setInterval(() => {
	//	 getLuckyDrop();
	// }, 5000);
}

function stopDropTime() {
	if (dropTimer != null) {
		clearInterval(dropTimer);
		dropTimer = null;
	}
}

function onClickProbItem(item) {
	curProbability.value = item;
	slideProgress.value = curProbability.value;
}
function onSliderChange() {
	curProbability.value = slideProgress.value;
}

function onClickSlideBtn(type) {
	if (type == 1) {
		if (curProbability.value > Number(curluckyGood.value.minProbability)) {
			curProbability.value -= 1;
			slideProgress.value = curProbability.value;
		}
	} else if (type == 2) {
		if (curProbability.value < Number(curluckyGood.value.maxProbability)) {
			curProbability.value += 1;
			slideProgress.value = curProbability.value;
		}
	}
}

function onClickLuckyGood(item) {
	curluckyGood.value = item;
	luckyId = item.id;
	startDropTime();
}

async function onClickOpen() {
	if (!localStorage.getItem(tokenName)) {
		store.commit("setSignView", true);
		return;
	}

	if (!btnOpenActive.value) return;
	btnOpenActive.value = false;

	stopDropTime();

	const res = await pullLuckyGoods({
		id: curluckyGood.value.id,
		probs: curProbability.value,
		count: curCount.value,
	});

	btnOpenActive.value = true;

	if (res.code == 0) {
		goodsData.value = res.data;
		// for (let index = 0; index < goodsData.value.items.length; index++) {
		// 	const item = goodsData.value.items[index].items;
		// 	item.goodsLevel = 7;
		// }

		for (let i = 0, j = goodsData.value.items.length; i < j; i++) {
			goodsResult.value = goodsResult.value.concat(
				goodsData.value.items[i].items
			);
		}
		// window.$dev && console.log( goodsResult.value )

		aniLayer.value = true;
		// window.$dev && console.log( curluckyGood.value )
		let allCount = 32;
		let goodCount =
			Math.floor(Number(curProbability.value) * 0.01 * allCount) + 1;
		let randCount = allCount - goodCount;

		///	批量的单个列表
		let goodsItem = [];
		///	全部列表
		goodsList.value = [];
		// window.$dev && console.log( randCount, goodCount, allCount )

		for (let i = 0, j = goodsData.value.items.length; i < j; i++) {
			for (let index = 0; index < randCount; index++) {
				goodsItem.push(randIconGoods.value);
			}

			for (let index = 0; index < goodCount; index++) {
				const item = { ...curluckyGood.value };
				item.goodsLevel = 7;
				goodsItem.push(item);
			}
			goodsList.value.push(goodsItem);
		}
		// window.$dev && console.log( goodsList.value )

		nextTick(() => {
			animationxRef.value.randGoodList();
			if (isAnimation.value) {
				nextTick(() => {
					startAnimationX();
				});
			} else {
				onAnimationEnd();
			}
			store.dispatch("getUserInfo");
		});
	} else {
		startDropTime();
	}
}

async function startAnimationX() {
	await nextTick();
	let award = { ...randIconGoods.value };
	// if (goodsData.value.isWin) {
	// 	award = { ...curluckyGood.value };
	// 	award.goodsLevel = 7;
	// }

	animationxRef.value.showAward(award, goodsData.value);
}

function onAnimationEnd() {
	aniLayer.value = false;
	curCount.value = 1;
	showCountSelect.value = false;
	// goodsResult.value = []

	showResult();
}

function showResult() {
	aniLayer.value = false;
	resultRef.value.showReuslt([...goodsResult.value]);
	store.dispatch("getUserInfo");
}

function closeCountSelect() {
	showCountSelect.value = false;
	curCount.value = 1;
}

function showCount() {
	showCountSelect.value = true;
	curCount.value = 2;
}

function onResultClose() {
	aniLayer.value = false;
	curCount.value = 1;
	showCountSelect.value = false;
	goodsResult.value = [];
	startDropTime();
	getLuckyDrop();
}

function getExteriorName(v) {
	for (let index = 0; index < exteriorItems.value.length; index++) {
		const item = exteriorItems.value[index];
		if (item.id == v.exterior) {
			return item.name;
		}
	}
}

function getGoodsName() {
	let name = curluckyGood.value.goodsName;
	if (name) {
		let index = name.lastIndexOf("(");
		if (index != -1) {
			name = name.substring(0, index);
			return name;
		}
	}
	return luckyData.value.goodsName;
}

function onClickSound() {
	store.commit("setLuckySoundSwitch", !animationSound.value);
}
function onClickBack() {
	router.back();
}

function getImageBg2(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.box, item.goodsLevel);
}

/**
 * 百分比跳转
 * @param val number 跳转值
 */
function jump(val) {
	slideProgress.value = val;
	curProbability.value = val;
}

const showWindow = ref(false);
const windowType = ref("global");
const top10 = ref([]);

const queryType = ref(1);
const queryTime = ref(1);
const limit = ref(10);
const page = ref(1);
const userType = ref(1);

const change = computed(() => {
	return [queryTime.value, queryType.value];
});

watch(change, () => {
	getTop10List();
});

async function getTop10List() {
	let param = {};
	param.limit = 10;
	param.page = 1;
	param.queryTime = queryTime.value;
	param.queryType = queryType.value;
	param.userType = 1;

	let res = await getLuckyBestRecords(param);

	if (res.code == 0) {
		top10.value = res.data.items;
	}
}

const global = ref([]);
async function getGlobalList() {
	let res = await getLuckyStats();

	if (res.code == 0) {
		global.value = res.data.items;
	}
}

const globalFilter = ref(null);
const minPrice = ref("");
const maxPrice = ref("");
async function getGlobalFilter() {
	let param = {
		endProbs: Number(maxPrice.value),
		startProbs: Number(minPrice.value),
	};
	let res = await getLuckyCustom(param);
	if (res.code == 0) {
		globalFilter.value = res.data.item;
		// window.$dev && console.log( globalFilter.value )
	}
}

watch(windowType, (val) => {
	switch (val) {
		case "top10":
			getTop10List();
			break;

		case "global":
			getGlobalList();
			break;
	}
});
async function openWindow(type) {
	switch (type) {
		case "top10":
			getTop10List();
			break;

		case "global":
			getGlobalList();
			break;
	}
	windowType.value = type;
	showWindow.value = true;
}

let judge = ref(true); // 在 <script setup>
const onClickMember = () => {
	judge.value = true; // 使用 ref 来访问和更新响应式数据属性
};
const onClickAnchor = () => {
	judge.value = false; // 使用 ref 来访问和更新响应式数据属性
};
</script>
<template>
	<div id="pc-luckyboxdetails">
		<div class="lucky-detail-header-container">
			<div class="lucky-detail-header">
				<div class="header-title">
					<img src="@/assets/pcimg/lucky/title-icon.png" />{{ t('router.lucky') }}
				</div>
				<div class="header-back" @click="router.go(-1)">
					<img src="@/assets/pcimg/common/back.png" />{{ t('common.back') }}
				</div>
			</div>
		</div>
		<div class="lucky-detail-wrap">
			<div class="sound" @click="onClickSound">
				<img class="icon-sound" src="@/assets/pcimg/openbox/sound_open.png" v-if="!animationSound" />
				<img class="icon-sound" src="@/assets/pcimg/openbox/sound_close.png" v-else />
			</div>
			<div class="lucky-header-container">
				<div class="header-item left" @click="openWindow('global')">
					{{ t('lucky.globalStatistics') }}
				</div>
				<div class="header-item center">
					<div class="text-cut">{{ getGoodsNameSec(curluckyGood.goodsName) }}</div>
					<div>{{ getGoodsNamePre(curluckyGood.goodsName) }}</div>
				</div>
				<div class="header-item right" @click="openWindow('top10')">
					{{ t('lucky.top10Drop') }}
				</div>
			</div>
			<div class="lucky-perc-container">
				<div class="perc-item left">
					<div>{{ curProbability }}%</div>
					<div>{{ t('lucky.successRate') }}</div>
				</div>
				<div class="perc-item right">
					<div>{{ 100 - curProbability }}%</div>
					<div>{{ t('lucky.failureRate') }}</div>
				</div>
			</div>
			<div class="lucky-body-container">
				<div class="body-item left">
					<img :src="curluckyGood.iconUrl" />
				</div>
				<div class="body-item center">
					<el-progress type="circle" :percentage="curProbability" status="warning" :stroke-width="4"
						color="#F9A328" :show-text="false" stroke-linecap="dashboard"></el-progress>
					<div class="progress-circle-container" :style="{
						transform: `rotateZ( ${(360 / 100) * curProbability + 0.5}deg )`,
					}">
						<div class="progress-handler">
							<img src="@/assets/pcimg/lucky/progress-handler.png" />
						</div>
					</div>
					<div class="perc">
						<div>{{ curProbability }}%</div>
						<div>{{ t('lucky.boomRate') }}</div>
					</div>
				</div>
				<div class="body-item right">
					<img src="@/assets/pcimg/lucky/rand.png" />
				</div>
			</div>
			<div class="lucky-btns-container">
				<div :class="{ active: curProbability == 5 }" @click="jump(5)">5%</div>
				<div :class="{ active: curProbability == 25 }" @click="jump(25)">
					25%
				</div>
				<div :class="{ active: curProbability == 50 }" @click="jump(50)">
					50%
				</div>
				<div :class="{ active: curProbability == 75 }" @click="jump(75)">
					75%
				</div>
				<div :class="{ active: curProbability == 85 }" @click="jump(85)">
					85%
				</div>
			</div>
			<div class="lucky-footer-container">
				<div class="slide-title">{{ t('lucky.changeGoodsBoomRate') }}</div>
				<div class="slide-container">
					<el-slider v-model="slideProgress" :min="Number(curluckyGood.minProbability)" :show-tooltip="false"
						:max="Number(curluckyGood.maxProbability)" @change="onSliderChange"
						@input="onSliderChange"></el-slider>
					<div class="tooltip" :style="'left:' +
						(((Number(curProbability) - Number(curluckyGood.minProbability)) /
							(Number(curluckyGood.maxProbability) -
								Number(curluckyGood.minProbability))) *
							(412 - 85 - 96) +
							24) +
						'px;'
						">
						{{ curProbability }}%
					</div>
				</div>
				<div class="slide-result">5% / 85%</div>
			</div>
			<div class="lucky-openbox-container">
				<div class="item" @click="onClickOpen">
					<img src="@/assets/pcimg/common/coin.png" />
					{{
						(
							(Number(curProbability) / 100) *
							Number(curluckyGood.price) *
							(1 + Number(luckyData.ratio))
						).toFixed(2)
					}}<label>{{ t('lucky.start') }}</label>
				</div>
				<div class="item" @click="showCount()">{{ t('lucky.enableInBatches') }}</div>
			</div>

			<LuckyAni v-show="aniLayer" :title="getGoodsNameSec(curluckyGood.goodsName)"
				:sub-title="getGoodsNamePre(curluckyGood.goodsName)" :goodsList="goodsList" @onAnimationEnd="onAnimationEnd"
				ref="animationxRef">
			</LuckyAni>
		</div>

		<div class="lucky-section">
			<div class="lucky-section-container">
				<div class="lucky-section-item">
					<div class="section-header-container">
						<div class="header-title">
							<img src="@/assets/pcimg/lucky/title-icon1.png" />
							{{ t('lucky.changeGoodsQuality') }}
						</div>
					</div>
					<div class="luck-item-container grid">
						<div class="sec-item" :class="{ choice: curluckyGood.id == item.id }"
							@click="onClickLuckyGood(item)" v-for="(item, index) in luckyGoodsItems" :key="index">
							<div class="prize-item-back" :style="'background-image: url(' + getImageBg2(item) + ');'">
								<div class="prize-item-pic">
									<img :src="item.iconUrl" alt="" />
								</div>
							</div>
							<div class="item-info">
								<p class="price">
									<img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt="" />{{ item.price
									}}
								</p>
								<div class="goods-info">
									<p class="text-cut">{{ getGoodsName() }}</p>
									<p class="text-cut">{{ getExteriorName(item) }}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="lucky-section-item">
					<div class="section-header-container">
						<div class="header-title">
							<img src="@/assets/pcimg/lucky/title-icon2.png" />
							{{ t('lucky.dropRecord') }}
						</div>
						<div class="btn-group">
							<div class="btn" @click="dropPager.userType = 1" :class="{ active: dropPager.userType == 1 }">
								{{ t('lucky.memberDrop') }}
							</div>
							<div class="btn" @click="dropPager.userType = 2" :class="{ active: dropPager.userType == 2 }">
								{{ t('lucky.anchorDrop') }}
							</div>
						</div>
					</div>
					<div class="luck-item-container column">
						<div class="table-head">
							<div class="username">{{ t('common.users') }}</div>
							<div class="prec">{{ t('lucky.boomRate') }}</div>
							<div class="items-name">{{ t('battle.goodsName') }}</div>
							<div class="price">{{ t('battle.price') }}</div>
						</div>
						<div class="table-list">
							<div class="table-item" v-for="(item, index) in dropList" :key="index"
								:class="{ win: item.isWin }">
								<div class="username">
									<img :src="item.avater" />
									<div class="text-cut">{{ item.nickName }}</div>
								</div>
								<div class="prec">{{ item.probability }}%</div>
								<!-- feat:修改显示的金额和名称修改 -->
								<div class="items-name">
									<img :src="item.isWin ? item.iconUrl : item.rewardIconUrl" />
									<p class="text-cut">{{ !item.isWin ? item.rewardGoodsName : item.goodsName }}</p>
								</div>
								<div class="price">
									$&nbsp;{{ item.isWin ? item.price : item.rewardPrice }}
								</div>
								<!-- /feat -->
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<van-overlay :show="showCountSelect" style="background: rgba(0, 0, 0, 0.7)" z-index="200">
			<div class="count-select-container">
				<img src="@/assets/pcimg/common/close.png" class="close-count-select" @click="closeCountSelect()" />
				<div class="current-item">
					<div class="current-item-name">
						<div>{{ getGoodsNameSec(curluckyGood.goodsName) }}</div>
						<div>{{ getGoodsNamePre(curluckyGood.goodsName) }}</div>
					</div>
					<img src="@/assets/pcimg/lucky/base-nil-bg.png" class="base-bg" />
					<img src="@/assets/romimg/lucky/pseudo.png" class="base-opacity" :class="`ani-${curCount}`" />
					<div class="current-item-icon">
						<img :src="curluckyGood.iconUrl" />
					</div>
					<div class="current-item-prec">{{ curProbability }}%</div>
				</div>
				<div class="current-item-btns">
					<div class="btn" :class="{ active: curCount >= 1 }">X1</div>
					<div class="btn" :class="{ active: curCount >= 2 }" @click="curCount = 2">
						X2
					</div>
					<div class="btn" :class="{ active: curCount >= 3 }" @click="curCount = 3">
						X3
					</div>
					<div class="btn" :class="{ active: curCount >= 4 }" @click="curCount = 4">
						X4
					</div>
					<div class="btn" :class="{ active: curCount >= 5 }" @click="curCount = 5">
						X5
					</div>
				</div>
				<div class="open-item-btn" @click="onClickOpen">
					{{
						(
							(Number(curProbability) / 100) *
							Number(curluckyGood.price) *
							(1 + Number(luckyData.ratio)) *
							curCount
						).toFixed(2)
					}}<label>{{ t('lucky.enableInBatches ') }}</label>
				</div>
			</div>
		</van-overlay>

		<ResultLayer :goodsList="goodsResult" @onClose="onResultClose" ref="resultRef"></ResultLayer>

		<van-overlay :show="showWindow" style="background: rgba(0, 0, 0, 0.7)" z-index="200">
			<div class="window-container">
				<div class="window-header-container">
					<div class="window-header">
						<div class="window-header-item" :class="{ active: windowType == 'global' }"
							@click="windowType = 'global'">
							{{ t('lucky.globalStatistics') }}
						</div>
						<div class="window-header-item" :class="{ active: windowType == 'top10' }"
							@click="windowType = 'top10'">
							{{ t('lucky.top10Drop') }}
						</div>
					</div>
					<img src="@/assets/pcimg/common/close.png" class="close-window" @click="showWindow = false" />
				</div>
				<div class="window-body global" :class="{ active: windowType == 'global' }">
					<div>
						<div class="window-table-head">
							<div class="table-title">{{ t('openbox.fairPresentation') }}</div>
							<div class="refer">{{ t('openbox.statisticsLast3Day') }}</div>
						</div>

						<div class="window-table-th">
							<div class="col-1">{{ t('openbox.probabilityOfSuccess') }}</div>
							<div class="col-2">{{ t('openbox.timesStatistics') }}</div>
							<div class="col-3">{{ t('lucky.successTimesProportion') }}</div>
							<div class="col-4">{{ t('lucky.failTimesProportion') }}</div>
						</div>
						<div class="window-table-body">
							<div class="window-table-tr" :class="{ nil: index % 2 != 0 }" v-for="(item, index) in global"
								:key="index">
								<div class="col-1">
									{{ item.startProbs + "-" + item.endProbs + "%" }}
								</div>
								<div class="col-2">{{ item.winCount + item.failCount }}</div>
								<div class="col-3">
									{{ item.winCount }} |
									{{ (Number(item.winRatio) * 100).toFixed(2) }}%
								</div>
								<div class="col-4">
									{{ item.failCount }} |
									{{ (Number(item.failRatio) * 100).toFixed(2) }}%
								</div>
							</div>
						</div>
					</div>

					<div>
						<div class="window-table-head bottom">
							<div class="table-title">{{ t('lucky.customProbability') }}</div>
							<div class="table-filter">
								<input v-model="minPrice" :placeholder="t('mall.minPrice')" />
								<input v-model="maxPrice" :placeholder="t('mall.maxPrice')" />
								<button @click="getGlobalFilter">{{ t('common.filter') }}</button>
							</div>
						</div>
						<div class="window-table-tr" v-if="globalFilter">
							<div class="col-1">
								{{
									globalFilter.startProbs + "-" + globalFilter.endProbs + "%"
								}}
							</div>
							<div class="col-2">
								{{ globalFilter.winCount + globalFilter.failCount }}
							</div>
							<div class="col-3">
								{{ globalFilter.winCount }} |
								{{ (Number(globalFilter.winRatio) * 100).toFixed(2) }}%
							</div>
							<div class="col-4">
								{{ globalFilter.failCount }} |
								{{ (Number(globalFilter.failRatio) * 100).toFixed(2) }}%
							</div>
						</div>
					</div>
				</div>

				<div class="window-body top10" :class="{ active: windowType == 'top10' }">
					<div class="window-table-head">
						<div class="head-item left">
							<div @click="queryType = 1" :class="{ active: queryType == 1 }">
								{{ t('lucky.maxPrice') }}
							</div>
							<div @click="queryType = 2" :class="{ active: queryType == 2 }">
								{{ t('lucky.maxincrease') }}
							</div>
							<div @click="queryType = 3" :class="{ active: queryType == 3 }">
								{{ t('lucky.godBy5') }}
							</div>
						</div>
						<div class="head-item right">
							<div @click="queryTime = 0" :class="{ active: queryTime == 0 }">
								{{ t('lucky.today') }}
							</div>
							<div @click="queryTime = 1" :class="{ active: queryTime == 1 }">
								{{ t('lucky.yesterday') }}
							</div>
							<div @click="queryTime = 7" :class="{ active: queryTime == 7 }">
								{{ t('lucky.latest7') }}
							</div>
						</div>
					</div>
					<div class="window-table-th">
						<div class="id">#</div>
						<div class="user">{{ t('common.users') }}</div>
						<div class="prec">{{ t('common.probability') }}</div>
						<div class="itemname">{{ t('battle.goodsName') }}</div>
						<div class="price">{{ t('battle.price') }}</div>
						<div class="datetime">{{ t('common.time') }}</div>
					</div>
					<div class="window-table-tr" v-for="(item, index) in top10" :key="index">
						<div class="id">{{ index + 1 }}</div>
						<div class="user text-cut">
							<img :src="item.avater" />
							{{ item.nickName }}
						</div>
						<div class="prec">{{ item.probability }}%</div>
						<div class="itemname text-cut">
							<img :src="item.iconUrl" />
							{{ item.goodsName }}
						</div>
						<div class="price">{{ item.price }}</div>
						<div class="datetime">{{ item.createTime }}</div>
					</div>
				</div>

				<div class="window-footer" v-show="windowType == 'global'">
					{{ t('lucky.successTip') }}
				</div>
			</div>
		</van-overlay>
	</div>
</template>

<style lang="scss">
#pc-luckyboxdetails {
	width: 100%;
	background: #0d0e1d;
	font-size: 14px;
	color: #fff;

	.lucky-detail-header-container {
		height: 120px;
		background: #15172c;
		display: flex;
		justify-content: center;

		.lucky-detail-header {
			width: 1440px;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.header-title {
				display: flex;
				color: #fff;
				font-size: 27px;
				gap: 16px;
				min-width: 200px;
				align-items: center;

				img {
					height: 28px;
				}
			}

			.header-back {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 16px;
				height: 60px;
				width: 140px;
				border-radius: 4px;
				border: 1px solid #313350;
				user-select: none;
				cursor: default;
			}
		}
	}

	.count-select-container {
		width: 532px;
		height: 622px;
		display: flex;
		flex-direction: column;
		position: fixed;
		top: calc(50% - 622px / 2);
		left: calc(50% - 532px / 2);
		align-items: center;
		justify-content: center;
		position: relative;
		background: #0e0f1e;
		gap: 12px;
		box-sizing: border-box;

		.close-count-select {
			position: absolute;
			top: 8px;
			right: 13px;
			padding: 8px;

			&:hover {
				transform: scale(1.2);
			}
		}

		.current-item {
			width: 386px;
			height: 346px;
			// border: 1px solid red;
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: center;
			// background: url( @/assets/pcimg/lucky/base-bg.png ) no-repeat;
			// background-position: center bottom;
			// background-size: 95%;
			gap: 2px;
			position: relative;

			.base-opacity {
				position: absolute;
				width: calc(386px * 0.95);
				// opacity: .4;
				bottom: 0px;

				&.ani-1 {
					animation: breathe1 2.5s ease-in-out infinite;
				}

				&.ani-2 {
					animation: breathe2 2.5s ease-in-out infinite;
				}

				&.ani-3 {
					animation: breathe3 2.5s ease-in-out infinite;
				}

				&.ani-4 {
					animation: breathe4 2.5s ease-in-out infinite;
				}

				&.ani-5 {
					animation: breathe5 2.5s ease-in-out infinite;
				}
			}

			.base-bg {
				position: absolute;
				width: calc(386px * 0.95);
				bottom: 0;
			}

			.current-item-name {
				div {
					display: flex;
					justify-content: center;

					&:first-child {
						color: #fff;
						font-size: 21px;
						font-weight: 700;
						line-height: 1.5em;
					}

					&:last-child {
						color: #8b8c97;
						font-size: 18px;
						font-weight: 300;
						line-height: 1.2em;
					}
				}
			}

			.current-item-icon {
				img {
					height: 228px;
					// width: 384px;
					display: flex;
					align-items: center;
					justify-content: center;
					animation: float 2.5s ease-in-out infinite;
				}
			}

			.current-item-prec {
				color: #f9a328;

				font-size: 32px;
				font-weight: 700;
				z-index: 1;
			}
		}

		.current-item-btns {
			display: flex;
			gap: 12px;

			.btn {
				width: 76px;
				height: 46px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
				border-radius: 6px;
				background: #1e1e29;
				user-select: none;
				cursor: default;

				&.active {
					background: linear-gradient(90deg, #736cef 0%, #3a33ad 100%);
				}
			}
		}

		.open-item-btn {
			width: 249px;
			height: 63px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 6px;
			background: #4a55bc;
			color: #fff;
			margin-top: 34px;
			font-size: 20px;

			font-weight: 700;

			label {
				margin-left: 16px;
			}
		}
	}

	.window-container {
		width: 1200px;
		// height: 912px;
		position: fixed;
		top: calc(50% - 912px / 2);
		left: calc(50% - 1200px / 2);
		border-radius: 10px;
		overflow: hidden;

		.window-header-container {
			background: #1b1c24;
			position: relative;
			padding: 58px 40px 0 40px;
			width: 100%;
			box-sizing: border-box;

			.close-window {
				position: absolute;
				top: 24px;
				right: 20px;
			}

			.window-header {
				height: 112px;
				display: flex;
				background: #21212a;
				height: 56px;
				position: relative;
				border-top-left-radius: 10px;
				border-top-right-radius: 10px;
				overflow: hidden;

				.window-header-item {
					background: #21212a;
					width: 178px;
					height: 56px;
					display: flex;
					align-items: center;
					justify-content: center;

					&.active {
						background: linear-gradient(292deg, #313340 0.4%, #3c4846 100%);
						color: #64ce82;
					}
				}
			}
		}

		.window-body {
			background: #17171f;
			padding: 20px 40px;
			display: flex;
			flex-direction: column;
			// flex: 1;
			height: 727px;
			box-sizing: border-box;
			display: none;

			&.active {
				display: flex;
			}

			&.top10 {
				.window-table-head {
					width: 100%;
					// height: 16px;
					padding: 0;
					display: flex;
					justify-content: space-between;

					.head-item {
						display: flex;
						gap: 10px;

						&.left {
							div {
								height: 40px;
								width: 138px;
								display: flex;
								justify-content: center;
								align-items: center;
								border-radius: 4px;
								background: #191920;

								&.active {
									background: #2d2d3a;
									color: #fff;
								}
							}
						}

						&.right {
							div {
								height: 40px;
								min-width: 72px;
								padding: 0 12px;
								display: flex;
								// border: 1px solid red;
								border-radius: 4px;
								background: #191920;
								justify-content: center;
								align-items: center;
								color: #6e6e75;

								&.active {
									background: #2d2d3a;
									color: #fff;
								}
							}
						}
					}
				}

				.window-table-th {
					width: 100%;
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 20px 0;
					box-sizing: border-box;

					div {
						display: flex;
						height: 100%;
						align-items: center;
						font-size: 12px;
						color: #535155;
						justify-content: center;
						// border: 1px solid red;
					}

					.id {
						width: 100px;
						justify-content: center;
					}

					.user {
						width: 200px;
						justify-content: flex-start;
					}

					.prec {
						width: 100px;
					}

					.itemname {
						flex: 1;

						img {
							height: 32px;
						}
					}

					.price {
						width: 120px;
					}

					.datetime {
						width: 190px;
					}
				}

				.window-table-tr {
					width: 100%;
					display: flex;
					align-items: center;
					justify-content: space-between;
					height: 64px;

					div {
						display: flex;
						height: 100%;
						align-items: center;
						font-size: 18px;
						// border: 1px solid red;
					}

					.id {
						width: 100px;
						justify-content: center;
					}

					.user {
						width: 200px;
						gap: 14px;

						img {
							height: 30px;
							border-radius: 4px;
						}
					}

					.prec {
						width: 100px;
						color: #ffcd6c;
						justify-content: center;
					}

					.itemname {
						flex: 1;
						align-items: center;
						height: 100%;
						gap: 15px;

						img {
							height: 32px;
						}
					}

					.price {
						width: 120px;
						justify-content: center;
						color: #70c593;
						font-weight: bold;
					}

					.datetime {
						width: 190px;
					}
				}
			}

			&.global {
				// justify-content: space-between;
				gap: 28px;

				.window-table-head {
					width: 100%;
					// height: 16px;
					padding: 0;
					display: flex;
					justify-content: space-between;

					&.bottom {
						padding: 26px 0;

						.table-filter {
							display: flex;
							align-items: center;
							height: 40px;

							input {
								border: none;
								outline: none;
								width: 100px;
								height: 40px;
								background: transparent;
								border-bottom: 2px solid #22222c;
								margin-right: 8px;

								&::placeholder {
									color: #878b91;
									font-size: 12px;
								}
							}

							button {
								border: none;
								height: 40px;
								background: #22222c;
								width: 80px;
								border-radius: 4px;
								margin-left: 6px;
							}
						}
					}

					.table-title {
						font-size: 16px;
					}

					.refer {
						color: #b4b6c8;
						font-size: 13px;
					}
				}

				.window-table-th {
					display: flex;
					width: 100%;
					justify-content: space-between;
					padding: 20px 64px;
					box-sizing: border-box;
					color: #535155;
					font-size: 12px;

					div {
						width: 25%;
						justify-content: center;
						display: flex;

						&.col-1 {
							width: 15%;
						}
					}
				}

				.window-table-tr {
					width: 100%;
					height: 64px;
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 0 64px;
					box-sizing: border-box;
					background: #22222c;
					border-radius: 8px;

					div {
						font-size: 16px;
						width: 25%;
						display: flex;
						justify-content: center;
					}

					.col-1 {
						color: #ffcd6c;
						width: 15%;
					}

					.col-3 {
						color: #70c593;
					}

					&.nil {
						background: transparent !important;
					}
				}
			}
		}

		.window-footer {
			background: #17171f;
			width: 100%;
			height: 80px;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.lucky-detail-wrap {
		max-width: 1440px;
		width: 100%;
		height: 778px;
		margin: 0 auto;
		position: relative;
		box-sizing: border-box;
		background: url(@/assets/pcimg/lucky/center-bg.png) no-repeat;
		background-position: calc(1440px / 2 - 1024px / 2 + 3px) 36px;
		padding-top: 60px;
		display: flex;
		// justify-content: center;
		flex-direction: column;
		align-items: center;

		.sound {
			position: absolute;
			right: 0;
			top: 60px;
		}

		.lucky-openbox-container {
			width: 592px;
			height: 66px;
			display: flex;
			justify-content: space-between;
			padding: 32px;

			.item {
				background: #3a33ad;
				height: 100%;
				width: 275px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
				font-size: 20px;
				font-weight: 700;
				border-radius: 4px;

				user-select: none;
				cursor: default;

				label {
					margin-left: 16px;
				}

				img {
					margin-right: 6px;
					width: 24px;
				}
			}
		}

		.lucky-footer-container {
			width: 650px;
			height: 36px;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.slide-container {
				width: 412px;
				box-sizing: border-box;
				padding-left: calc(412px / 100 * 5 + 96px / 2);
				padding-right: calc(412px / 100 * 15 + 96px / 2);
				position: relative;

				.tooltip {
					position: absolute;
					width: 96px;
					height: 28px;
					display: flex;
					justify-content: center;
					align-items: center;
					top: 0px;
					z-index: 1;
					user-select: none;
					pointer-events: none;
				}

				&::before {
					content: "";
					height: 4px;
					border-top-left-radius: 4px;
					border-bottom-left-radius: 4px;
					position: absolute;
					left: 0;
					background: #3a33ad;
					width: calc(450px / 100 * 6 + 96px / 2);
					top: calc(50% - 2px);
				}

				&::after {
					content: "";
					height: 4px;
					border-top-right-radius: 4px;
					border-bottom-right-radius: 4px;
					position: absolute;
					background: #373845;
					right: 0;
					top: calc(50% - 2px);
					width: calc(450px / 100 * 16 + 96px / 2);
				}

				.el-slider__button {
					display: none;
				}

				.el-slider__bar {
					background: #3a33ad;
					height: 4px;
				}

				.el-slider__runway {
					background: #373845;
					height: 4px;
				}

				.el-slider__button-wrapper {
					width: 96px;
					height: 28px;
					background: #3a33ad;
					color: #fff;
					border-radius: 28px;
				}
			}
		}

		.lucky-btns-container {
			padding: 32px 0;
			height: 30px;
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 12px;
			width: 374px;

			div {
				height: 100%;
				width: 65px;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 6px;
				font-size: 12px;
				background: #1e1e29;
				user-select: none;
				cursor: default;
				border: 1px solid #1e1e29;

				&.active {
					border: 1px solid #3a33ad;
					background: linear-gradient(90deg, #736cef 0%, #3a33ad 100%);
				}
			}
		}

		.lucky-body-container {
			width: 894px;
			height: 326px;
			display: flex;
			box-sizing: border-box;
			justify-content: space-between;

			.body-item {
				display: flex;
				width: 240px;
				height: 100%;
				box-sizing: border-box;

				&.left,
				&.right {
					background: url(@/assets/pcimg/lucky/base-bg.png) no-repeat;
					background-position: center 75px;
					background-size: contain;
					justify-content: center;
					align-items: center;
					padding-bottom: 60px;

					img {
						height: 120px;
					}
				}

				&.left {
					img {
						height: 187px;
					}
				}

				&.center {
					width: 220px;
					height: 220px;
					margin-top: -6px;
					border: none;
					position: relative;

					.progress-circle-container {
						width: 100%;
						height: 100%;
						position: absolute;
						left: 0;
						top: 0;
						// border: 1px solid red;
						box-sizing: border-box;
						padding: 6px;
						// transition-timing-function: ease;
						// transition-delay: 500ms;
						transition: ease 600ms;

						.progress-handler {
							width: 50%;
							height: 50%;
							// border: 1px solid red;
							box-sizing: border-box;
							display: flex;
							justify-content: flex-end;
							align-items: flex-start;

							img {
								height: 100%;
							}
						}
					}

					.perc {
						width: 100%;
						height: 100%;
						display: flex;
						position: absolute;
						top: 0;
						left: 0;
						justify-content: center;
						align-items: center;
						flex-direction: column;
						font-size: 29px;
						color: #c1a322;
						line-height: 29px;

						font-weight: 700;

						div {
							&:last-child {
								font-size: 12px;
								font-weight: 300;
								line-height: 18px;
							}
						}
					}

					.el-progress--circle {
						width: 220px !important;
						height: 220ppx !important;

						.el-progress-circle {
							width: 220px !important;
							height: 220px !important;
						}

						.el-progress-circle__track {
							display: none;
						}
					}
				}
			}
		}

		.lucky-perc-container {
			width: 410px;
			height: 60px;
			display: flex;
			justify-content: space-between;
			align-items: flex-end;

			.perc-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				color: #505054;
				font-size: 14px;
				font-weight: 700;


				div {
					&:last-child {
						font-weight: 400;
					}
				}
			}
		}

		.lucky-header-container {
			width: 894px;
			display: flex;
			justify-content: space-between;
			padding: 0 68px;

			.header-item {
				width: 191px;
				height: 60px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 15px;
				user-select: none;
				cursor: default;

				&.left {
					background: url(@/assets/pcimg/lucky/global-bg.png) no-repeat;
					background-position: top center;
					background-size: cover;
				}

				&.right {
					background: url(@/assets/pcimg/lucky/top10-bg.png) no-repeat;
					background-position: top center;
					background-size: cover;
				}

				&.center {
					flex-direction: column;
					width: 300px;

					div {
						color: #8b8c97;
						font-size: 18px;
						font-weight: 300;
						max-width: 360px;

						&:first-child {
							font-size: 22px;
							color: #fff;
							font-weight: 700;
						}
					}
				}
			}
		}
	}

	.ani_layer {
		width: 100%;
		height: 100%;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 10;
	}

	.page-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30px;
		position: relative;
		z-index: 1;

		.page-title {
			display: flex;
			align-items: center;
			color: #fff;
			font-size: 27px;

			img {
				width: 28px;
				height: 28px;
				margin-right: 15px;
			}
		}

		.head-right {
			display: flex;
			align-items: center;

			.sound {
				width: 22px;
				margin-left: 22px;
				cursor: pointer;
				position: relative;

				.icon-sound {
					display: inline-block;
					vertical-align: middle;
					fill: currentColor;
					width: 28px;
					height: 28px;
					color: #666a99;
					position: relative;
				}

				.icon-sound-mute {
					display: inline-block;
					vertical-align: middle;
					fill: currentColor;
					width: 15px;
					height: 18px;
					color: #323558;
					position: relative;
					// left: -5px;
				}
			}

			.back {
				display: flex;
				align-items: center;
				height: 48px;
				padding-left: 25px;
				padding-right: 25px;
				font-size: 16px;
				color: #acaec5;
				border: 1px solid #2e304e;
				border-radius: 2px;
				margin-left: 22px;
				cursor: pointer;
				position: relative;
			}
		}
	}

	.rule-wrap {
		display: block;
		box-sizing: border-box;
		text-align: center;
		margin-bottom: 30px;
		position: relative;
		z-index: 1;

		.rule-title {
			position: relative;
			display: inline-flex;
			align-items: center;
			font-size: 12px;
			padding-top: 3px;
			text-transform: uppercase;
			letter-spacing: 1px;
			height: 42px;
			padding-left: 22px;
			padding-right: 22px;
			box-shadow: 0 14px 22px rgba(5, 5, 11, 0.3);
			color: #6b6e90;
			border-radius: 5px;
			background-color: #090a14;
			font-weight: 500;

			.icon-question {
				display: inline-block;
				vertical-align: middle;
				fill: currentColor;
				position: relative;
				margin-left: 9px;
				color: #27283c;
				width: 14px;
				height: 14px;
			}

			.tooltip {
				position: absolute;
				z-index: 1;
				bottom: calc(100% + 10px);
				left: 50%;
				right: 0;
				width: 100%;
				min-width: 250px;
				text-transform: none;
				text-align: left;
				padding: 12px 15px 10px;
				transform: translate(-50%, 10px);
				opacity: 0;
				visibility: hidden;
				transition: transform 0.3s, opacity 0.3s, visibility 0.3s;
				color: #6b6e90;
				border-radius: 5px;
				background-color: #090a14;
				font-weight: 500;

				&::after {
					content: "";
					position: absolute;
					top: 100%;
					left: 50%;
					transform: translate(-50%);
					border-top: 6px solid #090a14;
					border-left: 6px solid transparent;
					border-right: 6px solid transparent;
				}
			}

			&:hover {
				.tooltip {
					transform: translate(-50%, 0);
					visibility: visible;
					opacity: 1;
				}
			}
		}
	}

	.lucky-content-wrap {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20px;
		z-index: 1;

		.bar-wrap {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin: 20px 35px 0;
			width: 300px;

			.slide {
				height: 32px;
				padding: 0px 45px 0 15px;
				margin-bottom: 5px;
				cursor: pointer;
				position: relative;
				box-sizing: border-box;
				position: relative;
				// text-align: center;
				display: flex;
				justify-content: center;
				align-items: center;
				z-index: 2;

				.el-slider {
					width: 80%;
				}

				&::before {
					content: "";
					position: absolute;
					height: 5px;
					width: calc(5% - 1px);
					background: #44e098;
					left: 30px;
					box-sizing: border-box;
					// border-left-top-radius: 5px;
					border-top-left-radius: 5px;
					border-bottom-left-radius: 5px;
					z-index: 1;
					// top: calc( 50% - 5px / 2 );
				}

				&::after {
					content: "";
					position: absolute;
					height: 5px;
					width: 30%;
					background: #ec593e;
					right: 30px;
					z-index: 1;
					border-radius: 5px;
				}

				.el-slider__runway {
					width: 300px;
					background-color: #ec593e;
					height: 5px;
					margin: 0;
				}

				.el-slider__bar {
					height: 5px;
					background-color: #44e098;
					z-index: 2;
				}

				.el-slider__button-wrapper {
					top: -7px;
					transform: translateX(-50%);
					background-color: transparent;
					text-align: center;
					-webkit-user-select: none;
					-moz-user-select: none;
					user-select: none;
					line-height: normal;
					border: none;
					z-index: 3;
					width: 5px;
					// height: 17px;
					height: 50px;

					// border-radius: 2px;
					// background: #C5BFDE;
					&::after {
						content: "";
						height: 18px;
						width: 100%;
						top: 0;
						left: 0;
						position: absolute;
						border-radius: 2px;
						background: #c5bfde;
					}
				}

				.el-slider__button {
					display: none;
				}

				.tooltip {
					position: absolute;
					bottom: 38px;
					justify-content: center;
					width: 26px;
					height: 30px;
					padding-top: 2px;
					border-radius: 5px;
					border: 1px solid #282936;
					font-size: 13px;
					color: #fefffe;
					font-weight: 500;
					display: flex;
					box-sizing: border-box;
					align-items: center;

					&::after {
						content: "";
						position: absolute;
						top: calc(100% + 1px);
						left: 50%;
						width: 7px;
						height: 7px;
						border: 1px solid #282936;
						border-right: 0;
						border-top: 0;
						background-color: #0d0e1d;
						transform: translate(-50%, -50%) rotate(-45deg);
					}
				}
			}

			.bar-bottom {
				width: 300px;
				height: 4px;
				background: url(@/assets/pcimg/lucky/bar_point.svg) left center/auto 58% no-repeat #0d0e1d;
				background-size: 100% 100%;
				top: 20px;
				left: 30px;
				height: 22px;
				content: "";
				position: absolute;
				box-sizing: border-box;
			}
		}
	}

	.lucky-btn-wrap {
		text-align: center;
		margin-bottom: 55px;
		font-size: 14px;
		color: #fff;
		position: relative;
		z-index: 1;

		.lucky-btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			max-width: 290px;
			width: 100%;
			height: 66px;
			padding-top: 3px;
			padding-left: 38px;
			padding-right: 38px;
			background-color: #3a33ad;
			border-radius: 4px;
			font-size: 15px;
			font-weight: 700;
			color: #fff;
			white-space: nowrap;
			transition: background-color 0.15s;
			box-sizing: border-box;
			cursor: pointer;

			img {
				margin-left: 3px;
				margin-bottom: 0px;
			}
		}
	}

	.lucky-bottom-wrap {
		.lucky-bottom {
			display: flex;
			justify-content: center;
			padding-bottom: 60px;
			position: relative;
			box-sizing: border-box;

			&::before {
				content: "";
				position: absolute;
				z-index: 0;
				bottom: 0;
				left: 50%;
				width: 768px;
				height: 578px;
				transform: translateX(-50%);
				background: url(@/assets/pcimg/lucky/bottom_bg.png) center bottom no-repeat;
			}

			.bottom-item {
				width: 100%;
				width: 320px;
				display: flex;
				align-items: center;
				margin-top: -111px;

				img {
					width: 230px;
					max-width: 230px;
					height: auto;
					filter: contrast(1);
				}

				&:first-child {
					justify-content: flex-end;
				}
			}

			.bottom-vs {
				position: relative;
				text-align: center;
				margin-left: 55px;
				margin-right: 55px;
				line-height: 1;
				font-size: 79px;
				font-weight: 100;
				margin-bottom: 12px;
				max-width: 300px;
				width: 100%;
			}
		}
	}

	.lucky-section {
		width: 100%;
		display: flex;
		justify-content: center;
		background: #15172c;

		.lucky-section-container {
			max-width: 1440px;
			width: 100%;
			display: flex;
			justify-content: space-between;
			gap: 27px;
			box-sizing: border-box;
			padding: 32px 0;

			.lucky-section-item {
				width: 697px;
				height: 465px;
				background: #0e0f1e;
				display: flex;
				flex-direction: column;
				border-radius: 4px;
				overflow: hidden;

				.section-header-container {
					display: flex;
					border-bottom: 1px solid #1e1e24;
					height: 80px;
					width: 100%;
					align-items: center;
					justify-content: space-between;
					padding: 18px 27px;
					box-sizing: border-box;

					.header-title {
						font-size: 14px;
						width: 50%;
						display: flex;
						gap: 14px;
						align-items: center;
					}

					.btn-group {
						display: flex;
						height: 40px;
						justify-content: space-between;
						gap: 14px;

						.btn {
							width: 138px;
							height: 100%;
							user-select: none;
							cursor: default;
							display: flex;
							justify-content: center;
							align-items: center;
							color: #6e6e75;
							background: #191920;
							border-radius: 4px;

							&.active {
								background: #2d2d3a;
								color: #fff;
							}
						}
					}
				}

				.luck-item-container {
					height: calc(100% - 80px);
					padding: 18px 20px;

					&.column {
						display: flex;
						flex-direction: column;
						width: 100%;
						box-sizing: border-box;

						.table-head {
							display: flex;
							width: 100%;
							// justify-content: center;
							height: 54px;
							align-items: center;
							padding: 0 20px;
							box-sizing: border-box;

							div {
								display: flex;
								justify-content: center;
								box-sizing: border-box;
							}

							.username {
								width: 100px;
								justify-content: flex-start;
								// padding: 0 0 0 calc( 26px + 18px );.
								margin-left: 35px;
							}

							.prec {
								width: 16%;
								padding: 0 0 0 calc(26px + 8px);
							}

							.items-name {
								// flex: 1;
								width: 250px;
								// justify-content: flex-start;
								text-align: center;
								/* 控制文本居中对齐 */
								margin-left: 15px;

								img {
									width: 42px;
									height: 32px;
								}
							}

							.price {
								width: 10%;
								margin-left: 62px;
							}
						}

						.table-list {
							display: flex;
							flex-direction: column;
							width: 100%;
							justify-content: flex-start;
							gap: 4px;
							height: 290px;
							overflow-y: scroll;

							.table-item {
								display: flex;
								justify-content: space-between;
								height: 64px;
								width: 100%;
								background: #171720;
								border-radius: 8px;
								align-items: center;
								padding: 18px 20px;
								box-sizing: border-box;

								/// feat:添加胜利的背景色
								&.win {
									background: #22222c;
								}

								/// @feat

								div {
									display: flex;
									justify-content: center;
								}

								.username {
									width: 152px;
									display: flex;
									align-items: center;
									gap: 8px;
									justify-content: flex-start;
									box-sizing: border-box;

									img {
										width: 26px;
										border-radius: 4px;
									}

									div {
										width: 118px;
										text-align: left;
										justify-content: flex-start;
										display: inline-block !important;
									}
								}

								.prec {
									width: 16%;
									justify-content: center;
									color: #ffcd6c;
								}

								.items-name {
									flex: 1;
									justify-content: flex-start;
									align-items: center;

									p {
										width: 240px;
									}

									img {
										width: 42px;
										height: 32px;
									}
								}

								.price {
									width: 10%;
									justify-content: center;
									color: #70c593;
								}

								&.active {
									background: #22222c;
								}
							}
						}
					}

					&.grid {
						display: flex;
						flex-wrap: wrap;
						gap: 10px;

						.sec-item {
							width: 156px;
							height: 156px;
							cursor: pointer;
							position: relative;
							background: #15172c;

							&.choice {
								background: url(@/assets/pcimg/openbox/choose.png) no-repeat center #15172c;
								background-size: 100% 100%;
								// border: 1px solid #1E2138;
								border: 1px solid #29228b;
							}

							.prize-item-back {
								width: 100%;
								height: 100%;
								background-repeat: no-repeat;
								background-position: center -30px;
								background-size: 100%;

								.prize-item-pic {
									width: 100%;
									height: 100%;
									display: flex;
									justify-content: center;
									align-items: center;

									img {
										max-width: 80%;
										max-height: 80%;
									}
								}
							}

							.item-info {
								display: flex;
								flex-direction: column;
								position: absolute;
								left: 0;
								top: 0;
								padding: 20px;
								box-sizing: border-box;
								justify-content: space-between;
								height: 100%;
								width: 100%;

								.price {
									color: #7bdca2;

									font-size: 13px;
									font-weight: 700;
									line-height: 16.9px;
									display: flex;
									align-items: center;
									justify-content: flex-end;
								}

								.goods-info {
									display: flex;
									flex-direction: column;

									p {
										&:first-child {
											color: #cbccd6;
											font-size: 12px;
											font-style: normal;
											font-weight: 200;
											line-height: 15.6px;
										}

										&:last-child {
											color: #fff;
											font-size: 11px;
											font-style: normal;
											font-weight: 700;
											line-height: 15.6px;
										}
									}
								}
							}
						}
					}
				}
			}
		}

		.lucky-sec-wrap {
			width: 1440px;
			margin: 0 auto;

			.sec-title {
				position: relative;
				z-index: 0;
				color: #fff;
				font-size: 24px;
				font-weight: 500;
				text-align: center;
				width: 200px;
				height: 107px;
				background: url(@/assets/pcimg/lucky/sec_bg.png) center bottom no-repeat;
				background-size: 200px 107px;
				display: flex;
				justify-content: center;
				align-items: center;
				margin: 0 auto 55px;
			}

			.sec-items {
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				border-left: 0;
				border-top: 0;
			}
		}
	}
}

@keyframes breathe1 {
	0% {
		opacity: 0.2;
	}

	50% {
		opacity: 0;
	}

	100% {
		opacity: 0.2;
	}
}

@keyframes breathe2 {
	0% {
		opacity: 0.4;
	}

	50% {
		opacity: 0.2;
	}

	100% {
		opacity: 0.4;
	}
}

@keyframes breathe3 {
	0% {
		opacity: 0.6;
	}

	50% {
		opacity: 0.2;
	}

	100% {
		opacity: 0.6;
	}
}

@keyframes breathe4 {
	0% {
		opacity: 0.8;
	}

	50% {
		opacity: 0.2;
	}

	100% {
		opacity: 0.8;
	}
}

@keyframes breathe5 {
	0% {
		opacity: 1;
	}

	50% {
		opacity: 0.2;
	}

	100% {
		opacity: 1;
	}
}

@keyframes float {

	0%,
	100% {
		transform: translateY(0);
		/* 初始位置和结束位置 */
	}

	50% {
		transform: translateY(-10px);
		/* 上浮位置，可以根据需要调整浮动高度 */
	}
}
</style>
