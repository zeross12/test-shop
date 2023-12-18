<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Autoplay, Navigation, Scrollbar } from "swiper/modules";
import "swiper/less/autoplay";
import "swiper/css/navigation";
import "swiper/swiper-bundle.css";
import { ref, onMounted } from "vue";
import { getTimingList } from "@/network/api/blind";
import { useRouter } from "vue-router";
import { getOpenBoxRecords } from "@/network/api/blind";
import { useStore } from "vuex";
import { GoodImageBgType } from "@/util/util";
import Currency from "../common/Currency.vue"
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const time = ref(1662458547723); //服务器时间
let $emit = defineEmits(["selectIndexChanged"]);
const timingList = ref([]);
const swiperModules = [Autoplay, Pagination, Scrollbar];
const router = useRouter();
const store = useStore();
let words = ref(	[ t( 'timebox.everyHour' ), t( 'timebox.everyDay' ), t( 'timebox.everyWeek' ) ]);

const onSlideChange = (swiper) => {
	// swiper是当前轮播的对象，里面可以获取到当前swiper的所有信息，当前索引是activeIndex
	window.$dev && console.log(swiper.activeIndex);
};

async function getTimingData() {
	const res = await getTimingList();
	if (res.code === 0) {
		let items = res.data.items || [];
		timingList.value = items;
		// showTab.value = items.length > 3;
		time.value = res.data.serverTime * 1000;
	}
}

function onClickItem(index) {
	router.push("/m/timebox");
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.record, item.goodsLevel);
}
onMounted(() => {
	getTimingData();
});

//倒计时过滤
function TimeFilter(v) {
	if (v == 1) {
		//处理小时
		//当时服务器时间戳
		let Time = time.value;
		//加上一小时的时间戳
		let endTime = Time + 3600000;
		//分解
		let date = new Date(endTime);
		let yy = date.getFullYear();
		let mm = date.getMonth() + 1;
		let dd = date.getDate();
		let hh = date.getHours();
		//分秒置为0
		let dateTime =
			yy + "/" + mm + "/" + dd + " " + hh + ":" + "00" + ":" + "00";
		//相减并返回
		return new Date(dateTime).getTime() - Time;
	} else if (v == 2) {
		//处理天
		//当前服务器时间戳
		let Time = time.value;
		//转时间
		let date = new Date(Time);
		//天+1
		let endtime = date.setDate(date.getDate() + 1);
		//转时间
		let endDate = new Date(endtime);
		//分解
		let yy = endDate.getFullYear();
		let mm = endDate.getMonth() + 1;
		let dd = endDate.getDate();
		//时分秒置为0
		let dateTime =
			yy + "/" + mm + "/" + dd + " " + "00" + ":" + "00" + ":" + "00";
		//相减并返回
		return new Date(dateTime).getTime() - Time;
	} else if (v == 3) {
		//处理周
		//当前服务器时间戳
		let Time = time.value;
		//转时间
		let date = new Date(Time);
		//当前星期x
		let Day = date.getDay();
		//距离本周日差(7为0反之正常)
		let difference = 0 - Day + 7 == 7 ? 0 : 0 - Day + 7;
		//当前时间+距离本周日差+1(隔日0点)
		let endtime = date.setDate(date.getDate() + difference + 1);
		//转时间
		let endDate = new Date(endtime);
		//分解
		let yy = endDate.getFullYear();
		let mm = endDate.getMonth() + 1;
		let dd = endDate.getDate();
		//时分秒置为0
		let dateTime =
			yy + "/" + mm + "/" + dd + " " + "00" + ":" + "00" + ":" + "00";
		//相减并返回
		return new Date(dateTime).getTime() - Time;
	}
}
</script>

