<script setup>

import { onMounted, ref } from "vue";
import { useStore } from "vuex";
import { getGoodsLevelColor } from "@/util/common";
import { getMallList } from "@/network/api/mall";
import { mallBuy } from "@/network/api/user";
import { getGoodsAttributes } from "@/network/api/index";
import { GoodImageBgType } from "@/util/util";
import { tokenName } from "@/config";

import { getInfo } from "@/network/api/user";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import Currency from "@/components/h5/common/Currency.vue";
import ShowDialog from "@/components/h5/common/ShowDialog.vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const store = useStore();
const pager = ref({ pageIndex: 1, limit: 20 });

////品质筛选
const rarityItems = ref([
	{
		name: t( 'mall.level0' ),
		id: 0,
	},
	{
		name: t( 'mall.level2' ),
		id: 12,
	},
	{
		name: t( 'mall.level11' ),
		id: 11,
	},
	{
		name: t( 'mall.level10' ),
		id: 10,
	},
	{
		name: t( 'mall.level9' ),
		id: 9,
	},
	{
		name: t( 'mall.level8' ),
		id: 8,
	},
	{
		name: t( 'mall.level7' ),
		id: 7,
	},
	{
		name: t( 'mall.level14' ),
		id: 14,
	},
	{
		name: t( 'mall.level15' ),
		id: 15,
	},
	{
		name: t( 'mall.level16' ),
		id: 16,
	},
	{
		name: t( 'mall.level3' ),
		id: 3,
	},
	{
		name: t( 'mall.level2' ),
		id: 2,
	},
	{
		name: t( 'mall.level1' ),
		id: 1,
	},

	{
		name: t( 'mall.level8_8' ),
		id: 8,
		type: 8,
	},
	{
		name: t( 'mall.level8_11' ),
		id: 11,
		type: 8,
	},
	{
		name: t( 'mall.level8_9' ),
		id: 9,
		type: 8,
	},
	{
		name: t( 'mall.level8_13' ),
		id: 13,
		type: 8,
	},
]);
const rarityItem = ref({ name: "", id: 0 });
const rarityActive = ref(false); //下拉状态
const rarityTextShow = ref(true); //'品质'显示

const qualityItems = ref([]); //类别筛选
const qualityOptItem = ref({ text: "", id: 0 });
const qualityActive = ref(false); //下拉状态
const qualityTextShow = ref(true); //'类别'显示

const exteriorItems = ref([]); //外观筛选
const exteriorItem = ref({ text: "", id: 0 });
const exteriorActive = ref(false); //下拉状态
const exteriorTextShow = ref(true); //'外观'显示

const subcategory = ref([]); //小分类
const subcategoryid = ref(""); //小分类id
const subcategoryActive = ref(true);

const searchKey = ref(""); //搜索关键字
const filterScreenShow = ref(false); //快速筛选
const helpScreenShow = ref(false); //帮助弹窗
const DetailScreenShow = ref(false); //额度弹窗

const showSearch = ref(false);

// 下拉
const exchange = ref([
	{
		text: t('mall.exchange'),
		id: "1",
	},
]);
const exchangeItem = ref({ text: "", id: "" });
const exchangeActive = ref(false);
const exchangeTextShow = ref(true); //引导文字显示

const currency = ref({ min: "", max: "" }); //258币区间
const ammunition = ref({ min: "", max: "" }); //金币区间

const currencyTip = ref(false); //258币提示

//分解选中对象
const exchangeSelItem = ref({});
const exchangeSelItemShow = ref(false);

//触底加载
const loading = ref(false);
const finished = ref(false);

const goodsList = ref([]);

const typeItems = ref([]);
const bigTypeId = ref(""); //大分类id

const ammoArea = ref({ min: 0, max: 0 });
const userStatistics = ref([]); //用户统计项
const userStatisticsList = ref([]);
const AllAmount = ref(0); //实际金币

const freezeAmount = ref(0); //冻结金额
const realAmount = ref(0); //实际金币
const giveAmount = ref(0); //赠送金币
const useAount = ref(0); //可用额度
const runningAmount = ref(0); //流水总额
const openboxAmount = ref(0); //开箱总额
const gainAmount = ref(0); //赠送总额
const exchangeAmount = ref(0); //商城兑换总额
const lastGiveAmount = ref(0); //最后一次充值赠送金额

onMounted(() => {
	getUserStatistics();
	getAttributes();
	getList();
	// //如果用户第一次进来弹窗帮助
	// if (!localStorage.getItem("first_time_in_mall")) {
	//	 helpScreenShow.value = true;
	//	 localStorage.setItem("first_time_in_mall", 1);
	// }
	helpScreenShow.value = true;
});

function hideSearch() {
	showSearch.value = false;
}

