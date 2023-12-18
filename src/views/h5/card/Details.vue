<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, onUnmounted, nextTick, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { getGoodsLevelColor } from "@/util/common";
import { GoodImageBgType } from "@/util/util";

import {
	getLuckyDetails,
	pullLuckyGoods,
	getLuckyRecords,
} from "@/network/api/lucky";
import { getGoodsAttributes } from "@/network/api/index";
import OpenBoxOneAni from "../openbox/components/OpenBoxOneAni.vue";
import ResultLayer from "../openbox/components/Result.vue";
import imgRandIcon from "@/assets/romimg/lucky/rand.png";
import { tokenName } from "@/config";

const store = useStore();
const route = useRoute();

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

const bottomFilterShow = ref(false);
const bottomFilterData = ref({ userType: 1, details: false });

const isAnimation = computed(() => store.state.animationSwitch);

const btnOpenActive = ref(true); //防快速开箱

onMounted(() => {
	luckyId = Number(route.query.id);
	getAttributes();
	getDetail();
	startDropTime();
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

		curProbability.value = Number(curluckyGood.value.maxProbability);
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

async function getLuckyDrop() {
	const res = await getLuckyRecords({
		id: luckyId,
		limit: dropPager.value.limit,
		page: dropPager.value.pageIndex,
		userType: dropPager.value.userType,
	});
	if (res.code === 0) {
		let items = res.data.items || [];
		dropList.value = items;
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
	});
	btnOpenActive.value = true;

	if (res.code == 0) {
		goodsData.value = res.data;
		for (let index = 0; index < goodsData.value.items.length; index++) {
			const item = goodsData.value.items[index];
			item.goodsLevel = 7;
		}

		aniLayer.value = true;

		let allCount = 32;
		let goodCount =
			Math.floor(Number(curProbability.value) * 0.01 * allCount) + 1;
		let randCount = allCount - goodCount;
		window.$dev && console.log(goodCount, randCount);
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
			animationxRef.value.randGoodList();

			if (isAnimation.value) {
				setTimeout(() => {
					startAnimationX();
				}, 550);
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
	if (goodsData.value.isWin) {
		award = { ...curluckyGood.value };
		award.goodsLevel = 7;
	}
	animationxRef.value.showAward(award);
}

function onAnimationEnd() {
	aniLayer.value = false;
	showResult();
}

function showResult() {
	aniLayer.value = true;
	resultRef.value.showReuslt(goodsData.value.items);
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
	bottomFilterShow.value = false;
	startDropTime();
}
</script>
<template>
	<div id="luckyboxdetails">
		<div class="ani_layer" v-show="aniLayer"></div>
		<div class="top-wrap">
			<div class="left">
				<img :src="curluckyGood.iconUrl" alt="" />
				<div class="text">{{ getExteriorName(curluckyGood) }}</div>
			</div>
			<div class="center">
				<img :src="curluckyGood.iconUrl" alt="" />
				<div class="text">
					<div class="text1">{{ curProbability }}</div>
					<div class="text2">%</div>
				</div>
			</div>
			<div class="right">
				<img src="@/assets/romimg/lucky/rand.png" alt="" />
				<div class="text">{{ t('battle.randomGoods') }}</div>
			</div>
			<div class="name">{{ luckyData.goodsName }}</div>
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
					<div class="btn-progress" @click="onClickSlideBtn(1)">
						<img src="@/assets/romimg/lucky/btn_sub.png" alt="" />
					</div>
					<div class="slide">
						<el-slider
							v-model="slideProgress"
							:min="Number(curluckyGood.minProbability)"
							:max="Number(curluckyGood.maxProbability)"
							@change="onSliderChange"
							@input="onSliderChange"
						/>
					</div>
					<div class="btn-progress2" @click="onClickSlideBtn(2)">
						<img src="@/assets/romimg/lucky/btn_add.png" alt="" />
					</div>
				</div>
			</div>
		</div>
		<div class="start-btn-wrap">
			<div class="start-btn" @click="onClickOpen()">
				{{
					(
						(Number(curProbability) / 100) *
						Number(curluckyGood.price) *
						(1 + Number(luckyData.ratio))
					).toFixed(2)
				}}
				开始
			</div>
		</div>
		<div class="wq-wrap">
			<div
				class="wq-item"
				v-for="item in luckyGoodsItems"
				@click="onClickLuckyGood(item)"
				:key="item.id"
				:class="{ active: curluckyGood.id == item.id }"
			>
				{{ getExteriorName(item) }}
				<div class="price">
					<img
						v-if="curluckyGood.id == item.id"
						src="@/assets/romimg/common/gold.png"
						alt=""
					/>
					<img v-else src="@/assets/romimg/common/gold.png" alt="" />
					{{ item.price }}
				</div>
			</div>
		</div>
		<div class="history-wrap">
			<div class="common-nav">
				<div class="common-nav-item active">{{ t('battle.randomGoods') }}</div>
			</div>
			<div class="sort-wrap" @click="onShowBottomFliter()">
				<div class="sort-item">
					{{ dropPager.userType == 1 ?  t('battle.member')  :  t('battle.anchor')  }}
				</div>
				<div class="sort-item">
					{{ historyShowDetails ? t('battle.detailView')  : t('battle.simpleView')  }} &nbsp;>
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
								{{ t('battle.anchor') }}
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
		</div>

		<OpenBoxOneAni
			:goodsList="goodsList"
			@onAnimationEnd="onAnimationEnd"
			ref="animationxRef"
		>
		</OpenBoxOneAni>

		<ResultLayer
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
					<span>{{ t('battle.showType') }}</span>
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
	padding-top: 40px;
	padding-bottom: 30px;
	display: flex;
	flex-direction: column;
	align-items: center;

	.ani_layer {
		width: 100%;
		height: 100%;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 10;
	}

	.top-wrap {
		width: 688px;
		height: 594px;
		background: url(@/assets/romimg/lucky/detail_bg.png) no-repeat center;
		background-size: contain;
		position: relative;

		.left {
			position: absolute;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 180px;
			height: 180px;
			top: 120px;
			left: 30px;

			img {
				max-width: 121px;
				height: 69px;
			}

			.text {
				color: #fff;
				font-size: 20px;
				margin-top: 20px;
			}
		}

		.center {
			//	 position: absolute;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 180px;
			height: 180px;
			margin: 120px auto 0px;
			//	 top: 120px;
			//	 right: 30px;

			img {
				max-width: 251px;
				height: 142px;
			}

			.text {
				color: #fff;
				margin-top: 0px;
				display: flex;

				.text1 {
					font-size: 45px;
					font-weight: bold;
					text-shadow: 0 0 5px #fff, 0 0 5px #fff;
				}

				.text2 {
					font-size: 21px;
					margin-left: 5px;
					margin-top: 23px;
					font-weight: bold;
					text-shadow: 0 0 5px #fff, 0 0 5px #fff;
				}
			}
		}

		.right {
			position: absolute;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 180px;
			height: 180px;
			top: 120px;
			right: 30px;

			img {
				width: 84px;
				height: 68px;
			}

			.text {
				color: #fff;
				font-size: 20px;
				margin-top: 20px;
			}
		}

		.name {
			background: url(@/assets/romimg/lucky/name_bg.png) no-repeat center;
			background-size: contain;
			width: 263px;
			height: 36px;
			color: #fff;
			font-size: 20px;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 72px auto 0px;
		}

		.rate-wrap {
			margin-top: 0px;

			.rate-btn-wrap {
				margin: 40px 85px 30px;
				height: 49px;
				display: flex;
				justify-content: space-between;
				align-items: center;

				.rate-btn-item {
					background: url(@/assets/romimg/lucky/btn_rate1.png) no-repeat center;
					background-size: contain;
					width: 90px;
					height: 41px;
					font-size: 20px;
					color: #a4a5b0;
					display: flex;
					justify-content: center;
					align-items: center;

					&.active {
						background: url(@/assets/romimg/lucky/btn_rate2.png) no-repeat
							center;
						background-size: contain;
						width: 98px;
						height: 49px;
						color: #171c2c;
					}
				}
			}

			.rate-progress-wrap {
				display: flex;
				justify-content: center;
				align-items: center;

				.slide {
					width: 527px;
					height: 32px;
					//	 margin-left: 20px;
					//	 margin-right: 20px;
					background: url(@/assets/romimg/lucky/slide_wrap_bg.png) no-repeat
						center;
					background-size: contain;
					padding: 0px 30px;
					margin-bottom: 5px;

					.el-slider__runway {
						background: hsla(0, 0%, 41.2%, 0);
						height: 32px;
						margin: 0;
					}

					.el-slider__bar {
						background: hsla(0, 0%, 100%, 0);
						height: 26px;
						background: url(@/assets/romimg/lucky/slide_bg.png);
						background-repeat: repeat-x;
						background-size: auto 100%;
						top: 3px;
					}

					.el-slider__button-wrapper {
						top: -10px;
						transform: translateX(-50%);
						background-color: transparent;
						text-align: center;
						-webkit-user-select: none;
						-moz-user-select: none;
						user-select: none;
						line-height: normal;
						border: none;
						z-index: 1;
						width: 25px;
						height: 49px;
						background-image: url(@/assets/romimg/lucky/slide_btn.png);
						background-repeat: no-repeat;
						background-size: 100% 100%;
					}

					.el-slider__button {
						display: none;
					}
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
		}
	}

	.start-btn-wrap {
		margin-top: 30px;
		position: relative;

		.start-btn {
			width: 686px;
			height: 76px;
			background-color: #eee131;
			text-align: center;
			line-height: 76px;
			color: #000;
			font-size: 28px;
			font-weight: bold;
			margin: 0 auto;
		}
	}

	.wq-wrap {
		display: flex;
		// justify-content: space-between;
		align-items: center;
		margin: 46px 0px;
		width: 688px;

		.wq-item {
			background: url(@/assets/romimg/lucky/wq_item1.png) no-repeat center;
			background-size: contain;
			width: 162px;
			height: 77px;
			display: flex;
			justify-content: center;
			align-items: center;
			color: #a4a5b0;
			flex-direction: column;
			font-size: 21px;
			margin-right: 13px;

			.price {
				display: flex;
				align-items: center;
				font-size: 26px;

				img {
					width: 22px;
					height: 22px;
					margin-top: 3px;
					margin-right: 3px;
				}
			}

			&.active {
				background: url(@/assets/romimg/lucky/wq_item2.png) no-repeat center;
				background-size: contain;
				color: #eee131;

				.price {
					color: #ffc608;
				}
			}
		}
	}

	.history-wrap {
		margin-left: 20px;
		width: 730px;
		position: relative;

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

			.drop-item {
				width: 710px;
				height: 110px;
				display: flex;
				align-items: center;
				background: url(@/assets/romimg/lucky/history_item1.png) no-repeat
					center;
				background-size: 99%;
				box-sizing: border-box;
				position: relative;
				margin: 0px;
				padding: 0px;

				.per {
					color: #fff;
					font-size: 22px;
					margin-left: 46px;
					margin-right: 39px;
					width: 80px;
					text-align: center;
				}

				p {
					display: block;
					width: 280px;
					font-size: 22px;
					color: #bed5ff;
					margin-left: 20px;
				}

				.goods-wrap {
					position: absolute;
					right: 6px;

					img {
						width: 71px;
						max-height: 69px;
						margin-right: 20px;
					}
				}

				&:nth-child(2n) {
					background: url(@/assets/romimg/lucky/history_item2.png) no-repeat
						center;
					background-size: 99%;
				}

				&.active {
					background: url(@/assets/romimg/lucky/history_item3.png) no-repeat
						center;
					background-size: 99%;

					.per {
						color: #eee131;
					}

					p {
						color: #ffe686;
					}
				}
			}

			.drop-detail-item {
				width: 710px;
				height: 216px;
				display: flex;
				align-items: center;
				flex-direction: column;
				background: url(@/assets/romimg/lucky/history_detail_item1.png)
					no-repeat center;
				background-size: 99%;
				box-sizing: border-box;
				position: relative;
				margin: 0px;
				padding: 0px;

				.his-top-wrap {
					width: 100%;
					display: flex;
					justify-content: space-between;
					position: relative;
					margin-top: 51px;
					align-items: center;

					.item-head-bg {
						background: url(@/assets/romimg/lucky/item_detail_bg2.png) no-repeat
							center;
						background-size: contain;
						width: 394px;
						height: 46px;
						position: relative;
						display: flex;
						align-items: center;
						color: #bed5ff;
						margin-left: 41px;

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
						margin-right: 23px;
					}
				}

				.his-bottom-wrap {
					display: flex;
					justify-content: space-between;
					width: 100%;
					margin-top: 35px;
					align-items: center;

					.per {
						color: #fff;
						font-size: 30px;
						margin-left: 46px;
						margin-right: 39px;
					}

					.goods-wrap {
						position: absolute;
						right: 6px;
						display: flex;
						align-items: center;

						.goods-item {
							display: flex;
							align-items: center;
							margin-right: 38px;

							img {
								max-width: 126px;
								max-height: 66px;
								margin-right: 18px;
								margin-left: 30px;
							}

							.price {
								color: #bed5ff;
								font-size: 30px;
							}
						}
					}
				}

				&:nth-child(2n) {
					background: url(@/assets/romimg/lucky/history_detail_item2.png)
						no-repeat center;
					background-size: 99%;
				}

				&.active {
					background: url(@/assets/romimg/lucky/history_detail_item3.png)
						no-repeat center;
					background-size: 99%;

					.item-head-bg {
						background: url(@/assets/romimg/lucky/item_detail_bg1.png) no-repeat
							center;
						background-size: contain;
					}

					.his-item-time {
						color: #cdaf66;
					}

					.per {
						color: #eee131;
					}

					p {
						color: #ffe686;
					}

					.goods-wrap {
						.goods-item {
							.price {
								color: #ffcb00;
							}
						}
					}
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
						height: 76px;
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
}
</style>