<template>
	<div id="TimeBoxSwiper">
		<swiper
			class="swiper-container swiper-wrapper"
			:modules="swiperModules"
			:allowTouchMove="true"
			:pagination="{ clickable: true }"
		>
			<swiper-slide
				class="swiper-slide"
				v-for="(week, index) in timingList.filter(
					(el) => el.needLevel >= 0 && el.needLevel < 5 && el.type < 4
				)"
				:key="index"
				@click="onClickItem(index)"
			>
				<div
					class="swiper-item"
					:class="{
						hour_bg: week.type == 1,
						day_bg: week.type == 2,
						week_bg: week.type == 3,
					}"
				>
					<div class="timing-item-wp">
						<img :src="week.boxItem.weaponImageUrl" alt="" />
						<div class="time-goods-price">
							<Currency
								fontcolor="white"
								:currency="week.boxItem.price"
							></Currency>
						</div>
						<div
							class="time-goods-join week"
							v-if="week.needLevel < store.state.userInfoBase.userLevel"
						>
							{{ t( 'timebox.joined' ) }}
						</div>
						<div class="time-goods-join week" v-else>{{ t( 'timebox.noJoin' ) }}</div>
					</div>
					<div class="timing-item-info">
						<div class="time-goods-info">
							<div class="time-goods-name hide">{{ week.boxItem.name }}</div>
							<div class="time-number week">
								<span class="icon iconfont">&#xe639;</span>{{ t( 'timebox.autoJoin' ) }}
							</div>
						</div>

						<div class="count-time-wrap">
							<p v-html="t( 'timebox.rechargeText', { type : words[week.type - 1], money : week.needAmount } )"></p>
							<van-count-down :time="TimeFilter(week.type)">
								<template #default="timeData">
									<div class="item-col" v-if="timeData.days > 0">
										<div class="item-number">
											<span
												>{{
													timeData.days >= 10
														? Math.floor(timeData.days / 10)
														: 0
												}} </span
											><span> {{ timeData.days % 10 }} </span>
											<div class="dot">:</div>
										</div>
										<div class="unit">{{ t( 'timebox.days' ) }}</div>
									</div>
									<div
										class="item-col"
										v-if="!(timeData.days <= 0 && timeData.hours <= 0)"
									>
										<div class="item-number">
											<span
												>{{
													timeData.hours >= 10
														? Math.floor(timeData.hours / 10)
														: 0
												}} </span
											><span> {{ timeData.hours % 10 }} </span>
											<div class="dot">:</div>
										</div>
										<div class="unit">{{ t( 'timebox.hours' ) }}</div>
									</div>
									<div
										class="item-col"
										v-if="
											!(timeData.minutes <= 0 && timeData.hours <= 0) &&
											timeData.days == 0
										"
									>
										<div class="item-number">
											<span
												>{{
													timeData.minutes >= 10
														? Math.floor(timeData.minutes / 10)
														: 0
												}} </span
											><span> {{ timeData.minutes % 10 }} </span>
											<div class="dot">:</div>
										</div>
										<div class="unit">{{ t( 'timebox.min' ) }}</div>
									</div>
									<div
										class="item-col"
										v-if="
											!(timeData.minutes <= 0 && timeData.seconds <= 0) &&
											timeData.days == 0 &&
											timeData.hours == 0
										"
									>
										<div class="item-number">
											<span
												>{{
													timeData.seconds >= 10
														? Math.floor(timeData.seconds / 10)
														: 0
												}} </span
											><span>
												{{ timeData.seconds % 10 }}
											</span>
										</div>
										<div class="unit">{{ t( 'timebox.sec' ) }}</div>
									</div>
								</template>
							</van-count-down>
						</div>
					</div>
				</div>
			</swiper-slide>
		</swiper>
	</div>
</template>

