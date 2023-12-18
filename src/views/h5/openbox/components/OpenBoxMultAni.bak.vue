<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

import { ref, watch, nextTick, onMounted } from 'vue';
import audioprocess from '@/assets/audio/process.mp3'
import { playAudio} from '@/util/common';
import {GoodImageBgType} from '@/util/util'
import { useStore } from 'vuex';

const store = useStore();

const props = defineProps(['goodsList']);
const emit = defineEmits(['onAnimationEnd', 'onRandEnd']);
defineExpose({ randGoodList, showAward });

const isActive = ref(false);
const animationxRef = ref(null);

const translateX = ref(0);
const volutionList = ref([]);
const activeTransition = ref(false);

const animationBoxRef = ref([]);
let processAudio = new Audio(audioprocess);//过程声音
let soundStyleArr = [							//10个不同过渡
	'animationy_box soundone',
	'animationy_box soundtwo',
	'animationy_box soundthree',
	'animationy_box soundfour',
	'animationy_box soundfive',
	'animationy_box soundsix',
	'animationy_box soundseven',
	'animationy_box soundeight',
	'animationy_box soundnine',
	'animationy_box soundten'
]

let transitionendCount = 0;

async function showAward(awardList) {
	await nextTick()
	for (let k = 0; k < awardList.length; k++) {
		volutionList.value[k][0] = awardList[k]
		animationBoxRef.value.children[k].className = soundStyleArr[Math.floor(Math.random() * (9 - 0 + 1) + 0)]
	}
	isActive.value = true;
	// processAudio.play();
	playAudio(processAudio);
}


function randGoodList(num) {
	volutionList.value = []
	let expect = 34 - props.goodsList.length
	let concat_num = 0;
	if (expect >= 0) {
		concat_num = (Math.floor(expect / props.goodsList.length) + 2)
	} else {
		concat_num = 1
	}


	for (let k = 0; k < num; k++) {
		let volArray = []
		for (let i = 0; i < concat_num; i++) {
			volArray = volArray.concat(props.goodsList)
		}
		//打乱
		function randSort(volArray) {
			for (let i = 0, len = volArray.length; i < len; i++) {
				let rand = parseInt(Math.random() * len)
				let temp = volArray[rand]

				volArray[rand] = volArray[i]
				volArray[i] = temp
			}
			return volArray
		}
		//插入
		nextTick(() => {
			volutionList.value.push(randSort(volArray))
			if (volutionList.value.length == num) {
				emit('onRandEnd')
			}
		})

	}
}

function onTransitionend() {
	transitionendCount++;
	if (transitionendCount == animationBoxRef.value.children.length) {
		setTimeout(() => {
			onAllEnd()
		}, 500)
	}
}

function onAllEnd() {
	isActive.value = false
	emit('onAnimationEnd')
	setTimeout(() => {
		for (let k = 0; k < animationBoxRef.value.children.length; k++) {
			animationBoxRef.value.children[k].className = 'animationy_box initial'
		}
		transitionendCount =0
	}, 200)
}

function getImageBg(item){
		return store.getters.getGoodsBgImage(GoodImageBgType.boxResult,item.goodsLevel);
}
</script>
				
<template>
	<div id="animationy" ref="animationy" :class="{ 'active': isActive } " @touchmove.prevent>
		<div class="animationy_back">
			<div class="animationy_main" ref="animationBoxRef" v-if="volutionList.length > 0">
				<div class="animationy_box initial" v-for="(item, index) in volutionList" :key="index"
					@transitionend="onTransitionend">
					<div class="animationy_item" v-for="(item, index) in volutionList[index]" :style="'background-image: url(' + getImageBg(item) + ');'"
						:key="index">
						<img :src="item.iconUrl" alt="">
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
				
<style lang="scss">
#animationy {
	position: fixed;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
	z-index: -1;
	background-color: rgba($color: #000000, $alpha: .8);
	opacity: 0;
	transition: .3s;
	display: flex;
	justify-content: center;
	align-items: center;
	padding-bottom: 100px;
	box-sizing: border-box;

	&.active {
		z-index: 1000;
		opacity: 1;
	}

	.animationy_back {
		width: 725px;
				height: 220px;
		background: url(@/assets/romimg/openbox/boxani_bg.png) no-repeat center;
		background-size: contain;
		position: relative;
		box-sizing: border-box;

		&::after {
			display: block;
			content: '';
			width: 746px;
			height: 30px;
			background: url(@/assets/romimg/openbox/heng_line.png) no-repeat center;
			background-size: contain;
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translateX(-50%) translateY(-50%);

		}

		.animationy_main {
			width: 700px;
						height: 140px;
						margin: 50px auto 0px;
			box-sizing: border-box;
			overflow: hidden;
			display: flex;

			.animationy_box {
				flex: 1;

				&.soundone {
					transition: 9s cubic-bezier(0.2, 0.29, 0.15, .91);
					transform: translateY(0);
				}

				&.soundtwo {
					transition: 9s cubic-bezier(0.2, 0.3, 0.14, .92);
					transform: translateY(0);
				}

				&.soundthree {
					transition: 9s cubic-bezier(0.2, 0.31, 0.15, 1);
					transform: translateY(0);
				}

				&.soundfour {
					transition: 9s cubic-bezier(0.2, 0.32, 0.14, .89);
					transform: translateY(0);
				}

				&.soundfive {
					transition: 9s cubic-bezier(0.2, 0.33, 0.15, .9);
					transform: translateY(0);
				}

				&.soundsix {
					transition: 9s cubic-bezier(0.2, 0.32, 0.14, .98);
					transform: translateY(0);
				}

				&.soundseven {
					transition: 9s cubic-bezier(0.2, 0.31, 0.15, .95);
					transform: translateY(0);
				}

				&.soundeight {
					transition: 9s cubic-bezier(0.2, 0.3, 0.14, .96);
					transform: translateY(0);
				}

				&.soundnine {
					transition: 9s cubic-bezier(0.2, 0.29, 0.14, .92);
					transform: translateY(0);
				}

				&.soundten {
					transition: 9s cubic-bezier(0.2, 0.3, 0.15, .97);
					transform: translateY(0);
				}

				&.initial {
					transform: translateY(-4620px);
					transition: none;
				}

				.animationy_item {
					width: 100%;
					height: 140px;
					background-size: 100% 100%;
					background-repeat: no-repeat;
					background-position: center;
					position: relative;

					img {
						max-width: 80%;
						max-height: 80%;
						position: absolute;
						left: 0;
						right: 0;
						top: 0;
						bottom: 0;
						margin: auto;
					}
				}
			}
		}
	}
}
</style>