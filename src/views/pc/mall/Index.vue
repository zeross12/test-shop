<script setup>

import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import { getMallList } from "@/network/api/mall";
import { mallBuy } from "@/network/api/user";
import { getGoodsAttributes } from "@/network/api/index";
import { GoodImageBgType } from "@/util/util";

import imgShotgun from "@/assets/pcimg/lucky/shotgun.png";
import imgMachinegun from "@/assets/pcimg/lucky/machinegun.png";
import imgSmg from "@/assets/pcimg/lucky/smg.png";
import imgSniperrifle from "@/assets/pcimg/lucky/sniperrifle.png";
import imgKnife from "@/assets/pcimg/lucky/knife.png";
import imgHands from "@/assets/pcimg/lucky/hands.png";
import imgPistol from "@/assets/pcimg/lucky/pistol.png";
import imgRifle from "@/assets/pcimg/lucky/rifle.png";
import imgQuan from "@/assets/pcimg/lucky/quan.png";
import imgRecom from "@/assets/pcimg/lucky/recom.png";
import { getGoodsNamePre, getGoodsNameSec } from "@/util/common";
import { tokenName } from "@/config";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const store = useStore();
const pager = ref({ pageIndex: 1, limit: 24 });

//品质筛选
const rarityItems = ref([
	{
		name: t('mall.level0'),
		id: 0,
	},
	{
		name: t('mall.level2'),
		id: 12,
	},
	{
		name: t('mall.level11'),
		id: 11,
	},
	{
		name: t('mall.level10'),
		id: 10,
	},
	{
		name: t('mall.level9'),
		id: 9,
	},
	{
		name: t('mall.level8'),
		id: 8,
	},
	{
		name: t('mall.level7'),
		id: 7,
	},
	{
		name: t('mall.level14'),
		id: 14,
	},
	{
		name: t('mall.level15'),
		id: 15,
	},
	{
		name: t('mall.level16'),
		id: 16,
	},
	{
		name: t('mall.level3'),
		id: 3,
	},
	{
		name: t('mall.level2'),
		id: 2,
	},
	{
		name: t('mall.level1'),
		id: 1,
	},

	{
		name: t('mall.level8_8'),
		id: 8,
		type: 8,
	},
	{
		name: t('mall.level8_11'),
		id: 11,
		type: 8,
	},
	{
		name: t('mall.level8_9'),
		id: 9,
		type: 8,
	},
	{
		name: t('mall.level8_13'),
		id: 13,
		type: 8,
	},
]);
const rarityItem = ref({ name: t('mall.level0'), id: 0 });
const rarityActive = ref(false); //下拉状态
const rarityTextShow = ref(true); //'品质'显示

const qualityItems = ref([]); //类别筛选
const qualityOptItem = ref({ text: "", id: 0 });
const qualityActive = ref(false); //下拉状态
const qualityTextShow = ref(true); //'类别'显示

const exteriorItems = ref([]); //外观筛选
const exteriorItem = ref({ name: t('mall.noLimitCategory'), id: 0 });
const exteriorActive = ref(false); //下拉状态
const exteriorTextShow = ref(true); //'外观'显示

const subcategory = ref([]); //小分类
const subcategoryid = ref(""); //小分类id
const subcategoryActive = ref(true);

const mouseCategoryid = ref(0);

const searchKey = ref(""); //搜索关键字
const filterScreenShow = ref(false); //快速筛选

const ammunition = ref({ min: "", max: "" }); //弹壳区间

//分解选中对象
const exchangeSelItem = ref({});
const exchangeSelItemShow = ref(false);

//触底加载
const loading = ref(false);
const finished = ref(false);
const customLoading = ref(false);

const goodsList = ref([]);

const typeItems = ref([]);
const bigTypeId = ref(""); //大分类id

const ammoArea = ref({ min: 0, max: 0 });

const rucksackAmount = ref("0");
// const typeImgArr = [imgShotgun, imgMachinegun, imgSmg, imgSniperrifle, imgKnife, imgHands, imgPistol, imgRifle];
const typeImgArr = [
	// imgRecom,
	imgKnife,
	imgPistol,
	imgShotgun,
	imgRifle,
	imgSmg,
	// imgShotgun,
	imgHands,
	imgPistol,
];
const cartList = ref([]);
const cartPrice = computed(() => {
	let carts = 0;
	for (let index = 0; index < cartList.value.length; index++) {
		carts += Number(cartList.value[index].price);
	}
	return carts.toFixed(2);
});

