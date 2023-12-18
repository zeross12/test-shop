<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import HeadPortrait from '@/components/pc/head/HeadPortrait.vue';
import { getTimingList, getBoxDropRecords } from "@/network/api/blind";
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { GoodImageBgType } from '@/util/util'
const store = useStore();

const hour = ref({ boxItem: {} });
const day = ref({ boxItem: {} });
const week = ref({ boxItem: {} });
const time = ref(1662458547723);//服务器时间

const recordtype = ref(1);//1小时,2每日,3每周
const recordList = ref([]);//最近掉落

const tabType = ref(1);
const timingList = ref([]);

const showTab = ref(false);

onMounted(() => {
	getTimingData();
})

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
	recordList.value = []
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
	getRecord();
}

//倒计时过滤
function TimeFilter(v) {
	if (v == 1) {//处理小时
		//当时服务器时间戳
		let Time = time.value
		//加上一小时的时间戳
		let endTime = Time + 3600000
		//分解
		let date = new Date(endTime)
		let yy = date.getFullYear()
		let mm = date.getMonth() + 1
		let dd = date.getDate()
		let hh = date.getHours()
		//分秒置为0
		let dateTime = yy + '/' + mm + '/' + dd + ' ' + hh + ':' + '00' + ':' + '00'
		//相减并返回
		return new Date(dateTime).getTime() - Time

	} else if (v == 2) {//处理天
		//当前服务器时间戳
		let Time = time.value
		//转时间
		let date = new Date(Time)
		//天+1
		let endtime = date.setDate(date.getDate() + 1)
		//转时间
		let endDate = new Date(endtime)
		//分解
		let yy = endDate.getFullYear()
		let mm = endDate.getMonth() + 1
		let dd = endDate.getDate()
		//时分秒置为0
		let dateTime = yy + '/' + mm + '/' + dd + ' ' + '00' + ':' + '00' + ':' + '00'
		//相减并返回
		return new Date(dateTime).getTime() - Time

	} else if (v == 3) {//处理周
		//当前服务器时间戳
		let Time = time.value
		//转时间
		let date = new Date(Time)
		//当前星期x
		let Day = date.getDay()
		//距离本周日差(7为0反之正常)
		let difference = 0 - Day + 7 == 7 ? 0 : 0 - Day + 7
		//当前时间+距离本周日差+1(隔日0点)
		let endtime = date.setDate(date.getDate() + difference + 1)
		//转时间
		let endDate = new Date(endtime)
		//分解
		let yy = endDate.getFullYear()
		let mm = endDate.getMonth() + 1
		let dd = endDate.getDate()
		//时分秒置为0
		let dateTime = yy + '/' + mm + '/' + dd + ' ' + '00' + ':' + '00' + ':' + '00'
		//相减并返回
		return new Date(dateTime).getTime() - Time
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
		html: t('timebox.rule')
	}
	store.commit('setHowPlay', data)
}


function onClickTab(index) {
	tabType.value = index;
	fliterBoxType();
}

function getImageBg(item) {
	let level = item.goodsLevel;
	if (item.goodsLevel == 0) {
		level = 1;
	}
	return store.getters.getGoodsBgImage(GoodImageBgType.roll, level);
}

function splitDateTime(str) {
	return str.split(' ')
}

/**
 * 是否允许参加
 */
function isAllowJoin(item) {
	return Number(item.chargeAmount) >= Number(item.needAmount)
}

/**
 * 参与活动需要充值的金额
 */
function joinNeedAmount(item) {
	let cur = Number(item.needAmount) - Number(item.chargeAmount)

	if (cur <= 0)
		return item.boxItem.price
	else
		return cur
}

function join(item) {
	if (item.isJoined) return
	return store.commit("setRechargeView", true);
}
</script>
		
