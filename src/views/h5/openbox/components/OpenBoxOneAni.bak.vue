<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, watch, nextTick, onMounted } from "vue";
import { playAudio } from "@/util/common";
import audioProcess from "@/assets/audio/process.mp3";
import { GoodImageBgType } from "@/util/util";
import { useStore } from "vuex";
import { Dialog } from "vant";

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
		item_Width * 32 -
		item_Width * 2 -
		item_Width / 2 +
		parseInt(Math.random() * (max - min + 1) + min, 10);

	isActive.value = true;
	// processAudio.play();
	playAudio(processAudio);

	window.addEventListener("orientationchange", orientationChange);
}

function orientationChange() {
	isActive.value = false;
	activeTransition.value = false;
	translateX.value = 0;
	window.removeEventListener("orientationchange", orientationChange);
	Dialog.confirm({
		message: t( 'common.rotateTip' ),
		showCancelButton: false,
	}).then(() => {
		emit("onAnimationEnd");
	});
}

function prohibit() {
	animationxRef.addEventListener("touchmove", function (event) {
		event.preventDefault();
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
}

function onTransitionend() {
	isActive.value = false;
	emit("onAnimationEnd");
	window.removeEventListener("orientationchange", orientationChange);
	setTimeout(() => {
		activeTransition.value = false;
		translateX.value = 0;
	}, 300);
}

onMounted(() => {});

defineExpose({ randGoodList, showAward });

function getImageBg(item) {
	return store.getters.getGoodsBgImage(
		GoodImageBgType.boxResult,
		item.goodsLevel
	);
}
</script>

<template>
	<div
		id="single-animation"
		ref="animationxRef"
		:class="{ active: isActive }"
		@touchmove.prevent
	>
		<div class="animationx_back">
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
						:style="'background-image: url(' + getImageBg(item) + ');'"
						v-for="(item, index) in volutionList"
						:key="index"
					>
						<img :src="item.iconUrl" alt="" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#single-animation {
	position: fixed;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
	z-index: -1;
	background-color: rgba($color: #000000, $alpha: 0.8);
	opacity: 0;
	transition: 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;
	padding-bottom: 100px;
	box-sizing: border-box;

	&.active {
		z-index: 1000;
		opacity: 1;
	}

	.animationx_back {
		width: 725px;
		height: 220px;
		background: url(@/assets/romimg/openbox/boxani_bg.png) no-repeat center;
		background-size: contain;
		position: relative;
		// padding: 0 25px;
		box-sizing: border-box;

		&::after {
			display: block;
			content: "";
			width: 52px;
			height: 182px;
			background: url(@/assets/romimg/openbox/shu_line.png) no-repeat center;
			background-size: contain;
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			top: 28px;
		}

		.animationx_main {
			width: 700px;
			height: 140px;
			margin: 50px auto 0px;
			box-sizing: border-box;
			overflow: hidden;

			.animationx_box {
				white-space: nowrap;
				transition: none;
				display: inline-block;

				.animationx_item {
					width: 140px;
					height: 140px;
					background-repeat: no-repeat;
					background-size: contain;
					display: inline-block;
					position: relative;

					img {
						position: absolute;
						left: 0;
						right: 0;
						top: 0;
						bottom: 0;
						margin: auto;
						max-width: 80%;
						max-height: 80%;
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
