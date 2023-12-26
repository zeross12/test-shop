<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "@vue/reactivity";
import { useRouter } from "vue-router";
import { getGeneralList } from "@/network/api/blind";
import { nextTick, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { playAudio, stopAudio, timeCountdown } from "@/util/common";
import audioshoot from "@/assets/audio/shoot.mp3";
import Price from "@/components/pc/common/Price.vue";
import Fire from "@/util/fire";

import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/scss/autoplay";
import "swiper/scss/pagination";

import actImg from "@/assets/pcimg/home/activity.png";
import actImg2 from "@/assets/pcimg/home/activity-2.png";
import actImg3 from "@/assets/pcimg/home/activity-3.png";
import { re } from "mathjs"

const modules = [Autoplay, Pagination];

const store = useStore();
const router = useRouter();

const homoBox = ref([]);
let animationRandom = ref(Math.floor(Math.random() * 100)); // 随机数
const node = ref(0);
let shootaudio = new Audio(audioshoot);

const sections = ref(0); /// 可用模块长度

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

const fire = ref(null);

const rewardShow = ref({
	show: false,
	classs: ["reward", "reward2", "reward3"],
	index: 0,
});
const ani = ref(false);

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

function setRandom() {
	animationRandom.value = Math.floor(Math.random() * 100);
}

function openBox(value) {
	router.push({
		path: "/p/openbox",
		query: {
			boxId: value.boxId,
		},
	});
}

async function getBox() {
	const res = await getGeneralList();
	if (res.code === 0) {
		let items = res.data.items;
		// for (let i = 0; i < items.length; i++) {
		//	 let boxItems = items[i].boxItems;
		//	 if (boxItems && boxItems.length > 0) {
		//		 boxItems.sort((a, b) => a.sort - b.sort);
		//	 }
		// }
		debugger
		homoBox.value = items;
		activity.value = homoBox.value[5];
		// window.$dev && console.log( activity.value )
		store.commit("setSectionModule", items);
	}
}

function enterFun(index) {
	setRandom();
	node.value = index;
	// playAudio(shootaudio);
}
function leaveFun(index) {
	node.value = 0;
}

onMounted(async () => {
	if (overtime.value - new Date().getTime() / 1000 > 0) {
		getOverTime();
		timerId.value = setInterval(countdown, 1000);
	}
	await getBox();
});

onUnmounted(() => {
	clearInterval(timerId.value);
	stopAudio(shootaudio);
});

const banner = ref([
	{
		image: actImg,
		type: "page",
		path: "/p/activity",
	},
	{
		image: actImg2,
		type: "dialog",
		path: null,
	},
]);

async function open(item) {
	switch (item.type) {
		case "dialog":
			rewardShow.value.show = true;
			setTimeout(() => (ani.value = true), 300);

			await nextTick();
			fire.value = new Fire("#fire-container", {
				left: -200,
				top: 0,
				height: 700,
			});
			fire.value.run();
			break;

		case "page":
			router.push(item.path);
			break;
	}
}

function closeRewardDialog() {
	rewardShow.value.show = false;
	ani.value = false;
}
function rewardWindowLeft() {
	rewardShow.value.index = rewardShow.value.index - 1;
}
function rewardWindowRight() {
	rewardShow.value.index = rewardShow.value.index + 1;
}
</script>

<template>
	<div class="pc-home-list-wrapper">


		<div id="pc-home-list-wrap" v-if="store.state.moduleBlindBox">
			<div class="pc-home-list" id="act" v-if="false">
				<div class="pc-top-active">
					<div class="background">
						<div class="time-countdown-container">
							<div class="countdown-title">{{ t('home.limitTimeActivity') }}</div>
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

						<div>
							<div class="act-box-list">
								<div class="pc-tab-item" v-for="value in activity.boxItems" @click="openBox(value)"
									:key="value.boxId" @mouseenter="enterFun(value.boxId)"
									@mouseleave="leaveFun(value.boxId)">
									<lazy-component>
										<div class="animation-wrap" :class="{ active: node == value.boxId }">
											<img src="@/assets/pcimg/home/box_active_bg.png" alt="" />
										</div>
										<div class="pc-hot" v-show="value.labelUrl">
											<img :src="value.labelUrl" alt="" />
										</div>
										<div class="pc-item-pic" :style="'background-image: url(' + value.imageUrl + ');'">
											<img :src="value.weaponImageUrl" :alt="value.name" />
										</div>
										<div class="pc-item-name">{{ value.name }}</div>
										<div class="pc-item-price">
											{{ node == value.boxId ? "Open for " : ""
											}}<img src="@/assets/pcimg/common/coin.svg" alt="" />
											<Price :value="value.price"></Price>
										</div>
									</lazy-component>
								</div>
							</div>
							<div class="active-title">{{ t('home.activityContent') }}</div>
							<div class="active-title-sub">{{ t('home.activityText') }}</div>
						</div>
					</div>
					<div class="active-img">
						<!-- <img @click="router.push( '/p/activity' )" src="@/assets/pcimg/home/activity.png"> -->
						<swiper :pagination="{ clickable: true }" :modules="modules" :autoplay="{ delay: 3000 }"
							:loop="true">
							<swiper-slide v-for="(item, index) in banner" :key="index">
								<img :src="item.image" alt="" @click="open(item)" />
							</swiper-slide>
						</swiper>
					</div>
				</div>
			</div>
			<div class="pc-home-list" v-for="(item, index) in homoBox" :key="index" :id="`section-${index}`">
				<div v-if="index !== 0 && item.boxItems && item.boxItems.length > 0" class="separate"
					style="margin-bottom: 40px;" />
				<div class="bg" v-if="index != 5 && item.boxItems && item.boxItems.length > 0">
					<div class="box-title" :class="{ 'hasBg': index === 0 }"
						v-if="item.boxItems && item.boxItems.length > 0">

						<svg v-if="index === 0" xmlns="http://www.w3.org/2000/svg" width="41" height="40"
							viewBox="0 0 41 40" fill="none">
							<path
								d="M29.9329 18.6667C29.5496 18.1667 29.0829 17.7333 28.6496 17.3C27.5329 16.3 26.2663 15.5833 25.1996 14.5333C22.7163 12.1 22.1663 8.08333 23.7496 5C22.1663 5.38333 20.7829 6.25 19.5996 7.2C15.2829 10.6667 13.5829 16.7833 15.6163 22.0333C15.6829 22.2 15.7496 22.3667 15.7496 22.5833C15.7496 22.95 15.4996 23.2833 15.1663 23.4167C14.7829 23.5833 14.3829 23.4833 14.0663 23.2167C13.9711 23.138 13.8919 23.0418 13.8329 22.9333C11.9496 20.55 11.6496 17.1333 12.9163 14.4C10.1329 16.6667 8.61626 20.5 8.83293 24.1167C8.93293 24.95 9.03293 25.7833 9.31626 26.6167C9.54959 27.6167 9.99959 28.6167 10.4996 29.5C12.2996 32.3833 15.4163 34.45 18.7663 34.8667C22.3329 35.3167 26.1496 34.6667 28.8829 32.2C31.9329 29.4333 32.9996 25 31.4329 21.2L31.2163 20.7667C30.8663 20 29.9329 18.6667 29.9329 18.6667ZM24.6663 29.1667C24.1996 29.5667 23.4329 30 22.8329 30.1667C20.9663 30.8333 19.0996 29.9 17.9996 28.8C19.9829 28.3333 21.1663 26.8667 21.5163 25.3833C21.7996 24.05 21.2663 22.95 21.0496 21.6667C20.8496 20.4333 20.8829 19.3833 21.3329 18.2333C21.6496 18.8667 21.9829 19.5 22.3829 20C23.6663 21.6667 25.6829 22.4 26.1163 24.6667C26.1829 24.9 26.2163 25.1333 26.2163 25.3833C26.2663 26.75 25.6663 28.25 24.6663 29.1667Z"
								fill="url(#paint0_linear_211_3866)" />
							<defs>
								<linearGradient id="paint0_linear_211_3866" x1="20.4813" y1="5" x2="20.4813" y2="34.9991"
									gradientUnits="userSpaceOnUse">
									<stop stop-color="#FF0000" />
									<stop offset="1" stop-color="#FF8A00" />
								</linearGradient>
							</defs>
						</svg>
						<span>

							{{ item.name }}
						</span>
						<svg v-if="index === 0" xmlns="http://www.w3.org/2000/svg" width="41" height="40"
							viewBox="0 0 41 40" fill="none">
							<path
								d="M29.9329 18.6667C29.5496 18.1667 29.0829 17.7333 28.6496 17.3C27.5329 16.3 26.2663 15.5833 25.1996 14.5333C22.7163 12.1 22.1663 8.08333 23.7496 5C22.1663 5.38333 20.7829 6.25 19.5996 7.2C15.2829 10.6667 13.5829 16.7833 15.6163 22.0333C15.6829 22.2 15.7496 22.3667 15.7496 22.5833C15.7496 22.95 15.4996 23.2833 15.1663 23.4167C14.7829 23.5833 14.3829 23.4833 14.0663 23.2167C13.9711 23.138 13.8919 23.0418 13.8329 22.9333C11.9496 20.55 11.6496 17.1333 12.9163 14.4C10.1329 16.6667 8.61626 20.5 8.83293 24.1167C8.93293 24.95 9.03293 25.7833 9.31626 26.6167C9.54959 27.6167 9.99959 28.6167 10.4996 29.5C12.2996 32.3833 15.4163 34.45 18.7663 34.8667C22.3329 35.3167 26.1496 34.6667 28.8829 32.2C31.9329 29.4333 32.9996 25 31.4329 21.2L31.2163 20.7667C30.8663 20 29.9329 18.6667 29.9329 18.6667ZM24.6663 29.1667C24.1996 29.5667 23.4329 30 22.8329 30.1667C20.9663 30.8333 19.0996 29.9 17.9996 28.8C19.9829 28.3333 21.1663 26.8667 21.5163 25.3833C21.7996 24.05 21.2663 22.95 21.0496 21.6667C20.8496 20.4333 20.8829 19.3833 21.3329 18.2333C21.6496 18.8667 21.9829 19.5 22.3829 20C23.6663 21.6667 25.6829 22.4 26.1163 24.6667C26.1829 24.9 26.2163 25.1333 26.2163 25.3833C26.2663 26.75 25.6663 28.25 24.6663 29.1667Z"
								fill="url(#paint0_linear_211_3866)" />
							<defs>
								<linearGradient id="paint0_linear_211_3866" x1="20.4813" y1="5" x2="20.4813" y2="34.9991"
									gradientUnits="userSpaceOnUse">
									<stop stop-color="#FF0000" />
									<stop offset="1" stop-color="#FF8A00" />
								</linearGradient>
							</defs>
						</svg>
					</div>
					<p class="box-subtitle">
						Wipe the snow off the new winter cases and find your favorite skin
					</p>
				</div>
				<div class="pc-tab-list" v-if="item.boxItems && item.boxItems.length > 0 && item.subType != 6">
					<div class="pc-tab-item" v-for="value in item.boxItems" @click="openBox(value)" :key="value.boxId"
						@mouseenter="enterFun(value.boxId)" @mouseleave="leaveFun(value.boxId)">
						<!-- <div class="animation-wrap" :class="{ active: node == value.boxId }">
							<img src="@/assets/pcimg/home/box_active_bg.png" alt="" />
						</div> -->
						<!-- <div class="pc-hot" v-show="value.labelUrl"> -->
						<div class="pc-hot" v-show="item.subType == 8">
							<img src="@/assets/pcimg/home/hot.png" alt="" />
						</div>
						<div class="pc-item-pic" :style="'background-image: url(' + value.imageUrl + ');'">
							<img class="pc-item-mainpic" :src="value.weaponImageUrl" :alt="value.name" />
						</div>
						<div class="pc-item-name">{{ value.name }}</div>
						<button class="pc-item-price button--secondary">
							<!-- {{ node == value.boxId ? "Open for" : "" }} -->
							<!-- {{ value.price }} -->
							<img src="@/assets/pcimg/common/coin.svg" />
							<Price :value="value.price"></Price>
							<span v-if="Number(value.price) < Number(value.originalPrice)">{{ value.originalPrice }}</span>
						</button>
					</div>
				</div>
			</div>
			<van-overlay style="background: rgba(0, 0, 0, 0.7)" z-index="200" :show="rewardShow.show">
				<div class="pc-flower" :class="{ ani: ani }"></div>
				<div :class="{
					reward1: rewardShow.classs[rewardShow.index] == 'reward',
					reward2: rewardShow.classs[rewardShow.index] == 'reward2',
					reward3: rewardShow.classs[rewardShow.index] == 'reward3',
				}" class="pc-reward-container" id="fire-container">
					<div class="close" @click="closeRewardDialog"></div>
					<div class="left">
						<img v-if="rewardShow.index > 0" @click="rewardWindowLeft"
							src="@/assets/romimg/activity/10.1/allow_left.png" alt="" style="cursor: pointer" />
						<img style="transform: rotate(180deg)" v-else src="@/assets/romimg/activity/10.1/allow_right.png"
							alt="" />
					</div>
					<div class="right">
						<img v-if="rewardShow.index < rewardShow.classs.length - 1" @click="rewardWindowRight"
							style="transform: rotate(180deg); cursor: pointer"
							src="@/assets/romimg/activity/10.1/allow_left.png" alt="" />
						<img v-else src="@/assets/romimg/activity/10.1/allow_right.png" alt="" />
					</div>
				</div>
			</van-overlay>
		</div>
	</div>
