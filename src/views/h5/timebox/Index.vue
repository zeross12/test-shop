<script setup>

import HeadPortrait from "@/components/h5/head/HeadPortrait.vue";
import TabsFlex from "@/components/h5/home/TabsFlex.vue";
import Tabs from "@/components/h5/home/Tabs.vue";
import { getTimingList, getBoxDropRecords } from "@/network/api/blind";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import { GoodImageBgType } from "@/util/util";
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import Currency from "@/components/h5/common/Currency.vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const store = useStore();

const hour = ref({ boxItem: {} });
const day = ref({ boxItem: {} });
const week = ref({ boxItem: {} });
const time = ref(1662458547723); //服务器时间

const recordtype = ref(1); //1小时,2每日,3每周
const recordList = ref([]); //最近掉落

const tabType = ref(1);
const timingList = ref([]);

const showTab = ref(false);

onMounted(() => {
	getTimingData();
});

async function getTimingData() {
	const res = await getTimingList();
	if (res.code === 0) {
		let items = res.data.items || [];
		timingList.value = items;

		showTab.value = items.length > 3;
		fliterBoxType();
		time.value = res.data.serverTime * 1000;
		getRecord();
	}
}

async function getRecord() {
	let boxId;
	if (recordtype.value == 1 && hour) {
		boxId = hour.value.boxItem.boxId;
	} else if (recordtype.value == 2 && day) {
		boxId = day.value.boxItem.boxId;
	} else if (recordtype.value == 3 && week) {
		boxId = week.value.boxItem.boxId;
	}
	recordList.value = [];
	if (!boxId) return;
	const res = await getBoxDropRecords({ boxId: boxId, limit: 10 });
	if (res.code === 0) {
		let items = res.data.items || [];
		recordList.value = items;
	}
}

function fliterBoxType() {
	hour.value = { boxItem: {} };
	day.value = { boxItem: {} };
	week.value = { boxItem: {} };
	let minLevel = 0;
	let maxLevel = 0;
	if (tabType.value == 1) {
		minLevel = 0;
		maxLevel = 5;
	} else if (tabType.value == 2) {
		minLevel = 5;
		maxLevel = 10;
	} else if (tabType.value == 3) {
		minLevel = 10;
		maxLevel = 15;
	}
	for (let index = 0; index < timingList.value.length; index++) {
		const item = timingList.value[index];
		if (item.needLevel >= minLevel && item.needLevel < maxLevel) {
			if (item.type == 1) {
				hour.value = item;
			} else if (item.type == 2) {
				day.value = item;
			} else if (item.type == 3) {
				week.value = item;
			}
		}
	}
	window.$dev && console.log(" timingList.value", timingList.value);
	getRecord();
}

function getImageBg(item) {
	return store.getters.getGoodsBgImage(GoodImageBgType.box, item.goodsLevel);
}

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

//倒计时结束重新触发
function finish() {
	getTimingData();
}

function setRecord(str) {
	recordtype.value = str;
	getRecord();
}

function onClickHelp() {
	let data = {
		show: true,
		html: t('timebox.rule'),
	};
	store.commit("setHowPlay", data);
}

function onClickTab(index) {
	tabType.value = index;
	fliterBoxType();
}
let tabsItems = ref([t('timebox.dropByHours'), t('timebox.dropByDays'), t('timebox.dropByWeek')]);
function tabFlexChangedEvent(event) {
	setRecord(event + 1);
}

function tabChangedEvent(event) {
	tabType.value = event + 1;
	fliterBoxType();
}
</script>

