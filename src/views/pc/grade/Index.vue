<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, nextTick, onMounted, computed, watch } from 'vue';
import weaponListCpt from '@/components/pc/weaponListCpt/Index.vue'
import OpenBoxOneAni from '../openbox/components/OpenBoxOneAni.vue';
import ResultLayer from '../openbox/components/BoxResult.vue';
import { getGradeList, getBlindBoxGoods, openGradeBox } from "@/network/api/blind";
import { getInfo } from '@/network/api/user';
import { useStore } from 'vuex';
import { add, bignumber } from 'mathjs';
const store = useStore();

const boxList = ref([]);//盲盒列表 5个
const itemData = ref({});//盲盒信息
const goodsList = ref([]);//武器列表
const availablePoint = ref(0);//当前可用的盲盒点数
const gradeType = ref(0);//今日已开启的福利盲盒类型(0.代表未开启)
const openBoxData = ref([]);

const animationxRef = ref(null);
const resultRef = ref(null);
const layer = ref(false);
const isAnimation = ref(false);

const hasLogin = computed(() => store.getters.hasLogin)

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

const showOverlay = ref(false)

onMounted(() => {
	getGradeData();
})

watch(hasLogin, val => {
	if (val)
		getGradeData()
})

async function getGradeData() {
	const res = await getGradeList();
	if (res.code === 0) {
		let items = res.data.items || [];
		availablePoint.value = res.data.availablePoint;
		gradeType.value = res.data.gradeType;
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
				rarityList.value[item.goodsLevel - 1].probability = add(bignumber(rarityList.value[item.goodsLevel - 1].probability),
					bignumber(item.probability));
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
	layer.value = false;
	resultRef.value.showReuslt(openBoxData.value);
	store.dispatch("getUserInfo");
	getGradeData();
}

function onResultClose() {
	layer.value = false;
}

//切换选中
function onClickItem(item) {
	if (item.level != itemData.value.level) {
		itemData.value = item;
		getGradeBoxGoods(itemData.value.boxItem.boxId);
	}
}

async function onClickOpen(openItem) {
	const res = await openGradeBox({ boxId: openItem.boxItem.boxId });

	if (res.code == 0) {
		let item = res.data.item;
		openBoxData.value = [item];

		layer.value = true;

		animationxRef.value.randGoodList();
		setTimeout(() => {
			startAnimationX()
		}, 550)

		const infoRes = await getInfo();
		if (infoRes.code === 0) {
			store.commit("setUserAmount", infoRes.data.assets.amount);
		}

	}

}

function onClickHelp() {
	let data = {
		show: true,
		html: t('grade.rule')
	}
	store.commit('setHowPlay', data)
}

function getBgImageUrl(item) {
	if (item && item.boxItem && item.boxItem.imageUrl) {
		return 'background-image: url(' + item.boxItem.imageUrl + ');';
	} else {
		return '';
	}

}

function getNeedAmount(item) {
	let amount = Number(item.needAmount) - Number(availablePoint.value);
	if (amount < 1000) {
		return '' + amount;
	} else {
		return '' + amount
	}
}

function onClickLogin() {
	store.commit('setSignView', true)
}
</script>
		
<template>
	<div id="pc-grade-wrap">
		<div class="lightbox-container" :class="{ active: isAnimation }" v-if="isAnimation"></div>
		<div class="grade-layer" v-show="layer"></div>
		<div class="page-head">
			<div class="page-title">
				<img src="@/assets/pcimg/grade/icon.png" alt="" />
				{{ t('router.grade') }}
			</div>
			<div class="help" @click="onClickHelp"></div>
		</div>

		<!-- 登陆前显示 -->
		<div class="grade-list-wrap" v-if="!hasLogin">
			<div class="grade-item" v-for="(item, index) in boxList" :key="index" @click="onClickItem(item)"
				:class="{ select: itemData.level == item.level }">
				<div v-if="item.boxItem" class="item-container">
					<div class="grade-item-pic" :style="getBgImageUrl(item)">
						<img :src="item.boxItem.weaponImageUrl" alt="">
					</div>
					<div class="level">{{ item.boxItem.name }}</div>

					<div class="free">FREE</div>

					<div class="grade-btn-open" @click="onClickLogin()">
						{{ t('openbox.open') }}
					</div>
				</div>
			</div>
		</div>
		<!-- /登陆前显示 -->

		<!-- 登陆后显示 -->
		<div class="grade-list-wrap" v-else>
			<div class="grade-item" v-for="(item, index) in boxList" :key="index" @click="onClickItem(item)"
				:class="{ select: itemData.level == item.level }">
				<div v-if="item.boxItem" class="item-container">
					<div class="grade-item-pic" :style="getBgImageUrl(item)">
						<img :src="item.boxItem.weaponImageUrl" alt="">
					</div>
					<div class="level">{{ item.boxItem.name }}</div>
					<!-- <div class="level" v-if="Number(availablePoint) >= Number(item.needAmount)">LEVEL{{ index + 1 }}</div> -->
					<!-- <div class="level" v-else>还需充值</div> -->
					<!-- <div class="level" v-else-if="gradeType != 0 && Number(availablePoint) >= Number(item.needAmount)">LEVEL{{ index + 1 }}</div> -->

					<div class="free" v-if="Number(availablePoint) >= Number(item.needAmount)">FREE</div>
					<!-- <div class="free" v-else-if="gradeType != 0 && Number(availablePoint) >= Number(item.needAmount)">FREE</div> -->
					<div class="free" v-else>
						<!-- <img src="@/assets/pcimg/common/coin.png"> -->
						{{ t('grade.needRecharge', { money: Number(item.needAmount) - Number(availablePoint) }) }}
					</div>

					<div class="grade-btn-refresh" v-if="gradeType != 0 && item.level != gradeType">{{ t('grade.refreshing'
					) }}</div>
					<div class="grade-btn-already" v-else-if="item.level == gradeType">{{ t('grade.opened') }}</div>
					<div class="grade-btn-open"
						v-else-if="gradeType == 0 && Number(availablePoint) >= Number(item.needAmount)"
						@click="onClickOpen(item)">
						{{ t('openbox.open') }}</div>
					<div class="grade-btn-already" v-else>
						<img src="@/assets/pcimg/grade/lock.png">
						{{ t('grade.lock') }}
					</div>
				</div>
			</div>
		</div>
		<!-- /登陆后显示 -->

		<OpenBoxOneAni v-show="isAnimation" :goodsList="goodsList" @onAnimationEnd="onAnimationEnd" ref="animationxRef">
		</OpenBoxOneAni>
		<div class="page-box-title">
			{{ t('openbox.boxIncludes') }}
			<div class="presentation">
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
		<weaponListCpt :list="goodsList" :showBaolv="false"></weaponListCpt>
		<ResultLayer :goodsList="goodsList" @onClose="onResultClose" ref="resultRef"></ResultLayer>
	</div>
</template>
		
<style lang="scss">
#pc-grade-wrap {
	box-sizing: border-box;
	padding-bottom: 60px;
	padding-top: 50px;
	max-width: 1440px;
	width: 100%;
	margin: 0 auto;
	position: relative;
	padding-left: 15px;
	padding-right: 15px;

	.lightbox-container {
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
		position: fixed;
		left: 0;
		top: 0;
		z-index: 0;
		opacity: 0;
		transition: .5s;

		&.active {
			opacity: 1;
			z-index: 200;
		}
	}

	#pc-single-animation {
		position: fixed;
		width: 1410px;
		height: 604px;
		background: transparent;
		z-index: 201;
		top: calc(50% - 604px / 2);
	}


	.page-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #15172C;

		.page-title {
			display: flex;
			align-items: center;
			color: #FFF;
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


	.grade-layer {
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		z-index: 10;
	}

	.grade-list-wrap {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		max-width: calc(1440px - 100px);
		width: 100%;
		margin: 30px auto 30px auto;
		z-index: 2;
		box-sizing: border-box;
		// background: #0D0E1C;
		padding: 30px 0; // 50px;

		.grade-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			background: url(@/assets/pcimg/grade/item_bg.png) no-repeat center;
			background-size: 100% 100%;
			width: 239px;
			height: 357px;
			position: relative;
			box-sizing: border-box;

			.item-container {
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 100%;
				height: 100%;

				.grade-item-pic {
					display: flex;
					justify-content: center;
					align-items: center;
					background-repeat: no-repeat;
					background-size: 100%;
					background-position: center;
					height: 210px;
					margin-top: 10px;

					img {
						max-width: 80%;
						max-height: 80%;
					}
				}

				.level {
					color: #FBFFFE;

					font-size: 16px;
					font-style: normal;
					font-weight: 700;
					margin-top: 10px;
				}

				.free {
					color: #4AF1B8;

					font-size: 14px;
					font-style: normal;
					font-weight: 700;
					margin-top: 10px;
					display: flex;
					align-items: center;
					gap: 5px;

					img {
						width: 18px;
					}
				}

				.grade-btn-refresh {
					display: flex;
					width: 182px;
					height: 40px;
					justify-content: center;
					align-items: center;
					color: #777585;
					font-size: 13px;
					background: #1C1A30;
					font-weight: 700;
					margin-top: 15px;
				}

				.grade-btn-already {
					display: flex;
					width: 148px;
					height: 40px;
					justify-content: center;
					align-items: center;
					border-radius: 2px;
					background: #1C1A30;
					font-size: 14px;
					font-weight: 700;
					color: #777585;
					margin-top: 15px;
					gap: 4px;
				}

				.grade-btn-open {
					display: flex;
					width: 148px;
					height: 40px;
					justify-content: center;
					align-items: center;
					border-radius: 2px;
					background: #3A33AD;
					font-size: 14px;
					font-weight: 700;
					color: #fff;
					margin-top: 15px;
				}


				.grade-item-rechg {
					display: flex;
					flex-direction: column;

					p {
						font-size: 24px;
						color: #FFFFFF;
					}

					.rechg-wrap {
						display: flex;
						align-items: center;
						font-size: 24px;
						font-weight: bold;
						color: #00F0FF;
						margin-top: 21px;
						text-align: center;
						box-sizing: border-box;
						margin-bottom: 24px;

						img {
							width: 36px;
						}

						span {
							font-weight: bold;
							font-size: 24px;
							color: #FFEA00;
						}
					}
				}
			}

			&.select {
				background: url(@/assets/pcimg/grade/item_bg2.png) no-repeat center;
				background-size: 100% 100%;
			}
		}
	}

	.page-box-title {
		width: 100%;
		height: 90px;
		background: linear-gradient(180deg, rgba(16, 17, 32, 0.90) 0%, rgba(16, 17, 32, 0.00) 100%);
		color: #FFF;
		font-size: 21px;
		display: flex;
		align-items: center;
		padding-left: 42px;
		box-sizing: border-box;
		position: relative;


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
	}


}
</style>