<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { nextTick, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { GoodImageBgType } from "@/util/util";
import {
	getGoodsNamePre,
	getGoodsNameSec,
	FormatNickname,
} from "@/util/common";
import Currency from "@/components/h5/common/Currency.vue";
const props = defineProps([
	"start",
	"order",
	"boxList",
	"openBoxItems",
	"roomRound",
]);
const emit = defineEmits(["randGoodsComplete", "endTransition", "slideEnd"]);
defineExpose({ randomGoodsList, postTransition });
const store = useStore();

const volutionList = ref([]); //处理后数组
let dataList = [];
const actionContainerRef = ref(null);
const animationEnd = ref(false);

//过渡class
let soundStyleArr = [
	{
		name: "act-wrap soundone",
	},
	{
		name: "act-wrap soundtwo",
	},
	{
		name: "act-wrap soundthree",
	},
	{
		name: "act-wrap soundfour",
	},
	{
		name: "act-wrap soundfive",
	},
	{
		name: "act-wrap soundsix",
	},
	{
		name: "act-wrap soundseven",
	},
	{
		name: "act-wrap soundeight",
	},
	{
		name: "act-wrap soundnine",
	},
	{
		name: "act-wrap soundten",
	},
];

function randomGoodsList() {
	if (
		!props.boxList[props.roomRound] ||
		!props.boxList[props.roomRound].goodsList
	)
		return;
	dataList.value = [];
	let expect = 30 - props.boxList[props.roomRound].goodsList.length;
	let num = 2;

	if (expect >= 0) {
		num =
			Math.floor(expect / props.boxList[props.roomRound].goodsList.length) + 2;
	}
	let arr = [];
	for (let i = 0; i < num; i++) {
		arr = arr.concat(props.boxList[props.roomRound].goodsList);
	}
	//打乱
	function randSort(arr) {
		for (let i = 0, len = arr.length; i < len; i++) {
			let rand = parseInt(Math.random() * len);
			let temp = arr[rand];
			arr[rand] = arr[i];
			arr[i] = temp;
		}
		return arr;
	}

	dataList.value = randSort(arr);
	dataList.value[0] = props.openBoxItems[props.roomRound].goods;
	emit("randGoodsComplete");
}
//过渡
function postTransition() {
	actionContainerRef.value.className = "act-wrap none";
	animationEnd.value = false;
	setTimeout(() => {
		nextTick(() => {
			volutionList.value = dataList.value;
		});
		nextTick(() => {
			let name = soundStyleArr[props.order[props.roomRound]].name + " working"; //加过渡类名
			actionContainerRef.value.className = name;
			emit("endTransition", "yes"); //告知父组件本次过渡信息
		});
	}, 100);
}

function onTransitionend() {
	animationEnd.value = true;
	emit("slideEnd");
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.roll, item.goodsLevel);
}
</script>

<template>
	<div id="h5-bat-room-action">
		<div
			class="act-wrap"
			ref="actionContainerRef"
			@transitionend="onTransitionend"
		>
			<div class="act-item" v-for="(item, index) in volutionList" :key="index">
				<div
					class="weap-wrap"
					:style="'background-image: url(' + getImageBg(item) + ');'"
				>
					<img :src="item.iconUrl" />
				</div>
				<div class="item-info" v-show="animationEnd">
					<p class="price">
						<img
							class="h5-price-coin"
							src="@/assets/pcimg/common/coin.png"
							alt=""
						/>{{ item.price }}
					</p>
					<p class="item-info2">
						{{
							FormatNickname(
								getGoodsNameSec(item.goodsName, item.goodsType),
								10
							)
						}}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#h5-bat-room-action {
	width: 100%;
	height: 230px;
	overflow: hidden;
	margin: 0 auto;

	.act-wrap {
		transform: translateY(-4660px);

		&.soundone {
			transition: 3s cubic-bezier(0.2, 0.27, 0.13, 0.86);
		}

		&.soundtwo {
			transition: 3s cubic-bezier(0.2, 0.27, 0.13, 0.88);
		}

		&.soundthree {
			transition: 3.4s cubic-bezier(0.2, 0.32, 0.16, 0.84);
		}

		&.soundfour {
			transition: 3.8s cubic-bezier(0.2, 0.24, 0.13, 0.9);
		}

		&.soundfive {
			transition: 4.2s cubic-bezier(0.2, 0.36, 0.19, 0.87);
		}

		&.soundsix {
			transition: 4.6s cubic-bezier(0.2, 0.3, 0.15, 0.8);
		}

		&.soundseven {
			transition: 5s cubic-bezier(0.2, 0.2, 0.3, 0.89);
		}

		&.soundeight {
			transition: 5.4s cubic-bezier(0.2, 0.31, 0.15, 0.82);
		}

		&.soundnine {
			transition: 5.6s cubic-bezier(0.2, 0.3, 0.14, 0.96);
		}

		&.soundten {
			transition: 6s cubic-bezier(0.2, 0.29, 0.14, 0.92);
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
			align-items: start;
			width: 100%;
			height: 230px;
			transform: translateZ(0);
			perspective: 1000;
			position: relative;

			.weap-wrap {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				height: 230px;
				background-repeat: no-repeat;
				background-size: contain;
				background-position: top;

				img {
					max-width: 80%;
					max-height: 80%;
					margin-bottom: 50px;
				}
			}

			.item-info {
				display: flex;
				align-items: start;
				justify-content: start;
				flex-direction: column;
				padding-left: 10px;
				box-sizing: border-box;
				left: 10px;
				bottom: 0px;
				position: absolute;
				z-index: 1000;

				.item-info1 {
					color: rgba(255, 255, 255, 0.6);
					font-size: 26px;
				}

				.item-info2 {
					color: #fff;
					font-size: 26px !important;
				}

				.price {
					color: #7bdca2;
					text-align: center;

					font-size: 24px;
					font-weight: 500;
					margin-top: 10px;

					img {
						margin-bottom: -3px;
						margin-right: 10px;
						width: 24px;
						height: 24px;
					}
				}
			}
		}
	}
}
</style>