async function getAttributes() {
	let res = await getGoodsAttributes();
	if (res.code == 0) {
		let data = res.data || {};
		typeItems.value = data.typeItems.filter((item) => {
			return item.isMallShow;
		});
		typeItems.value.sort((a, b) => {
			return a.id - b.id;
		});
		typeItems.value.unshift({ id: 0, name: t('mall.popular'), hotStatus: 1, list: [] });

		let weaponItems = data.weaponItems;
		for (let index = 0; index < typeItems.value.length; index++) {
			const typeItem = typeItems.value[index];
			let list =
				weaponItems.filter((item) => {
					return item.type == typeItem.id;
				}) || [];
			typeItem.list = list;
		}

		// rarityItems.value = data.rarityItems
		// rarityItems.value.unshift({ id: 0, name: '不限品质' });
		// for (let index = 0; index < rarityItems.value.length; index++) {
		//		 const rarityItem = rarityItems.value[index];
		//		 if (rarityItem.id == 13) {
		//				 rarityItem.name = '探员'
		//		 }
		// }

		qualityItems.value = data.qualityItems;
		qualityItems.value.unshift({ id: 0, name: t( 'mall.noLimitCategory' ) });

		exteriorItems.value = data.exteriorItems;
		exteriorItems.value.unshift({ id: 0, name: t( 'mall.noLimitExterior' ) });
	}
}

async function getUserStatistics() {
	const res = await getInfo();
	if (res.code === 0) {
		window.$dev && console.log(res);
		AllAmount.value = res.data.assets.amount;
		useAount.value = res.data.assets.point;
	}

	//userStatisticsList.value =store.state.userStatistics;
	//window.$dev && console.log('in',store.state.userStatistics);
}
async function getList() {
	let params = {};
	params.page = pager.value.pageIndex;
	params.limit = pager.value.limit;
	if (bigTypeId.value == 0) {
		params.hotStatus = 1;
		if (rarityItem.value.type == 8) {
			params.type = 8;
		}
	}
	if (rarityItem.value.id != 0) {
		params.rarity = rarityItem.value.id;
	}
	if (qualityOptItem.value.id != 0) {
		params.quality = qualityOptItem.value.id;
	}
	if (exteriorItem.value.id != 0) {
		params.exterior = exteriorItem.value.id;
	}
	if (bigTypeId.value != 0) {
		params.type = bigTypeId.value;
	}
	if (subcategoryid.value != 0) {
		params.weapon = subcategoryid.value;
	}
	if (searchKey.value != "") {
		params.goodsName = searchKey.value;
	}
	if (ammoArea.value.max != 0) {
		params.minAmmon = ammoArea.value.min + "";
		params.maxAmmon = ammoArea.value.max * 100 + "";
	}
	let res = await getMallList(params);
	if (res.code == 0) {
		let items = res.data.items || [];
		let preList = goodsList.value;
		if (res.data.page == 1) {
			finished.value = false;
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
}

function onLoad() {
	pager.value.pageIndex += 1;

	getList();
}

function onClickLagCategory(item) {
	bigTypeId.value = item.id;
	subcategoryid.value = 0;
	subcategory.value = item.list;
	searchKey.value = "";
	pager.value.pageIndex = 1;
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
	subcategoryActive.value = true;
	ammoArea.value.max = 0;
	getList();
}

function onSearchData() {
	if (showSearch.value) {
		pager.value.pageIndex = 1;
		getList();
	} else {
		showSearch.value = true;
	}
}

function onQualityDown() {
	rarityActive.value = !rarityActive.value;
	qualityActive.value = false;
	exteriorActive.value = false;
}

function onSelectQuality(item) {
	rarityItem.value = item;
	rarityTextShow.value = false;
	rarityActive.value = false;
	pager.value.pageIndex = 1;
	getList();
}

function onOtherDown() {
	qualityActive.value = !qualityActive.value;
	rarityActive.value = false;
	exteriorActive.value = false;
}

function onSelectOther(item) {
	qualityOptItem.value = item;
	qualityTextShow.value = false;
	qualityActive.value = false;
	pager.value.pageIndex = 1;
	getList();
}

function onAppearanceDown() {
	exteriorActive.value = !exteriorActive.value;
	rarityActive.value = false;
	qualityActive.value = false;
}

function onSelectAppearance(item) {
	exteriorItem.value = item;
	exteriorTextShow.value = false;
	exteriorActive.value = false;
	pager.value.pageIndex = 1;
	getList();
}

function onFilterCancel() {
	filterScreenShow.value = false;
	ammoArea.value.max = 0;
	pager.value.pageIndex = 1;
	getList();
}

function showHelp() {
	helpScreenShow.value = true;
}
function hideHelp() {
	helpScreenShow.value = false;
}
function showDetail() {
	DetailScreenShow.value = true;
}
function hideDetail() {
	DetailScreenShow.value = false;
}
function onFilterSure() {
	let min = Number(ammunition.value.min);
	let max = Number(ammunition.value.max);
	if (min == undefined || min == null) {
		NotifyF(t( 'mall.enterPriceFailForMin' ) );
		return;
	}
	if (max == undefined || max == null) {
		NotifyF(t( 'mall.enterPriceFailForMax' ) );
		return;
	}
	if (min > max) {
		NotifyF( t( 'mall.enterPriceFail' ));
		return;
	}
	filterScreenShow.value = false;
	ammoArea.value.min = min;
	ammoArea.value.max = max;
	pager.value.pageIndex = 1;
	getList();
}

function onSelectExchange(item) {
	exchangeItem.value = item;
	exchangeTextShow.value = false;
	exchangeActive.value = false;
}

function onClickSubcategory(id) {
	if (id != subcategoryid.value) {
		subcategoryid.value = id;
	} else {
		subcategoryid.value = 0;
	}
	pager.value.pageIndex = 1;
	getList();
}

function onConfirmExchage(item) {
	if (!localStorage.getItem(tokenName)) {
		router.push("/m/sign");
		return;
	}

	exchangeSelItem.value = item;
	exchangeSelItemShow.value = true;
}

function onClickFill() {
	//window.$dev && console.log('用户金币信息', store.state.userInfoAssets);
	ammunition.value.min = 0;
	ammunition.value.max = useAount.value;
}

async function onSureExchange() {
	//window.$dev && console.log('兑换商品',exchangeSelItem.value);

	if (parseFloat(exchangeSelItem.value.price) > parseFloat(useAount.value)) {
		NotifyF(t('mall.exchangeFail'));
		return;
	}
	if (
		parseFloat(exchangeSelItem.value.price) >
		parseFloat(store.state.userInfoAssets.amount)
	) {
		NotifyF(t('mall.exchangeFail'));
		return;
	}

	let res = await mallBuy({ id: exchangeSelItem.value.id });
	if (res.code == 0) {
		let rucksackGoodsId = res.data.rucksackGoodsId;
		if (rucksackGoodsId != 0) {
			Notify( t( 'mall.exchangeSuccess' ) );
			exchangeSelItemShow.value = false;
			store.dispatch( t( 'mall.exchangeFail' ) );
			getUserStatistics();
			pager.value.pageIndex = 1;
			// getList();
		} else {
			NotifyF(t( 'mall.exchangeFail' ));
		}
	}
}

function getColor(v) {
	return "color:" + getGoodsLevelColor(v);
}

function getExteriorName(v) {
	for (let index = 0; index < exteriorItems.value.length; index++) {
		const item = exteriorItems.value[index];
		if (item.id == v) {
			return item.name;
		}
	}
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.box, item.goodsLevel);
}

function getImageResultBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.box, item.goodsLevel);
}
</script>

