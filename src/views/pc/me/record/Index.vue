<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref } from "vue";
import { billDetails, ammoDetails, goodsRecords } from "@/network/api/user";
import { useStore } from "vuex";

const store = useStore();
const active = ref(0);

//流水相关
const scoreTabType = ref(1);
const category = ref([
	{
		name: t('openbox.all'),
		income: 0,
		typelist: [
			{
				name: t('openbox.all'),
				transType: 0,
			},
		],
	},
	{
		name: t('users.expenses'),
		income: 2,
		typelist: [
			{
				name: t('openbox.all'),
				transType: 0,
			},
			{
				name: t('users.defaultSpending'),
				transType: 6,
			},
			{
				name: t('users.mallSpending'),
				transType: 10,
			},
			{
				name: t('users.rollSpending'),
				transType: 7,
			},
			{
				name: t('users.luckySpending'),
				transType: 15,
			},
		],
	},
	{
		name: t('users.income'),
		income: 1,
		typelist: [
			{
				name: t('openbox.all'),
				transType: 0,
			},
			{
				name: t('users.commission'),
				transType: 4,
			},
			{
				name: t('users.goodsSale'),
				transType: 9,
			},
			{
				name: t('users.registerRedpack'),
				transType: 3,
			},
			{
				name: t('users.passwordRedpack'),
				transType: 11,
			},
			{
				name: t('users.realnameReward'),
				transType: 5,
			},
			{
				name: t('users.rollReward'),
				transType: 8,
			},
			{
				name: t('users.rollBack'),
				transType: 14,
			},
			{
				name: t('users.gardeRedpack'),
				transType: 12,
			},
			{
				name: t('users.VipRedpack'),
				transType: 13,
			},
			{
				name: t('users.goodsExchange'),
				transType: 26
			},
			{
				name: t('users.pointRank'),
				transType: 27
			}
		],
	},
	{
		name: t('users.userRecharge'),
		income: 1,
		typelist: [
			{
				name: t('recharge.title'),
				transType: 1,
			},
		],
	},
]); //类别信息
const downactive = ref(false);
const lsDownHeight = ref(0);

const subcategory = ref({}); //子类别
const subDownActive = ref(false);
const subDownHeight = ref(0);
const subItem = ref({});
const amountPager = ref({ pageIndex: 1, limit: 30, sortType: 1 }); //分页
const loading = ref(false);
const customLoading = ref(false);
const finished = ref(false);
const amountDetails = ref([]); //明细

//弹壳查询
//类别信息
const ammoCategory = ref([
	{
		name: t('openbox.all'),
		income: 0,
		typelist: [
			{
				name: t('openbox.all'),
				transType: 0,
			},
		],
	},
	{
		name: t('users.expenses'),
		income: 2,
		typelist: [
			{
				name: t('openbox.all'),
				transType: 0,
			},
			{
				name: t('users.goodsExchange'),
				transType: 10,
			},
			{
				name: t('router.ammonbox'),
				transType: 16,
			},
		],
	},
	{
		name: t('users.income'),
		income: 1,
		typelist: [
			{
				name: t('openbox.all'),
				transType: 0,
			},
			{
				name: t('users.defaultSpending'),
				transType: 6,
			},
			{
				name: t('users.rollReward'),
				transType: 8,
			},
		],
	},
]);
const ammoDownactive = ref(false);
const ammoHeight = ref(0);
//子类别
const ammoSubCategory = ref({});
const ammoSubDownactive = ref(false);
const ammoSubHeight = ref(0);

//终
const ammoSubItem = ref({});

//分页
const ammoPager = ref({
	pageIndex: 1,
	limit: 20,
	sortType: 1,
});

const ammoLoading = ref(false);
const customAmmoLoading = ref(false);
const ammoFinished = ref(false);
const ammoData = ref([]); //明细

const goodsPager = ref({
	pageIndex: 1,
	limit: 20,
	sortType: 1,
});
const goodsSort = ref({
	txt: t('common.asc'),
	direction: "desc",
	sort: "getTime",
});
const goodsData = ref([]);
const goodLoading = ref(false);
const customGoodLoading = ref(false);
const goodFinished = ref(false);

const tabSwitch = ref(false);

onMounted(() => {
	// initData();
	// getBillDetails();
	// getAmmoDetails();
	onTabSwitchChange();
});

function onTabSwitchChange() {
	if (!tabSwitch.value) {
		amountPager.value.pageIndex = 1;
		finished.value = false;
		getBillDetails();
	} else {
		goodsPager.value.pageIndex = 1;
		goodFinished.value = false;
		getGoodsDetail();
	}
}