<template>
	<div id="pc-timingbox" class="min-wrap-height">
		<div class="page-head">
			<div class="page-title">
				<img src="@/assets/pcimg/time/time_icon.png" alt="" />
				{{ t('router.timebox') }}
			</div>
			<div class="tabs">
				<div :class="{ tab: true, active: tabType == 1 }" @click="onClickTab(1)">{{ t('timebox.defaultBox') }}
				</div>
				<div :class="{ tab: true, active: tabType == 2 }" @click="onClickTab(2)" v-html="t('timebox.vip5Box')">
				</div>
				<div :class="{ tab: true, active: tabType == 3 }" @click="onClickTab(3)" v-html="t('timebox.vip10Box')">
				</div>
				<div class="help" @click="onClickHelp"></div>
			</div>
		</div>

		<div class="timing-content">
			<div class="timing-list">
				<div class="timing-item" v-if="hour.type">
					<div class="left-bt-wrap">
						<div class="need-rechagrge" v-if="!isAllowJoin(hour)">{{ t('timebox.needRecharge') }}</div>
						<div class="price" v-if="!isAllowJoin(hour)"><img src="@/assets/pcimg/common/coin.png"> {{
							joinNeedAmount(hour) }}</div>
						<div class="state" @click="join">{{ hour.isJoined ? t('timebox.joined') : t('timebox.join') }}
						</div>
					</div>
					<div class="timing-item-wp">
						<img :src="hour.boxItem.weaponImageUrl" alt="">
					</div>
					<div class="time-goods-info">
						<div class="time-goods-name hide">{{ hour.boxItem.name }}</div>
						<div class="pep-count"><img src="@/assets/pcimg/common/coin.png"> {{ hour.boxItem.price }}</div>
						<p class="item-rule text-cut"
							v-html="t('timebox.rechargeText', { type: t('timebox.everyHour'), money: hour.needAmount })">
						</p>
						<van-count-down :time="TimeFilter(1)" @finish="finish">
							<template #default="timeData">
								<div class="count-item">
									<div class="count-bk">
										<div class="split hour"></div>
										<label>{{ timeData.minutes >= 10 ? timeData.minutes : '0' + timeData.minutes
										}}</label>
									</div>
									<div class="count-col">{{ t('timebox.min') }}</div>
								</div>
								<div class="count-item">
									<div class="count-bk">
										<div class="split hour"></div>
										<label>{{ timeData.seconds >= 10 ? timeData.seconds : '0' + timeData.seconds
										}}</label>
									</div>
									<div class="count-col">{{ t('timebox.sec') }}</div>
								</div>
							</template>
						</van-count-down>
					</div>

				</div>

				<div class="timing-item day" v-if="day.type">
					<div class="left-bt-wrap">
						<div class="need-rechagrge" v-if="!isAllowJoin(day)">{{ t('timebox.needRecharge') }}</div>
						<div class="price" v-if="!isAllowJoin(day)"><img src="@/assets/pcimg/common/coin.png"> {{
							joinNeedAmount(day) }}</div>
						<div class="state" @click="join">{{ day.isJoined ? t('timebox.joined') : t('timebox.join') }}
						</div>
					</div>
					<div class="timing-item-wp">
						<img :src="day.boxItem.weaponImageUrl" alt="">
					</div>
					<div class="time-goods-info">
						<div class="time-goods-name hide">{{ day.boxItem.name }}</div>
						<div class="pep-count"><img src="@/assets/pcimg/common/coin.png"> {{ day.boxItem.price }}</div>
						<p class="item-rule text-cut"
							v-html="t('timebox.rechargeText', { type: t('timebox.everyDay'), money: day.needAmount })">
						</p>
						<van-count-down :time="TimeFilter(2)" @finish="finish">
							<template #default="timeData">
								<div class="count-item">
									<div class="count-bk">
										<div class="split day"></div>
										<label>{{ timeData.hours >= 10 ? timeData.hours : '0' + timeData.hours }}</label>
									</div>
									<div class="count-col">{{ t('timebox.hours') }}</div>
								</div>
								<div class="count-item">
									<div class="count-bk">
										<div class="split day"></div>
										<label>{{ timeData.minutes >= 10 ? timeData.minutes : '0' + timeData.minutes
										}}</label>
									</div>
									<div class="count-col">{{ t('timebox.min') }}</div>
								</div>
							</template>
						</van-count-down>
					</div>
				</div>

				<div class="timing-item week" v-if="week.type">
					<div class="left-bt-wrap">
						<div class="need-rechagrge" v-if="!isAllowJoin(week)">{{ t('timebox.needRecharge') }}</div>
						<div class="price" v-if="!isAllowJoin(week)"><img src="@/assets/pcimg/common/coin.png"> {{
							joinNeedAmount(week) }}</div>
						<div class="state" @click="join">{{ week.isJoined ? t('timebox.joined') : t('timebox.join') }}
						</div>
					</div>
					<div class="timing-item-wp">
						<img :src="week.boxItem.weaponImageUrl" alt="">
					</div>
					<div class="time-goods-info">
						<div class="time-goods-name text-cut">{{ week.boxItem.name }}</div>
						<div class="pep-count"><img src="@/assets/pcimg/common/coin.png"> {{ week.boxItem.price }}</div>
						<p class="item-rule text-cut"
							v-html="t('timebox.rechargeText', { type: t('timebox.everyWeek'), money: week.needAmount })">
						</p>
						<van-count-down :time="TimeFilter(3)" @finish="finish">
							<template #default="timeData">
								<div class="count-item">
									<div class="count-bk">
										<div class="split week"></div>
										<label>{{ timeData.days >= 10 ? timeData.days : '0' + timeData.days }}</label>
									</div>
									<div class="count-col">{{ t('timebox.days') }}</div>
								</div>
								<div class="count-item">
									<div class="count-bk">
										<div class="split week"></div>
										<label>{{ timeData.hours >= 10 ? timeData.hours : '0' + timeData.hours }}</label>
									</div>
									<div class="count-col">{{ t('timebox.hours') }}</div>
								</div>
							</template>
						</van-count-down>
					</div>
				</div>
			</div>
			<div class="page-nav">
				<div class="page-nav-item" :class="{ active: recordtype == 1 }" @click="setRecord(1)">
					{{ t('timebox.dropByHours') }}
				</div>
				<div class="page-nav-item" :class="{ active: recordtype == 2 }" @click="setRecord(2)">
					{{ t('timebox.dropByDays') }}
				</div>
				<div class="page-nav-item" :class="{ active: recordtype == 3 }" @click="setRecord(3)">
					{{ t('timebox.dropByWeek') }}
				</div>
			</div>
			<div class="pool-items">
				<div class="pool-item" v-for="(item, index) in recordList" :key="index">
					<div class="item-card">
						<div class="card-label">
							<!-- <p>饰品价格</p> -->
							<span><img class="pc-price-coins" src="@/assets/pcimg/common/coin.png" alt="" />{{ item.price
							}}</span>
						</div>
						<div class="weapon-item-pic" :style="`background-image: url(` + getImageBg(item) + `)`">
							<img :src="item.iconUrl" :alt="item.goodsName">
						</div>
						<div class="user-wrap">
							<div class="user-info">
								<HeadPortrait :userModel='item' :hideFrame="true" :size="'pc-openbox-header'">
								</HeadPortrait>
							</div>
							<div class="time text-cut">
								<!-- <p>赢得的时间</p> -->
								<span>{{ item.nickName }}</span>
								<span>{{ splitDateTime(item.createTime)[0] }}</span>
								<!-- <span>{{ splitDateTime( item.createTime )[1] }}</span> -->
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
		
