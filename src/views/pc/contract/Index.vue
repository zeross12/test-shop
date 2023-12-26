<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, watch, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { truncation, playAudio, stopAudio } from '@/util/common';

import { useRouter } from 'vue-router';
import { recoveryGoods, getReplaceGoods, replaceGoods, getUserRucksack } from '@/network/api/user'
import { GoodImageBgType } from '@/util/util'
import { getGoodsLevelColor } from '@/util/common';
import audiorecory from '@/assets/audio/recory.mp3'
import audioshow from '@/assets/audio/show.mp3'
import { computed } from 'vue';

const store = useStore();
const router = useRouter();

const itemIndex = ref(-1);
const itemNameIndex = ref(-1);
//可得饰品
const availableAll = ref([])
const availableList = ref([])
const availableLoading = ref(true);//加载

const choosekey = ref(0);
const selectList = ref([]);
const outSelGoodsList = computed(() => { return goodsList.value.filter(item => { return !item.choose }) });//背包列表

let recoryaudio = new Audio(audiorecory);
let showaudio = new Audio(audioshow);

onUnmounted(() => {
	stopAudio(recoryaudio)
	stopAudio(showaudio)
})

//材料饰品
const parameter = ref({
	"minCount": 3,
	"maxCount": 10,
	"minPrice": 1,
	"minPercent": 10,
	"maxPercent": 2000
});//区间，最小价格
const totalPrice = ref(0.00);//总价

//我的饰品
const keyword = ref('');//搜索关键字
const keywordState = ref(false);//搜索状态

const allGoodsList = ref([]);//背包列表
const goodsList = ref([]);//背包列表
const goodsPager = ref({
	pageIndex: 1,
	limit: 50,
});
const animation = ref('animation');//动画
const loading = ref(null);//
const finished = ref(false);//
const libraryLoading = ref(true);//加载

//合成相关
const layerWhole = ref(false);//完整遮罩(重铸动画中全屏不可点击)
const furnaceActive = ref(false);//动画开关
const emergeShow = ref(false);//展示
const replaceItem = ref({});//重铸的物品

onMounted(() => {
	getBagGoods();
	getAllRepGoods();
})

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
		keyword.value = '';
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
		Warn({ offset: 100, message: `最多${parameter.value.maxCount}件饰品`, customClass: 'error' })
		return;
	}
	let remainLength = parameter.value.maxCount - length;

	let key = "choose"
	let value = true
	let index = 0;
	for (let i = 0; i < goodsList.value.length; i++) {
		if (!goodsList.value[i].choose) {
			goodsList.value[i][key] = value
			selectList.value.push(goodsList.value[i])
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
	if (item.choose) return

	let length = selectList.value.length;
	if (length >= parameter.value.maxCount) {
		Warn({ offset: 100, message: `最多${parameter.value.maxCount}件饰品`, customClass: 'error' })
		return;
	}
	let key = "choose";
	let value = true
	item[key] = value
	selectList.value.push(item)

	calcPrice();
	sortGoodsList();
	calAvaliable();
}

function subChooseItem(item, index) {
	if (!item.choose) return
	let itemIndex = selectList.value.findIndex((v) => {
		return v.id == item.id
	})
	let goodsItemIndex = goodsList.value.findIndex((v) => {
		return v.id == item.id
	})
	selectList.value.splice(itemIndex, 1)
	goodsList.value[goodsItemIndex].choose = undefined;

	calcPrice();
	sortGoodsList();
	calAvaliable();
}



function onSearch() {
	if (keyword.value == '') {
		return;
	}

	libraryLoading.value = true;
	keywordState.value = true;
	let searchArr = allGoodsList.value.filter(item => {
		return item.goodsName.indexOf(keyword.value.toUpperCase()) != -1
	})

	goodsList.value = searchArr;
	libraryLoading.value = false;
	finished.value = true;
	choosekey.value += 1;
	sortGoodsList();
}

watch(keyword, (newkeyword, oldkeyword) => {
	if (newkeyword == '') {
		libraryLoading.value = true;
		goodsPager.value.limit = 50;
		goodsList.value = allGoodsList.value.slice(0, 50);
		libraryLoading.value = false;
		finished.value = true;
		choosekey.value += 1;
		keywordState.value = false;
		sortGoodsList();
	}
})

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
	})
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
	furnaceActive.value = false
	emergeShow.value = false
	getBagGoods();
}

