<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { nextTick, onMounted, ref, watch, computed } from 'vue';
import { useStore } from 'vuex';
import { GoodImageBgType } from '@/util/util'
import { getGoodsNamePre, getGoodsNameSec } from '@/util/common';
const props = defineProps(['start', 'order', 'boxList', 'openBoxItems', 'roomRound', 'winFlag']);
const emit = defineEmits(['randGoodsComplete', 'endTransition', 'slideEnd']);
defineExpose({ randomGoodsList, postTransition });
const store = useStore();

const volutionList = ref([]);//处理后数组
let dataList = [];
const actionContainerRef = ref(null);
const animationEnd = ref(false);

// const battleFlag = computed( () => props.winFlag )
const battleFlag = computed({
	get() {
		return props.winFlag
	},
	set(val) {
		return val
	}
})

//过渡class
let soundStyleArr = [
	{
		name: 'act-wrap soundone',
	},
	{
		name: 'act-wrap soundtwo',
	},
	{
		name: 'act-wrap soundthree',
	},
	{
		name: 'act-wrap soundfour',
	},
	{
		name: 'act-wrap soundfive',
	},
	{
		name: 'act-wrap soundsix',
	},
	{
		name: 'act-wrap soundseven',
	},
	{
		name: 'act-wrap soundeight',
	},
	{
		name: 'act-wrap soundnine',
	},
	{
		name: 'act-wrap soundten',
	}
]

function randomGoodsList() {
	if (!props.boxList[props.roomRound] || !props.boxList[props.roomRound].goodsList) return;
	dataList.value = []
	let expect = 30 - props.boxList[props.roomRound].goodsList.length
	let num = 2

	if (expect >= 0) {
		num = Math.floor(expect / props.boxList[props.roomRound].goodsList.length) + 2;
	}
	let arr = []
	for (let i = 0; i < num; i++) {
		arr = arr.concat(props.boxList[props.roomRound].goodsList)
	}
	//打乱
	function randSort(arr) {
		for (let i = 0, len = arr.length; i < len; i++) {
			let rand = parseInt(Math.random() * len)
			let temp = arr[rand]
			arr[rand] = arr[i]
			arr[i] = temp
		}
		return arr
	}

	dataList.value = randSort(arr)
	dataList.value[0] = props.openBoxItems[props.roomRound].goods;
	emit('randGoodsComplete')
}
//过渡
function postTransition() {
	battleFlag.value = 0
	actionContainerRef.value.className = 'act-wrap none'
	animationEnd.value = false;
	setTimeout(() => {
		nextTick(() => {
			volutionList.value = dataList.value
		})
		nextTick(() => {
			let name = soundStyleArr[props.order[props.roomRound]].name + ' working' //加过渡类名
			actionContainerRef.value.className = name
			emit('endTransition', 'yes') //告知父组件本次过渡信息
		})
	}, 100)
}

function onTransitionend() {
	animationEnd.value = true;
	emit('slideEnd')
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.roll, item.goodsLevel);
}
</script>
		
<template>
	<div id="pc-bat-room-action">
		<div :class="{ winner: battleFlag == 1, loser: battleFlag == 2 || battleFlag == 3 }" class="nil"></div>
		<div class="act-wrap" ref="actionContainerRef" @transitionend="onTransitionend">
			<div class="act-item" v-for="(item, index) in volutionList" :key="index">
				<div class="weap-wrap" :style="'background-image: url(' + getImageBg(item) + ');'">
					<img :src="item.iconUrl">
				</div>
				<div class="item-info" v-show="animationEnd">
					<p class="item-info1">{{ getGoodsNamePre(item.goodsName) }}</p>
					<p class="item-info2">{{ getGoodsNameSec(item.goodsName, item.goodsType) }}</p>
					<p class="price"><img class="pc-price-coin" src="@/assets/pcimg/common/coin.png" alt="" />{{ item.price
					}}</p>
				</div>
			</div>
		</div>
	</div>
</template>
		
<style lang="scss">
#pc-bat-room-action {
	// width: 397px;
	width: 100%;
	height: 346px;
	overflow: hidden;
	justify-content: center;
	display: flex;
	background: #0D0E1A;
	position: relative;

	.loser,
	.winner {
		display: flex !important;
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		background: #0D0E1A url(@/assets/pcimg/battle/battle-user-body-bg1.png ) no-repeat;
		background-size: 100% 100%;
		animation: light 1s cubic-bezier(0.39, 0.575, 0.565, 1)
	}

	.loser {
		background: #0D0E1A url(@/assets/pcimg/battle/battle-user-body-bg2.png ) no-repeat;
		background-size: 100% 100%;
	}

	.act-wrap {
		transform: translateY(-4660px);
		width: 397px;

		&.soundone {
			transition: 3s cubic-bezier(0.2, 0.27, 0.13, .86);
		}

		&.soundtwo {
			transition: 3s cubic-bezier(0.2, 0.27, 0.13, .88);
		}

		&.soundthree {
			transition: 3.4s cubic-bezier(0.2, 0.32, 0.16, .84);
		}

		&.soundfour {
			transition: 3.8s cubic-bezier(0.2, 0.24, 0.13, .9);
		}

		&.soundfive {
			transition: 4.2s cubic-bezier(0.2, 0.36, 0.19, .87);
		}

		&.soundsix {
			transition: 4.6s cubic-bezier(0.2, 0.3, 0.15, .8);
		}

		&.soundseven {
			transition: 5s cubic-bezier(0.2, 0.2, 0.3, .89);
		}

		&.soundeight {
			transition: 5.4s cubic-bezier(0.2, 0.31, 0.15, .82);
		}

		&.soundnine {
			transition: 5.6s cubic-bezier(0.2, 0.3, 0.14, .96);
		}

		&.soundten {
			transition: 6s cubic-bezier(0.2, 0.29, 0.14, .92);
		}

		&.none {
			transition: none !important;
		}

		&.working {
			transform: translateY(0);
		}

		.act-item {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 346px;
			transform: translateZ(0);
			perspective: 1000;
			position: relative;

			.weap-wrap {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				// height: 346px;
				height: 230px;
				background-repeat: no-repeat;
				background-size: contain;
				background-position: center;

				img {
					// max-width: 90%;
					// max-height: 90%;
					width: 183px;
				}
			}

			.item-info {
				display: flex;
				align-items: center;
				flex-direction: column;
				left: 10px;
				bottom: 20px;
				position: absolute;

				.item-info1 {
					color: rgba(255, 255, 255, 0.60);
					font-size: 14px;
				}

				.item-info2 {
					color: #FFF;
					font-size: 14px;
				}

				.price {
					color: #7BDCA2;
					text-align: center;

					font-size: 15px;
					font-weight: 500;
					margin-top: 10px;

					img {
						margin-bottom: -3px;
					}
				}
			}
		}
	}
}

@keyframes light {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}
</style>