function onClickMainTab(tab) {
	active.value = tab;
	if (tab == 1) {
		goodsPager.value.pageIndex = 1;
		goodFinished.value = false;
		getGoodsDetail();
	}
}

async function getBillDetails() {
	let params = {};
	params.limit = amountPager.value.limit;
	params.page = amountPager.value.pageIndex;
	params.sortType = amountPager.value.sortType;
	if (subcategory.value.income != 0) {
		params.income = subcategory.value.income;
	}
	if (subItem.value.transType != 0) {
		params.transType = subItem.value.transType;
	}
	customLoading.value = true;
	const res = await billDetails(params);
	if (res.code === 0) {
		let items = res.data.items || [];

		for (let item of items) {
			if (item.changedValue > 0) {
				item.changedValue = "+" + item.changedValue;
			}
		}

		let preGoods = amountDetails.value;
		if (res.data.page == 1) {
			preGoods = [];
		}
		if (items) {
			amountDetails.value = [...preGoods, ...items];
		} else {
			amountDetails.value = preGoods;
		}

		loading.value = false;
		// 数据全部加载完成
		if (items == null || items.length < res.data.limit) {
			finished.value = true;
		}
	}
	customLoading.value = false;
}

/*流水相关*/
//联选初始
function initData() {
	subcategory.value = category.value[0];
	subItem.value = subcategory.value.typelist[0];

	ammoSubCategory.value = ammoCategory.value[0];
	ammoSubItem.value = ammoSubCategory.value.typelist[0];
}

//触发下拉
function todown() {
	subDownHeight.value = 0;
	subDownActive.value = false;
	if (lsDownHeight.value == "auto") {
		lsDownHeight.value = 0;
		downactive.value = false;
	} else {
		lsDownHeight.value = "auto";
		downactive.value = true;
	}
}

//大分类选择
function down(item) {
	subcategory.value = item;
	subItem.value = subcategory.value.typelist[0];
	lsDownHeight.value = 0;
	amountPager.value.pageIndex = 1;
	finished.value = false;
	downactive.value = false;
	getBillDetails();
}

//小分类触发
function sub_todown() {
	lsDownHeight.value = 0;
	downactive.value = false;
	if (subDownHeight.value == "auto") {
		subDownHeight.value = 0;
		subDownActive.value = false;
	} else {
		subDownHeight.value = "auto";
		subDownActive.value = true;
	}
}

//小分类选择
function subDown(item) {
	subItem.value = item;
	subDownHeight.value = 0;
	amountPager.value.pageIndex = 1;
	finished.value = false;
	subDownActive.value = false;
	getBillDetails();
}

//触底刷新
function onLoad() {
	if (customLoading.value) return;
	amountPager.value.pageIndex += 1;
	getBillDetails();
}

// 弹壳
//触发下拉
function ammo_todown() {
	ammoSubHeight.value = 0;
	ammoSubDownactive.value = false;
	if (ammoHeight.value == "auto") {
		ammoHeight.value = 0;
		ammoDownactive.value = false;
	} else {
		ammoHeight.value = "auto";
		ammoDownactive.value = true;
	}
}

//大分类选择
function ammoDown(item) {
	ammoSubCategory.value = item;
	ammoSubItem.value = ammoSubCategory.value.typelist[0];
	ammoHeight.value = 0;
	ammoPager.value.pageIndex = 1;
	ammoFinished.value = false;
	ammoDownactive.value = false;
	getAmmoDetails();
}

//小分类触发
function ammoSubTodown() {
	ammoHeight.value = 0;
	ammoDownactive.value = false;
	if (ammoSubHeight.value == "auto") {
		ammoSubHeight.value = 0;
		ammoSubDownactive.value = false;
	} else {
		ammoSubHeight.value = "auto";
		ammoSubDownactive.value = true;
	}
}

//小分类选择
function ammoSubDown(item) {
	ammoSubItem.value = item;
	ammoSubHeight.value = 0;
	ammoPager.value.pageIndex = 1;
	ammoFinished.value = false;
	ammoSubDownactive.value = false;
	getAmmoDetails();
}

