<script setup>
import { onMounted, ref } from "vue";
import { billDetails, ammoDetails, goodsRecords } from "@/network/api/user";
import { useStore } from "vuex";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const store = useStore();
const active = ref(0); //流水/饰品/礼品

//流水相关
const scoreTabType = ref(1); //币1 弹壳2 积分3
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
				name: t('users.vipRedpack'),
				transType: 13,
			},
			{
				name : t('users.luckySpending'),
				transType : 26
			}
		],
	},
	{
		name: t('users.userRecharge'),
		income: 1,
		typelist: [
			{
				name: t('menu.recharge'),
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
				name: t('menu.ammonBox'),
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
const cusAmmoLoading = ref(false);
const ammoFinished = ref(false);
const ammoData = ref([]); //明细

const task_pager = ref({
	pageIndex: 1,
	pageSize: 20,
});
const task_category = ref([
	{
		name: t('openbox.all'),
		Primaryid: "",
	},
	{
		name: t('users.income'),
		Primaryid: "1",
	},
	{
		name: t('users.expenses'),
		Primaryid: "-1",
	},
]);
const task_downactive = ref(false);
const task_Height = ref(0);
// 选中
const task_item = ref({
	name: t('openbox.all'),
	Primaryid: "",
});

//排序
const task_sort = ref({
	text: t('common.asc'),
	sort: "desc",
});

const task_list = ref([]);
const task_loading = ref(false);
const task_finished = ref(false);

const goodsPager = ref({
	pageIndex: 1,
	limit: 20,
	sortType: 1,
});
const goodsSort = ref({
	txt: t('users.descendingOrderTimestamp'),
	direction: "desc",
	sort: "getTime",
});
const goodsData = ref([]);
const goodLoading = ref(false);
const cusGoodLoading = ref(false);
const goodFinished = ref(false);
const activeIndex = ref(-1);

// const content ="已分解";

onMounted(() => {
	initData();
	getBillDetails();
	getAmmoDetails();
});

// function hasSpecialText() {
//			 return this.content.includes("特定文本");
//		 }

function onClickMainTab(tab) {
	active.value = tab;
	if (tab == 1) {
		goodsPager.value.pageIndex = 1;
		goodFinished.value = false;
		getGoodsDetail();
	}
}

function onClickSubTab(index) {
	scoreTabType.value = index;
	if (index == 3) {
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
	cusAmmoLoading.value = true;

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
	cusAmmoLoading.value = false;
}

//触底刷新
function ammoOnLoad() {
	if (cusAmmoLoading.value) return;
	ammoPager.value.pageIndex += 1;
	getAmmoDetails();
}

//积分
//类别
function task_todown() {
	if (task_Height.value == "auto") {
		task_Height.value = 0;
		task_downactive.value = false;
	} else {
		task_Height.value = "auto";
		task_downactive.value = true;
	}
}

//选择
function task_down(item) {
	task_item.value = item;
	task_Height.value = 0;
	task_downactive.value = false;
	task_finished.value = false;
	task_pager.value.pageIndex = 1;
	getlistPointUserBalanceData();
}

//排序
function totaskSort() {
	if (task_sort.value.sort == "desc") {
		task_sort.value = {
			text: t('common.desc'),
			sort: "asc",
		};
	} else {
		task_sort.value = {
			text: t('common.asc'),
			sort: "desc",
		};
	}
	task_finished.value = false;
	task_pager.value.pageIndex = 1;
	getlistPointUserBalanceData();
}

//积分明细
function getlistPointUserBalanceData() {
	let data = {};
	if (task_item.value.Primaryid == "") {
		data = {
			pager: task_pager.value,
			sort: "createTime",
			direction: task_sort.value.sort,
		};
	} else {
		data = {
			pager: task_pager.value,
			sort: "createTime",
			direction: task_sort.value.sort,
			type: task_item.value.Primaryid,
		};
	}
}

//触底加载
function task_onLoad() {
	// 异步更新数据
	task_pager.value.pageIndex += 1;
	let data = {};
	if (task_item.value.Primaryid == "") {
		data = {
			pager: task_pager.value,
			sort: "createTime",
			direction: task_sort.value.sort,
		};
	} else {
		data = {
			pager: task_pager.value,
			sort: "createTime",
			direction: task_sort.value.sort,
			type: task_item.value.Primaryid,
		};
	}
}

/*饰品明细相关*/
/*明细相关*/
//排序
function onGoodsSortSelect() {
	if (goodsSort.value.direction == "desc") {
		goodsSort.value = {
			txt: t('users.ascendingOrderTimestamp'),
			direction: "asc",
			sort: "getTime",
		};
		goodsPager.value.sortType = 2;
	} else {
		goodsSort.value = {
			txt: t('users.descendingOrderTimestamp'),
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
	cusGoodLoading.value = true;

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
	cusGoodLoading.value = false;
}

//触底刷新
function goodsOnLoad() {
	if (cusGoodLoading.value) return;
	goodsPager.value.pageIndex += 1;
	getGoodsDetail();
}

//名称显示
function toactiveIndex(index) {
	if (index == activeIndex.value) {
		activeIndex.value = -1;
	} else {
		activeIndex.value = index;
	}
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
		return t('common.luckyBag')
	} else {
		return item.goodsName;
	}
}

const formatUpdateTime = (dateTimeString) => {
	return dateTimeString.slice(0, -3);
};
</script>

<template>
	<div id="record" class="min-wrap-height">
		<div class="title" v-if="false">{{ t('router.myRecord') }}</div>
		<div class="common-nav" v-if="false">
			<div
				class="common-nav-item"
				:class="{ active: active == 0 }"
				@click="onClickMainTab(0)"
			>
			{{ t('users.runningDetails') }}
			</div>
			<div
				class="common-nav-item"
				:class="{ active: active == 1 }"
				@click="onClickMainTab(1)"
			>
			{{ t('users.goodsRecord') }}
			</div>
		</div>

		<div class="beal-wrap" v-show="active == 0">
			<div class="head">
				<div class="beal-tab">
					<div class="bt">
						<p :class="{ active: scoreTabType == 1 }" @click="onClickSubTab(1)">
							{{ t('users.runningDetails') }}
						</p>
					</div>
					<!-- <p :class="{ 'active': scoreTabType == 2 }" @click="onClickSubTab(2)">弹壳流水明细</p> -->
					<div class="at"></div>
					<div class="bt">
						<p :class="{ active: scoreTabType == 3 }" @click="onClickSubTab(3)">
							{{ t('users.goodsRecord') }}
						</p>
					</div>
				</div>

				<div
					class="order"
					v-show="scoreTabType == 3"
					@click="onGoodsSortSelect"
				>
					{{ goodsSort.txt }}
					<img src="@/assets/romimg/bag/Frame.png" alt="" />
				</div>

				<div class="beal-tab-item" v-show="scoreTabType == 1">
					<div class="beal-item-top">
						<div class="drop-down">
							<div
								class="sort-text"
								@click="todown"
								:class="{ active: downactive }"
							>
								{{ subcategory.name
								}}<img class="" src="@/assets/romimg/bag/Vector.png" alt="" />
							</div>
							<div class="down" :style="'height:' + lsDownHeight">
								<div
									class="sort-item"
									v-for="(item, index) in category"
									:key="index"
									@click="down(item)"
								>
									{{ item.name }}
								</div>
							</div>
						</div>

						<div class="drop-down-1">
							<div
								class="sort-text"
								@click="sub_todown"
								:class="{ active: subDownActive }"
							>
								{{ subItem.name
								}}<img src="@/assets/romimg/bag/Vector.png" alt="" />
							</div>
							<div class="down" :style="'height:' + subDownHeight">
								<div
									class="sort-item"
									v-for="(item, index) in subcategory.typelist"
									:key="index"
									@click="subDown(item)"
								>
									{{ item.name }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="beal-tab-item" v-show="scoreTabType == 1">
				<div class="beal-item-title">
					<p>{{ t('users.type') }}</p>
					<p>{{ t('users.describe') }}</p>
					<p>{{ t('lucky.price') }}</p>
					<p>{{ t('common.time') }}</p>
				</div>
				<div class="list-wrap">
					<van-list
						v-model="loading"
						:finished="finished"
						:finished-text="t( 'common.noMore' )"
						@load="onLoad"
						:key="amountPager.pageIndex"
						:immediate-check="false"
					>
						<div class="beal-item-list">
							<div
								class="beal-item"
								v-for="(item, index) in amountDetails"
								:key="index"
							>
								<p>{{ getTransTypeName(item.transType) }}</p>
								<p>{{ item.transName }}</p>
								<div class="equally">
									<!-- <img class="img-1" src="@/assets/romimg/bag/coins.svg.png"/> -->
									<div
										:class="{
											positive: item.changedValue > 0,
											negative: item.changedValue < 0,
										}"
									>
										{{ item.changedValue }}
									</div>
								</div>
								<p>{{formatUpdateTime(item.createTime) }}</p>
							</div>
						</div>
					</van-list>
				</div>
			</div>

			<div class="beal-tab-item" v-show="scoreTabType == 2">
				<div class="beal-item-top">
					<div class="drop-down">
						<div
							class="sort-text"
							@click="ammo_todown"
							:class="{ active: ammoDownactive }"
						>
							{{ ammoSubCategory.name
							}}<img src="@/assets/romimg/bag/down_icon.png" alt="" />
						</div>
						<div class="down" :style="'height:' + ammoHeight">
							<div
								class="sort-item"
								v-for="(item, index) in ammoCategory"
								:key="index"
								@click="ammoDown(item)"
							>
								{{ item.name }}
							</div>
						</div>
					</div>
					<div class="drop-down">
						<div
							class="sort-text"
							@click="ammoSubTodown"
							:class="{ active: ammoSubDownactive }"
						>
							{{ ammoSubItem.name
							}}<img src="@/assets/romimg/bag/down_icon.png" alt="" />
						</div>
						<div class="down" :style="'height:' + ammoSubHeight">
							<div
								class="sort-item"
								v-for="(item, index) in ammoSubCategory.typelist"
								:key="index"
								@click="ammoSubDown(item)"
							>
								{{ item.name }}
							</div>
						</div>
					</div>
				</div>

				<div class="beal-item-title">
					<p>{{ t('users.type') }}</p>
					<p>{{ t('users.describe') }}</p>
					<p>{{ t('lucky.price') }}</p>
					<p>{{ t('common.time') }}</p>
				</div>
				<div class="list-wrap">
					<van-list
						v-model="ammoLoading"
						:finished="ammoFinished"
						:finished-text="t( 'common.noMore' )"
						@load="ammoOnLoad"
						:key="ammoPager.pageIndex"
						:immediate-check="false"
					>
						<div class="beal-item-list">
							<div
								class="beal-item"
								v-for="(item, index) in ammoData"
								:key="index"
							>
								<p>{{ getAmmoTransTypeName(item.transType) }}</p>
								<p>{{ item.transName }}</p>
								<p>{{ item.changedValue }}</p>
								<p>{{ item.createTime }}</p>
							</div>
						</div>
					</van-list>
				</div>
			</div>

			<div class="beal-tab-item" v-show="scoreTabType == 3">
				<div class="goods_bl">
					<div class="goods_bl_title">
						<p>{{ t('common.goodsName') }}</p>
						<p>{{ t('users.source') }}</p>
						<p>{{ t('common.status') }}</p>
						<p>{{ t('common.time') }}</p>
					</div>
					<div class="list-wrap">
						<van-list
							v-model="goodLoading"
							:finished="goodFinished"
							:finished-text="t( 'common.noMore' )"
							@load="goodsOnLoad"
							:immediate-check="false"
						>
							<div class="goods_bl_list">
								<div
									class="goods_bl_item"
									v-for="(item, index) in goodsData"
									:key="index"
									:class="{ active: activeIndex == index }"
									@click.stop="toactiveIndex(index)"
								>
									<p>
										<span class="hide">{{ getGoodsName(item) }}</span>
									</p>
									<p>{{ item.originName }}</p>
									<p :class="{ 'special-text': '已分解' === item.statusName }">
										{{ item.statusName }}
									</p>
									<p>{{ formatUpdateTime(item.updateTime) }}</p>
									<div class="text">{{ item.goodsName }}</div>
								</div>
							</div>
						</van-list>
					</div>
				</div>
			</div>
		</div>

		<div class="goods_bl" v-show="active == 1">
			<div class="goods_bl_title">
				<p>{{ t('common.goodsName') }}</p>
				<p>{{ t('users.source') }}</p>
				<p>{{ t('common.status') }}</p>
				<p>{{ t('common.time') }}</p>
			</div>
			<div class="list-wrap">
				<van-list
					v-model="goodLoading"
					:finished="goodFinished"
					:finished-text="t( 'common.noMore' )"
					@load="goodsOnLoad"
					:immediate-check="false"
				>
					<div class="goods_bl_list">
						<div
							class="goods_bl_item"
							v-for="(item, index) in goodsData"
							:key="index"
							:class="{ active: activeIndex == index }"
							@click.stop="toactiveIndex(index)"
						>
							<p>
								<span class="hide">{{ getGoodsName(item) }}</span>
							</p>
							<p>{{ item.originName }}</p>
							<p>{{ item.statusName }}</p>
							<p>{{ item.updateTime }}</p>
							<div class="text">{{ item.goodsName }}</div>
						</div>
					</div>
				</van-list>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#record {
	// padding: 50px 62px;
	box-sizing: border-box;
	// margin: 50px 0px;
	min-height: 123px;
	width: 750px;
	background: #15172c;
	background-size: contain;

	.at {
		width: 10%;
	}

	.bt {
		width: 45%;
		outline: 2px solid #2d2d67;
	outline-offset: -2px; /* 负的 outline-offset 值将描边内缩，使元素大小不变 */
		border-radius: 12px;
	p{
		font-size: 24px !important;
	}
	}

	.negative {
		font-weight: bold; /* 加粗字体 */
		font-size: 24px;
		color: #ffffff;
	}

	.special-text {
		// all: unset; /* 清除所有属性，包括继承的属性和样式 */
		color: #7ef2ad !important; /* 设置最高优先级，覆盖其他样式 */
		// background-color: #70C593;
		// font-color: #7EF2AD;
	}

	.order {
		display: flex;
		// justify-content: center; /* 水平居中 */
		align-items: center; /* 垂直居中 */
		color: #b4b8cd;
		font-size: 24px;
		margin-top: 20px;
		height: 50px;
		margin-left: 20px;
		img {
			height: 32px;
			width: 32px;
		}
	}

	.equally {
		width: 20%;
		display: flex;

		justify-content: center; /* 水平居中 */
		// flex-direction: column; /* 垂直排列 */
		// justify-content: center; /* 水平居中 */
		// margin-right: 45px;
		// background-color: #554BF7;
		// align-items: center; /* 垂直居中 */

		// justify-content: center; /* 水平居中 */
		// align-items: center; /* 垂直居中 */
		// justify-content: space-between; /* 子元素均匀分布，第一个元素在起始位置，最后一个元素在结束位置 */

		// P{
		// 	background-color: #70C593;
		// 	color: #aa0000;
		// }

		img {
			margin-top: 6px;
		}
	}

	.positive {
		font-weight: bold; /* 加粗字体 */
		// width: 100% !important;
		// background-color: #0000ff;
		color: #70c593 !important; /* 设置最高优先级，覆盖其他样式 */
	}

	// .negative {
	//	 color: #70C593;
	//	 font-weight: bold; /* 加粗字体 */
	//	 background-color: #ff0000;
	// }

	.img {
		width: 30px;

		// margin-left: 20px;
		margin-right: -10px;
	}

	.img-1 {
		width: 24px;
		height: 24px;

		// margin-left: 30px;
		margin-right: 10px;
		// margin-top: 10px;
	}

	.head {
		display: flex;
		justify-content: center; /* 水平居中 */
		flex-direction: column; /* 子元素垂直排列 */
		width: 706px;
		height: 180px;
		background-color: #1c203c;
		border-radius: 12px;
	}

	// .details{
	// 	width: 192px;
	// 	height: 68px;
	// 	background-color: #07E1F1;
	// 	border-radius: 12px;

	// 	&:active {
	// 			background-color: #554BF7;
	// 	}

	// }

	.common-nav {
		border-bottom: none;
		margin-top: 40px;

		.sort {
			width: 120px;
			height: 50px;
			position: absolute;
			right: 20px;
			top: 190px;
			border: 2px solid #fbfa02;
			text-align: center;
			line-height: 52px;
			color: #ff0000;
			font-size: 24px;
			font-weight: bold;

			&:active {
				color: #aa0000;
			}
		}
	}

	.beal-wrap {
		position: relative;
		display: flex;
		// justify-content: center; /* 水平居中 */
		align-items: center; /* 垂直居中 */
		flex-direction: column; /* 子元素垂直排列 */
		margin-top: 40px;
		.beal-tab {
			width: 384px;
			height: 60px;
			margin-left: 20px;
			background-color: #1c203c;
			display: flex;
			border-radius: 12px;
			// margin-top: 40px;
			// border: 2px solid #2D2D67;

			p {
				flex: 1;
				height: 60px;
				text-align: center;
				line-height: 60px;
				font-size: 28px;
				color: #b4b6c8;
				// font-weight: bold;
				position: relative;

				&.active {
					border-radius: 12px;
					color: #ffffff;
					background-color: #554bf7;
				}

				&::after {
					display: block;
					content: "";
					width: 2px;
					height: 20px;
					// background: url(@/assets/romimg/bag/line.png) no-repeat center;
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

		.sort {
			// width: 120px;
			height: 50px;
			position: absolute;
			right: 20px;
			top: 90px;
			display: flex;
			align-items: center;
			color: #0000ff;
			font-size: 24px;

			img {
				width: 28px;
				margin-left: 5px;
				margin-right: 10px;
			}
		}
	}

	.beal-tab-item {
		// margin-left: 0px;
		.beal-item-top {
			width: 100%;
			display: flex;
			margin-top: 20px;
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

				// &:active {
				//		 color: #FBFA02;
				// }
			}

			.drop-down-1 {
				display: flex;
				justify-content: space-between; /* 子元素均匀分布，第一个元素在起始位置，最后一个元素在结束位置 */
				width: auto; /* 自适应宽度 */
				position: relative;
				margin-left: 20px;
				// width: 128px;
				height: 53px;
				box-sizing: border-box;

				z-index: 3;
				color: #b4b8cd;

				.sort-text {
					position: relative;
					width: 100%;
					height: 100%;
					padding-left: 26px;
					font-size: 24px;
					line-height: 52px;
					border-radius: 7px;
					box-sizing: border-box;
					background: transparent;
					color: #b4b8cd;
					border: 2px solid #2d2d67;
					padding-right: 75px;

					img {
						position: absolute;
						width: 23px;
						height: 12px;
						right: 20px;
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
					width: 100%;
					top: 51px;
					border: 2px solid #2d2d67;
					box-sizing: border-box;
					border-top: none;
					border-bottom: none;
					transition: 0.2s;
					overflow: hidden;
					// margin-left: 10px;

					.sort-item {
						width: 100%;
						text-align: center;
						line-height: 56px;
						border: 2px solid #2d2d67;
						font-size: 20px;
						height: 56px;
						background: #1c203c;
					}
				}
			}

			.drop-down {
				display: flex;
				justify-content: space-between; /* 子元素均匀分布，第一个元素在起始位置，最后一个元素在结束位置 */
				width: auto; /* 自适应宽度 */
				position: relative;
				margin-left: 20px;
				// width: 128px;
				height: 53px;
				box-sizing: border-box;

				z-index: 3;
				color: #b4b8cd;

				.sort-text {
					position: relative;
					width: 100%;
					height: 100%;
					padding-left: 26px;
					font-size: 24px;
					line-height: 52px;
					border-radius: 7px;
					box-sizing: border-box;
					background: transparent;
					color: #b4b8cd;
					border: 2px solid #2d2d67;
					padding-right: 75px;

					img {
						position: absolute;
						width: 23px;
						height: 12px;
						right: 20px;
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
					width: 100%;
					top: 51px;
					border: 2px solid #2d2d67;
					box-sizing: border-box;
					border-top: none;
					border-bottom: none;
					transition: 0.2s;
					overflow: hidden;
					// margin-left: 10px;

					.sort-item {
						width: 100%;
						text-align: center;
						line-height: 56px;
						border: 2px solid #2d2d67;
						font-size: 20px;
						height: 56px;
						background: #1c203c;
					}
				}
			}
		}

		.beal-item-title {
			display: flex;
			width: 706px;
			height: 80px;
			align-items: center;
			margin-top: 20px;
			background-color: #111324;
			// margin-bottom: 20px;
			// border-bottom: 1px solid #FBFA02;

			p {
				text-align: center;
				color: #535155;
				font-size: 24px;
				font-weight: bold;

				&:nth-child(1) {
					width: 20%;
				}

				&:nth-child(2) {
					width: 20%;
				}

				&:nth-child(3) {
					width: 20%;
				}

				&:nth-child(4) {
					width: 40%;
				}
			}
		}

		.list-wrap {
			display: flex;
			flex-direction: column;
			height: 1225px;
			overflow-y: scroll;

			&::-webkit-scrollbar {
				width: 0px;
			}

			.beal-item-list {
				display: flex;
				flex-direction: column;
				height: 100%;

				.beal-item {
					border-radius: 12px;
					height: 116px;
					display: flex;
					align-items: center;
					position: relative;
					// border-bottom: 1px solid #fff;
					background-color: #131528;
					font-size: 24px;
					margin-bottom: 4px;

					p {
						text-align: center;
						color: #edf0f7;
						font-size: 24px;

						&:nth-child(1) {
							width: 20%;
						}

						&:nth-child(2) {
							width: 20%;
						}

						// &:nth-child(3) {
						//		 width: 20%;
						// }

						&:nth-child(4) {
							width: 40%;
						}

						&:nth-child(5) {
							width: 40%;
						}
					}
				}
			}
		}
	}

	.goods_bl {
		.goods_bl_title {
			display: flex;
			margin-top: 20px;
			height: 80px;
			width: 710px;
			// border-bottom: 1px solid #FBFA02;
			background-color: #111324;
			margin-left: 20px;
			// margin-bottom: 30px;

			p {
				color: #535155;
				font-size: 24px;
				text-align: center;
				font-weight: bold;
				height: 80px;
				line-height: 80px;

				&:nth-child(1) {
					width: 32%;
				}

				&:nth-child(2) {
					width: 20%;
				}

				&:nth-child(3) {
					width: 18%;
				}

				&:nth-child(4) {
					width: 39%;
			margin-right: 20px;
				}
			}
		}

		.list-wrap {
			display: flex;
			flex-direction: column;
			height: 1225px;
			overflow-y: scroll;
			// margin-top: 20px;

			&::-webkit-scrollbar {
				width: 0px;
			}

			.goods_bl_list {
				// margin-bottom: 4px;

				.goods_bl_item {
					display: flex;
					justify-content: center; /* 水平居中 */
					align-items: center; /* 垂直居中 */
					position: relative;
					margin-top: -2px;
					height: 116px;
					// border-bottom: 1px solid #fff;
					margin-left: 20px;
					margin-right: 26px;
					background-color: #131528;
					width: 710px;
					margin-bottom: 4px;
					border-radius: 12px;
					p {
						display: inline-block;
						text-align: center;
						color: #edf0f7;
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
							margin-left: 20px;
						}

						&:nth-child(2) {
							width: 18%;
						}

						&:nth-child(3) {
							width: 18%;
							font-weight: bold; /* 加粗字体 */
							// color: #70C593;
						}

						&:nth-child(4) {
							width: 38%;
							margin-right: 20px;
						}
					}

					// &:active {
					//		 p {
					//				 color: #FBFA02;
					//		 }
					// }

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
							background: url(@/assets/romimg/common/arrow_top.png) no-repeat
								center;
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