</template>
<style lang="scss">
.pc-flower {
	width: 430px;
	height: 400px;
	position: absolute;
	top: calc(50% - 650px / 2);
	left: calc(50% - 430px / 2);
	z-index: 199;
	background: url(@/assets/pcimg/activity/flower.png) no-repeat;
	background-position: center top;
	background-size: contain;

	&.ani {
		transition: 1s;
		transform: scale(1.4);
	}
}

.pc-reward-container {
	&.reward1 {
		background: url(@/assets/pcimg/activity/reward.png) no-repeat;
		background-size: contain;
	}

	&.reward2 {
		background: url(@/assets/pcimg/activity/reward2.png) no-repeat;
		background-size: contain;
	}

	&.reward3 {
		background: url(@/assets/pcimg/activity/reward3.png) no-repeat;
		background-size: contain;
	}

	// background: url(@/assets/pcimg/activity/reward.png) no-repeat;
	// background-size: contain;
	width: 430px;
	height: 700px;
	position: fixed;
	top: calc(50% - 700px / 2);
	left: calc(50% - 430px / 2);
	z-index: 300;

	.close {
		// border: 1px solid red;
		height: 34px;
		width: 34px;
		right: 0px;
		top: 0;
		position: absolute;
		cursor: pointer;
	}

	.left {
		width: 60px;
		height: 60px;
		// border: 1px solid red;
		left: -70px;
		top: 320px;
		position: absolute;

		img {
			width: 60px;
			height: 60px;
		}

		// background-color: #78081d;
	}

	.right {
		width: 60px;
		height: 60px;
		// border: 1px solid red;
		// background-color: #78081d;
		right: -70px;
		top: 320px;
		position: absolute;

		img {
			width: 60px;
			height: 60px;
		}
	}
}

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
</style>
<style lang="scss" scoped>
.pc-home-list-wrapper {
	position: relative;
	width: 100%;
}



