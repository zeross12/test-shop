<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Autoplay, Navigation, Scrollbar } from "swiper/modules";
import "swiper/less/autoplay";
import "swiper/css/navigation";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getOpenBoxRecords } from "@/network/api/blind";
import { useStore } from "vuex";
import { GoodImageBgType } from "@/util/util";
let props = defineProps({
	items: {
		type: Array,
		default: [],
	},
});

const categoryList = ref([
	new URL("../../../assets/romimg/mall/mall_t7.png", import.meta.url).href,
	new URL("../../../assets/romimg/mall/mall_t1.png", import.meta.url).href,
	new URL("../../../assets/romimg/mall/mall_t2.png", import.meta.url).href,
	new URL("../../../assets/romimg/mall/mall_t6.png", import.meta.url).href,
	new URL("../../../assets/romimg/mall/mall_t4.png", import.meta.url).href,
	new URL("../../../assets/romimg/mall/mall_t9.png", import.meta.url).href,
	new URL("../../../assets/romimg/mall/mall_t8.png", import.meta.url).href,
]);

let $emit = defineEmits(["selectIndexChanged"]);

const navigation = ref({
	nextEl: ".swiper-button-next",
	prevEl: ".swiper-button-prev",
});

const swiperModules = [Autoplay, Navigation, Scrollbar];
const router = useRouter();
const store = useStore();

const openRecord = ref([]);

let tabIndex = ref(0);

const prevEl = (item, index) => {
	window.$dev && console.log("上一张" + index + item);
};
const nextEl = () => {
	window.$dev && console.log("下一张");
};

const onSlideChange = (swiper) => {
	// swiper是当前轮播的对象，里面可以获取到当前swiper的所有信息，当前索引是activeIndex
	window.$dev && console.log(swiper.activeIndex);
};

async function getBoxRecord() {
	const res = await getOpenBoxRecords({ limit: 10 });
	if (res.code === 0) {
		let items = res.data.items;
		if (items) {
			openRecord.value = items;
		}
	}
}

function onClickItem(index) {
	tabIndex.value = index;
	$emit("selectIndexChanged", index);
	window.$dev && console.log("onClickItem", index);
	window.$dev && console.log("onClickItem", categoryList.value[index]);
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.record, item.goodsLevel);
}
onMounted(() => {
	getBoxRecord();
});
</script>

<template>
	<div id="luckycategory">
		<swiper
			class="swiper-container swiper-wrapper"
			:modules="swiperModules"
			:speed="400"
			:slidesPerView="2"
			:slidesPerGroup="2"
			:allowTouchMove="true"
			:navigation="navigation"
			:pagination="{ clickable: false }"
		>
			<swiper-slide
				class="swiper-slide"
				v-for="(item, index) in props.items"
				:key="index"
				@click="onClickItem(index)"
			>
				<div class="swiper-item">
					<div class="swiper-pic" :class="{ active: index == tabIndex }">
						<img
							:src="
								categoryList[
									item.id == -1 ? categoryList.length - 1 : item.id - 1
								]
							"
						/>
						<span>{{ item.name }}</span>
					</div>
				</div>
			</swiper-slide>

			<div class="swiper-button-prev" @click.stop="prevEl"></div>
			<div class="swiper-button-next" @click.stop="nextEl"></div>
		</swiper>
	</div>
</template>

<style lang="scss">
#luckycategory {
	width: 750px;
	height: 310px;
	// margin: auto;
	box-sizing: border-box;
	background: #0d0e1d;
	.swiper-container {
		box-sizing: border-box;
		width: 750px;
		height: 310px;
		// position: relative;

		.swiper-slide {
			width: 750px;
			height: 310px;

			.swiper-item {
				display: flex;

				width: 100%;
				height: 310px;
				justify-content: center;
				align-items: center;
				// background-position: center;
				// background-repeat: no-repeat;
				// background-size: 100% 100%;
				// padding-top: 10px;
				box-sizing: border-box;
				// position: relative;
				// display: flex;
				// border-bottom: 1px solid #15172c;

				// background: linear-gradient(
				//		 90deg,
				//		 rgba(0, 0, 0, 0) 1.85%,
				//		 #15172c 1.85%
				//	 ),
				//	 linear-gradient(0deg, #131528, #131528);
				// border-width: 0px, 1.5px, 0px, 3px;
				// border-style: solid;
				// border-image-source: linear-gradient(
				//	 90deg,
				//	 rgba(0, 0, 0, 0) 1.85%,
				//	 #15172c 1.85%
				// );

				.swiper-info {
					position: absolute;
					left: 0;
					top: 0;
					width: 100%;
					height: 100%;
					text-align: center;
					line-height: 130px;
					opacity: 0;
					z-index: 2;
				}

				.swiper-pic {
					width: 170px;
					height: 204px;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					color: #62626c;

					font-size: 26px;
					font-style: normal;
					font-weight: 400;
					line-height: normal;

					img {
						width: auto;
						height: 130px;
						opacity: 0.3;
						padding-bottom: 20px;
						// filter: grayscale(100%);
					}
					&.active {
						background: url(@/assets/romimg/lucky/lucky_item_bg.png) no-repeat
							center center;
						background-size: cover;
						color: #fff;
						img {
							opacity: 1;
							// filter: none;
						}
						// background: linear-gradient(
						//	 0deg,
						//	 #0d0e1d 15.87%,
						//	 rgba(13, 14, 29, 0) 90%
						// );
					}
					// &.active::before {
					//	 content: "";
					// position: absolute;
					// top: 50%;
					// left: 50%;
					// width: 10px;
					// height: 10px;
					// border-radius: 50%;
					// transform: translate(-50%, -50%);
					// background: rgba(67, 42, 192, 0.3);
					// box-shadow: 0 0 80px 60px #432ac0;
					// }

					// &.active::after {
					//	 content: "";
					// position: absolute;
					z-index: -1;
					// top: 0;
					// bottom: 0;
					// left: 0;
					// right: 0;

					// background: linear-gradient(
					//	 0deg,
					//	 #0d0e1d 15.87%,
					//	 rgba(13, 14, 29, 0) 90%
					// );
					// }
				}

				/*
		content: "";
		position: absolute;
		z-index: -1;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(to top,#0d0e1d 30px,rgba(13,14,29,0) 90%
				*/

				.swiper-price {
					position: absolute;
					color: #00efba;
					font-size: 24px;
					bottom: 30px;
					left: 30px;
				}

				.swiper-user-wrap {
					height: 24px;
					display: none;
					justify-content: center;
					align-items: center;
					margin-top: -1px;

					.user-icon {
						width: 25px;
						height: 25px;
						border-radius: 50%;
					}

					p {
						max-width: 180px;
						font-size: 18px;
						color: #fff;
						margin-left: 10px;
						padding-top: 2px;
					}
				}
			}
		}
		.swiper-button-prev {
			color: #fff;
			// position: absolute;
			// top: 66px;
			// left: 20px;
			// span {
			//	 font-size: 50px;
			// }
		}

		.swiper-button-next {
			color: #fff;
			font-size: 40px !important;
			font-weight: 300;
			// position: absolute;
			// top: 66px;
			// right: 30px;
			// span {
			//	 font-size: 50px;
			//	 transform: rotate(180deg);
			// }
		}
	}

	.swiper-container .swiper-wrapper {
		-webkit-transition-timing-function: linear;
		-moz-transition-timing-function: linear;
		-ms-transition-timing-function: linear;
		-o-transition-timing-function: linear;
		transition-timing-function: linear;
	}
}
</style>
