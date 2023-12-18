<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { playAudio, stopAudio, sleep, random } from '@/util/common';
import audioProcess from '@/assets/audio/process.mp3'
import { GoodImageBgType } from '@/util/util'
import { useStore } from 'vuex';
import { Dialog } from 'vant';
import { getGoodsNamePre, getGoodsNameSec } from '@/util/common';
import { resolve } from 'mathjs';

const store = useStore();

const props = defineProps( [ 'goodsList', 'title', 'subTitle' ] );
const emit = defineEmits(['onAnimationEnd']);

const isActive = ref(false);
const animationxRef = ref(null);

const translateX = ref( [] );
const volutionList = ref([]);
const activeTransition = ref( [] );

let processAudio = new Audio(audioProcess); //过程声音
const itemBoxWidth = ref( 250 )

onUnmounted( () => {
	stopAudio( processAudio )
} )

async function showAward( value, goodsData )
{
	/// 尺寸参考
	switch( props.goodsList.length )
	{
		case 1 :
		case 2 :
			itemBoxWidth.value = 250
		break

		case 3 :
			itemBoxWidth.value = 200
		break

		case 4 :
			itemBoxWidth.value = 180
		break

		case 5 :
			itemBoxWidth.value = 160
		break
	}

	// itemBoxWidth.value = document.getElementsByClassName( 'box-item' )[0].offsetWidth
	let rand = []

	for( let i = 0, j = props.goodsList.length; i < j; i++ )
	{
		rand[i] = random( 32, 60 )

		if( goodsData.items[i].isWin )
			volutionList.value[i][rand[i]] = goodsData.items[i].items[1]
		else
			volutionList.value[i][rand[i]] = value
	}

	await nextTick()

	isActive.value = true;
	// window.$dev && console.log( value, volutionList.value[0][32], goodsData )

	setTimeout( async () => {
		for( let i = 0, j = props.goodsList.length; i < j; i++ )
		{
			activeTransition.value[i] = true
			// let item_Width = 250
			translateX.value[i] = itemBoxWidth.value * ( rand[i] + 1 ) - 1410 / 2 - itemBoxWidth.value / 2
			// await sleep( random( 500 ) )
		}
	}, 100 )

	if (store.state.openboxSoundSwitch) {
		playAudio( processAudio );
	}
}

function orientationChange() {
	Dialog.confirm({
		message: t( 'common.rotateTip' ),
		showCancelButton: false,
	}).then(() => {
		emit('onAnimationEnd')
	})
};

function randGoodList() {
	volutionList.value = []
	let expect = 34 - props.goodsList[0].length
	let num = 0;
	if (expect >= 0) {
		num = Math.floor(expect / props.goodsList[0].length) + 2
	} else {
		num = 1
	}

	function randSort(volArray) {
		for (let i = 0, len = volArray.length; i < len; i++) {
			let rand = parseInt(Math.random() * len)
			let temp = volArray[rand]
			volArray[rand] = volArray[i]
			volArray[i] = temp
		}
		return volArray
	}

	for( let i = 0, j = props.goodsList.length; i < j; i++ )
	{
		let volArray = []
		for (let i = 0; i < num; i++) {
			volArray = volArray.concat( props.goodsList[0] )
		}
		volutionList.value.push( randSort( volArray ) )
		activeTransition.value.push( false )
		translateX.value[i] = 0
	}
}

function onTransitionend( index, length ) {
	if( index + 1 == length )
		emit( 'onAnimationEnd' )
}

onMounted(() => {
})

defineExpose({ randGoodList, showAward });

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.replace, item.goodsLevel);
}
</script>
		
<template>
	<div id="pc-lucky-animation" ref="animationxRef" v-show="isActive" >
		<div class="animation-container" :class="`column-${goodsList.length}`">
			<div class="animation-header">
				<div>{{ title }}</div>
				<div>{{ props.subTitle }}</div>
			</div>
			<div class="animation-body" :class="`column-${goodsList.length}`">
				<div class="animation-items" v-for="( items, index ) in volutionList" :key="index">
					<div
						class="animation-item"
						:class="{ 'transition': activeTransition[index] }"
						:style=" { transform: `translateX( -${translateX[index]}px`, width : `${items.length * itemBoxWidth}px` }"
						@transitionend="onTransitionend( index, goodsList.length )"
					>
						<div class="box-item" v-for="(item, index) in items" :key="index" :style="`background-image: url( ${getImageBg( item )} )`">
							<img :src="item.iconUrl">
						</div>
					</div>
					<div class="left-mask"></div>
			<div class="right-mask"></div>
				</div>
			</div>
			<div class="animation-footer">
				<div class="load-wrap">{{ t( 'redpack.open' ) }} <img src="@/assets/pcimg/openbox/loader.png" alt="" /></div>
			</div>
		</div>
	</div>
</template>
		
