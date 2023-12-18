<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "@vue/reactivity";
import { useRouter } from "vue-router";
import { getGeneralList } from "@/network/api/blind";
import { onMounted, computed } from "vue";
import { useStore } from "vuex";
import Currency from "@/components/h5/common/Currency.vue";
import { timeCountdown } from "@/util/common";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/scss/autoplay";
import "swiper/scss/pagination";

const modules = [Autoplay, Pagination];

const store = useStore();
const router = useRouter();
const regPacket = computed(() => store.state.regPacket);
const hasLogin = computed(() => store.getters.hasLogin);
const hasRegisterPacket = computed(() => store.state.hasRegisterPacket);
const homoBox = ref([]);

/// 活动专属的箱子
const activity = ref([]);
/// 活动结束时间
const overtime = ref(new Date("2023-10-06 23:59:59").getTime() / 1000);
const Days = ref(0);
const Hours = ref(0);
const Min = ref(0);
const Sec = ref(0);

const timerId = ref(0);
const over = ref(false);

function countdown() {
	over.value =
		Days.value == 0 && Hours.value == 0 && Min.value == 0 && Sec.value == 0;
	if (over.value) {
		clearInterval(timerId.value);
	} else {
		getOverTime();
	}
}

function getOverTime() {
	let d = timeCountdown(overtime.value);

	Days.value = d.days;
	Hours.value = d.hours;
	Min.value = d.min;
	Sec.value = d.sec;
}

function setRed(data) {
	store.commit("setRegPacket", data);
}

function openBox(value) {
	router.push({
		path: "/m/openbox",
		query: {
			boxId: value.boxId,
		},
	});
}

async function getBox() {
	const res = await getGeneralList();
	if (res.code === 0) {
		let items = res.data.items;
		for (let i = 0; i < items.length; i++) {
			items[i].show = true;
			let boxItems = items[i].boxItems;
			// if (boxItems && boxItems.length > 0) {
			//	 // boxItems.sort((a, b) => a.sort - b.sort);
			// }
		}
		homoBox.value = items;

		let tmp = homoBox.value[5].boxItems;
		let arr = Array.isArray(tmp) ? tmp.concat(tmp) : [];
		// console.log(arr )
		let group = [];
		for (let i = 0, j = arr.length; i < j; i += 2) {
			group.push(arr.slice(i, i + 2));
		}
		// window.$dev && console.log( group )
		activity.value = group;
	}
}

let todayDate = new Date().format("yyyy-MM-dd");

// 节日活动
function onClickFestival() {
	router.push({
		path: "/m/activity",
	});
}

onMounted(() => {
	if (overtime.value - new Date().getTime() / 1000 > 0) {
		getOverTime();
		timerId.value = setInterval(countdown, 1000);
	}
	getBox();
});
</script>

