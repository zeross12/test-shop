<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onUnmounted } from 'vue';

import { recoveryGoods } from "@/network/api/user";
import { GoodImageBgType } from '@/util/util'
import { playAudio, stopAudio } from '@/util/common';
import audioshow from '@/assets/audio/show.mp3'
import audiorecory from '@/assets/audio/recory.mp3'
import { useStore } from 'vuex';

const props = defineProps(['goodsList', 'isBattle', 'titleData']);
const emit = defineEmits(['onClose']);
defineExpose({ showReuslt });

const store = useStore();

const goodList = ref([]);
const show = ref(false);
const overall = ref('');
let showaudio = new Audio(audioshow);
let recoryaudio = new Audio(audiorecory);
const ammunitionShow = ref(false);
const ammonall = ref(0);
const sellingPrice = ref(0);
const choosekey = ref(0);

onUnmounted(() => {
	stopAudio(showaudio)
	stopAudio(recoryaudio)
})

function showReuslt(list) {
	goodList.value = list;
	if (goodList.value.length == 4) {
		overall.value = 'four'
	} else if (goodList.value.length == 5) {
		overall.value = 'five'
	} else {
		overall.value = ''
	}
	if (props.isBattle) {
		if (goodList.value.length < 4) {
			overall.value = ''
		} else if (goodList.value.length > 5) {
			overall.value = 'five'
		}
	}
	let key = "choose"
	let value = true

	let allammon = 0;
	for (let i = 0; i < goodList.value.length; i++) {
		goodList.value[i][key] = value
		allammon += Number(goodList.value[i].ammon)
	}
	ammonall.value = allammon;

	if (props.isBattle) {
		window.$dev && console.log('ammon', props.titleData.ammon);
		ammonall.value = props.titleData.ammon;
	}

	priceCalculation();

	show.value = true;
	if (!props.isBattle) {
		// showaudio.play();
		playAudio(showaudio);
	}
	setTimeout(() => {
		ammunitionShow.value = true

	}, 250)
}


//计算价格
function priceCalculation() {
	let choice_list = goodList.value.filter((item) => {
		return item.choose
	})

	// window.$dev && console.log(choice_list)
	let price = 0
	for (let i = 0; i < choice_list.length; i++) {
		price += Number(choice_list[i].recoveryPrice)
	}

	sellingPrice.value = price
}

//选择
function choice(item) {
	if (item.choose) {
		delete item.choose
	} else {
		let key = "choose";
		let value = true
		item[key] = value
	}
	// choosekey.value += 1
	priceCalculation()
}

function onClickSell() {
	let choiceList = goodList.value.filter((item) => {
		return item.choose
	})
	if (choiceList.length > 0) {
		let params = {
			goodsIds: []
		}
		for (let i = 0; i < choiceList.length; i++) {
			params.goodsIds.push(choiceList[i].id)
		}
		recoveryGoods(params).then(res => {
			if (res.code == 0) {
				// recoryaudio.play();
				playAudio(recoryaudio);
				Success({ offset: 100, message: res.message });
				store.dispatch("getUserInfo");
				onClose();
			}
		})
	} else {
		Warn({ offset: 100, message: t('openbox.noChangeGoods'), customClass: 'error' })
	}
}

function onClose() {
	show.value = false
	emit('onClose')
	setTimeout(() => {
		ammunitionShow.value = false
	}, 300)
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.boxResult, item.goodsLevel);
}
</script>
		
<template>
	<div id="pc-openbox-result" :class="{ 'active': show }">
		<div class="reuslt-bat-title" v-if="props.isBattle"><img src="@/assets/romimg/battle/detail/win_title.png">
		</div>
		<div class="show_main" :class="[{ 'four': overall == 'four' }, { 'five': overall == 'five' }]">
			<div class="ammo-wrap" v-show="ammonall > 0" :class="{ 'active': ammunitionShow }"><img
					src="@/assets/romimg/common/danyao.png" alt="">+{{
						ammonall.toFixed(2)
					}}</div>
			<div class="show-title" v-if="!props.titleData">{{ t('openbox.getReward') }}</div>
			<div class="title-data" v-if="props.titleData"
				v-html="t('openbox.getRewardContentPc', { name: props.titleData.name, price: props.titleData.price })">
			</div>
			<div class="prize-box-content">
				<div class="prize-box" :key="choosekey">
					<div class="prize-item" :class="{ 'choice': item.choose }" @click="choice(item, index)"
						v-for="(item, index) in goodList" :key="index">

						<div class="prize-item-back" :style="'background-image: url(' + getImageBg(item) + ');'">

							<div class="prize-item-pic">
								<img :src="item.iconUrl" alt="">
							</div>

							<div class="price"><img src="@/assets/romimg/common/gold.png" alt="">{{
								item.price
							}}</div>
						</div>
						<div class="prize-item-name hide">{{ item.goodsName }}</div>
					</div>
				</div>
			</div>
			<div class="result-btns">
				<p @click="onClose">{{ t('openbox.putInBag') }}</p>
				<p @click="onClickSell">{{ t('openbox.sale') }}{{ sellingPrice.toFixed(2) }}</p>
			</div>
		</div>
	</div>
