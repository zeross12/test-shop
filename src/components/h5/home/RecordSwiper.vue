<script setup>
import HeadPortrait from "../head/HeadPortrait.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Controller } from "swiper/modules";
import "swiper/less/autoplay";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getOpenBoxRecords } from "@/network/api/blind";
import { useStore } from "vuex";
import { GoodImageBgType } from "@/util/util";
import { getGoodsNamePre, getGoodsNameSec } from "@/util/common";
import { tokenName } from "@/config"
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const playRecord = ref(true);
const swiperRecord = ref(null);
const tmpArr = ref([]);
const trans = ref(false);
const lists = ref([]);
const random1 = ref(0);
const random2 = ref(0);

/// first req flag
const initFlag = ref(false);
/// 当前步进
const step = ref(0);

components: {
	HeadPortrait;
}
let recoreswiperRef = ref(null);
const swiperModules = [Autoplay, Controller];
const router = useRouter();
const store = useStore();

const openRecord = ref([]);

async function getBoxRecord() {
	const res = await getOpenBoxRecords({ limit: 10 });

	if (res.code === 0) {
		let items = res.data.items;
		if (items) {
			openRecord.value = copy(items);
			if (!initFlag.value) lists.value = copy(items);
			// swiperKey.value += 1;
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

	setInterval(anim, 1500);
});

function onClickSwitch() {
	playRecord.value = !playRecord.value;
	// if (playRecord.value) {
	//	 swiperRecord.value.autoplay.start();
	// } else {
	//	 swiperRecord.value.autoplay.stop();
	// }
}

/// 生成随机数
function getRandomInt(max) {
	let num = Math.floor(Math.random() * max);
	return num < 0 ? getRandomInt(max) : num;
}

function anim() {
	if (!playRecord.value) return;
	if (trans.value) {
		// random1.value = getRandomInt( 20 )
		random1.value = step.value;
		random2.value = getRandomInt(5);

		let arr = copy(openRecord.value);

		tmpArr.value = arr.splice(random1.value, random2.value);
		tmpArr.value.forEach((item) => {
			item.hide = true;
		});

		lists.value.unshift(...tmpArr.value);

		/// 如果动画全部轮训完
		if (random2.value + random1.value > 25) {
			random2.value = random2.value - random1.value;
			step.value = 0;
			getBoxRecord();
		} else {
			step.value = step.value + random2.value;
		}
		return (trans.value = false);
	} else {
		lists.value.forEach((item) => {
			item.hide = false;
		});
		setTimeout(() => {
			lists.value.splice(
				openRecord.value.length - random2.value,
				random2.value
			);
		}, 1000);

		return (trans.value = true);
	}
}
function copy(obj) {
	let res = obj instanceof Array ? [] : {};
	for (const [key, value] of Object.entries(obj)) {
		res[key] = typeof value === "object" ? copy(value) : value;
	}
	return res;
}

function handleSwiper(swp) {
	recoreswiperRef.value = swp;
}

let isAutoplay = ref(true);
function loopSwitch() {
	if (isAutoplay.value) {
		recoreswiperRef.value.autoplay.stop();
	} else {
		recoreswiperRef.value.autoplay.start();
	}
	isAutoplay.value = !isAutoplay.value;
}

function goToVip() {
	if (!localStorage.getItem(tokenName)) {
		router.push("/m/sign");
		return;
	}
	router.push("/m/vip");
}
</script>

<template>
	<div id="recordswiper">
		<div class="top-controller-wrap">
			<div class="left-wrap">
				<div class="live-txt"></div>
				{{ t('menu.droppedBoxesTitle') }}
				<img v-if="playRecord" src="@/assets/romimg/home/push.png" alt="" @click="onClickSwitch" />
				<img v-if="!playRecord" src="@/assets/romimg/home/start.png" alt="" @click="onClickSwitch" />
			</div>
			<div class="right-wrap" @click="goToVip">
				{{ t('battle.member') }} <img src="@/assets/romimg/home/premium.png" alt="" />
			</div>
		</div>
		<div class="swiper-container">
			<div class="sub-container">
				<div :class="['swiper-slide', item.hide ? 'new-node' : '']" v-for="(item, index) in lists" :key="index">
					<div class="overlay"></div>
					<div class="swiper-item" @click="onClickItem(item)"
						:style="'background-image: url(' + getImageBg(item) + ');'">
						<div class="swiper-pic">
							<img :src="item.iconUrl" :alt="item.goodsName" class="item" />
							<!-- <img src="@/assets/pcimg/tmp-box-items.png" class="box"> -->
						</div>
						<div class="item-info">
							<p class="item-info1 hide">
								{{ getGoodsNamePre(item.goodsName) }}
							</p>
							<p class="item-info2 hide">
								{{ getGoodsNameSec(item.goodsName) }}
							</p>
						</div>
						<div class="swiper-user-wrap" v-if="false">
							<div class="user-icon">
								<HeadPortrait :userModel="item" size="three"></HeadPortrait>
							</div>
							<p class="van-ellipsis">{{ item.nickName }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- <swiper
			class="swiper-container swiper-wrapper"
			:modules="swiperModules"
			:loop="true"
			:autoplay="{ delay: 50000 }"
			:speed="4000"
			:slidesPerView="3"
			:allowTouchMove="false"
		>
			<swiper-slide
				class="swiper-slide"
				v-for="(item, index) in openRecord"
				:key="index"
				@click="onClickItem(item)"
			>
				<div
					class="swiper-item"
					:style="'background-image: url(' + getImageBg(item) + ');'"
				>
					<div class="swiper-info">{{ item }}</div>
					<div class="swiper-pic">
						<img :src="item.iconUrl" :alt="item.goodsName" />
					</div>
					<div class="swiper-user-wrap" v-if="false">
						<div class="user-icon">
							<HeadPortrait :userModel="item" size="three"></HeadPortrait>
						</div>
						<p class="van-ellipsis">{{ item.nickName }}</p>
					</div>
				</div>
			</swiper-slide>
		</swiper> -->
	</div>
</template>

<style lang="scss">
#recordswiper {
	width: 750px;
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
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 26px;
			font-style: normal;
			font-weight: 400;

			text-transform: uppercase;
			// span {
			//	 color: #1c1f37;
			//	 font-size: 28px;

			.live-txt {
				content: "";
				width: 6px;
				height: 6px;
				margin-right: 10px;
				background-color: #f11c53;
				box-shadow: 0 0 15px rgba(241, 28, 83, 0.91);
				border-radius: 50%;
				animation: blinking 0.75s infinite alternate;
				transform: translateY(-50%);
				box-sizing: border-box;
			}

			// }
			img {
				width: 52px;
				height: 52px;
				vertical-align: middle;
				margin-left: 20px;
			}

			@keyframes blinking {
				0% {
					transform: scale(0);
					opacity: 0;
				}

				100% {
					transform: scale(1);
					opacity: 1;
				}
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
		width: 100%;
		height: 324px;
		overflow: hidden;

		.sub-container {
			display: flex;

			.swiper-slide {
				width: 314px;
				height: 324px;
				// border-width: 0px 1px 0px 1px;
				// border-style: solid;
				border-image-source: linear-gradient(90deg,
						rgba(0, 0, 0, 0.3) 1.85%,
						#15172c 1.85%);
				transition: 0.5s;

				&.new-node {
					width: 0;
					transition: 0ms;
				}

				// .overlay,
				// .box
				// {
				//	 display: none;
				// }

				// &:hover
				// {
				//	 .item
				//	 {
				//		 display: none;
				//	 }
				//	 .overlay,
				//	 .box
				//	 {
				//		 display: block;
				//	 }

				//	 .overlay
				//	 {
				//		 position: absolute;
				//		 width: 100%;
				//		 height: 100%;
				//		 background: rgba( 0, 0, 0, .1 );
				//		 z-index: 1;
				//	 }
				// }

				.swiper-item {
					display: block;
					width: 100% !important;
					height: 100%;
					background-position: center;
					background-repeat: no-repeat;
					background-size: cover;
					padding-top: 10px;
					box-sizing: border-box;
					position: relative;
					cursor: pointer;
					overflow: hidden;

					.swiper-pic {
						width: 235px;
						height: 232px;
						margin: 0 auto;
						display: flex;
						justify-content: center;
						align-items: center;

						img {
							max-width: 100%;
							max-height: 100%;
						}
					}

					.item-info {
						display: flex;
						flex-direction: column;
						position: absolute;
						bottom: 32px;
						left: 40px;

						.item-info1 {
							font-size: 24px;
							font-weight: bold;
							color: #cbccd6;
						}

						.item-info2 {
							font-size: 24px;
							color: #cbccd6;
							width: 100%;
							overflow: hidden;
							word-break: break-all;
							white-space: nowrap;
						}
					}

					.swiper-user-wrap {
						height: 32px;
						display: flex;
						justify-content: center;
						align-items: center;
						margin-top: -1px;

						.user-icon {
							width: 50px;
							height: 50px;
							border-radius: 50%;
						}

						p {
							// max-width: 180px;
							font-size: 24px;
							color: #fff;
							margin-left: 20px;
							padding-top: 4px;
						}
					}
				}
			}
		}
	}

	// .swiper-container {
	//	 // padding: 10px;
	//	 box-sizing: border-box;
	//	 // margin: 20px auto;
	//	 width: 100%;
	//	 height: 324px;

	//	 .swiper-slide {
	//		 width: 315px;
	//		 height: 324px;

	//		 .swiper-item {
	//			 width: 315px !important;
	//			 height: 324px !important;
	//			 background-position: center;
	//			 background-repeat: no-repeat;
	//			 background-size: contain;
	//			 display: flex;
	//			 flex-direction: column;
	//			 justify-content: start;
	//			 align-items: center;

	//			 .swiper-pic {
	//				 width: 235px;
	//				 height: 174px;
	//				 display: flex;
	//				 justify-content: center;
	//				 align-items: center;
	//				 padding-top: 60px;
	//				 img {
	//					 width: 100%;
	//					 height: 100%;
	//				 }
	//			 }

	//			 .swiper-name1 {
	//				 position: absolute;
	//				 color: #cbccd6;
	//				 
	//				 font-size: 24px;
	//				 bottom: 65px;
	//				 left: 40px;
	//				 font-weight: 400;
	//				 font-style: normal;
	//			 }
	//			 .swiper-name2 {
	//				 position: absolute;
	//				 color: #cbccd6;
	//				 
	//				 font-size: 24px;
	//				 bottom: 30px;
	//				 left: 40px;
	//				 font-weight: 400;
	//				 font-style: normal;
	//			 }
	//		 }
	//	 }
	// }

	.swiper-container .swiper-wrapper {
		-webkit-transition-timing-function: linear;
		-moz-transition-timing-function: linear;
		-ms-transition-timing-function: linear;
		-o-transition-timing-function: linear;
		transition-timing-function: linear;
	}
}
</style>