<template>
	<div id="home" v-if="store.state.moduleBlindBox">
		<div class="home-list" v-if="false">
			<div class="top-active">
				<div class="background" @click="router.push('/m/activity')">
					<div class="title-desc" v-html="t('home.activityTip', { month: 10, days: 7, hours: 24 })"></div>
					<div class="title-big">
						<img src="../../../assets/romimg/activity/title.png" />
					</div>
					<div class="title-big-btn">{{ t('home.exchangeNow') }}</div>

					<div class="time-countdown-container" v-if="false">
						<div class="countdown-title">{{ t('home.limitTimeUnboxing') }}</div>
						<div class="countdown-items">
							<div class="countdown-item">
								<div>{{ Days }}</div>
								<div>Days</div>
							</div>
							<div class="countdown-item">
								<div>{{ Hours }}</div>
								<div>Hours</div>
							</div>
							<div class="countdown-item">
								<div>{{ Min }}</div>
								<div>Min</div>
							</div>
							<div class="countdown-item">
								<div>{{ Sec }}</div>
								<div>Sec</div>
							</div>
						</div>
					</div>
				</div>
				<div class="act-box-list" v-if="false">
					<div class="title_bg">
						<div class="title_c">
							{{ t('home.limitTimeActivity') }}
						</div>
					</div>
					<div class="act-item-container">
						<van-swipe :indicator-dots="true" :autoplay="3000" indicator-color="white">
							<van-swipe-item v-for="(item, index) in activity" :key="index">
								<lazy-component @click="openBox(value)" class="tab-item" v-for="(value, i) in item"
									:key="i">
									<div class="item-pic" :style="'background-image: url(' + value.imageUrl + ');'">
										<img :src="value.weaponImageUrl" :alt="value.name" />
									</div>
									<div class="hot" v-show="value.labelUrl">
										<img :src="value.labelUrl" alt="" />
									</div>
									<div class="item-name">{{ value.name }}</div>
									<div class="item-price">
										<Currency :currency="value.price"></Currency>
									</div>
								</lazy-component>
							</van-swipe-item>
						</van-swipe>
						<swiper :pagination="true" :slides-per-view="2" :slides-per-group="1" :modules="modules"
							:autoplay="true" :loop="true" :loopAdditionalSlides="2">
							<swiper-slide v-for="( value, index ) in activity.boxItems" :key="index">
								<lazy-component @click="openBox(value)" class="tab-item">
									<div class="item-pic" :style="'background-image: url(' + value.imageUrl + ');'">
										<img :src="value.weaponImageUrl" :alt="value.name" />
									</div>
									<div class="hot" v-show="value.labelUrl">
										<img :src="value.labelUrl" alt="" />
									</div>
									<div class="item-name">{{ value.name }}</div>
									<div class="item-price">
										<Currency :currency="value.price"></Currency>
									</div>
								</lazy-component>
							</swiper-slide>
						</swiper>
					</div>
				</div>
			</div>
		</div>

		<div class="home-list" v-for="(item, index) in homoBox" :key="index">
			<div class="title_bg" :class="{ title_hide: !item.show }" v-if="item.boxItems && item.boxItems.length > 0">
				<div class="title_c">
					{{ item.name }}
					<!-- <img
						v-if="item.show"
						src="@/assets/romimg/home/open.png"
						@click="item.show = !item.show"
					/>
					<img
						v-else
						src="@/assets/romimg/home/close.png"
						@click="item.show = !item.show"
					/> -->
				</div>
			</div>
			<div v-show="item.show">
				<transition name="fade">
					<div class="tab-list active">
						<div class="tab-item" v-for="value in item.boxItems" v-show="item.boxItems != null"
							@click="openBox(value)" :key="value.boxId">
							<lazy-component>
								<!-- <div v-if="false" class="hot" v-show="value.labelUrl">
					<img :src="value.labelUrl" alt="" />
				</div> -->
								<div class="new" v-show="index == 0">
									<img src="@/assets/romimg/home/new.png" alt="" />
								</div>
								<div class="item-pic" :style="'background-image: url(' + value.imageUrl + ');'">
									<img :src="value.weaponImageUrl" :alt="value.name" />
								</div>
								<div class="item-name">{{ value.name }}</div>
								<div class="item-price">
									<Currency :currency="value.price"></Currency>
									<span class="ori-price" v-if="Number(value.price) < Number(value.originalPrice)">{{
										value.originalPrice }}</span>
								</div>
							</lazy-component>
						</div>
					</div>
				</transition>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#home {
	.Festival {
		width: 220px;
		height: 334px;
		background-size: contain;
		position: fixed;
		left: 0;
		bottom: 10px;
		opacity: 1;
		z-index: 100;

		&.active {
			opacity: 1;
			z-index: 100;
		}
	}

	.icon-font {
		font-size: 40px;
		margin-left: 50px;
	}

	width: 100%;
	// padding: 0 20px;
	padding-bottom: 350px;
	box-sizing: border-box;
	min-height: 800px;
	// overflow: hidden;
	position: relative;
	padding-top: 0px;

	.home-list {

		// &.active {
		//	 margin-top: -76px;
		// }
		.top-active {
			display: flex;
			flex-direction: column;

			.background {
				width: 100%;
				height: calc(370px * 2);
				background: url(@/assets/romimg/activity/10.1/top-bg.png) no-repeat;
				background-size: contain;
				display: flex;
				align-items: center;
				// justify-content: center;
				flex-direction: column;
				box-sizing: border-box;

				// padding-top: 168px;
				.title-desc {
					margin-top: 40px;
					color: #fde99e;
					font-size: 28px;
					font-style: normal;
					font-weight: 700;
					text-align: center;

					line-height: 50px;
					/* 140% */
				}

				.title-big {
					padding-top: 50px;
					box-sizing: border-box;

					img {
						width: 540px;
						height: 80px;
					}

					// line-height: 50px; /* 54.783% */
				}

				.title-big-btn {
					margin-top: 60px;
					display: flex;
					font-size: 32px;
					color: #fff;
					width: 472px;
					height: 112px;
					min-width: 160px;
					font-weight: 700;
					justify-content: center;
					align-items: center;
					border-radius: 16px;
					background: #e52a2a;
				}

				.time-countdown-container {
					margin-top: 40px;
					display: flex;
					flex-direction: column;
					width: 100%;
					padding: 0 140px;
					box-sizing: border-box;
					gap: 26px;
					justify-content: center;

					.countdown-title {
						display: flex;
						width: 100%;
						height: 112px;
						background: #e52a2a;
						border-radius: 13px;
						color: #fff;
						align-items: center;
						justify-content: center;
						font-size: 32px;
						font-weight: 700;
					}

					.countdown-items {
						display: flex;
						justify-content: space-between;
					}

					.countdown-item {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						background: rgba(42, 42, 45, 0.6);
						border-radius: 13px;
						width: 88px;
						height: 88px;
						// gap: ;

						div {
							&:first-child {
								font-size: 38px;
								font-weight: 700;
								color: #fff;

								font-weight: 500;
								line-height: 45px;
							}

							&:last-child {
								font-size: 18px;
								font-weight: 400;
								color: #fff;
							}
						}
					}
				}
			}

			.act-box-list {
				display: flex;
				justify-content: center;
				flex-wrap: wrap;
				// margin-top: -100px;
				flex-direction: column;
				width: 100%;

				.act-item-container {
					padding: 0 35px;
					box-sizing: border-box;
					width: 100%;
					// height: 260px;

					.van-swipe {
						overflow: hidden !important;
						margin-top: -130px;

						.van-swipe-item {
							display: flex;
						}

						.van-swipe__indicators {
							// bottom: -8px;
							margin-top: -28px;
							height: 50px;
							display: flex;
							gap: 12px;
							align-items: center;
							position: relative;
							justify-content: center;
						}

						// .van-swipe__track
						// {
						// 	margin-top: -15px;
						// }

						.van-swipe__indicator {
							width: 14px !important;
							height: 14px !important;
							background-color: transparent;
							border: 1px solid #cccccc;
							// margin-bottom: 18px;
							// margin-top: 18px;

							// &:first-child
							// {
							// 	margin-right: 14px;
							// }

							// &:last-child
							// {
							// 	margin-left: 14px;
							// }

							.van-swipe__indicator--active {
								background: #fff;
							}
						}

						.tab-item {
							width: 340px;
							height: 448px;
							margin-bottom: 40px;
							position: relative;
							font-size: 26px;

							.hot {
								position: absolute;
								top: 80px;
								right: 36px;
								width: 100px;
								// height: 30px;
								transform: translateY(-10px);

								img {
									width: 100%;
								}
							}

							.item-pic {
								width: 340px;
								height: 340px;
								display: flex;
								justify-content: center;
								align-items: center;
								background-position: center;
								background-size: cover;
								background-repeat: no-repeat;
								z-index: 3 !important;

								img {
									width: 296px;
									height: auto;
								}
							}

							.item-price {
								display: flex;
								justify-content: center;
								align-items: center;

								.span1 {
									font-weight: 700;
								}

								.span2 {
									font-weight: 700;
								}

								.ori-price {
									color: #5E5E5E;
									font-style: normal;
									font-weight: 500;
									// line-height: 14px;
									text-decoration-line: strikethrough;
									text-transform: uppercase;
									text-decoration: line-through solid;
									padding: 0 8px;
								}
							}

							.item-name {
								color: #b4b6c8;
								text-align: center;

								font-size: 28px;
								font-style: normal;
								font-weight: 700;
								line-height: 50px;
								margin-top: 5px;
							}
						}
					}
				}
			}
		}

		.title_bg {
			width: 100%;

			.title_c {
				color: #fff;

				box-sizing: border-box;
				width: 100%;
				height: 244px;
				font-size: 36px;
				font-weight: 400;
				display: flex;
				justify-content: space-between;
				align-items: center;
				background: url(@/assets/romimg/home/heading-bg.png) no-repeat;
				background-position: 0 0;
				background-size: 288px 247px;
				padding: 0 20px;

				img {
					width: 60px;
					height: 60px;
					margin-left: 10px;
				}
			}

			height: 244px;
			background: linear-gradient(180deg, #101120 0%, #121323 100%);
		}

		.spring-title {
			width: 392px;
			height: 125px;
			margin: 20px auto;
			background: url(@/assets/romimg/spring/title_bg.png) no-repeat center;
			background-size: 100% 100%;
			line-height: 150px;
			text-align: center;
			color: #fff;

			font-size: 50px;
			-webkit-text-stroke: 2px #152921;
		}

		.tab-list {
			&.active {
				margin-top: -90px;
			}

			margin-left: 35px;
			margin-right: 35px;
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			width: 680px;

			.tab-item {
				width: 340px;
				height: 448px;
				margin-bottom: 40px;
				position: relative;
				font-size: 26px;

				.hot {
					position: absolute;
					top: 0px;
					right: 36px;
					width: 51px;
					height: 99px;
					transform: translateY(-10px);

					img {
						width: 100%;
					}
				}

				.new {
					position: absolute;
					top: 30px;
					right: 10px;
					// width: 150px;
					// padding: 12px 16px;
					color: #fff;
					font-size: 24px;
					font-style: normal;
					font-weight: 700;
					line-height: normal;

					img {
						width: 135px;
						height: 62px;
					}

					// border-radius: 130px;
					// border: 2px solid rgba(249, 163, 40);
					// background: rgba(42, 42, 45, 0.6);
				}

				.item-pic {
					width: 340px;
					height: 340px;
					display: flex;
					justify-content: center;
					align-items: center;
					background-position: center;
					background-size: cover;
					background-repeat: no-repeat;
					z-index: 3 !important;

					img {
						width: 296px;
						height: auto;
					}
				}

				.item-price {
					display: flex;
					justify-content: center;
					align-items: center;

					.span1 {
						font-weight: 700;
					}

					.span2 {
						font-weight: 700;
					}

					.ori-price {
						color: #5E5E5E;
						font-style: normal;
						font-weight: 500;
						// line-height: 14px;
						text-decoration-line: strikethrough;
						text-transform: uppercase;
						text-decoration: line-through solid;
						padding: 0 8px;
					}
				}

				.item-name {
					color: #b4b6c8;
					text-align: center;

					font-size: 28px;
					font-style: normal;
					font-weight: 700;
					line-height: 50px;
					margin-top: 5px;
				}
			}
		}
	}
}

.balloon {
	position: absolute;
	width: 140px;
	height: 140px;
	left: -15px;
	top: 52px;
	z-index: 2px !important;

	img {
		width: 100%;
		height: 100%;
	}
}
</style>
