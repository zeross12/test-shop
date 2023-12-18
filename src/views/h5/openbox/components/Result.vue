<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted } from "vue";

import { recoveryGoods } from "@/network/api/user";
import { GoodImageBgType } from "@/util/util";
import { playAudio } from "@/util/common";
import audioshow from "@/assets/audio/show.mp3";
import audiorecory from "@/assets/audio/recory.mp3";
import { useStore } from "vuex";
import Currency from "@/components/h5/common/Currency.vue";
const props = defineProps([
	"goodsList",
	"isBattle",
	"titleData",
	"gradeTimeTitle",
	"openBoxTitle",
]);
const emit = defineEmits(["onClose"]);
defineExpose({ showReuslt });

const store = useStore();

const goodList = ref([]);
const show = ref(false);
const overall = ref("");
let showaudio = new Audio(audioshow);
let recoryaudio = new Audio(audiorecory);
const ammunitionShow = ref(false);
const ammonall = ref(0);
const sellingPrice = ref(0);
const choosekey = ref(0);

/// 中秋活动集字卡
const sticker = ref([]);

function showReuslt(list) {
	goodList.value = list;
	selectedGoodsNumber.value = list.length;
	if (goodList.value.length == 4) {
		overall.value = "four";
	} else if (goodList.value.length == 5) {
		overall.value = "five";
	} else {
		overall.value = "";
	}
	if (props.isBattle) {
		if (goodList.value.length < 4) {
			overall.value = "";
		} else if (goodList.value.length > 5) {
			overall.value = "five";
		}
	}
	let key = "choose";
	let value = true;

	let allammon = 0;
	for (let i = 0; i < goodList.value.length; i++) {
		/**
		 * 过滤集字卡
		 */
		if (
			typeof goodList.value[i].sticker != "undefined" &&
			goodList.value[i].sticker
		) {
			sticker.value.push({
				ammon: "0.00",
				price: "0.00",
				goodsLevel: 6,
				recoverPrice: "0.00",
				choose: false,
				iconUrl: goodList.value[i].sticker.stickerIconUrl,
				goodsName: `“${goodList.value[i].sticker.stickerLabel}”集字卡 | 不可分解`,
				notAllowSell: true,
			});
		}
		goodList.value[i][key] = value;
		allammon += Number(goodList.value[i].ammon);
	}
	ammonall.value = allammon;

	if (props.isBattle) {
		window.$dev && console.log("ammon", props.titleData.ammon);
		ammonall.value = props.titleData.ammon;
	}

	goodList.value = goodList.value.concat(sticker.value);
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
let selectedGoodsNumber = ref(0);
onMounted(() => {
	// window.$dev && console.log("sss", props.goodsList.value.length);
	// selectedGoodsNumber.value = props.goodsList.value.length;
});
//选择
function choice(item) {
	/// 不允许集字卡分解
	if (typeof item.notAllowSell != "undefined" && item.notAllowSell) return;
	if (item.choose) {
		delete item.choose;
		selectedGoodsNumber.value = selectedGoodsNumber.value - 1;
	} else {
		let key = "choose";
		let value = true;
		item[key] = value;
		selectedGoodsNumber.value = selectedGoodsNumber.value + 1;
	}
	// choosekey.value += 1
	priceCalculation();
}

function onClickSell() {
	sticker.value = [];
	let choiceList = goodList.value.filter((item) => {
		return item.choose;
	});
	if (choiceList.length > 0) {
		let params = {
			goodsIds: [],
		};
		for (let i = 0; i < choiceList.length; i++) {
			// params.goodsIds.push(choiceList[i].id);
			/// >>>>>>>>>>>>>>>>>>>>>
			params.goodsIds.push(choiceList[i].id);
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
		NotifyF(t('openbox.noChangeGoods'));
	}
}

function onClose() {
	sticker.value = [];
	show.value = false;
	emit("onClose");
	setTimeout(() => {
		ammunitionShow.value = false;
	}, 300);
}

function getImageBg(item) {
	if (item) {
		return store.getters.getGoodsBgImage(
			GoodImageBgType.replace,
			item.goodsLevel
		);
	}
	return "";
}

function getImageBg2(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.box, item.goodsLevel);
}

const getGoodsNamePre = (name) => {
	if (!name) return "";
	let arr = name.split("|");
	return arr ? arr[0] : "";
};

const getGoodsNameSec = (name, type = 1) => {
	if (!name) return "";
	if (type == 2) name = t('common.luckyBag');
	let arr = name.split("|");
	return arr && arr[1] ? arr[1] : name;
};
</script>

<template>
	<div id="box-result" :class="{ active: show }">
		<!-- <div class="reuslt-title" v-if="!props.isBattle" ><img src="@/assets/romimg/openbox/result_title.png"></div> -->
		<!-- <div class="reuslt-bat-title" v-if="props.isBattle">
			<img src="@/assets/romimg/battle/detail/win_title.png" />
		</div> -->

		<div
			class="show_main"
			:class="{
				show_main_min_height: goodList.length <= 3,
				show_main_one_good: goodList.length == 1,
			}"
		>
			<!-- <div
				class="ammo-wrap"
				v-show="ammonall > 0"
				:class="{ active: ammunitionShow }"
			>
				<img src="@/assets/romimg/common/danyao.png" alt="" />+{{
					ammonall.toFixed(2)
				}}
			</div> -->

			<div class="close" @click="onClose">
				<span class="icon iconfont">&#xe637;</span>
			</div>

			<div class="show-title" v-if="props.titleData">对战开箱结束</div>
			<div class="title-data" v-if="props.titleData">
				
				{{ props.titleData.name }}&nbsp; {{t('openbox.getRewardContent',{price: props.titleData.price})}}
				<!-- <div class="title-price">
					<Currency size="mini" :currency="props.titleData.price"></Currency>
				</div>
				&nbsp;的奖励 -->
			</div>
			<div class="gradetime-title" v-if="props.gradeTimeTitle">
				{{ props.gradeTimeTitle }}
			</div>
			<div class="show-title" :class="{ goods1: goodList.length == 1 }">
				{{ props.openBoxTitle }}
			</div>

			<!-- <div
				class="title-data"
				v-if="props.openBoxTitle != '' && goodList.length > 1"
			>
				{{ goodList.length }}件饰品已选中{{ selectedGoodsNumber }}件
				<div class="title-price">
					<Currency size="mini" :currency="sellingPrice"></Currency>
				</div>
			</div> -->
			<div
				class="title-data"
				v-if="
					props.openBoxTitle != '' && goodList.length == 1 && !props.titleData
				"
			>
				<div class="title-price" style="margin: auto">
					<Currency size="mini" :currency="sellingPrice"></Currency>
				</div>
			</div>

			<div
				v-if="goodList.length > 1"
				class="prize-box"
				:key="choosekey"
				:class="{
					isTwo:
						goodList.length == 2 ||
						goodList.length == 1 ||
						goodList.length == 3,
				}"
			>
				<div
					class="prize-item"
					:class="{ choice: item.choose }"
					@click="choice(item, index)"
					v-for="(item, index) in goodList"
					:key="index"
				>
					<img class="selected" src="@/assets/romimg/openbox/selected.png" />
					<div class="price"><Currency :currency="item.price"></Currency></div>
					<div
						class="prize-item-back"
						:style="'background-image: url(' + getImageBg2(item) + ');'"
					>
						<div class="prize-item-pic">
							<img :src="item.iconUrl" alt="" />
						</div>
					</div>
					<div class="prize-item-name hide">{{ item.goodsName }}</div>
				</div>
			</div>
			<div v-if="goodList.length == 1" class="prize-box">
				<div class="prize-item-one">
					<div class="bg" :class="[`level-${goodList[0].goodsLevel}`]"></div>
					<!-- 
						:class="[`level-${goodList[0].goodsLevel}`]"
						
						:style="
							'background-image: url(@/assets/romimg/openbox/result_bg_' +
							goodList[0].goodsLevel +
							'.png);'
						" -->
					<!-- <div class="result-title">获得饰品</div> -->
					<div
						class="prize-item-back"
						:style="'background-image: url(' + getImageBg(goodList[0]) + ');'"
					>
						<div class="prize-item-pic">
							<img :src="goodList[0].iconUrl" alt="" />
						</div>
					</div>
					<div class="item-info">
						<p class="item-info1">
							<!-- {{ JSON.stringify(goodsList[0]) }} -->
							{{ getGoodsNamePre(goodList[0].goodsName) }}
						</p>
						<p class="item-info2">
							{{ getGoodsNameSec(goodList[0].goodsName) }}
						</p>
					</div>
				</div>
			</div>
			<div class="result-btns" :class="{ one: goodList.length == 1 }">
				<p @click="onClose">{{t('openbox.putInBag')}}</p>
				<p
					@click="onClickSell"
					v-if="store.state.reserveStatus == 1 && goodList.length > 1"
				>
					{{t('openbox.saleSelected')}}
				</p>
				<p
					@click="onClickSell"
					v-if="store.state.reserveStatus == 1 && goodList.length == 1"
				>
					{{t('openbox.sale')}}
				</p>
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
	//	 background-color: rgba($color: #000000, $alpha: 0.8);
	//	 background-color: #191c34;
	background-color: rgba($color: #000000, $alpha: 0.8);
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	padding-bottom: 100px;
	box-sizing: border-box;
	transition: 0.3s;
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
		&.show_main_min_height {
			height: 750px;
		}
		&.show_main_one_good {
			height: 1000px;
			//	background: url(@/assets/pcimg/openbox/result_bg_1.png) no-repeat center;
		}
		width: 710px;
		height: 1050px;
		// background: url(@/assets/romimg/openbox/box_result_bg.png) no-repeat center;
		// background-size: contain;
		background: #0d0e1c;
		position: relative;
		padding: 10px;
		box-sizing: border-box;
		// display: flex;
		// // justify-content: start;
		// flex-wrap: wrap;
		// align-items: center;

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
			color: #7ae6a6;
			font-weight: bold;
			transform: translateY(60px);
			opacity: 0;
			transition: 0.3s;

			img {
				width: 50px;
				margin-right: 6px;
			}

			&.active {
				transform: translateY(0);
				opacity: 1;
			}
		}

		.close {
			text-align: right;
			margin-right: 20px;
			margin-top: 40px;
			color: #4b4f6d;
			span {
				font-size: 36px;
			}
		}
		.show-title {
			text-align: left;
			margin-top: 20px;
			padding: 0 40px;
			color: #dbdeea;
			font-size: 36px;
			font-style: normal;
			box-sizing: border-box;
			font-weight: 700;
			&.goods1 {
				text-align: center;
			}
		}

		.title-data {
			font-size: 26px;
			text-align: left;
			margin-top: 15px;
			box-sizing: border-box;
			// margin-left: 40px;
			padding: 0 40px;
			display: flex;
			justify-content: start;
			align-items: center;
			color: #dbdeea;

			.title-price {
				height: 40px;
				display: flex;
				justify-content: center;
				align-items: center;
				color: #63bd87;
				font-size: 26px;
				font-weight: bold;
				margin-left: 10px;

				img {
					width: 45px;
					height: 45px;
				}
			}
		}

		.gradetime-title {
			color: #dbdeea;
			text-align: center;
			font-size: 36px;
			font-style: normal;
			font-weight: 400;
			margin-top: 20px;
			// margin-left: 40px;
			text-transform: capitalize;
			font-weight: 700;
		}
		.prize-box {
			width: 710px;
			height: 600px;
			//	 margin: 34px auto 0;
			margin-top: 30px;
			display: flex;
			align-items: center;
			justify-content: start;
			flex-wrap: wrap;
			box-sizing: border-box;
			overflow-y: scroll;
			&.isTwo {
				justify-content: center;
				height: 300px;
			}

			.prize-item {
				width: 230px;
				height: 290px;
				// margin: 0px 10px;
				background-color: #15172b;
				position: relative;
				box-sizing: border-box;
				.selected {
					display: none;
				}
				&.choice {
					box-sizing: border-box;
					border: 1px solid #2d2d67;
					.selected {
						display: block;
						position: absolute;
						top: 0;
						left: 0;
						width: 24px;
						height: 24px;
					}
				}

				.price {
					margin-top: 20px;
					height: 30px;
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 24px;
					font-weight: bold;
					color: #7bdca2;
					font-style: normal;
				}

				.prize-item-back {
					width: 168px;
					height: 168px;
					//	 margin: 18px auto;
					background-repeat: no-repeat;
					background-position: center;
					background-size: 100%;
					// display: flex;
					// justify-content: center;
					// align-items: center;
					margin: auto;

					.prize-item-pic {
						width: 100%;
						height: 100%;
						display: flex;
						justify-content: center;
						align-items: center;

						img {
							width: 100px;
							height: 100px;
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
			.bg {
				position: absolute;
				top: 10px;
				left: -16px;
				animation: ani-rotate 30s linear infinite;
				width: 480px;
				height: 400px;
				// width: 990px;
				// height: 966px;
				// background: url(@/assets/romimg/openbox/result_bg_1.png) no-repeat
				//	 center;
				background-size: 507px 483px;
				// background: url(@/assets/romimg/openbox/result_bg_5.png) no-repeat
				//	 center;
				&.level-1 {
					background: url(@/assets/romimg/openbox/result_bg_1.png) no-repeat
						center;

					background-size: 507px 483px;
				}
				&.level-2 {
					background: url(@/assets/romimg/openbox/result_bg_2.png) no-repeat
						center;
					background-size: 507px 483px;
				}

				&.level-3 {
					background: url(@/assets/romimg/openbox/result_bg_3.png) no-repeat
						center;
					background-size: 507px 483px;
				}

				&.level-4 {
					background: url(@/assets/romimg/openbox/result_bg_4.png) no-repeat
						center;
					background-size: 507px 483px;
				}

				&.level-5 {
					background: url(@/assets/romimg/openbox/result_bg_5.png) no-repeat
						center;
					background-size: 507px 483px;
				}

				&.level-6 {
					background: url(@/assets/romimg/openbox/result_bg_6.png) no-repeat
						center;
					background-size: 507px 483px;
				}

				&.level-7 {
					background: url(@/assets/romimg/openbox/result_bg_7.png) no-repeat
						center;
					background-size: 507px 483px;
				}
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

			// .prize-item-back {
			//	 width: 360px;
			//	 height: 360px;
			//	 margin: 56px auto 0;
			//	 background-repeat: no-repeat;
			//	 background-position: center;
			//	 background-size: cover;
			//	 position: relative;

			//	 .prize-item-pic {
			//		 width: 360px;
			//		 height: 360px;
			//		 display: flex;
			//		 justify-content: center;
			//		 align-items: center;
			//		 transform: scale(0);

			//		 img {
			//			 max-width: 350px;
			//			 max-height: 262px;
			//		 }
			//	 }
			// }

			.item-info {
				display: flex;
				align-items: center;
				flex-direction: column;

				margin: auto;
				margin-top: 3px;
				// position: relative;
				width: 420px;

				.item-info1 {
					color: #eff0f5;
					text-align: center;
					font-size: 24px;
					font-style: normal;
					font-weight: 500;
					line-height: 21.6px;
				}

				.item-info2 {
					color: #eff0f5;
					text-align: center;
					font-size: 24px;
					margin-top: 20px;
					font-style: normal;
					// font-weight: 700;
				}
			}
			.prize-item-one {
				position: absolute;
				top: -150px;
				left: 140px;
				width: 300px;
				height: 290px;
				// margin: 0px 10px;
				background-color: transparent;
				position: relative;
				box-sizing: border-box;

				.prize-item-back {
					width: 450px;
					height: 450px;
					//	 margin: 18px auto;
					background-repeat: no-repeat;
					background-position: center;
					background-size: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					margin: auto;
					background-color: transparent;

					.prize-item-pic {
						width: 302px;
						height: 482px;
						display: flex;
						justify-content: center;
						align-items: center;
						transform: scale(1);
						transition: all 2s ease-out;
						img {
							max-width: 100%;
							max-height: 100%;
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
			margin-top: 68px;
			&.one {
				margin-top: 0px;
			}

			p:first-child {
				width: 325px;
				height: 108px;
				// background: url(@/assets/romimg/openbox/btn_result.png) no-repeat center;
				// background-size: contain;
				font-size: 26px;
				color: #cfcee8;
				font-weight: bold;
				text-align: center;
				line-height: 108px;
				margin-right: 30px;
				border-radius: 8px;
				background: #3a34b0;
			}
			p:last-child {
				width: 325px;
				height: 108px;
				// background: url(@/assets/romimg/openbox/btn_result.png) no-repeat center;
				// background-size: contain;
				font-size: 26px;
				color: #cfcee8;
				font-weight: bold;
				text-align: center;
				line-height: 108px;
				border-radius: 8px;
				background: #8e61f3;
			}
		}

		&.five {
			width: 681x;
			height: 921px;
			//	 background: url(@/assets/romimg/openbox/box_result_bg2.png) no-repeat
			//		 center;
			//	 background-size: contain;

			.ammo-wrap {
				top: 110px;
			}

			.prize-box {
				height: 600px;
				margin-top: 90px;
				flex-wrap: wrap;

				// .prize-item {
				// 	//	 margin: 25px 10px;
				// }
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
			//	 background: url(@/assets/romimg/openbox/box_result_bg2.png) no-repeat
			//		 center;
			//	 background-size: contain;

			.ammo-wrap {
				top: 104px;
			}

			.prize-box {
				height: 600px;
				margin-top: 90px;
				flex-wrap: wrap;

				// .prize-item {
				// 	//	 margin: 0 40px;
				// }
			}

			.result-btns {
				margin-top: 40px;
			}
			.show-title {
				margin-top: 10px;
			}
		}
	}
}
</style>
