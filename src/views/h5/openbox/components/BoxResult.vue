<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "vue";

import { recoveryGoods } from "@/network/api/user";
import { GoodImageBgType } from "@/util/util";
import { playAudio } from "@/util/common";
import audioshow from "@/assets/audio/show.mp3";
import audiorecory from "@/assets/audio/recory.mp3";
import { useStore } from "vuex";
import { getGoodsNamePre, getGoodsNameSec } from "@/util/common";
const props = defineProps(["goodsList", "isBattle", "titleData"]);
const emit = defineEmits(["onClose"]);
defineExpose({ showReuslt });

const store = useStore();

const goodList = ref([]);
const show = ref(false);
let showaudio = new Audio(audioshow);
let recoryaudio = new Audio(audiorecory);
const ammunitionShow = ref(false);
const ammonall = ref(0);
const sellingPrice = ref(0);
const allPrice = ref(0);
const choosekey = ref(0);

function showReuslt(list) {
	goodList.value = list;
	let key = "choose";
	let value = true;

	let allammon = 0;
	allPrice.value = 0;
	for (let i = 0; i < goodList.value.length; i++) {
		goodList.value[i][key] = value;
		allammon += Number(goodList.value[i].ammon);
		allPrice.value += Number(goodList.value[i].recoveryPrice);
	}
	ammonall.value = allammon;

	if (props.isBattle) {
		window.$dev && console.log("ammon", props.titleData.ammon);
		ammonall.value = props.titleData.ammon;
	}

	priceCalculation();

	show.value = true;
	if (!props.isBattle) {
		// showaudio.play();
		playAudio(showaudio);
	}
	setTimeout(() => {
		ammunitionShow.value = true;
	}, 250);
}

//计算价格
function priceCalculation() {
	let choice_list = goodList.value.filter((item) => {
		return item.choose;
	});

	// window.$dev && console.log(choice_list)
	let price = 0;
	for (let i = 0; i < choice_list.length; i++) {
		price += Number(choice_list[i].recoveryPrice);
	}

	sellingPrice.value = price;
}

//选择
function choice(item) {
	if (item.choose) {
		delete item.choose;
	} else {
		let key = "choose";
		let value = true;
		item[key] = value;
	}
	// choosekey.value += 1
	priceCalculation();
}

function onClickSell() {
	let choiceList = goodList.value.filter((item) => {
		return item.choose;
	});
	if (choiceList.length > 0) {
		let params = {
			goodsIds: [],
		};
		for (let i = 0; i < choiceList.length; i++) {
			/// >>>>>>>>>>>>>>>>>>>>>
			params.goodsIds.push(choiceList[i].rucksackGoodsId);
			/// <<<<<<<<<<<<<<<<<<<<<
		}
		recoveryGoods(params).then((res) => {
			if (res.code == 0) {
				// recoryaudio.play();
				playAudio(recoryaudio);
				Notify(res.message);
				store.dispatch("getUserInfo");
				onClose();
			}
		});
	} else {
		NotifyF("请选择至少一件饰品");
	}
}

function onClose() {
	show.value = false;
	emit("onClose");
	setTimeout(() => {
		ammunitionShow.value = false;
	}, 300);
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(
		GoodImageBgType.replace,
		item.goodsLevel
	);
}
function getImageBg2(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.box, item.goodsLevel);
}
</script>