</template>
		
<style lang="scss">
#pc-openbox-result {
	position: fixed;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
	background-color: rgba($color: #000000, $alpha: .8);
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	padding-bottom: 100px;
	box-sizing: border-box;
	transition: .3s;
	opacity: 0;
	z-index: -1;
	color: #fff;

	&.active {
		opacity: 1;
		z-index: 1000;
	}

	.reuslt-title {
		display: flex;
		justify-content: center;
		padding-bottom: 4px;

		img {
			width: 341px;
			height: 111px;
		}
	}

	.reuslt-bat-title {
		display: flex;
		justify-content: center;
		padding-bottom: 4px;

		img {
			width: 415px;
			height: 117px;
		}
	}

	.show_main {
		width: 851px;
		height: 446px;
		background: url(@/assets/romimg/openbox/box_result_bg.png) no-repeat center;
		background-size: 100% 100%;
		position: relative;

		.ammo-wrap {
			width: 100%;
			height: 36px;
			position: absolute;
			left: 0;
			top: 90px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 30px;
			color: #7AE6A6;
			font-weight: bold;
			transform: translateY(60px);
			opacity: 0;
			transition: .3s;

			img {
				width: 50px;
				margin-right: 6px;
			}

			&.active {
				transform: translateY(0);
				opacity: 1;
			}
		}


		.show-title {
			font-size: 40px;

			text-align: center;
			margin-top: 20px;
		}

		.title-data {
			font-size: 26px;
			text-align: center;
			margin-top: 15px;
			display: flex;
			justify-content: center;
			align-items: center;

			.title-price {
				height: 40px;
				display: flex;
				justify-content: center;
				align-items: center;
				color: #FFC400;
				font-size: 26px;
				font-weight: bold;

				img {
					width: 45px;
					height: 45px;
				}
			}
		}

		.prize-box {
			width: 100%;
			height: 340px;
			margin: 34px auto 0;
			display: flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			overflow-y: scroll;

			.prize-item {
				width: 205px;
				height: 205px;
				margin: 0px 20px;
				cursor: pointer;

				&.choice {
					background: url(@/assets/romimg/openbox/choice.png) no-repeat center;
					background-size: contain;
					width: 205px;
					height: 205px;
				}

				.prize-item-back {
					width: 175px;
					height: 175px;
					margin: 18px auto;
					background-repeat: no-repeat;
					background-position: center;
					background-size: 100%;

					.prize-item-pic {
						width: 135px;
						height: 120px;
						margin: 0px auto;
						display: flex;
						justify-content: center;
						align-items: center;

						img {
							max-width: 100%;
							max-height: 100%;
						}
					}

					.price {
						height: 30px;
						display: flex;
						justify-content: center;
						align-items: center;
						color: #FBFA02;
						font-size: 26px;
						font-weight: bold;

						img {
							width: 40px;
							height: 40px;
						}
					}
				}

				.prize-item-name {
					text-align: center;
					font-size: 24px;
					margin-top: 20px;
					padding: 0 20px;
					box-sizing: border-box;
				}
			}

			&::-webkit-scrollbar {
				width: 0px;
			}
		}

		.result-btns {
			display: flex;
			justify-content: center;
			margin-top: 78px;

			p {
				width: 268px;
				height: 64px;
				background: url(@/assets/romimg/openbox/btn_result.png) no-repeat center;
				background-size: contain;
				font-size: 28px;
				color: #141221;
				font-weight: bold;
				text-align: center;
				line-height: 64px;
				margin: 0 30px;
				cursor: pointer;
			}
		}

		&.five {
			width: 1262px;
			height: 546px;
			background: url(@/assets/romimg/openbox/box_result_bg.png) no-repeat center;
			background-size: 100% 100%;


			.ammo-wrap {
				top: 100px;
			}

			.prize-box-content {
				width: 100%;
				margin-top: 80px;
				height: 400px;


				.prize-box {
					flex-wrap: wrap;

					.prize-item {
						margin: 25px 20px;
					}
				}
			}

			.result-btns {
				margin-top: 90px;
			}

			.show-title {
				margin-top: 10px;
			}
		}

		&.four {
			width: 1262px;
			height: 446px;
			background: url(@/assets/romimg/openbox/box_result_bg.png) no-repeat center;
			background-size: 100% 100%;

			.ammo-wrap {
				top: 90px;
			}

			.prize-box {
				width: 100%;
				margin-top: 20px;

				.prize-item {
					margin: 25px 20px;
				}
			}

			.result-btns {
				margin-top: 40px;
			}

			.show-title {
				margin-top: 10px;
			}
		}
	}
}</style>