#pc-home-list-wrap {
	// box-sizing: border-box;
	// max-width: 1440px;
	max-width: 1120px;
	margin: 0 auto;
	min-height: 500px;
	// background-color: #15172c;
	margin-top: 18px;
	padding: 0 16px;

	.pc-home-list {
		margin-top: 40px;
		// &:first-child {
		// 	margin-top: 0 !important;

		// 	.pc-tab-list {
		// 	}
		// }



		.pc-top-active {
			width: 100%;
			// height: calc(653px + 200px);
			// margin-top: -84px;

			.active-img {
				width: 1320px;
				margin: auto;

				.swiper {
					overflow-y: visible !important;
				}
			}

			.background {
				width: 100%;
				height: 653px;
				background: url(@/assets/pcimg/activity/top-bg.png) no-repeat;
				display: flex;
				// flex-direction: column;
				padding: 100px 43px 64px 43px;
				box-sizing: border-box;
				justify-content: space-between;
				margin-bottom: 15px;

				.time-countdown-container {
					display: flex;
					gap: 6px;
					padding-top: 70px;

					.countdown-title {
						display: flex;
						width: 188px;
						height: 88px;
						background: #e52a2a;
						border-radius: 13px;
						color: #fff;
						align-items: center;
						justify-content: center;
						font-size: 28px;

						font-weight: 700;
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

				.act-box-list {
					display: flex;

					.pc-tab-item {
						width: 260px;
						height: 318px;
						position: relative;
						display: flex;
						justify-content: center;
						align-items: center;
						flex-direction: column;
						cursor: pointer;

						// margin: 11px 11px 50px 11px;


						.animation-wrap {
							position: absolute;
							bottom: 0px;
							left: 50%;
							bottom: -40px;
							transform: translateX(-50%);

							img {
								width: 94px;
								height: 115px;
								z-index: 0;
								// opacity: 0;
								scale: (1);
								transition: all 0.3s;
							}

							span {
								opacity: 0; //透明度设置
							}
						}

						.pc-hot {
							position: absolute;
							top: 36px;
							right: 16px;
							width: 76px;
							height: 32px;
							transform: translateY(-10px);
							z-index: 100;

							img {
								width: 100%;
							}
						}

						.pc-item-pic {
							width: 260px;
							height: 260px;
							display: flex;
							justify-content: center;
							align-items: center;
							background-position: center;
							background-size: contain;
							background-repeat: no-repeat;
							z-index: 3 !important;
							position: relative;
							transition: 0.5s;

							&:hover {
								transform: scale(1.1);
								transition: all 0.3s ease-in-out;
							}

							img {
								max-width: 80%;
								margin-top: -30px;
								transition: all 0.3s;
							}
						}



						.pc-item-name {
							color: #b4b6c8;
							font-size: 16px;
							font-weight: 500;
							line-height: 16px;
							text-align: center;
							position: relative;
							margin-top: 13px;
						}

						&:hover {
							.animation-wrap.active {
								img {
									opacity: scale(1);
									transition: all 0.3s;
								}
							}

							.pc-item-pic {
								img {
									transform-origin: left;
									transform: rotate(-5deg);
								}
							}
						}
					}
				}

				.active-title {
					color: #fff152;
					text-align: center;
					font-size: 76px;
					font-style: normal;
					font-weight: 700;
					line-height: normal;
					margin-top: 40px;
				}

				.active-title-sub {
					color: #fff;
					text-align: center;
					margin-top: 10px;
					font-size: 40px;
					font-style: normal;
					font-weight: 700;
					line-height: normal;
				}
			}
		}

		.bg {
			// height: 178px;
			// max-width: 1440px;
			// background: linear-gradient(180deg, #101120 0%, #121323 100%);

			.box-title {
				// height: 80px;
				// line-height: 100%;
				font-size: 40px;
				font-weight: 700;
				text-align: center;
				letter-spacing: 4px;
				color: #fff;
				display: flex;
				justify-content: center;
				align-items: center;
				gap: 8px;

				&.hasBg {
					background: url(@/assets/pcimg/common/bg-fire.png) no-repeat center;
				}
			}

			.box-subtitle {
				color: #727391;
				font-size: 16px;
				font-weight: 700;
				text-transform: uppercase;
				margin-top: 12px;
				text-align: center;
			}
		}

		.pc-tab-list {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			// display: grid;
			// grid-template-columns: repeat(4, 1fr);
			gap: 32px;
			margin-top: 38px;

			.pc-tab-item {
				width: 100%;
				// height: 318px;
				flex: 0 1 calc(25% - 32px);
				position: relative;
				display: flex;
				justify-content: center;
				align-items: center;
				flex-direction: column;
				cursor: pointer;
				// width: 25%;

				// margin: 11px 0px 50px 0px;

				&::after {
					content: "";
					background-image: url(@/assets/pcimg/common/bg-card.png);
					background-repeat: no-repeat;
					background-position: center;
					background-size: 100% 100%;
					position: absolute;
					inset: 0;
					z-index: 0;
					opacity: 0;
					backdrop-filter: blur(60px);
					transition: .3s all;
				}

				.animation-wrap {
					position: absolute;
					bottom: 0px;
					left: 50%;
					bottom: -40px;
					transform: translateX(-50%);

					img {
						scale: (0);
						width: 94px;
						height: 115px;
						z-index: 0;
						// opacity: 0;
						transition: all 0.3s;
					}
				}

				.pc-hot {
					position: absolute;
					top: 48px;
					right: 16px;
					width: 68px;
					height: 32px;
					transform: translateY(-10px);
					z-index: 10;

					img {
						width: 100%;
					}
				}

				.pc-item-mainpic {
					width: 100%;
					transition: .3s all;
					transform: scale(1);
				}

				.pc-item-pic {
					width: 100%;
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					background-position: center;
					background-size: contain;
					background-repeat: no-repeat;
					z-index: 3 !important;
					position: relative;
					z-index: 1;
					transition: 0.3s all;
					padding: 8px;

					transform: scale(0.8);
					// pointer-events: none;



					// img {
					// 	max-width: 80%;
					// 	margin-top: -30px;
					// 	transition: all 0.3s;
					// }
				}

				.pc-item-price {
					display: flex;
					justify-content: center;
					align-items: center;
					position: relative;
					font-size: 16px;
					font-weight: 500;
					// margin-top: 15px;
					margin: 16px auto 20px;
					transition: .3s all;
					z-index: 1;

					span {
						color: #5E5E5E;
						font-size: 16px;
						font-style: normal;
						font-weight: 500;
						line-height: 14px;
						text-decoration-line: strikethrough;
						text-transform: uppercase;
						text-decoration: line-through solid;
						padding: 0 8px;
					}

					img {
						width: 16px;
						height: 16px;
						margin-right: 3px;
						margin-left: 7px;
					}

					@media screen and (max-width: 768px) {
						padding-left: 0px;
						padding-right: 0px;
					}
				}

				.pc-item-name {
					color: #fff;
					font-size: 18px;
					font-weight: 500;
					line-height: 26px;
					text-align: center;
					position: relative;
					margin-top: 13px;
					z-index: 1;
				}

				&:hover {
					&::after {
						opacity: 1;
					}

					.pc-item-mainpic {
						transform: scale(1);
					}

					.pc-item-price {
						background: #FFE063;
						color: #151515;

						img {
							scale: (1.2);
						}


					}

					//.animation-wrap.active {
					//img {
					// opacity: 1;
					//	scale: (1);
					//transition: all 0.3s;
					//}
					//}

					.pc-item-pic {

						transform: scale(1);
						transition: all 0.3s;

						// img {
						// 	transition: all 0.3s;
						// 	transform-origin: left;
						// 	transform: rotate(-5deg);
						// }
					}

					// .pc-item-price {
					// 	span {
					// 		position: absolute;
					// 		/* 使用绝对定位 */
					// 		opacity: 0; //透明度设置
					// 	}
					// }
				}
			}
		}
	}

	.pc-home-list:first-child {
		margin-top: 60px;
	}

	@media screen and (max-width: 768px) {
		margin-top: 0;

		.pc-home-list {
			&:first-child {
				margin-top: 25px;
			}

			.pc-tab-list {
				gap: 8px;

				.pc-tab-item {
					flex: 0 1 calc(50% - 8px)
				}

				.pc-item-pic {
					width: 100%;
				}
			}

			.box-title {
				font-size: 24px !important;
			}

			.box-subtitle {
				font-size: 14px !important;
			}
		}
	}
}
</style>