function onClickSell() {
	furnaceActive.value = false
	emergeShow.value = false

	let params = {
		goodsIds: [replaceItem.value.id]
	}

	recoveryGoods(params).then(res => {
		if (res.code == 0) {
			playAudio(recoryaudio);
			Success({ offset: 100, message: res.message });
			store.dispatch("getUserInfo");

		} else {
			Warn({ offset: 100, message: '分解失败，装备已放回背包', customClass: 'error' })
		}
		getBagGoods();
	})
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
		html: '<p>饰品重铸</p><p><br></p><p>有一些不想要的皮肤饰品怎么办？重铸合约来了！</p><p><br></p><p>您可以从背包中选择不需要的 3 至 10 款皮肤饰品放入材料饰品中，点击「重铸」后您就有机会获得「可得饰品」中的一件随机饰品！您有机会获得的饰品价值取决 于您放入材料饰品中饰品的花费总和，重铸后 可能 得到更高价的饰品哦！</p><p><br></p><p>之后，您就可以在「我的-我的背包-所有饰品」中，查看获取的饰品，饰品可以 立即、兑换或提取；</p><p><strong> </strong></p><p><strong> 特别注意，重铸后，您放入「材料饰品」中的饰品将会消失，请谨慎操作，保持 理性消费噢！</strong></p>'
	}
	store.commit('setHowPlay', data)
}

//重铸
async function onClickTaiHuan() {
	layerWhole.value = true;
	replaceItem.value = {};
	let length = selectList.value.length;
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
			goodsList.value = goodsList.value.filter(item => { return !item.choose })
			selectList.value.map(item => item.choose = false);
			selectList.value = [];
			startTaiHuan();
		} else {
			layerWhole.value = false;
		}
	} else {
		Warn({ offset: 100, message: '不符合重铸条件', customClass: 'error' })
		layerWhole.value = false;
	}

}

//重铸动画
function startTaiHuan() {
	furnaceActive.value = true
	playAudio(showaudio);

	setTimeout(() => {
		emergeShow.value = true
		layerWhole.value = false
		availableList.value = availableAll.value;
	}, 100)
}

//去开箱
function tohome() {
	router.push('/p')
}

function getImageBg(item) {
	let level = item.goodsLevel;
	if (item.goodsType == 2) {
		level = 1;
	}
	return store.getters.getGoodsBgImage(GoodImageBgType.replace, level);
}
function getColor(v) {
	return 'color:' + getGoodsLevelColor(v)
}

</script>
		
