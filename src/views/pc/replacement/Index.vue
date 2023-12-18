<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, watch, computed } from "vue";
import { useStore } from "vuex";

import { useRouter } from "vue-router";
import { getExchangeGoods, exchangeGoods, userRucksackWeaponsExchange } from "@/network/api/extend";
import { GoodImageBgType } from "@/util/util";
import { omit } from "lodash";
import { getListSum } from "@/util/get-list-sum";
import Result from "./Result.vue";
import BigNumber from "bignumber.js";


const store = useStore();
const router = useRouter();
const bagGoodsTooltip = ref('');
const replaceGoodsTooltip = ref('');
const replaceGoodsList = ref([]);

const selectList = ref([]);
const selectReplaceList = ref([]);

const goodsList = ref([]); //背包列表
const rucksackGoodsReq = ref({
	page: 1,
	limit: 50,
	sortType: 1,
	loading: false,
	finished: true,
});
const getReplaceGoodsReq = ref({
	page: 1,
	limit: 48,
	sortType: 1,
	loading: false,
	goodsName: undefined,
	finished: false,
});
const animation = ref("animation"); //动画
const libraryLoading = ref(true); //加载


const selectReplacePrice = computed(() =>
	getListSum(selectReplaceList.value, "price")
);

// 原始估值
const totalPrice = computed(() => getListSum(selectList.value, "price"));
// 手续估值
const profitRateTotalPrice = computed(() => BigNumber(totalPrice.value).multipliedBy(
	(100 - (store.getters.getConfigItem("ExchangeGoodsProfitRate") || 0)) / 100
).dp(2).toFixed(2));


const resultRef = ref(null);
const allChoose = ref(false);

onMounted(() => {
	getBagGoods();
	getRepGoods();
});

async function getBagGoods() {
	try {
		rucksackGoodsReq.value.loading = true;
		// 接口不支持分页，分页逻辑先保留
		const res = await userRucksackWeaponsExchange(
			omit(rucksackGoodsReq.value, ["loading", "finished"])
		);
		if (res.code === 0) {
			if (rucksackGoodsReq.value.page === 1) {
				goodsList.value = [];
			}
			let items = (res.data.items || []);
			goodsList.value = [...goodsList.value, ...items];

			// 数据全部加载完成
			if (res.data.items == null || res.data.items.length < res.data.limit) {
				rucksackGoodsReq.value.finished = true;
			}
		} else {
			rucksackGoodsReq.value.finished = true;
		}
		libraryLoading.value = false;
	} finally {
		rucksackGoodsReq.value.loading = false;
	}
}

function refreshGetBagGoods() {
	rucksackGoodsReq.value.finished = false;
	rucksackGoodsReq.value.page = 1;
	goodsList.value = [];
	getBagGoods();
}

//触底加载
async function onLoad() {
	if (rucksackGoodsReq.value.loading || rucksackGoodsReq.value.finished) {
		return;
	}
	rucksackGoodsReq.value.page += 1;
	await getBagGoods();
}

async function onLoadReplaceList() {
	if (getReplaceGoodsReq.value.loading || getReplaceGoodsReq.value.finished) {
		return;
	}
	getReplaceGoodsReq.value.page += 1;
	await getRepGoods();
}

async function getRepGoods() {
	try {
		getReplaceGoodsReq.value.loading = true;
		const res = await getExchangeGoods(
			{ ...omit(getReplaceGoodsReq.value, ["loading", "finished"]), goodsIds: selectList.value.map((v) => v.id) }
		);
		if (res.code === 0) {
			if (getReplaceGoodsReq.value.page === 1) {
				replaceGoodsList.value = [];
			}
			let items = res.data.items || [];
			replaceGoodsList.value = [...replaceGoodsList.value, ...items];

			// 数据全部加载完成
			if (res.data.items == null || res.data.items.length < res.data.limit) {
				getReplaceGoodsReq.value.finished = true;
			}
		} else {
			getReplaceGoodsReq.value.finished = true;
		}
		libraryLoading.value = false;
	} finally {
		getReplaceGoodsReq.value.loading = false;
	}
}

//全选
function handleAllChoose() {
	allChoose.value = !allChoose.value;
	const choose = allChoose.value;
	if (choose) {
		selectList.value = [...goodsList.value];
		selectList.value.forEach((item) => {
			item.choose = choose;
		});
	} else {
		selectList.value.forEach((item) => {
			item.choose = choose;
		});
		selectList.value = [];
	}
	sortGoodsList();
	clearSelectReplaceList();
	onSearchReplace();
}