onMounted(async () => {
	await getAttributes();
	getList();
});

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
		// typeItems.value.unshift({ id: 0, name: "热推", hotStatus: 1, list: [] });

		let weaponItems = data.weaponItems;
		for (let index = 0; index < typeItems.value.length; index++) {
			const typeItem = typeItems.value[index];
			// if (typeImgArr[index]) {
			typeItem.icon = typeImgArr[index];
			// } else {
			//	 typeItem.icon = typeImgArr[0];
			// }
			let list =
				weaponItems.filter((item) => {
					return item.type == typeItem.id;
				}) || [];
			typeItem.list = list;
		}
		// window.$dev && console.log( typeItems.value )
		bigTypeId.value = typeItems.value[0].id;

		if (typeItems.value.length > 0) onClickLagCategory(typeItems.value[0]);

		qualityItems.value = data.qualityItems;
		qualityItems.value.unshift({ id: 0, name: t('mall.noLimitCategory') });

		exteriorItems.value = data.exteriorItems;
		exteriorItems.value.unshift({ id: 0, name: t('mall.noLimitExterior') });
	}
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
		params.minAmmon = Number(ammoArea.value.min) * 100 + "";
		params.maxAmmon = Number(ammoArea.value.max * 100) + "";
	}
	customLoading.value = true;
	let res = await getMallList(params);
	if (res.code == 0) {
		let items = res.data.items || [];
		let preList = goodsList.value;
		if (res.data.page == 1) {
			finished.value = false;
			preList = [];
		}
		goodsList.value = [...preList, ...items];

		rucksackAmount.value = res.data.rucksackAmount;

		loading.value = false;
		if (items.length < res.data.limit) {
			finished.value = true;
		}
	} else {
		loading.value = false;
		finished.value = true;
	}
	customLoading.value = false;
}

function onLoad() {
	if (customLoading.value) return;
	pager.value.pageIndex += 1;
	getList();
}

function onClickLagCategory(item) {
	bigTypeId.value = item.id;
	subcategoryid.value = 0;
	subcategory.value = [{ id: 0, name: t('openbox.all') }, ...item.list];
	searchKey.value = "";
	pager.value.pageIndex = 1;
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
	subcategoryActive.value = true;
	ammoArea.value.max = 0;
	getList();
}

function onClickHelp() {
	let data = {
		show: true,
		html: t('mall.mallTip'),
	};
	store.commit("setHowPlay", data);
}

