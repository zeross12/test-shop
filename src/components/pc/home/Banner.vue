<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "@vue/reactivity";
import { useStore } from "vuex";
import { getBannerList } from "@/network/api/index";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import useClipboard from "vue-clipboard3";

import { Swiper, SwiperSlide } from "swiper/vue"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/scss/autoplay"
import 'swiper/scss/pagination'

const modules = [Autoplay, Pagination]
const { toClipboard } = useClipboard();

const store = useStore();
const router = useRouter();
const banner = ref([]);

onMounted(() => {
	getBanner();
});

async function getBanner() {
	const res = await getBannerList({
		type: "PCBlindBox",
		platformId: store.state.platformId,
	});
	if (res.code === 0) {
		let items = res.data.items;
		items.sort((a, b) => a.sort - b.sort);
		banner.value = items;
	}
}

function onClickOpen(url) {
	if (!url) return;
	if (url == "activity") {
		router.push("/p/activity");
		return;
	} else if (url.startsWith("copytext")) {
		let textArr = url.split("//");
		window.$dev && console.log(url, textArr);
		if (textArr[1]) {
			copy(textArr[1]);
		}
		return;
	}
	window.open(url, "_self");
}

async function copy(value) {
	try {
		await toClipboard(value);
		Success({ offset: 100, message: $t(common.copySuccess) })
	} catch (e) {
		Warn({ offset: 100, message: $t(common.copyFail), customClass: 'error' })
	}
}
</script>

<template>
	<div id="pc-bannerswiper">
		<div class="pc-banner-item">
			<div class="pc-banner-item__bg">
				<img src="@/assets/pcimg/home/banner1_1.png" alt="" />
				<div class="pc-banner-item__content">
					<p class="text-1">New Collection</p>
					<h2 class="text-2">Brand new case series</h2>
					<h1 class="text-3">Legendary of Dragon Lore Collection</h1>
					<div class="text-price">

						<img src="@/assets/pcimg/common/coins.svg" style="width: 32px;">
						<span>
							53.20
						</span>
						<div class="text-promotion">
							73.26
						</div>
					</div>
					<button class="button--primary">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path
								d="M19.7897 4.22001C16.8297 1.27001 12.0297 1.27001 9.08966 4.22001C7.01966 6.27001 6.39966 9.22001 7.19966 11.82L2.49966 16.52C2.16966 16.86 1.93966 17.53 2.00966 18.01L2.30966 20.19C2.41966 20.91 3.08966 21.59 3.80966 21.69L5.98966 21.99C6.46966 22.06 7.13966 21.84 7.47966 21.49L8.29966 20.67C8.49966 20.48 8.49966 20.16 8.29966 19.96L6.35966 18.02C6.06966 17.73 6.06966 17.25 6.35966 16.96C6.64966 16.67 7.12966 16.67 7.41966 16.96L9.36966 18.91C9.55966 19.1 9.87966 19.1 10.0697 18.91L12.1897 16.8C14.7797 17.61 17.7297 16.98 19.7897 14.93C22.7397 11.98 22.7397 7.17001 19.7897 4.22001ZM14.4997 12C13.1197 12 11.9997 10.88 11.9997 9.50001C11.9997 8.12001 13.1197 7.00001 14.4997 7.00001C15.8797 7.00001 16.9997 8.12001 16.9997 9.50001C16.9997 10.88 15.8797 12 14.4997 12Z"
								fill="current" />
						</svg>
						OPEN NOW
					</button>
				</div>
			</div>
			<div class="pc-banner-item__img">

				<img src="@/assets/pcimg/home/banner1_2.png" alt="" />
			</div>
		</div>
		<!-- <div
			style="width: 1840px; height: 360px; background: rgba(52, 53, 79, 0.50); border-radius: 24px; border: 2px #FFE063 solid; backdrop-filter: blur(120px)">
		</div> -->
		<!-- <swiper :pagination="{ clickable: true }" :modules="modules" :autoplay="{ delay: 3000 }" :loop="true">
			<swiper-slide v-for="(item, index) in banner" :key="index">
				<img :src="item.image" alt="" @click="onClickOpen(item.url)" />
			</swiper-slide>
		</swiper> -->
		<!-- <div class="swiper-pagination"></div> -->

	</div>
</template>

<style lang="scss">
#pc-bannerswiper {
	// width: 100%;
	padding-top: 88px;

	margin-inline: 40px;
	overflow: hidden;

	.pc-banner-item {
		position: relative;

		&__content {
			position: absolute;
			top: 50%;
			left: 56px;
			transform: translateY(-50%);
		}

		&__bg {
			position: relative;

			img {
				width: 100%;
				height: 100%;
				object-fit: contain;
			}

			.text-1 {
				color: #22E3B9;
				font-size: 16px;
				font-weight: 700;
			}

			.text-2 {
				margin-top: 14px;
				font-size: 40px;
				font-weight: 700;
				color: white;
				text-transform: uppercase;
			}

			.text-3 {
				color: rgba(255, 224, 99);
				font-size: 56px;
				font-weight: 700;
				text-shadow: 5px 6px 0px rgba(255, 224, 99, 0.3);
				margin-top: 4px;
			}

			.text-price {
				position: relative;
				width: max-content;
				margin-top: 18px;
				font-size: 32px;
				font-weight: 600;
				color: white;

				img {
					height: 32px;
					vertical-align: bottom;
				}
			}

			.text-promotion {
				position: absolute;
				right: 0;
				top: 0;
				transform: translate(calc(100% + 12px), -20%);
				font-size: 24px;
				font-weight: 600;
				text-decoration-line: line-through;
				color: #727391;
			}

			.button--primary {
				font-size: 24px;
				font-weight: 700;
				margin-top: 24px;
				padding: 21px 50px;
			}

			// background-image: url(@/assets/pcimg/home/banner1_1.png);
			// background-repeat: no-repeat;
			// background-size: 100% 100%;
			// background-position: top right;

			// background-size: cover;
			// back
			// background-origin: top;
			// height: ;
			// height: 200px;
		}

		&__img {
			position: absolute;
			bottom: 0;
			right: 40px;
			width: 50%;


			img {
				width: 100%;
				object-fit: contain;
			}
		}
	}

	.swiper {
		overflow-y: visible !important;

		.swiper-pagination {
			bottom: -20px !important;

			.swiper-pagination-bullet {
				width: 8px !important;
				height: 8px !important;
				background-color: transparent;
				border: 1px solid #cccccc;

				&.swiper-pagination-bullet-active {
					background: #fff;
				}
			}
		}
	}

	.b-swipe {
		width: 100%;
		height: 195px;

		img {
			width: 100%;
			height: 174px;
		}
	}

	.van-swipe__indicators {
		bottom: 0px;
		position: absolute;
		z-index: 1000 !important;

		.van-swipe__indicator {
			width: 8px !important;
			height: 8px !important;
			background-color: transparent;
			border: 1px solid #cccccc;
			margin: auto 5px;

		}

		.van-swipe__indicator--active {
			background-color: #cccccc !important;
		}
	}
}
</style>
