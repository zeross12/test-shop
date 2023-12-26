<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted, onUnmounted } from 'vue';
import { getAssetsImage, playAudio, stopAudio } from '@/util/common';

import { useStore } from 'vuex';
import { recoveryGoods, rucksackGoods, extractGoods, cancelExtract } from "@/network/api/user";
import { GoodImageBgType } from '@/util/util'
import fudaiImage from '@/assets/romimg/common/fudai.png';
import audiorecory from '@/assets/audio/recory.mp3'

const store = useStore();
const tabType = ref('goods');
const barIndex = ref(1);
let recoryaudio = new Audio(audiorecory);

const statusTypeValue = {
	common: 1,//正常
	alreadyRec: 2,//已分解
	alreadyExtract: 3,//已提取
	alreadyCancel: 4,//已取消
	extracting: 5,//提取中
};

//饰品库
const downactive = ref(false);
const gDHeight = ref(0);
const goodDownList = ref([{
	text: t('bag.sortByGetTime'),
	direction: 'desc',
	sortType: 1
},
{
	text: t('bag.sortByPriceDesc'),
	direction: 'desc',
	sortType: 3
},
{
	text: t('bag.sortByPriceAsc'),
	direction: 'asc',
	sortType: 2
}
]);
const dropState = ref({
	text: t('bag.sortByGetTime'),
	direction: 'desc',
	sortType: 2
});
let dropStateIndex = 0;

const goodsPager = ref({
	pageIndex: 1,
	pageSize: 20,
	sortType: 1,
});
const keyword = ref('');

const totalRows = ref(0);
const totalPrice = ref(0);

const goodsList = ref([]);//背包列表

const choosekey = ref(0);
const selectAll = ref(false);//全选
const loading = ref(false);
const customLoading = ref(false);
const finished = ref(false);
const selectList = ref([]);
const showIndex = ref(-1);

onUnmounted(() => {
	stopAudio(recoryaudio)
})

function switchTab(value) {
	tabType.value = value;
	if (value == 'goods') {
		barIndex.value += 1
		keyword.value = ''
		finished.value = false;
		goodsPager.value.pageIndex = 1;
		getBagGoods();
	} else {

	}
}

onMounted(() => {
	getBagGoods();
})

async function getBagGoods() {
	let params = {}
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
function onGoodDown() {
	if (gDHeight.value == 'auto') {
		gDHeight.value = 0
		downactive.value = false
	} else {
		gDHeight.value = 'auto'
		downactive.value = true
	}
}

function onSelGoodDown() {
	dropStateIndex = dropStateIndex + 1;
	if (dropStateIndex >= goodDownList.value.length) {
		dropStateIndex = 0;
	}
	dropState.value = goodDownList.value[dropStateIndex];

	gDHeight.value = 0;
	downactive.value = false;
	keyword.value = '';
	goodsPager.value.pageIndex = 1;
	goodsPager.value.sortType = dropState.value.sortType;
	finished.value = false;
	selectAll.value = false;
	getBagGoods();
}

function toSearch() {
	goodsPager.value.pageIndex = 1
	finished.value = false
	selectAll.value = false
	getBagGoods();
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
			delete goodsList.value[i].choose
			selectList.value = []
		}
		selectAll.value = false
	} else {
		selectList.value = []
		let key = "choose"
		let value = true
		for (let i = 0; i < goodsList.value.length; i++) {
			goodsList.value[i][key] = value
			selectList.value.push(goodsList.value[i])
		}
		selectAll.value = true
	}
}

function onAllChooseChange() {
	if (selectAll.value) {
		selectList.value = []
		let key = "choose"
		let value = true
		for (let i = 0; i < goodsList.value.length; i++) {
			goodsList.value[i][key] = value
			selectList.value.push(goodsList.value[i])
		}
	} else {
		for (let i = 0; i < goodsList.value.length; i++) {
			delete goodsList.value[i].choose
			selectList.value = []
		}
	}
}


function chooseItem(item, index) {
	if (item.choose) {
		delete item.choose
		let ItemIndex = selectList.value.findIndex((v) => {
			return v.id == item.id
		})
		selectList.value.splice(ItemIndex, 1)
	} else {
		let key = "choose";
		let value = true
		item[key] = value
		selectList.value.push(item)
	}
	choosekey.value += 1
	monitorAll()
}

function onSellOne(item) {
	let params = {
		goodsIds: [item.id]
	}

	recoveryGoods(params).then(res => {
		if (res.code == 0) {
			playAudio(recoryaudio);
			Success({ offset: 100, message: res.message });
			store.dispatch("getUserInfo");
			finished.value = false;
			goodsPager.value.pageIndex = 1;
			getBagGoods();
			selectAll.value = false;
			selectList.value = [];
		}
	})
}

function onExtractOne(item) {
	let params = {
		ids: [item.id]
	}

	extractGoods(params).then((res) => {
		if (res.code == 0) {
			Success({ offset: 100, message: t('bag.extractSuccess') });
			goodsPager.value.pageIndex = 1
			finished.value = false
			getBagGoods();
			monitorAll()
			selectAll.value = false
			selectList.value = [];
		}
	})
}


