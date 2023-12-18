<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import audioprocess from '@/assets/audio/process.mp3'
import { playAudio, stopAudio } from '@/util/common';
import { GoodImageBgType } from '@/util/util'
import { useStore } from 'vuex';
import { getGoodsNamePre, getGoodsNameSec } from '@/util/common';

const store = useStore();

const props = defineProps(['goodsList']);
const emit = defineEmits(['onAnimationEnd', 'onRandEnd']);
defineExpose({ randGoodList, showAward });

const isActive = ref(false);

const translateX = ref(0);
const volutionList = ref([]);

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

onUnmounted( () => {
	stopAudio( processAudio )
} )

let transitionendCount = 0;

async function showAward(awardList) {
	// resetData()

	await nextTick()
	for (let k = 0; k < awardList.length; k++) {
		volutionList.value[k][32] = awardList[k]
		animationBoxRef.value.children[k].children[0].className = soundStyleArr[Math.floor(Math.random() * (9 - 0 + 1) + 0)]
	}

	let clientWidth = animationBoxRef.value.children[0].children[0].clientWidth
		let item_Width = clientWidth / volutionList.value[0].length
		let min = item_Width / 10
		let max = item_Width - item_Width / 10
		translateX.value = item_Width * 32 -	animationBoxRef.value.clientWidth /2	+ parseInt(Math.random() * (max - min + 1) + min, 10)
	isActive.value = true;
	if (store.state.openboxSoundSwitch) {
		playAudio(processAudio);
	}
}

function resetData() {
	if (animationBoxRef.value) {
		for (let k = 0; k < animationBoxRef.value.children.length; k++) {
			animationBoxRef.value.children[k].children[0].className = 'animationy_box initial'
		}
	}
	transitionendCount = 0
	translateX.value=0;
	window.$dev && console.log('resetData');
}


function randGoodList(num, end = true) {
	resetData()

	volutionList.value = []
	let expect = 45 - props.goodsList.length
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
			if (volutionList.value.length == num&&end) {
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
	// isActive.value = false
	emit('onAnimationEnd')
	// setTimeout(() => {
	// 	for (let k = 0; k < animationBoxRef.value.children.length; k++) {
	// 		animationBoxRef.value.children[k].className = 'animationy_box initial'
	// 	}
	// 	transitionendCount =0
	// }, 200)
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.replace, item.goodsLevel);
}
</script>
				
<template>
	<div id="pc-animationy" ref="animationy" :class="{ 'active': isActive }">
		<div class="animationy_back">
			<div class="animationx-bg"><img src="@/assets/pcimg/openbox/roulette_bg.png" alt="" /></div>
			<div class="animationy_main" :class="`gap-${volutionList.length}`" ref="animationBoxRef">
					<!-- :class="{ three: volutionList.length > 1 }"> -->
				<div class="animation-mult-wrap" v-for="(item, index) in volutionList" :key="index"
					:class="`col-${volutionList.length}`">
					<div class="animationy_box initial" @transitionend="onTransitionend"	:style="'transform: translateX(-' + translateX + 'px)'">
						<div class="animationy_item" v-for="(item, index) in volutionList[index]" :key="index">
							<div class="item-pic" :style="'background-image: url(' + getImageBg(item) + ');'">
								<img :src="item.iconUrl" alt="">
							</div>
							<div class="item-info">
								<p class="item-info1 ">{{ getGoodsNamePre(item.goodsName) }}</p>
								<p class="item-info2 hide">{{ getGoodsNameSec(item.goodsName) }}</p>
							</div>
						</div>
					</div>
					<div class="line1"><img src="@/assets/pcimg/openbox/line1.png" alt="" /></div>
					<div class="line2"><img src="@/assets/pcimg/openbox/line2.png" alt="" /></div>
					<div class="left-mask"></div>
					<div class="right-mask"></div>
				</div>
			</div>
		</div>
	</div>
</template>
				
