<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, nextTick, onMounted, computed, watch, onUnmounted } from 'vue';
import weaponListCpt from '@/components/pc/weaponListCpt/Index.vue'
import HeadPortrait from '@/components/pc/head/HeadPortrait.vue';
import OpenBoxOneAni from './components/OpenBoxOneAni.vue';
import OpenBoxMultAni from './components/OpenBoxMultAni.vue';
import ResultLayer from './components/BoxResult.vue';
import { useRoute } from 'vue-router';
import { getBlindBoxGoods, getBoxDropRecords, getOpenBoxRecords, getBoxDetails, getOpenBox, openAmmonBox } from "@/network/api/blind";
import { useStore } from 'vuex';
import { getInfo } from '@/network/api/user';
import { add, bignumber } from 'mathjs';

const route = useRoute();
const store = useStore();

let boxId = Number(route.query.boxId);
let boxType = ref(route.query.type || 'general');
const boxData = ref({});

//装备列表
const goodsList = ref([]);

const boxNum = ref(1);
const openText = ref(t('openbox.open'));
const openArr = ref([1, 2, 3, 4, 5]);
const tabType = ref(0) //0-goods 1-drop

const isAnimation = ref(!store.state.animationSwitch);
// const isAnimation = ref(true);
const isSound = ref(true);
const doingAnimation = ref(false);//正在放转动动画

const btnOpenActive = ref(true);//防快速开箱
const layer = ref(false);
const animationShow = ref(true);


let dropTimer = null;//最近掉落定时器
const dropData = ref([]);

let updateDropData = [];
let needUpdateDrop = false;

const isAchorDrop = ref(false);

//爆率数据
const rarityList = ref([
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv1.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv2.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv3.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv4.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv5.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv6.png', import.meta.url).href,
		probability: 0
	},
	{
		icon: new URL('../../../assets/pcimg/openbox/baolv7.png', import.meta.url).href,
		probability: 0
	},
]);

const animationxRef = ref(null);
const animationyRef = ref(null);

const openBoxData = ref([]);
const resultRef = ref(null);

const ensureShow = ref(false)	 /// 公平公正弹窗状态
// const showAnimationArea = ref(false);

onMounted(() => {
	boxId = Number(route.query.boxId);
	getBoxDetail();
	getBoxGoods();
})

onUnmounted(() => {
	stopBoxDropTime();
})

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
			rarityList.value[item.goodsLevel - 1].probability = add(bignumber(rarityList.value[item.goodsLevel - 1].probability),
				bignumber(item.probability));
		}

	}
}

async function getBoxDrop() {
	const res = await getBoxDropRecords({ boxId: boxId, limit: 20, isAnchor: isAchorDrop.value });
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
	boxNum.value = num
	if (showAnimationArea.value) {
		animationyRef.value.randGoodList(num, false);
	}
}

async function onClickOpen() {
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
				//	 startAnimationX();
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
	animationxRef.value.showAward(openBoxData.value[0]);
}

async function startAnimationY() {
	await nextTick();
	animationyRef.value.showAward(openBoxData.value);
}

function onRandEnd() {
	startAnimationY()
}

function onAnimationEnd() {
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
	layer.value = false;
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
			list.push(arr[i])
		}
	}
	let uplist = [...list, ...cur];
	uplist.sort((a, b) => { return b.id - a.id });
	if (uplist.length > 20) {
		uplist = uplist.slice(0, 20)
	}
	dropData.value = uplist;

}

watch(route, (newRoute, oldRoute) => {
	if (newRoute && newRoute.path == '/p/openbox' && oldRoute.path == '/p/openbox') {
		let queryBoxId = Number(newRoute.query.boxId);
		if (queryBoxId) {
			boxId = queryBoxId;
			boxType.value = 'general';
			getBoxDetail();
			getBoxGoods();
			dropData.value = [];
			if (tabType.value == 1) {
				startBoxDropTime();
			}
		}

	}
})

function switchSound() {
	isAnimation.value = !isAnimation.value;
	store.commit("setOpenBoxSoundSwitch", isAnimation.value);
	localStorage.setItem("animationSwitch", isAnimation.value);
	store.commit("setAnimationSwitch", isAnimation.value);

}

</script>
		