<style lang="scss" scoped>
#pc-timingbox {
	box-sizing: border-box;
	padding-bottom: 60px;
	padding-top: 50px;
	max-width: 1440px;
	width: 100%;
	margin: 0 auto;
	position: relative;
	padding-left: 15px;
	padding-right: 15px;


	.page-head {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.page-title {
			display: flex;
			align-items: center;
			color: #FFF;
			font-size: 27px;

			img {
				width: 28px;
				height: 28px;
				margin-right: 15px;
			}
		}

		.tabs {
			display: flex;
			gap: 13px;

			.tab {
				display: flex;
				height: 60px;
				box-sizing: border-box;
				justify-content: center;
				align-items: center;
				min-width: 160px;
				padding: 0 24px;
				border: 1px solid #2E304E;
				;
				border-radius: 2px;
				color: #ACAEC5;
				font-size: 14px;
				font-weight: 400;
				cursor: pointer;
				border-radius: 10px;

				span {
					font-weight: 700;
				}

				&:hover {
					color: #EFEFF0;
					border: 1px solid #4A45B1;
				}

				&.active {
					color: #fff;
					// background: #4A45B1;
					border: 1px solid #4A45B1;
				}
			}

			.help {
				display: flex;
				cursor: pointer;
				width: 60px;
				height: 60px;
				background: url(/src/assets/pcimg/common/help.png) center no-repeat;

				&:hover {
					background: url(/src/assets/pcimg/common/help2.png) center no-repeat;
					background-size: 100% 100%;
				}
			}
		}
	}


	.timing-content {
		box-sizing: border-box;
		margin-top: 38px;

		.timing-list {
			display: flex;
			align-items: center;
			// justify-content: space-between;
			gap: 30px;
			width: 100%;

			.timing-item {
				display: flex;
				width: 450px;
				height: 175px;
				color: #fff;
				background: url(@/assets/pcimg/time/bg1.png) center no-repeat;
				background-size: 100% 100%;
				// margin: 0 15px;
				position: relative;
				box-sizing: border-box;

				.left-bt-wrap {
					display: flex;
					align-items: center;
					flex-direction: column;
					position: absolute;
					// left: 17px;
					// bottom: 30px;
					left: 24px;
					bottom: 17px;

					.need-rechagrge {
						color: #FFF;
						text-align: center;
						// leading-trim: both;
						// text-edge: cap;

						font-size: 12px;
						font-style: normal;
						font-weight: 700;
						line-height: normal;
						margin-bottom: 3px;
					}

					.price {
						img {
							width: 11px;
						}

						margin-bottom: 4px;
						color: #B9DEE0;
						text-align: center;
						// leading-trim: both;
						// text-edge: cap;
						// 
						font-size: 12px;
						font-style: normal;
						font-weight: 700;
						line-height: normal;
					}

					.state {
						color: #C8C2D8;
						font-size: 12px;
						line-height: 18px;
						border-radius: 3.997px;
						border: 1px solid rgba(25, 28, 52, 0.70);
						background: rgba(25, 28, 52, 0.70);
						box-sizing: border-box;
						padding: 4px 10px;

						&:hover {
							border-radius: 3.997px;
							border: 1px solid #B9DEE0;
							color: #fff;
						}
					}
				}

				.timing-item-wp {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 140px;
					height: 105px;
					margin-top: 28px;
					margin-left: 16px;
					// margin-right: 15px;
					box-sizing: border-box;

					img {
						max-width: 85%;
					}
				}

				.time-goods-info {
					display: flex;
					justify-content: space-between;
					flex-direction: column;
					// margin-top: 38px;
					// margin-left: 19px;
					padding: 38px 59px 20px 19px;

					.time-goods-name {
						color: #C8CBD8;
						font-size: 15px;
						line-height: 25px;
						text-align: left;
						max-width: 230px;
					}

					.pep-count {
						color: #75DC9E;
						display: flex;
						align-items: center;
						text-align: center;

						font-size: 16px;
						font-style: normal;
						font-weight: 700;
						line-height: normal;
						gap: 4px;
						margin-top: -4px;
						// margin-left: 23px;

						img {
							height: 15px;
						}
					}

					.item-rule {
						color: #FFF;
						font-size: 12px;
						// line-height: 21px;
						margin-top: 10px;
						text-align: left;
						width: 100%;
					}

					.van-count-down {
						display: flex !important;
						align-items: center;

						.count-item {
							display: flex;
							flex-direction: column;
							align-items: flex-start;
							margin-left: 1px;
							position: relative;

							.split {
								// border: 1px solid red;
								position: absolute;
								height: 1px;
								width: 100%;
								z-index: 1;
								top: 19px;
								left: -4px;
								z-index: 2;

								&.hour {
									background: rgba(23, 44, 53, .5);
								}

								&.day {
									background: rgba(30, 29, 79, .5);
								}

								&.week {
									background: rgba(51, 33, 72, .5);
								}
							}

							.count-bk {
								display: flex;
								align-items: center;
								justify-content: flex-end;
								height: 40px;
								width: 48px;
								// color: red;
								color: #C8C2D8;
								// 
								font-size: 16px;
								font-weight: 500;
								line-height: 16px;
								letter-spacing: 13px;
								text-align: center;
								position: relative;
								z-index: 3;
								// border: 1px solid red;

								label {
									z-index: 3;
								}

								&::before {
									content: "";
									background: rgba(101, 95, 123, 0.45);
									height: 26px;
									width: 20px;
									position: absolute;
									left: -2px;
									top: 6px;
									z-index: 0;
								}

								&::after {
									content: "";
									background: rgba(101, 95, 123, 0.45);
									height: 26px;
									width: 20px;
									position: absolute;
									right: 7px;
									top: 6px;
									z-index: 0;
								}
							}

							.count-col {
								color: rgba(255, 255, 255, 0.40);
								font-size: 8px;
								line-height: 8px;
								margin-top: 1px;
								margin-left: 14px;
							}

							&:last-child {
								margin-left: 7px;

								.count-col {
									margin-left: 14px;
								}
							}
						}
					}
				}

				&.day {
					background: url(@/assets/pcimg/time/bg2.png) center no-repeat;
					background-size: 100% 100%;

					.left-bt-wrap {
						.state {
							&:hover {
								border-radius: 3.997px;
								border: 1px solid #446AF7;
								color: #fff;
							}
						}
					}

					// .time-goods-info {
					//	 .pep-count {
					//		 color: #A0A9D6;
					//		 // margin-left: 26px;
					//	 }
					// }

					// .van-count-down {
					// 	.count-item {
					// 		margin-left: 8px;
					// 	}
					// }
				}

				&.week {
					background: url(@/assets/pcimg/time/bg3.png) center no-repeat;
					background-size: 100% 100%;

					.left-bt-wrap {
						.state {
							&:hover {
								border-radius: 3.997px;
								border: 1px solid #A144F7;
								color: #fff;
							}
						}
					}

					// .time-goods-info {
					//	 .pep-count {
					//		 color: #C7A0D6;
					//	 }
					// }
				}
			}
		}
	}

	.page-nav {
		display: flex;
		margin-top: 20px;
		margin-bottom: 30px;
		gap: 13px;

		.page-nav-item {
			display: flex;
			min-width: 108px;
			height: 34px;
			justify-content: center;
			align-items: center;
			font-size: 14px;
			color: #B4B6C8;
			border-radius: 4px;
			border: 1px solid #313350;
			padding: 0 16px;
			background: rgba(25, 30, 53, 0.00);
			box-sizing: border-box;
			// margin-right: 13px;

			&:hover {
				color: #EFEFF0;
				border: 1px solid #4A45B1;
			}

			&.active {
				color: #EFEFF0;
				border: 1px solid #4A45B1;
				background: #4A45B1;
			}
		}
	}

	.pool-items {
		display: flex;
		flex-wrap: wrap;
		margin: -4px;

		.pool-item {
			padding: 4px;
			flex: 0 0 12.5%;
			max-width: 12.5%;
			box-sizing: border-box;

			.item-card {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: space-between;
				text-align: center;
				background-color: #1b1e38;
				height: 240px;
				padding: 16px 0 22px 0;
				box-sizing: border-box;

				.card-label {
					display: flex;
					flex-direction: column;
					align-items: center;

					// margin-top: 16px;
					.pc-price-coins {
						width: 16px;
						margin-right: 5px;
					}

					p {
						color: #4B4D5F;
						font-size: 12px;
						line-height: 18px;
					}

					span {
						color: #7BDCA2;

						font-size: 16px;
						font-style: normal;
						font-weight: 700;
						line-height: 18.75px;
						display: flex;
						align-items: center;
					}
				}

				.weapon-item-pic {
					display: flex;
					align-items: center;
					justify-content: center;
					position: relative;
					max-width: 100%;
					height: 116px;
					background-size: contain;
					background-position: center;
					background-repeat: no-repeat;

					img {
						max-width: 90%;
						max-height: 90%;
					}
				}

				.user-wrap {
					display: flex;
					// justify-content: space-between;
					align-items: center;
					width: 132px;
					height: 35px;
					gap: 10px;

					.time {
						display: flex;
						flex-direction: column;
						max-width: 80px;
						text-align: left;
						justify-content: space-between;
						height: 100%;
						// p {
						//	 color: #4B4D5F;
						//	 font-size: 12px;
						//	 line-height: 18px;
						// }

						span {
							color: #CBCCD6;

							font-size: 12px;
							font-weight: 500;
							line-height: 15px;

							// max-width: 72px;
							&:first-child {
								color: #CBCCD6;

								font-size: 12px;
								font-style: normal;
								font-weight: 500;
								line-height: 18px;
								/* 125% */
							}

							&:last-child {
								color: #4B4D5F;

								font-size: 12px;
								font-style: normal;
								font-weight: 400;
								line-height: 15px;
								/* 150% */
								text-transform: uppercase;
							}
						}
					}

					.user-info {
						display: flex;
						align-items: center;
						flex-direction: column;
						// margin-top: 6px;
					}
				}


			}
		}
	}
}
</style>