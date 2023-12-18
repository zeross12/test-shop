<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted } from "vue";
import {
	getAssetsImage,
	playAudio,
	FormatNickname,
	getGoodsNamePre,
	getGoodsNameSec,
} from "@/util/common";

import { useStore } from "vuex";
import {
	recoveryGoods,
	rucksackGoods,
	extractGoods,
	cancelExtract,
} from "@/network/api/user";
import { GoodImageBgType } from "@/util/util";
import fudaiImage from "@/assets/romimg/common/fudai.png";
import audiorecory from "@/assets/audio/recory.mp3";
import Currency from "@/components/h5/common/Currency.vue";

const store = useStore();
const tabType = ref("goods");
const barIndex = ref(1);
let recoryaudio = new Audio(audiorecory);

const isSearchActive = false; // 是否激活搜索框的状态

const statusTypeValue = {
	common: 1, //正常
	alreadyRec: 2, //已分解
	alreadyExtract: 3, //已提取
	alreadyCancel: 4, //已取消
	extracting: 5, //提取中
};

//饰品库
const downactive = ref(false);
const goodDownList = ref([
	{
		text: t('common.defaultSort'),
		direction: "desc",
		sortType: 1,
	},
	{
		text: t('common.priceDescSort'),
		direction: "desc",
		sortType: 3,
	},
	{
		text: t('common.priceAscSort'),
		direction: "asc",
		sortType: 2,
	},
]);
const dropState = ref({
	text: t('common.defaultSort'),
	direction: "desc",
	sortType: 1,
});
let dropStateIndex = 0;

const goodsPager = ref({
	pageIndex: 1,
	pageSize: 15,
	sortType: 1,
});
const keyword = ref("");

const totalRows = ref(0);
const totalPrice = ref(0);

const goodsList = ref([]); //背包列表

const choosekey = ref(0);
const selectAll = ref(false); //全选
const loading = ref(false);
const customLoading = ref(false);
const finished = ref(false);
const selectList = ref([]);
const showIndex = ref(-1);

const showSearch = ref(false);

onMounted(() => {
	keyword.value = "";
	finished.value = false;
	goodsPager.value.pageIndex = 1;
	getBagGoods();
});

async function toggleSearch() {
	// 切换搜索框的激活状态
	this.isSearchActive = !this.isSearchActive;
}

async function getBagGoods() {
	let params = {};
	params.limit = goodsPager.value.pageSize;
	params.page = goodsPager.value.pageIndex;
	params.sortType = goodsPager.value.sortType;
	if (keyword.value) {
		params.goodsName = keyword.value;
	}
	customLoading.value = true;
	const res = await rucksackGoods(params);
	if (res.code === 0) {
		let items = res.data.items;
		let preGoods = goodsList.value;
		if (res.data.page == 1) {
			preGoods = [];
			selectAll.value = false;
			selectList.value = [];
		}
		if (items) {
			goodsList.value = [...preGoods, ...items];
		} else {
			goodsList.value = preGoods;
		}
		totalRows.value = res.data.total;
		totalPrice.value = res.data.sumPrices;
		// 加载状态结束
		loading.value = false;

		// 数据全部加载完成
		if (res.data.items == null || res.data.items.length < res.data.limit) {
			finished.value = true;
		}
	} else {
		loading.value = false;
		finished.value = true;
	}
	customLoading.value = false;
}

//饰品相关

function onSelGoodDown() {
	dropStateIndex = dropStateIndex + 1;
	if (dropStateIndex >= goodDownList.value.length) {
		dropStateIndex = 0;
	}
	dropState.value = goodDownList.value[dropStateIndex];

	downactive.value = false;
	keyword.value = "";
	goodsPager.value.pageIndex = 1;
	goodsPager.value.sortType = dropState.value.sortType;
	finished.value = false;
	selectAll.value = false;
	getBagGoods();
}