<template>
	<div id="pc-box-result" :class="{ active: show }">
		<div class="mult-result-wrap" v-if="goodList.length > 1">
			<div class="close" @click="onClose">
				<img src="@/assets/pcimg/common/close.png" alt="" />
			</div>
			<div class="result-title">
				<p>获得饰品</p>
				<div>
					{{ goodList.length }}件饰品<span>{{ allPrice.toFixed(2) }}</span>
				</div>
			</div>
			<div class="prize-box-content">
				<div class="prize-box" :key="choosekey">
					<div
						class="prize-item"
						:class="{ choice: item.choose }"
						@click="choice(item, index)"
						v-for="(item, index) in goodList"
						:key="index"
					>
						<div
							class="prize-item-back"
							:style="'background-image: url(' + getImageBg2(item) + ');'"
						>
							<div class="prize-item-pic">
								<img :src="item.iconUrl" alt="" />
							</div>
						</div>
						<div class="item-info">
							<p class="price">{{ item.price }}</p>
							<p class="item-info1">{{ getGoodsNamePre(item.goodsName) }}</p>
							<p class="item-info2">{{ getGoodsNameSec(item.goodsName) }}</p>
						</div>
					</div>
				</div>
			</div>
			<div class="opt-wrap">
				<div class="btn-all-recovery" @click="onClickSell">
					全部分解<img
						class="pc-price-coin"
						src="@/assets/pcimg/common/coin.png"
						alt=""
					/>{{ allPrice.toFixed(2) }}
				</div>
				<div class="btn-recovery" @click="onClickSell">分解选择的饰品</div>
				<div class="btn-return" @click="onClose">放入背包</div>
			</div>
		</div>
		<div class="one-result-wrap dialog-wrap" v-if="goodList.length == 1">
			<div class="close" @click="onClose">
				<img src="@/assets/pcimg/common/close.png" alt="" />
			</div>
			<div class="bg"></div>
			<div class="result-title">获得饰品</div>
			<div
				class="prize-item-back"
				:style="'background-image: url(' + getImageBg(goodList[0]) + ');'"
			>
				<div class="prize-item-pic">
					<img :src="goodList[0].iconUrl" alt="" />
				</div>
			</div>
			<div class="item-info">
				<p class="item-info1">{{ getGoodsNamePre(goodList[0].goodsName) }}</p>
				<p class="item-info2">{{ getGoodsNameSec(goodList[0].goodsName) }}</p>
			</div>
			<div class="opt-wrap">
				<div class="btn-return" @click="onClose">放入背包</div>
				<div class="btn-recovery" @click="onClickSell">
					分解<img
						class="pc-price-coin"
						src="@/assets/pcimg/common/coin.png"
						alt=""
					/>
					{{ sellingPrice.toFixed(2) }}
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#pc-box-result {
	position: fixed;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
	background-color: rgba($color: #000000, $alpha: 0.8);
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	box-sizing: border-box;
	opacity: 0;
	z-index: -1;
	color: #fff;

	&.active {
		opacity: 1;
		z-index: 1000;

		.mult-result-wrap {
			transform: scale(1);
			transition: all 1s ease-out;
		}

		.one-result-wrap {
			.prize-item-back {
				.prize-item-pic {
					transform: scale(1);
					transition: all 2s ease-out;
				}
			}
		}
	}

	.one-result-wrap {
		width: 576px;
		height: 694px;
		background: #0d0e1c;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;

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

		.bg {
			position: absolute;
			top: 0;
			left: 40px;
			animation: ani-rotate 4s linear infinite;
			width: 507px;
			height: 483px;
			background: url(@/assets/romimg/openbox/result_bg.png) no-repeat center;
			background-size: cover;
		}

		.result-title {
			color: #fff;
			text-align: center;
			font-size: 27px;
			font-style: normal;
			font-weight: 400;
			line-height: 32.4px;
			position: absolute;
			top: 48px;
			left: 50%;
			transform: translateX(-50%);
			text-transform: capitalize;
		}

		.prize-item-back {
			width: 360px;
			height: 360px;
			margin: 56px auto 0;
			background-repeat: no-repeat;
			background-position: center;
			background-size: cover;
			position: relative;

			.prize-item-pic {
				width: 360px;
				height: 360px;
				display: flex;
				justify-content: center;
				align-items: center;
				transform: scale(0);

				img {
					max-width: 350px;
					max-height: 262px;
				}
			}
		}

		.item-info {
			display: flex;
			align-items: center;
			flex-direction: column;
			margin-top: 3px;
			position: relative;

			.item-info1 {
				color: #eff0f5;
				text-align: center;
				font-size: 18px;
				font-style: normal;
				font-weight: 500;
				line-height: 21.6px;
			}

			.item-info2 {
				color: #eff0f5;
				text-align: center;
				font-size: 21px;
				font-style: normal;
				font-weight: 700;
				line-height: 25.2px;
			}
		}

		.opt-wrap {
			display: flex;
			position: relative;
			margin-top: 45px;

			.btn-return {
				display: flex;
				max-width: 316px;
				padding: 2px 25px 0px 25px;
				justify-content: center;
				align-items: center;
				color: #fff;
				text-align: center;
				font-size: 17px;
				font-style: normal;
				font-weight: 700;
				line-height: 25.5px;
				cursor: pointer;
				margin-right: 18px;
				border-radius: 4px;
				background: #3a34b0;
			}

			.btn-recovery {
				display: flex;
				max-width: 316px;
				padding: 17.25px 24.8px 16.25px 25px;
				justify-content: center;
				align-items: center;
				color: #fff;
				text-align: center;
				font-size: 17px;
				font-style: normal;
				font-weight: 700;
				line-height: 25.5px;
				cursor: pointer;
				border-radius: 4px;
				background: #7d51df;

				img {
					margin-left: 5px;
				}
			}
		}
	}

	.mult-result-wrap {
		width: 605px;
		height: 711.66px;
		background: #191c34;
		position: relative;
		transform: scale(0);

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

		.result-title {
			width: 100%;
			height: 130px;
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding-left: 40px;
			box-sizing: border-box;
			background: #191c34;

			p {
				color: #fff;
				font-size: 26px;
				font-style: normal;
				font-weight: 400;
				line-height: 31.2px;
			}

			div {
				display: flex;
				align-items: center;
				color: #9093a7;
				font-size: 15px;
				font-style: normal;
				font-weight: 400;
				line-height: 22.5px;

				span {
					color: #6ecf96;
					font-size: 14px;
					font-style: normal;
					font-weight: 500;
					line-height: 22.5px;
					margin-top: 5px;
					margin-left: 5px;
				}
			}
		}

		.prize-box {
			width: 100%;
			height: 465px;
			display: flex;
			box-sizing: border-box;
			flex-wrap: wrap;
			overflow-y: scroll;
			background: #15162b;

			.prize-item {
				width: 201px;
				height: 233px;
				cursor: pointer;
				position: relative;

				&.choice {
					background: url(@/assets/pcimg/openbox/choose.png) no-repeat center;
					background-size: 100% 100%;
				}

				.prize-item-back {
					width: 175px;
					height: 175px;
					margin: 18px auto;
					background-repeat: no-repeat;
					background-position: center;
					background-size: 100%;

					.prize-item-pic {
						width: 175px;
						height: 175px;
						margin: 0px auto;
						display: flex;
						justify-content: center;
						align-items: center;

						img {
							max-width: 80%;
							max-height: 80%;
						}
					}
				}

				.item-info {
					display: flex;
					flex-direction: column;
					position: absolute;
					left: 26px;
					bottom: 34px;

					.price {
						color: #7bdca2;
						font-size: 13px;
						font-weight: 700;
						line-height: 16.9px;
					}

					.item-info1 {
						color: #cbccd6;
						font-size: 12px;
						font-style: normal;
						font-weight: 400;
						line-height: 15.6px;
					}

					.item-info2 {
						color: #fff;
						font-size: 11px;
						font-style: normal;
						font-weight: 700;
						line-height: 15.6px;
					}
				}
			}

			&::-webkit-scrollbar {
				width: 0px;
			}
		}

		.opt-wrap {
			display: flex;
			justify-content: center;
			position: relative;
			margin-top: 35px;

			.btn-return {
				display: flex;
				height: 46px;
				padding: 3px 15px 0px 15px;
				justify-content: center;
				align-items: center;
				color: #fff;
				text-align: center;
				font-size: 15px;
				font-style: normal;
				font-weight: 400;
				line-height: 15px;
				cursor: pointer;

				border-radius: 4px;
				background: #3a34b0;
			}

			.btn-all-recovery {
				display: flex;
				height: 46px;
				padding: 3px 15px 0px 15px;
				justify-content: center;
				align-items: center;
				gap: 0.11px;
				cursor: pointer;
				border-radius: 4px;
				background: #7d51df;
				color: #fff;
				text-align: center;
				font-size: 15px;
				font-style: normal;
				font-weight: 400;
				line-height: 15px;
				img {
					margin-left: 5px;
				}
			}

			.btn-recovery {
				display: flex;
				height: 46px;
				padding: 3px 15px 0px 15px;
				justify-content: center;
				align-items: center;
				color: #fff;
				text-align: center;
				font-size: 15px;
				font-style: normal;
				font-weight: 400;
				line-height: 15px;
				cursor: pointer;
				border-radius: 4px;
				background: #7d51df;
				margin-right: 10px;
				margin-left: 10px;
			}
		}
	}
}
</style>
