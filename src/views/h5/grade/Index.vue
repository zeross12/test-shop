<script setup>

import { ref, nextTick, computed, onMounted } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Autoplay, Navigation, Scrollbar } from "swiper/modules";
import "swiper/less/autoplay";
import "swiper/css/navigation";
import "swiper/swiper-bundle.css";
import weaponListCpt from "@/components/h5/weaponListCpt/Index.vue";
import OpenBoxOneAni from "../openbox/components/OpenBoxOneAni.vue";
import ResultLayer from "../openbox/components/Result.vue";
import Tabs from "@/components/h5/home/Tabs.vue";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import ShowDialog from "@/components/h5/common/ShowDialog.vue";
import {
	getGradeList,
	getBlindBoxGoods,
	openGradeBox,
} from "@/network/api/blind";
import { getInfo } from "@/network/api/user";
import { useStore } from "vuex";
import { add, bignumber } from "mathjs";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const store = useStore();
const userInfoBase = computed(() => store.state.userInfoBase);
const swiperModules = [Autoplay, Pagination, Scrollbar];

const boxList = ref([]); //盲盒列表 5个
const itemData = ref({}); //盲盒信息
const goodsList = ref([]); //武器列表
const availablePoint = ref(0); //当前可用的盲盒点数
const gradeType = ref(0); //今日已开启的福利盲盒类型(0.代表未开启)
const openBoxData = ref([]);

const gradeList = ref([
	{
		grade: 1,
		price: 100,
	},
	{
		grade: 2,
		price: 500,
	},
	{
		grade: 3,
		price: 1500,
	},
	{
		grade: 4,
		price: 3000,
	},
	{
		grade: 5,
		price: 6000,
	},
]); //福利列表
const gradeid = ref(5); //当前用户福利

const prizeData = ref({ show: "", list: [] }); //奖品信息

const animationxRef = ref(null);
const resultRef = ref(null);
const layer = ref(false);
const isAnimation = ref(false);
const detailScreenShow = ref(false);

//爆率数据
const rarityList = ref([
	{
		icon: new URL("../../../assets/romimg/openbox/baolv1.png", import.meta.url)
			.href,
		color: "#B0C3D8",
		probability: 0,
	},
	{
		icon: new URL("../../../assets/romimg/openbox/baolv2.png", import.meta.url)
			.href,
		color: "#6FF0F9",
		probability: 0,
	},
	{
		icon: new URL("../../../assets/romimg/openbox/baolv3.png", import.meta.url)
			.href,
		color: "#4A69F9",
		probability: 0,
	},
	{
		icon: new URL("../../../assets/romimg/openbox/baolv4.png", import.meta.url)
			.href,
		probability: 0,
		color: "#9B52F6",
	},
	{
		icon: new URL("../../../assets/romimg/openbox/baolv5.png", import.meta.url)
			.href,
		probability: 0,
		color: "#EA37F7",
	},
	{
		icon: new URL("../../../assets/romimg/openbox/baolv6.png", import.meta.url)
			.href,
		probability: 0,
		color: "#eb4b4b",
	},
	{
		icon: new URL("../../../assets/romimg/openbox/baolv7.png", import.meta.url)
			.href,
		probability: 0,
		color: "#F9B800",
	},
]);

onMounted(() => {
	getGradeData();
});

async function getGradeData() {
	const res = await getGradeList();
	if (res.code === 0) {
		let items = res.data.items || [];
		availablePoint.value = res.data.availablePoint;
		gradeType.value = res.data.gradeType;
		// gradeType.value = 0;
		boxList.value = items;

		if (items.length > 0) {
			itemData.value = items[0];
			getGradeBoxGoods(itemData.value.boxItem.boxId);
		}
	}
}

async function getGradeBoxGoods(boxId) {
	const res = await getBlindBoxGoods({ boxId: boxId });
	if (res.code === 0) {
		let items = res.data.items || [];
		if (items) {
			goodsList.value = items;

			for (let index = 0; index < rarityList.value.length; index++) {
				let rarityItem = rarityList.value[index];
				rarityItem.probability = 0;
			}
			for (let item of goodsList.value) {
				rarityList.value[item.goodsLevel - 1].probability = add(
					bignumber(rarityList.value[item.goodsLevel - 1].probability),
					bignumber(item.probability)
				);
			}
		}
	}
}