<template>
	<div id="pc-contract">
		<div class="bg-layer" v-show="layerWhole"></div>
		<div class="top-wrap">
			<div class="top-left">
				<p>材料饰品</p>
				<div class="total-price">饰品价值: <span>{{ totalPrice.toFixed(2) }}</span></div>
			</div>
			<div class="top-right">
				<p>可得饰品</p>
				<div class="introduce" @click="onClickHelp">玩法介绍 ?</div>
			</div>

		</div>
		<div class="contract-wrap">
			<div class="rp-goods-wrap">
				<div class="sel-wrap">
					<div class="sel-tip">
						<p>*请选择{{ parameter.minCount }}-{{ parameter.maxCount }}件饰品，单件饰品价值不得低于{{ parameter.minPrice }}
						</p>
					</div>
					<div class="ava-list-box">
						<div class="ava-list-box-main">
							<transition name="fade">
								<div class="contract-list" v-show="selectList.length > 0">
									<div class="contract-list-item" v-for="(item, index) in selectList" :key="index"
										:style="`background-image: url(` + getImageBg(item) + `)`"
										@click="subChooseItem(item, index)">
										<div class="pic">
											<img :src="item.iconUrl" alt="">
										</div>
										<p class="hide">{{
											item.goodsName }}</p>
										<div class="item-price"><img src="@/assets/pcimg/common/coin.svg" alt="">{{
											item.price
										}}
										</div>
									</div>
								</div>
							</transition>
						</div>
					</div>
				</div>
				<div class="combine">
					<div class="combine_main" @click="onClickTaiHuan">
						<p> 重铸</p>
					</div>
				</div>
				<div class="ava-wrap">
					<div class="ava-tip">您将随机获得以下饰品中的一件</div>
					<div class="ava-list-box">
						<van-loading color="#FBFA02" size="50" v-show="availableLoading" />
						<div class="ava-list-box-main" v-show="!availableLoading">
							<transition name="fade">
								<div class="contract-list" v-show="availableList.length > 0">
									<div class="contract-list-item" v-for="(item, index) in availableList" :key="index"
										:style="`background-image: url(` + getImageBg(item) + `)`">
										<div class="probability" v-if="item.probability && totalPrice > 0"
											:style="getColor(item.goodsLevel)"
											@click="itemIndex == index ? itemIndex = -1 : itemIndex = index">
											{{ truncation(item.probability) }}%</div>
										<div class="pic">
											<img :src="item.iconUrl" alt="">
										</div>
										<p class="hide"
											@click="itemNameIndex == index ? itemNameIndex = -1 : itemNameIndex = index">{{
												item.goodsName }}</p>
										<div class="item-price"><img src="@/assets/pcimg/common/coin.svg" alt="">{{
											item.price
										}}
										</div>
										<div class="prob-text" v-if="item.probability && totalPrice > 0"
											:class="{ 'show': itemIndex == index }">{{ item.probability }}</div>
										<div class="name-text" v-if="itemNameIndex == index">{{ item.goodsName }}</div>
									</div>
								</div>
							</transition>

							<transition name="fade">
								<div class="available-list-tip" v-show="availableList.length == 0">没有可重铸的饰品</div>
							</transition>
						</div>
					</div>

				</div>
			</div>
			<div class="mybag">
				<div class="title">我的饰品</div>
				<div class="mybag_main">
					<div class="mybag_operation">
						<div class="search">
							<input type="text" v-model="keyword" placeholder="请输入饰品名称">
							<div class="search_btn" @click="onSearch"><img src="@/assets/romimg/common/search.png" alt="">
							</div>
						</div>
						<div class="onekey" @click="allChoose">一键选中</div>
					</div>
					<div class="mybag_list_box" :key="choosekey">
						<van-loading color="#FBFA02" size="50" v-show="libraryLoading" />
						<div class="mybag_list_box_main" v-show="!libraryLoading">
							<transition name="fade">
								<van-list v-model="loading" :finished="finished" finished-text="" @load="onLoad"
									:immediate-check="false">
									<div v-show="outSelGoodsList.length > 0" class="bag-list">
										<transition-group :name="animation">
											<div class="bag-list-item" v-for="(item, index) in outSelGoodsList"
												:key="item.id" :style="`background-image: url(` + getImageBg(item) + `)`"
												@click="chooseItem(item, index)">
												<div class="pic">
													<img :src="item.iconUrl" alt="">
												</div>
												<p class="hide">{{ item.goodsName }}</p>
												<div class="item-price"><img src="@/assets/pcimg/common/coin.svg" alt="">{{
													item.price
												}}
												</div>
											</div>
										</transition-group>
									</div>
								</van-list>
							</transition>

							<transition name="fade">
								<div class="mybag_list_tip" v-show="outSelGoodsList.length == 0">
									<p v-show="!keywordState">背包内已没有饰品<span @click="tohome">去开启盲盒</span></p>
									<p v-show="keywordState && allGoodsList.length == 0">背包内已没有饰品<span
											@click="tohome">去开启盲盒</span></p>
									<p v-show="keywordState && allGoodsList.length.length != 0">搜不到呢</p>
								</div>
							</transition>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="result-wrap" :class="{ 'active': emergeShow }" @touchmove.prevent>
			<div class="result-content">
				<div class="resultbox">
					<div class="result-title"><img src="@/assets/romimg/contract/bt_title.png" alt=""></div>
					<div class="result-img"><img :src="replaceItem.iconUrl" alt=""></div>
					<div class="result-name hide">{{ replaceItem.goodsName }}</div>
					<div class="result-price"><img src="@/assets/pcimg/common/coin.svg" alt="">{{
						replaceItem.price
					}}</div>
					<div class="result-btn-wrap">
						<p @click="onClickContinue">继续重铸</p>
						<p @click="onClickSell">分解</p>
					</div>
				</div>
			</div>
		</div>

	</div>
