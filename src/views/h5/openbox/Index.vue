<script setup>
import { ref, nextTick, onMounted, computed, watch, onUnmounted } from "vue";
import { Switch } from "vant";
import weaponListCpt from "@/components/h5/weaponListCpt/Index.vue";
import HeadPortrait from "@/components/h5/head/HeadPortrait.vue";
import OpenBoxOneAni from "./components/OpenBoxOneAni.vue";
import OpenBoxMultAni from "./components/OpenBoxMultAni.vue";
import ResultLayer from "./components/Result.vue";
import RecordSwiper from "@/components/h5/home/RecordSwiper.vue";
import { useRoute, useRouter } from "vue-router";
import Currency from "@/components/h5/common/Currency.vue";
import { tokenName } from "@/config";
import {
	getBlindBoxGoods,
	getBoxDropRecords,
	getOpenBoxRecords,
	getBoxDetails,
	getOpenBox,
	openAmmonBox,
} from "@/network/api/blind";
import { useStore } from "vuex";
import { getInfo } from "@/network/api/user";
import { add, bignumber } from "mathjs";
import ShowDialog from "@/components/h5/common/ShowDialog.vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const router = useRouter();

const route = useRoute();
const store = useStore();

let boxId = Number(route.query.boxId);
let boxType = ref(route.query.type || "general");
const boxData = ref({});

//装备列表
const goodsList = ref([]);

const boxNum = ref(1);
const openText = ref(t('redpack.open'));
const openArr = ref([1, 2, 3, 4, 5]);
const tabType = ref(0); //0-goods 1-drop

const isAnimation = ref(store.state.animationSwitch);
const doingAnimation = ref(false); //正在放转动动画
const dijah = ref(false); //电池光效动画

const btnOpenActive = ref(true); //防快速开箱
const layer = ref(false);
const animationShow = ref(false);

let dropTimer = null; //最近掉落定时器
const dropData = ref([]);

let updateDropData = [];
let needUpdateDrop = false;

const isAchorDrop = ref(false);

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

const animationxRef = ref(null);
const animationyRef = ref(null);

const openBoxData = ref([]);
const resultRef = ref(null);

onMounted(() => {
	boxId = Number(route.query.boxId);
	getBoxDetail();
	getBoxGoods();
});

onUnmounted(() => {
	stopBoxDropTime();
});

async function getBoxDetail() {
	const res = await getBoxDetails({ boxId: boxId });
	if (res.code === 0) {
		boxData.value = res.data.item;
	}
}

