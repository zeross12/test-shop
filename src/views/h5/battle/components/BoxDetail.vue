<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, nextTick, onMounted, computed, watch, onUnmounted } from "vue";
import weaponListCpt from "@/components/h5/weaponListCpt/Index.vue";
import HeadPortrait from "@/components/h5/head/HeadPortrait.vue";
import { useRoute, useRouter } from "vue-router";
import Currency from "@/components/h5/common/Currency.vue";
import { tokenName } from "@/config";
const router = useRouter();
import {
	getBlindBoxGoods,
	getBoxDropRecords,
	getOpenBoxRecords,
	getBoxDetails,
	getOpenBox,
	openAmmonBox,
} from "@/network/api/blind";
import { useStore } from "vuex";
import { add, bignumber } from "mathjs";

const route = useRoute();
const store = useStore();

const props = defineProps(["boxIds", "index", "show", "showHeader"]);
const $emits = defineEmits(["close"]);

let boxId = ref(0);
const currentIndex = ref(0);

const boxData = ref({});

//装备列表
const goodsList = ref([]);
const dropData = ref([]);

//爆率数据
const rarityList = ref([
	{
		icon: new URL("../../../assets/romimg/openbox/baolv1.png", import.meta.url)
			.href,
		color: "#B0C3D8",
		probability: 0,
	},
	{
		icon: new URL("../../../assets/romimg/openbox/baolv2.png", import.meta.url)
			.href,
		color: "#6FF0F9",
		probability: 0,
	},
	{
		icon: new URL("../../../assets/romimg/openbox/baolv3.png", import.meta.url)
			.href,
		color: "#4A69F9",
		probability: 0,
	},
	{
		icon: new URL("../../../assets/romimg/openbox/baolv4.png", import.meta.url)
			.href,
		probability: 0,
		color: "#9B52F6",
	},
	{
		icon: new URL("../../../assets/romimg/openbox/baolv5.png", import.meta.url)
			.href,
		probability: 0,
		color: "#EA37F7",
	},
	{
		icon: new URL("../../../assets/romimg/openbox/baolv6.png", import.meta.url)
			.href,
		probability: 0,
		color: "#eb4b4b",
	},
	{
		icon: new URL("../../../assets/romimg/openbox/baolv7.png", import.meta.url)
			.href,
		probability: 0,
		color: "#F9B800",
	},
]);

const openBoxData = ref([]);

onMounted(() => {
	document.getElementById("box_detail").addEventListener("scroll", catchScroll);
});

onUnmounted(() => {
	// store.commit("setFooterView", true);
	// store.commit("setHeaderView", true);
	try {
		document
			.getElementById("box_detail")
			.removeEventListener("scroll", catchScroll);
	} catch (e) { }
});

let pastTopOffset = ref(false);
function catchScroll() {
	pastTopOffset.value =
		document.getElementById("box_detail").scrollTop > parseInt(250);
	window.$dev && console.log(
		"pastTopOffset",
		pastTopOffset,
		document.getElementById("box_detail").scrollTop
	);
	// const pastBottomOffset =
	//	 window.innerHeight + window.pageYOffset >=
	//	 document.body.offsetHeight - parseInt(this.visibleoffsetbottom);
	// this.visible =pastTopOffset
}

async function getBoxDetail() {
	const res = await getBoxDetails({ boxId: boxId });
	if (res.code === 0) {
		boxData.value = res.data.item;
	}
}

async function getBoxGoods() {
	const res = await getBlindBoxGoods({ boxId: boxId });
	if (res.code === 0) {
		goodsList.value = res.data.items;
		for (let index = 0; index < rarityList.value.length; index++) {
			let rarityItem = rarityList.value[index];
			rarityItem.probability = 0;
		}
		for (let item of goodsList.value) {
			rarityList.value[item.goodsLevel - 1].probability = add(
				bignumber(rarityList.value[item.goodsLevel - 1].probability),
				bignumber(item.probability)
			);
		}
	}
}