function chooseItem(item) {
	if (item.choose) {
		delete item.choose;
		let itemIndex = selectList.value.findIndex((v) => {
			return v.id == item.id;
		});
		selectList.value.splice(itemIndex, 1);
	} else {
		let key = "choose";
		let value = true;
		item[key] = value;
		selectList.value.push(item);
	}
	sortGoodsList();
	clearSelectReplaceList();
	onSearchReplace();
}

function chooseReplaceItem(item) {
	if (item.choose) {
		delete item.choose;
		let itemIndex = selectReplaceList.value.findIndex((v) => {
			return v.id == item.id;
		});
		selectReplaceList.value.splice(itemIndex, 1);
	} else {
		const ExchangeGoodsMaxNum = Number(store.getters.getConfigItem("ExchangeGoodsMaxNum") || 5)
		if (selectReplaceList.value.length >= ExchangeGoodsMaxNum) {
			return Warn({ offset: 100, message: "置换数量超出最大限制", customClass: 'error' })
		}
		const sum = Number(getListSum([...selectReplaceList.value, item], "price"))
		if (sum > Number(profitRateTotalPrice.value)) {
			return Warn({ offset: 100, message: '置换物品估值超过背包物品估值', customClass: 'error' })
		}
		let key = "choose";
		let value = true;
		item[key] = value;
		selectReplaceList.value.push(item);
	}
	sortReplaceGoodsList();
}

function onSearchReplace() {
	getReplaceGoodsReq.value.finished = false;
	getReplaceGoodsReq.value.page = 1;
	getRepGoods();
}

watch(
	getReplaceGoodsReq,
	(newkeyword) => {
		if (newkeyword.goodsName === "") {
			newkeyword.goodsName = undefined;
			onSearchReplace();
		}
	},
	{
		deep: true,
	}
);

watch(
	[selectReplaceList, selectList],
	() => {
		bagGoodsTooltip.value = ''
		replaceGoodsTooltip.value = ''
	},
	{
		deep: true,
	}
);

function sortGoodsList() {
	goodsList.value.sort((a, b) => {
		if (a.choose) {
			if (b.choose) {
				return Number(b.price) - Number(a.price);
			} else {
				return -1;
			}
		} else {
			if (b.choose) {
				return 1;
			} else {
				return Number(b.price) - Number(a.price);
			}
		}
	});
}

function sortReplaceGoodsList() {
	replaceGoodsList.value.sort((a, b) => {
		if (a.choose) {
			if (b.choose) {
				return Number(b.price) - Number(a.price);
			} else {
				return -1;
			}
		} else {
			if (b.choose) {
				return 1;
			} else {
				return Number(b.price) - Number(a.price);
			}
		}
	});
}

//置换
async function onClickTaiHuan() {
	if (!selectReplaceList.value.length) {
		return Warn({ offset: 100, message: '请选择需要置换的的饰品', customClass: 'error' })
	}
	// 置换价格上限不能超过	 profitRateTotalPrice
	if (Number(selectReplacePrice.value) > Number(profitRateTotalPrice.value)) {
		return Warn({ offset: 100, message: '置换饰品估值超过背包饰品估值', customClass: 'error' })
	}
	// 置换价格下限不能超过	totalPrice
	if (Number(selectReplacePrice.value) < BigNumber(totalPrice.value).multipliedBy(0.9).toNumber()) {
		return Warn({ offset: 100, message: '置换饰品估值低于背包饰品估值过多，请重新选择', customClass: 'error' })
	}
	resultRef.value.showReuslt(selectReplaceList.value);
}

function getImageBg(item) {
	let level = item.goodsLevel;
	if (item.goodsType == 2) {
		level = 1;
	}
	return store.getters.getGoodsBgImage(GoodImageBgType.replace, level);
}

async function onExchangeGoods() {
	const res = await exchangeGoods({
		goodsIds: selectList.value.map((v) => v.id),
		exchangeGoodsIds: selectReplaceList.value.map((v) => v.id),
	});
	if (res.code === 0) {
		Success({ offset: 100, message: res.message });
		resultRef.value.onClose();
		clearSelectReplaceList()
		selectList.value = [];
		refreshGetBagGoods();
		onSearchReplace();
		allChoose.value = false;
	}
}