async function startAnimationX() {
	isAnimation.value = true;
	await nextTick();
	animationxRef.value.showAward(openBoxData.value[0]);
}

function onAnimationEnd() {
	layer.value = false;
	isAnimation.value = false;
	showResult();
}

function showResult() {
	layer.value = true;
	resultRef.value.showReuslt(openBoxData.value);
	store.dispatch("getUserInfo");
	getGradeData();
}

function onResultClose() {
	layer.value = false;
}

//切换选中
function onClickItem(item, index) {
	if (item.level != itemData.value.level) {
		itemData.value = item;
		activeIndex.value = index;
		getGradeBoxGoods(itemData.value.boxItem.boxId);
	}
}

async function onClickOpen(boxItem) {
	const res = await openGradeBox({ boxId: boxItem.boxItem.boxId });
	if (res.code == 0) {
		let item = res.data.item;
		openBoxData.value = [item];

		layer.value = true;

		animationxRef.value.randGoodList();
		setTimeout(() => {
			startAnimationX();
		}, 550);

		const infoRes = await getInfo();
		if (infoRes.code === 0) {
			store.commit("setUserAmount", infoRes.data.assets.amount);
		}
	}
}

function onClickHelp() {
	let data = {
		show: true,
		html: t(''),
	};
	store.commit("setHowPlay", data);
}

function getBgImageUrl(item) {
	if (item && item.boxItem && item.boxItem.imageUrl) {
		return "background-image: url(" + item.boxItem.imageUrl + ");";
	} else {
		return "";
	}
}

function getNeedAmount(item) {
	let amount = Number(item.needAmount) - Number(availablePoint.value);
	if (amount < 1000) {
		return "" + amount;
	} else {
		return "" + amount;
	}
}

function getItemName(level) {
	let levelName = "";
	if (level == 1) {
		levelName = t('grade.levelName1');
	} else if (level == 2) {
		levelName = t('grade.levelName2');
	} else if (level == 3) {
		levelName = t('grade.levelName3');
	} else if (level == 4) {
		levelName = t('grade.levelName4');
	} else if (level == 5) {
		levelName = t('grade.levelName5');
	}
	return levelName;
}
function hideDetail() {
	detailScreenShow.value = false;
}
function showDetail() {
	detailScreenShow.value = true;
}
let activeIndex = ref(0);

function onSlideChange(el) {
	window.$dev && console.log("el", el.activeIndex);
	onClickItem(boxList.value[el.activeIndex], el.activeIndex);
}
</script>