function toSearch() {
	if (showSearch.value) {
		goodsPager.value.pageIndex = 1;
		finished.value = false;
		selectAll.value = false;
		getBagGoods();
	} else {
		showSearch.value = true;
	}
}

function onLoad() {
	if (customLoading.value) return;
	goodsPager.value.pageIndex += 1;
	getBagGoods();
}

//全选
function allChoose() {
	if (selectAll.value) {
		for (let i = 0; i < goodsList.value.length; i++) {
			delete goodsList.value[i].choose;
			selectList.value = [];
		}
		selectAll.value = false;
	} else {
		selectList.value = [];
		let key = "choose";
		let value = true;
		for (let i = 0; i < goodsList.value.length; i++) {
			goodsList.value[i][key] = value;
			selectList.value.push(goodsList.value[i]);
		}
		selectAll.value = true;
	}
}

function chooseItem(item, index) {
	if (item.choose) {
		delete item.choose;
		let ItemIndex = selectList.value.findIndex((v) => {
			return v.id == item.id;
		});
		selectList.value.splice(ItemIndex, 1);
	} else {
		let key = "choose";
		let value = true;
		item[key] = value;
		selectList.value.push(item);
	}
	choosekey.value += 1;
	monitorAll();
}

//分解
function sellGoods() {
	//筛选出选中的饰品
	let selectArr = goodsList.value.filter((item) => {
		return item.choose;
	});

	if (selectArr.length > 0) {
		//查询选中饰品中是否存在已提取状态
		let againArr = selectArr.filter((item) => {
			return (
				item.statusType == statusTypeValue.alreadyExtract ||
				item.statusType == statusTypeValue.extracting
			);
		});

		//不存在执行
		if (againArr.length == 0) {
			let params = {
				goodsIds: [],
			};
			for (let i = 0; i < selectArr.length; i++) {
				params.goodsIds.push(selectArr[i].id);
			}

			recoveryGoods(params).then((res) => {
				if (res.code == 0) {
					playAudio(recoryaudio);
					Notify(res.message);
					store.dispatch("getUserInfo");
					finished.value = false;
					goodsPager.value.pageIndex = 1;
					getBagGoods();
					selectAll.value = false;
					selectList.value = [];
				}
			});
		} else {
			NotifyF(t('bag.notAllowSale'));
		}
	} else {
		NotifyF(t('bag.saleFailByNoChange'));
	}
}

//分解
function sellGoodItem(item) {
	//筛选出选中的饰品
	let selectArr = [item];

	if (selectArr.length > 0) {
		//查询选中饰品中是否存在已提取状态
		let againArr = selectArr.filter((item) => {
			return (
				item.statusType == statusTypeValue.alreadyExtract ||
				item.statusType == statusTypeValue.extracting
			);
		});

		//不存在执行
		if (againArr.length == 0) {
			let params = {
				goodsIds: [],
			};
			for (let i = 0; i < selectArr.length; i++) {
				params.goodsIds.push(selectArr[i].id);
			}

			recoveryGoods(params).then((res) => {
				if (res.code == 0) {
					playAudio(recoryaudio);
					Notify(res.message);
					store.dispatch("getUserInfo");
					finished.value = false;
					goodsPager.value.pageIndex = 1;
					getBagGoods();
					selectAll.value = false;
					selectList.value = [];
				}
			});
		} else {
			NotifyF(t('bag.notAllowSale'));
		}
	} else {
		NotifyF(t('bag.saleFailByNoChange'));
	}
}

