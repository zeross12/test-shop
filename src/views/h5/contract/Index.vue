<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { truncation, playAudio } from "@/util/common";

import { useRouter } from "vue-router";
import {
	recoveryGoods,
	getReplaceGoods,
	replaceGoods,
	getUserRucksack,
} from "@/network/api/user";
import { GoodImageBgType } from "@/util/util";
import { getGoodsLevelColor } from "@/util/common";
import audiorecory from "@/assets/audio/recory.mp3";
import audioshow from "@/assets/audio/show.mp3";

const store = useStore();
const router = useRouter();

const itemIndex = ref(-1);
const itemNameIndex = ref(-1);
//可得饰品
const availableAll = ref([]);
const availableList = ref([]);
const availableLoading = ref(true); //加载

const choosekey = ref(0);
const selectList = ref([]);

let recoryaudio = new Audio(audiorecory);
let showaudio = new Audio(audioshow);

//材料饰品
const parameter = ref({
	minCount: 3,
	maxCount: 10,
	minPrice: 1,
	minPercent: 10,
	maxPercent: 2000,
}); //区间，最小价格
const totalPrice = ref(0.0); //总价

//我的饰品
const keyword = ref(""); //搜索关键字
const keywordState = ref(false); //搜索状态

const allGoodsList = ref([]); //背包列表
const goodsList = ref([]); //背包列表
const goodsPager = ref({
	pageIndex: 1,
	limit: 50,
});
const animation = ref("animation"); //动画
const loading = ref(null); //
const finished = ref(false); //
const libraryLoading = ref(true); //加载

//合成相关
const layerWhole = ref(false); //完整遮罩(重铸动画中全屏不可点击)
const furnaceActive = ref(false); //动画开关
const emergeShow = ref(false); //展示
const replaceItem = ref({}); //重铸的物品

onMounted(() => {
	getBagGoods();
	getAllRepGoods();
});

async function getBagGoods() {
	const res = await getUserRucksack();
	if (res.code === 0) {
		let items = res.data.items || [];
		selectList.value = [];
		totalPrice.value = 0;
		allGoodsList.value = items;
		goodsList.value = allGoodsList.value.slice(0, 50);
		loading.value = false;
		goodsPager.value.limit = 50;
		keyword.value = "";
		finished.value = false;
	} else {
		loading.value = false;
		finished.value = true;
	}
	libraryLoading.value = false;
}

async function getAllRepGoods() {
	const res = await getReplaceGoods();
	if (res.code == 0) {
		let items = res.data.items || [];
		availableAll.value = items;
		availableList.value = availableAll.value;
		availableLoading.value = false;
	}
}

async function getRepGoods() {
	let goodsIds = [];
	for (let i = 0; i < selectList.value.length; i++) {
		goodsIds.push(selectList.value[i].id);
	}
	const res = await getReplaceGoods({ goodsIds: goodsIds });
	if (res.code == 0) {
		let items = res.data.items || [];
		availableList.value = items;
	} else {
		availableList.value = availableAll.value;
	}
}

//全选
function allChoose() {
	let length = selectList.value.length;
	if (length >= parameter.value.maxCount) {
		NotifyF("最多" + parameter.value.maxCount + "件饰品");
		return;
	}
	let remainLength = parameter.value.maxCount - length;

	let key = "choose";
	let value = true;
	let index = 0;
	for (let i = 0; i < goodsList.value.length; i++) {
		if (!goodsList.value[i].choose) {
			goodsList.value[i][key] = value;
			selectList.value.push(goodsList.value[i]);
			index += 1;
		}
		if (remainLength <= index) {
			break;
		}
	}
	calcPrice();
	sortGoodsList();
	calAvaliable();
}

function chooseItem(item, index) {
	if (item.choose) {
		delete item.choose;
		let itemIndex = selectList.value.findIndex((v) => {
			return v.id == item.id;
		});
		selectList.value.splice(itemIndex, 1);
	} else {
		let length = selectList.value.length;
		if (length >= parameter.value.maxCount) {
			NotifyF("最多" + parameter.value.maxCount + "件饰品");
			return;
		}
		let key = "choose";
		let value = true;
		item[key] = value;
		selectList.value.push(item);
	}
	calcPrice();
	sortGoodsList();
	calAvaliable();
}

function onSearch() {
	if (keyword.value == "") {
		return;
	}

	libraryLoading.value = true;
	keywordState.value = true;
	let searchArr = allGoodsList.value.filter((item) => {
		return item.goodsName.indexOf(keyword.value.toUpperCase()) != -1;
	});

	goodsList.value = searchArr;
	libraryLoading.value = false;
	finished.value = true;
	choosekey.value += 1;
	sortGoodsList();
}

