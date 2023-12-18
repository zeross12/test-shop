<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getTimingList } from "@/network/api/blind";
import { useStore } from 'vuex';
const router = useRouter();
const store = useStore();
const time = ref(1662458547723);//服务器时间

const day = ref({ boxItem: {} });
const countDownRef=ref(null);
const hasTimingBox=ref(false);

onMounted(() => {
	getTimingData();
})

async function getTimingData() {
	const res = await getTimingList();
	if (res.code === 0) {
		let items = res.data.items || [];
		for (let index = 0; index < items.length; index++) {
			const item = items[index];
			if (item.type == 4) {
				day.value = item;
				hasTimingBox.value=true;
			}
		}
		time.value = res.data.serverTime * 1000;
	}
}
//倒计时过滤
function TimeFilter() {
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
}

//倒计时结束重新触发
function finish() {
	countDownRef.value.reset();
	getTimingData();
}

function onClickIcon() {
	// router.push('/m/timebox');
}

</script>
		
<template>
	<div class="spring-time-bg" @click="onClickIcon" v-if="hasTimingBox">
		<div class="timing-item">
			<div class="timing-item-wp">
				<img :src="day.boxItem.weaponImageUrl" alt="">
			</div>

			<div class="timing-item-info">
				<div class="time-goods-info">
					<div class="time-goods-name hide">{{ day.boxItem.name }}</div>
					<div class="time-goods-price"><img src="@/assets/romimg/common/gold.png" alt="">{{ day.boxItem.price }}
					</div>
				</div>
				<div class="count-time-wrap">

					<van-count-down :time="TimeFilter()"	@finish="finish" ref="countDownRef">
						<template #default="timeData">
							<span class="count-bk">{{
								timeData.hours >= 10 ? timeData.hours : '0' + timeData.hours
							}}</span>
							<div class="count-txt"> <span>{{t('timebox.hours')}}</span></div>
							<span class="count-bk">{{
								timeData.minutes >= 10 ? timeData.minutes : '0' +
									timeData.minutes
							}}</span>
							<div class="count-txt"> <span>{{t('timebox.min')}}</span></div>
							<span class="count-bk">{{
								timeData.seconds >= 10 ? timeData.seconds : '0' +
									timeData.seconds
							}}</span>
							<div class="count-txt"> <span>{{t('timebox.sec')}}</span></div>
						</template>
					</van-count-down>
					{{ t('timebox.logChange') }}{{t('timeboxrechargeText',{money : day.needAmount})}}
					<!-- <p>登录并充值<span>{{ day.needAmount }}</span>以上即可自动参加</p> -->
				</div>
			</div>
		</div>
		<div class="light-wrap" v-if="false">
			<div class="left-light-wrap">
				<div class="left-yuan">
					<img src="@/assets/romimg/spring/yuan.png" alt="">
				</div>
				<div class="left-light">
					<img src="@/assets/romimg/spring/left_light.png" alt="">
				</div>

			</div>
			<div class="right-light-wrap">
				<div class="right-yuan">
					<img src="@/assets/romimg/spring/yuan.png" alt="">
				</div>
				<div class="right-light">
					<img src="@/assets/romimg/spring/right_light.png" alt="">
				</div>
			</div>
		</div>
	</div>
</template>
		
<style lang="scss" scoped>
.spring-time-bg {
	display: flex;
	align-items: center;
	width: 744px;
	height: 298px;
	margin: 0 auto;
	background: url(@/assets/romimg/spring/bg2.png) no-repeat center;
	background-size: contain;
	margin-top: 22px;
	margin-bottom: -42px;
	position: relative;


	.timing-item {
		display: flex;
		width: 100%;
		color: #fff;
		align-items: center;
		justify-content: center;
		margin-top: 3px;


		.timing-item-info {
			margin-left: 28px;

			.time-goods-info {

				.time-goods-name {
					text-align: left;
					box-sizing: border-box;
					font-size: 24px;
				}

				.time-goods-price {
					display: flex;
					align-items: center;
					color: #F8FF2C;
					margin-top: 4px;
					font-size: 30px;
					margin-left: -5px; 

					img {
						width: 38px;
						height: 38px;
						margin-right: 5px;
					}
				}
			}


			.count-time-wrap {

				p {
					font-size: 20px;
					text-align: left;
					color: #fff;
					margin-top: 12px;
					width: 100px;
					span {
						color: #F8FF2C;
					}
				}

				.van-count-down {
					display: flex !important;
					justify-content: center;
					align-items: center;
					margin-top: 8px;

					.count-bk {
						display: block;
						box-sizing: border-box !important;
						width: 80px;
						height: 56px;
						background: url(@/assets/romimg/spring/bg3.png) no-repeat center;
						background-size: 100% 100%;
						font-size: 40px;
						text-align: center;
						color: #F8FF2C;
						line-height: 59px;
						letter-spacing: 5px;
						padding-left: 8px;
					}

					.count-txt {
						color: #fff;
						font-size: 24px;
						margin: 0px 7px;
					}
				}

			}
		}

		.timing-item-wp {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 265px;
			height: 181px;
			border-right: 1px solid #A89B79;

			img {
				max-height: 90%;
			}
		}
	}

	.light-wrap {
		position: absolute;
		display: flex;
		justify-content: space-between;
		top: 230px;
		width: 100%;
		padding: 0px 5px;
		box-sizing: border-box;

		.left-light-wrap {
			position: relative;

			.left-yuan {
				position: absolute;
				right: -2px;
				top: -10px;

				img {
					width: 24px;
					height: 25px;
				}
			}

			.left-light {
				animation: light-rotate 3.5s linear infinite;
				width: 64px;
				height: 132px;

				img {
					width: 100%;
					height: 100%;
				}
			}
		}
		.right-light-wrap {
			position: relative;

			.right-yuan {
				position: absolute;
				left: 3px;
				top: -10px;

				img {
					width: 24px;
					height: 25px;
				}
			}

			.right-light {
				animation: light-rotate 3.5s linear infinite;
				width: 64px;
				height: 132px;
				margin-right:3px;

				img {
					width: 100%;
					height: 100%;
				}
			}
		}
	}

	@keyframes light-rotate {
		0% {
			transform: rotate(0deg)
		}

		50% {
			transform: rotate(5deg)
		}

		100% {
			transform: rotate(0deg)
		}
	}
}
</style>