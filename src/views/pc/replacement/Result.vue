<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from 'vue';
import { GoodImageBgType } from '@/util/util'
import { useStore } from 'vuex';

const props = defineProps(['goodsList', 'isBattle', 'titleData']);
const emit = defineEmits(['onClose', 'onOk']);
defineExpose({ showReuslt, onClose });

const store = useStore();

const goodList = ref([]);
const show = ref(false);
const overall = ref('');

function showReuslt(list) {
	goodList.value = list;
	if (goodList.value.length == 4) {
		overall.value = 'four'
	} else if (goodList.value.length == 5) {
		overall.value = 'five'
	} else if (goodList.value.length > 5) {
		overall.value = 'more_than_5'
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
	show.value = true;
}

function onClose() {
	show.value = false
	emit('onClose')
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.boxResult, item.goodsLevel);
}
</script>
		
<template>
	<div id="box-result" :class="{ 'active': show }">
		<div class="show_main"
			:class="[{ 'four': overall == 'four' }, { 'five': overall == 'five' }, { 'more_than_5': overall == 'more_than_5' }]">
			<div class="show-title">目标饰品</div>
			<div class="prize-box">
				<div class="prize-item" v-for="(item, index) in goodList" :key="index">

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
			<div class="result-btns">
				<p @click="onClose">{{ t('notify.cancel') }}</p>
				<p @click="emit('onOk')">确认置换</p>
			</div>
		</div>
	</div>
</template>
		
<style lang="scss">
#box-result {
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
		width: 681px;
		height: 446px;
		background: url(@/assets/romimg/openbox/box_result_bg.png) no-repeat center;
		background-size: contain;
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
			width: 681px;
			height: 340px;
			margin: 34px auto 0;
			display: flex;
			/* align-items: center; */
			justify-content: center;
			box-sizing: border-box;
			overflow-y: scroll;
			flex-wrap: wrap;

			.prize-item {
				width: 205px;
				height: 205px;
				margin: 0px 10px;
				margin-bottom: 40px;

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

				.block {
					height: 40px;
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
			}
		}

		&.five {
			width: 681x;
			height: 921px;
			background: url(@/assets/romimg/openbox/box_result_bg2.png) no-repeat center;
			background-size: contain;

			.ammo-wrap {
				top: 110px;
			}

			.prize-box {
				height: 600px;
				margin-top: 90px;
				flex-wrap: wrap;

				.prize-item {
					margin: 25px 10px;
				}
			}

			.result-btns {
				margin-top: 80px;
			}

			.show-title {
				margin-top: 10px;
			}
		}

		&.four {
			width: 681x;
			height: 921px;
			background: url(@/assets/romimg/openbox/box_result_bg2.png) no-repeat center;
			background-size: contain;

			.ammo-wrap {
				top: 104px;
			}

			.prize-box {
				height: 600px;
				margin-top: 90px;
				flex-wrap: wrap;

				.prize-item {
					margin: 0 40px;
				}
			}

			.result-btns {
				margin-top: 40px;
			}

			.show-title {
				margin-top: 10px;
			}
		}

		&.more_than_5 {
			height: 921px;
			background: url(@/assets/romimg/openbox/box_result_bg2.png) no-repeat center;
			background-size: contain;

			.prize-box {
				height: 600px;
				flex-wrap: wrap;
			}

			.show-title {
				margin-top: 10px;
			}
		}
	}
}
</style>