watch(keyword, (newkeyword, oldkeyword) => {
	if (newkeyword == "") {
		libraryLoading.value = true;
		goodsPager.value.limit = 50;
		goodsList.value = allGoodsList.value.slice(0, 50);
		libraryLoading.value = false;
		finished.value = true;
		choosekey.value += 1;
		keywordState.value = false;
		sortGoodsList();
	}
});

function calcPrice() {
	let allPrice = 0;
	for (let i = 0; i < selectList.value.length; i++) {
		allPrice += Number(selectList.value[i].price);
	}
	totalPrice.value = allPrice;
}

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

function calAvaliable() {
	let length = selectList.value.length;
	if (length == 0) {
		availableList.value = availableAll.value;
	} else if (length < 3) {
		availableList.value = [];
	} else {
		getRepGoods();
	}
}

function onClickContinue() {
	furnaceActive.value = false;
	emergeShow.value = false;
	getBagGoods();
}

function onClickSell() {
	furnaceActive.value = false;
	emergeShow.value = false;

	let params = {
		goodsIds: [replaceItem.value.id],
	};

	recoveryGoods(params).then((res) => {
		if (res.code == 0) {
			playAudio(recoryaudio);
			Notify(res.message);
			store.dispatch("getUserInfo");
		} else {
			NotifyF("分解失败，装备已放回背包");
		}
		getBagGoods();
	});
}

//触底加载
function onLoad() {
	goodsPager.value.limit += 50;
	let length = allGoodsList.value.length;
	if (goodsPager.value.limit >= length) {
		finished.value = true;
		goodsList.value = allGoodsList.value;
	} else {
		loading.value = true;
		goodsList.value = allGoodsList.value.slice(0, goodsPager.value.limit);
		loading.value = false;
	}
	sortGoodsList();
}

function onClickHelp() {
	let data = {
		show: true,
		html: "<p>饰品重铸</p><p><br></p><p>有一些不想要的皮肤饰品怎么办？重铸合约来了！</p><p><br></p><p>您可以从背包中选择不需要的 3 至 10 款皮肤饰品放入材料饰品中，点击「重铸」后您就有机会获得「可得饰品」中的一件随机饰品！您有机会获得的饰品价值取决 于您放入材料饰品中饰品的花费总和，重铸后 可能 得到更高价的饰品哦！</p><p><br></p><p>之后，您就可以在「我的-我的背包-所有饰品」中，查看获取的饰品，饰品可以 立即、兑换或提取；</p><p><strong> </strong></p><p><strong> 特别注意，重铸后，您放入「材料饰品」中的饰品将会消失，请谨慎操作，保持 理性消费噢！</strong></p>",
	};
	store.commit("setHowPlay", data);
}

//重铸
async function onClickTaiHuan() {
	let length = selectList.value.length;
	if (length < Number(parameter.value.minCount)) {
		NotifyF("重铸最少选择三件饰品");
		return;
	}

	layerWhole.value = true;
	replaceItem.value = {};
	if (length > Number(parameter.value.minCount) - 1) {
		let goodsIds = [];
		for (let i = 0; i < selectList.value.length; i++) {
			goodsIds.push(selectList.value[i].id);
		}
		const res = await replaceGoods({ goodsIds: goodsIds });
		if (res.code == 0) {
			let data = res.data || {};
			replaceItem.value = data;

			totalPrice.value = 0;
			goodsList.value = goodsList.value.filter((item) => {
				return !item.choose;
			});
			selectList.value.map((item) => (item.choose = false));
			selectList.value = [];
			startTaiHuan();
		} else {
			layerWhole.value = false;
		}
	} else {
		NotifyF("重铸最少选择三件饰品");
		layerWhole.value = false;
	}
}

//重铸动画
function startTaiHuan() {
	furnaceActive.value = true;
	playAudio(showaudio);

	setTimeout(() => {
		emergeShow.value = true;
		layerWhole.value = false;
		availableList.value = availableAll.value;
	}, 100);
}

//去开箱
function tohome() {
	router.push("/m");
}

function getImageBg(item) {
	let level = item.goodsLevel;
	if (item.goodsType == 2) {
		level = 1;
	}
	return store.getters.getGoodsBgImage(GoodImageBgType.replace, level);
}
function getColor(v) {
	return "color:" + getGoodsLevelColor(v);
}
</script>