async function getAmmoDetails() {
	let params = {};
	params.limit = ammoPager.value.limit;
	params.page = ammoPager.value.pageIndex;
	params.sortType = ammoPager.value.sortType;
	if (ammoSubCategory.value.income != 0) {
		params.income = ammoSubCategory.value.income;
	}
	if (ammoSubItem.value.transType != 0) {
		params.transType = ammoSubItem.value.transType;
	}
	customAmmoLoading.value = true;

	const res = await ammoDetails(params);
	if (res.code === 0) {
		let items = res.data.items || [];
		let preGoods = ammoData.value;
		if (res.data.page == 1) {
			preGoods = [];
		}
		if (items) {
			ammoData.value = [...preGoods, ...items];
		} else {
			ammoData.value = preGoods;
		}

		ammoLoading.value = false;
		// 数据全部加载完成
		if (items == null || items.length < res.data.limit) {
			ammoFinished.value = true;
		}
	}
	customAmmoLoading.value = false;
}

//触底刷新
function ammoOnLoad() {
	if (customAmmoLoading.value) return;
	ammoPager.value.pageIndex += 1;
	getAmmoDetails();
}

//排序
function onGoodsSortSelect() {
	if (goodsSort.value.direction == "desc") {
		goodsSort.value = {
			txt: t('common.desc'),
			direction: "asc",
			sort: "getTime",
		};
		goodsPager.value.sortType = 2;
	} else {
		goodsSort.value = {
			txt: t('common.asc'),
			direction: "desc",
			sort: "getTime",
		};
		goodsPager.value.sortType = 1;
	}
	goodFinished.value = false;
	goodsPager.value.pageIndex = 1;
	getGoodsDetail();
}

//明细列表
async function getGoodsDetail() {
	let params = {};
	params.limit = goodsPager.value.limit;
	params.page = goodsPager.value.pageIndex;
	params.sortType = goodsPager.value.sortType;
	customGoodLoading.value = true;

	const res = await goodsRecords(params);
	if (res.code === 0) {
		let items = res.data.items || [];
		let preGoods = goodsData.value;
		if (res.data.page == 1) {
			preGoods = [];
		}
		if (items) {
			goodsData.value = [...preGoods, ...items];
		} else {
			goodsData.value = preGoods;
		}

		goodLoading.value = false;
		// 数据全部加载完成
		if (items == null || items.length < res.data.limit) {
			goodFinished.value = true;
		}
	}
	customGoodLoading.value = false;
}

//触底刷新
function goodsOnLoad() {
	goodsPager.value.pageIndex += 1;
	getGoodsDetail();
}

function getTransTypeName(transType) {
	for (let index = 0; index < category.value.length; index++) {
		const element = category.value[index];
		let typelist = element.typelist;
		for (let j = 0; j < typelist.length; j++) {
			const type = typelist[j];
			if (type.transType == transType) {
				return element.name;
			}
		}
	}
}

function getAmmoTransTypeName(transType) {
	for (let index = 0; index < ammoCategory.value.length; index++) {
		const element = ammoCategory.value[index];
		let typelist = element.typelist;
		for (let j = 0; j < typelist.length; j++) {
			const type = typelist[j];
			if (type.transType == transType) {
				return element.name;
			}
		}
	}
}

function getGoodsName(item) {
	if (item.goodsType == 2) {
		return t('common.luckyBag');
	} else {
		return item.goodsName;
	}
}

function onChangeDetailSort() {
	amountPager.value.sortType = amountPager.value.sortType == 1 ? 2 : 1
	getBillDetails()
}

function onChangeRecordSort() {
	goodsPager.value.sortType = goodsPager.value.sortType == 1 ? 2 : 1
	getGoodsDetail()
}
</script>