<template>
	<div id="timingbox" class="min-wrap-height">
		<TopTitleBack :title="t('router.timebox')"></TopTitleBack>
		<Tabs
			:items="[t('timebox.defaultBox'), t('timebox.vip5Box'), t('timebox.vip10Box')]"
			@tabChangedEvent="tabChangedEvent"
		></Tabs>
		<div class="timing-content">
			<div class="time_list">
				<div class="timing-item week-bg" v-if="week.type">
					<div class="timing-item-wp">
						<img :src="week.boxItem.weaponImageUrl" alt="" />
						<div class="time-goods-price">
							<!-- ${{ week.boxItem.price }} -->
							<Currency
								fontcolor="white"
								:currency="week.boxItem.price"
							></Currency>
						</div>
						<div class="time-goods-join week" v-if="week.isJoined">{{ t('tinmebox.joined') }}</div>
						<div class="time-goods-join week" v-if="!week.isJoined">{{ t('timebox.noJoin') }}</div>
					</div>
					<div class="timing-item-info">
						<!-- <div class="item-title">每周福利</div> -->
						<div class="time-goods-info">
							<div class="time-goods-name hide">{{ week.boxItem.name }}</div>
							<div class="time-number week">
								<span class="icon iconfont">&#xe639;</span>{{ t('timebox.autoJoin') }}
							</div>
						</div>

						<div class="count-time-wrap">
							<p v-html="t( 'timebox.rechargeText', { type : t( 'timebox.everyWeek' ), money : week.needAmount } )"></p>
							<van-count-down :time="TimeFilter(3)">
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
										<div class="unit">{{ t('timebox.days') }}</div>
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
										<div class="unit">{{ t('timebox.hours') }}</div>
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
										<div class="unit">{{ t('timebox.min') }}</div>
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
										<div class="unit">{{ t('timebox.sec') }}</div>
									</div>

									<!-- <span
										class="count-bk"
										:class="{ gray: timeData.days <= 0 }"
										>{{
											timeData.days >= 10 ? timeData.days : "0" + timeData.days
										}}</span
									>
									<span class="count-col">天</span>
									<span
										class="count-bk"
										:class="{ gray: timeData.days <= 0 && timeData.hours <= 0 }"
										>{{
											timeData.hours >= 10
												? timeData.hours
												: "0" + timeData.hours
										}}</span
									>
									<span class="count-col">时</span>
									<span
										class="count-bk"
										:class="{
											gray:
												timeData.days <= 0 &&
												timeData.hours <= 0 &&
												timeData.minutes <= 0,
										}"
										>{{
											timeData.minutes >= 10
												? timeData.minutes
												: "0" + timeData.minutes
										}}</span
									>
									<span class="count-col">分</span>
									<span class="count-bk">{{
										timeData.seconds >= 10
											? timeData.seconds
											: "0" + timeData.seconds
									}}</span>
									<span class="count-col count-s">秒</span> -->
								</template>
							</van-count-down>
						</div>
					</div>
				</div>

				<div class="timing-item day-bg" v-if="day.type">
					<div class="timing-item-wp">
						<img :src="day.boxItem.weaponImageUrl" alt="" />
						<div class="time-goods-price">
							<!-- ${{ day.boxItem.price }} -->

							<Currency
								fontcolor="white"
								:currency="day.boxItem.price"
							></Currency>
						</div>
						<div class="time-goods-join day" v-if="day.isJoined">{{ t('timebox.joined') }}</div>
						<div class="time-goods-join day" v-if="!day.isJoined">{{ t('timebox.noJoin') }}</div>
					</div>
					<div class="timing-item-info">
						<!-- <div class="item-title">每日福利</div> -->
						<div class="time-goods-info">
							<div class="time-goods-name hide">{{ day.boxItem.name }}</div>
							<div class="time-number day">
								<span class="icon iconfont">&#xe639;</span>{{ t('timebox.autoJoin') }}
							</div>
						</div>
						<div class="count-time-wrap">
							<p v-html="t( 'timebox.rechargeText', { type : t( 'timebox.everyDay' ), money : day.needAmount } )"></p>
							<van-count-down :time="TimeFilter(2)">
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
										<div class="unit">{{ t('timebox.days') }}</div>
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
										<div class="unit">{{ t('timebox.hours') }}</div>
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
										<div class="unit">{{ t('timebox.min') }}</div>
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
										<div class="unit">{{ t('timebox.sec') }}</div>
									</div>
								</template>
							</van-count-down>
						</div>
					</div>
				</div>

				<div class="timing-item hour-bg" v-if="hour.type">
					<div class="timing-item-wp">
						<img :src="hour.boxItem.weaponImageUrl" alt="" />
						<div class="time-goods-price">
							<!-- ${{ hour.boxItem.price }} -->

							<Currency
								fontcolor="white"
								:currency="hour.boxItem.price"
							></Currency>
						</div>
						<div class="time-goods-join hour" v-if="hour.isJoined">{{ t('timebox.joined') }}</div>
						<div class="time-goods-join hour" v-if="!hour.isJoined">{{ t('timebox.noJoin') }}</div>
					</div>
					<div class="timing-item-info">
						<!-- <div class="item-title">每小时福利</div> -->
						<div class="time-goods-info">
							<div class="time-goods-name hide">{{ hour.boxItem.name }}</div>
							<div class="time-number hour">
								<span class="icon iconfont">&#xe639;</span>{{ t('timebox.autoJoin') }}
							</div>
						</div>

						<div class="count-time-wrap">
							<p v-html="t( 'timebox.rechargeText', { type : t( 'timebox.everyDay' ), money : hour.needAmount } )"></p>
							<van-count-down :time="TimeFilter(1)" @finish="finish">
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
										<div class="unit">{{ t('timebox.days') }}</div>
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
										<div class="unit">{{ t('timebox.hours') }}</div>
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
										<div class="unit">{{ t('timebox.min') }}</div>
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
										<div class="unit">{{ t('timebox.sec') }}</div>
									</div>
								</template>
							</van-count-down>
						</div>
					</div>
				</div>
			</div>
		</div>
		<TabsFlex
			:items="tabsItems"
			:fontsize="14"
			:full="true"
			:itemWidth="108"
			:itemHeight="34"
			@tabFlexChangedEvent="tabFlexChangedEvent"
		></TabsFlex>

		<div class="drop-list">
			<div
				class="drop-item"
				v-for="(item, index) in recordList"
				:key="index"
				:style="'background-image: url(' + getImageBg(item) + ');'"
			>
				<div class="price">
					<!-- <Currency :currency="item.price"></Currency> -->
				</div>
				<div class="pic">
					<img :src="item.iconUrl" :alt="item.goodsName" />
				</div>
				<div class="bottom">
					<p>
						<HeadPortrait :userModel="item" :size="'timing'"></HeadPortrait>
					</p>
					<div class="right">
						<div style="display: flex">
							<Currency :currency="item.price"></Currency>
						</div>
						<p class="hide">{{ item.nickName }}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#timingbox {
	box-sizing: border-box;
	text-align: right;
	padding-bottom: 20px;
	// padding-top: 40px;

	.introduce {
		display: inline-block;
		position: relative;
		text-align: right;
		width: 100px;
		height: 48px;
		margin-top: 20px;
		color: #fbfa02;
		font-size: 18px;
	}

	.timing-content {
		box-sizing: border-box;
		text-align: right;

		// .time_list {
		// 	//	 margin-bottom: 80px;
		// }

		.drap-title {
			width: 750px;
			margin-left: -30px;
		}
	}

	// .time_list {
	// 	// margin-top: 35px;
	// }

	.timing-item {
		display: flex;
		margin-bottom: 20px;
		color: #fff;
		align-items: center;
		// background: url(@/assets/romimg/grade/item_bg.png) no-repeat center;
		background-size: 730px 350px !important; //100% 100% !important;
		border-radius: 16px;
		width: 730px;
		height: 350px;
		margin-left: 10px;
		position: relative;

		&.hour-bg {
			background: url(@/assets/romimg/timebox/hour_bg.png) no-repeat;
		}
		&.day-bg {
			background: url(@/assets/romimg/timebox/day_bg.png) no-repeat;
		}
		&.week-bg {
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
					width: 350px;
					font-size: 28px;
					// padding-right: 20px;
					padding-top: 20px;
					padding-bottom: 30px;
					color: #fff;
					font-weight: 300;

					// span {
					// 	// color: #fbfa02;
					// }
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
				// width: 104px;
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
					color: #fff;
				}
			}
		}
	}

	.title {
		margin-top: 60px;
	}

	.drop-tab {
		display: flex;
		margin-top: 60px;

		p {
			width: 120px;
			height: 50px;
			border: 2px solid #fbfa02;
			margin-right: 30px;
			text-align: center;
			line-height: 52px;
			font-size: 24px;
			color: #fff;
			background: transparent;

			&.active {
				color: #1c1a2a;
				background: #fbfa02;
			}
		}
	}

	.drop-title {
		display: flex;
		justify-content: space-between;
		height: 104px;

		p {
			width: 236px;
			text-align: center;
			line-height: 104px;
			color: #fbfa02;
			font-size: 30px;
		}
	}

	.drop-list {
		box-sizing: border-box;
		justify-content: space-between;
		padding: 0 20px;
		display: flex;
		flex-wrap: wrap;

		.drop-item {
			height: 496px;
			width: 348px;
			border-radius: 10px;
			margin-bottom: 20px;
			background-position: center;
			background-size: cover;
			background-repeat: no-repeat;
			// background-color: rgba(25, 28, 53, 0.41);
			background-color: #1b1e38;
			.price {
				text-align: center;
				font-size: 16.393px;
				font-style: normal;
				font-weight: 700;
				line-height: normal;
				margin-top: 38px;
				height: 20px;
			}
			.pic {
				width: 265px;
				height: 200px;
				flex-shrink: 0;
				margin: 40px auto;
				img {
					max-width: 100%;
					max-height: 100%;
				}
			}

			.bottom {
				margin: auto;
				padding-top: 30px;
				width: 336px;
				height: 102px;
				display: flex;
				justify-content: center;
				padding-left: 50px;
				.right {
					margin-left: 30px;
					text-align: left;
					width: 356px;
					height: 102px;
					color: #cbccd6;
					padding-top: 15px;
					box-sizing: border-box;
					p {
						color: #cbccd6;
						font-size: 24px;
						font-style: normal;
						font-weight: 300;

						height: 40px;
						text-align: left;
						width: 150px;
						margin-top: 10px;
					}
					// p:last-child {
					//	 display: flex;
					//	 height: 50px;
					//	 color: #cbccd6;
					//	 text-align: left;
					//	 // padding-top: 10px;
					//	 font-size: 24px;
					//	 font-style: normal;
					//	 font-weight: 500;
					//	 width: 150px;
					//	 // line-height: 15.368px; /* 125% */

					//	 // .m-head-timing {
					//	 //	 width: 68px !important;
					//	 //	 height: 68px !important;
					//	 // }
					// }
				}
			}

			//	 &::after {
			//		 display: block;
			//		 position: absolute;
			//		 content: "";
			//		 width: 100%;
			//		 height: 2px;
			//		 border-bottom: 1px solid #fff;
			//		 left: 0;
			//		 bottom: 0;
			//	 }

			//	 p {
			//		 width: 236px;
			//		 text-align: center;
			//		 line-height: 124px;
			//		 font-size: 20px;
			//		 color: #ffffff;

			//		 &:nth-child(2) {
			//			 display: flex;
			//			 justify-content: center;
			//			 align-items: center;
			//		 }
			//	 }
		}
	}
}
</style>
