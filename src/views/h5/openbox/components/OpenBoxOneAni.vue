<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, watch, nextTick, onMounted } from "vue";
import { playAudio } from "@/util/common";
import audioProcess from "@/assets/audio/process.mp3";
import { GoodImageBgType } from "@/util/util";
import { useStore } from "vuex";
import { Dialog } from "vant";
import { getGoodsNamePre, getGoodsNameSec } from "@/util/common";

const store = useStore();

const props = defineProps(["goodsList"]);
const emit = defineEmits(["onAnimationEnd"]);

const isActive = ref(false);
const animationxRef = ref(null);

const translateX = ref(0);
const volutionList = ref([]);
const activeTransition = ref(false);

const animationBoxRef = ref(null);
let processAudio = new Audio(audioProcess); //过程声音

async function showAward(value) {
	volutionList.value[32] = value;
	await nextTick();
	activeTransition.value = true;
	let clientWidth = animationBoxRef.value.clientWidth;
	let item_Width = clientWidth / volutionList.value.length;
	let min = item_Width / 10;
	let max = item_Width - item_Width / 10;
	translateX.value =
		item_Width * 32 - item_Width * 2 - parseInt(Math.random() * (max - min)); //+		parseInt(Math.random() * (max - min + 1) + min, 10);

	isActive.value = true;

	if (store.state.openboxSoundSwitch) {
		playAudio(processAudio);
	}

	// window.addEventListener("resize", orientationChange);
	// window.addEventListener("orientationchange", orientationChange);
}

function orientationChange() {
	// isActive.value = false
	// activeTransition.value = false
	// translateX.value = 0
	// window.removeEventListener("resize", orientationChange);
	// window.removeEventListener("orientationchange", orientationChange);
	Dialog.confirm({
		message: t( 'common.rotateTip' ),
		showCancelButton: false,
	}).then(() => {
		emit("onAnimationEnd");
	});
}

function randGoodList() {
	volutionList.value = [];
	let expect = 34 - props.goodsList.length;
	let num = 0;
	if (expect >= 0) {
		num = Math.floor(expect / props.goodsList.length) + 2;
	} else {
		num = 1;
	}

	let volArray = [];
	for (let i = 0; i < num; i++) {
		volArray = volArray.concat(props.goodsList);
	}

	function randSort(volArray) {
		for (let i = 0, len = volArray.length; i < len; i++) {
			let rand = parseInt(Math.random() * len);
			let temp = volArray[rand];
			volArray[rand] = volArray[i];
			volArray[i] = temp;
		}
		return volArray;
	}
	volutionList.value = randSort(volArray);
	activeTransition.value = false;
	translateX.value = 0;
}

function onTransitionend() {
	// isActive.value = false
	emit("onAnimationEnd");
	// window.removeEventListener("resize", orientationChange);
	// window.removeEventListener("orientationchange", orientationChange);
	// setTimeout(() => {
	//		 activeTransition.value = false
	//		 translateX.value = 0
	// }, 300)
}

onMounted(() => {});

defineExpose({ randGoodList, showAward });

function getImageBg(item) {
	return store.getters.getGoodsBgImage(
		GoodImageBgType.replace,
		item.goodsLevel
	);
}
</script>

<template>
	<div
		id="h5-single-animation"
		ref="animationxRef"
		:class="{ active: isActive }"
		@touchmove.prevent
	>
		<div class="animationx_back">
			<div class="animationx-bg">
				<img src="@/assets/pcimg/openbox/roulette_bg.png" alt="" />
			</div>
			<div class="animationx_main">
				<div
					class="animationx_box"
					ref="animationBoxRef"
					:class="{ transition: activeTransition }"
					:style="'transform: translateX(-' + translateX + 'px)'"
					@transitionend="onTransitionend"
				>
					<div
						class="animationx_item"
						v-for="(item, index) in volutionList"
						:key="index"
					>
						<div
							class="item-pic"
							:style="'background-image: url(' + getImageBg(item) + ');'"
						>
							<img :src="item.iconUrl" alt="" />
						</div>
						<div class="item-info">
							<p class="item-info1">{{ getGoodsNamePre(item.goodsName) }}</p>
							<p class="item-info2">{{ getGoodsNameSec(item.goodsName) }}</p>
						</div>
					</div>
				</div>
				<div class="line1">
					<img src="@/assets/pcimg/openbox/line1.png" alt="" />
				</div>
				<div class="left-mask"></div>
				<div class="right-mask"></div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#h5-single-animation {
	z-index: -1;
	background-color: #0d0e1c;
	width: 100%;
	opacity: 0;
	transition: 0.1s;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	position: fixed;
	top: 200px;
	&.active {
		z-index: 3;
		opacity: 1;
	}

	.animationx_back {
		width: 1410px;
		height: 584px;
		position: relative;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 20px;

		.animationx-bg {
			position: absolute;
			top: 0;
			left: 50%;
			transform: translateX(-50%);

			img {
				width: 100%;
				height: 100%;
			}
		}

		.animationx_main {
			width: 1410px;
			height: 320px;
			margin: 40px auto 0px;
			box-sizing: border-box;
			overflow: hidden;
			position: relative;

			.line1 {
				display: block;
				width: 12px;
				height: 11px;
				position: absolute;
				left: 50%;
				transform: translateX(-50%);
				top: -2px;

				img {
					width: 12px;
					height: 11px;
				}
			}

			.left-mask {
				position: absolute;
				left: 0;
				top: 0;
				width: 200px;
				height: 100%;
				background: linear-gradient(
					90deg,
					#141627 0%,
					rgba(20, 22, 39, 0.9) 50%,
					rgba(20, 22, 39, 0) 100%
				);
			}

			.right-mask {
				position: absolute;
				right: 0;
				top: 0;
				width: 200px;
				height: 100%;
				background: linear-gradient(
					270deg,
					#141627 0%,
					rgba(20, 22, 39, 0.9) 50%,
					rgba(20, 22, 39, 0) 100%
				);
			}

			&::after {
				display: block;
				content: "";
				width: 394px;
				height: 11px;
				background: url(@/assets/pcimg/openbox/line2.png) no-repeat center;
				background-size: contain;
				position: absolute;
				left: 50%;
				transform: translateX(-50%);
				bottom: 0px;
			}

			.animationx_box {
				white-space: nowrap;
				transition: none;
				display: inline-block;

				.animationx_item {
					width: 250px;
					height: 320px;
					background-repeat: no-repeat;
					background-size: contain;
					display: inline-block;
					position: relative;
					background: #141627;

					.item-pic {
						display: flex;
						justify-content: center;
						align-items: center;
						background-size: 100%;
						width: 200px;
						height: 200px;
						margin: 30px auto 0;

						img {
							max-width: 80%;
							max-height: 80%;
						}
					}

					.item-info {
						display: flex;
						align-items: center;
						flex-direction: column;
						position: absolute;
						bottom: 40px;
						left: 50%;
						transform: translateX(-50%);

						.item-info1 {
							color: #cbccd6;
							text-align: center;
							font-size: 24px;
							font-weight: 700;
							line-height: 30px;
						}

						.item-info2 {
							color: #cbccd6;
							text-align: center;
							font-size: 24px;
							font-style: normal;
							font-weight: 400;
							line-height: 30px;
						}
					}

					&:nth-child(2n) {
						background: #131425;
					}
				}

				&.transition {
					transition: 9s cubic-bezier(0.1, 0.3, 0.15, 1);
				}
			}
		}
	}
}
</style>