<template>
	<div id="contract">
		<div class="bg-layer" v-show="layerWhole"></div>
		<div class="top-wrap" v-if="false">
			<div class="introduce" @click="onClickHelp">玩法介绍 ?</div>
			<p class="title">可得饰品</p>
		</div>
		<div class="contract-wrap">
			<div class="mybag">
				<div class="common-nav">
					<div class="common-nav-item active">背包饰品</div>
				</div>
				<div class="mybag_main">
					<div class="mybag_operation">
						<div class="onekey" @click="allChoose">批量选择</div>
						<div class="search" v-if="false">
							<input
								type="text"
								v-model="keyword"
								placeholder="请输入饰品名称"
							/>
							<div class="search_btn" @click="onSearch">
								<img src="@/assets/romimg/common/search.png" alt="" />
							</div>
						</div>
						<div class="total-price">
							估值: <span>{{ totalPrice.toFixed(2) }}</span>
						</div>
					</div>
					<div class="mybag_list_box" :key="choosekey">
						<p class="tip">
							注：请放入{{ parameter.minCount }}-{{
								parameter.maxCount
							}}件饰品，单件饰品价值不得低于{{ parameter.minPrice }}
						</p>
						<van-loading color="#FBFA02" size="50" v-show="libraryLoading" />
						<div class="mybag_list_box_main" v-show="!libraryLoading">
							<transition name="fade">
								<van-list
									v-model="loading"
									:finished="finished"
									finished-text=""
									@load="onLoad"
									:immediate-check="false"
								>
									<div v-show="goodsList.length > 0" class="contract-list">
										<transition-group :name="animation">
											<div
												class="contract-list-item"
												v-for="(item, index) in goodsList"
												:key="item.id"
												:style="
													`background-image: url(` + getImageBg(item) + `)`
												"
												@click="chooseItem(item, index)"
											>
												<div class="item-sel-wrap">
													<img
														v-show="item.choose"
														src="@/assets/romimg/contract/choose.png"
														alt=""
													/>
												</div>
												<div class="pic">
													<img :src="item.iconUrl" alt="" />
												</div>
												<p class="hide">{{ item.goodsName }}</p>
												<div class="item-price">
													<img src="@/assets/romimg/common/gold.png" alt="" />{{
														item.price
													}}
												</div>
											</div>
										</transition-group>
									</div>
								</van-list>
							</transition>

							<transition name="fade">
								<div class="mybag_list_tip" v-show="goodsList.length == 0">
									<p v-show="!keywordState">
										暂无饰品<span @click="tohome">去获取饰品</span>
									</p>
									<p v-show="keywordState && allGoodsList.length == 0">
										没有饰品<span @click="tohome">去获取饰品</span>
									</p>
									<p v-show="keywordState && allGoodsList.length.length != 0">
										搜索为空
									</p>
								</div>
							</transition>
						</div>
					</div>
				</div>
			</div>
			<div class="combine">
				<div class="combine_main" @click="onClickTaiHuan">
					<img class="icon1" src="@/assets/romimg/contract/icon1.png" alt="" />
					<img class="icon2" src="@/assets/romimg/contract/icon2.png" alt="" />
					<p>重铸</p>
				</div>
			</div>
			<div class="ava-wrap">
				<div class="ava-tip">
					<span> 可得饰品 </span>
					<p>您将随机获得其中一件饰品</p>
				</div>
				<div class="ava-list-box">
					<van-loading color="#FBFA02" size="50" v-show="availableLoading" />
					<div class="ava-list-box-main" v-show="!availableLoading">
						<transition name="fade">
							<div class="contract-list" v-show="availableList.length > 0">
								<div
									class="contract-list-item"
									v-for="(item, index) in availableList"
									:key="index"
									:style="`background-image: url(` + getImageBg(item) + `)`"
								>
									<div
										class="probability"
										v-if="item.probability && totalPrice > 0"
										:style="getColor(item.goodsLevel)"
										@click="
											itemIndex == index
												? (itemIndex = -1)
												: (itemIndex = index)
										"
									>
										{{ truncation(item.probability) }}%
									</div>
									<div class="item-sel-wrap"></div>
									<div class="pic">
										<img :src="item.iconUrl" alt="" />
									</div>
									<p
										class="hide"
										@click="
											itemNameIndex == index
												? (itemNameIndex = -1)
												: (itemNameIndex = index)
										"
									>
										{{ item.goodsName }}
									</p>
									<div class="item-price">
										<img src="@/assets/romimg/common/gold.png" alt="" />{{
											item.price
										}}
									</div>
									<div
										class="prob-text"
										v-if="item.probability && totalPrice > 0"
										:class="{ show: itemIndex == index }"
									>
										{{ item.probability }}
									</div>
									<div class="name-text" v-if="itemNameIndex == index">
										{{ item.goodsName }}
									</div>
								</div>
							</div>
						</transition>

						<transition name="fade">
							<div
								class="available-list-tip"
								v-show="availableList.length == 0"
							>
								没有可重铸的饰品
							</div>
						</transition>
					</div>
				</div>
			</div>
		</div>
		<div class="result-wrap" :class="{ active: emergeShow }" @touchmove.prevent>
			<div class="result-content">
				<div class="resultbox">
					<div class="result-title">
						<img src="@/assets/romimg/contract/bt_title.png" alt="" />
					</div>
					<div class="result-img">
						<img :src="replaceItem.iconUrl" alt="" />
					</div>
					<div class="result-name hide">{{ replaceItem.goodsName }}</div>
					<div class="result-price">
						<img src="@/assets/romimg/common/gold.png" alt="" />{{
							replaceItem.price
						}}
					</div>
					<div class="result-btn-wrap">
						<p @click="onClickContinue">继续重铸</p>
						<p v-if="store.state.reserveStatus == 1" @click="onClickSell">
							分解
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#contract {
	width: 750px;
	padding: 20px 0;
	box-sizing: border-box;
	overflow: hidden;
	color: #fff;

	.bg-layer {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		z-index: 1000;
	}

	.top-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		justify-content: center;
		height: 130px;

		p {
			font-size: 30px;
		}

		.introduce {
			position: absolute;
			font-size: 20px;
			color: #fbfa02;
			height: 48px;
			line-height: 48px;
			right: 20px;
			top: -10px;
		}
	}

	.contract-wrap {
		display: flex;
		flex-direction: column;
		position: relative;
		align-items: center;
		width: 100%;
		margin-bottom: 50px;

		.ava-wrap {
			width: 695px;
			height: 592px;
			border: 2px solid #fbfa02;
			padding: 0 12px;
			box-sizing: border-box;
			overflow: hidden;
			margin-top: 67px;

			.ava-tip {
				display: flex;
				justify-content: space-between;
				font-size: 20px;
				margin-top: 25px;
				color: #fff;
				span {
					color: #fbfa02;
				}
			}

			.ava-list-box {
				width: 100%;
				height: 506px;
				margin-top: 25px;
				overflow: hidden;
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
			width: 100%;
			margin-top: 97px;

			.combine_main {
				width: 397px;
				height: 92px;
				margin: 0 auto;
				background: url(@/assets/romimg/contract/btn.png) no-repeat center;
				background-size: contain;
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;

				.icon1 {
					position: absolute;
					left: -80px;
					bottom: 0;
					width: 156px;
				}

				.icon2 {
					width: 45px;
					margin-right: 20px;
				}

				p {
					font-size: 40px;
					font-weight: bold;
					color: #010101;
				}
			}
		}
	}

	.mybag {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 40px;
		box-sizing: border-box;
		overflow: hidden;
		width: 100%;

		.common-nav {
			margin-left: 30px;
		}

		.mybag_main {
			display: flex;
			align-items: center;
			flex-direction: column;
			width: 710px;
			overflow: hidden;
			box-sizing: border-box;

			.mybag_operation {
				height: 45px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-top: 25px;
				width: 695px;

				.onekey {
					width: 142px;
					height: 40px;
					border: 2px solid #fbfa02;
					box-sizing: border-box;
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 22px;

					&:active {
						color: #fbfa02;
					}
				}

				.search {
					position: relative;
					width: 359px;
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

						img {
							width: 26px;
						}
					}
				}

				.total-price {
					font-size: 24px;
					color: #ffffff;

					span {
						color: #fbfa02;
					}
				}
			}

			.mybag_list_box {
				display: flex;
				flex-direction: column;
				width: 695px;
				height: 592px;
				border: 2px solid #fbfa02;
				margin-top: 20px;
				position: relative;
				box-sizing: border-box;

				.tip {
					font-size: 22px;
					color: #ffffff;
					margin-left: 22px;
					margin-top: 20px;
					margin-bottom: 5px;
				}

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
					box-sizing: border-box;
					padding: 0 12px;

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
								background: url(@/assets/romimg/contract/btn.png) no-repeat
									center;
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
						background: url(@/assets/romimg/openbox/btn_result.png) no-repeat
							center;
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
		height: 100%;
		overflow-y: auto;

		&::-webkit-scrollbar {
			display: none;
			width: 0px;
		}

		.contract-list-item {
			box-sizing: border-box;
			position: relative;
			width: 198px;
			height: 230px;
			margin-bottom: 28px;
			margin-right: 36px;
			background-position: center left;
			background-size: contain;
			background-repeat: no-repeat;
			transition: all 0.3s;

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
				z-index: 2;
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
				float: left;
				width: 192px;
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
				width: 192px;
				height: 110px;
				margin-top: 10px;
				display: flex;
				justify-content: center;
				align-items: center;
				transform: translateY(-192px);

				img {
					max-width: 100%;
					max-height: 100%;
				}
			}

			p {
				font-size: 18px;
				padding: 0 10px;
				box-sizing: border-box;
				margin-top: 4px;
				transform: translateY(-192px);
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
				transform: translateY(-192px);

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
}
</style>