function handleDropList(arr) {
	let list = [];
	let cur = dropData.value;
	for (let i = 0; i < arr.length; i++) {
		let has = false;
		for (let j = 0; j < cur.length; j++) {
			if (arr[i].id == cur[j].id) {
				has = true;
				break;
			}
		}
		if (!has) {
			list.push(arr[i]);
		}
	}
	let uplist = [...list, ...cur];
	uplist.sort((a, b) => {
		return b.id - a.id;
	});
	if (uplist.length > 20) {
		uplist = uplist.slice(0, 20);
	}
	dropData.value = uplist;
}

watch(props, (newRoute, oldRoute) => {
	window.$dev && console.log("props", props, newRoute);
	if (props.show) {
		store.commit("setFooterView", false);
		store.commit("setHeaderView", false);
		currentIndex.value = props.index;
		boxId = props.boxIds[props.index];
		getBoxDetail();
		getBoxGoods();

		setTimeout(() => {
			document.getElementById("container").style.maxHeight =
				window.innerHeight + "px";
			//380 + document.getElementById("weaponListCpt").clientHeight + "px";
			document.getElementById("container").style.overflow = "hidden";
			// document.getElementById("box_detail").clientHeight =
			//	 369 + document.getElementById("weaponListCpt").clientHeight;
			window.$dev && console.log(document.getElementById("weaponListCpt").clientHeight);
			window.$dev && console.log(document.getElementById("box_detail").clientHeight);
		}, 500);
	} else {
		document.getElementById("container").style.minHeight =
			window.innerHeight + "px";
		// 369 + document.getElementById("weaponListCpt").clientHeight + "px";
		document.getElementById("container").style.overflow = "scroll";
		if (props.showHeader) {
			store.commit("setFooterView", true);
			store.commit("setHeaderView", true);
		}
	}
});

function back() {
	router.go(-1);
}
function onClickPre(index) {
	if (currentIndex.value + index >= props.boxIds.length && index == 1) {
		currentIndex.value = 0;
	} else if (currentIndex.value + index <= -1 && index == -1) {
		currentIndex.value = props.boxIds.length - 1;
	} else {
		currentIndex.value += index;
	}
	boxId = props.boxIds[currentIndex.value];
	getBoxDetail();
	getBoxGoods();
}
function close() {
	document.body.scrollTop = 0;
	$emits("close");
}
</script>

<template>
	<div id="box_detail" :class="{ active: show }">
		<div class="top-header-wrap" :class="{ active: pastTopOffset }">
			<img class="btn-icon-left" :class="{ active: pastTopOffset }" @click="onClickPre(-1)"
				src="@/assets/romimg/battle/pre.png" alt="" srcset="" />
			<div class="box-name-wrap">
				<p>{{ boxData.name }}</p>

				<div class="open-price">
					<Currency :currency="boxData.price"></Currency>&nbsp;&nbsp;&nbsp;
					<p v-if="Number(boxData.price) < Number(boxData.originalPrice)">
						{{ boxData.originalPrice }}
					</p>
				</div>
			</div>
			<img :class="{ active: pastTopOffset }" class="btn-icon-right" @click="onClickPre(1)"
				src="@/assets/romimg/battle/next.png" alt="" srcset="" />
			<div class="switch-container">
				<img src="@/assets/romimg/battle/close.png" @click="close" alt="" srcset="" />
				<!-- <img
					@click="onClickPre(-1)"
					src="@/assets/romimg/battle/pre.png"
					alt=""
					srcset=""
				/>
				<img
					@click="onClickPre(1)"
					src="@/assets/romimg/battle/next.png"
					alt=""
					srcset=""
				/> -->
			</div>
		</div>
		<!-- <div class="box-name-wrap">
			<p>{{ boxData.name }}</p>
			<div class="open-price">
				<Currency :currency="boxData.price"></Currency>
			</div>
		</div> -->
		<div class="box-back">
			<img class="btn-icon" @click="onClickPre(-1)" src="@/assets/romimg/battle/pre.png" alt="" srcset="" />
			<div class="box-pic" :style="'background-image: url(' + boxData.imageUrl + ')'">
				<img :src="boxData.weaponImageUrl" :alt="boxData.name" />
			</div>
			<img class="btn-icon" @click="onClickPre(1)" src="@/assets/romimg/battle/next.png" alt="" srcset="" />
		</div>

		<div class="probability_main" :class="{
			active: pastTopOffset,
			len5: rarityList.filter((el) => el.probability > 0).length >= 5,
		}">
			<!-- <div class="probability_item">
					<span class="icon iconfont" style="color: #30324c; font-size: 20px"
						>&#xe648;</span
					>
				</div> -->
			<div class="probability_item" v-for="(item, index) in rarityList.filter((el) => el.probability > 0)"
				:key="index" :style="{ color: item.color }">
				<span class="icon iconfont">&#xe649;</span>
				<p>{{ item.probability.toFixed(2) }}%</p>
			</div>
		</div>

		<weaponListCpt :list="goodsList"></weaponListCpt>
	</div>