<template>
	<div id="pc-openbox" class="min-wrap-height">
		<van-overlay :show="ensureShow" style="background-color: rgba(0,0,0,.7);" :z-index="200" :lock-scroll="false">
			<div class="ensure-container">
				<div class="header">
					<p>{{ t('openbox.fairTitle') }}</p>
					<img src="@/assets/pcimg/recharge/close-tip.png" class="close-ensure-container"
						@click="ensureShow = false">
				</div>
				<div class="body" v-html="t('openbox.fairContent')"></div>
			</div>
		</van-overlay>

		<div class="pc-openbox-content">
			<div class="open-layer" v-show="layer"></div>
			<div class="sound-switch" :class="{ 'active': !isAnimation }" @click="switchSound"></div>
			<div class="box-info-wrap">
				<div class="open-title">{{ boxData.name }}</div>
				<div class="open-price" v-if="false"> <img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg"
						alt="" />
					{{ (boxData.price * boxNum).toFixed(2) }}</div>
			</div>

			<div class="box-back" v-show="!doingAnimation">
				<div class="box-pic" :style="'background-image: url(' + boxData.imageUrl + ')'">
					<img :src="boxData.weaponImageUrl" :alt="boxData.name">
				</div>
			</div>
			<div class="open-safe" v-show="!doingAnimation" @click="ensureShow = true">
				<img src="@/assets/pcimg/openbox/safe.png" />
				<p>{{ t('openbox.ensureFairness') }}</p>
			</div>
			<OpenBoxMultAni v-if="doingAnimation" :goodsList="goodsList" @onAnimationEnd="onAnimationEnd"
				@onRandEnd="onRandEnd" ref="animationyRef"></OpenBoxMultAni>
			<div class="load-wrap" v-show="doingAnimation">OPENING <img src="@/assets/pcimg/openbox/loader.png" alt="" />
			</div>

			<div v-show="!doingAnimation" class="opt-content-wrap">
				<div class="opt-wrap">
					<div class="opt-btn" v-for="(item, index) in openArr" :key="index" :class="{ 'active': boxNum == item }"
						@click="setBoxNum(item)">{{ item }}</div>
				</div>
				<div class="open-price"> <img class="pc-price-open-pricecoin" src="@/assets/pcimg/common/coin.svg" alt="" />
					{{
						(boxData.price *
							boxNum).toFixed(2) }}&nbsp;
					<p v-if="Number(boxData.price) < Number(boxData.originalPrice)">
						{{ (boxData.originalPrice * boxNum).toFixed(2) }}</p>
				</div>
				<div class="open-btn-box" v-show="!doingAnimation">
					<div class="open-btn" @click="onClickOpen()">{{ openText }}</div>
					<div v-if="false" class="switch" :class="{ 'active': isAnimation }" @click="isAnimation = !isAnimation">
					</div>
				</div>
			</div>

			<div class="column">
				<div class="tab-wrap">
					<div class="tab-item" :class="{ 'active': tabType == 0 }" @click="onClickTab(0)">
						<img class="icon-common" src="@/assets/pcimg/openbox/icon_box.png" alt="" />
						<img class="icon-active" src="@/assets/pcimg/openbox/icon_box2.png" alt="" />
						{{ t('openbox.boxIncludes') }}
					</div>
					<div class="tab-item" :class="{ 'active': tabType == 1 }" @click="onClickTab(1)">
						<img class="icon-common" src="@/assets/pcimg/openbox/icon_history.png" alt="" />
						<img class="icon-active" src="@/assets/pcimg/openbox/icon_history2.png" alt="" />
						{{ t('openbox.latestDrop') }}
					</div>
					<div class="fliter-tab" v-if="tabType == 1">
						<div class="fliter-item" :class="{ 'active': !isAchorDrop }" @click="onClickFilterTab(false)">{{ t(
							'battle.member') }}
						</div>
						<div class="fliter-item" :class="{ 'active': isAchorDrop }" @click="onClickFilterTab(true)"> {{ t(
							'battle.anchor') }}
						</div>
					</div>
					<div class="presentation" v-if="tabType == 0">
						<div class="probability_main">
							<div class="probability_item" v-for="(item, index) in rarityList" :key="index">
								<div v-if="item.probability != 0">
									<img :src="item.icon" alt="">
									<p>{{ item.probability }}%</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<weaponListCpt :list="goodsList" v-show="tabType == 0"></weaponListCpt>

			<div class="drop-wrap" v-show="tabType == 1">
				<div class="drop-title">
					<p class="area1">{{ t('common.users') }}</p>
					<p class="area1">{{ t('battle.goodsName') }}</p>
					<p class="area1">{{ t('battle.price') }}</p>
					<p class="time">{{ t('openbox.time') }}</p>
				</div>
				<div class="drop-item" v-for="(item, index) in dropData" :key="index">
					<div class="area1">
						<HeadPortrait :userModel='item' :size="'pc-openbox-header'" :hide-frame="true"></HeadPortrait>
						<p>{{ item.nickName }}</p>
					</div>
					<div class="area2">{{ item.goodsName }}</div>
					<div class="area3"><img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />{{
						item.price }}</div>
					<div class="time">{{ item.createTime }}</div>
				</div>
			</div>
		</div>



		<ResultLayer :goodsList="goodsList" @onClose="onResultClose" ref="resultRef" v-if="goodsList.length != 0">
		</ResultLayer>
	</div>
