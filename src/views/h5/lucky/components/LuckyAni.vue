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
	translateX.value = item_Width * 32 - item_Width * 2 - item_Width / 2;

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
</script>

<template>
	<div
		id="h5-lucky-animation"
		ref="animationxRef"
		:class="{ active: isActive }"
	>
		<div class="animationx_back">
			<div class="animationx-bg">
				<img src="@/assets/romimg/lucky/bottom_bg.png" alt="" />
			</div>
			<div class="load-wrap">
				打开<img src="@/assets/pcimg/openbox/loader.png" alt="" />
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
						<div class="item-pic">
							<img :src="item.iconUrl" alt="" />
						</div>
					</div>
				</div>
				<div class="left-mask"></div>
				<div class="right-mask"></div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#h5-lucky-animation {
	z-index: -1;
	background-color: #0d0e1c;
	width: 100%;
	opacity: 0;
	transition: 0.1s;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;

	margin: 600px 0;
	position: absolute;
	overflow: hidden;

	&.active {
		z-index: 3;
		opacity: 1;
	}

	.animationx_back {
		max-width: 1410px;
		width: 100%;
		height: 325px;
		position: relative;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		flex-direction: column;
		background-image: url(@/assets/romimg/lucky/xy-arrow.png);
		background-size: 644px 56px;
		background-repeat: no-repeat;
		background-position: bottom center;

		.load-wrap {
			display: flex;
			align-items: center;
			font-size: 17px;
			font-weight: bold;
			color: #a6a4b5;
			position: relative;
			margin-top: 30px;

			img {
				width: 36px;
				height: 36px;
				animation: ani-rotate 2s linear infinite;
				margin-left: 16px;
			}
		}

		.animationx-bg {
			position: absolute;
			z-index: 0;
			bottom: 0;
			left: 50%;
			width: 750px;
			height: 578px;
			transform: translateX(-50%);
			box-sizing: border-box;
			display: flex;

			img {
				width: 750px;
				height: 578px;
			}
		}

		.animationx_main {
			max-width: 1410px;
			width: 100%;
			margin: 50px auto 0;
			box-sizing: border-box;
			overflow: hidden;
			position: relative;

			.left-mask {
				position: absolute;
				left: 0;
				top: 0;
				width: 200px;
				height: 100%;
				background: linear-gradient(
					90deg,
					#0d0e1d 0%,
					rgba(13, 14, 29, 0) 100%
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
					#0d0e1d 0%,
					rgba(13, 14, 29, 0) 100%
				);
			}

			.animationx_box {
				white-space: nowrap;
				transition: none;
				display: inline-block;

				.animationx_item {
					width: 250px;
					height: 150px;
					background-repeat: no-repeat;
					background-size: contain;
					display: inline-block;
					position: relative;
					box-sizing: border-box;
					vertical-align: middle;

					.item-pic {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 200px;
						height: 150px;
						vertical-align: middle;

						img {
							max-width: 90%;
							max-height: 90%;
						}
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