//分解
function sellGoods() {
	//筛选出选中的饰品
	let selectArr = goodsList.value.filter((item) => {
		return item.choose
	})

	if (selectArr.length > 0) {
		//查询选中饰品中是否存在已提取状态
		let againArr = selectArr.filter((item) => {
			return item.statusType == statusTypeValue.alreadyExtract || item.statusType == statusTypeValue.extracting;
		})

		//不存在执行
		if (againArr.length == 0) {
			let params = {
				goodsIds: []
			}
			for (let i = 0; i < selectArr.length; i++) {
				params.goodsIds.push(selectArr[i].id)
			}

			recoveryGoods(params).then(res => {
				if (res.code == 0) {
					playAudio(recoryaudio);
					Success({ offset: 100, message: res.message });
					store.dispatch("getUserInfo");
					finished.value = false;
					goodsPager.value.pageIndex = 1;
					getBagGoods();
					selectAll.value = false;
					selectList.value = [];
				}
			})
		} else {
			Warn({ offset: 100, message: t('bag.notAllowSale'), customClass: 'error' })
		}
	} else {
		Warn({ offset: 100, message: t('bag.saleFailByNoChange'), customClass: 'error' })
	}
}

//提取
function onClickExtract() {
	//筛选出选中的饰品
	let screenArr = goodsList.value.filter((item) => {
		return item.choose
	})
	//不为0执行
	if (screenArr.length > 0) {
		//查询选中饰品中是否已提取状态
		let againArr = screenArr.filter((item) => {
			return item.statusType == statusTypeValue.alreadyExtract || item.statusType == statusTypeValue.extracting;
		})
		// 为0执行
		if (againArr.length == 0) {
			let params = {
				ids: []
			}
			for (let i = 0; i < screenArr.length; i++) {
				params.ids.push(screenArr[i].id)
			}
			extractGoods(params).then((res) => {
				if (res.code == 0) {
					Success({ offset: 100, message: t('bag.extractSuccess') });
					goodsPager.value.pageIndex = 1
					finished.value = false
					getBagGoods();
					monitorAll()
					selectAll.value = false
					selectList.value = [];
				}
			})
		} else {
			Warn({ offset: 100, message: t('extractFail'), customClass: 'error' })
		}
	} else {
		Warn({ offset: 100, message: t('bag.extractFailByNoChange'), customClass: 'error' })
	}
}

//取消提取
function toCancelDraw() {
	let screenArr = goodsList.value.filter((item) => {
		return item.choose
	})
	if (screenArr.length > 0) {
		let againArr = screenArr.filter((item) => {
			return item.statusType == statusTypeValue.common || item.statusType == statusTypeValue.alreadyCancel;
		})
		//查询选中饰品是否存在正常状态
		if (againArr.length == 0) {
			let params = {
				ids: []
			}
			for (let i = 0; i < screenArr.length; i++) {
				params.ids.push(screenArr[i].id)
			}
			cancelExtract(params).then((res) => {
				if (res.code == 0) {
					Success({ offset: 100, message: t('bag.cancelExtractSuccess') });
					goodsPager.value.pageIndex = 1
					finished.value = false
					getBagGoods();
					monitorAll();
					selectAll.value = false;
					selectList.value = [];
				}
			})
		} else {
			Warn({ offset: 100, message: t('bag.cancelExtractFail'), customClass: 'error' })
		}
	} else {
		Warn({ offset: 100, message: t('bag.cacelExtractFailByNil'), customClass: 'error' })
	}
}

//全选监听
function monitorAll() {
	let monitor = goodsList.value.find(item => {
		return !item.choose
	})
	selectAll.value = !monitor;
}

function onBaseClick() {
	showIndex.value = -1
}