</template>
		
<style lang="scss">
#pc-openbox {
	margin-bottom: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	box-sizing: border-box;
	color: #fff;
	width: 100%;
	margin: 0 auto;
	box-sizing: border-box;
	background-color: #0D0E1C;
	position: relative;

	.ensure-container {
		position: fixed;
		// top: 410px;
		top: calc(50% - 540px / 2);
		height: 540px;
		width: 590px;
		background: #16182E;
		left: calc(50% - 590px / 2);
		display: flex;
		flex-direction: column;

		.header {
			width: 100%;
			height: 108px;
			background: #191C34;
			padding: 46px 70px;
			font-size: 24px;
			box-sizing: border-box;

			img {
				position: absolute;
				top: 20px;
				right: 35px;
			}
		}

		.body {
			padding: 31px 62px 43px 70px;
			color: #A5A8BD;
			font-size: 15px;
			font-style: normal;
			font-weight: 400;
			line-height: 25.5px;
			display: flex;
			flex-direction: column;
			gap: 16px;
		}
	}


	.pc-openbox-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
		color: #fff;
		max-width: 1440px;
		width: 100%;
		margin: 0 auto;
		position: relative;
	}

	.open-layer {
		width: 100%;
		height: 100%;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 10;
	}

	.box-info-wrap {
		position: absolute;
		z-index: 5;
		top: 0;
		left: 50%;
		transform: translateX(-50%);

		.open-title {
			margin-top: 77px;
			font-size: 26px;

		}

		.open-price {
			height: 20px;
			display: flex;
			justify-content: center;
			align-items: center;
			margin-top: 20px;
			color: #75DC9E;
			font-size: 20px;

			line-height: 20px;
			gap: 8px;

			img {
				width: 18px;
				height: 18px;
				margin-bottom: 3px;
			}
		}


		.open-ammon-price {
			height: 20px;
			display: flex;
			justify-content: center;
			align-items: center;
			color: #75DC9E;
			font-size: 20px;

			line-height: 20px;
			margin-top: 20px;

		}
	}



	.sound-switch {
		width: 32px;
		height: 28px;
		background: url(@/assets/pcimg/openbox/sound_close.png) no-repeat center;
		background-size: 100% 100%;
		position: absolute;
		right: 17px;
		top: 58px;

		&.active {
			background: url(@/assets/pcimg/openbox/sound_open.png) no-repeat center;
			background-size: 100% 100%;
		}
	}

	.box-back {
		width: 624px;
		height: 422px;
		background: url(@/assets/pcimg/openbox/case_bg.png) no-repeat center;
		background-size: contain;
		margin-top: 30px;
		overflow: hidden;

		.box-pic {
			width: 320px;
			height: 320px;
			margin: 80px auto 0;
			background-position: center;
			background-size: contain;
			background-repeat: no-repeat;
			display: flex;
			justify-content: center;
			align-items: center;

			img {
				max-width: 80%;
				max-height: 80%;
				margin-top: -50px;
			}
		}
	}

	.open-safe {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		color: #7B7BE0;
		margin-top: -3px;
		cursor: pointer;

		img {
			width: 10px;
			height: 13px;
			margin-right: 5px;
		}

		p {
			text-decoration: underline;
		}
	}

	.opt-content-wrap {
		position: relative;
		width: 100%;

		.opt-wrap {
			width: 100%;
			margin: 5px auto 0;
			display: flex;
			justify-content: center;
			align-items: center;
			box-sizing: border-box;
			position: relative;
			border-bottom: 1px solid #14162A;

			.opt-btn {
				width: 38px;
				height: 70px;
				border: none;
				margin: 0 17px;
				text-align: center;
				line-height: 70px;
				font-size: 17px;
				position: relative;
				color: #3A3958;

				cursor: pointer;

				&.active {
					color: #CFCEE9;
					border-bottom: 1px solid #3A34B0;
				}
			}

		}

		.open-price {
			height: 20px;
			display: flex;
			justify-content: center;
			align-items: center;
			margin-top: 25px;
			color: #75DC9E;
			font-weight: 700;
			font-size: 20px;

			line-height: 20px;
			gap: 8px;

			p {
				color: #5E5E5E;

				font-size: 20px;
				font-style: normal;
				line-height: 14px;
				text-decoration-line: strikethrough;
				text-transform: uppercase;
				text-decoration: line-through solid;
				// padding: 0 8px;							
			}

			img {
				width: 18px;
				height: 18px;
				// margin-bottom: 3px;
			}
		}


		.open-btn-box {
			margin-top: 24px;
			width: 100%;
			position: relative;


			.open-btn {
				width: 316px;
				height: 64px;
				background: #3A34B0;
				border-radius: 4px;
				text-align: center;
				line-height: 64px;
				color: #fff;
				font-size: 17px;
				font-weight: bold;
				margin: 0 auto;
				cursor: pointer;
			}

			.switch {
				width: 60px;
				height: 60px;
				background: url(@/assets/romimg/openbox/animation_close.png) no-repeat center;
				background-size: contain;
				position: absolute;
				right: 380px;
				top: 10px;

				&.active {
					background: url(@/assets/romimg/openbox/animation.png) no-repeat center;
					background-size: contain;
				}
			}
		}

	}


	.load-wrap {
		display: flex;
		align-items: center;
		font-size: 17px;
		font-weight: bold;
		color: #A6A4B5;

		img {
			width: 36px;
			height: 36px;
			animation: ani-rotate 2s linear infinite;
			margin-left: 16px;
		}
	}

	.column {
		box-sizing: border-box;
		max-width: 1410px;
		width: 100%;
		margin: 80px auto 10px;
		position: relative;
		background-color: #0D0E1A;


		.tab-wrap {
			display: flex;
			align-items: center;
			height: 96px;

			.tab-item {
				width: 174px;
				height: 100%;
				box-sizing: border-box;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 18px;
				font-weight: bold;
				color: #6F728A;
				background: none;
				cursor: pointer;
				border-bottom: 1px solid #0D0E1A;

				&:hover {
					border-bottom: 1px solid #4638AD;
				}

				img {
					width: 28px;
					height: 25px;
					margin-right: 10px;
				}

				.icon-active {
					display: none;
				}

				.icon-common {
					display: block;
				}

				&.active {
					color: #fff;
					border-bottom: 1px solid #4638AD;

					.icon-active {
						display: block;
					}

					.icon-common {
						display: none;
					}

				}
			}

			.fliter-tab {
				display: flex;
				align-items: center;
				margin-left: 36px;

				.fliter-item {
					width: 96px;
					height: 40px;
					border: 1px solid #1E2037;
					border-radius: 12px;
					box-sizing: border-box;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 18px;
					color: #545774;
					cursor: pointer;
					margin-right: 10px;

					&:hover {
						border: 1px solid #434997;

					}


					&.active {
						color: #fff;
						border: 1px solid #434997;
						-moz-box-shadow: 0px 0px 26px rgba($color: #29228B, $alpha: .25) inset;
						-webkit-box-shadow: 0px 0px 26px rgba($color: #29228B, $alpha: .25) inset;
						box-shadow: 0px 0px 26px rgba($color: #29228B, $alpha: .25) inset;

					}
				}
			}
		}
	}

	.presentation {
		position: absolute;
		top: 40px;
		right: 30px;
		box-sizing: border-box;


		.probability_main {
			display: flex;
			align-items: center;
			flex-direction: row-reverse;

			.probability_item {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 18px;

				div {
					display: flex;
					align-items: center;
					height: 100%;

					img {
						width: 14px;
						height: 14px;
					}

					p {
						font-size: 13px;
						font-weight: 500;
						margin-left: 5px;
					}

				}

			}
		}
	}

	.drop-wrap {
		max-width: 1410px;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
		min-height: 500px;
		background-color: #15172C;


		.drop-title {
			display: flex;
			align-items: center;
			width: 100%;
			height: 65px;
			box-sizing: border-box;
			background-color: #111324;
			font-size: 13px;
			font-weight: bold;
			color: #5D5F72;
			padding: 0 30px;

			.area1 {
				flex: 1;
			}

			.time {
				width: 180px;
			}
		}

		.drop-item {
			height: 56px;
			display: flex;
			align-items: center;
			background-color: #131528;
			box-sizing: border-box;
			width: 100%;
			padding: 0 30px;
			margin-bottom: 2px;

			.area1 {
				display: flex;
				align-items: center;
				flex: 1;

				p {
					margin-left: 10px;
					// color: #6A77FF;
					color: #fff;
				}
			}

			.area2 {
				flex: 1;
				font-size: 15px;

				font-weight: 500;
				color: #FFFFFF;
			}

			.area3 {
				flex: 1;
				font-size: 15px;

				font-weight: 500;
				color: #75DC9E;

				img {
					margin-bottom: -1px;
				}
			}

			.time {
				width: 180px;
				font-size: 15px;

				font-weight: 300;
				color: #C6C7D3;
			}


		}
	}

}
</style>