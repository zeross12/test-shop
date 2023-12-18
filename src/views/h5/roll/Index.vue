<script setup>

import { onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import officialImage from "@/assets/romimg/roll/official.png";
import anchorImage from "@/assets/romimg/roll/anchor.png";
import fudaiImage from "@/assets/romimg/common/fudai.png";
import Tabs from "@/components/h5/home/Tabs.vue";
import { getRollList, getMyRollList } from "@/network/api/roll";
import { GoodImageBgType } from "@/util/util";
import { tokenName } from "../../../config";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import Currency from "@/components/h5/common/Currency.vue";import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const router = useRouter();
const store = useStore();
const pager = ref({ pageIndex: 1, limit: 10 });
const loading = ref(false);
const rollLoading = ref(false);
const finished = ref(false);
const rollList = ref([]);

const tabType = ref(1); //1-all 2-me

const downactive = ref(false);
const downHeight = ref(0);
const downList = ref([
	{ text: t('battle.inProgress'), id: 1 },
	{ text: t('battle.notStarted'), id: 2 },
]);
const rollState = ref({ text: t('battle.inProgress'), id: 1 });

const keyword = ref(""); //搜索关键字

const roomListRef = ref([]);

onMounted(() => {
	getRollRoom();
});

watch(
	() => store.state.openResultRollId,
	(newRollId, preRollId) => {
		pager.value.pageIndex = 1;
		keyword.value = "";
		finished.value = false;
		getRollRoom();
	}
);

async function getRollRoom() {
	let params = {};
	params.page = pager.value.pageIndex;
	params.limit = pager.value.limit;
	params.roomState = rollState.value.id;
	params.platformId = store.state.platformId;
	if (keyword.value) {
		params.roomName = keyword.value;
	}
	rollLoading.value = true;
	let res;
	if (tabType.value == 1) {
		res = await getRollList(params);
	} else if (tabType.value == 2) {
		res = await getMyRollList(params);
	}

	if (res && res.code == 0) {
		let items = res.data.items || [];
		let preList = rollList.value;
		if (res.data.page == 1) {
			preList = [];
		}
		rollList.value = [...preList, ...items];
		// 加载状态结束
		loading.value = false;

		// 数据全部加载完成
		if (items.length < res.data.limit) {
			finished.value = true;
		}
	} else {
		loading.value = false;
		finished.value = true;
	}
	rollLoading.value = false;
}

function onClickTab(type) {
	if (type == 2 && !localStorage.getItem(tokenName)) {
		// store.commit("setSignView", true);
		router.push("/m/sign");
		return;
	}

	if (type == 1) {
		downList.value = [
			{ text: t('battle.inProgress'), id: 1 },
			{ text: t('battle.notStarted'), id: 2 },
		];
	} else {
		downList.value = [
			{ text: t('battle.inProgress'), id: 1 },
			{ text: t('battle.finished'), id: 2 },
		];
	}
	tabType.value = type;
	pager.value.pageIndex = 1;
	keyword.value = "";
	rollState.value = { text: t('battle.inProgress'), id: 1 };
	finished.value = false;
	getRollRoom();
}

function onClickHelp() {
	let data = {
		show: true,
		html: t('battle.rollRule'),
	};
	store.commit("setHowPlay", data);
}

function onClickDown() {
	if (downHeight.value == "auto") {
		downHeight.value = 0;
		downactive.value = false;
	} else {
		downHeight.value = "auto";
		downactive.value = true;
	}
}

function onClickDownItem(item) {
	rollState.value = item;
	downHeight.value = 0;
	downactive.value = false;
	pager.value.pageIndex = 1;
	finished.value = false;
	getRollRoom();
}

function onClickSearch() {
	pager.value.pageIndex = 1;
	finished.value = false;
	getRollRoom();
}

function onLoad() {
	if (rollLoading.value) return;
	pager.value.pageIndex += 1;
	getRollRoom();
}

function onClickItem(item) {
	if (!localStorage.getItem(tokenName)) {
		router.push("/m/sign");
		return;
	}
	router.push({
		path: "/m/roll_detail",
		query: {
			rollId: item.id,
		},
	});
}

function onCountdown(date, index) {
	if (date.days == 0 && date.hours == 0) {
		roomListRef.value[index].className = "roll-item-wrap active";
		if (date.milliseconds == 0 && date.minutes == 0) {
			roomListRef.value[index].className = "roll-item-wrap";
		}
	}
}

//roll房类别(官方/主播)
function getRollType(v) {
	if (v == 2) {
		return anchorImage;
	} else {
		return officialImage;
	}
}

function getImageBg(item) {
	let level = item.goodsLevel;
	if (item.goodsType == 2) {
		level = 1;
	}
	return store.getters.getGoodsBgImage(GoodImageBgType.roll, level);
}

function getImageIcon(item) {
	if (item.goodsType == 2) {
		return fudaiImage;
	} else {
		return item.iconUrl;
	}
}

function judgeLotteryTime(item) {
	let offset = new Date(item.lotteryTime).getTime() - new Date().getTime();
	return offset < 3600000;
}

//倒计时过滤
function TimeFilter(time) {
	let date = new Date(time);
	let curTime = new Date();
	return date.getTime() - curTime.getTime();
}

const tabItems = ref([t('battle.allRoom'), t('battle.myRoom')]);
function tabChangedEvent(event) {
	tabType.value = event + 1;
	onClickTab(tabType.value);
}

function onFinish(item) {}
</script>

<template>
	<div id="roll" class="min-wrap-height">
		<TopTitleBack title="ROLL"></TopTitleBack>
		<Tabs :items="tabItems" @tabChangedEvent="tabChangedEvent"></Tabs>
		<div class="roll-top">
			<div class="bag-sort-wrap">
				<p class="drop-down-title">{{ t('common.status') }}</p>
				<div class="drop-down">
					<div
						class="sort-text hide"
						:class="{ active: downactive }"
						@click="onClickDown"
					>
						{{ rollState.text }}<img src="@/assets/romimg/common/arrow_down.png" alt="" />
					</div>
					<div class="down" :style="'height:' + downHeight">
						<div
							class="sort-item"
							v-for="(item, index) in downList"
							:key="index"
							@click="onClickDownItem(item)"
						>
							{{ item.text }}
						</div>
					</div>
				</div>
				<div class="search">
					<input
						type="text"
						v-model="keyword"
						:placeholder="t('battle.enterRoom')"
						@keyup.enter="onClickSearch"
					/>
					<!-- <div class="search_btn" @click="onClickSearch">
						<img src="@/assets/romimg/common/search.png" alt="" />
					</div> -->
					<div class="ic_search_container" @click="onClickSearch()">
						<span class="icon iconfont">&#xe643;</span>
					</div>
				</div>
			</div>
		</div>
		<van-list
			v-model="loading"
			:finished="finished"
			:finished-text="t( 'common.noMore' )"
			@load="onLoad"
			:immediate-check="false"
		>
			<div class="roll-list-wrap">
				<div
					class="roll-item-wrap"
					v-for="(item, index) in rollList"
					:key="index"
					ref="roomListRef"
				>
					<div class="roll-data-wrap">
						<div class="roll-data-top" :class="{ anchor: item.rollType == 2 }">
							<!-- <img
								v-if="item.rollType == 2 && item.anchorUser"
								:src="item.anchorUser.avater"
								alt=""
							/> -->
							<img
								v-if="item.rollType == 2 && item.anchorUser"
								src="@/assets/romimg/roll/anchor_icon.png"
								alt=""
							/>
							<img
								v-else
								src="@/assets/romimg/roll/roll_detail_logo.png"
								alt=""
							/>

							<div class="desc" :class="{ active: item.rollType == 2 }">
								<!-- {{ item.rollType == 2 ? t('battle.anchor') : t('battle.official') }} -->
							</div>
							<div class="roll-name hide">{{ item.rollName }}</div>
						</div>
						<!-- <div class="roll-type">
							<img :src="getRollType(item.rollType)" alt="" />
						</div> -->
					</div>

					<div class="roll-info-wrap">
						<div class="roll-info">
							<div class="roll-info-item">
								<p>{{ t('battle.pricePrize') }}</p>
								<!-- <p>{{ item.priceNum }}</p> -->
								<div class="price">{{ item.priceNum }}</div>
								<!-- <Currency :currency="item.priceNum"></Currency> -->
							</div>
							<div class="roll-info-item">
								<p>{{ t('battle.goodsNameTitle') }}</p>
								<p>{{ item.goodsNum }}</p>
							</div>
							<div class="roll-info-item">
								<p>{{ t('common.users') }}</p>
								<p>{{ item.userNum }}</p>
							</div>
						</div>
						<div class="goods-list">
							<div
								class="goods-item"
								style="background-color: #131528"
								v-for="(value, index) in item.goodsItems"
								:key="index"
								:style="`background-image: url(` + getImageBg(value) + `)`"
							>
								<img :src="getImageIcon(value)" :alt="value.goodsName" />
							</div>
						</div>
					</div>

					<div class="roll-content-wrap" v-if="false">
						<div class="open-time">
							<van-count-down
								:time="TimeFilter(item.lotteryTime)"
								@finish="onFinish(item)"
							>
								<template #default="timeData">
									<div class="count-item">
										<span class="count-bk">{{
											timeData.days >= 10 ? timeData.days : "0" + timeData.days
										}}</span>
										<div class="count-txt">{{ t('timebox.days') }}</div>
									</div>
									<div class="count-item">
										<span class="count-bk">{{
											timeData.hours >= 10
												? timeData.hours
												: "0" + timeData.hours
										}}</span>
										<div class="count-txt">{{ t('timebox.hours') }}</div>
									</div>
									<div class="count-item">
										<span class="count-bk">{{
											timeData.minutes >= 10
												? timeData.minutes
												: "0" + timeData.minutes
										}}</span>
										<div class="count-txt">{{ t('timebox.min') }}</div>
									</div>
									<div class="count-item">
										<span class="count-bk">{{
											timeData.seconds >= 10
												? timeData.seconds
												: "0" + timeData.seconds
										}}</span>
										<div class="count-txt">{{ t('timebox.sec') }}</div>
									</div>
								</template>
							</van-count-down>
						</div>
					</div>
					<div class="roll-btn-wrap" @click="onClickItem(item)">
						<span class="icon iconfont">&#xe63c;</span>
						<span>{{ t('battle.viewRollRoom') }}</span>
					</div>
					<div class="award-time">
						{{ t('battle.rewardTime') }}: {{ item.lotteryTime.substring(0, 16) }}
					</div>
				</div>
			</div>
		</van-list>
	</div>
</template>

<style lang="scss">
#roll {
	box-sizing: border-box;
	width: 100%;

	#tabs{
		// width: 500px;
		.tab-item{
			width: 330px;
			font-size: 25px;
		}
	}

	.roll-top {
		width: 710px;
		margin: auto;

		padding-top: 10px;
		box-sizing: border-box;

		.bag-sort-wrap {
			width: 100%;
			height: 70px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			box-sizing: border-box;
			gap: 12px;

			.drop-down-title {
				color: #b4b8cd;
				font-size: 26px;
				font-style: normal;
				font-weight: 400;
				line-height: normal;
				width: 120px;
			}

			.drop-down {
				box-sizing: border-box;
				z-index: 3;
				// margin-left: 18px;
				.sort-text {
					border-radius: 6px;
					display: flex;
					// justify-content: center;
					align-items: center;
					width: 200px;
					height: 70px;
					border: 2px solid #2d2d67;
					color: #b4b8cd;
					font-size: 22px;
					font-style: normal;
					font-weight: 300;
					line-height: normal;
					box-sizing: border-box;
					padding-left: 12px;

					img {
						margin-left: 4pt;
						width: 16px;
						height: 16px;
					}

					&.active {
						img {
							transform: rotate(180deg);
						}
					}
				}
				.down {
					position: absolute;
					width: 220px;
					left: 92px;
					top: 480px;
					// border: 2px solid #2d2d67;
					border-radius: 6px;
					box-sizing: border-box;
					transition: 0.2s;
					z-index: 9;
					background: #2d2d67;
					overflow: hidden;
					color: #b4b8cd;

					.sort-item {
						width: 100%;
						text-align: center;
						line-height: 70px;
						font-size: 26px;
						background: transparent;
					}
				}
			}

			.search {
				width: 340px;
				display: flex;
				align-items: center;
				border-radius: 6px;
				border: 2px solid #2d2d67;
				height: 70px;
				// margin-left: 20px;
				box-sizing: border-box;

				input {
					flex: 1;
					height: 100%;
					box-sizing: border-box;
					background: transparent;
					text-indent: 20px;
					font-weight: 400;
					padding-right: 10px;
					color: #b4b8cd;
					border: transparent;

					&::placeholder {
						color: var(--info-input-font-color);
					}
				}

				.ic_search_container {
					display: flex;
					align-items: center;
					box-sizing: border-box;

					.icon.iconfont {
						font-size: 28px;
						color: #626476;
						padding-right: 20px;
					}
				}
			}
		}
	}

	.roll-list-wrap {
		width: 710px;
		box-sizing: border-box;
		margin: 20px;
		margin-top: 10px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;

		box-sizing: border-box;
		.roll-item-wrap {
			display: flex;
			flex-direction: column;
			align-items: center;
			box-sizing: border-box;
			//	 position: relative;

			width: 348px;
			height: 554px;
			margin-bottom: 20px;
			//	 padding: 0px 25px;

			border: 1px solid #2d2d67;
			background: #15172c;
			box-shadow: 0px 0px 37.956241607666016px 0.6433261036872864px
				rgba(41, 34, 139, 0.15) inset;

			.roll-data-wrap {
				display: flex;
				width: 100%;
				.roll-data-top {
					width: 348px;
					height: 202px;
					background: url(@/assets/romimg/roll/roll_item_bg.png) center
						no-repeat;
					background-size: cover;
					text-align: center;

					img {
						width: calc( 96px / 74px * 74px );
						height: calc( 96px / 74px * 89px );//96px;
						margin: auto;
						margin-top: 20px;
						border-radius: 20px;
					}
					.roll-name {
						box-sizing: border-box;
						width: 90%;
						text-align: center;
						padding: 0 10px;
						color: #edeef3;
						font-weight: 300;
						font-size: 26px;
						margin: auto;
						margin-top: -5px;
					}
					.desc {
						margin: auto;
						position: relative;
						width: 68px;
						top: -24px;
						display: flex;
						// width: 80px;
						height: 36px;
						justify-content: center;
						align-items: center;
						color: #fff;
						text-align: center;

						font-size: 24px;
						justify-content: center;
						display: flex;
						font-style: normal;
						font-weight: 400;
						text-transform: uppercase;
						border-radius: 8px;
						background: transparent;// #cb8928;
						// &.active {
						// 	background: #7349ca;
						// }
					}

					// &.anchor {
					// 	background: url(@/assets/romimg/roll/roll_item_2_bg.png) center
					// 		no-repeat;
					// 	background-size: contain;
					// }
				}

				.roll-type {
					width: 78px;
					height: 27px;

					img {
						width: 100%;
						height: 100%;
					}
				}
			}

			.roll-info-wrap {
				width: 348px;
				margin-top: 14px;
				box-sizing: border-box;

				.roll-info {
					display: flex;
					align-items: center;
					justify-content: space-around;
					box-sizing: border-box;
					.roll-info-item {
						display: flex;
						align-items: center;
						flex-direction: column;
						font-size: 20px;
						color: #ffffff;
						line-height: 38px;
						font-weight: 300;
						box-sizing: border-box;

						p {
							color: #fffefe;
							text-align: center;
							font-size: 24px;
							font-style: normal;
							font-weight: 300;
							margin-bottom: 2px;
						}

						img {
							width: 24px;
							height: 24px;
						}

						.span1 {
							font-size: 24px;
							color: #75dc9e;
							font-weight: 700;
						}
						.span2 {
							font-size: 20px;
							color: #75dc9e;
							font-weight: 700;
						}

						.price {
							display: flex;
							align-items: center;
							justify-content: center;
							color: #75dc9e;
							font-weight: 700;
							font-size: 24px;
							// span {
							//	 transform: scale(0.8);
							//	 transform-origin: 0 0;
							//	 margin-top: 8px;
							// }
						}

						.icon-count {
							font-weight: 700;
						}
						.icon-pep {
							font-weight: 700;
						}
					}
				}

				.goods-list {
					display: flex;
					align-items: center;
					justify-content: space-between;
					width: 100%;
					padding: 0 25px;
					box-sizing: border-box;
					overflow: hidden;
					white-space: nowrap;
					margin-top: 4px;
					height: 108px;

					.goods-item {
						display: inline-block;
						position: relative;
						background-size: cover;
						background-repeat: no-repeat;
						background-position: center;
						margin: auto 5px;
						width: 104px;
						height: 108px;
						// background: url(@/assets/romimg/roll/box_bg.png) center no-repeat;
						// background-size: 85px 95px;
						img {
							position: absolute;
							max-width: 74%;
							max-height: 74%;
							margin: auto;
							top: 0;
							bottom: 0;
							left: 0;
							right: 0;
						}

						&:last-child {
							margin-right: 0px;
						}
					}
				}
			}

			.roll-content-wrap {
				display: flex;
				flex-direction: column;
				width: 660px;
				height: 256px;
				background: #202020;
				margin-top: 20px;
				padding: 0 22px;
				box-sizing: border-box;

				.open-time {
					.van-count-down {
						display: flex !important;
						justify-content: space-between;
						align-items: center;
						margin-top: 13px;

						.count-item {
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: center;
							width: 138px;
							height: 62px;
							background: #2e2d2d;
							font-size: 20px;
							color: #ffffff;

							.count-bk {
								margin-bottom: 2px;
							}

							.count-txt {
							}
						}
					}
				}
			}

			.roll-btn-wrap {
				// margin-top: 4px;
				display: flex;
				align-items: center;
				justify-content: center;
				box-sizing: border-box;
				// width: 310px;
				// height: 57px;

				width: 325px;
				height: 90px;

				font-size: 24px;
				font-weight: 700;
				color: #fff;
				border-radius: 6px;
				background: #4b56bc;

				span:first-child {
					margin-right: 5px;
					font-size: 20px;
				}
				span:last-child {
				}
			}

			.award-time {
				width: 100%;
				padding-left: 20px;
				box-sizing: border-box;
				text-align: left;
				color: #8d91ae;
				font-weight: 300;
				font-size: 24px;
				margin-top: 10px;
				margin-bottom: 10px;
			}
		}
	}
}
</style>