function onSearchData() {
	pager.value.pageIndex = 1;
	getList();
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

function onFilterSure() {
	let min = Number(ammunition.value.min);
	let max = Number(ammunition.value.max);
	if (min == undefined || min == null) {
		Warn({ offset: 100, message: t('mall.enterPriceFailForMin'), customClass: "error" });
		return;
	}
	if (max == undefined || max == null) {
		Warn({ offset: 100, message: t('mall.enterPriceFailForMax'), customClass: "error" });
		return;
	}
	if (min > max) {
		Warn({
			offset: 100,
			message: t('mall.enterPriceFail'),
			customClass: "error",
		});
		return;
	}
	filterScreenShow.value = false;
	ammoArea.value.min = min;
	ammoArea.value.max = max;
	pager.value.pageIndex = 1;
	getList();
}

function onClickSubcategory(id) {
	bigTypeId.value = mouseCategoryid.value;
	window.$dev && console.log("mouseCategoryid.value", mouseCategoryid.value);
	if (id != subcategoryid.value) {
		subcategoryid.value = id;
	} else {
		subcategoryid.value = 0;
	}
	pager.value.pageIndex = 1;
	getList();
}

async function onSureExchange() {
	// if (Number(store.state.userInfoAssets.ammon) < Number(exchangeSelItem.value.ammon)) {
	//		 ElNotifcation.Warn('弹壳不足，无法兑换');
	//		 return;
	// }
	let res = await mallBuy({ id: exchangeSelItem.value.id });
	if (res.code == 0) {
		let rucksackGoodsId = res.data.rucksackGoodsId;
		if (rucksackGoodsId != 0) {
			Success({ offset: 100, message: t('mall.exchangeSuccess') });
			exchangeSelItemShow.value = false;
			store.dispatch("getUserInfo");
			pager.value.pageIndex = 1;
			// getList();
		} else {
			Warn({ offset: 100, message: t('mall.exchangeFail'), customClass: "error" });
		}
	}
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

function onClickAddCart(item) {
	if (!item.selectNum) {
		item.selectNum = 0;
	}
	item.selectNum += 1;
	cartList.value.push(item);
}

function onDeleteCart(item) {
	if (item.selectNum) {
		item.selectNum -= 1;
	}
	let itemIndex = cartList.value.findIndex((v) => {
		return v.id == item.id;
	});
	cartList.value.splice(itemIndex, 1);
}

function onClearCart() {
	for (let index = 0; index < cartList.value.length; index++) {
		cartList.value[index].selectNum = 0;
	}
	cartList.value = [];
}

function onConfirmExchage(item) {
	if (!localStorage.getItem(tokenName)) {
		store.commit("setSignView", true);
		return;
	}

	exchangeSelItem.value = item;
	exchangeSelItemShow.value = true;
}

async function onClickCartExchange() {
	if (cartList.value.length == 0) {
		Warn({ offset: 100, message: t('mall.changeGoodsTip'), customClass: "error" });
		return;
	}
	if (cartList.value.length > 1) {
		Warn({
			offset: 100,
			message: t('mall.exchangeGoodsTip'),
			customClass: "error",
		});
		return;
	}

	let res = await mallBuy({ id: cartList.value[0].id });
	if (res.code == 0) {
		let rucksackGoodsId = res.data.rucksackGoodsId;
		if (rucksackGoodsId != 0) {
			Success({ offset: 100, message: t('mall.exchangeSuccess') });
			store.dispatch("getUserInfo");
		} else {
			Warn({ offset: 100, message: t('mall.exchangeFail'), customClass: "error" });
		}
	}
}
</script>

<template>
	<div id="pc-mall-wrap">
		<div class="page-head">
			<div class="page-title">
				<img src="@/assets/pcimg/mall/icon.png" alt="" />
				{{ t('router.mall') }}
			</div>
			<div class="help" @click="onClickHelp"></div>
		</div>
		<div class="mall-main-wrap">
			<div class="mall-content-wrap">
				<div class="mall-search-wrap">
					<div class="info-wrap">{{ t('mall.exchangeTotal', { money: rucksackAmount }) }}</div>
					<div class="search-wrap">
						<input type="text" v-model="searchKey" :placeholder="t('mall.searchText')" />
						<div class="search-btn" @click="onSearchData()">
							<svg class="icon-search">
								<use xlink:href="@/assets/icon.svg#search" ng-href="@/assets/icon.svg#search"></use>
							</svg>
						</div>
					</div>
				</div>
				<div class="mall-type-top">
					<div class="type-items">
						<div class="type-item" :class="{ active: bigTypeId == item.id }" v-for="(item, index) in typeItems"
							:key="index" @click="onClickLagCategory(item)">
							<div class="icon-container">
								<img :src="item.icon" alt="" />
							</div>
							<p>{{ item.name }}</p>
						</div>
					</div>
					<div class="sub-type-items" v-if="subcategory && subcategory.length > 0">
						<div class="sub-title">{{ t('mall.goodsType') }}</div>
						<div v-for="item in subcategory" class="sub-type-item" :key="item.id"
							:class="{ active: subcategoryid == item.id }" @click="onClickSubcategory(item.id)">
							{{ item.name }}
						</div>
					</div>
				</div>
				<div class="fliter-wrap">
					<div class="fliter-left">
						<div class="drop-down">
							<div class="sort-text" @click="onQualityDown">
								<p>{{ rarityItem.name }}</p>
								<img src="@/assets/pcimg/mall/arrow.png" alt="" />
							</div>
							<div class="down" v-if="rarityActive">
								<div class="sort-item" v-for="(item, index) in rarityItems" :key="index"
									@click="onSelectQuality(item)">
									{{ item.name }}
								</div>
							</div>
						</div>
						<div class="drop-down">
							<div class="sort-text" @click="onAppearanceDown">
								<p>{{ exteriorItem.name }}</p>
								<img src="@/assets/pcimg/mall/arrow.png" alt="" />
							</div>
							<div class="down" v-if="exteriorActive">
								<div class="sort-item" v-for="(item, index) in exteriorItems" :key="index"
									@click="onSelectAppearance(item)">
									{{ item.name }}
								</div>
							</div>
						</div>
					</div>
					<div class="fliter-right">
						<div class="input-item">
							<input type="text" v-model="ammunition.min" :placeholder="t('mall.minPrice')" />
						</div>
						<div class="input-item">
							<input type="text" v-model="ammunition.max" :placeholder="t('mall.maxPrice')" />
						</div>
						<div class="opt-btn-item" @click="onFilterSure()">{{ t('common.filter') }}</div>
					</div>
				</div>
				<van-list class="mall-list" v-model="loading" :finished="finished" :finished-text="t('common.noMore')"
					@load="onLoad" :key="pager.pageIndex" :immediate-check="false">
					<div class="mall-list-item" v-for="(item, index) in goodsList" :key="index"
						:class="[{ select: item.selectNum && item.selectNum > 0 }]">
						<div class="pic" :style="'background-image: url(' + getImageBg(item) + ');'">
							<img :src="item.iconUrl" :alt="item.goodsName" />
						</div>
						<p class="hide">{{ item.goodsName }}</p>
						<div class="price">
							<img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt="" />
							{{ item.price }}
						</div>
						<div class="sel-num" v-if="item.selectNum && item.selectNum > 0">
							x{{ item.selectNum }}
						</div>
						<div class="btn-add" @click="onConfirmExchage(item)">{{ t('mall.exchange') }}</div>
					</div>
				</van-list>
			</div>
			<div class="mall-cart-wrap" v-if="false">
				<div class="card-top">
					<div class="top-info">
						<div class="info1">{{ t('mall.cart') }}</div>
						<div class="info2">
							{{ t('mall.priceTotal') }}<img class="pc-price-coin" src="@/assets/pcimg/common/coin.png"
								alt="" /><span>{{ cartPrice }}</span>
						</div>
					</div>
					<div class="top-btn" @click="onClearCart">{{ t('common.clear') }}</div>
				</div>
				<div class="cart-list-wrap">
					<div class="cart-list">
						<div class="cart-item" v-for="(item, index) in cartList" :key="index">
							<div class="pic" :style="'background-image: url(' + getImageBg(item) + ');'">
								<img :src="item.iconUrl" :alt="item.goodsName" />
							</div>
							<div class="item-info">
								<p class="item-info1">{{ getGoodsNamePre(item.goodsName) }}</p>
								<p class="item-info2 hide">
									{{ getGoodsNameSec(item.goodsName) }}
								</p>
								<p class="item-info3">{{ getExteriorName(item.exterior) }}</p>
							</div>
							<div class="btn-delete" @click="onDeleteCart(item)">
								<img src="@/assets/pcimg/common/close.png" alt="" />
							</div>
						</div>
					</div>
				</div>
				<div class="cart-opt" @click="onClickCartExchange">
					{{ t('mall.exchangeConfirm') }}<img class="pc-price-coin" src="@/assets/pcimg/common/coin.png"
						alt="" /><span>{{ cartPrice }}</span>
				</div>
			</div>
		</div>
		<div class="exchange-wrap" :class="{ active: exchangeSelItemShow }">
			<div class="exchange-content-wrap">
				<div class="close" @click="exchangeSelItemShow = false">
					<img src="@/assets/pcimg/common/close.png" alt="" />
				</div>
				<div class="exchange-title">{{ t('mall.confirmExchange') }}</div>
				<div class="price">
					<img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt="" />
					{{ exchangeSelItem.price }}
				</div>
				<div class="goods-wrap">
					<div class="pic" :style="'background-image: url(' + getImageBg(exchangeSelItem) + ');'
						">
						<img :src="exchangeSelItem.iconUrl" alt="" />
					</div>
					<div class="name hide">{{ exchangeSelItem.goodsName }}</div>
				</div>

				<div class="exchange-btn-wrap">
					<p @click="exchangeSelItemShow = false">{{ t('notify.cancel') }}</p>
					<p class="sure" @click="onSureExchange">{{ t('notify.confirm') }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#pc-mall-wrap {
	box-sizing: border-box;
	padding-bottom: 60px;
	padding-top: 50px;
	width: 1440px;
	margin: 0 auto;
	position: relative;
	padding-left: 15px;
	padding-right: 15px;

	.page-head {
		display: flex;
		justify-content: space-between;
		align-items: center;

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

		.help {
			display: flex;
			cursor: pointer;
			width: 60px;
			height: 60px;
			background: url(/src/assets/pcimg/common/help.png) center no-repeat;

			&:hover {
				background: url(/src/assets/pcimg/common/help2.png) center no-repeat;
				background-size: 100% 100%;
			}
		}
	}

	.mall-main-wrap {
		display: flex;
		justify-content: space-between;
		width: 100%;
		margin-top: 30px;

		.mall-content-wrap {
			display: flex;
			flex-direction: column;
			width: 100%;

			.mall-search-wrap {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;
				height: 79px;
				background: #111324;
				padding-left: 32px;
				padding-right: 12px;
				box-sizing: border-box;

				.info-wrap {
					display: flex;
					color: #959ac2;
					font-size: 16px;

					span {
						color: #6d45c0;

						font-size: 16px;
						font-weight: 500;
					}
				}

				.search-wrap {
					display: flex;
					align-items: center;
					width: 592px;
					height: 56px;
					background: #0e0f1e;
					box-sizing: border-box;
					padding-left: 28px;
					padding-right: 15px;
					position: relative;

					input {
						box-sizing: border-box;
						flex: 1;
						border: none;
						background: none;
						color: #fff;
						font-size: 16px;

						&::placeholder {
							color: #878b91;
						}
					}

					.search-btn {
						display: flex;
						align-items: center;
						justify-content: center;
						position: relative;
						width: 40px;
						height: 40px;
						cursor: pointer;

						.icon-search {
							display: inline-block;
							vertical-align: middle;
							fill: currentColor;
							width: 20px;
							height: 20px;
							color: #9c9eac;
							position: relative;
						}
					}
				}
			}

			.mall-type-top {
				display: block;
				background-color: #0d0e1c;
				overflow: hidden;
				// height: 223px;
				width: 100%;
				box-sizing: border-box;
				padding: 0 12px;

				.type-items {
					display: flex;
					height: 190px;
					background-color: #0d0e1d;
					overflow: visible;
					width: 100%;
					// justify-items: center;
					align-items: center;

					.type-item {
						position: relative;
						z-index: 0;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: space-evenly;
						height: 100%;
						// height: 100px;
						padding-left: 10px;
						padding-right: 10px;
						border-bottom: 1px solid #15172c;
						cursor: pointer;
						outline: 0;
						flex: 1;
						box-sizing: border-box;

						p {
							font-size: 14px;
							color: #62626c;
						}

						.icon-container {
							height: 78px;
							max-width: 144px;
							display: flex;
							justify-content: center;
							align-items: center;

							img {
								position: relative;
								z-index: 1;
								opacity: 0.3;
								filter: grayscale(100%);
								max-width: 100%;
								height: auto;
								max-height: 100%;
							}
						}

						&.active {
							img {
								opacity: 1;
								filter: none;
							}

							p {
								color: #fff;
							}

							&::before {
								content: "";
								position: absolute;
								top: 44%;
								left: 50%;
								width: 2px;
								height: 2px;
								border-radius: 50%;
								transform: translate(-50%, -50%);
								background: rgba(67, 42, 192, 0.3);
								box-shadow: 0 0 55px 30px #432ac0;
							}

							&::after {
								content: "";
								position: absolute;
								z-index: -1;
								top: 0;
								bottom: 0;
								left: 0;
								right: 0;
								background: linear-gradient(to top,
										#0d0e1d 30px,
										rgba(13, 14, 29, 0) 90%);
							}
						}
					}
				}

				.sub-type-items {
					display: flex;
					flex-wrap: wrap;
					align-items: center;
					// height: 84px;
					box-sizing: border-box;
					padding-top: 15px;
					padding-bottom: 15px;

					.sub-title {
						font-size: 19px;
						color: #b8b9cc;
						font-weight: 500;
						margin-top: 3px;
						margin-right: 28px;
						box-sizing: border-box;
					}

					.sub-type-item {
						display: flex;
						align-items: center;
						margin-top: 4px;
						margin-bottom: 4px;
						padding-top: 3px;
						padding-left: 12px;
						padding-right: 12px;
						font-size: 16px;
						color: #9898aa;
						font-weight: 300;
						height: 40px;
						border: 1px solid #1e213b;
						border-radius: 4px;
						margin-right: 6px;
						box-sizing: border-box;

						&.active {
							background-color: #4a45b1;
							color: #fff;
							border: 0;
						}
					}
				}
			}

			.fliter-wrap {
				display: flex;
				height: 88px;
				justify-content: space-between;
				width: 100%;
				align-items: center;
				position: relative;
				z-index: 2;

				.fliter-left {
					display: flex;

					.drop-down {
						display: flex;
						position: relative;
						width: 210px;
						height: 40px;
						align-items: center;
						color: #878b91;
						font-size: 14px;
						padding-left: 15px;
						padding-right: 30px;
						box-sizing: border-box;
						border-radius: 4px;
						background: #0e0f1e;

						.sort-text {
							display: flex;
							align-items: center;
							width: 100%;
							height: 100%;
							cursor: pointer;

							p {
								flex: 1;
								font-size: 12px;
							}

							img {
								width: 15px;
								height: 14px;
							}
						}

						.down {
							display: flex;
							flex-direction: column;
							width: 100%;
							position: absolute;
							top: 40px;
							left: 0;

							.sort-item {
								width: 100%;
								display: flex;
								height: 40px;
								align-items: center;
								padding-left: 15px;
								padding-right: 30px;
								font-size: 12px;
								box-sizing: border-box;
								background: #0e0f1e;
								cursor: pointer;
							}
						}

						&:last-child {
							margin-left: 20px;
						}
					}
				}

				.fliter-right {
					display: flex;

					.input-item {
						display: flex;
						align-items: center;
						width: 100px;
						height: 40px;
						border-bottom: 2px solid #4a45b1;
						margin-left: 10px;
						padding: 0 5px;
						box-sizing: border-box;

						input {
							box-sizing: border-box;
							width: 100%;
							border: none;
							background: none;
							color: #fff;
							font-size: 12px;

							&::placeholder {
								color: #878b91;
							}
						}
					}

					.opt-btn-item {
						display: flex;
						width: 80px;
						height: 40px;
						justify-content: center;
						align-items: center;
						color: #fff;
						text-align: center;
						text-shadow: 1px 1px 1px #888;
						font-size: 16px;
						margin-left: 16px;
						border-radius: 4px;
						background: #4a45b1;
						cursor: pointer;
					}
				}
			}

			.mall-list {
				display: grid;
				grid-template-columns: repeat(auto-fill, 195px);
				column-gap: 7px;
				row-gap: 7px;
				width: 100%;
				justify-content: space-between;

				.mall-list-item {
					position: relative;
					width: 195px;
					height: 250px;
					border-radius: 5px;
					background: #1d203c;
					display: flex;
					flex-direction: column;
					align-items: center;

					.pic {
						display: flex;
						justify-content: center;
						align-items: center;
						box-sizing: border-box;
						width: 180px;
						height: 155px;
						margin: 20px auto 0;
						background-repeat: no-repeat;
						background-size: cover;
						background-position: center;

						img {
							max-width: 80%;
							max-height: 80%;
						}
					}

					p {
						width: 90%;
						text-align: center;
						color: #acaec5;
						font-size: 14px;
					}

					.price {
						color: #7bdca2;

						font-size: 16px;
						font-weight: 700;
						margin-top: 15px;
						display: flex;
						align-items: center;
					}

					.btn-add {
						display: none;
						cursor: pointer;
						position: absolute;
						left: 50%;
						transform: translateX(-50%);
						top: 52px;
						height: 49px;
						width: 88px;
						justify-content: center;
						align-items: center;
						border-radius: 33.99px;
						background: rgba(100, 89, 209, 0.83);
						box-shadow: 0px 13px 31px 0px rgba(13, 14, 26, 0.35);
						text-align: center;
						line-height: 49px;
						color: #fff;
						font-size: 20px;

						img {
							width: 130px;
							height: 105px;
						}
					}

					.sel-num {
						position: absolute;
						color: #fff;
						font-size: 16px;
						right: 8px;
						bottom: 8px;
					}

					&:hover {
						background: url(@/assets/pcimg/mall/bg1.png) center no-repeat;
						background-size: 100% 100%;

						.btn-add {
							display: block;
						}
					}

					&.select {
						background: url(@/assets/pcimg/mall/bg2.png) center no-repeat;
						background-size: 100% 100%;

						// &:hover {
						// }
					}
				}

				.van-list__finished-text {
					grid-column-start: 1;
					grid-column-end: 8;
				}
			}
		}

		.mall-cart-wrap {
			width: 360px;
			height: 724px;
			background: #0d0e1a;
			box-shadow: 0px 18px 31px 0px rgba(15, 16, 31, 0.76);
			padding: 30px 25px;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			align-items: center;

			.card-top {
				display: flex;
				align-items: center;
				justify-content: space-between;
				box-sizing: border-box;
				width: 100%;

				.top-info {
					display: flex;
					flex-direction: column;

					.info1 {
						color: #dedfe8;
						font-size: 20px;
						font-weight: 700;
						line-height: 24px;
					}

					.info2 {
						display: flex;
						align-items: center;
						color: #aaacc1;
						font-size: 12px;
						line-height: 18px;
						margin-top: 7px;

						img {
							margin-left: 5px;
						}

						span {
							color: #75dc9e;

							font-size: 16px;
							font-weight: 700;
						}
					}
				}

				.top-btn {
					display: flex;
					width: 107px;
					height: 48px;
					justify-content: center;
					align-items: center;
					border-radius: 4px;
					border: 1px solid #2e304e;
					color: #626694;
					font-size: 12px;
					cursor: pointer;
				}
			}

			.cart-list-wrap {
				flex: 1;
				overflow-y: auto;
				box-sizing: border-box;
				width: 100%;

				.cart-list {
					display: grid;
					grid-template-columns: repeat(auto-fill, 144px);
					column-gap: 18px;
					row-gap: 20px;
					width: 100%;
					justify-content: space-between;
					margin-top: 20px;

					.cart-item {
						position: relative;
						width: 144px;
						height: 185px;
						border-radius: 4px;
						background: #13132b;
						display: flex;
						flex-direction: column;
						align-items: center;

						.pic {
							display: flex;
							justify-content: center;
							align-items: center;
							box-sizing: border-box;
							width: 135px;
							height: 110px;
							margin: 10px auto 0;
							background-repeat: no-repeat;
							background-size: cover;
							background-position: center;

							img {
								max-width: 80%;
								max-height: 80%;
							}
						}

						.item-info {
							display: flex;
							align-items: center;
							flex-direction: column;
							margin-top: -10px;

							.item-info1 {
								color: #bbbdcf;
								font-size: 12px;
							}

							.item-info2 {
								color: #fff;
								font-size: 15px;
								font-weight: 700;
							}

							.item-info3 {
								color: #777a99;
								font-size: 12px;
							}
						}

						.btn-delete {
							display: flex;
							justify-content: center;
							align-items: center;
							cursor: pointer;
							position: absolute;
							width: 26px;
							height: 26px;
							cursor: pointer;
							left: 0;
							top: 0;

							img {
								width: 8px;
								height: 8px;
							}
						}
					}
				}
			}

			.cart-opt {
				display: flex;
				width: 310px;
				height: 60px;
				justify-content: center;
				align-items: center;
				border-radius: 4px;
				background: #3a34b0;
				color: #dedfe8;
				font-size: 16px;
				font-weight: 700;
				margin-top: 20px;
				cursor: pointer;

				img {
					margin-left: 5px;
					margin-bottom: 0px;
				}

				span {

					margin-bottom: -2px;
				}
			}
		}
	}

	.mall_main_wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 1422px;
		margin: 0 auto;

		.sbtab_nav_content {
			display: flex;
			align-items: center;
			position: relative;
			width: 100%;

			.sbtab_nav_wrap {
				display: flex;
				align-items: center;
				width: 100%;
				border-bottom: #fbfa02 1px solid;
				height: 45px;
				margin-top: 20px;
				box-sizing: border-box;

				.sbtab_item {
					display: flex;
					align-items: center;
					justify-content: center;
					position: relative;
					text-align: center;
					width: 158px;
					height: 46px;
					border: 4px solid #fbfa02;
					font-size: 16px;
					color: #fff;
					cursor: pointer;
					box-sizing: border-box;

					p {
						text-align: center;
						width: 100%;
					}

					.arrow {
						width: 26px;
						display: none;
						margin-top: 2px;
					}

					&.active {
						background: #fbfa02;

						p {
							color: #000;
						}

						.arrow {
							display: block;
							margin-left: 66px;
						}
					}
				}
			}

			.sub-type-wrap {
				position: absolute;
				height: auto;
				top: 62px;
				left: 0;
				z-index: 2;
				transform: translateX(-50%);
				padding-top: 20px;

				.sub-type-content {
					width: 280px;
					background: #1e2133;
					border: 2px solid #fbfa02;
					display: flex;
					align-items: center;
					justify-content: space-between;
					flex-wrap: wrap;
					padding: 19px 25px 5px;
					position: relative;

					.filter-type-item {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 120px;
						height: 48px;
						background: #1e2133;
						border: 2px solid #fbfa02;
						color: #fff;
						font-size: 18px;
						margin-bottom: 10px;
						cursor: pointer;

						&.active {
							background: #fbfa02;
							color: #000;
						}
					}

					&::after {
						display: block;
						content: "";
						width: 26px;
						height: 12px;
						background: url(@/assets/pcimg/mall/arrow.png) no-repeat center;
						background-size: 100% 100%;
						position: absolute;
						left: 50%;
						top: -13px;
						transform: translateX(-50%);
					}
				}
			}
		}

		.mall-out {
			box-sizing: border-box;
			width: 100%;

			.sort-fliter-wrap {
				display: flex;
				align-items: center;
				justify-content: space-between;
				width: 100%;
				height: 40px;
				margin-top: 30px;
				padding-bottom: 25px;
				margin-bottom: 25px;
				border-bottom: #fbfa02 2px solid;

				.sort-left {
					display: flex;
					align-items: center;

					.quick-input-wrap {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 260px;
						height: 48px;
						background: none;
						border: 2px solid #fbfa02;
						font-size: 18px;
						cursor: pointer;
					}

					.btn-auto-input {
						display: flex;
						align-items: center;
						box-sizing: border-box;
						margin-left: 20px;

						input {
							width: 160px;
							height: 48px;
							box-sizing: border-box;
							border: 2px solid #fbfa02;
							background: none;
							color: #cecfda;
							text-align: center;
							font-size: 18px;
						}

						.input-line {
							width: 21px;
							height: 4px;
							background: #ffffff;
							margin: 0 10px;
						}
					}

					.btn-opt-wrap {
						display: flex;
						align-items: center;

						.opt-btn-item {
							display: flex;
							align-items: center;
							justify-content: center;
							margin-left: 20px;
							width: 100px;
							height: 48px;
							background: #fbfa02;
							font-size: 18px;
							color: #000;
							cursor: pointer;
						}
					}
				}

				.sort-right {
					display: flex;
					align-items: center;

					.search {
						position: relative;
						width: 387px;
						height: 48px;
						border: 2px solid #fbfa02;

						input {
							position: absolute;
							box-sizing: border-box;
							width: 100%;
							height: 100%;
							left: 0;
							top: 0;
							border: none;
							background: none;
							color: #fff;
							padding-left: 15px;
							padding-right: 116px;
							font-size: 18px;
						}

						.search_btn {
							display: flex;
							justify-content: center;
							align-items: center;
							position: absolute;
							box-sizing: border-box;
							width: 100px;
							height: 100%;
							right: 0;
							top: 0;
							padding-left: 30px;
							cursor: pointer;

							img {
								width: 26px;
							}
						}
					}
				}
			}

			&::-webkit-scrollbar {
				width: 0px;
			}
		}
	}

	.mall_content_wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		background: rgba($color: #000000, $alpha: 0.5);
		left: 0;
		top: 0;
		padding-bottom: 100px;
		z-index: -1;
		opacity: 0;
		transition: 0.2s;

		&.active {
			z-index: 100;
			opacity: 1;
		}

		// .mall_content_top {
		//		 background: url(@/assets/romimg/mall/bg.png) no-repeat center;
		//		 background-size: contain;
		//		 width: 514px;
		//		 height: 579px;

		//		 .mall_content_top-wrap {
		//				 display: flex;
		//				 justify-content: center;
		//				 width: 378px;
		//				 height: 50px;
		//				 margin: 80px auto 0;

		//				 .btn-auto {
		//						 width: 184px;
		//						 height: 50px;
		//						 border: 1px solid #FBFA02;
		//						 text-align: center;
		//						 line-height: 50px;
		//						 font-size: 20px;
		//						 cursor: pointer;

		//						 &:active {
		//								 color: #FBFA02;
		//						 }
		//				 }
		//		 }

		//		 .danke-wrap {
		//				 width: 378px;
		//				 height: 138px;
		//				 margin: 60px auto 0;

		//				 .danke-item {
		//						 display: flex;
		//						 flex-direction: column;
		//						 align-items: center;
		//						 position: relative;
		//						 width: 100%;
		//						 height: 48px;
		//						 margin-bottom: 40px;

		//						 p {
		//								 width: 60px;
		//								 font-size: 20px;
		//						 }

		//						 .danke-input {
		//								 display: flex;
		//								 margin-top: 30px;

		//								 input {
		//										 width: 129px;
		//										 height: 48px;
		//										 border: 1px solid #FBFA02;
		//										 background: none;
		//										 text-align: center;
		//										 line-height: 48px;
		//										 color: #fff;
		//										 font-size: 20px;

		//										 &:focus {
		//												 border-color: #fff;
		//										 }

		//										 &::-webkit-input-placeholder {
		//												 color: #DCDCDC;
		//										 }
		//								 }

		//								 span {
		//										 margin: 0 20px;
		//								 }

		//						 }
		//				 }
		//		 }

		//		 .danke-btn-wrap {
		//				 display: flex;
		//				 justify-content: center;
		//				 margin-top: 60px;

		//				 p {
		//						 margin: 0 15px;
		//						 width: 199px;
		//						 height: 50;
		//						 background: url(@/assets/romimg/common/btn1.png) no-repeat center;
		//						 background-size: contain;
		//						 text-align: center;
		//						 line-height: 50px;
		//						 font-size: 20px;
		//						 color: #141221;
		//						 font-weight: bold;
		//						 cursor: pointer;
		//				 }
		//		 }
		// }
	}

	.exchange-wrap {
		position: fixed;
		width: 100%;
		height: 100%;
		background: rgba($color: #000000, $alpha: 0.7);
		left: 0;
		top: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		padding-bottom: 100px;
		box-sizing: border-box;
		z-index: -1;
		opacity: 0;
		transition: 0.3s;

		&.active {
			z-index: 201;
			opacity: 1;
		}

		.exchange-content-wrap {
			width: 500px;
			height: 602.84px;
			background: #191c34;
			position: relative;

			&::before {
				content: "";
				position: absolute;
				z-index: 0;
				top: 97px;
				left: 50%;
				width: 501px;
				height: 433px;
				transform: translateX(-50%);
				background: url(@/assets/pcimg/mall/bg.png) center no-repeat;
			}

			.close {
				width: 20px;
				height: 20px;
				position: absolute;
				right: 16px;
				top: 16px;
				cursor: pointer;

				img {
					width: 12px;
					height: 12px;
				}
			}

			.exchange-title {
				text-align: center;
				font-size: 26px;
				margin-top: 40px;
				color: #fff;
				position: relative;
			}

			.goods-wrap {
				display: flex;
				justify-content: center;
				align-items: center;
				flex-direction: column;
				position: relative;
				width: 200px;
				height: 252px;
				border: 1px solid #2d2d67;
				background: #171930;
				margin: 33px auto 0;

				.pic {
					display: flex;
					justify-content: center;
					align-items: center;
					box-sizing: border-box;
					width: 190px;
					height: 150px;
					background-repeat: no-repeat;
					background-size: cover;
					background-position: center;

					img {
						max-width: 80%;
						max-height: 80%;
					}
				}

				.name {
					color: #cbccd6;
					font-size: 20px;
					font-weight: 300;
					max-width: 90%;
				}
			}

			.price {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-top: 17px;
				color: #7ef2ad;

				font-size: 23px;
				font-weight: 500;
				position: relative;

				img {
					width: 20px;
					height: 20px;
				}
			}

			.exchange-btn-wrap {
				display: flex;
				justify-content: center;
				margin-top: 60px;
				position: relative;

				p {
					width: 171px;
					height: 66px;
					border-radius: 6px;
					background: #3a34b0;
					text-align: center;
					line-height: 66px;
					color: #fff;
					font-weight: 700;
					font-size: 20px;
					cursor: pointer;

					&.sure {
						background: #7d51df;
						margin-left: 20px;
					}
				}
			}
		}
	}
}
</style>