</template>
		
<style lang="scss">
#pc-contract {
	width: 1414px;
	margin: 0 auto;
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
		align-items: center;
		position: relative;
		justify-content: space-between;
		height: 62px;
		width: 100%;

		.top-left {
			display: flex;
			width: 440px;
			justify-content: space-between;
			align-items: center;

			p {
				font-size: 24px;

			}

			.total-price {
				font-size: 16px;
				color: #fff;

				span {
					font-weight: bold;
					font-size: 16px;
					color: #FBFA02;
				}
			}
		}

		.top-right {
			display: flex;
			width: 494px;
			justify-content: space-between;
			align-items: center;

			p {
				font-size: 24px;

			}

			.introduce {
				font-size: 16px;
				color: #FBFA02;
				cursor: pointer;
			}
		}

	}

	.contract-wrap {
		position: relative;
		width: 1414px;
		margin-bottom: 50px;

		.rp-goods-wrap {
			display: flex;
			justify-content: space-between;
			align-items: center;
			position: relative;
			width: 1414px;

			.ava-wrap {
				width: 654px;
				height: 574px;
				box-sizing: border-box;
				overflow: hidden;
				background: url(@/assets/pcimg/replace/bg2.png) no-repeat center;
				background-size: contain;
				padding-left: 150px;

				.ava-tip {
					color: #BFC4DF;
					font-size: 18px;
					margin-top: 25px;
				}

				.ava-list-box {
					width: 100%;
					height: 480px;
					margin-top: 20px;
					overflow-y: auto;
					position: relative;


					&::-webkit-scrollbar {
						display: none;
						width: 0px;
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
				width: 253px;
				height: 220px;
				position: absolute;
				left: 50%;
				transform: translateX(-50%);
				z-index: 2;
				top: 128px;


				.combine_main {
					width: 253px;
					height: 220px;
					margin: 0 auto;
					position: relative;
					cursor: pointer;

					p {
						text-align: center;

						font-size: 30px;
						line-height: 220px;
						padding-top: 30px;
					}
				}
			}

			.sel-wrap {
				width: 654px;
				height: 574px;
				padding: 0 20px;
				box-sizing: border-box;
				overflow: hidden;
				background: url(@/assets/pcimg/replace/bg1.png) no-repeat center;
				background-size: contain;

				.sel-tip {
					margin-top: 25px;

					p {
						font-size: 18px;
						color: #BFC4DF;
					}
				}

				.ava-list-box {
					width: 100%;
					height: 480px;
					margin-top: 20px;
					overflow: auto;
					position: relative;

					&::-webkit-scrollbar {
						display: none;
						width: 0px;
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

				.search {
					position: relative;
					width: 359px;
					height: 48px;
					border: 2px solid #FBFA02;

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
		background: rgba($color: #000000, $alpha: .9);
		left: 0;
		top: 0;
		z-index: -1;
		opacity: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		padding-bottom: 320px;
		box-sizing: border-box;
		transition: .3s;

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
					color: #FBFA02;

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
						cursor: pointer;
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
		display: grid;
		grid-template-columns: repeat(auto-fill, 154px);
		column-gap: 10px;
		row-gap: 10px;
		width: 100%;
		margin-bottom: 28px;

		.contract-list-item {
			box-sizing: border-box;
			position: relative;
			width: 154px;
			height: 182px;
			background-position: center left;
			background-size: 100% 100%;
			background-repeat: no-repeat;
			transition: all .3s;
			cursor: pointer;

			.probability {
				position: absolute;
				right: 5px;
				top: 4px;
				font-size: 14px;
				z-index: 1;
			}

			.prob-text {
				position: absolute;
				box-sizing: border-box;
				display: none;
				left: 40px;
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

			&:nth-child(3n) {
				.prob-text {
					left: auto;
					right: 5px;

					&::after {
						left: auto;
						right: 0px;
					}
				}
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
		transition: opacity .3s;
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