<style lang="scss">
#pc-animationy {
	z-index: -1;
	background-color: #0D0E1C;
	width: 100%;
	opacity: 0;
	transition: .1s;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	margin-bottom: 30px;


	&.active {
		z-index: 3;
		opacity: 1;
	}

	.animationy_back {
		width: 1410px;
		min-height: 584px;
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
				width: 886px;
				height: 584px;
			}
		}

		.animationy_main {
			width: 1410px;
			margin: 170px auto 0px;
			box-sizing: border-box;
			overflow: hidden;
			display: flex;
			flex-direction: column;

			&.gap-1
			{
				gap: 0;
			}

			&.gap-2
			{
				gap: 15px;
			}
		
			&.gap-3,
			&.gap-4
			{
				gap: 5px;
			}

			&.gap-5
			{
				gap: 2px;
			}
			// gap: 15px;

			.animation-mult-wrap {
				width: 1410px;
				position: relative;
				// height: 320px;
				box-sizing: border-box;
				margin-bottom: 2px;
				display: flex;

				&.col-1,
				&.col-2
				{ 
					height: 320px;

					.left-mask,
					.right-mask
					{
						width: 250px;
					}

					.animationy_box
					{
						.animationy_item
						{
							width: 250px;

							.item-pic
							{
								margin-top: 50px;
							}

							.item-info
							{
								bottom: 60px;
							}
						}
					}
				}

				&.col-3 
				{
					height: 200px;
					
					.left-mask,
					.right-mask
					{
						width: 200px;
					}

					.left-mask
					{
						background: url( @/assets/pcimg/openbox/left-mark-3.png ) no-repeat;
						background-size: cover;
						background-position: left bottom;
					}

					.right-mask
					{
						background: url( @/assets/pcimg/openbox/right-mark-3.png ) no-repeat;
						background-size: cover;
						background-position: left bottom;
					}

					.animationy_box
					{
						.animationy_item
						{
							width: 200px;

							.item-pic
							{
								margin-top: 14px;
								width: 70%;
								height: 70%;
							}

							.item-info
							{
								bottom: 20px;
							}
						}
					}
				}

				&.col-4
				{
					height: 152px;

					
					.left-mask,
					.right-mask
					{
						width: 200px;
					}

					.left-mask
					{
						background: url( @/assets/pcimg/openbox/left-mark-4.png ) no-repeat;
						background-size: cover;
						background-position: left bottom;
					}

					.right-mask
					{
						background: url( @/assets/pcimg/openbox/right-mark-4.png ) no-repeat;
						background-size: cover;
						background-position: left bottom;
					}

					.animationy_box
					{
						.animationy_item
						{
							width: 180px;

							.item-pic
							{
								margin-top: 12px;
								width: 60%;
								height: 60%;
							}

							.item-info
							{
								bottom: 14px;
							}
						}
					}
				}

				&.col-5
				{
					height: 125px;
					
					.left-mask,
					.right-mask
					{
						width: 200px;
					}

					.left-mask
					{
						background: url( @/assets/pcimg/openbox/left-mark-5.png ) no-repeat;
						background-size: cover;
						background-position: left bottom;
					}

					.right-mask
					{
						background: url( @/assets/pcimg/openbox/right-mark-5.png ) no-repeat;
						background-size: cover;
						background-position: left bottom;
					}

					.animationy_box
					{
						.animationy_item
						{
							width: 160px;

							.item-pic
							{
								margin-top: 10px;
								width: 50%;
								height: 50%;
							}

							.item-info
							{
								bottom: 10px;
								.item-info1,
								.item-info2
								{
									font-size: 12px;
								}
							}
						}
					}
				}
				// background: url( @/assets/pcimg/openbox/one-ani-bg.png ) no-repeat;

				.line1 {
					display: flex;
					width: 12px;
					height: 11px;
					position: absolute;
					left: 50%;
					transform: translateX(-50%);
					top: -1px;

					img {
						width: 12px;
						height: 11px;
					}
				}

				.line2 {
					display: flex;
					position: absolute;
					left: 50%;
					transform: translateX(-50%);
					bottom: 0px;
					box-sizing: border-box;
					height: 11px;

					img {
						width: 394px;
						height: 11px;
					}
				}

				.left-mask {
					position: absolute;
					left: 0;
					top: 0;
					width: 200px;
					height: 100%;
					background: url( @/assets/pcimg/openbox/left-mark.png ) no-repeat;
					background-size: cover;
					background-position: left center;
					// background: linear-gradient(90deg, #141627 0%, rgba(20, 22, 39, 0.90) 50%, rgba(20, 22, 39, 0.00) 100%);
				}

				.right-mask {
					position: absolute;
					right: 0;
					top: 0;
					width: 200px;
					height: 100%;
					background: url( @/assets/pcimg/openbox/right-mark.png ) no-repeat;
					background-size: cover;
					background-position: right center;
					// background: linear-gradient(270deg, #141627 0%, rgba(20, 22, 39, 0.90) 50%, rgba(20, 22, 39, 0.00) 100%);
				}

				.animationy_box {
					white-space: nowrap;
					transition: none;
					display: flex;
					// height: 320px;
					height: 100%;


					&.soundone {
						transition: 9s cubic-bezier(0.2, 0.29, 0.15, .91);
					}

					&.soundtwo {
						transition: 9s cubic-bezier(0.2, 0.3, 0.14, .92);
					}

					&.soundthree {
						transition: 9s cubic-bezier(0.2, 0.31, 0.15, 1);
					}

					&.soundfour {
						transition: 9s cubic-bezier(0.2, 0.32, 0.14, .89);
					}

					&.soundfive {
						transition: 9s cubic-bezier(0.2, 0.33, 0.15, .9);
					}

					&.soundsix {
						transition: 9s cubic-bezier(0.2, 0.32, 0.14, .98);
					}

					&.soundseven {
						transition: 9s cubic-bezier(0.2, 0.31, 0.15, .95);
					}

					&.soundeight {
						transition: 9s cubic-bezier(0.2, 0.3, 0.14, .96);
					}

					&.soundnine {
						transition: 9s cubic-bezier(0.2, 0.29, 0.14, .92);
					}

					&.soundten {
						transition: 9s cubic-bezier(0.2, 0.3, 0.15, .97);
					}

					&.initial {
						transform: translateX(0px);
						transition: none;
					}

					.animationy_item {
						// width: 250px;
						// height: 320px;
						width: 100%;
						height: 100%;
						background-repeat: no-repeat;
						background-size: contain;
						display: inline-block;
						position: relative;
						background: #141627;

						.item-pic {
							display: flex;
							justify-content: center;
							align-items: center;
							// width: 200px;
							// height: 200px;
							margin: 30px auto 0;
							background-repeat: no-repeat;
							background-size: contain;
							background-position: center;

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
								color: #CBCCD6;
								text-align: center;
								font-size: 14px;
								font-weight: 700;
								line-height: 19.6px;
							}

							.item-info2 {
								color: #CBCCD6;
								text-align: center;
								font-size: 14px;
								font-style: normal;
								font-weight: 400;
								line-height: 19.6px;
							}
						}

						&:nth-child(2n) {
							background: #131425;
						}
					}
				}

				// &.three {
				// 	height: 125px;

				// 	.animationy_box {
				// 		height: 125px;

				// 		.animationy_item {
				// 			width: 160px;
				// 			height: 125px;

				// 			.item-pic {
				// 				width: 76px;
				// 				height: 76px;
				// 				margin: 20px auto 0;

				// 				img {
				// 					max-width: 100%;
				// 					max-height: 100%;
				// 				}
				// 			}

				// 			.item-info {
				// 				flex-direction: row;
				// 				bottom: 10px;

				// 				.item-info1 {
				// 					font-size: 12px;

				// 				}

				// 				.item-info2 {
				// 					font-size: 14px;
				// 					margin-left: 5px;
				// 					width: 60px;
				// 				}
				// 			}
				// 		}
				// 	}
				// }
			}


		}
	}
}
</style>