<template>
	<div id="mall-wrap">
		<TopTitleBack :title="t( 'router.mall')"></TopTitleBack>
		<div class="mall-header">
			<div class="user_ammount" v-if="!showSearch">
				<div class="account_info" v-if="store.state.userId != 0">
					{{ t( 'mall.exchangeTotal') }}
					<span class="price">{{ useAount }}</span>
					<img
						src="@/assets/romimg/mall/ic_mall_explain.png"
						alt=""
						@click="showDetail()"
					/>
				</div>
				<div class="account_info" v-if="store.state.userId == 0">
					{{ t( 'mall.logView') }}
				</div>
				<div class="ic_search_container">
					<span class="icon iconfont" @click="onSearchData()">&#xe643;</span>
				</div>
			</div>
			<div class="user_ammount" v-if="showSearch">
				<div class="search">
					<div @click="hideSearch">
						<span class="icon iconfont">&#xe637;</span>
					</div>
					<input type="text" v-model="searchKey" :placeholder="t( 'mall.searchText')" />
					<div class="ic_search_container search_btn" @click="onSearchData()">
						<span class="icon iconfont">&#xe643;</span>
					</div>
				</div>
			</div>
		</div>
		<div class="mall_main_wrap">
			<div class="sbtab_nav_wrap">
				<div
					class="sbtab_item"
					v-for="(item, index) in typeItems"
					:key="index"
					:class="{ active: bigTypeId == item.id }"
					@click="onClickLagCategory(item)"
				>
					<img
						v-if="item.id == 0"
						class="pic"
						src="@/assets/romimg/mall/mall_t0.png"
						alt=""
					/>
					<img
						v-else-if="item.id == 1"
						class="pic"
						src="@/assets/romimg/mall/mall_t1.png"
						alt=""
					/>
					<img
						v-else-if="item.id == 2"
						class="pic"
						src="@/assets/romimg/mall/mall_t2.png"
						alt=""
					/>
					<img
						v-else-if="item.id == 3"
						class="pic"
						src="@/assets/romimg/mall/mall_t3.png"
						alt=""
					/>
					<img
						v-else-if="item.id == 4"
						class="pic"
						src="@/assets/romimg/mall/mall_t4.png"
						alt=""
					/>
					<img
						v-else-if="item.id == 5"
						class="pic"
						src="@/assets/romimg/mall/mall_t5.png"
						alt=""
					/>
					<img
						v-else-if="item.id == 6"
						class="pic"
						src="@/assets/romimg/mall/mall_t6.png"
						alt=""
					/>
					<img
						v-else-if="item.id == 7"
						class="pic"
						src="@/assets/romimg/mall/mall_t7.png"
						alt=""
					/>

					<p>{{ item.name }}</p>
				</div>
			</div>
			<div class="mall_main_right">
				<div class="sort-fliter-wrap">
					<div class="drop-down-wrap">
						<div class="drop-down" :class="{ active: rarityActive }">
							<div class="down-text hide" @click="onQualityDown">
								{{ rarityItem.name }}
								<p v-show="rarityTextShow">{{ t('mall.quality') }}</p>
								<img src="@/assets/romimg/common/arrow_down.png" alt="" />
							</div>
							<div class="down-list" v-show="rarityActive">
								<div
									class="down-item hide"
									:class="{ active: item.name == rarityItem.name }"
									v-for="(item, index) in rarityItems"
									:key="index"
									@click="onSelectQuality(item)"
								>
									{{ item.name }}
								</div>
							</div>
						</div>
						<div class="drop-down" :class="{ active: qualityActive }">
							<div class="down-text hide" @click="onOtherDown">
								{{ qualityOptItem.name }}
								<p v-show="qualityTextShow">{{ t('mall.category') }}</p>
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

						<div class="drop-down" :class="{ active: exteriorActive }">
							<div class="down-text hide" @click="onAppearanceDown">
								{{ exteriorItem.name }}
								<p v-show="exteriorTextShow">{{ t('mall.exterior') }}</p>
								<img src="@/assets/romimg/common/arrow_down.png" alt="" />
							</div>
							<div class="down-list" v-show="exteriorActive">
								<div
									class="down-item hide"
									:class="{ active: item.name == exteriorItem.name }"
									v-for="(item, index) in exteriorItems"
									:key="index"
									@click="onSelectAppearance(item)"
								>
									{{ item.name }}
								</div>
							</div>
						</div>
					</div>
					<div class="btn-sort" @click="filterScreenShow = true">{{ t('common.filter') }}</div>
				</div>
				<div class="mall-out" :key="bigTypeId">
					<div class="sub-cate" v-show="subcategory.length > 0">
						<div class="sub-cate-box" :class="{ active: subcategoryActive }">
							<div class="sub-cate-out" ref="sub-cate-out">
								<div
									class="sub-cate-item"
									ref="sub-cate-item"
									:class="{ active: subcategoryid == item.id }"
									v-for="(item, index) in subcategory"
									:key="index"
									@click="onClickSubcategory(item.id)"
								>
									{{ item.name }}
								</div>
							</div>
						</div>
						<div
							class="sub-cate-btn"
							@click="subcategoryActive = !subcategoryActive"
						>
							{{ subcategoryActive ? t('common.expand') : t('common.close') }}
						</div>
					</div>

					<div class="mall-list-wrap">
						<van-list
							v-if="goodsList.length > 0"
							v-model="loading"
							:finished="finished"
							:finished-text="t( 'common.noMore' )"
							@load="onLoad"
							:key="pager.pageIndex"
							:immediate-check="false"
						>
							<div class="mall-list">
								<div
									class="mall-list-item"
									v-for="(item, index) in goodsList"
									:key="index"
									:style="'background-image: url(' + getImageBg(item) + ');'"
									@click="onConfirmExchage(item)"
								>
									<div class="price active">
										<div class="ammunition">
											<Currency :currency="item.price"></Currency>
											<!-- ${{ item.price }} -->
										</div>
									</div>
									<div class="hot" v-if="item.labelId != 0">
										<img :src="item.labelUrl" alt="" />
									</div>
									<div class="pic">
										<img :src="item.iconUrl" :alt="item.goodsName" />
									</div>

									<div class="goods-name hide">{{ item.goodsName }}</div>
									<div class="goods-level">
										{{ getExteriorName(item.exterior) }}
									</div>
								</div>
							</div>
						</van-list>
						<div class="no-more-wrap" v-else>{{ t( 'common.noMore' ) }}</div>
					</div>
				</div>
			</div>
		</div>

		<div class="popup" :class="{ active: filterScreenShow }">
			<div class="popup-wrap">
				<div class="close" @click="onFilterCancel()">
					<span class="icon iconfont">&#xe637;</span>
				</div>
				<div class="popup-title">
					<div class="pop-title-top">{{ t( 'mall.mallFilter' ) }}</div>
				</div>
				<div class="popup-content">
					<div class="popup-main">
						<div class="btn-auto-input">
							<input
								type="number"
								v-model="ammunition.min"
								:placeholder="t( 'mall.minPrice' )"
							/>
							<span></span>
							<input
								type="number"
								v-model="ammunition.max"
								:placeholder="t( 'mall.maxPrice' )"
							/>
						</div>
					</div>
					<div class="btn-auto" @click="onClickFill()">
						{{ t( 'common.filter' ) }}
					</div>
					<div class="popup-btn-wrap">
						<div
							class="popup-sure-btn popup-cancel-btn"
							@click="onFilterCancel()"
						>
						{{ t( 'notify.cancel' ) }}
						</div>
						<div class="popup-sure-btn" @click="onFilterSure()">{{ t( 'notify.confirm' ) }}</div>
					</div>
				</div>
			</div>
		</div>

		<!-- <div class="popup" :class="{ active: helpScreenShow }">
			<div class="popup-wrap">
				<div class="close" @click="hideHelp()">
					<span class="icon iconfont">&#xe637;</span>
				</div>
				<div class="popup-title">
					<div class="pop-title-top">金币商城帮助</div>
				</div>
				<div class="popup-content">
					<div class="help_detail_info">
						<p>
							商城饰品兑换成功后将收取金币，您可在背包中查收兑换的饰品，饰品提取将通过
							steam 人工发货，可能会有些延迟，请您耐心等待，注意查看报价
						</p>
					</div>
				</div>
			</div>
		</div> -->

		<ShowDialog
			:title="t('mall.mallTitle')"
			:btn-type="-1"
			:show="helpScreenShow"
			@cancel="helpScreenShow = false"
		>
			<div class="dialog-x-content">
				<div class="dialog-row-wrap">
					<div v-html="t( 'mall.mallTip' )"></div>
					<!-- {{  }} -->
				</div>
			</div>
		</ShowDialog>

		<!-- <div class="popup" :class="{ active: DetailScreenShow }">
			<div class="popup-wrap">
				<div class="close" @click="hideDetail()">
					<span class="icon iconfont">&#xe637;</span>
				</div>
				<div class="popup-title">
					<div class="pop-title-top">额度说明</div>
				</div>
				<div class="popup-content">
					<div class="help_detail_info">
						<p>
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;尊敬的用户您好，如您的商城可兑换金额小于当前金币余额，说明近期充值金额未形成足额开箱流水，为防止刷子团队利用规则漏洞干扰正常网站用户、以及预防不法分子洗钱，请您在充值后按照正常流程进行开箱、分解等操作，商城可兑换金额会产生相应累计。
						</p>
						<p>
							*注：普通盲盒、幸运饰品、决战沙场里获取的饰品，分解后产生流水。其余福利性质盲盒、Roll房、或活动赠送饰品的分解不计入流水。
						</p>
					</div>
				</div>
			</div>
		</div> -->

		<!-- <ShowDialog
			:title="t(mall.quotaDescription)"
			:btn-type="-1"
			:cancel-show="false"
			:show="DetailScreenShow"
			@ok="DetailScreenShow = false"
			@cancel="DetailScreenShow = false"
		>
			<div class="dialog-x-content">
				<div class="dialog-row-wrap">
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;尊敬的用户您好，如您的商城可兑换金额小于当前金币余额，说明近期充值金额未形成足额开箱流水，为防止刷子团队利用规则漏洞干扰正常网站用户、以及预防不法分子洗钱，请您在充值后按照正常流程进行开箱、分解等操作，商城可兑换金额会产生相应累计。
				</div>
				<div class="dialog-row-wrap">
					*注：普通盲盒、幸运饰品、决战沙场里获取的饰品，分解后产生流水。其余福利性质盲盒、Roll房、或活动赠送饰品的分解不计入流水。
				</div>
			</div>
		</ShowDialog> -->

		<div class="popup" :class="{ active: exchangeSelItemShow }">
			<div class="popup_top_bg">
				<img src="@/assets/romimg/mall/popup_top_bg.png" />
			</div>
			<div class="popup-wrap popup-wrap_bg">
				<div class="close" @click="exchangeSelItemShow = false">
					<span class="icon iconfont">&#xe637;</span>
				</div>
				<div class="popup-title">
					<div class="pop-title-top">{{ t('mall.exchange') }}</div>
				</div>

				<div class="popup-content">
					<div class="popup-main">
						<div class="result-totle-price">
							<!-- ${{ exchangeSelItem.price }} -->
							<Currency :currency="exchangeSelItem.price"></Currency>
						</div>
						<div
							class="one-result"
							:style="
								'background-image: url(' +
								getImageResultBg(exchangeSelItem) +
								');'
							"
						>
							<div class="weapon-con">
								<img class="one-weapon" :src="exchangeSelItem.iconUrl" alt="" />

								<div class="prize-item-name hide">
									{{ exchangeSelItem?.goodsName }}
								</div>
							</div>
						</div>
					</div>
					<div class="popup-btn-wrap">
						<div
							class="popup-sure-btn popup-cancel-btn"
							@click="exchangeSelItemShow = false"
						>
							<span> {{ t( 'notify.cancel' ) }}</span>
						</div>
						<div class="popup-sure-btn" @click="onSureExchange()">
							<span>{{ t( 'notify.confirm' ) }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#mall-wrap {
	box-sizing: border-box;
	padding-top: 0px;
	color: #fff;
	width: 750px;
	background: #15172c;

	.mall-header {
		width: 100%;
		box-sizing: border-box;
		.user_ammount {
			background: #1b1d35;
			padding-left: 20px;
			padding-right: 20px;
			box-sizing: border-box;
			width: 100%;
			height: 120px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28px;
			.account_info {
				display: flex;
				align-items: center;

				img {
					width: 32px;
					height: 32px;
					margin-left: 20px;
				}
				.price {
					color: #6d45c0;
					font-size: 28px;
					font-style: normal;
					font-weight: 500;
					margin-left: 10px;
				}
			}
			.ic_search_container {
				display: flex;
				flex-direction: row;
				flex: 1;
				justify-content: end;
				align-items: center;
				box-sizing: border-box;

				.icon.iconfont {
					font-size: 32px;
					color: #626476;
				}
			}

			.help_info {
				display: flex;
				align-items: center;
				img {
					width: 32px;
					height: 32px;
				}
			}
		}

		.search {
			display: flex;
			width: 100%;
			align-items: center;
			input {
				box-sizing: border-box;
				text-indent: 20px;
				padding-right: 97px;
				width: 100%;
				height: 80px;
				background: transparent;
				border: transparent;
				font-size: 28px;
				font-weight: 400;
				color: #fff;
				line-height: 80px;
			}
			input::placeholder {
				color: #b4b6c8;
			}
		}
	}

	.mall_main_wrap {
		display: flex;
		flex-wrap: nowrap;
		margin-top: 20px;
		position: relative;

		.sbtab_nav_wrap {
			width: 136px;
			background: #1b1d35;
			border-radius: 0px 6px 6px 0px;
			z-index: 1;

			.sbtab_item {
				width: 136px;
				height: 138px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				margin-bottom: 20px;

				.pic {
					width: 92px;
					height: 70px;
					opacity: 0.3;
				}

				p {
					margin-top: 10px;
					text-align: center;
					font-size: 24px;
					font-weight: 400;
					color: #cbccd6;
				}

				&.active {
					background: url(@/assets/romimg/mall/mall_menu_bg.png) no-repeat
						center center;
					background-size: cover;

					p {
						color: #fff;
						font-weight: 700;
					}

					.pic {
						opacity: 1;
					}
				}
			}
		}

		.mall_main_right {
			display: flex;
			flex-direction: column;
			flex: 1;
		}

		.sort-fliter-wrap {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-left: 15px;
			margin-right: 20px;
			position: relative;

			// &::before {
			//	 content: "";
			//	 display: block;
			//	 // width: 750px;
			//	 height: 24px;

			//	 border-radius: 0px 0px 0px 0px;
			//	 position: absolute;
			//	 top: 0;
			//	 z-index: 0;
			//	 left: -20px;
			// }

			.drop-down-wrap {
				display: flex;
				position: relative;

				.drop-down {
					position: relative;
					width: 144px;
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
							right: 0px;
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
			}

			.btn-sort {
				position: relative;
				text-align: center;
				display: flex;
				font-size: 24px;
				font-weight: 400;
				color: #b4b6c8;
				line-height: 24px;
				margin-right: 20px;
			}
		}

		.mall-out {
			box-sizing: border-box;
			height: 1400px;
			overflow-y: auto;
			margin-left: 15px;

			.sub-cate {
				margin-bottom: 14px;
				display: flex;
				justify-content: space-between;
				padding-top: 20px;
				padding-bottom: 20px;
				padding-right: 20px;

				.sub-cate-box {
					flex: 1;
					height: auto;

					.sub-cate-out {
						width: 100%;
						display: flex;
						flex-wrap: wrap;

						.sub-cate-item {
							box-sizing: border-box;
							height: 58px;
							padding: 0 16px;
							display: flex;
							justify-content: center;
							align-items: center;
							background: transparent;
							border-radius: 8px;
							border: 2px solid #1e213b;
							text-align: center;
							color: #b4b6c8;
							font-size: 24px;
							margin-right: 10px;
							margin-bottom: 10px;

							&.active {
								border: 1px solid #4a45b1;
								background: #4a45b1;
								color: #fff;
							}
						}
					}

					&.active {
						height: 60px;
						overflow: hidden;
					}
				}

				.sub-cate-btn {
					box-sizing: border-box;
					display: flex;
					width: 100px;
					margin-left: 20px;
					height: 60px;
					font-size: 24px;
					text-align: center;
					justify-content: center;
					align-items: center;
					z-index: 3;
					position: relative;
					border-radius: 8px;
					font-weight: 500;
					color: #ffffff;
					background: #4a45b1;

					img {
						position: absolute;
						width: 24px;
						height: 24px;
						right: 10px;
						top: 4px;
						transition: 0.3s;

						&.active {
							top: 10px;
							transform: rotate(180deg);
						}
					}
				}
			}

			.mall-list-wrap {
				box-sizing: border-box;
				margin-right: 10px;
				margin-top: 10px;

				.mall-list {
					display: flex;
					box-sizing: border-box;
					justify-content: space-between;
					flex-wrap: wrap;
					width: 100%;

					.mall-list-item {
						position: relative;
						background: #1b1e38;
						width: 283px;
						height: 440px;
						background-repeat: no-repeat;
						background-position: center center;
						background-size: cover;
						display: flex;
						align-items: center;
						justify-content: center;
						flex-direction: column;
						box-sizing: border-box;
						border-radius: 10px;
						margin-right: 10px;
						margin-bottom: 10px;

						.hot {
							position: absolute;
							top: -20px;
							right: -12px;

							img {
								width: 35px;
							}

							z-index: 2;
						}

						// span {
						//	 display: block;
						//	 text-align: center;
						//	 font-size: 16px;
						//	 color: #eb4b4b;
						//	 margin-top: 18px;
						// }

						.pic {
							display: flex;
							justify-content: center;
							align-items: center;
							margin-left: 34px;
							margin-right: 34px;
							box-sizing: border-box;
							width: 216px;
							height: 196px;

							img {
								max-width: 100%;
								max-height: 100%;
							}
						}

						p {
							padding: 0 20px;
							font-size: 16px;
							margin: 10px 0;
						}

						.goods-name {
							width: 100%;
							box-sizing: border-box;
							font-size: 24px;
							margin-top: 34px;
							font-weight: 300;
							color: #cbccd6;
							padding-left: 10px;
							padding-right: 10px;
						}

						.goods-level {
							text-align: center;
							margin-left: 10px;
							margin-right: 10px;
							margin-top: 10px;
							font-size: 20px;
							font-weight: 500;
							color: #fff;
						}

						.price {
							color: #7ef2ad;
							font-size: 24px;
							font-style: normal;
							font-weight: 500;
							margin-bottom: 34px;
							.ammunition {
								width: 100%;
								display: flex;
								justify-content: center;

								img {
									width: 24px;
									height: 24px;
									margin-right: 10px;
								}

								span {
									font-size: 24px;
								}
							}

							&.active {
								display: flex;
								justify-content: center;
								align-items: center;
								padding-left: 0;
							}
						}

						.mall_list_item_btn {
							width: 144px;
							height: 50px;
							border: 2px solid #fbfa02;
							box-sizing: border-box;
							margin: 25px auto 0px;
							font-size: 20px;
							color: #fbfa02;
							line-height: 48px;
							text-align: center;
						}
					}
				}

				.no-more-wrap {
					text-align: center;
					color: #abb0b9;
					font-size: 24px;
					line-height: 100px;
				}
			}

			&::-webkit-scrollbar {
				width: 0px;
			}
		}
	}

	.popup {
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		box-sizing: border-box;
		background-color: rgba(16, 16, 30, 0.9);
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		transition: 0.3s;
		z-index: -1;
		opacity: 0;

		.popup_top_bg {
			position: relative;
			top: -240px;
			width: 100%;
			img {
				width: 100%;
				height: auto;
			}
		}

		.popup-wrap_bg {
			background: #0d0e1c !important;
			width: 100% !important;
		}

		.popup-wrap {
			background: #191c34;
			width: 710px;
			position: absolute;

			.close {
				align-items: center;
				position: absolute;
				height: 48px;
				width: 48px;
				top: 20px;
				right: 20px;
				z-index: 100;
				span {
					font-size: 36px;
					color: #4b4f6d;
				}
			}
			.popup-title {
				width: 100%;
				margin-top: 26px;
				display: flex;
				align-items: center;
				text-align: center;
				justify-content: center;
				height: 80px;
				background: var(--title-background);
				&::before {
					content: "";
					position: absolute;
					left: 0px;
					width: 228px;
					height: 40px;
					box-sizing: border-box;
					background: var(--title-left-background);
				}
				&::after {
					content: "";
					position: absolute;
					width: 229px;
					height: 41px;
					box-sizing: border-box;
					background: var(--title-right-background);
					right: 0px;
				}
				span {
					font-size: 40px;

					color: #fff;
					text-align: center;
					line-height: 48px;
					text-shadow: var(--title-text-shadow);
				}

				.pop-title-top {
					font-size: 36px;
					color: #fff;
					text-align: center;

					font-style: normal;
					font-weight: 400;
					text-transform: capitalize;
				}
			}

			.popup-content {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				width: 100%;
				margin: 0 auto;
				box-sizing: border-box;
				// overflow-y: auto;
				// margin-top: 30px;
				// margin-bottom: 68px;
				.help_detail_info {
					color: #b4b6c8;
					font-size: 28px;
					font-style: normal;
					font-weight: 500;
					padding-top: 20px;
					padding-left: 46px;
					padding-right: 46px;
					margin-bottom: 40px;

					p {
						margin-bottom: 20px;
						span {
							color: #00cbff;
							margin: 0 5px;
						}
					}
				}

				.btn-auto {
					width: 344px;
					height: 62px;
					border-radius: 50px;
					background: #3a34b0;
					color: #fff;
					font-size: 24px;
					font-style: normal;
					font-weight: 400;
					margin-top: 60px;
					margin-bottom: 20px;
					text-align: center;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.popup-main {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					width: 100%;

					.btn-auto-title {
						width: 100%;
						margin-top: 30px;
						display: flex;
						align-items: center;
						text-align: center;
						justify-content: center;
						height: 80px;
						background: var(--title-background);
						&::before {
							content: "";
							position: absolute;
							left: 0px;
							width: 228px;
							height: 40px;
							box-sizing: border-box;
							background: var(--title-left-background);
						}
						&::after {
							content: "";
							position: absolute;
							width: 229px;
							height: 41px;
							box-sizing: border-box;
							background: var(--title-right-background);
							right: 0px;
						}
						span {
							font-size: 40px;
							color: #fff;
							text-align: center;
							line-height: 48px;
							text-shadow: var(--title-text-shadow);
						}
					}

					.btn-auto-input {
						display: flex;
						align-items: center;
						justify-content: space-between;
						width: 100%;
						box-sizing: border-box;
						padding-left: 50px;
						padding-right: 50px;
						margin-top: 100px;

						span {
							width: 20px;
							height: 2px;
							background: #4b4f6d;
						}

						input {
							box-sizing: border-box;
							text-align: center;
							width: 296px;
							height: 80px;
							color: #b4b6c8;
							font-size: 24px;
							font-style: normal;
							font-weight: 300;
							border-radius: 8px;
							border: 2px solid #4b4f6d;
							background: #212540;
						}
					}

					.goods-wrap {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 100%;
						// height: 147px;
						// margin-top: 77px;

						img {
							height: 200px;
						}
					}

					.goods-name {
						color: #e8e8e8;
						line-height: 40px;
						font-size: 24px;
						margin: 20px 0;
						text-align: center;
					}

					.price {
						display: flex;
						justify-content: center;
						align-items: center;
						color: #30fdfd;

						p {
							display: flex;
							align-items: center;
							font-size: 24px;
							margin: 0 15px;
							color: #aeabf4;

							img {
								width: 30px;
								margin-right: 10px;
							}
						}
					}

					.one-result {
						width: 230px;
						height: 290px;
						background-color: #171930;
						margin: 0 auto;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						background-repeat: no-repeat;
						background-position: center center;
						background-size: contain;

						.weapon-con {
							width: 168px;
							padding-top: 20px;
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: center;

							.one-weapon {
								width: 160px;
							}

							.prize-item-name {
								margin-top: 40px;
								width: 168px;
								box-sizing: border-box;
								color: #cbccd6;
								text-align: center;
								font-size: 24px;
								font-style: normal;
								font-weight: 300;
							}
						}
					}

					.result-totle-price {
						width: 100%;
						text-align: center;
						font-size: 28px;
						font-weight: 500;
						color: #6ecf96;
						margin-bottom: 50px;
					}
				}

				.popup-btn-wrap {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100%;
					margin-top: 60px;
					margin-bottom: 64px;

					.popup-sure-btn {
						box-sizing: border-box;
						display: flex;
						align-items: center;
						justify-content: center;
						width: 212px;
						height: 96px;
						border-radius: 4px;
						background: #7d51df;
						background-size: 100% 100%;
						text-align: center;
						font-size: 28px;
						font-weight: 700;
					}

					.popup-cancel-btn {
						width: 212px;
						height: 96px;
						margin-right: 30px;
						border-radius: 4px;
						background: #3a34b0;
						font-size: 28px;
						font-weight: 700;
					}
				}
			}
		}

		&.active {
			z-index: 999;
			opacity: 1;
		}
	}
	.van-list__finished-text {
		font-size: 32px;
		color: #819ec2 !important;
	}
}
</style>
