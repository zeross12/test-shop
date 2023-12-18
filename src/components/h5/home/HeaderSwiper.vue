<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import HeadPortrait from "../head/HeadPortrait.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Controller } from "swiper/modules";
import "swiper/less/autoplay";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getOpenBoxRecords } from "@/network/api/blind";
import { useStore } from "vuex";
import { GoodImageBgType } from "@/util/util";
import Currency from "../common/Currency.vue";

components: {
	HeadPortrait;
}
let recoreswiperRef = ref(null);
const swiperModules = [Autoplay, Controller];
const router = useRouter();
const store = useStore();

const openRecord = ref([]);

async function getBoxRecord() {
	const res = await getOpenBoxRecords({ limit: 20 });
	if (res.code === 0) {
		let items = res.data.items;
		if (items) {
			openRecord.value = [...items, ...items];
		}
	}
}

function onClickItem(item) {
	router.push({
		path: "/m/openbox",
		query: {
			boxId: item.boxId,
		},
	});
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.record, item.goodsLevel);
}

onMounted(() => {
	getBoxRecord();
});

let isAutoplay = ref(true);
function loopSwitch() {
	if (isAutoplay.value) {
	} else {
	}
	isAutoplay.value = !isAutoplay.value;
}
function handleSwiper(swp) { }

function goToVip() {
	router.push("/m/vip");
}
</script>

<template>
	<div id="recordswiper">
		<div class="top-controller-wrap">
			<div class="left-wrap">
				{{ $t(menu.droppedBoxesTitle) }}
				<img v-if="isAutoplay" src="@/assets/romimg/home/push.png" alt="" @click="loopSwitch" />
				<img v-else src="@/assets/romimg/home/start.png" alt="" @click="loopSwitch" />
			</div>
			<div class="right-wrap" @click="goToVip">
				{{ $t(menu.memberSystem) }} <img src="@/assets/romimg/home/premium.png" alt="" />
			</div>
		</div>
		<div class="swiper-container">
			<div class="swiper-wrapper" :class="{ swiper_stop: !isAutoplay }">
				<div class="swiper-slide" v-for="(item, index) in openRecord" :key="index" @click="onClickItem(item)">
					<div class="swiper-item" :style="'background-image: url(' + getImageBg(item) + ');'">
						<div class="swiper-info">{{ item }}</div>
						<div class="swiper-pic">
							<img :src="item.iconUrl" :alt="item.goodsName" />
						</div>
						<!-- <div class="swiper-price">
			${{ Math.floor(item.price) }}.
			<span>{{ GetPriceDecimalPlaces(item.price) }}</span>
			</div> -->
						<div class="swiper-price" v-if="false">
							<Currency :currency="item.price"></Currency>
						</div>
						<div class="swiper-name1">{{ item.goodsName.split("|")[0] }}</div>
						<div class="swiper-name2">{{ item.goodsName.split("|")[1] }}</div>
						<!-- <div class="swiper-price">{{ item.goodsName }}</div> -->
						<!-- <div class="swiper-user-wrap">
			<div class="user-icon">
				<HeadPortrait :userModel="item" size="three"></HeadPortrait>
			</div>
			<p class="van-ellipsis">{{ item.nickName }}</p>
			</div> -->
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#recordswiper {
	width: 720px;
	margin: 0 auto;
	margin-top: 0 !important;
	box-sizing: border-box;

	.top-controller-wrap {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 96px;
		padding: 0 20px;

		.left-wrap {
			color: #fff;
			text-align: center;

			font-size: 26px;
			font-style: normal;
			font-weight: 400;

			text-transform: uppercase;

			span {
				color: #1c1f37;
				font-size: 28px;
			}

			img {
				width: 52px;
				height: 52px;
				vertical-align: middle;
				margin-left: 20px;
			}
		}

		.right-wrap {
			color: #b7bad3;
			font-size: 28px;
			font-style: normal;
			font-weight: 400;

			img {
				vertical-align: middle;
				margin-left: 20px;
				width: 34px;
				height: 32px;
			}
		}
	}

	.swiper-container {
		// padding: 10px;
		box-sizing: border-box;
		// margin: 20px auto;
		width: 710px;
		height: 324px;
		overflow: hidden;

		.swiper-wrapper {
			animation: 20s headLoop linear infinite normal;

			.swiper-slide {
				width: 324px;
				height: 324px;

				.swiper-item {
					display: block;
					width: 324px !important;
					height: 324px !important;
					background-position: center;
					background-repeat: no-repeat;
					background-size: 100% 100%;
					// padding-top: 10px;
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
						display: none;
					}

					.swiper-pic {
						width: 250px;
						height: 155px;
						margin: auto;
						display: flex;
						justify-content: center;
						align-items: center;

						img {
							max-width: 100%;
							max-height: 100%;
						}
					}

					.swiper-price {
						position: absolute;
						color: #ccc;
						font-size: 24px;
						bottom: 30px;
						left: 30px;
						font-weight: 500;

						font-style: normal;
						font-weight: 500;

						#currency-wrap {
							span {
								font-size: 24px;
							}

							img {
								width: 24px;
								height: 24px;
								margin-right: 10px;
								vertical-align: middle;
								object-fit: contain;
							}
						}
					}

					.swiper-name1 {
						position: absolute;
						color: #ccc;
						font-size: 24px;
						bottom: 70px;
						left: 30px;
						font-weight: 500;
						font-style: normal;
						font-weight: 500;
					}

					.swiper-name2 {
						position: absolute;
						color: #ccc;
						font-size: 24px;
						bottom: 30px;
						left: 30px;
						font-weight: 500;
						font-style: normal;
						font-weight: 500;
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

			&.swiper_stop {
				animation-play-state: paused;
			}
		}
	}

	.swiper-container .swiper-wrapper {
		-webkit-transition-timing-function: linear;
		-moz-transition-timing-function: linear;
		-ms-transition-timing-function: linear;
		-o-transition-timing-function: linear;
		transition-timing-function: linear;
	}

	@keyframes headLoop {
		0% {
			transform: translateX(0px);
		}

		100% {
			transform: translateX(-100%);
		}
	}
}
</style>