//提取
function onClickExtract() {
	//筛选出选中的饰品
	let screenArr = goodsList.value.filter((item) => {
		return item.choose;
	});
	//不为0执行
	if (screenArr.length > 0) {
		//查询选中饰品中是否已提取状态
		let againArr = screenArr.filter((item) => {
			return (
				item.statusType == statusTypeValue.alreadyExtract ||
				item.statusType == statusTypeValue.extracting
			);
		});
		// 为0执行
		if (againArr.length == 0) {
			let params = {
				ids: [],
			};
			for (let i = 0; i < screenArr.length; i++) {
				params.ids.push(screenArr[i].id);
			}
			extractGoods(params).then((res) => {
				if (res.code == 0) {
					Notify(t('bag.extractSuccess'));
					goodsPager.value.pageIndex = 1;
					finished.value = false;
					getBagGoods();
					monitorAll();
					selectAll.value = false;
					selectList.value = [];
				}
			});
		} else {
			NotifyF(t('bag.extractFail'));
		}
	} else {
		NotifyF(t('bag.extractFailByNoChange'));
	}
}

//取消提取
function toCancelDraw() {
	let screenArr = goodsList.value.filter((item) => {
		return item.choose;
	});
	if (screenArr.length > 0) {
		let againArr = screenArr.filter((item) => {
			return (
				item.statusType == statusTypeValue.common ||
				item.statusType == statusTypeValue.alreadyCancel
			);
		});
		//查询选中饰品是否存在正常状态
		if (againArr.length == 0) {
			let params = {
				ids: [],
			};
			for (let i = 0; i < screenArr.length; i++) {
				params.ids.push(screenArr[i].id);
			}
			cancelExtract(params).then((res) => {
				if (res.code == 0) {
					Notify(t('bag.cancelExtractSuccess'));
					goodsPager.value.pageIndex = 1;
					finished.value = false;
					getBagGoods();
					monitorAll();
					selectAll.value = false;
					selectList.value = [];
				}
			});
		} else {
			NotifyF(t('bag.cancelExtractFail'));
		}
	} else {
		NotifyF(t('bag.cancelExtractFailByNil'));
	}
}

//全选监听
function monitorAll() {
	let monitor = goodsList.value.find((item) => {
		return !item.choose;
	});
	selectAll.value = !monitor;
}

function onBaseClick() {
	showIndex.value = -1;
}

function onClickItemName(index) {
	if (index == showIndex.value) {
		showIndex.value = -1;
	} else {
		showIndex.value = index;
	}
}

function getImageBg(item) {
	let level = item.goodsLevel;
	if (item.goodsType == 2) {
		level = 1;
	}
	return store.getters.getGoodsBgImage(GoodImageBgType.box, level);
}
function getImageIcon(item) {
	if (item.goodsType == 2) {
		return fudaiImage;
	} else {
		return item.iconUrl;
	}
}
function getGoodsName(item) {
	if (item.goodsType == 2) {
		return t('bag.luckyBag');
	} else {
		return item.goodsName;
	}
}
</script>