function clearSelectReplaceList() {
	selectReplaceList.value.forEach((item) => {
		item.choose = false;
	});
	selectReplaceList.value = [];
}
</script>

<template>
	<div id="pc-replacement">
		<div class="replacement-wrap">
			<div class="goods-info-wrap">
				<div class="goods-info-item">
					<p class="item-title">可置换饰品</p>
					<div class="info-item">
						<div class="search_top">
							<p>请选择您的目标饰品</p>
							<div class="search">
								<input type="text" v-model="getReplaceGoodsReq.goodsName" placeholder="请搜索" />
								<div class="search_btn" @click="onSearchReplace">
									<img src="@/assets/romimg/common/search2.png" alt="" />
								</div>
							</div>
						</div>
						<div>
							<div class="replacement-scroll-list">
								<transition name="fade">
									<van-list v-model="getReplaceGoodsReq.loading" :finished="getReplaceGoodsReq.finished"
										finished-text="" @load="onLoadReplaceList" :immediate-check="false">
										<div class="contract-list">
											<transition-group :name="animation">
												<div class="contract-list-item" v-for="(item, index) in replaceGoodsList"
													:key="item.id" :style="`background-image: url(` + getImageBg(item) + `)`
														" @click="chooseReplaceItem(item, index)">
													<div class="item-sel-wrap">
														<img v-show="item.choose" src="@/assets/romimg/contract/choose.png"
															alt="" />
													</div>
													<div class="pic">
														<img :src="item.iconUrl" alt="" />
													</div>
													<p class="hide"
														@click.stop="replaceGoodsTooltip == item.id ? replaceGoodsTooltip = '' : replaceGoodsTooltip = item.id">
														{{ item.goodsName }}</p>
													<div class="item-price">
														<img src="@/assets/romimg/common/gold.png" alt="" />{{
															item.price
														}}
													</div>
													<div class="name-text" v-if="replaceGoodsTooltip == item.id">{{
														item.goodsName }}
													</div>
												</div>
											</transition-group>
										</div>
									</van-list>
								</transition>
							</div>
							<transition name="fade">
								<div class="mybag_list_tip" v-show="replaceGoodsList.length == 0">
									<p v-if="getReplaceGoodsReq.goodsName">搜索为空</p>
								</div>
							</transition>
						</div>
					</div>
				</div>
				<div class="combine">
					<div class="combine_main" @click="onClickTaiHuan">
						<img class="icon1" src="@/assets/romimg/contract/icon1.png" alt="" />
						<img class="combine-btn" src="@/assets/romimg/contract/btn.png" alt="" />
						<img class="icon2" src="@/assets/romimg/contract/icon2.png" alt="" />
						<p>置换</p>
					</div>
				</div>
				<div class="goods-info-item">
					<p class="item-title">已选择饰品</p>
					<div class="info-item">
						<div class="total-price">
							估值: <span>{{ selectReplacePrice }}</span>
						</div>
						<div>
							<div class="replacement-scroll-list" v-if="selectReplaceList.length">
								<van-list finished-text="" :immediate-check="false">
									<div class="contract-list">
										<div class="contract-list-item" v-for="(item, index) in selectReplaceList"
											:key="item.id" :style="`background-image: url(` + getImageBg(item) + `)`"
											@click="chooseReplaceItem(item, index)">
											<div class="item-sel-wrap">
												<img v-show="item.choose" src="@/assets/romimg/contract/choose.png"
													alt="" />
											</div>
											<div class="pic">
												<img :src="item.iconUrl" alt="" />
											</div>
											<p class="hide"
												@click.stop="replaceGoodsTooltip == item.id ? replaceGoodsTooltip = '' : replaceGoodsTooltip = item.id">
												{{ item.goodsName }}</p>
											<div class="item-price">
												<img src="@/assets/romimg/common/gold.png" alt="" />{{
													item.price
												}}
											</div>
											<div class="name-text" v-if="replaceGoodsTooltip == item.id">{{
												item.goodsName }}
											</div>
										</div>
									</div>
								</van-list>
							</div>
							<transition name="fade">
								<div class="mybag_list_tip" v-show="selectReplaceList.length == 0">
									<p>暂无选中饰品</p>
								</div>
							</transition>
						</div>
					</div>
				</div>
			</div>
			<div class="mybag">
				<div class="title">背包饰品</div>
				<div class="mybag_main">
					<div class="mybag_operation">
						<div class="total-price">
							估值: <span>{{ totalPrice }}</span>
						</div>
						<div class="onekey" @click="handleAllChoose">
							{{ allChoose ? "取消全选" : "全选" }}
						</div>

					</div>
					<div class="mybag_list_box">
						<p class="tip"></p>
						<van-loading color="#FBFA02" size="50" v-show="libraryLoading" />
						<div class="mybag_list_box_main" v-show="!libraryLoading">
							<template v-if="goodsList.length > 0">
								<transition name="fade">
									<van-list v-model="rucksackGoodsReq.loading" :finished="rucksackGoodsReq.finished"
										finished-text="" :immediate-check="false">
										<div class="bag-list">
											<transition-group :name="animation">
												<div class="bag-list-item" v-for="(item, index) in goodsList" :key="item.id"
													:style="`background-image: url(` + getImageBg(item) + `)`
														" @click="chooseItem(item, index)">
													<div class="item-sel-wrap">
														<img v-show="item.choose" src="@/assets/romimg/contract/choose.png"
															alt="" />
													</div>
													<div class="pic">
														<img :src="item.iconUrl" alt="" />
													</div>
													<p class="hide"
														@click.stop="bagGoodsTooltip == item.id ? bagGoodsTooltip = '' : bagGoodsTooltip = item.id">
														{{ item.goodsName }}</p>
													<div class="item-price">
														<img src="@/assets/romimg/common/gold.png" alt="" />{{ item.price }}
													</div>
													<div class="name-text" v-if="bagGoodsTooltip == item.id">{{
														item.goodsName }}
													</div>
												</div>
											</transition-group>
										</div>
									</van-list>
								</transition>
							</template>
							<transition name="fade">
								<div class="mybag_list_tip" v-show="goodsList.length == 0">
									<p>
										没有饰品<span @click="router.push('/m')">去获取饰品</span>
									</p>
								</div>
							</transition>
						</div>
					</div>
				</div>
			</div>
		</div>
		<Result ref="resultRef" @onOk="onExchangeGoods"></Result>
	</div>