</template>

<style lang="scss">
#box_detail {
	position: absolute;
	top: 0;
	left: 0;
	height: 100vh;
	overflow-y: scroll;
	width: 750px;
	margin-bottom: 20px;
	// display: flex;
	// flex-direction: column;
	// align-items: center;
	box-sizing: border-box;
	color: #fff;
	background: url(@/assets/romimg/battle/box_detail_bg.png) no-repeat top;
	background-size: contain;
	background-color: #15172c;
	opacity: 0;
	z-index: -1;
	height: 0;

	&.active {
		opacity: 1;
		z-index: 100;
		height: 100%;
		transition: all 0.5s;
	}

	.open-title {
		z-index: 5;
		margin-top: 58px;
		width: 369px;
		background-size: 100%;
		text-align: center;
		font-size: 42px;
		font-weight: 500;
	}

	.box-back {
		width: 750px;
		height: 542px;
		// margin-top: 250px;
		// background: url(@/assets/romimg/openbox/back.png) no-repeat center;
		background-size: 100% 100%;
		// margin: -30px auto 0;
		display: flex;
		z-index: 10;
		justify-content: center;
		align-items: center;

		.btn-icon {
			width: 70px;
			height: 70px;
			margin-bottom: -10px;
		}

		.box-pic {
			width: 420px;
			height: 420px;
			margin: 0px 40px;
			margin-top: -10px;
			// padding-bottom: -0px;
			// margin-bottom: 50px;
			background-position: center;
			background-size: contain;
			background-repeat: no-repeat;
			display: flex;
			justify-content: center;
			align-items: center;

			img {
				max-width: 100%;
				max-height: 100%;
				// margin-bottom: 10px;
				// margin-top: -50px;
			}
		}
	}

	.open-price {
		height: 70px;
		display: flex;
		justify-content: center;
		align-items: center;

		p {
			color: #5E5E5E;
			font-size: 28px;
			font-style: normal;
			font-weight: 700;
			line-height: 14px;
			text-decoration-line: strikethrough;
			text-transform: uppercase;
			text-decoration: line-through solid;
			margin-bottom: 6px;
			// padding: 0 8px;														
		}
	}

	.open-ammon-price {
		height: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #7ae6a6;
		font-size: 32px;
		font-weight: bold;
		margin-top: 32px;

		img {
			width: 64px;
			height: 64px;
			margin-right: 10px;
			margin-bottom: 5px;
		}
	}

	.top-header-wrap {
		width: 750px;
		padding-left: 20px;
		padding-right: 20px;
		box-sizing: border-box;
		// display: flex;
		// justify-content: center;
		// align-items: center;
		padding-top: 100px;
		height: 250px;

		&.active {
			transition: all 0.5s;
			height: 330px;
			position: fixed;
			background: url(@/assets/romimg/battle/creat-show-bg.png) no-repeat top;
			background-size: 750px 330px;
		}

		z-index: 20;

		.switch-container {
			position: absolute;
			right: 30px;
			color: #b5b7c2;
			text-align: center;
			font-size: 24px;
			font-style: normal;
			font-weight: 700;
			top: 30px;
			text-transform: uppercase;

			img {
				width: 64px;
				height: 64px;
				margin-left: 20px;
			}

			// .van-cell__title {
			//	 font-size: 28px;
			//	 margin-bottom: 3px;
			// }
			// .van-cell {
			//	 color: #fff;
			//	 background-color: transparent;
			//	 width: 162px;
			// }
			// .van-cell__value {
			//	 width: 50px !important;

			//	 .van-switch {
			//		 width: 50px !important;
			//		 height: 30px !important;
			//	 }
			// }
			// .van-switch__node {
			//	 margin-top: 4px;
			//	 position: absolute;
			//	 top: 0;
			//	 left: 0;
			//	 width: 50px;
			//	 height: var(--van-switch-node-size);
			//	 font-size: inherit;
			//	 background: var(--van-switch-node-background-color);
			//	 border-radius: 100%;
			//	 box-shadow: var(--van-switch-node-box-shadow);
			//	 transition: transform var(--van-switch-transition-duration)
			//		 cubic-bezier(0.3, 1.05, 0.4, 1.05);
			// }
			// .van-switch--on {
			//	 // transform: translate(calc(50));

			//	 // transform: translate(50);
			// }
		}

		.box-name-wrap {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			// margin-top: 180px;
			color: #fff;
			text-align: center;
			font-size: 40px;
			font-style: normal;
			font-weight: 700;
			z-index: 1000;

			.open-price {
				// margin-top: 20px;
				height: 70px;
				display: flex;
				justify-content: center;
				align-items: center;
				color: #fff;
				text-align: center;

				font-size: 13.043px;
				font-style: normal;
				font-weight: 600;
				line-height: 13.043px;

				/* 100% */
				#currency-wrap {
					color: #fff;
					font-weight: 100;

					img {
						margin-right: 10px;
						margin-bottom: 8px;
					}
				}
			}
		}

		.btn-icon-left {
			width: 70px;
			height: 70px;
			position: absolute;
			top: 120px;
			left: 100px;
			display: none;

			&.active {
				display: block;
			}
		}

		.btn-icon-right {
			width: 70px;
			height: 70px;
			position: absolute;
			top: 120px;
			left: 600px;
			display: none;

			&.active {
				display: block;
			}
		}
	}

	.probability_main {
		display: flex;
		align-items: center;
		justify-content: center;

		border: 1px solid #1e2138;
		background: #1e2138;

		// min-height: 66px;
		margin: 40px 30px 0px;
		width: 690px;
		box-sizing: border-box;
		overflow-x: auto;
		min-height: 80px;

		// flex-wrap: wrap;
		&::-webkit-scrollbar {
			display: none;
		}

		&.len5 {
			justify-content: start;
		}

		&.active {
			transition: all 0.5s;
			position: fixed;
			top: 200px;
			z-index: 1000;
		}

		.probability_item {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			height: 66px;

			span {
				font-size: 20px;
			}

			p {
				font-size: 24px;
				margin-left: 5px;
				margin-right: 30px;
				margin-top: 5px;

				text-align: center;

				font-style: normal;
				font-weight: 500;

				text-transform: uppercase;
			}

			&:first-of-type {
				margin-left: 8px;
			}

			&:last-of-type {
				margin-right: 8px;
			}
		}
	}

	#weaponListCpt {
		background: #15172c !important;
		width: 100%;
		min-height: 800px;

		.weapon-list {
			margin-top: 0px !important;
		}
	}

	// #weaponListCpt {
	//	 .weapon-list {
	//		 width: 670px;
	//		 padding: unset;
	//		 .weapon-item {
	//			 width: 328px;
	//			 height: 334px;

	//			 border: 1px solid #1e2138;
	//			 background: #15172c;
	//			 .weapon-info {
	//				 justify-content: end;
	//				 margin-right: 30px;
	//				 .weapon-item-price {
	//					 #currency-wrap {
	//						 img {
	//							 width: 22px;
	//						 }
	//						 .span1 {
	//							 font-size: 24px !important;
	//							 font-weight: 400;
	//						 }
	//						 .span2 {
	//							 font-size: 24px !important;
	//							 font-weight: 400;
	//						 }
	//					 }
	//				 }
	//			 }
	//			 .weapon-item-pic {
	//				 margin: unset !important;
	//				 margin: 0 auto;
	//				 img {
	//					 width: 196px;
	//					 height: 148px;
	//				 }
	//			 }
	//			 .weapon-item-name {
	//				 margin-top: 10px !important;
	//				 text-align: left;
	//				 margin-left: 30px;
	//				 font-size: 24px;
	//				 color: #cbccd6;
	//			 }
	//			 .weapon-item-wear {
	//				 font-size: 24px;
	//				 text-align: left;
	//				 margin-left: 30px;
	//			 }
	//		 }
	//	 }
	// }
}
</style>