<style lang="scss">
#TimeBoxSwiper {
	width: 750px;
	height: 436px;
	// margin: auto;
	box-sizing: border-box;
	background: #15172c;
	display: flex;
	justify-content: center;

	.swiper-container {
		box-sizing: border-box;
		width: 730px;
		height: 436px;
		// position: relative;

		.swiper-slide {
			width: 730px;
			height: 350px;

			.swiper-item {
				display: flex;
				margin-bottom: 30px;
				color: #fff;
				align-items: center;
				background-size: 730px 350px !important;
				border-radius: 16px;
				width: 730px;
				height: 350px;
				position: relative;

				&.hour_bg {
					background: url(@/assets/romimg/timebox/hour_bg.png) no-repeat;
				}
				&.day_bg {
					background: url(@/assets/romimg/timebox/day_bg.png) no-repeat;
				}
				&.week_bg {
					background: url(@/assets/romimg/timebox/week_bg.png) no-repeat;
				}
				.timing-item-info {
					//	 display: flex;
					//	 flex-direction: column;
					//	 align-items: left;
					//	 width: 330px;
					box-sizing: border-box;
					padding-left: 30px;
					height: 280px;

					.item-title {
						// margin-top: 2px;
						font-size: 36px;
						color: #ffffff;
					}

					.time-goods-info {
						width: 350px;
						.time-goods-name {
							//	 padding: 0 10px;
							width: 100%;
							overflow: hidden;
							text-align: left;
							box-sizing: border-box;
							font-size: 28px;
							color: #c8cbd8;
							font-weight: 300;
							margin-bottom: 10px;
						}
						.time-number {
							color: #c7a0d6;
							text-align: left;
							font-size: 28px;
							font-weight: 500;
							span {
								font-size: 30px;
								margin-right: 10px;
							}
							&.week {
								color: #c7a0d6;
							}
							&.day {
								color: #a0a9d6;
							}
							&.hour {
								color: #b9dee0;
							}
						}
					}

					.count-time-wrap {
						text-align: left;
						p {
							box-sizing: border-box;

							font-size: 28px;

							padding-top: 20px;
							padding-bottom: 30px;
							color: #fff;
							font-weight: 300;

							span {
								// color: #fbfa02;
							}
						}

						.van-count-down {
							display: flex !important;
							align-items: center;
							.item-col {
								display: flex;

								flex-direction: column;
								text-align: center;
								color: rgba(255, 255, 255, 0.4);
								.item-number {
									display: flex;
									height: 72px;
									align-items: center;
									line-height: 72px;
									text-align: center;
									padding-right: 8px;
									span {
										color: #c8c2d8;
										margin-right: 6px;
										width: 58px;
										height: 72px;
										font-size: 44px;
										background: rgba(101, 95, 123, 0.45);

										text-align: center;

										font-style: normal;
										font-weight: 400;
									}
									.dot {
										font-size: 52px;
									}
								}
								&:last-child {
									.dot {
										display: none;
									}
								}
								.unit {
									color: rgba(255, 255, 255, 0.4);

									font-size: 24px;
									font-style: normal;
									font-weight: 300;

									text-transform: uppercase;
									margin-right: 20px;
									margin-top: 15px;
								}
							}

							.count-bk {
								display: flex;
								align-items: center;
								justify-content: center;
								width: 40px;
								height: 40px;
								background: #01f0ff;
								border-radius: 8px;
								font-size: 26px;
								color: #000000;
								font-weight: bold;

								&.gray {
									background: #8d8d8d;
								}
							}

							.count-col {
								font-size: 24px;
								color: #8d8d8d;
								margin: 0 8px;
							}

							.count-s {
								margin-right: 0px;
							}
						}

						.count-time-text {
							position: relative;
							margin-top: 8px;
							padding-top: 12px;
							text-align: center;
							font-size: 22px;
							font-weight: bold;
							color: #fff;

							img {
								position: absolute;
								width: 306px;
								left: 22px;
								top: 0;
							}

							span {
								margin: 46px;
							}
						}
					}
				}

				.timing-item-wp {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					margin-left: 24px;
					width: 228px;
					height: 286px;
					position: relative;
					//	 background: url(@/assets/romimg/timebox/back.png) center no-repeat;
					//	 background-size: contain;

					img {
						max-width: 100%;
					}

					.time-goods-price {
						position: absolute;
						display: flex;
						justify-content: center;
						align-items: center;
						color: #fff;
						font-weight: 500;
						font-size: 24px;
						left: 0px;
						bottom: 45px;
					}
					.time-goods-join {
						position: absolute;
						display: flex;
						justify-content: center;
						align-items: center;
						color: #c7a0d6;

						font-size: 24px;
						left: 0px;
						bottom: 0px;
						width: 104px;
						height: 42px;
						border-radius: 8px;
						background: rgba(25, 28, 52, 0.7);

						font-weight: 300;
						&.week {
							color: #c7a0d6;
						}
						&.day {
							color: #a0a9d6;
						}
						&.hour {
							color: #b9dee0;
						}
					}
				}
			}
		}
		.swiper-pagination {
			height: 60px;
			display: flex;
			justify-content: center;
			align-items: center;
			.swiper-pagination-bullet-active {
				background-color: #ccc;
				width: 16px;
				height: 16px;
				border-radius: 16px;
			}
			.swiper-pagination-bullet {
				width: 16px;
				height: 16px;
				border-radius: 16px;
				border: 2px solid #ccc;
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