<template>
	<div id="pc-record">
		<div class="record-header">
			<div class="record-header-l">
				<p :class="{ active: !tabSwitch }">{{ t('menu.accountDetail') }}</p>
				<van-switch v-model="tabSwitch" @change="onTabSwitchChange" />
				<p :class="{ active: tabSwitch }">{{ t('users.goodsRecord') }}</p>
			</div>
			<div class="record-header-c">{{ t('menu.accountDetail') }}</div>
			<div class="record-header-r"></div>
		</div>
		<div class="record-content-wrap" v-if="!tabSwitch">
			<div class="record-title">
				<p>{{ t('common.status') }}</p>
				<p>{{ t('common.category') }}</p>
				<p>{{ t('battle.price') }}</p>
				<p @click="onChangeDetailSort">{{ t('common.time') }} <img src="@/assets/pcimg/me/sort.png"></p>
			</div>
			<div class="list-wrap">
				<van-list v-model="loading" :finished="finished" :finished-text="t('common.noMore')" @load="onLoad"
					:key="amountPager.pageIndex" :immediate-check="false">
					<div class="list-item" v-for="(item, index) in amountDetails" :key="index">
						<p class="state">{{ getTransTypeName(item.transType) }}</p>
						<p class="type">{{ item.transName }}</p>
						<p class="price">{{ item.changedValue }}</p>
						<p class="time">{{ item.createTime }}</p>
					</div>
				</van-list>
			</div>
		</div>
		<div class="record-content-wrap" v-else>
			<div class="record-title">
				<p>{{ t('battle.goodsName') }}</p>
				<p>{{ t('users.source') }}</p>
				<p>{{ t('common.status') }}</p>
				<p @click="onChangeRecordSort">{{ t('common.time') }} <img src="@/assets/pcimg/me/sort.png"></p>
			</div>
			<div class="list-wrap">
				<van-list v-model="goodLoading" :finished="goodFinished" :finished-text="t('common.noMore')"
					@load="goodsOnLoad" :immediate-check="false">
					<div class="list-item" v-for="(item, index) in goodsData" :key="index">
						<p class="type">{{ getGoodsName(item) }}</p>
						<p class="state">{{ item.originName }}</p>
						<p class="price">{{ item.statusName }}</p>
						<p class="time">{{ item.updateTime }}</p>
					</div>
				</van-list>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#pc-record {
	box-sizing: border-box;
	padding-top: 3px;
	width: 100%;
	min-height: 500px;
	padding-bottom: 50px;

	.record-header {
		width: 100%;
		display: flex;
		align-items: center;
		margin-bottom: 5px;
		color: #8488a6;
		font-size: 16px;

		.record-header-l {
			display: flex;
			align-items: center;
			flex: 1;

			p {
				color: #5c5e79;
				font-size: 15px;
				margin-right: 15px;

				&.active {
					color: #2ae1bc;
				}
			}

			.van-switch {
				margin-right: 20px;

				.van-switch__node {
					top: 5px;
				}
			}
		}

		.record-header-c {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 197px;
			height: 105px;
			background: url(@/assets/pcimg/me/header_bg.png) center no-repeat;
			background-size: 100% 100%;
			color: #fff;
			font-size: 24px;
		}

		.record-header-r {
			flex: 1;
		}

		.btn-wrap {
			display: inline-flex;
			width: 146px;
			height: 48px;
			justify-content: center;
			align-items: center;
			background: #181a31;
			margin-left: 10px;
			cursor: pointer;

			img {
				width: 16px;
				height: auto;
				margin-left: 12px;
			}
		}
	}

	.record-content-wrap {
		width: 100%;

		.record-title {
			width: 100%;
			height: 66px;
			background: #111324;
			box-sizing: border-box;
			padding: 0 30px;
			display: flex;
			align-items: center;
			color: #5d5f72;
			font-size: 13px;
			font-weight: 700;

			p {
				flex: 1;
				align-items: center;
				display: flex;
				cursor: pointer;

				img {
					margin-left: 10px;
				}

				&:last-child {
					flex: none;
					width: 180px;
				}
			}
		}

		.list-wrap {
			display: flex;
			flex-direction: column;
			width: 100%;

			.list-item {
				width: 100%;
				height: 56px;
				background: #131528;
				box-sizing: border-box;
				padding: 0 30px;
				display: flex;
				align-items: center;
				margin-bottom: 2px;

				p {
					flex: 1;

					&:last-child {
						flex: none;
						width: 180px;
					}
				}

				.state {
					color: #6a77ff;
					font-size: 15px;
				}

				.type {
					color: #fff;
					font-size: 15px;
				}

				.price {
					color: #75dc9e;

					font-size: 15px;
					font-weight: 500;
				}

				.time {
					color: #c6c7d3;

					font-size: 15px;
					font-weight: 300;
				}
			}
		}
	}

	.common-nav {
		width: 100%;

		.sort {
			width: 120px;
			height: 50px;
			position: absolute;
			right: 20px;
			top: 90px;
			border: 2px solid #fbfa02;
			text-align: center;
			line-height: 52px;
			color: #fff;
			font-size: 24px;
			font-weight: bold;
			cursor: pointer;

			&:active {
				color: #fbfa02;
			}
		}
	}

	.beal-wrap {
		.beal-tab {
			width: 100%;
			height: 60px;
			background-color: #0e0d19;
			display: flex;
			margin-top: 40px;

			p {
				flex: 1;
				height: 60px;
				text-align: center;
				line-height: 60px;
				font-size: 22px;
				color: #fff;
				font-weight: bold;
				position: relative;
				cursor: pointer;

				&.active {
					color: #fbfa02;
				}

				&::after {
					display: block;
					content: "";
					width: 2px;
					height: 20px;
					background: url(@/assets/romimg/bag/line.png) no-repeat center;
					background-size: contain;
					position: absolute;
					right: 0;
					top: 50%;
					transform: translateY(-50%);
				}

				&:last-child {
					&::after {
						display: none;
					}
				}
			}
		}
	}

	.beal-tab-item {
		.beal-item-top {
			width: 100%;
			display: flex;
			margin-top: 30px;
			position: relative;

			.sort {
				position: absolute;
				width: 120px;
				height: 50px;
				right: 20px;
				top: 3px;
				border: 1px solid #fbfa02;
				border-radius: 6px;
				color: #fff;
				text-align: center;
				line-height: 52px;
				font-size: 24px;
				font-weight: bold;
				cursor: pointer;

				&:active {
					color: #fbfa02;
				}
			}

			.drop-down {
				position: relative;
				margin-right: 20px;
				width: 200px;
				height: 56px;
				box-sizing: border-box;
				// border: 1px solid #FBFA02;
				z-index: 3;
				color: #fff;

				.sort-text {
					position: relative;
					width: 100%;
					height: 100%;
					padding-left: 26px;
					font-size: 20px;
					line-height: 52px;
					box-sizing: border-box;
					background: transparent;
					cursor: pointer;
					border: 1px solid #fbfa02;

					img {
						position: absolute;
						width: 23px;
						height: 12px;
						right: 26px;
						top: 18px;
						transition: 0.3s;
					}

					&.active {
						img {
							transform: rotate(180deg);
						}
					}
				}

				.down {
					position: absolute;
					width: 200px;
					left: 0px;
					top: 55px;
					border: 1px solid #fbfa02;
					box-sizing: border-box;
					border-top: none;
					border-bottom: none;
					transition: 0.2s;
					overflow: hidden;

					.sort-item {
						width: 100%;
						text-align: center;
						line-height: 56px;
						border-bottom: 1px solid #fbfa02;
						font-size: 20px;
						height: 56px;
						background: rgba($color: #0e0d19, $alpha: 0.8);
						cursor: pointer;
					}
				}
			}
		}

		.beal-item-title {
			display: flex;
			height: 60px;
			align-items: center;
			margin-top: 20px;
			border-bottom: 1px solid #fbfa02;

			p {
				text-align: center;
				color: #fbfa02;
				font-size: 20px;
				font-weight: bold;
				flex: 1;
			}
		}

		.list-wrap {
			display: flex;
			flex-direction: column;
			height: 670px;
			overflow-y: scroll;
			margin-top: 20px;

			&::-webkit-scrollbar {
				width: 0px;
			}

			.beal-item-list {
				display: flex;
				flex-direction: column;
				height: 100%;

				.beal-item {
					height: 80px;
					display: flex;
					align-items: center;
					position: relative;
					border-bottom: 1px solid #fff;

					p {
						text-align: center;
						color: #fff;
						font-size: 22px;
						flex: 1;
					}
				}
			}
		}
	}

	.goods_bl {
		.goods_bl_title {
			display: flex;
			margin-top: 100px;
			border-bottom: 1px solid #fbfa02;

			p {
				color: #fbfa02;
				font-size: 24px;
				text-align: center;
				font-weight: bold;
				height: 80px;
				line-height: 80px;

				&:nth-child(1) {
					width: 29%;
				}

				&:nth-child(2) {
					width: 18%;
				}

				&:nth-child(3) {
					width: 18%;
				}

				&:nth-child(4) {
					width: 35%;
				}
			}
		}

		.list-wrap {
			display: flex;
			flex-direction: column;
			height: 720px;
			overflow-y: scroll;
			margin-top: 20px;

			&::-webkit-scrollbar {
				width: 0px;
			}

			.goods_bl_list {
				margin-bottom: 40px;

				.goods_bl_item {
					position: relative;
					margin-top: -2px;
					height: 80px;
					border-bottom: 1px solid #fff;

					p {
						display: inline-block;
						text-align: center;
						color: #fff;
						font-size: 24px;
						height: 80px;
						line-height: 80px;
						overflow: hidden;

						span {
							display: block;
							width: 100%;
							height: 100%;
						}

						&:nth-child(1) {
							width: 29%;
						}

						&:nth-child(2) {
							width: 18%;
						}

						&:nth-child(3) {
							width: 18%;
						}

						&:nth-child(4) {
							width: 35%;
						}
					}

					&:active {
						p {
							color: #fbfa02;
						}
					}

					.text {
						left: 30px;
						top: -30px;
						height: 40px;
						background: #353748;
						position: absolute;
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
							left: 50%;
							top: 30px;
							transform: translateX(-50%) rotate(180deg);
						}
					}

					&.active {
						.text {
							display: block;
						}
					}
				}
			}
		}
	}
}
</style>