<template>
	<div id="bag" class="min-wrap-height" @click.stop="onBaseClick">
		<div class="goods-wrap" v-show="tabType == 'goods'">
			<!-- <van-notice-bar scrollable text="注：多次拒收或超时收货的玩家，将被暂停取回功能！" color="#ffffff" style=" background:transparent;"
								:key="barIndex" /> -->

			<div class="head">
				<div class="bag-1" :class="{ active: isSearchActive }" v-if="!showSearch">
					<div class="bag-1">
						<p>
							{{ t('bag.total') }}<span>{{ totalRows }}</span>
						</p>
						<div class="div-sum">
							<p>{{ t('bag.priceTotal') }}</p>
							<img class="img" src="../../../assets/romimg/bag/coins.svg.png" />
							<div class="span-1">{{ totalPrice }}</div>
						</div>
						<div class="drop-down-1" @click="onSelGoodDown()">
							<!-- {{ dropState.text }} -->
							<img class="img" src="@/assets/romimg/bag/Frame.png" alt="" />
						</div>
					</div>
					<div class="ic_search_container" @click="toSearch()">
						<span class="icon iconfont">&#xe643;</span>
					</div>
				</div>

				<div class="bag-search-wrap" v-if="showSearch">
					<input type="text" v-model="keyword" :placeholder="t('bag.searchText')" @keyup.enter="toSearch" />
					<div class="ic_search_container" @click="toSearch()">
						<span class="icon iconfont">&#xe643;</span>
					</div>
				</div>
				<div class="bag-sort-wrap">
					<div class="opt-wrap">
						<p @click="onClickExtract">{{ t('bag.extract') }}</p>
						<p @click="toCancelDraw">{{ t('bag.cancelExtract') }}</p>
						<p v-if="store.state.reserveStatus == 1" @click="sellGoods">{{ t('bag.sale') }}</p>
					</div>

					<div class="bag-opt-wrap">
						<div class="opt-select">
							<div class="all" @click="allChoose" :class="{ active: selectAll }">
								<p>{{ t('common.selectAll') }}</p>
								<div class="all-img"></div>
							</div>
						</div>
					</div>

					<div class="bag-opt-wrap">
						<div class="opt-select">
							<div class="select-num">
								<p>{{ t('common.selected') }}</p>
								<span>{{ selectList.length }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="goods-list-wrap">
				<van-list v-model:loading="loading" :finished="finished" :finished-text="t('common.noMore')"
					@load="onLoad" :immediate-check="false">
					<div class="goods-list" :key="choosekey">
						<div class="goods-item" v-for="(item, index) in goodsList" :key="index"
							:class="{ active: item.choose }" :style="`background-image: url(` + getImageBg(item) + `)`">
							<div class="goods-item-opt" @click="chooseItem(item, index)"></div>
							<div class="choose"></div>
							<p v-show="item.statusType !== 1">{{ item.statusName }}</p>
							<div class="price">
								<!-- ${{ item.price }} -->
								<currency :currency="item.price"></currency>
							</div>
							<div class="goods-img">
								<img :src="getImageIcon(item)" alt="" />
							</div>
							<div class="weap-name" @click.stop="onClickItemName(index)">
								{{ FormatNickname(getGoodsNamePre(item.goodsName), 20) }}
							</div>
							<div class="weap-name2" @click.stop="onClickItemName(index)">
								{{ FormatNickname(getGoodsNameSec(item.goodsName), 20) }}
							</div>

							<!-- <div class="text" :class="{ show: showIndex == index }">
								{{ item.goodsName }}
							</div>	-->
							<div class="item-sell" :class="{ active: item.choose }" @click.stop="sellGoodItem(item)">
								{{ t('bag.sale') }}
							</div>
						</div>
					</div>
				</van-list>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#bag {
	display: flex;
	justify-content: center;
	/* 水平居中 */
	// align-items: center; /* 垂直居中 */
	padding: 40px 60px;
	padding-bottom: 0px;
	box-sizing: border-box;
	// margin: 40px 0px;
	// height: 100%;
	width: 750px;
	// background: url(@/assets/romimg/personal/bg.png) no-repeat center;
	background-size: contain;
	min-height: 100%;

	.div-sum {
		display: flex;
		justify-content: center;
		/* 水平居中 */
		align-items: center;
		/* 垂直居中 */
		font-size: 24px;
	}

	.drop-down-1 {
		display: flex;
		align-items: center;
		margin-left: 30px;
		height: 52px;
		box-sizing: border-box;
		font-size: 24px;
		color: #b4b8cd;

		img {
			margin-left: 3px;
			width: 24px;
			margin-right: 5px;
		}
	}

	.img {
		width: 24px;
		height: 24px;
		margin-left: 6px;
		margin-right: 10px;
	}

	.ic_search_container {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		margin-left: 36px;

		.icon.iconfont {
			font-size: 32px;
			color: #626476;
		}
	}

	.head {
		display: flex;
		justify-content: center;
		/* 水平居中 */
		align-items: center;
		/* 垂直居中 */
		flex-direction: column;
		/* 子元素垂直排列 */
		border-radius: 12px;
		width: 706px;
		padding: 10px 0;
		// height: 170px;
		background-color: #1c203c;
	}

	.span-1 {
		color: #7ef2ad;
		font-size: 24px;
		font-weight: bold;
		/* 加粗字体 */
	}

	.bag-1 {
		display: flex;
		justify-content: space-between;
		/* 子元素两端对齐 */
		width: 666px;
		height: 50px;
		// justify-content: center; /* 水平居中 */
		align-items: center;

		p {
			color: #b4b8cd;
			font-size: 24px;
			// margin-right: 110px;

			span {
				color: #ffffff;
				margin-left: 6px;
				margin-right: 30px;
			}
		}
	}

	.bag-search-wrap {
		display: flex;
		align-items: center;
		width: 666px;

		input {
			box-sizing: border-box;
			padding-right: 97px;
			width: 100%;
			height: 50px;
			background: transparent;
			border: transparent;
			font-size: 24px;

			font-weight: 300;
			color: #b4b8cd;
			line-height: 50px;
		}
	}

	.goods-wrap {
		// margin-bottom: 30px;
		// display: flex;
		// justify-content: center; /* 水平居中 */
		// align-items: center; /* 垂直居中 */
		height: 100%;

		.van-notice-bar {
			width: 100%;
			background-color: rgba($color: #fff, $alpha: 0.07);
			background-size: contain;
			box-sizing: border-box;
			font-size: 24px;
		}

		.bag-sort-wrap {
			display: flex;
			// width: 666px;
			justify-content: center;
			/* 水平居中 */
			flex-wrap: wrap;
			padding: 0 10px;
			justify-content: space-between;
			/* 子元素均匀分布，第一个元素在起始位置，最后一个元素在结束位置 */
			align-items: center;

			.opt-wrap {
				height: 50px;
				display: flex;

				p {
					display: flex;
					justify-content: center;
					/* 水平居中 */
					align-items: center;
					/* 垂直居中 */
					// width: 120px;
					padding: 0 10px;
					height: 60px;
					background: #1c203c;
					border: 2px solid #2d2d67;
					border-radius: 8px;
					text-align: center;
					line-height: 48px;
					color: #ffffff;
					font-size: 24px;
					box-sizing: border-box;
					margin-right: 17px;
				}

				/* 元素被点击时的样式 */
				p:active {
					background: #554bf7;
					/* 你可以自定义点击后的颜色 */
					color: #ffffff;
					/* 你可以自定义点击后的文本颜色 */
				}
			}

			.drop-down {
				display: flex;
				align-items: center;
				height: 52px;
				box-sizing: border-box;
				font-size: 24px;
				color: #00f0ff;

				img {
					width: 24px;
					margin-right: 5px;
				}
			}
		}

		.bag-opt-wrap {
			margin-top: 20px;

			.bag-info {
				p {
					display: flex;
					align-items: center;
					color: #fff;
					font-size: 24px;
					margin-right: 20px;

					span {
						color: #fbfa02;
						margin-left: 5px;
					}
				}
			}

			.opt-select {
				// margin-left: 30px;
				display: flex;
				height: 50px;
				align-items: center;
				color: #fff;

				.all {
					display: flex;
					align-items: center;

					p {
						font-size: 20px;
						line-height: 50px;
						text-align: center;
					}

					.all-img {
						width: 38px;
						height: 38px;
						background: url(@/assets/romimg/bag/span.checkbox__box.png) no-repeat center;
						background-size: contain;
						margin-left: 10px;
					}

					&.active {
						.all-img {
							background: url(@/assets/romimg/bag/span.png) no-repeat center;
							background-size: contain;
						}
					}
				}

				.select-num {
					display: flex;
					align-items: center;
					justify-content: center;
					margin-left: 20px;

					p {
						height: 50px;
						line-height: 50px;
						font-size: 20px;
						text-align: center;
					}

					span {
						// display: block;
						// width: 70px;
						// text-align: center;
						margin-left: 10px;
						height: 50px;
						line-height: 50px;
						color: #7ef2ad;
						font-size: 24px;
					}
				}
			}
		}

		.goods-list-wrap {
			display: flex;
			flex-direction: column;
			max-height: 1225px;
			overflow-y: scroll;
			margin-top: 20px;

			&::-webkit-scrollbar {
				width: 0px;
			}

			.goods-list {
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;
				margin-bottom: 0px;

				.goods-item {
					width: 344px;
					height: 520px;
					background-size: contain;
					background-position: center;
					background-repeat: no-repeat;
					// margin-right: 25px;
					margin-bottom: 15px;
					position: relative;
					background-color: #1b1e38;
					border-radius: 10px;
					position: relative;

					.goods-item-opt {
						width: 100%;
						height: 100%;
						position: absolute;
						left: 0;
						top: 0;
						z-index: 1;
					}

					.item-sell {
						position: absolute;
						top: 450px;
						height: 70px;
						background-color: #181a31;
						text-align: center;
						line-height: 70px;
						box-sizing: border-box;
						color: #a4a6c5;
						font-size: 26px;
						box-sizing: border-box;
						left: 0;
						width: 100%;
						border-bottom-left-radius: 12px;
						border-bottom-right-radius: 12px;
						z-index: 2;

						&.active {
							border-bottom: #2d2d67 solid 1px;
						}
					}

					.choose {
						width: 36px;
						height: 36px;
						background: url(@/assets/romimg/openbox/selected.png) no-repeat center;
						background-size: contain;
						position: absolute;
						opacity: 0;
					}

					p {
						position: absolute;
						width: 100%;
						font-size: 24px;
						color: #7ef2ad;
						text-align: center;
						left: 0;
						top: 10px;
					}

					.goods-img {
						width: 160px;
						height: 130px;
						margin: 100px auto 0;
						display: flex;
						justify-content: center;
						align-items: center;

						img {
							max-width: 100%;
							max-height: 100%;
						}
					}

					.weap-name {
						box-sizing: border-box;
						text-align: center;
						color: #cbccd6;
						font-size: 24px;
						position: absolute;
						width: 100%;
						font-weight: 300;
						z-index: 2;
						top: 330px;
					}

					.weap-name2 {
						box-sizing: border-box;
						text-align: center;
						color: #fff;
						font-size: 24px;
						position: absolute;
						width: 100%;
						font-weight: 700;
						z-index: 2;
						top: 370px;
					}

					.price {
						margin-top: 30px;
						display: flex;
						justify-content: center;
						align-items: center;
						font-size: 26px;
						color: #7ef2ad;

						img {
							width: 30px;
						}
					}

					.text {
						position: absolute;
						left: 20px;
						bottom: 130px;
						height: 40px;
						background: #353748;
						color: #fff;
						line-height: 40px;
						font-size: 16px;
						padding: 0 20px;
						border-radius: 8px;
						white-space: nowrap;
						z-index: 2;
						box-sizing: border-box;
						display: none;

						&::after {
							display: block;
							content: "";
							width: 33px;
							height: 27px;
							background: url(@/assets/romimg/common/arrow_top.png) no-repeat center;
							background-size: contain;
							position: absolute;
							left: 40px;
							top: 30px;
							transform: rotate(180deg);
						}

						&.show {
							display: block;
						}
					}

					&.active {
						.choose {
							opacity: 1;
						}

						box-sizing: border-box;
						border: 1px solid #2d2d67;
					}

					&:nth-child(3n) {
						margin-right: 0;

						.text {
							left: auto;
							right: 30px;

							&::after {
								left: auto;
								right: 40px;
							}
						}
					}

					&:nth-child(3n - 1) {
						.text {
							left: 50%;
							transform: translateX(-50%);

							&::after {
								left: 50%;
								transform: translateX(-50%) rotate(180deg);
							}
						}
					}
				}
			}
		}
	}
}
</style>
