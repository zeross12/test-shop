<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { Swiper, SwiperSlide } from "swiper/vue";

import { Autoplay, Navigation, Scrollbar } from "swiper/modules";
import "swiper/less/autoplay";
import "swiper/css/navigation";
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { GoodImageBgType } from "@/util/util";
import { getBoxList } from "@/network/api/battle";
import Currency from "@/components/h5/common/Currency.vue";
import BoxDetail from "./BoxDetail.vue";

let $emit = defineEmits(["selectIndexChanged"]);

const navigation = ref({
	nextEl: ".swiper-button-next",
	prevEl: ".swiper-button-prev",
});
const listBoxData = ref([]);

const swiperModules = [Autoplay, Navigation, Scrollbar];
const router = useRouter();
const store = useStore();

const prevEl = (item, index) => {
	window.$dev && console.log("上一张" + index + item);
};
const nextEl = () => {
	window.$dev && console.log("下一张");
};

function onClickItem(item) {
	router.push({
		path: "/m/battleBoxIntro",
		query: {
			boxId: item.boxId,
		},
	});
}

async function getBattleBoxList() {
	const res = await getBoxList();
	if (res.code === 0) {
		listBoxData.value = res.data.items;
	}
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.record, item.goodsLevel);
}

function getBoxImageStyle(item) {
	if (item.imageUrl) {
		return "background-image: url(" + item.imageUrl + ");";
	} else {
		return "width:100%;";
	}
}
onMounted(() => {
	getBattleBoxList();
});

const showBoxDetail = ref({ show: false, ids: [], index: 0 });
function onClickBoxDetails(index) {
	// router.push("/m/boxDetails?boxId=" + id);
	let ids = listBoxData.value.map((el) => el.boxId);
	showBoxDetail.value.ids = ids;
	showBoxDetail.value.index = index;
	showBoxDetail.value.show = true;
}
</script>

<template>
	<div id="luckycategory1">
		<swiper
			class="swiper-container swiper-wrapper"
			:modules="swiperModules"
			:speed="400"
			:slidesPerView="3"
			:slidesPerGroup="3"
			:allowTouchMove="true"
			:navigation="navigation"
			:pagination="{ clickable: true }"
		>
			<swiper-slide
				class="btbox_list"
				v-for="(item, index) in listBoxData"
				:key="index"
				@click="onClickBoxDetails(index)"
			>
				<div class="btbox_item">
					<div class="btbox_pic" :style="getBoxImageStyle(item)">
						<img :src="item.weaponImageUrl" alt="" />
					</div>
					<p>{{ item.name }}</p>
					<div class="price"><Currency :currency="item.price"></Currency></div>
				</div>
			</swiper-slide>

			<div class="swiper-button-prev" @click.stop="prevEl"></div>
			<div class="swiper-button-next" @click.stop="nextEl"></div>
		</swiper>
		<BoxDetail
			:show="showBoxDetail.show"
			:boxIds="showBoxDetail.ids"
			:index="showBoxDetail.index"
			:showHeader="true"
			@close="showBoxDetail.show = false"
		></BoxDetail>
	</div>
</template>

<style lang="scss">
#luckycategory1 {
	width: 710px;
	height: 300px;
	margin: auto;
	box-sizing: border-box;
	.swiper-container {
		box-sizing: border-box;
		width: 710px;
		height: 300px;
		position: relative;
		border-bottom: 1px solid #4854c9;
		.swiper-slide {
			width: 710px;
			height: 300px;
			overflow-x: scroll;
			white-space: nowrap;
			margin: auto 20px;
			color: #ffffff;
			font-size: 22px;
			background-color: #15172c;
			overflow: hidden;

			box-sizing: border-box;
			.swiper-item {
				display: inline-block;
				width: 236px;
				height: 300px;
				background-position: center;
				background-repeat: no-repeat;
				background-size: 100% 100%;
				padding-top: 10px;
				box-sizing: border-box;
				position: relative;
				display: flex;

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
					display: flex;
					justify-content: center;
					align-items: center;
					background-size: contain;
					background-repeat: no-repeat;
					background-position: center;
					width: 100%;
					height: 193px;
					margin-top: 8px;
					img {
						max-width: 100%;
						max-height: 100%;
					}
				}
				p {
					width: 100%;
					font-size: 20px;
					color: #b4b6c8;
					line-height: 28px;
					// margin-top: -3px;
					text-align: center;
					box-sizing: border-box;
				}
				.swiper-price {
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 24px;
					color: #fff;
					margin-top: 8px;
					font-weight: bold;
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

		.btbox_list {
			width: 710px;
			height: 300px;
			overflow-x: scroll;
			white-space: nowrap;
			margin: 0px;
			color: #ffffff;
			font-size: 22px;
			background-color: #15172c;
			overflow: hidden;
			border-bottom: 1px solid #4854c9;
			box-sizing: border-box;

			.btbox_item {
				display: inline-block;
				width: 236px;
				height: 300px;

				.hot {
					position: absolute;
					top: 12px;
					right: 11px;
					width: 55px;
					height: 40px;

					img {
						width: 100%;
					}
				}

				.btbox_pic {
					display: flex;
					justify-content: center;
					align-items: center;
					background-size: contain;
					background-repeat: no-repeat;
					background-position: center;
					width: 100%;
					height: 193px;
					margin-top: 8px;

					img {
						// max-width: 65%;
						// max-height: 65%;
						width: 160px;
						height: 76px;
					}
				}

				.price {
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 24px;
					color: #fff;
					margin-top: 8px;
					font-weight: bold;

					#currency-wrap {
						img {
							width: 28px;
							height: 28px;
							margin-right: 10px;
							vertical-align: middle;
						}

						.span1 {
							font-size: 24px;
						}
						.span2 {
							font-size: 24px;
						}
					}
				}

				p {
					width: 100%;
					font-size: 24px;
					color: #b4b6c8;
					line-height: 28px;
					// margin-top: -3px;
					text-align: center;
					box-sizing: border-box;
				}

				// &:first-of-type {
				//	 margin-left: 13px;
				// }
			}

			&::-webkit-scrollbar {
				width: 10px;
				height: 10px;
				background-color: none;
				border-radius: 10px;
			}

			&::-webkit-scrollbar-track {
				border-radius: 10px;
				background-color: rgba($color: #000000, $alpha: 0.1);
			}

			&::-webkit-scrollbar-thumb {
				border-radius: 10px;
				background-color: rgba($color: #818187, $alpha: 0.6);
			}
		}

		.swiper-button-prev {
			color: #fff;
		}

		.swiper-button-next {
			color: #fff;
			font-size: 40px !important;
			font-weight: 300;
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