<template>
	<div id="grade-wrap" class="min-wrap-height">
		<div class="grade-layer" v-show="layer"></div>

		<TopTitleBack :title="t('router.grade')" :handler="showDetail"></TopTitleBack>
		<div class="introduce" v-if="false">
			<p @click="onClickHelp">{{ t('router.battleHelp') }}</p>
		</div>
		<!-- <div class="grade-list-wrap">
			<div
				class="grade-item"
				:class="{ active: activeIndex == index }"
				v-for="(item, index) in boxList"
				:key="index"
				@click="onClickItem(item, index)"
			>
				<div class="grade-item-top">
					<div class="grade-item-pic" :style="getBgImageUrl(item)">
						<img :src="item.boxItem.weaponImageUrl" alt="" />
					</div>
				</div>
				<div class="grade-item-right">
					<div class="grade-item-rechg">
						<div class="level-wrap">
							{{ getItemName(item.level) }}
						</div>

						<div class="rechg-wrap">
							充值
							<text>{{ item.needAmount }}</text>
							获取
						</div>

						<div
							v-show="
								gradeType == 0 &&
								Number(availablePoint) >= Number(item.needAmount)
							"
							class="grade-item-btn"
							@click="onClickOpen(item)"
						>
							打开
						</div>
						<div
							class="grade-item-btn"
							v-show="gradeType != 0 && item.level != gradeType"
						>
							福利刷新中
						</div>
						<div class="grade-item-btn opened" v-show="item.level == gradeType">
							<span class="icon iconfont">&#xe638;</span>已开启
						</div>
					</div>
				</div>			 
			</div>
		</div> -->

		<swiper
			class="swiper-container swiper-wrapper"
			@slideChange="onSlideChange"
			:modules="swiperModules"
			:allowTouchMove="true"
			:pagination="{ clickable: true }"
		>
			<swiper-slide
				class="swiper-item"
				v-for="(item, index) in boxList"
				:key="index"
				@click="onClickItem(item, index)"
			>
				<div class="swiper-item-top">
					<div class="swiper-item-pic" :style="getBgImageUrl(item)">
						<img :src="item.boxItem.weaponImageUrl" alt="" />
					</div>
				</div>
				<div class="swiper-item-right">
					<div class="swiper-item-rechg">
						<div class="level-wrap">
							<!-- {{ getItemName(item.level) }} -->
							{{item.name}}
						</div>

						<div class="rechg-wrap">
							{{ t('menu.recharge') }}
							<text>{{ item.needAmount }}</text>
							{{ t('grade.get') }}
						</div>

						<div
							v-show="
								gradeType == 0 &&
								Number(availablePoint) >= Number(item.needAmount)
							"
							class="swiper-item-btn"
							@click="onClickOpen(item)"
						>
						{{ t('redpack.open') }}
						</div>
						<div
							class="swiper-item-btn fuli"
							v-show="gradeType != 0 && item.level != gradeType"
						>
						{{ t('grade.refreshing') }}
						</div>
						<div
							class="swiper-item-btn opened"
							v-show="item.level == gradeType"
						>
						{{ t('grade.opened') }}
						</div>
					</div>
				</div>
			</swiper-slide>
		</swiper>

		<div class="grade-sel-box" v-if="false">
			<div class="grade-sel-box-img" :style="getBgImageUrl(itemData)">
				<img
					:src="itemData.boxItem && itemData.boxItem.weaponImageUrl"
					alt=""
				/>
			</div>
			<div
				class="grade-sel-box-btn"
				v-show="
					gradeType == 0 && Number(availablePoint) < Number(itemData.needAmount)
				"
			>
			{{ t('timebox.needRecharge') }}<span>{{
					Number(itemData.needAmount) - Number(availablePoint)
				}}</span
				>{{ t('grade.get') }}
			</div>
			<div
				class="grade-sel-box-btn"
				v-show="gradeType != 0 && itemData.level != gradeType"
			>
			{{ t('grade.refreshing') }}
			</div>
			<div
				class="grade-sel-box-btn active"
				v-show="itemData.level == gradeType"
			>
			{{ t('grade.opened') }}
			</div>
			<!-- <div
				class="grade-sel-box-btn active"
				v-show="
					gradeType == 0 &&
					Number(availablePoint) >= Number(itemData.needAmount)
				"
				@click="onClickOpen"
			>
				开启
			</div> -->
		</div>

		<!-- <Tabs :items="['箱子内容']"></Tabs> -->
		<div class="title-wrap">
			<span class="icon iconfont">&#xe647;</span>{{ t('openbox.boxIncludes') }}
		</div>

		<div class="probability_main">
			<!-- <div
				class="probability_item"
				v-for="(item, index) in rarityList"
				:key="index"
			>
				<img :src="item.icon" alt="" />
				<p>{{ item.probability }}%</p>
			</div> -->

			<div
				class="probability_item"
				v-for="(item, index) in rarityList.filter((el) => el.probability > 0)"
				:key="index"
				:style="{ color: item.color }"
			>
				<span class="icon iconfont">&#xe649;</span>
				<p>{{ item.probability.toFixed(2) }}%</p>
			</div>
		</div>
		<weaponListCpt :list="goodsList" :showBaolv="false"></weaponListCpt>

		<OpenBoxOneAni
			v-show="isAnimation"
			:goodsList="goodsList"
			@onAnimationEnd="onAnimationEnd"
			ref="animationxRef"
		>
		</OpenBoxOneAni>

		<ResultLayer
			:goodsList="goodsList"
			:gradeTimeTitle=" t('openbox.getReward')"
			@onClose="onResultClose"
			ref="resultRef"
		></ResultLayer>

		<!-- <div class="popup" :class="{ active: detailScreenShow }">
			<div class="popup-wrap">
				<div class="close" @click="hideDetail()">
					<span class="icon iconfont">&#xe637;</span>
				</div>
				<div class="popup-title">
					<div class="pop-title-top">福利盲盒</div>
				</div>
				<div class="popup-content">
					<div class="help_detail_info">
						<p>
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;达到充值门槛的玩家，将自动获得相同金额的福利盲盒点数，以该点数匹配相应及以下福利盲盒的开启资格，每天（00:05-23:59）可以选择其中一个开启一次。
						</p>
						<p>
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							请注意，该开启权利不可跨日累计使用，当日未使用的则视为自动放弃福利。仅在福利盲盒版块，您的福利盲盒点数将在每日
							00:00 减少 100，并以此匹配当日福利盲盒。
						</p>
						<p>
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							福利盲盒开启后，您可以在「我的-我的背包-所有饰品」中，查看获取的饰品，
							饰品可以立即、兑换或提取；
							另外，请仔细查阅我们的充值规则，保持理性消费噢！
						</p>
					</div>
				</div>
			</div>
		</div> -->

		<ShowDialog
			:btn-type="-1"
			:title=" t('router.grade')"
			:show="detailScreenShow"
			@ok="detailScreenShow = false"
			@cancel="detailScreenShow = false"
		>
			<div class="dialog-x-content">
				<div class="dialog-row-wrap">
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{t('grade.rule')}}
				</div>
				<!-- <div class="dialog-row-wrap">
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					请注意，该开启权利不可跨日累计使用，当日未使用的则视为自动放弃福利。仅在福利盲盒版块，您的福利盲盒点数将在每日
					00:00 减少 100，并以此匹配当日福利盲盒。
				</div>
				<div class="dialog-row-wrap">
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					福利盲盒开启后，您可以在「我的-我的背包-所有饰品」中，查看获取的饰品，
					饰品可以立即、兑换或提取；
					另外，请仔细查阅我们的充值规则，保持理性消费噢！
				</div> -->
			</div>
		</ShowDialog>
	</div>