function onClickItemName(index) {
	if (index == showIndex.value) {
		showIndex.value = -1
	} else {
		showIndex.value = index
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
function getGoodsName(item) {
	if (item.goodsType == 2) {
		return t('common.luckyBag');
	} else {
		return item.goodsName;
	}
}
</script>
		
<template>
	<div id="pc-bag" @click.stop="onBaseClick">
		<div class="bag-header">
			<div class="bag-header-l">
				<p>{{ t('common.selectAll') }}</p>
				<van-switch v-model="selectAll" @change="onAllChooseChange" />
				<div class="all-price"> {{ t('common.selected') }}<span>{{ selectList.length }}</span></div>
				<div class="all-price">{{ t('battle.priceTotal') }}
					<img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />
					<span>{{ totalPrice }}</span>
				</div>
			</div>
			<div class="bag-header-c">{{ t('users.myGoods') }}</div>
			<div class="bag-header-r">
				<div class="btn-wrap" @click="sellGoods">{{ t('openbox.saleAll') }}
					<img src="@/assets/pcimg/me/icon_all.png" alt="" />
				</div>
				<div class="btn-wrap" @click="toCancelDraw">{{ t('bag.cancelExtract') }}
					<img src="@/assets/pcimg/me/icon_cancel.png" alt="" />
				</div>
				<div class="btn-wrap" @click="onClickExtract">{{ t('bag.extract') }}
					<img src="@/assets/pcimg/me/icon_tq.png" alt="" />
				</div>
			</div>
		</div>
		<div class="goods-list-wrap">
			<van-list v-model:loading="loading" :finished="finished" :finished-text="t('common.noMore')" @load="onLoad"
				:immediate-check="false" class="goods-list" :key="choosekey">
				<div class="goods-item" v-for="(item, index) in goodsList" :key="index" :class="{ 'active': item.choose }">
					<div class="goods-item-opt" @click="chooseItem(item, index)"></div>
					<div class="choose"></div>
					<p v-show="item.statusType !== 1">{{ item.statusName }}</p>
					<div class="goods-img" :style="`background-image: url(` + getImageBg(item) + `)`">
						<img :src="getImageIcon(item)" alt="">
					</div>
					<div class="item-info">
						<div class="price"><img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />{{
							item.price }}</div>
						<div class="name hide">{{ getGoodsName(item) }}</div>
					</div>
					<div class="item-opt">
						<div class="opt-item" @click.stop="onExtractOne(item)">{{ t('bag.extract') }}</div>
						<div class="opt-item" @click.stop="onSellOne(item)">{{ t('bag.sale') }}</div>
					</div>

				</div>

			</van-list>
		</div>

	</div>
</template>
		
<style lang="scss" >
#pc-bag {
	box-sizing: border-box;
	padding-top: 3px;
	width: 100%;
	min-height: 500px;
	padding-bottom: 50px;

	.bag-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 5px;
		color: #8488A6;
		font-size: 16px;

		.bag-header-l {
			display: flex;
			align-items: center;
			flex: 1;

			p {
				color: #2AE1BC;
				font-size: 15px;
				margin-right: 8px;
			}

			.van-switch {

				.van-switch__node {
					top: 5px;
				}
			}

			.all-price {
				display: flex;
				align-items: center;
				margin-left: 90px;

				img {
					margin-bottom: 0px;
					margin-left: 5px;
					margin-right: 0px;
				}

				span {
					color: #7BDCA2;

					font-size: 16px;
					font-weight: 700;
					margin-bottom: -2px;
					margin-left: 5px;
				}
			}
		}

		.bag-header-c {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 197px;
			height: 105px;
			background: url(@/assets/pcimg/me/header_bg.png) center no-repeat;
			background-size: 100% 100%;
			color: #FFF;
			font-size: 24px;
		}


		.bag-header-r {
			display: flex;
			justify-content: flex-end;
			flex: 1;
		}


		.btn-wrap {
			display: inline-flex;
			width: 146px;
			height: 48px;
			justify-content: center;
			align-items: center;
			background: #181A31;
			margin-left: 10px;
			cursor: pointer;

			img {
				width: 16px;
				height: auto;
				margin-left: 12px;
			}

			&:hover {
				background: #4854C9;
				color: #fff;
			}
		}

	}


	.goods-list-wrap {
		display: flex;
		width: 100%;

		.goods-list {
			display: grid;
			grid-template-columns: repeat(auto-fill, 198px);
			column-gap: 4px;
			row-gap: 4px;
			width: 100%;


			.goods-item {
				width: 198px;
				height: 263px;
				background-size: 100% 100%;
				position: relative;
				cursor: pointer;
				background: #15172C;

				.goods-item-opt {
					width: 100%;
					height: 100%;
					position: absolute;
					left: 0;
					top: 0;
					z-index: 1;
				}

				.choose {
					width: 100%;
					height: 100%;
					background: url(@/assets/pcimg/openbox/choose.png) no-repeat center;
					background-size: 100% 100%;
					position: absolute;
					right: 0;
					top: 0;
					opacity: 0;
					transition: .3;
				}

				p {
					position: absolute;
					width: 100%;
					font-size: 24px;
					color: #FBFA02;
					text-align: center;
					left: 0;
					top: 10px;
				}

				.goods-img {
					width: 160px;
					height: 130px;
					margin: 40px auto 0;
					display: flex;
					justify-content: center;
					align-items: center;
					background-position: center;
					background-repeat: no-repeat;

					img {
						max-width: 100%;
						max-height: 100%;
					}
				}

				.item-info {
					display: flex;
					flex-direction: column;
					position: absolute;
					bottom: 46px;
					left: 16px;

					.name {
						color: #CBCCD6;
						font-size: 11px;
					}

					.price {
						margin-bottom: 2px;
						color: #7BDCA2;

						font-size: 13px;
						font-weight: 700;
						display: flex;
						align-items: center;
					}
				}

				.item-opt {
					display: flex;
					position: absolute;
					bottom: 0;
					width: 100%;
					color: #A4A6C5;
					font-size: 13px;
					justify-content: space-between;
					z-index: 2;

					.opt-item {
						display: flex;
						width: 195px;
						height: 38px;
						justify-content: center;
						align-items: center;
						border-right: 0.8px solid #15172C;
						background: #181A31;
						cursor: pointer;
					}
				}


				&.active {
					.choose {
						opacity: 1;
					}
				}
			}


			.van-list__finished-text {
				grid-column-start: 1;
				grid-column-end: 8;
			}
		}
	}

}
</style>