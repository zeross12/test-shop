<script setup>
import { onMounted, ref, onUnmounted, nextTick, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { FormatNickname } from "@/util/common";
import { GoodImageBgType } from "@/util/util";

import Currency from "@/components/h5/common/Currency.vue";
import {
	getLuckyDetails,
	pullLuckyGoods,
	getLuckyRecords,
	getLuckyStats,
	getLuckyCustom,
	getLuckyBestRecords,
} from "@/network/api/lucky";
import { getGoodsAttributes } from "@/network/api/index";
import ResultLayer from "../openbox/components/Result.vue";
// import ResultLayer from "../openbox/components/BoxResult.vue";
import imgRandIcon from "@/assets/romimg/lucky/rand.png";
import { tokenName } from "@/config";
// import LuckyAni from "./components/LuckyAni.vue";
import OpenBoxMultAni from "./components/OpenBoxMultAni.vue";

import Tabs from "@/components/h5/home/Tabs.vue";
import TabsFlex from "@/components/h5/home/TabsFlex.vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const store = useStore();
const route = useRoute();
const router = useRouter();

let luckyId = Number(route.query.id);
const luckyData = ref({});
const luckyGoodsItems = ref([]);
const curluckyGood = ref({});
const exteriorItems = ref([]);
const curProbability = ref(0);
const curBatchNumber = ref(5);
const statList = ref([]);
const bastStatList = ref([]);

const qualityItems = ref([
	{ name: t('timebox.today'), id: 0 },
	{ name: t('timebox.yesterday'), id: 1 },
	{ name: t('timebox.lastSevenDays'), id: 7 },
]); //类别筛选
const qualityActive = ref(false); //下拉状态
const qualityTextShow = ref(true); //'类别'显示
const qualityOptItem = ref({ name: "", id: 0 });

const selectProbArray = ref([
	{ prob: 5 },
	{ prob: 25 },
	{ prob: 50 },
	{ prob: 75 },
	{ prob: 85 },
]);
const selectBatchArray = ref([
	{ number: 1 },
	{ number: 2 },
	{ number: 3 },
	{ number: 4 },
	{ number: 5 },
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
const animationyRef = ref(null);
const resultRef = ref(null);
const aniLayer = ref(false);
const batchLayer = ref(false);
const bottomFilterShow = ref(false);
const bottomFilterData = ref({ userType: 1, details: false });

const isAnimation = computed(() => store.state.animationSwitch);
const soundChecked = ref(store.state.soundSwitch);

const btnOpenActive = ref(true); //防快速开箱
const isOpening = ref(false); //正在开箱
onMounted(() => {
	luckyId = Number(route.query.id);
	getDetail();
	getAttributes();
	startDropTime();
	getLuckyDrop();
	getStats();
	getLuckyBestRecord();
});

onUnmounted(() => {
	stopDropTime();
});

function onSelectOther(item) {
	qualityOptItem.value = item;
	qualityTextShow.value = false;
	qualityActive.value = false;
	getLuckyBestRecord();
}
function onOtherDown() {
	qualityActive.value = !qualityActive.value;
}

async function getStats() {
	let res = await getLuckyStats();
	if (res.code == 0) {
		let data = res.data || {};
		statList.value = data.items || [];
	}
}
async function getLuckyBestRecord() {
	let res = await getLuckyBestRecords({
		limit: 10,
		page: 1,
		queryTime: qualityOptItem.value.id,
		queryType: filter_type.value,
		userType: 1,
	});
	if (res.code == 0) {
		let data = res.data || {};
		bastStatList.value = data.items || [];
	}
}

async function getLuckyCustoms() {
	if (searchFilter.value.from > searchFilter.value.to) {
		NotifyF(t('openbox.inputFailForProb'));
		return;
	}

	searchShow.value = false;
	let res = await getLuckyCustom({
		startProbs: searchFilter.value.from,
		endProbs: searchFilter.value.to,
	});
	if (res.code == 0) {
		let data = res.data || {};
		statList.value = [data.item] || [];
	}
}

function refreshStat() {
	getStats();
	// // onClickStatSure();
}

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

		curProbability.value = 5; // Number(curluckyGood.value.maxProbability);
		slideProgress.value = 5;
	}
}

async function getAttributes() {
	let res = await getGoodsAttributes();
	if (res.code == 0) {
		let data = res.data || {};
		exteriorItems.value = data.exteriorItems;
	}
}

async function getLuckyDrop() {
	const res = await getLuckyRecords({
		id: luckyId,
		queryTime: 7,
		limit: dropPager.value.limit,
		page: dropPager.value.pageIndex,
		userType: dropPager.value.userType,
	});
	if (res.code === 0) {
		window.$dev && console.log("res.data.items", res.data.items);
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

function onClickProbItem(item) {
	curProbability.value = item;
	slideProgress.value = curProbability.value;
}

function onClickBatchItem(item) {
	curBatchNumber.value = item;
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
async function onClickOpen(num) {
	if (!localStorage.getItem(tokenName)) {
		router.push("/m/sign");
		return;
	}

	if (!btnOpenActive.value) return;
	btnOpenActive.value = false;

	setTimeout(() => {
		batchShow.value = false;
		batchLayer.value = false;
	}, 200);

	isOpening.value = true;
	stopDropTime();

	const res = await pullLuckyGoods({
		count: num,
		id: curluckyGood.value.id,
		probs: curProbability.value,
	});
	btnOpenActive.value = true;

	if (res.code == 0) {
		goodsData.value = res.data;
		for (let index = 0; index < goodsData.value.items.length; index++) {
			for (
				let subIndex = 0;
				subIndex < goodsData.value.items[index].items.length;
				subIndex++
			) {
				const item = goodsData.value.items[index].items[subIndex];
				item.goodsLevel = 7;
			}
		}

		aniLayer.value = true;

		let allCount = 32;
		let goodCount =
			Math.floor(Number(curProbability.value) * 0.01 * allCount) + 1;
		let randCount = allCount - goodCount;
		goodsList.value = [];
		for (let index = 0; index < randCount; index++) {
			goodsList.value.push(randIconGoods.value);
		}
		for (let index = 0; index < goodCount; index++) {
			const item = { ...curluckyGood.value };
			item.goodsLevel = 7;
			goodsList.value.push(item);
		}

		nextTick(() => {
			if (isAnimation.value) {
				animationyRef.value.randGoodList(num);
			} else {
				aniLayer.value = false;
				isOpening.value = false;
				showResult();
			}

			// setTimeout(() => {
			//	 startAnimationX();
			//	 // isOpening.value = false;
			// }, 550);
			// setTimeout(() => {
			//	 isOpening.value = false;
			// }, 10000);

			// if (isAnimation.value) {
			//	 setTimeout(() => {
			//		 startAnimationX();
			//	 }, 550);
			// } else {
			//	 onAnimationEnd();
			// }

			store.dispatch("getUserInfo");
		});
	} else {
		startDropTime();
	}
}

async function startAnimationX() {
	await nextTick();
	let award = { ...randIconGoods.value };
	if (goodsData.value.isWin) {
		award = { ...curluckyGood.value };
		award.goodsLevel = 7;
	}

	animationxRef.value.showAward(award);
	// isOpening.value = false;
}

function onAnimationEnd() {
	aniLayer.value = false;
	isOpening.value = false;
	showResult();
}

function onRandEnd() {
	setTimeout(() => {
		startAnimationY();
	}, 100);
}
async function startAnimationY() {
	await nextTick();
	// let award = { ...randIconGoods.value };
	// if (goodsData.value.isWin) {
	//	 award = { ...curluckyGood.value };
	//	 award.goodsLevel = 7;
	// }
	let awardArr = [];
	for (let i = 0; i < goodsData.value.items.length; i++) {
		let award = { ...randIconGoods.value };
		if (goodsData.value.items[i].isWin) {
			award = { ...curluckyGood.value };
			award.goodsLevel = 7;
		}
		awardArr.push(award);
	}

	animationyRef.value.showAward(awardArr);
}
function showResult() {
	aniLayer.value = true;
	let result = [];
	for (let index = 0; index < goodsData.value.items.length; index++) {
		result = [...result, ...goodsData.value.items[index].items];
	}

	resultRef.value.showReuslt(result);
	store.dispatch("getUserInfo");
}

function onResultClose() {
	aniLayer.value = false;
	startDropTime();
}

function getExteriorName(v) {
	for (let index = 0; index < exteriorItems.value.length; index++) {
		const item = exteriorItems.value[index];
		if (item.id == v.exterior) {
			return item.name;
		}
	}
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

	getLuckyDrop();
}

function getGoodsName() {
	window.$dev && console.log("curluckyGood.value", curluckyGood.value);
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

function getGoodsNameWear() {
	window.$dev && console.log("curluckyGood.value", curluckyGood.value);
	let name = curluckyGood.value.goodsName;
	if (name) {
		let index = name.lastIndexOf("(");
		if (index != -1) {
			name = name.substring(index + 1, name.length - 1);
			return name;
		}
	}
	return "";
}

let goodsName1 = computed(() => {
	let name = curluckyGood.value.goodsName;
	if (name) {
		let index = name.lastIndexOf("(");
		if (index != -1) {
			name = name.substring(0, index);
			window.$dev && console.log("name", name);
			return name.split("|")[0];
		}
	}

	if (luckyData.value.goodsName == undefined) {
		return "";
	}
	return luckyData.value.goodsName.split("|")[0];
});

let goodsName2 = computed(() => {
	let name = curluckyGood.value.goodsName;
	if (name) {
		let index = name.lastIndexOf("(");
		if (index != -1) {
			name = name.substring(0, index);
			return name.split("|")[1];
		}
	}
	if (luckyData.value.goodsName == undefined) {
		return "";
	}
	return luckyData.value.goodsName.split("|")[1];
});

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.box, item.goodsLevel);
}
function back() {
	router.go(-1);
}
// function onSoundSwitchChange(flag) {
//	 soundChecked.value = flag;
//	 localStorage.setItem("soundSwitch", soundChecked.value);
//	 store.commit("setSoundSwitch", soundChecked.value);
// }

function onAnimSwitchChange(flag) {
	localStorage.setItem("animationSwitch", flag);
	store.commit("setAnimationSwitch", flag);
}
const tabs = ref({
	items: [t('battle.historyDrop'), t('lucky.globalDrop'), t('lucky.top10Drop')],
	index: 0,
});

function tabChangedEvent(event) {
	tabs.value.index = event;
	if (event == 0) {
		getLuckyDrop();
	} else if (event == 1) {
		refreshStat();
	} else if (event == 2) {
		getLuckyBestRecord();
	}
}

function tabFlexChangedEvent_history(event) {
	dropPager.value.userType = event + 1;
	dropPager.value.pageIndex = 1;

	getLuckyDrop();
}

function onDropLoading() {
	dropPager.value.pageIndex += 1;
	getLuckyDrop();
}
const dropLoading = ref(false);
const dropFinished = ref(false);
const batchShow = ref(false);
const searchShow = ref(false);
const searchFilter = ref({ from: 0, to: 100 });
const filter_type = ref(1);
function onClickChangeFilterType(type) {
	filter_type.value = type;
	getLuckyBestRecord();
}

const batchImageClass = () => {
	if (curBatchNumber.value === 1) {
		return "img-1";
	} else if (curBatchNumber.value === 2) {
		return "img-2";
	} else if (curBatchNumber.value === 3) {
		return "img-3";
	} else if (curBatchNumber.value === 4) {
		return "img-4";
	} else if (curBatchNumber.value === 5) {
		return "img-5";
	}
};
</script>
<template>
	<div id="luckyboxdetails">
		<div class="ani_layer" v-show="aniLayer"></div>
		<div class="batch_layer" v-show="batchLayer"></div>
		<div class="big_bg">
			<div class="lucky_header">
				<div class="left">
					<span class="icon iconfont" @click="back()">&#xe61e;</span>
				</div>
				<div class="center">
					<p>{{ getGoodsName() }}</p>
					<p>
						{{ getGoodsNameWear() }}
					</p>
				</div>
				<div class="right">
					<img
						v-if="isAnimation"
						@click="onAnimSwitchChange(false)"
						src="@/assets/romimg/lucky/donghua.png"
						alt=""
					/>
					<img
						v-else
						@click="onAnimSwitchChange(true)"
						src="@/assets/romimg/lucky/donghua1.png"
						alt=""
					/>
				</div>
			</div>
			<div class="top-wrap" v-if="false">
				<div class="left">
					<div class="text">{{ slideProgress }}%</div>
					<div class="desc">
						{{ t('lucky.boomRate') }}
					</div>
				</div>
				<div class="center">
					<!-- <img src="@/assets/romimg/lucky/help.png" alt="" /> -->
				</div>
				<div class="right">
					<div class="text">{{ 100 - slideProgress }}%</div>
					<div class="desc">{{ t('lucky.failureRate') }}</div>
				</div>
			</div>
			<div class="circle-gropress-wrap">
				<img class="good_img" alt="" v-lazy="curluckyGood.iconUrl" />
				<el-progress
					:stroke-width="3"
					:width="160"
					type="circle"
					:percentage="slideProgress"
					:color="['#F9A328']"
					class="yw_left"
				/>
				<div
					class="progress-circle-container"
					:style="{
						transform: `rotateZ( ${(360 / 100) * curProbability + 1}deg )`,
					}"
				>
					<div class="progress-handler">
						<img src="@/assets/romimg/lucky/progress.png" alt="" />
					</div>
				</div>
			</div>
			<div class="rate-wrap">
				<div class="rate-btn-wrap">
					<div
						class="rate-btn-item"
						v-for="(item, index) in selectProbArray"
						:key="index"
						:class="{ active: curProbability == item.prob }"
						@click="onClickProbItem(item.prob)"
					>
						{{ item.prob }}%
					</div>
				</div>

				<div class="rate-progress-wrap">
					<!-- <div class="btn-progress" @click="onClickSlideBtn(1)">
						<img src="@/assets/romimg/lucky/btn_sub.png" alt="" />
					</div> -->
					<div class="left-wrap">{{ t('openbox.ratio') }}</div>
					<div class="slide">
						<div class="slide-pre-wrap"></div>
						<el-slider
							v-model="slideProgress"
							:min="Number(curluckyGood.minProbability)"
							:max="Number(curluckyGood.maxProbability)"
							@change="onSliderChange"
							@input="onSliderChange"
						/>
						<div class="slide-next-wrap"></div>
					</div>
					<div class="right-wrap">5% / 85%</div>
					<!-- <img src="@/assets/romimg/lucky/btn_sub.png" alt="" /> -->
					<!-- <img src="@/assets/romimg/lucky/progress_bottom_bg.png" alt="" /> -->
					<!-- <div class="btn-progress2" @click="onClickSlideBtn(2)">
						<img src="@/assets/romimg/lucky/btn_add.png" alt="" />
					</div> -->
				</div>
			</div>
			<div class="start-btn-wrap" v-if="!isOpening">
				<div class="start-btn" @click="onClickOpen(1)">
					<Currency
						:fontsize="13"
						:hide="true"
						:currency="
							(
								(Number(curProbability) / 100) *
								Number(curluckyGood.price) *
								(1 + Number(luckyData.ratio))
							).toFixed(2)
						"
					></Currency
					>&nbsp;&nbsp; {{ t('lucky.start') }}
				</div>
				<div
					class="start-btn"
					@click="
						batchShow = true;
						batchLayer = true;
					"
				>
				{{ t('lucky.enableInBatches') }}
				</div>
			</div>
		</div>
		<div class="wp-vs-wrap" v-if="false">
			<div class="wp-img-wrap">
				<div><img :src="curluckyGood.iconUrl" alt="" /></div>
				<div>
					<img src="@/assets/romimg/lucky/rand_wp.png" alt="" srcset="" />
				</div>
			</div>
			<div class="wp-desc-wrap">
				<div class="left">
					<p>{{ goodsName1 }}</p>
					<p>
						{{ goodsName2 }}
					</p>
				</div>
				<div class="vs">VS</div>
				<div class="right">
					<p>{{ t('battle.random') }}</p>
					<p>{{ t('openbox.cheapJewelry') }}</p>
				</div>
			</div>
		</div>
		<div class="wq-wrap-title">
			<span class="icon iconfont">&#xe65b;</span>{{ t('lucky.changeGoodsQuality') }}
		</div>
		<div class="wq-wrap">
			<!-- <div class="goods_list">
				<div
					class="goods_list_item"
					v-for="(item, index) in goodsList"
					:key="index"
					@click="onClickGoodsItem(item)"
				>
					<div class="price">${{ item.price }}</div>
					<div class="pic">
						<img :src="item.iconUrl" :alt="item.goodsName" />
					</div>
					<p class="hide">{{ item.goodsName }}</p>
				</div>
			</div> -->

			<div
				class="goods_list"
				:class="{ length1: luckyGoodsItems.length == 1 }"
				v-if="luckyGoodsItems.length > 0"
			>
				<div
					class="goods_list_item"
					v-for="item in luckyGoodsItems"
					@click="onClickLuckyGood(item)"
					:key="item.id"
					:style="'background-image: url(' + getImageBg(item) + ');'"
					:class="{
						active: curluckyGood.id == item.id,
						checked: curluckyGood.id == item.id,
						unchecked: curluckyGood.id != item.id,
					}"
				>
					<div class="selected">
						<img src="@/assets/romimg/lucky/item__check1.png" alt="" />
					</div>
					<!-- {{ getExteriorName(item) }}
					<div class="price">
						<img
							v-if="curluckyGood.id == item.id"
							src="@/assets/romimg/common/gold.png"
							alt=""
						/>
						<img v-else src="@/assets/romimg/common/gold.png" alt="" />
						{{ item.price }}
					</div> -->

					<div class="price">
						<Currency
							:size="'mini'"
							:fontsize="12"
							:currency="item.price"
						></Currency>
					</div>
					<div class="pic">
						<img :src="item.iconUrl" :alt="item.goodsName" />
					</div>
					<!-- <p class="hide">{{ item.goodsName }}</p> -->

					<div class="item-name">
						{{ item.goodsName.split("|")[0] }}
					</div>
					<div class="item-wear">
						{{ item.goodsName.split("|")[1] }}
					</div>
				</div>
			</div>
		</div>

		<div class="records-wrap">
			<Tabs :items="tabs.items" @tabChangedEvent="tabChangedEvent"></Tabs>
			<div v-show="tabs.index == 0" class="history-wrap">
				<TabsFlex
					label=""
					:items="[t('battle.member'), t('battle.anchor')]"
					@tabFlexChangedEvent="tabFlexChangedEvent_history"
					:paddingTop="20"
				></TabsFlex>

				<!-- <div class="sort-wrap" @click="onShowBottomFliter()">
				<div class="sort-item">
					{{ dropPager.userType == 1 ? "会员" : "主播" }}
				</div>
				<div class="sort-item">
					{{ historyShowDetails ? "详细查看" : "简洁查看" }} &nbsp;>
				</div>
			</div> -->
				<div class="drop-wrap">
					<van-list
						v-model:loading="dropLoading"
						:finished="dropFinished"
						:finished-text="t( 'common.noMore' )"
						@load="onDropLoading"
						:key="dropPager.pageIndex"
						:immediate-check="false"
					>
						<div class="list-head">
							<div class="head">{{ t('common.users') }}</div>
							<div class="per">{{ t('openbox.ratio') }}</div>
							<div class="name">{{ t('battle.goodsName') }}</div>
							<div class="price">{{ t('battle.price') }}</div>
							<!-- <div class="goods-wrap">掉落物品</div> -->
						</div>
						<div class="drop-list">
							<div
								class="drop-item"
								v-for="(item, index) in dropList"
								:key="index"
								@click="onClickDropItem(item)"
							>
								<div class="drop-jj-item-wrap" :class="{ active: !item.isWin }">
									<div class="head">
										<!-- <HeadPortrait :userModel="item" :size="'one'"></HeadPortrait> -->
										<img :src="item.avater" alt="" />
										{{ FormatNickname(item.nickName, 8) }}
									</div>

									<div class="per">{{ item.probability }}%</div>
									<!-- <div class="name hide" :data="JSON.stringify(item)">
										{{
											item.isWin
												? FormatNickname(item.goodsName, 16)
												: FormatNickname(item.rewardGoodsName, 16)
										}}
									</div> -->
									<div class="goods-wrap">
										<img v-if="item.isWin" :src="item.iconUrl" alt="" />
										<img v-else :src="item.rewardIconUrl" alt="" />
									</div>
									<div class="price">
										<Currency
											v-if="item.isWin"
											:hide="true"
											:currency="item.price"
										></Currency>
										<Currency
											v-else
											:hide="true"
											:currency="item.rewardPrice"
										></Currency>
									</div>
									<!-- <div class="per">{{ item.probability }}%</div> -->
									<!-- <div class="goods-wrap">
										<img
											v-show="item.isWin"
											:src="item.iconUrl"
											alt=""
											style="margin-right: 10px"
										/>
										<img :src="item.rewardIconUrl" alt="" />
									</div> -->

									<!-- <div class="item-head">
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
								</div> -->
									<div class="item-goods-info">
										<!-- <div class="item-goods-name">{{ item.goodsName }}</div> -->
										<!-- <div class="item-goods-attr">
										<img :src="item.iconUrl" alt="" />
										<div class="item-goods-wg">
											{{ getExteriorName(item.exterior) }}
										</div>
										<div class="item-goods-price">{{ item.price }}</div>	
									</div> -->
									</div>
									<!-- <div class="item-right">
								 <div class="per">{{ item.probability }}%</div>	
									<div class="goods-wrap">
										<img v-show="item.isWin" :src="item.iconUrl" alt="" />
										<img :src="item.rewardIconUrl" alt="" />
									</div>
								</div> -->
								</div>
							</div>
						</div>
						<!-- <div class="drop-list" v-if="!historyShowDetails">
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
					</div> -->
					</van-list>
				</div>
			</div>
			<div v-show="tabs.index == 1" class="stat-wrap">
				<div class="top-wrap">
					<div class="refresh-wrap" @click="refreshStat">
						{{ t('openbox.statisticsLast3Day') }}
						<span class="icon iconfont">&#xe64c;</span>
						<!-- <img src="@/assets/romimg/lucky/refresh.png" alt="" /> -->
					</div>
					<div class="text" @click="searchShow = true">{{ t('common.filter') }}</div>
				</div>
				<div class="tab-wrap">
					<div class="tab-title">
						<p>{{ t('openbox.ratio') }}</p>
						<p>{{ t('openbox.timesStatistics') }}</p>
						<div class="title-img">
							<span class="icon iconfont allow-top">&#xe65a;</span>
							{{ t('openbox.timesProportion') }}
						</div>
						<div class="title-img">
							<span class="icon iconfont allow-bottom">&#xe659;</span>
							<span>{{ t('openbox.timesProportion') }}</span>
						</div>
					</div>
					<div class="table">
						<div
							v-for="(item, index) in statList"
							class="table-item"
							:key="index"
						>
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
					<!-- <div class="search-wrap" @click="onClickStatSearch">
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
				</div> -->
				</div>
			</div>
			<div v-show="tabs.index == 2" class="history-wrap">
				<div class="drop-wrap">
					<div class="filter-wrap">
						<div class="filter-type-wrap">
							<div
								class="filter-type-item"
								@click="onClickChangeFilterType(1)"
								:class="{ active: filter_type == 1 }"
							>
							{{ t('lucky.priceMax') }}
							</div>
							<div
								class="filter-type-item"
								@click="onClickChangeFilterType(2)"
								:class="{ active: filter_type == 2 }"
							>
							{{ t('lucky.maxincrease') }}
							</div>
							<div
								class="filter-type-item"
								@click="onClickChangeFilterType(3)"
								:class="{ active: filter_type == 3 }"
							>
							{{ t('lucky.godBy5') }}
							</div>
						</div>
					</div>

					<div class="drop-down">
						<div class="down-text hide" @click="onOtherDown">
							{{ qualityOptItem.name }}
							<p v-show="qualityTextShow">{{ t('timebox.today') }}</p>
							<img src="@/assets/romimg/common/arrow_down.png" alt="" />
						</div>
						<div class="down-list" v-show="qualityActive">
							<div
								class="down-item hide"
								:class="{ active: item.name == qualityOptItem.name }"
								v-for="(item, index) in qualityItems"
								:key="index"
								@click="onSelectOther(item)"
							>
								{{ item.name }}
							</div>
						</div>
					</div>

					<div class="list-head">
						<div class="head">{{ t('lucky.boomRate') }}{{ t('common.users') }}</div>
						<div class="per">{{ t('openbox.ratio') }}</div>
						<!-- <div class="name">饰品</div> -->
						<div class="goods-wrap">{{ t('battle.goodsName') }}</div>
						<div class="price">{{ t('battle.price') }}</div>
					</div>

					<div class="drop-list">
						<div
							class="drop-item"
							v-for="(item, index) in bastStatList"
							:key="index"
							@click="onClickDropItem(item)"
						>
							<div class="drop-jj-item-wrap" :class="{ active: !item.isWin }">
								<div class="head">
									<!-- <HeadPortrait :userModel="item" :size="'one'"></HeadPortrait> -->
									<span>{{ index + 1 }}</span>
									<img :src="item.avater" alt="" />
									{{ FormatNickname(item.nickName, 6) }}
								</div>

								<div class="per">{{ item.probability }}%</div>
								<!-- <div class="name hide">
									{{ FormatNickname(item.goodsName, 16) }}
								</div> -->
								<div class="goods-wrap">
									<img v-if="item.isWin" :src="item.iconUrl" alt="" />
								</div>
								<div class="price">
									<Currency
										v-if="item.isWin"
										:hide="true"
										:currency="item.price"
									></Currency>
									<Currency
										v-else
										:hide="true"
										:currency="item.rewardPrice"
									></Currency>
								</div>
								<!-- <div class="per">{{ item.probability }}%</div> -->
								<!-- <div class="goods-wrap">
										<img
											v-show="item.isWin"
											:src="item.iconUrl"
											alt=""
											style="margin-right: 10px"
										/>
										<img :src="item.rewardIconUrl" alt="" />
									</div> -->

								<!-- <div class="item-head">
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
								</div> -->
								<div class="item-goods-info">
									<!-- <div class="item-goods-name">{{ item.goodsName }}</div> -->
									<!-- <div class="item-goods-attr">
										<img :src="item.iconUrl" alt="" />
										<div class="item-goods-wg">
											{{ getExteriorName(item.exterior) }}
										</div>
										<div class="item-goods-price">{{ item.price }}</div>	
									</div> -->
								</div>
								<!-- <div class="item-right">
								 <div class="per">{{ item.probability }}%</div>	
									<div class="goods-wrap">
										<img v-show="item.isWin" :src="item.iconUrl" alt="" />
										<img :src="item.rewardIconUrl" alt="" />
									</div>
								</div> -->
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- <div class="history-wrap">
			<div class="common-nav">
				<div class="common-nav-item active">历史掉落</div>
			</div>
			<div class="sort-wrap" @click="onShowBottomFliter()">
				<div class="sort-item">
					{{ dropPager.userType == 1 ? "会员" : "主播" }}
				</div>
				<div class="sort-item">
					{{ historyShowDetails ? "详细查看" : "简洁查看" }} &nbsp;>
				</div>
			</div>
			<div class="drop-wrap" v-if="!historyShowDetails">
				<div
					class="drop-item"
					v-for="(item, index) in dropList"
					:key="index"
					:class="{ active: item.isWin }"
				>
					<div class="per">{{ item.probability }}%</div>
					<HeadPortrait :userModel="item" :size="'open'"></HeadPortrait>
					<p class="hide">{{ item.goodsName }}</p>
					<div class="goods-wrap">
						<img v-if="item.isWin" :src="item.iconUrl" alt="" />
						<img :src="item.rewardIconUrl" alt="" />
					</div>
				</div>
			</div>
			<div class="drop-wrap" v-if="historyShowDetails">
				<div
					class="drop-detail-item"
					v-for="(item, index) in dropList"
					:key="index"
					:class="{ active: item.isWin }"
				>
					<div class="his-top-wrap">
						<div class="item-head-bg">
							<HeadPortrait
								:userModel="item"
								:size="'head_n_lucky_detail'"
								class="head"
							></HeadPortrait>
							<p class="hide">{{ item.nickName }}</p>
							<div class="anchor" v-if="dropPager.userType == 2">
								<img src="@/assets/romimg/lucky/item_anchor1.png" alt="" /> 
								主播
							</div>
						</div>
						<div class="his-item-time">{{ item.createTime }}</div>
					</div>
					<div class="his-bottom-wrap">
						<div class="per">{{ item.probability }}%</div>

						<div class="goods-wrap">
							<div v-if="item.isWin" class="goods-item">
								<img :src="item.iconUrl" alt="" />
								<div class="price">{{ item.price }}</div>
							</div>
							<div class="goods-item">
								<img :src="item.rewardIconUrl" alt="" />
								<div class="price">{{ item.rewardPrice }}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div> -->

		<!-- <OpenBoxOneAni
			:goodsList="goodsList"
			@onAnimationEnd="onAnimationEnd"
			ref="animationxRef"
		>
		</OpenBoxOneAni> -->

		<div class="batch-wrap" :class="{ active: batchShow }">
			<div class="close">
				<img
					src="@/assets/romimg/lucky/close.png"
					alt=""
					@click="
						batchShow = false;
						batchLayer = false;
					"
				/>
			</div>

			<div class="batch-goods-wrap">
				<img
					:class="'img-' + curBatchNumber"
					src="@/assets/romimg/lucky/pseudo.png"
				/>
				<p class="goodsname">{{ getGoodsName() }}</p>
				<p class="wear">
					{{ getGoodsNameWear() }}
				</p>
				<img :src="curluckyGood.iconUrl" alt="" />
				<div class="prob-wrap">{{ curProbability }}%</div>
			</div>
			<div class="batch-btn-wrap">
				<div
					class="batch-btn-item"
					v-for="(item, index) in selectBatchArray"
					:key="index"
					:class="{ active: curBatchNumber == item.number }"
					@click="onClickBatchItem(item.number)"
				>
					X{{ item.number }}
				</div>
			</div>
			<div class="start-btn-wrap" v-if="!isOpening">
				<div class="start-btn" @click="onClickOpen(curBatchNumber)">
					<Currency
						:hide="true"
						:currency="
							(
								(Number(curProbability) / 100) *
								curBatchNumber *
								Number(curluckyGood.price) *
								(1 + Number(luckyData.ratio))
							).toFixed(2)
						"
					></Currency
					>&nbsp;&nbsp;{{ t('lucky.boomRate') }}{{ t('lucky.enableInBatches') }}
				</div>
			</div>
		</div>

		<div class="search-wrap" :class="{ active: searchShow }">
			<div class="close">
				<img
					src="@/assets/romimg/lucky/close.png"
					alt=""
					@click="
						searchShow = false;
						batchLayer = false;
					"
				/>
			</div>

			<div class="input-wrap">
				<div class="title">{{ t('openbox.ratio') }}</div>
				<div class="content">
					<input
						v-model="searchFilter.from"
						type="number"
						min="0"
						max="100"
						:placeholder=" t('lucky.minProbability')	"
					/>
					<div class="split"></div>
					<input
						v-model="searchFilter.to"
						type="number"
						min="0"
						max="100"
						:placeholder=" t('lucky.maxProbability')"
					/>
				</div>
			</div>
			<div class="search-btn-wrap">
				<div
					class="search-btn"
					@click="
						searchShow = false;
						batchLayer = false;
					"
				>
				{{ t('battle.cancel') }}
				</div>
				&nbsp;&nbsp;&nbsp;&nbsp;
				<div class="search-btn active" @click="getLuckyCustoms">{{ t('battle.confirm') }}</div>
			</div>
		</div>

		<!-- <LuckyAni
			v-show="aniLayer"
			:goodsList="goodsList"
			@onAnimationEnd="onAnimationEnd"
			ref="animationxRef"
		> 
		animationyRef
		animationxRef

		</LuckyAni> -->

		<OpenBoxMultAni
			v-show="aniLayer"
			:goodsList="goodsList"
			:goods="curluckyGood"
			@onAnimationEnd="onAnimationEnd"
			ref="animationyRef"
			@onRandEnd="onRandEnd"
		>
		</OpenBoxMultAni>

		<!-- <ResultLayer
			:goodsList="goodsList"
			@onClose="onResultClose"
			ref="resultRef"
		></ResultLayer> -->

		<ResultLayer
			:openBoxTitle="t('openbox.getReward')"
			v-if="goodsList.length > 0"
			:goodsList="goodsList"
			@onClose="onResultClose"
			ref="resultRef"
		></ResultLayer>

		<van-popup
			v-model:show="bottomFilterShow"
			position="bottom"
			class="bottom-filter"
		>
			<div class="bottom-filter-wrap">
				<div class="bottom-title">
					<img src="@/assets/romimg/lucky/icon_pepole.png" alt="" />
					<span>{{ t('openbox.recordType') }}</span>
				</div>
				<div class="bottom-btn-wrap">
					<div
						class="bottom-btn1"
						:class="{ active: bottomFilterData.userType == 1 }"
						@click="bottomFilterData.userType = 1"
					>
					{{ t('battle.member') }}
					</div>
					<div
						class="bottom-btn1"
						:class="{ active: bottomFilterData.userType == 2 }"
						@click="bottomFilterData.userType = 2"
					>
					{{ t('battle.anchor') }}
					</div>
				</div>
				<div class="bottom-title">
					<img src="@/assets/romimg/lucky/icon_category.png" alt="" />
					<span>{{ t('battle.showType') }}</span>
				</div>
				<div class="bottom-btn-wrap">
					<div
						class="bottom-btn1"
						:class="{ active: !bottomFilterData.details }"
						@click="bottomFilterData.details = false"
					>
					{{ t('battle.simpleView') }}
					</div>
					<div
						class="bottom-btn1"
						:class="{ active: bottomFilterData.details }"
						@click="bottomFilterData.details = true"
					>
					{{ t('battle.detailView') }}
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
#luckyboxdetails {
	width: 750px;
	min-height: 800px;

	display: flex;
	flex-direction: column;
	align-items: center;
	// background-color: #0e0f1e;

	@keyframes breathe1 {
		0% {
			opacity: 0.2; /* 调整透明度值 */
		}
		50% {
			opacity: 0; /* 调整透明度值 */
		}
		100% {
			opacity: 0.2; /* 调整透明度值 */
		}
	}
	@keyframes breathe2 {
		0% {
			opacity: 0.4; /* 调整透明度值 */
		}
		50% {
			opacity: 0.2; /* 调整透明度值 */
		}
		100% {
			opacity: 0.4; /* 调整透明度值 */
		}
	}
	@keyframes breathe3 {
		0% {
			opacity: 0.6; /* 调整透明度值 */
		}
		50% {
			opacity: 0.2; /* 调整透明度值 */
		}
		100% {
			opacity: 0.6; /* 调整透明度值 */
		}
	}
	@keyframes breathe4 {
		0% {
			opacity: 0.8; /* 调整透明度值 */
		}
		50% {
			opacity: 0.2; /* 调整透明度值 */
		}
		100% {
			opacity: 0.8; /* 调整透明度值 */
		}
	}
	@keyframes breathe5 {
		0% {
			opacity: 1; /* 调整透明度值 */
		}
		50% {
			opacity: 0.2; /* 调整透明度值 */
		}
		100% {
			opacity: 1; /* 调整透明度值 */
		}
	}

	.img-1 {
		width: 516px !important;
		height: 462px !important;
		top: 67px !important;
		right: 97px !important;
		position: absolute; /* 使用绝对定位 */
		animation: breathe1 2.5s ease-in-out infinite; /* 可根据需要调整动画持续时间和速度 */
	}
	.img-2 {
		width: 516px !important;
		height: 462px !important;
		top: 67px !important;
		right: 97px !important;
		position: absolute; /* 使用绝对定位 */
		animation: breathe2 2.5s ease-in-out infinite; /* 可根据需要调整动画持续时间和速度 */
	}
	.img-3 {
		width: 516px !important;
		height: 462px !important;
		top: 67px !important;
		right: 97px !important;
		position: absolute; /* 使用绝对定位 */
		animation: breathe3 2.5s ease-in-out infinite; /* 可根据需要调整动画持续时间和速度 */
	}
	.img-4 {
		width: 516px !important;
		height: 462px !important;
		top: 67px !important;
		right: 97px !important;
		position: absolute; /* 使用绝对定位 */
		animation: breathe4 2.5s ease-in-out infinite; /* 可根据需要调整动画持续时间和速度 */
	}
	.img-5 {
		width: 516px !important;
		height: 462px !important;
		top: 67px !important;
		right: 97px !important;
		position: absolute; /* 使用绝对定位 */
		animation: breathe5 2.5s ease-in-out infinite; /* 可根据需要调整动画持续时间和速度 */
	}

	.ani_layer {
		width: 100%;
		height: 100%;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 12;
		background-color: rgba(#000, 0.9);
	}
	.batch_layer {
		width: 100%;
		height: 100%;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 10;
		background-color: rgba(#000, 0.8);
	}
	.big_bg {
		background-image: url(@/assets/romimg/lucky/detail_bg1.png);
		background-size: contain;
		width: 750px;
		height: 930px;
		background-color: #0e0f1e;
	}
	.lucky_header {
		height: 130px;
		width: 100%;
		padding: 0px 40px;
		color: #fff;
		font-size: 40px;
		font-style: normal;
		font-weight: 300;
		line-height: normal;
		display: flex;
		box-sizing: border-box;
		justify-content: space-between;
		align-items: center;
		.left {
			color: #fff;
			font-size: 40px;
			font-style: normal;
			font-weight: 300;
			line-height: normal;
			span {
				color: #4b4d5f;
				margin-right: 10px;
				font-size: 30px;
				font-size: 40px;
			}
		}
		.right {
			display: flex;
			justify-content: center;
			align-items: center;
			span {
				font-size: 30px;
				color: #323558;
			}
			img {
				width: 44px;
			}
		}
		.center {
			p:first-child {
				color: #c3c3e2;
				font-size: 28px;
				font-style: normal;
				font-weight: 700;
				text-align: center;
			}
			p:last-child {
				color: #8b8c97;
				text-align: center;
				line-height: 45px;
				font-size: 24px;
				font-weight: 400;
			}
		}
	}
	// .top-wrap {
	//	 width: 710px;
	//	 height: 168px;
	//	 margin-top: 50px;
	//	 display: flex;
	//	 justify-content: space-between;
	//	 align-items: center;

	//	 .left {
	//		 display: flex;
	//		 flex-direction: column;
	//		 justify-content: center;
	//		 align-items: center;
	//		 width: 213px;
	//		 height: 168px;
	//		 background: url(@/assets/romimg/lucky/left_bg.png) no-repeat center;
	//		 background-size: 213px 168px;
	//		 color: #7bdca2;
	//		 font-size: 12px;
	//		 .text {
	//			 font-size: 40px;
	//		 }
	//		 .desc {
	//			 font-size: 24px;
	//			 // transform: scale(0.8);
	//			 transform-origin: 0 0;
	//		 }
	//	 }

	//	 .center {
	//		 //	 position: absolute;
	//		 display: flex;
	//		 flex-direction: column;
	//		 justify-content: center;
	//		 align-items: center;
	//		 img {
	//			 width: 34px;
	//			 height: 34px;
	//		 }
	//	 }

	//	 .right {
	//		 display: flex;
	//		 flex-direction: column;
	//		 justify-content: center;
	//		 align-items: center;
	//		 width: 213px;
	//		 height: 168px;
	//		 color: #f69781;
	//		 font-size: 24px;
	//		 background: url(@/assets/romimg/lucky/right_bg.png) no-repeat center;
	//		 background-size: 213px 168px;

	//		 .text {
	//			 font-size: 40px;
	//		 }
	//		 .desc {
	//			 font-size: 24px;
	//			 // transform: scale(0.8);
	//			 transform-origin: 0 0;
	//		 }
	//	 }

	//	 .name {
	//		 background: url(@/assets/romimg/lucky/name_bg.png) no-repeat center;
	//		 background-size: 300px 36px;
	//		 min-width: 263px;
	//		 height: 36px;
	//		 color: #fff;
	//		 font-size: 20px;
	//		 display: flex;
	//		 justify-content: center;
	//		 align-items: center;
	//		 margin: 72px auto 0px;
	//	 }
	// }
	.circle-gropress-wrap {
		--el-fill-color-light: transparent;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 750px;
		height: 410px;
		position: relative;
		// background-image: url(@/assets/romimg/lucky/detail_bg1.png);
		// background-size: contain;
		.good_img {
			position: absolute;
			width: 240px;
			height: 180px;
		}
		.progress-circle-container {
			width: 320px;
			height: 320px;
			position: absolute;
			left: calc(50% - 160px);
			top: calc(50% - 160px);
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
		.el-progress {
			// margin-top: 5px;

			.el-progress__text {
				margin-top: 125px;
				margin-left: 10px;
				font-size: 42px;
				color: #f9a328;
				font-weight: 700;
				text-shadow: 0px 0px 19.18378448486328px #f9a328;
			}
			.el-progress-circle {
				width: 320px !important;
				height: 320px !important;
			}
		}
	}
	.rate-wrap {
		width: 690px;
		margin: auto;
		margin-top: 50px;
		// display: flex;
		border-radius: 8px;
		height: 186px;
		background: #15172c;
		padding: 20px 30px;
		box-sizing: border-box;
		.rate-btn-wrap {
			height: 64px;
			display: flex;
			justify-content: space-around;
			align-items: center;
			box-sizing: border-box;

			.rate-btn-item {
				width: 90px;
				height: 64px;
				font-size: 20px;
				color: #8b8c97;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 8px;
				border: 1px solid #1e1e29;
				background: #1e1e29;
				box-sizing: border-box;
				&.active {
					color: #fff;
					background: #4a55bc;
				}
			}
		}

		.rate-progress-wrap {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 110px;

			// .slide::before {
			//	 position: absolute;
			//	 background-color: #3a33ad !important;
			//	 width: 50px;
			//	 height: 4px;
			//	 left: 0;
			// }
			// .slide::after {
			//	 background-color: #3a33ad;
			// }
			.left-wrap {
				color: #8b8c97;
				width: 120px;
				font-size: 24px;
			}
			.right-wrap {
				color: #ffcd6c;
				width: 160px;
				text-align: center;
				font-size: 24px;
			}
			.slide {
				width: 400px;
				height: 4px;
				display: flex;
				// padding-left: 50px;
				// padding-right: 60px;
				background-color: #373845;
				.slide-pre-wrap {
					height: 4px;
					background-color: #3a33ad;
					width: 60px;
				}
				.slide-next-wrap {
					height: 4px;
					background-color: #373845;
					width: 80px;
				}
				.el-slider {
					height: 4px;

					.el-slider__runway {
						background: #373845;
						height: 4px;
						margin: 0;
					}

					.el-slider__bar {
						// background: hsla(0, 0%, 100%, 0);
						height: 4px;
						background: #3a33ad; // url(@/assets/romimg/lucky/slide_bg.png);

						box-shadow: 0 10px 10px rgba(#3a33ad, 0.25);

						// background-repeat: repeat-x;
						// background-size: auto 100%;
						// top: 3px;
					}

					.el-slider__button-wrapper {
						top: -18px;
						transform: translateX(-50%);
						background-color: transparent;
						text-align: center;
						-webkit-user-select: none;
						-moz-user-select: none;
						user-select: none;
						line-height: normal;
						border: none;
						z-index: 1;
						width: 70px;
						height: 40px;
						color: #fff;

						border-radius: 14px;
						background: #3a33ad;
						box-shadow: 0px 0px 14.4928px 0px #3a33ad;

						color: #fff;
						text-align: center;
						font-size: 20px;
						font-style: normal;
						font-weight: 700;
						&::after {
							content: "%";
							line-height: 40px;
							// padding-top: 5px;
							// font-size: 24px;
							// transform: scale(0.83);
						}
						&::before {
							content: attr(aria-valuenow);
							line-height: 40px;
							// font-size: 24px;
							// transform: scale(0.83);
							// position: absolute;
							// text-align: center;
							// font-size: 26px;
							// font-style: normal;
							// font-weight: 500;
							// padding-top: 12px;
							// box-sizing: border-box;
							// top: -80px;
							// left: -22px;
							// height: 70px;
							// width: 52px;
							// z-index: 100000;
							// // border: 1px solid red;
							// background-image: url(@/assets/romimg/lucky/tips_bg.png);
							// background-size: 52px 70px;
							// background-repeat: no-repeat;
							// color: #fefffe;
						}
					}

					.el-slider__button {
						display: none;
					}
				}
			}
			img {
				margin-top: 5px;
				width: 600px;
				height: 100%;
			}
			.btn-progress {
				margin-left: 20px;

				img {
					width: 40px;
					height: 40px;
				}
			}

			.btn-progress2 {
				margin-right: 20px;

				img {
					width: 40px;
					height: 40px;
				}
			}
		}

		#currency-wrap {
			display: flex;
		}
	}

	.start-btn-wrap {
		position: relative;
		display: flex;
		margin: auto;
		margin-top: 30px;
		width: 690px;
		.start-btn {
			width: 332px;
			height: 90px;
			border-radius: 8px;
			background: #4a55bc;
			text-align: center;
			color: #fff;
			font-size: 26px;
			font-weight: bold;
			margin: 0 auto;
			display: flex;
			justify-content: center;
			align-items: center;

			#currency-wrap {
				margin-left: 10px;
				color: #fff;
			}
		}
	}
	.wq-wrap-title {
		width: 750px;
		color: #fff;
		text-align: left;

		font-size: 24px;
		background-color: #0e0f1e;
		border-bottom: 1px solid #1e1e24;

		height: 100px;
		line-height: 100px;
		font-style: normal;
		font-weight: 400;
		margin-top: 10px;
		padding-left: 30px;
		box-sizing: border-box;
		span {
			font-size: 30px;
			margin-right: 20px;
			color: #3e3e47;
		}
	}
	.wq-wrap {
		// margin-top: 50px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: #0e0f1e;
		width: 750px;

		.goods_list {
			width: 700px;
			display: flex;
			justify-content: space-around;
			align-items: center;
			flex-wrap: wrap;
			margin-top: 24px;
			margin-bottom: 40px;
			position: relative;
			box-sizing: border-box;
			&.length1 {
				justify-content: center;
			}

			.goods_list_item {
				width: 312px;
				height: 320px;
				// border-radius: 10px;
				background: #15172c;
				background-repeat: no-repeat;
				background-size: contain;
				background-position: center;
				margin-bottom: 30px;
				position: relative;
				color: #fff;
				font-size: 26px;
				border: 1px solid #2d2d67;

				.selected {
					display: block;

					img {
						position: absolute;
						top: -2px;
						left: -2px;
						width: 37px;
						height: 37px;
					}
				}
				&.unchecked {
					border: 1px solid transparent;
					.selected {
						display: none;
					}
				}

				// &.active::after {
				//	 background: url(@/assets/romimg/lucky/item__check.png) no-repeat
				//		 center;
				//	 background-size: 99%;
				//	 width: 37px;
				//	 height: 37px;
				//	 left: 0;
				//	 top: 0;
				// }

				// span {
				//	 display: block;
				//	 text-align: center;
				//	 font-size: 16px;
				//	 color: #eb4b4b;
				//	 margin-top: 12px;
				// }

				.pic {
					display: flex;
					align-items: center;
					box-sizing: border-box;
					justify-content: center;
					width: 186px;
					height: 140px;
					margin: 0px auto 0;

					img {
						max-width: 100%;
						max-height: 100%;
					}
				}

				p {
					padding: 0 20px;
					font-size: 24px;
					margin-top: 40px;
					text-align: center;
					color: #cbccd6;
				}

				.price {
					display: flex;
					align-items: center;
					justify-content: end;
					padding-right: 30px;
					color: #7ef2ad;
					font-weight: 500;
					font-size: 26px;
					width: 100%;
					height: 70px;
					box-sizing: border-box;

					// margin-top: 30px;

					// img {
					//	 width: 25px;
					//	 height: 25px;
					//	 margin-right: 5px;
					//	 margin-top: 1px;
					// }
				}

				.item-name {
					text-align: center;
					padding: 0 10px;
					box-sizing: border-box;
					font-size: 24px;
					color: rgba(255, 255, 255, 0.6);
					text-align: left;
					line-height: 36px;
					font-style: normal;
					font-weight: 300;
					margin-top: 10px;
					padding-left: 40px;
					box-sizing: border-box;
				}

				.item-wear {
					text-align: left;
					padding: 0 10px;
					// margin-top: 6px;
					box-sizing: border-box;
					color: #fff;

					line-height: 46px;

					font-size: 24px;
					font-weight: 700;
					padding-left: 40px;
					box-sizing: border-box;
				}
			}
		}
	}

	.wp-vs-wrap {
		margin-top: 100px;
		width: 750px;
		background: url(@/assets/romimg/lucky/wp_bg.png) no-repeat bottom;
		background-size: 750px 602px;
		.wp-img-wrap {
			width: 710px;
			display: flex;
			justify-content: space-around;
			align-items: center;
			margin: auto;
			img {
				width: 200px;
				// height: 138px;
			}
		}
		.wp-desc-wrap {
			display: flex;
			justify-content: center;
			text-align: left;
			align-items: center;
			color: #fff;
			text-align: center;
			height: 160px;

			font-style: normal;
			font-weight: 300;
			text-transform: uppercase;
			.vs {
				font-size: 54px;
				width: 200px;
			}
			.left {
				width: 300px;
				line-height: 40px;
				text-align: right;
				p:first-child {
					color: #cbccd6;

					font-size: 24px;
					font-style: normal;
					font-weight: 300;
				}
				p:last-child {
					color: #fff;
					font-size: 24px;
					font-style: normal;
					font-weight: 700;
				}
			}
			.right {
				width: 300px;
				text-align: left;
				line-height: 40px;
				p:first-child {
					color: #cbccd6;

					font-size: 24px;
					font-style: normal;
					font-weight: 300;
				}
				p:last-child {
					color: #fff;
					font-size: 24px;
					font-style: normal;
					font-weight: 700;
				}
			}
		}
	}

	.van-popup {
		z-index: 202 !important;
		background: #17171e;
		color: #fff;
		height: 529px;

		&.bottom-filter {
			background: transparent;
			height: 519px;
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
						border: 1px solid #eee131;
						text-align: center;
						line-height: 58px;
						color: #fff;
						font-size: 24px;
						margin-right: 34px;

						&.active {
							background-color: #eee131;
							color: #171c2c;
							background-size: contain;
						}
					}
				}

				.start-btn-wrap {
					position: relative;

					.start-btn {
						width: 686px;
						height: 90px;
						background-color: #eee131;
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
	.records-wrap {
		width: 710px;
		margin: auto;
		border-radius: 8px 8px 0px 0px;
		background: #0e0f1e !important;
		box-sizing: border-box;
		margin-top: 20px;
		#tabs {
			background: #0e0f1e !important;
			height: 100px !important;
			border-bottom: 1px solid #1e1e24;
			padding: 20px !important;
			.tab-item {
				height: 60px !important;
				background-color: #191920;
				border: unset;
				&.active {
					background-color: #3a33ad;
					font-size: 24px;
					// border: 1px solid #554bf7;
					border: unset;
					color: #fff;
				}
			}
		}
		.history-wrap {
			width: 666px;
			position: relative;
			margin: auto;
			#tabsFlex {
				.tab-item {
					height: 52px;
					font-size: 24px;
				}
				&.fontsize14 {
					padding-left: 0 !important;
				}
			}
			.his-per-wrap {
				position: absolute;
				right: 32px;
				top: 12px;
				color: #9097ae;
				font-size: 24px;
				display: flex;
				align-items: center;

				img {
					width: 17px;
					height: 17px;
				}
			}

			.sort-wrap {
				margin: 30px 5px 20px;
				display: flex;

				.sort-item {
					color: #eee131;
					font-size: 25px;

					&:nth-child(2) {
						margin-left: 36px;
					}
				}
			}

			.drop-wrap {
				box-sizing: border-box;
				min-height: 500px;

				.filter-wrap {
					height: 90px;
					display: flex;
					justify-content: space-between;
					align-items: center;

					.filter-type-wrap {
						height: 90px;
						// width: 460px
						gap: 20px;
						display: flex;
						justify-content: space-between;
						align-items: center;
						.filter-type-item {
							padding: 5px 15px;
							border-radius: 8px;
							background: #191920;
							color: #6e6e75;
							line-height: 52px;
							height: 52px;
							font-size: 24px;
							&.active {
								font-size: 24px;
								border-radius: 8px;
								background: #2d2d3a;
								color: #fff;
							}
						}
					}
				}

									.drop-down {
						position: relative;
						width: 160px;
						height: 60px;
						border: 2px solid #1e2037;
						box-sizing: border-box;
						z-index: 3;
						color: #b4b6c8;
						background-color: transparent;
						border-radius: 12px;
						margin-right: 20px;

						&.active {
							border: 2px solid #2d2d67;
							color: #fff;
						}

						.down-text {
							position: relative;
							width: 100%;
							height: 100%;
							padding-left: 20px;
							padding-right: 40px;
							line-height: 0.74667rem;
							box-sizing: border-box;
							text-align: center;
							font-size: 24px;
							font-weight: 500;
							text-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);

							img {
								position: absolute;
								width: 0.26667rem;
								height: auto;
								right: 20px;
								top: 15px;
								transition: 0.3s;
							}
						}

						.down-list {
							position: absolute;
							width: 144px;
							left: -1px;
							top: 62px;
							box-sizing: border-box;
							border-top: none;
							border-bottom: none;
							transition: 0.2s;
							z-index: 9;
							overflow: hidden;
							background: #15172c;
							border: 2px solid #2d2d67;
							border-radius: 2px;
							color: #a0b7ce;
							.down-item {
								width: 100%;
								text-align: center;

								line-height: 56px;
								font-weight: 400;
								font-size: 24px;
								height: 56px;
								background: transparent;

								&.active {
									color: #fff;
									background: #4a45b1;
								}

								&:hover {
									color: #fff;
								}

								&:last-child {
									border-bottom: none;
								}
							}
						}
					}

				.list-head {
					width: 666px;
					display: flex;
					justify-content: center;
					align-items: center;
					height: 80px;
					background: #111324;
					color: #535155;
					font-size: 24px;
					font-style: normal;
					font-weight: 700;
					// margin: 5px 20px;
					// padding: 0 20px;
					box-sizing: border-box;

					.head {
						flex: 4;
						// padding-left: 20px;
						text-align: center;
					}

					.per {
						flex: 2;
						text-align: center;
					}
					.name {
						flex: 3;
						text-align: center;
					}
					.price {
						flex: 2;
						text-align: center;
					}
					.goods-wrap {
						flex: 3;
						text-align: center;
					}
				}

				.drop-list {
					.drop-item {
						width: 666px;

						display: flex;
						align-items: center;
						box-sizing: border-box;
						position: relative;

						.drop-jj-item-wrap {
							margin-top: 2px;
							display: flex;
							align-items: center;
							width: 100%;
							// padding: 0 20px;
							height: 116px;
							box-sizing: border-box;
							border-radius: 12px;
							background: #22222c;
							&.active {
								border-radius: 12px;
								background: #171720;
							}

							.head {
								flex: 4;
								color: #fff;
								text-align: left;
								padding-left: 10px;
								img {
									vertical-align: middle;
									width: 56px;
									height: 56px;
									border-radius: 12px;
									margin-right: 10px;
								}
								span {
									margin-right: 20px;
									padding-left: 10px;
									font-weight: 700;
								}
							}
							.price {
								display: flex;
								justify-content: center; /* 水平居中 */
								align-items: center; /* 垂直居中 */
								flex: 2;
								color: #70c593;
								font-size: 24px;
								font-style: normal;
								font-weight: 700;
								text-align: center;
								&.active {
									color: #70c593;
								}
								img {
									width: 24px;
									height: 24px;
								}

								span {
									font-size: 24px;
								}
							}
							.per {
								flex: 2;
								color: #ffcd6c;

								font-size: 24px;
								font-style: normal;
								font-weight: 700;
								text-align: center;
							}
							.name {
								flex: 4;
								color: #edf0f7;
								text-align: center;
								font-size: 24px;
								font-style: normal;
								font-weight: 500;
							}
							.goods-wrap {
								flex: 3;
								text-align: center;
								// display: flex;
								// justify-content: center;
								// align-items: center;
								img {
									width: 84px;
									height: 64 px;
								}
							}

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

						// &:nth-child(2n) {
						//	 background: url(@/assets/romimg/lucky/tab_his_itembg2.png) no-repeat
						//		 center;
						//	 background-size: 100%;
						// }

						&.active {
							background: url(@/assets/romimg/lucky/tab_his_itembg3.png)
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
				padding-top: 20px;
				padding-bottom: 10px;
				padding-left: 30px;
				padding-right: 30px;
				align-items: center;

				.text {
					font-size: 24px;
					color: #fff;
					font-weight: 400;
					border-radius: 8px;
					background: #4a55bc;
					padding: 6px 20px;
				}

				.refresh-wrap {
					display: flex;
					align-items: center;
					padding-right: 18px;
					font-size: 25px;
					color: #9097ae;
					span {
						font-size: 30px;
						margin-left: 5px;
						margin-top: 3px;
					}
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
				padding: 0 20px;
				.tab-title {
					// background: url(@/assets/romimg/lucky/stat_item_title_bg.png) no-repeat
					//	 center;
					// background-size: 100%;

					font-size: 24px;
					width: 710px;
					height: 80px;
					display: flex;
					justify-content: space-between;
					align-items: center;

					color: #535155;
					font-weight: 700;

					p {
						text-align: center;
						flex: 1;
					}

					.title-img {
						display: flex;
						// justify-content: center;
						// align-items: center;
						box-sizing: border-box;
						flex: 1;

						.allow-top {
							color: #70c593;

							margin-top: 5px;
							margin-left: 5px;
						}

						.allow-bottom {
							// transform: scale(0.7);
							margin-top: 5px;
							margin-left: 5px;

							color: #3a33ad;
						}
					}
				}

				.table {
					// padding: auto 20px;
					.table-item {
						display: flex;
						align-items: center;
						justify-content: space-between;
						margin-top: 2px;
						// background: url(@/assets/romimg/lucky/stat_item_bg2.png) no-repeat
						//	 center;
						// background-size: contain;
						position: relative;
						width: 666px;
						height: 116px;
						color: #fff;
						font-size: 24px;
						border-radius: 12px;
						background: #22222c;

						p {
							text-align: center;
							flex: 1;
							color: #ffcd6c;
							font-size: 24px;
							font-style: normal;
							font-weight: 700;
						}

						:nth-child(2) {
							color: #fff;
							font-size: 24px;
							font-weight: 500;
						}
						:nth-child(3) {
							color: #70c593;
							font-size: 24px;
							font-style: normal;
							font-weight: 700;
							text-align: left;
							padding-left: 5px;
						}

						:nth-child(4) {
							color: #fff;
							font-size: 24px;
							font-weight: 500;
							padding-left: 10px;
							text-align: left;
						}

						// &:nth-child(2n) {
						//	 background: url(@/assets/romimg/lucky/stat_item_bg1.png) no-repeat
						//		 center;
						// }
					}
				}
			}

			.search-wrap {
				display: flex;
				align-items: center;
				justify-content: space-between;
				position: relative;
				background: url(@/assets/romimg/lucky/stat_search_bg.png) no-repeat
					center;
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
	}

	.batch-wrap {
		&.active {
			display: block;
		}
		display: none;
		position: fixed;
		top: 222px;
		width: 710px;
		height: 830px;
		background: #0e0f1e;
		z-index: 10;
		.close {
			position: absolute;
			right: 30px;
			top: 30px;
			img {
				width: 40px;
				height: 40px;
			}
		}

		@keyframes breathes {
			0% {
				background-size: contain;
			}
			50% {
				opacity: 1; /* 调整透明度值 */
			}
			100% {
				background-size: contain;
			}
		}

		// background-color: red;

		@keyframes float {
			0%,
			100% {
				transform: translateY(0); /* 初始位置和结束位置 */
			}
			50% {
				transform: translateY(-10px); /* 上浮位置，可以根据需要调整浮动高度 */
			}
		}

		.batch-goods-wrap {
			width: 100%;
			text-align: center;
			margin: auto;
			margin-top: 68px;

			box-sizing: border-box;
			background-image: url(@/assets/romimg/lucky/batch_detail_bg.png);
			background-position: center;
			background-size: contain;
			width: 516px;
			height: 462px;

			.prob-wrap {
				color: #f9a328;
				text-shadow: 0px 0px 40px #f9a328;
				font-size: 42px;
				font-style: normal;
				font-weight: 700;
				margin-top: -20px;
				margin-left: 15px;
				animation: breathes 2.5s ease-in-out infinite; /* 可根据需要调整动画持续时间和速度 */
			}
			img {
				width: 404px;
				height: 304px;
			}

			img:nth-of-type(2) {
				width: 450px;
				animation: float 2.5s ease-in-out infinite; /* 调整持续时间和速度 */
			}

			.goodsname {
				color: #c3c3e2;
				font-size: 28px;
				font-style: normal;
				font-weight: 700;
				text-align: center;
			}
			.wear {
				color: #8b8c97;
				text-align: center;
				line-height: 45px;
				font-size: 24px;
				font-weight: 400;
			}
		}

		// .rate-wrap {
		//	 width: 690px;
		//	 margin: auto;
		//	 margin-top: 50px;
		//	 // display: flex;
		//	 border-radius: 8px;
		//	 height: 152px;
		//	 background: #15172c;
		//	 padding: 20px 30px;
		//	 box-sizing: border-box;
		.batch-btn-wrap {
			width: 690px;

			display: flex;
			justify-content: space-around;
			align-items: center;
			height: 116px;
			background: #15172c;
			border-radius: 8px;

			.batch-btn-item {
				width: 90px;
				height: 52px;
				font-size: 24px;
				font-weight: 700;
				color: #8b8c97;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 8px;
				border: 1px solid #1e1e29;
				background: #1e1e29;

				&.active {
					color: #fff;
					background: #4a55bc;
				}
			}
			// }
		}
	}

	.search-wrap {
		&.active {
			display: block;
		}
		display: none;
		position: fixed;
		top: 222px;
		width: 710px;
		height: 508px;
		background: #191c34;
		z-index: 10;
		.close {
			position: absolute;
			right: 30px;
			top: 30px;
			img {
				width: 40px;
				height: 40px;
			}
		}
		// background-color: red;
		.input-wrap {
			.title {
				width: 650px;
				color: #fff;
				font-size: 36px;
				font-style: normal;
				font-weight: 400;
				line-height: 150px; /* 133.333% */
				height: 150px;
			}
			.content {
				display: flex;
				justify-content: center;
				align-items: center;
				.split {
					width: 20px;
					height: 5px;
					background: #4b4f6d;
					margin-left: 20px;
					margin-right: 20px;
				}
				input {
					width: 296px;
					height: 80px;
					border-radius: 8px;
					border: 1px solid #4b4f6d;
					background: #212540;
					color: #fff;
					text-align: center;
				}
				input::-webkit-input-placeholder {
					/* 使用webkit内核的浏览器 */
					color: #b4b6c8;
					text-align: center;
				}
				input:-moz-placeholder {
					/* Firefox版本4-18 */
					color: #b4b6c8;
					text-align: center;
				}
				input::-moz-placeholder {
					/* Firefox版本19+ */
					color: #b4b6c8;
					text-align: center;
				}
				input:-ms-input-placeholder {
					/* IE浏览器 */
					color: #b4b6c8;
					text-align: center;
				}
			}
		}

		.search-btn-wrap {
			margin-top: 100px;
			width: 690px;

			display: flex;
			justify-content: center;
			align-items: center;

			.search-btn {
				width: 280px;
				height: 96px;
				font-size: 28px;
				font-weight: 700;
				color: #fff;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 8px;
				background: #3a34b0;

				&.active {
					background: #7d51df;
				}
			}
			// }
		}
	}
}

.el-popper {
	display: none !important;
}
</style>