</template>

<style lang="scss">
#grade-wrap {
	width: 750px;
	padding-bottom: 20px;
	box-sizing: border-box;

	.question {
		position: absolute;
		top: 200px;
		right: 50px;
		width: 32px;
		height: 32px;
	}

	.grade-layer {
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		z-index: 10;
	}

	.introduce {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		position: relative;
		box-sizing: border-box;
		padding-right: 25px;
		margin-top: 30px;
		z-index: 4;
		transform: translateY(-16px);

		p {
			width: 120px;
			height: 48px;
			line-height: 48px;
			color: #fbfa02;
			font-size: 18px;
			text-align: center;
		}
	}

	.grade-list-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-wrap: wrap;
		position: relative;
		width: 697px;
		margin: 0px auto 10px;
		z-index: 2;

		.grade-item {
			display: flex;
			align-items: center;
			margin-bottom: 35px;
			background: url(@/assets/romimg/grade/item_bg.png) no-repeat center;
			background-size: contain;
			width: 710px;
			height: 300px;
			position: relative;
			&.active {
				background: url(@/assets/romimg/grade/item_active_bg.png) no-repeat
					center;
				background-size: contain;
			}

			.grade-select {
				position: absolute;
				right: -8px;
				top: -11px;

				img {
					width: 713px;
					height: 296px;
				}
			}

			.grade-item-top {
				display: flex;
				justify-content: center;
				align-items: center;
				position: relative;
				width: 383px;
				height: 250px;
				background: url(@/assets/romimg/grade/bg3.png) no-repeat center;
				background-size: contain;

				.grade-item-pic {
					display: flex;
					justify-content: center;
					align-items: center;
					background-repeat: no-repeat;
					background-size: 100%;
					background-position: center;
					max-width: 236px;
					max-height: 236px;

					img {
						max-width: 100%;
						max-height: 100%;
						margin-bottom: 60px;
					}
				}
			}
			.grade-item-right {
				flex: 1;
				.grade-item-btn {
					width: 192px;
					height: 80px;
					display: flex;
					align-items: center;
					justify-content: center;
					text-align: center;

					color: #fff;
					font-size: 24px;
					font-weight: bold;
					border-radius: 5px;
					background: #3a33ad;
					position: relative;

					&.active {
						font-size: 24px;
						font-weight: bold;
						color: #fff;
					}
					&.opened {
						border-radius: 5px;
						background: #1c1a30;
						box-sizing: border-box;
						display: flex;
						font-size: 28px;
						padding: 11.152px 35.824px 11.994px 37px;
						justify-content: center;
						align-items: center;
						color: #777585;

						font-style: normal;
						font-weight: 700;
						line-height: normal;
						text-transform: uppercase;
						span {
							margin-right: 5px;
						}
					}
				}

				.grade-item-rechg {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;

					p {
						font-size: 24px;
						color: #ffffff;
					}

					.rechg-wrap {
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 24px;
						font-weight: bold;
						color: #4af1b8;
						margin-top: 21px;
						text-align: center;
						box-sizing: border-box;
						margin-bottom: 24px;

						img {
							width: 36px;
						}

						text {
							font-weight: bold;
							font-size: 26px;
						}
					}
					.level-wrap {
						width: 192px;
						color: #fbfffe;

						text-align: center;
						font-size: 32px;
						font-style: normal;
						font-weight: 700;
						line-height: 60px;
						text-transform: uppercase;
					}
					.free-wrap {
						width: 192px;
						text-align: center;
						color: #4af1b8;

						font-size: 28px;
						font-style: normal;
						font-weight: 700;
						line-height: 60px;
						text-transform: uppercase;
					}
				}
			}
		}
	}

	.swiper-container {
		box-sizing: border-box;
		width: 750px;
		height: 370px;
		// position: relative;

		.swiper-slide {
			width: 730px;
			height: 370px;
			padding: 0 40px;
			box-sizing: border-box;
		}
		.swiper-item {
			display: flex;
			align-items: center;
			margin-bottom: 35px;
			background: url(@/assets/romimg/grade/item_bg.png) no-repeat center;
			background-size: contain;
			width: 730px;
			height: 320px;
			position: relative;
			// &.active {
			//	 background: url(@/assets/romimg/grade/item_active_bg.png) no-repeat
			//		 center;
			//	 background-size: contain;
			// }

			.swiper-item-top {
				display: flex;
				justify-content: center;
				align-items: center;
				position: relative;
				width: 383px !important;
				height: 250px !important;
				background: url(@/assets/romimg/grade/bg3.png) no-repeat center;
				background-size: contain;

				.swiper-item-pic {
					display: flex;
					justify-content: center;
					align-items: center;
					background-repeat: no-repeat;
					background-size: 100%;
					background-position: center;
					max-width: 236px;
					max-height: 236px;

					img {
						max-width: 100%;
						max-height: 100%;
						margin-bottom: 60px;
					}
				}
			}

			.swiper-item-right {
				flex: 1;
				.swiper-item-btn {
					width: 192px;
					height: 80px;
					display: flex;
					align-items: center;
					justify-content: center;
					text-align: center;

					color: #fff;
					font-size: 24px;
					font-weight: bold;
					border-radius: 5px;
					background: #3a33ad;
					position: relative;

					&.active {
						font-size: 24px;
						font-weight: bold;
						color: #fff;
					}
					&.opened {
						border-radius: 5px;
						background: #1c1a30;
						box-sizing: border-box;
						display: flex;
						font-size: 28px;
						padding: 11.152px 35.824px 11.994px 37px;
						justify-content: center;
						align-items: center;
						color: #777585;

						font-style: normal;
						font-weight: 700;
						line-height: normal;
						text-transform: uppercase;
						span {
							margin-right: 5px;
						}
					}
					&.fuli {
						background: #1c1a30;
					}
				}

				.swiper-item-rechg {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: left;

					p {
						font-size: 24px;
						color: #ffffff;
					}

					.rechg-wrap {
						display: flex;
						align-items: left;
						justify-content: start;
						font-size: 24px;
						font-weight: bold;
						color: #4af1b8;
						// margin-top: 10px;
						text-align: center;
						box-sizing: border-box;
						margin-bottom: 24px;

						img {
							width: 36px;
						}

						text {
							font-weight: bold;
							font-size: 26px;
						}
					}
					.level-wrap {
						width: 192px;
						color: #fbfffe;

						text-align: left;
						font-size: 32px;
						font-style: normal;
						font-weight: 700;
						line-height: 60px;
						text-transform: uppercase;
					}
					.free-wrap {
						width: 192px;
						text-align: center;
						color: #4af1b8;

						font-size: 28px;
						font-style: normal;
						font-weight: 700;
						line-height: 60px;
						text-transform: uppercase;
					}
				}
			}
		}
		.swiper-pagination {
			// margin-top: 100px;
			// position: relative;
			height: 20px;
			display: flex;
			justify-content: center;
			align-items: center;
			.swiper-pagination-bullet-active {
				background-color: #ccc;
				width: 16px;
				height: 16px;
				border-radius: 16px;
			}
			.swiper-pagination-bullet {
				width: 16px;
				height: 16px;
				border-radius: 16px;
				border: 2px solid #ccc;
			}
		}
		.swiper-button-prev {
			color: #fff;
			// position: absolute;
			// top: 66px;
			// left: 20px;
			// span {
			//	 font-size: 50px;
			// }
		}

		.swiper-button-next {
			color: #fff;
			font-size: 40px !important;
			font-weight: 300;
			// position: absolute;
			// top: 66px;
			// right: 30px;
			// span {
			//	 font-size: 50px;
			//	 transform: rotate(180deg);
			// }
		}
	}

	.swiper-container .swiper-wrapper {
		-webkit-transition-timing-function: linear;
		-moz-transition-timing-function: linear;
		-ms-transition-timing-function: linear;
		-o-transition-timing-function: linear;
		transition-timing-function: linear;
	}

	.grade-sel-box {
		position: relative;
		box-sizing: border-box;
		width: 750px;
		height: 886px;
		margin-top: -180px;
		padding-top: 320px;
		background: url(@/assets/romimg/openbox/back.png) no-repeat center;
		background-size: contain;
		z-index: 1;

		.grade-sel-box-img {
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 0 auto;
			background-position: center;
			background-size: contain;
			background-repeat: no-repeat;
			width: 380px;
			height: 380px;

			img {
				max-width: 80%;
				max-height: 80%;
				margin-bottom: 120px;
			}
		}

		.grade-sel-box-btn {
			background: url(@/assets/romimg/grade/btn.png) no-repeat center;
			background-size: contain;
			width: 205px;
			height: 49px;
			margin: 80px auto;
			text-align: center;
			line-height: 49px;
			color: #fff;
			font-size: 20px;
			font-weight: bold;

			span {
				color: #fbfa02;
			}

			&.active {
				background: url(@/assets/romimg/grade/btn_active.png) no-repeat center;
				background-size: contain;
				color: #1c1a2b;

				span {
					color: #1c1a2b;
				}
			}
		}
	}

	.title {
		margin-top: 10px;
	}
	.title-wrap {
		// display: flex;
		width: 710px;
		height: 140px;
		// padding: 23px 221px 23px 20px;
		align-items: left;
		background-color: #1b1d35;
		color: #fff;
		font-size: 40px;
		font-style: normal;
		font-weight: 400;
		line-height: 140px;
		margin: auto;
		margin-bottom: 20px;
		margin-top: 20px;
		span {
			color: #7349ca;
			font-size: 46px;
			margin-left: 40px;
			margin-right: 40px;
		}
	}

	.probability_main {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-direction: row-reverse;
		margin: 0px 30px;
		// background: #1b1e38;
		height: 60px;
		padding: 0px 20px;
		overflow-x: auto;
		.probability_item {
			display: flex;
			align-items: center;
			justify-content: flex-start;

			span {
				font-size: 20px;
			}
			p {
				font-size: 24px;
				margin-left: 5px;
				margin-right: 30px;
				text-align: center;
				font-style: normal;
				font-weight: 500;

				text-transform: uppercase;
			}

			&:first-of-type {
				margin-left: 8px;
			}

			&:last-of-type {
				margin-right: 8px;
			}
		}
	}
}
</style>