async function getBoxGoods() {
	const res = await getBlindBoxGoods({ boxId: boxId });
	if (res.code === 0) {
		goodsList.value = res.data.items;
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

async function getBoxDrop() {
	const res = await getBoxDropRecords({
		boxId: boxId,
		limit: 20,
		isAnchor: isAchorDrop.value,
	});
	if (res.code === 0) {
		let items = res.data.items;
		if (items) {
			dropData.value = items;
		}
	}
}

function startBoxDropTime() {
	stopBoxDropTime();
	getBoxDrop();
	dropTimer = setInterval(() => {
		getBoxDrop();
	}, 5000);
}

function stopBoxDropTime() {
	if (dropTimer != null) {
		clearInterval(dropTimer);
		dropTimer = null;
	}
}

function onClickTab(type) {
	tabType.value = type;

	if (type == 1) {
		startBoxDropTime();
	} else {
		stopBoxDropTime();
	}
}

function onClickFilterTab(isAnchor) {
	isAchorDrop.value = isAnchor;
	dropData.value = [];
	startBoxDropTime();
}

function setBoxNum(num) {
	if (num == boxNum.value) {
		if (boxNum.value > 1) {
			boxNum.value -= 1;
		}
	} else {
		boxNum.value = num;
	}
}

async function onClickOpen() {
	if (!localStorage.getItem(tokenName)) {
		router.push("/m/sign");
		return;
	}

	if (!btnOpenActive.value) return;
	btnOpenActive.value = false;

	let params = {};
	params.boxId = boxId;
	params.count = boxNum.value;

	if (isAnimation.value) {
		doingAnimation.value = true;
	}
	stopBoxDropTime();

	let res;
	if (boxType.value == "ammon") {
		res = await openAmmonBox(params);
	} else {
		res = await getOpenBox(params);
	}

	btnOpenActive.value = true;

	if (res.code == 0) {
		let items = res.data.items;
		openBoxData.value = items;
		if (items && items.length > 0) {
			layer.value = true;
			if (isAnimation.value) {
				// dijah.value = true;
				doingAnimation.value = true;
				// if (items.length <= 1) {
				//	 animationxRef.value.randGoodList();
				//	 setTimeout(() => {
				//		 startAnimationX();
				//	 }, 100);
				// } else {
				//	 animationyRef.value.randGoodList(items.length);
				// }
				animationyRef.value.randGoodList(items.length);
			} else {
				await nextTick();
				showResult();
			}

			const infoRes = await getInfo();
			if (infoRes.code === 0) {
				store.commit("setUserAmount", infoRes.data.assets.amount);
			}
		} else {
			doingAnimation.value = false;
			startBoxDropTime();
		}
	} else {
		doingAnimation.value = false;
		startBoxDropTime();
	}
}

async function startAnimationX() {
	await nextTick();
	window.$dev && console.log("openboxdata x", openBoxData.value[0]);
	animationxRef.value.showAward(openBoxData.value[0]);
}

async function startAnimationY() {
	await nextTick();
	window.$dev && console.log("openboxdata y", openBoxData.value);
	animationyRef.value.showAward(openBoxData.value);
}

function onRandEnd() {
	setTimeout(() => {
		startAnimationY();
	}, 550);
}

function onAnimationEnd() {
	// dijah.value = false;
	layer.value = false;
	doingAnimation.value = false;
	showResult();

	if (needUpdateDrop) {
		handleDropList(updateDropData);
		needUpdateDrop = false;
		updateDropData = [];
	}
}

function showResult() {
	layer.value = true;
	resultRef.value.showReuslt(openBoxData.value);
	store.dispatch("getUserInfo");
}

function onResultClose() {
	layer.value = false;
	startBoxDropTime();
}

function handleDropList(arr) {
	let list = [];
	let cur = dropData.value;
	for (let i = 0; i < arr.length; i++) {
		let has = false;
		for (let j = 0; j < cur.length; j++) {
			if (arr[i].id == cur[j].id) {
				has = true;
				break;
			}
		}
		if (!has) {
			list.push(arr[i]);
		}
	}
	let uplist = [...list, ...cur];
	uplist.sort((a, b) => {
		return b.id - a.id;
	});
	if (uplist.length > 20) {
		uplist = uplist.slice(0, 20);
	}
	dropData.value = uplist;
}

watch(route, (newRoute, oldRoute) => {
	if (
		newRoute &&
		newRoute.path == "/m/openbox" &&
		oldRoute.path == "/m/openbox"
	) {
		let queryBoxId = Number(newRoute.query.boxId);
		if (queryBoxId) {
			boxId = queryBoxId;
			boxType.value = "general";
			getBoxDetail();
			getBoxGoods();
			dropData.value = [];
			if (tabType.value == 1) {
				startBoxDropTime();
			}
		}
	}
});

function back() {
	// route.go(-1);
	router.go(-1);
}

function onAnimSwitchChange() {
	isAnimation.value = !isAnimation.value;
	localStorage.setItem("animationSwitch", isAnimation.value);
	store.commit("setAnimationSwitch", isAnimation.value);
}
let showDialog = ref(false);
</script>

<template>
	<div id="openbox" class="min-wrap-height">
		<div class="open-layer" v-show="layer"></div>
		<div class="top-header-wrap">
			<div class="back-wrap">
				<span class="icon iconfont" @click="back()">&#xe61e;</span>
			</div>
			<div class="box-name-wrap">
				<!-- <p>{{ boxData.subTypeName }}</p> -->
				<p>{{ boxData.name }}</p>

				<div class="open-price">
					<Currency :currency="(boxData.price * boxNum).toFixed(2)"></Currency>&nbsp;
					<p v-if="Number(boxData.price) < Number(boxData.originalPrice)">
						{{ Number(boxData.originalPrice * boxNum).toFixed(2) }}
					</p> <!-- ${{ (boxData.price * boxNum).toFixed(2) }} -->
				</div>
			</div>
			<div class="switch-container">
				<!-- <span>{{ t('openbox.accelerate') }}</span> -->
				<img v-if="!isAnimation" src="@/assets/romimg/openbox/close.png" alt="" srcset=""
					@click="onAnimSwitchChange" />
				<img v-if="isAnimation" @click="onAnimSwitchChange" src="@/assets/romimg/openbox/open.png" alt=""
					srcset="" />
			</div>
		</div>

		<!-- <div class="title open-title">{{ boxData.name }}</div> -->

		<div class="box-back">
			<div class="box-pic" :style="'background-image: url(' + boxData.imageUrl + ')'">
				<img :src="boxData.weaponImageUrl" :alt="boxData.name" />
			</div>
		</div>
		<div class="fairness" @click.stop="showDialog = true">
			<span class="icon iconfont">&#xe88c;</span>{{ t('openbox.ensureFairness') }}
		</div>

		<div class="opt-wrap">
			<div class="opt-btn" v-for="(item, index) in openArr" :key="index" :class="{ active: boxNum == item }"
				@click="setBoxNum(item)">
				{{ item }}
			</div>
		</div>

		<div class="open-btn-box">
			<div v-if="!doingAnimation" class="open-btn" @click="onClickOpen()">
				{{ openText }}
			</div>
			<div class="open-btn open" v-if="doingAnimation">
				OPENING
				<img class="loader-img" src="@/assets/pcimg/openbox/loader.png" alt="" />
			</div>
		</div>

		<div class="tabs">
			<div class="tab-item" :class="{ active: tabType == 0 }" @click="onClickTab(0)">
				<span class="icon iconfont">&#xe63a;</span> {{ t('openbox.accessoriesList') }}
			</div>
			<div class="tab-item" :class="{ active: tabType == 1 }" @click="onClickTab(1)">
				<span class="icon iconfont">&#xe616;</span> {{ t('battle.historyDrop') }}
			</div>

			<!-- <van-notice-bar
				scrollable
				text="温馨提示:饰品提取时出现任何问题,一定联系客服解决,切勿上头!"
			/> -->
		</div>

		<div class="presentation">
			<div class="fliter-tab" v-if="tabType == 1">
				<p :class="{ active: isAchorDrop }" @click="onClickFilterTab(true)">
					{{ t('battle.anchor') }}
				</p>
				<p :class="{ active: !isAchorDrop }" @click="onClickFilterTab(false)">
					{{ t('lucky.memberDrop') }}
				</p>
			</div>
			<div class="probability_main" v-if="tabType == 0" :class="{
				len5: rarityList.filter((el) => el.probability > 0).length >= 5,
			}">
				<div class="probability_item" v-for="(item, index) in rarityList.filter((el) => el.probability > 0)"
					:key="index" :style="{ color: item.color }">
					<span class="icon iconfont">&#xe649;</span>
					<p>{{ item.probability.toFixed(2) }}%</p>
				</div>
			</div>
		</div>

		<weaponListCpt :list="goodsList" v-show="tabType == 0"></weaponListCpt>

		<div class="drop-wrap" v-show="tabType == 1">
			<div class="drop-item">
				<div v-if="!isAchorDrop" class="player">{{ t('battle.member') }}</div>
				<div v-if="isAchorDrop" class="player">{{ t('battle.anchor') }}</div>
				<div class="price">{{ t('battle.price') }}</div>
				<div class="name">{{ t('battle.goodsName') }}</div>
			</div>
			<div class="drop-item" v-for="(item, index) in dropData" :key="index">
				<div class="header">
					<HeadPortrait v-if="!isAchorDrop" :userModel="item" :size="'one'" :hide-frame="true"></HeadPortrait>
					<div class="anchor" v-if="isAchorDrop">
						<HeadPortrait :userModel="item" :size="'one'" :hide-frame="true"></HeadPortrait>
						<img class="img-tv" src="@/assets/romimg/openbox/live-item__tv.png" />
					</div>
					<div class="nickname">{{ item.nickName }}</div>
				</div>
				<!-- //boxData.price -->
				<span class="span_p" :class="{ active: boxData.price < item.price }">
					<Currency :currency="item.price"></Currency>
					<!-- ${{ item.price }} -->
				</span>
				<p class="hide">{{ item.goodsName }}</p>
			</div>
		</div>

		<OpenBoxOneAni v-if="animationShow" :goodsList="goodsList" @onAnimationEnd="onAnimationEnd" ref="animationxRef">
		</OpenBoxOneAni>

		<OpenBoxMultAni v-show="doingAnimation" :goodsList="goodsList" @onAnimationEnd="onAnimationEnd"
			@onRandEnd="onRandEnd" ref="animationyRef"></OpenBoxMultAni>

		<ResultLayer v-if="goodsList.length != 0" :goodsList="goodsList" @onClose="onResultClose"
			:openBoxTitle="t('openbox.getReward')" ref="resultRef"></ResultLayer>

		<ShowDialog :title="t('openbox.fairTitle')" :btn-type="-1" :cancel-show="false" :show="showDialog"
			@ok="showDialog = false" @cancel="showDialog = false">
			<div class="dialog-x-content">
				<div class="dialog-row-wrap">
					<div v-html="t('openbox.fairContent')"></div>
				</div>
				<!-- <div class="dialog-row-wrap">
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {{ t('openbox.specialArea') }}  如果你玩的是一款带有骰子或纸牌的实体游戏，你可以通过检查骰子的6个独特面或牌组中的52张独特牌来确保随机性。 网上的工作方式有点不同，但概念还是一样的。 最终，这仍然是一款靠运气的游戏，我们必须非常诚实地承认： 饰品越有价值，你抽中的机会就越小。 
				</div>
				<div class="dialog-row-wrap">
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {{ t('openbox.specialArea') }} 我们会公布箱子中每类品质饰品的爆率，展示在每个箱子下面。供你做开箱前的爆率参考，最后还是要提醒您健康游戏理性消费。
				</div> -->
			</div>
		</ShowDialog>
	</div>
</template>

<style lang="scss">
#openbox {
	margin-bottom: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-sizing: border-box;
	color: #fff;
	background-color: #0d0e1c;

	#recordswiper {
		margin-top: 12px;
	}

	.anchor {
		// align-items: center;
		// display: flex;
		// flex-direction: column;
		// justify-content: center;
		padding-top: 20px;
		box-sizing: border-box;

		HeadPortrait {
			position: relative;
			/* 使用绝对定位 */
			// margin-bottom: 20px;
		}

		.img-tv {
			width: 20px;
			height: 20px;
			position: relative;
			/* 使用绝对定位 */
			left: 5px;
			/* 调整水平位置 */
			bottom: 20px;
			/* 调整垂直位置 */
		}
	}

	.open-layer {
		width: 100%;
		height: 100%;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 10;
	}

	.open-title {
		z-index: 5;
		margin-top: 58px;
		width: 369px;
		background-size: 100%;
		text-align: center;
		font-size: 42px;
		font-weight: 500;
	}

	.box-back {
		width: 750px;
		height: 542px;
		background: url(@/assets/romimg/openbox/back.png) no-repeat center;
		background-size: 100% 100%;
		margin: -60px auto 0;

		.box-pic {
			width: 420px;
			height: 420px;
			margin: 50px auto 0;
			background-position: center;
			background-size: contain;
			background-repeat: no-repeat;
			display: flex;
			justify-content: center;
			align-items: center;

			img {
				max-width: 100%;
				max-height: 100%;
				// margin-top: -50px;
			}
		}
	}

	.fairness {
		position: relative;
		font-size: 26px;
		font-weight: 300;
		line-height: 40px;
		color: #7b7be0;
		border-bottom: 1px dashed #7b7be0;
		margin-bottom: 10px;

		span:first-child {
			font-size: 30px;
			color: #7ef2ad;
			left: -35px;
			margin-top: 5px;
			position: absolute;
		}
	}

	.opt-wrap {
		width: 100%;
		margin: 0px auto 0;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		position: relative;
		border-bottom: 2px solid #14162a;

		.opt-btn {
			width: 80px;
			height: 140px;
			margin: 0 12px;
			text-align: center;
			line-height: 140px;
			font-size: 34px;
			position: relative;
			overflow: hidden;
			color: #3a3958;

			&.active {
				color: #cfcee9;
				border-bottom: 2px solid #3a34b0;
			}
		}
	}

	.open-price {
		height: 70px;
		display: flex;
		justify-content: center;
		align-items: center;

		p {
			color: #5E5E5E;
			font-size: 28px;
			font-style: normal;
			font-weight: 700;
			// line-height: 19px;
			text-decoration-line: strikethrough;
			text-transform: uppercase;
			text-decoration: line-through solid;
			margin-top: 3px;
			// padding: 0 8px;														
		}
	}

	.open-ammon-price {
		height: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #7ae6a6;
		font-size: 32px;
		font-weight: bold;
		margin-top: 32px;

		img {
			width: 64px;
			height: 64px;
			margin-right: 10px;
			margin-bottom: 5px;
		}
	}

	.open-btn-box {
		margin: 90px auto;
		width: 100%;
		position: relative;

		.open-btn {
			width: 500px;
			height: 116px;
			text-align: center;
			line-height: 116px;
			color: #fff;
			font-size: 34px;
			font-weight: bold;
			margin: 0 auto;
			border-radius: 8px;
			background: #3a34b0;
			font-style: normal;
			text-transform: uppercase;

			&.open {
				background-color: transparent;
			}
		}
	}

	.top-header-wrap {
		width: 750px;
		padding: 50px;
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		align-items: center;

		// padding: auto 20px;
		.back-wrap {
			width: 46px;

			span {
				color: #e2e2e2;
				font-size: 30px;
			}
		}

		.box-name-wrap {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			color: #dce1e5;
			text-align: center;
			font-size: 36px;
			font-style: normal;
			font-weight: 700;

			text-transform: capitalize;
		}

		.switch-container {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			text-align: left;
			color: #b5b7c2;
			text-align: center;
			font-size: 24px;
			font-style: normal;
			font-weight: 700;
			text-transform: uppercase;

			span {
				margin-bottom: 10px;
				margin-right: 10px;
			}

			img {
				width: 48px;
				// height: 44px;
			}

			// .van-cell__title {
			//	 font-size: 28px;
			//	 margin-bottom: 3px;
			// }
			// .van-cell {
			//	 color: #fff;
			//	 background-color: transparent;
			//	 width: 162px;
			// }
			// .van-cell__value {
			//	 width: 50px !important;

			//	 .van-switch {
			//		 width: 50px !important;
			//		 height: 30px !important;
			//	 }
			// }
			// .van-switch__node {
			//	 margin-top: 4px;
			//	 position: absolute;
			//	 top: 0;
			//	 left: 0;
			//	 width: 50px;
			//	 height: var(--van-switch-node-size);
			//	 font-size: inherit;
			//	 background: var(--van-switch-node-background-color);
			//	 border-radius: 100%;
			//	 box-shadow: var(--van-switch-node-box-shadow);
			//	 transition: transform var(--van-switch-transition-duration)
			//		 cubic-bezier(0.3, 1.05, 0.4, 1.05);
			// }
			// .van-switch--on {
			//	 // transform: translate(calc(50));

			//	 // transform: translate(50);
			// }
		}
	}

	.tabs {
		display: flex;
		align-items: center;
		justify-content: space-around;
		justify-items: center;
		box-sizing: border-box;
		width: 100%;
		position: relative;
		font-size: 32px;
		font-weight: 500;
		height: 160px;

		.tab-item {
			margin: 0.2px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex: 1;
			height: 160px;
			color: #9ca1c7;
			background-color: #111324;

			span:first-child {
				font-size: 40px;
				margin-right: 20px;
			}

			&.active {
				color: #fff;
				background: url(@/assets/romimg/openbox/tab_bg.png) no-repeat center;
				background-size: 100% 100%;
			}
		}
	}

	.presentation {
		width: 100%;
		margin: 15px 0;
		box-sizing: border-box;

		.van-notice-bar {
			flex: 1;
			background-color: #181721;
			background-size: contain;
			box-sizing: border-box;
			font-size: 24px;
			color: #fff;
		}

		.probability_main {
			display: flex;
			justify-content: center;
			/* 水平居中 */
			align-items: center;
			/* 垂直居中 */
			margin: 0px 30px;
			background: #1b1e38;
			height: 60px;
			padding: 0px 20px;
			overflow-x: auto;

			&::-webkit-scrollbar {
				display: none;
			}

			&.len5 {
				justify-content: start;
				padding: 0px 20px;
			}

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

		.fliter-tab {
			width: 710px;
			height: 90px;
			// background-color: #0e0d19;
			display: flex;
			margin: 10px 15px 0;

			p {
				width: 192px;
				height: 80px;
				text-align: center;
				line-height: 80px;
				font-size: 32px;
				color: #545774;
				position: relative;
				border-radius: 24px;
				border: 1px solid #1e2037;
				margin-left: 30px;

				&.active {
					color: #fff;
					border: 1px solid #434997;
					background: rgba(255, 255, 255, 0);
					box-shadow: 0px 0px 26px 1px rgba(41, 34, 139, 0.25) inset;
				}

				// &::after {
				//	 display: block;
				//	 content: "";
				//	 width: 2px;
				//	 height: 20px;
				//	 background: url(@/assets/romimg/bag/line.png) no-repeat center;
				//	 background-size: contain;
				//	 position: absolute;
				//	 right: 0;
				//	 top: 50%;
				//	 transform: translateY(-50%);
				// }

				// &:last-child {
				//	 &::after {
				//		 display: none;
				//	 }
				// }
			}
		}
	}

	.weapon-list {
		transform: translateY(-26px);
	}

	.drop-wrap {
		padding: 0 20px;
		box-sizing: border-box;
		min-height: 500px;
		width: 100%;

		.drop-item:first-child {
			margin: 10px auto;
			background: #111324;
			color: #5d5f72;
			font-size: 26px;
			font-weight: 700;
			display: flex;

			.player {
				flex: 3.5;
				margin-left: 30px;
			}

			.price {
				flex: 3.5;
			}

			.name {
				flex: 3.5;
				left: 300px;
			}
		}

		.drop-item {
			height: 110px;
			display: flex;
			align-items: center;
			background: #131528;
			padding: 0 20px;
			box-sizing: border-box;
			margin: 2px auto;

			.header {
				flex: 4;
				display: flex;
				align-items: center;

				.nickname {
					width: 110px;
					text-overflow: ellipsis;
					overflow: hidden;
					display: inline-block;
					white-space: nowrap;
					line-height: 110px;
					padding-left: 10px;
				}
			}

			.span_p {
				flex: 3;
				display: flex;
				text-align: left;
				color: #fff;

				&.active {
					color: #70c593;
				}

				#currency-wrap {
					color: #70c593;

					img {
						width: 24px;
						height: 24px;
					}

					.span1 {
						font-size: 24px;
					}

					.span2 {
						font-size: 24px;
					}
				}
			}

			p {
				font-weight: 300;
				flex: 5;
				overflow: hidden;
				color: #edf0f7;
				text-overflow: ellipsis;
				font-size: 24px;
				font-style: normal;
			}
		}
	}

	.loader-img {
		width: 72px;
		height: 72px;
		animation: ani-rotate 2s linear infinite;
		margin-left: 16px;
		vertical-align: middle;
	}
}
</style>