<style lang="scss">
#pc-lucky-animation {
	z-index: 200;
	background: rgba( 13, 14, 28, .7 );
	width: 100%;
	transition: .1s;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	position: fixed;
	height: 100%;
	top: 0;

	.animation-container
	{
		display: flex;
		flex-direction: column;
		// border: 1px solid red;

		&.column-2, &.column-3, &.column-4, &.column-5
		{
			background: url( @/assets/pcimg/openbox/roulette_bg.png ) no-repeat;
			background-position: center center;
		}

		.animation-header
		{
			height: 184px;
			display: flex;
			background: url( @/assets/pcimg/openbox/roulette_bg.png ) no-repeat;
			background-position: center top;
			justify-content: flex-end;
			align-items: center;
			flex-direction: column;
			box-sizing: border-box;
			padding-bottom: 26px;

			div
			{
				&:first-child
				{
					font-size: 21px;
					font-weight: 700;
				}

				&:last-child
				{
					font-size: 18px;
					font-weight: 400;
					color: #8B8C97;;
				}
			}
		}

		.animation-body
		{
			display: flex;
			flex-direction: column;
			width: 1410px;
			position: relative;
			overflow: hidden;

			&.column-1
			{
				height: 320px;

				.animation-items
				{
					height: 100%;
					.box-item
					{
						width: 250px;

						img
						{
							width: 128px;
						}
					}
				}
			}

			&.column-2
			{
				height: calc( 320px * 2 + 8px );
				gap: 8px;

				.animation-items
				{
					height: 320px;

					.box-item
					{
						width: 250px;
						img
						{
							width: 128px;
						}
					}
				}
			}

			&.column-3
			{
				height: calc( 200px * 3 + 6px * 2 );
				gap: 6px;

				.animation-items
				{
					height: 200px;
					clip-path: polygon( 
						0 45px, 
						60px 0, 
						calc( 100% - 60px ) 0, 
						100% 45px, 
						100% calc(100% - 45px), 
						calc(100% - 60px) 100%, 
						60px 100%, 
						0 calc( 100% - 45px )
					);

					.box-item
					{
						width: 200px;

						img
						{
							width: 60%;
						}
					}
				}
			}

			&.column-4
			{
				height: calc( 152px * 4 + 6px * 3 );
				gap: 6px;

				.animation-items
				{
					height: 152px;

					clip-path: polygon( 
						0 40px, 
						50px 0, 
						calc( 100% - 50px ) 0, 
						100% 40px, 
						100% calc(100% - 40px), 
						calc(100% - 50px) 100%, 
						50px 100%, 
						0 calc( 100% - 40px )
					);

					.box-item
					{
						width: 180px;
						background-size: 70% !important;

						img
						{
							width: 60%;
						}
					}
				}
			}

			&.column-5
			{
				height: calc( 125px * 5 + 6px * 4 );
				gap: 6px;

				.animation-items
				{
					height: 125px;
					clip-path: polygon( 
						0 30px, 
						40px 0, 
						calc( 100% - 40px ) 0, 
						100% 30px, 
						100% calc(100% - 30px), 
						calc(100% - 40px) 100%, 
						40px 100%, 
						0 calc( 100% - 30px )
					);

					.box-item
					{
						width: 160px;
						background-size: 65% !important;

						img
						{
							width: 65%;
						}
					}
				}
			}

			.animation-items
			{
				// height: 100%;
				position: relative;
				clip-path: polygon(0 60px, 80px 0, calc( 100% - 80px ) 0, 100% 60px, 100% calc(100% - 60px), calc(100% - 80px) 100%, 80px 100%, 0 calc( 100% - 60px ));

				.left-mask {
			position: absolute;
					left: 0;
					top: 0;
					width: 200px;
					height: 100%;
					background: linear-gradient(90deg, #141627 0%, rgba(20, 22, 39, 0.9) 50%, rgba(20, 22, 39, 0) 100%);
		}

		.right-mask {
					position: absolute;
					right: 0;
					top: 0;
					width: 200px;
					height: 100%;
					background: linear-gradient(270deg, #141627 0%, rgba(20, 22, 39, 0.9) 50%, rgba(20, 22, 39, 0) 100%);
		}

				.animation-item
				{
					display: flex;
					// display: inline-block;
					height: 100%;
					background: #141627;
					// width: 100%;
					&.transition {
						transition: 9s cubic-bezier(0.1, 0.3, 0.15, 1);
					}

					.box-item
					{
						height: 100%;
						display: flex;
						align-items: center;
						justify-content: center;
						background-repeat: no-repeat;
						background-position: center center;
						background-size: contain;
					}
				}

				&::before
				{
					content: '';
					width: 12px;
					height: 12px;
					position: absolute;
					top: -2px;
					left: calc( 50% - 12px / 2 );
					background: url( @/assets/pcimg/openbox/line1.png ) no-repeat;
					background-size: cover;
					z-index: 100;
				}
					
				&::after
				{
					content: '';
					width: 350px;
					height: 32px;
					position: absolute;
					bottom: 0;
					left: calc( 50% - 350px / 2 );
					background: url( @/assets/pcimg/lucky/handler.png ) no-repeat;
					background-size: cover;
				}
			}
		}

		.animation-footer
		{
			height: 120px;
			display: flex;
			justify-content: center;
			align-items: center;
			background: url( @/assets/pcimg/openbox/roulette_bg.png ) no-repeat;
			background-position: center bottom;

			.load-wrap {
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 17px;
				font-weight: bold;
				color: #A6A4B5;
				position: relative;
				// margin-top: -60px;

				img {
					width: 36px;
					height: 36px;
					animation: ani-rotate 2s linear infinite;
					margin-left: 16px;
				}
			}
		}
	}


	// &.active {
	//	 z-index: 200;
	//	 opacity: 1;
	// }

	// .animationx_back {
	//	 width: 1410px;
	//	 // height: calc( 216px + 320px );
	//	 position: relative;
	//	 box-sizing: border-box;
	//	 display: flex;
	//	 align-items: center;
	//	 flex-direction: column;

	//	 .animationx-bg {
	// 	position: absolute;
	// 	top: 0;
	// 	left: 50%;
	// 	transform: translateX(-50%);

	//		 .load-wrap {
	//			 display: flex;
	//			 align-items: center;
	//			 justify-content: center;
	//			 font-size: 17px;
	//			 font-weight: bold;
	//			 color: #A6A4B5;
	//			 position: relative;
	//			 margin-top: -60px;

	//			 img {
	//				 width: 36px;
	//				 height: 36px;
	//				 animation: ani-rotate 2s linear infinite;
	//				 margin-left: 16px;
	//			 }
	//		 }

	//		 .lcy-header
	//		 {
	//			 position: absolute;
	//			 top: 0;
	//			 left: calc( 50% - 300px / 2 );
	//			 display: flex;
	//			 justify-content: flex-end;
	//			 align-items: center;
	//			 flex-direction: column;
	//			 width: 300px;
	//			 height: 150px;

	//			 div
	//			 {
	//				 &:first-child
	//				 {
	//					 font-size: 21px;
	//					 font-weight: 700;
	//				 }

	//				 &:last-child
	//				 {
	//					 color: #8B8C97;
	//					 font-size: 17px;
	//					 font-weight: 300;
	//				 }
	//			 }
	//		 }

	// 	img {
	// 		width: 886px;
	// 		height: 584px;
	// 	}
	// 	}

	//	 .animationx_main {
	//		 position: relative;
	//		 width: 1410px;
	// 	margin: 0px auto 0px;
	// 	box-sizing: border-box;
	// 	overflow: hidden;
	// 	display: flex;
	// 	flex-direction: column;

	//		 &::before
	//		 {
	//			 content: '';
	//			 width: 12px;
	//			 height: 12px;
	//			 position: absolute;
	//			 top: -1px;
	//			 left: calc( 50% - 12px / 2 );
	//			 background: url( @/assets/pcimg/openbox/line1.png ) no-repeat;
	//			 background-size: cover;
	//			 z-index: 100;
	//		 }
				
	//		 &::after
	//		 {
	//			 content: '';
	//			 width: 350px;
	//			 height: 32px;
	//			 position: absolute;
	//			 bottom: 0;
	//			 left: calc( 50% - 350px / 2 );
	//			 background: url( @/assets/pcimg/lucky/handler.png ) no-repeat;
	//			 background-size: cover;
	//		 }

	//		 &.column-1
	//		 {
	//			 margin-top: 170px;
	//		 }

	//		 .left-mask {
	//			 position: absolute;
	//			 left: 0;
	//			 top: 0;
	//			 width: 200px;
	//			 height: 100%;
	//			 background: linear-gradient(90deg, #0D0E1D 0%, rgba(13, 14, 29, 0.00) 100%);
	//		 }

	//		 .right-mask {
	//			 position: absolute;
	//			 right: 0;
	//			 top: 0;
	//			 width: 200px;
	//			 height: 100%;
	//			 background: linear-gradient(270deg, #0D0E1D 0%, rgba(13, 14, 29, 0.00) 100%);
	//		 }

	//		 .animationx_box {
	//			 white-space: nowrap;
	//			 transition: none;
	//			 display: inline-block;

	//			 .animationx_item {
	//				 width: 250px;
	//				 height: 320px;
	//				 background-repeat: no-repeat;
	//				 background-size: contain;
	//				 display: inline-block;
	//				 position: relative;
	//				 box-sizing: border-box;
	//				 vertical-align: middle;
	//				 background: #141627;


	//				 .item-pic {
	//					 display: flex;
	//					 justify-content: center;
	//					 align-items: center;
	//					 width: 250px;
	//					 height: 320px;
	//					 vertical-align: middle;
	//					 background-repeat: no-repeat;
	//					 background-position: center center;

	//					 img {
	//						 max-width: 90%;
	//						 max-height: 90%;
	//					 }
	//				 }

	//			 }

	//			 &.transition {
	//				 transition: 9s cubic-bezier(0.1, 0.3, 0.15, 1);
	//			 }
	//		 }
	//	 }

	// }
}
</style>