</template>

<style lang="scss">
#pc-replacement {
	width: 1414px;
	margin: 0 auto;
	box-sizing: border-box;
	overflow: hidden;
	color: #fff;

	.replacement-scroll-list {
		width: 100%;
		height: 100%;
		// overflow-y: auto;
		// overflow-x: hidden;
		position: relative;
		box-sizing: border-box;

		// &::-webkit-scrollbar {
		//	 display: none;
		// }
	}


	.replacement-wrap {
		display: flex;
		flex-direction: column;
		position: relative;
		align-items: center;
		width: 100%;
		margin-bottom: 50px;
		box-sizing: border-box;
		margin-top: 24px;

		.goods-info-wrap {
			display: flex;
			align-items: center;
			justify-content: space-between;
			box-sizing: border-box;
			width: 100%;

			.goods-info-item {
				display: flex;
				flex-direction: column;
				box-sizing: border-box;

				.item-title {
					font-size: 20px;
					color: #FBFA02;
				}

				.info-item {
					display: flex;
					flex-direction: column;
					width: 523px;
					height: 574px;
					border: 4px solid #FBFA02;
					box-sizing: border-box;
					position: relative;
					margin-top: 18px;
					padding: 0 18px;

					.search_top {
						display: flex;
						align-items: center;
						justify-content: space-between;
						margin: 15px auto;
						font-size: 16px;
						color: #fff;
						width: 100%;
						box-sizing: border-box;

						.search {
							width: 279px;
							height: 50px;
							border: 2px solid #00f0ff;
							position: relative;
							box-sizing: border-box;

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
								font-size: 16px;
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

					.total-price {
						font-size: 16px;
						color: #ffffff;
						margin: 15px auto;
						width: 100%;
						text-align: right;

						span {
							color: #fbfa02;
						}
					}

				}
			}

		}

		.ava-wrap {
			width: 695px;
			border: 2px solid #fbfa02;
			padding: 0 12px;
			box-sizing: border-box;
			overflow: hidden;
			margin-top: 30px;

			.ava-tip {
				display: flex;
				justify-content: space-between;
				font-size: 20px;
				margin-top: 25px;
				margin-bottom: 15px;
				color: #fff;

				span {
					color: #fbfa02;
				}
			}

			.ava-list-box {
				width: 100%;
				height: 592px;
				margin-top: 25px;
				overflow: hidden;
				position: relative;
				box-sizing: border-box;

				.van-loading {
					position: absolute;
					left: 0;
					top: 0;
					width: 100%;
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
				}

				.ava-list-box-main {
					width: 100%;
					height: 100%;
					position: relative;

					.available-list-tip {
						width: 100%;
						height: 100%;
						position: absolute;
						left: 0;
						top: 0;
						display: flex;
						justify-content: center;
						align-items: center;

						font-size: 38px;
						padding-bottom: 100px;
						box-sizing: border-box;
					}
				}
			}
		}

		.combine {
			width: 272px;

			.combine_main {
				width: 272px;
				height: 64px;
				margin: 0 auto;
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;

				.icon1 {
					position: absolute;
					left: 50%;
					transform: translateX(-50%);
					bottom: 25px;
					width: 156px;
				}

				.combine-btn {
					position: absolute;
					width: 100%;
					height: 100%;
				}

				.icon2 {
					position: relative;
					width: 31px;
					margin-right: 14px;
				}

				p {
					font-size: 27px;
					font-weight: bold;
					color: #010101;
					position: relative;
				}
			}
		}
	}

	.mybag {
		margin-top: 38px;
		box-sizing: border-box;
		background: url(@/assets/pcimg/replace/bg3.png) no-repeat center;
		background-size: contain;
		width: 1414px;
		height: 617px;
		position: relative;

		.title {
			font-size: 28px;
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			top: -18px;
		}

		.mybag_main {
			width: 1414px;
			height: 617px;
			overflow: hidden;
			box-sizing: border-box;
			padding: 0 18px;

			.mybag_operation {
				height: 56px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-top: 25px;

				.onekey {
					width: 142px;
					height: 56px;
					border: 2px solid #FBFA02;
					box-sizing: border-box;
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 22px;
					cursor: pointer;

					&:active {
						color: #FBFA02;
					}
				}

				.total-price {
					font-size: 16px;
					color: #ffffff;

					span {
						color: #fbfa02;
					}
				}

			}

			.mybag_list_box {
				width: 100%;
				height: 505px;
				margin-top: 10px;
				position: relative;

				.van-loading {
					position: absolute;
					left: 0;
					top: 0;
					width: 100%;
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
				}

				.mybag_list_box_main {
					width: 100%;
					height: 100%;
					overflow-y: auto;
					overflow-x: hidden;
					position: relative;

					.mybag_list_tip {
						position: absolute;
						left: 0;
						top: 0;
						width: 100%;
						height: 100%;
						display: flex;
						justify-content: center;
						align-items: center;
						padding-bottom: 100px;
						box-sizing: border-box;

						p {

							font-size: 38px;
							display: flex;
							justify-content: center;
							align-items: center;

							span {
								display: inline-block;
								width: 218px;
								height: 49px;
								background: url(@/assets/romimg/contract/btn.png) no-repeat center;
								background-size: contain;
								text-align: center;
								line-height: 56px;
								font-size: 26px;
								color: #141221;
								font-weight: bold;
								margin-left: 14px;
								margin-bottom: 8px;
								cursor: pointer;
							}
						}
					}

					&::-webkit-scrollbar {
						display: none;
					}

				}

			}
		}
	}

	//合成展示
	.result-wrap {
		position: fixed;
		width: 100%;
		height: 100%;
		background: rgba($color: #000000, $alpha: 0.9);
		left: 0;
		top: 0;
		z-index: -1;
		opacity: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		padding-bottom: 320px;
		box-sizing: border-box;
		transition: 0.3s;

		.result-content {
			width: 630px;

			.resultbox {
				position: relative;
				width: 620px;
				height: 620px;
				margin: 0 auto;
				background: url(@/assets/romimg/contract/bg3.png) no-repeat center;
				background-size: contain;

				.result-title {
					display: flex;
					margin: 0 auto;
					width: 206px;
					height: 57px;
					padding-top: 70px;

					img {
						width: 206px;
						height: 57px;
					}
				}

				.result-img {
					position: absolute;
					top: 120px;
					left: 50%;
					transform: translateX(-50%);
					width: 500px;
					height: 500px;
					display: flex;
					justify-content: center;
					align-items: center;

					img {
						max-width: 80%;
						max-height: 80%;
					}
				}

				.result-name {
					position: absolute;
					left: 0;
					top: 600px;
					width: 100%;
					text-align: center;
					padding: 0 60px;
					box-sizing: border-box;
					font-size: 28px;
				}

				.result-price {
					display: flex;
					justify-content: center;
					align-items: center;
					position: absolute;
					left: 0;
					top: 660px;
					width: 100%;
					font-size: 32px;
					font-weight: bold;
					color: #fbfa02;

					img {
						width: 52px;
					}
				}

				.result-btn-wrap {
					display: flex;
					align-items: center;
					justify-content: center;
					position: absolute;
					width: 100%;
					top: 740px;
					left: 0;

					p {
						box-sizing: border-box;
						margin: 0 30px;
						padding-top: 2px;
						width: 268px;
						height: 64px;
						background: url(@/assets/romimg/openbox/btn_result.png) no-repeat center;
						background-size: contain;
						text-align: center;
						line-height: 64px;
						font-size: 24px;
						font-weight: bold;
						color: #141221;
					}
				}
			}
		}

		&.active {
			opacity: 1;
			z-index: 1000;
		}
	}

	.contract-list {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		height: 470px;
		overflow-y: auto;
		box-sizing: border-box;
		align-content: flex-start;

		.contract-list-item {
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			position: relative;
			width: 154px;
			height: 182px;
			margin-bottom: 10px;
			margin-right: 5px;
			background-position: center left;
			background-size: contain;
			background-repeat: no-repeat;
			transition: all 0.3s;
			cursor: pointer;

			.probability {
				position: absolute;
				right: 12px;
				top: 4px;
				font-size: 14px;
				z-index: 1;
			}

			.prob-text {
				position: absolute;
				box-sizing: border-box;
				display: none;
				left: 70px;
				top: 44px;
				height: 40px;
				background: #353748;
				color: #fff;
				line-height: 40px;
				font-size: 16px;
				padding: 0 20px;
				border-radius: 8px;
				white-space: nowrap;
				z-index: 2;
				min-width: 100px;

				&::after {
					display: block;
					content: "";
					width: 33px;
					height: 27px;
					background: url(@/assets/romimg/common/arrow_top.png) no-repeat center;
					background-size: contain;
					position: absolute;
					left: 50%;
					top: -20px;
					transform: translateX(-50%);
				}

				&.show {
					display: block;
				}
			}

			.name-text {
				position: absolute;
				box-sizing: border-box;
				display: block;
				left: 50%;
				transform: translateX(-50%);
				top: 194px;
				// height: 40px;
				background: #353748;
				color: #fff;
				line-height: 35px;
				font-size: 16px;
				padding: 0 20px;
				border-radius: 8px;
				z-index: 5;
				min-width: 200px;
				text-align: center;

				&::after {
					display: block;
					content: "";
					width: 33px;
					height: 27px;
					background: url(@/assets/romimg/common/arrow_top.png) no-repeat center;
					background-size: contain;
					position: absolute;
					left: 50%;
					top: -20px;
					transform: translateX(-50%);
				}
			}

			.item-sel-wrap {
				box-sizing: border-box;
				position: absolute;
				width: 154px;
				height: 100%;
				text-align: right;
				padding: 10px 12px 0 0;

				img {
					position: relative;
					width: 26px;
					height: 26px;
					z-index: 2;
				}
			}

			.pic {
				width: 120px;
				height: 110px;
				margin-left: 16px;
				display: flex;
				justify-content: center;
				align-items: center;

				img {
					max-width: 100%;
					max-height: 100%;
				}
			}

			p {
				font-size: 14px;
				padding: 0 10px;
				box-sizing: border-box;
				text-align: center;
			}

			.item-price {
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fbfa02;
				font-weight: bold;
				font-size: 18px;
				margin-top: 4px;

				img {
					width: 34px;
					height: 34px;
					margin-bottom: 4px;
				}
			}

			&:nth-child(3n) {
				.prob-text {
					left: auto;
					right: 40px;

					&::after {
						left: auto;
						right: 0px;
					}
				}

				margin-right: 0px;
			}
		}
	}

	.mybag_list_tip {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		padding-bottom: 100px;
		box-sizing: border-box;

		p {

			font-size: 38px;
			display: flex;
			justify-content: center;
			align-items: center;

			span {
				display: inline-block;
				width: 218px;
				height: 49px;
				background: url(@/assets/romimg/contract/btn.png) no-repeat center;
				background-size: contain;
				text-align: center;
				line-height: 49px;
				font-size: 26px;
				color: #141221;
				font-weight: bold;
				margin-left: 14px;
				margin-bottom: 8px;
			}
		}
	}

	.bag-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, 176px);
		column-gap: 24px;
		row-gap: 10px;
		width: 100%;
		overflow-y: auto;
		margin-bottom: 28px;

		.bag-list-item {
			box-sizing: border-box;
			position: relative;
			width: 176px;
			height: 207px;
			background-position: center left;
			background-size: 100% 100%;
			background-repeat: no-repeat;
			transition: all .3s;
			cursor: pointer;

			.name-text {
				position: absolute;
				box-sizing: border-box;
				display: block;
				left: 50%;
				transform: translateX(-50%);
				top: 154px;
				background: #353748;
				color: #fff;
				line-height: 35px;
				font-size: 16px;
				padding: 0 20px;
				border-radius: 8px;
				z-index: 2;
				min-width: 200px;
				text-align: center;

				&::after {
					display: block;
					content: '';
					width: 33px;
					height: 27px;
					background: url(@/assets/romimg/common/arrow_top.png) no-repeat center;
					background-size: contain;
					position: absolute;
					left: 50%;
					top: -20px;
					transform: translateX(-50%);
				}
			}

			.item-sel-wrap {
				box-sizing: border-box;
				position: absolute;
				width: 176px;
				height: 100%;
				text-align: right;
				padding: 10px 12px 0 0;

				img {
					position: relative;
					width: 26px;
					height: 26px;
					z-index: 2;
				}
			}

			.pic {
				width: 140px;
				height: 90px;
				display: flex;
				justify-content: center;
				align-items: center;
				margin: 20px auto 0;

				img {
					max-width: 100%;
					max-height: 100%;
				}
			}

			p {
				font-size: 15px;
				padding: 0 10px;
				box-sizing: border-box;
				margin-top: 4px;
				text-align: center;
			}

			.item-price {
				display: flex;
				align-items: center;
				justify-content: center;
				color: #FBFA02;
				font-weight: bold;
				font-size: 18px;
				margin-top: 4px;
				line-height: 18px;

				img {
					width: 34px;
					height: 34px;
					margin-bottom: 4px;
				}
			}
		}
	}

	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.3s;
	}

	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
	}

	.animation-enter-from,
	.animation-leave-to {
		opacity: 0;
		transform: translateY(-30px);
	}

	.animation-leave-active {
		position: absolute;
		left: 50%;
		top: 0;
		transform: translateX(-50%);
	}

	.animation_bottom-enter-from,
	.animation_bottom-leave-to {
		opacity: 0;
		transform: translateY(-30px);
	}

	.animation_bottom-leave-active {
		position: absolute;
		left: 50%;
		bottom: 0;
		transform: translateX(-50%);
	}

	// .search_top {
	//	 display: flex;
	//	 align-items: center;
	//	 justify-content: center;
	//	 margin-top: 30px;
	// }

	// .search {
	//	 width: 694px;
	//	 height: 52px;
	//	 border: 2px solid #00f0ff;
	//	 position: relative;
	//	 box-sizing: border-box;

	//	 input {
	//		 position: absolute;
	//		 left: 0;
	//		 top: 0;
	//		 width: 100%;
	//		 height: 100%;
	//		 border: none;
	//		 background: none;
	//		 color: #fff;
	//		 padding-left: 15px;
	//		 padding-right: 116px;
	//		 box-sizing: border-box;
	//		 font-size: 24px;
	//	 }

	//	 .search_btn {
	//		 width: 100px;
	//		 height: 100%;
	//		 position: absolute;
	//		 right: 0;
	//		 top: 0;
	//		 display: flex;
	//		 justify-content: center;
	//		 align-items: center;
	//		 padding-left: 30px;
	//		 box-sizing: border-box;

	//		 img {
	//			 width: 26px;
	//		 }
	//	 }
	// }
}
</style>
