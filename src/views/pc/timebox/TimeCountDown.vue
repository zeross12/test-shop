<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted, computed} from 'vue';
import { useRouter } from 'vue-router';
import { getTimingList } from "@/network/api/blind";
import { useStore } from 'vuex';
const router = useRouter();
const store=useStore();
const time = ref(1662458547723);//服务器时间
const show = ref(false);
const first = ref(true);
const timingIndexNotice = computed(() => store.state.timingIndexNotice);

onMounted(() => {
	getTimingData();
})

async function getTimingData() {
	const res = await getTimingList();
	if (res.code === 0) {
		time.value = res.data.serverTime * 1000;
		first.value = true;
	}
}
//倒计时过滤
function TimeFilter() {
	//当时服务器时间戳
	let st = time.value
	//加上一小时的时间戳
	let endTime = st + 3600000
	//分解
	let date = new Date(endTime)
	let yy = date.getFullYear()
	let mm = date.getMonth() + 1
	let dd = date.getDate()
	let hh = date.getHours()
	//分秒置为0
	let dateTime = yy + '/' + mm + '/' + dd + ' ' + hh + ':' + '00' + ':' + '00'
	let ct = new Date(dateTime).getTime() - st;

	//相减并返回
	return ct
}

function change(ct) {
	if (ct.minutes < 5 && first.value) {
		first.value = false;
		show.value = true;
	}
}

//倒计时结束重新触发
function finish() {
	show.value = false;
	getTimingData();
}

function onClickIcon() {
	router.push('/p/timebox');
}

function onClickColse() {
	show.value = false;
	store.commit('setTimingIndexNotice',false);
}
</script>
	
<template>
	<div class="pc-time-cd-wrap" v-show="show&&timingIndexNotice">
		<div class="time-bg" @click="onClickIcon">
			<div class="wq">
				<div class="line_bg"></div>
				<img src="@/assets/romimg/timebox/item_wq.png" alt="">
			</div>
			<div class="num-bg">
				<van-count-down :time="TimeFilter()" @finish="finish" @change="change">
					<template #default="timeData">
						<span class="block">{{ timeData.minutes >= 10 ? timeData.minutes : '0' +
								timeData.minutes
						}}</span>
						<span class="colon"></span>
						<span class="block">{{ timeData.seconds >= 10 ? timeData.seconds : '0' +
								timeData.seconds
						}}</span>
					</template>
				</van-count-down>
			</div>

		</div>
		<div class="close" @click="onClickColse">
			<img src="@/assets/romimg/timebox/item_close.png" alt="">
		</div>
	</div>
</template>
	
<style lang="scss" scoped>
.pc-time-cd-wrap {
	position: fixed;
	right: 148px;
	bottom: 120px;
	z-index: 101;

	.time-bg {
		background: url(@/assets/romimg/timebox/item_bg.png) no-repeat center;
		background-size: contain;
		width: 165px;
		height: 195px;
		position: relative;

		.wq {
			position: relative;
			top: -15px;
			z-index: 2 !important;
			
			.line_bg {
				display: block;
				width: 170px;
				height: 170px;
				background: url(@/assets/romimg/battle/lightUrl.png) no-repeat center;
				background-size: contain;
				position: absolute;
				left: 0px;
				top: 0px;
				z-index: -1 !important;
				animation: shake 2s linear infinite;
			}

			img {
				width: 146px;
			}

		}

		.num-bg {
			display: flex;
			position: relative;
			width: 100%;
			align-items: center;
			justify-content: center;
			top: -30px;

			.van-count-down {
				display: flex !important;
				justify-content: center;
				display: block;

				.block {
					display: block;
					width: 50px;
					height: 35px;
					background: url(@/assets/romimg/timebox/item_bg2.png) no-repeat center;
					background-size: contain;
					font-size: 26px;
					color: #fff;
					font-weight: bold;
					line-height: 36px;
					padding-top: 2px;
					text-align: center;
					letter-spacing: 6px;
					padding-left: 6px;
					box-sizing: border-box !important;
				}

				.colon {
					margin: 0 5px;
				}
			}

		}
	}

	.close {
		position: absolute;
		right: -15px;
		top: 2px;
		width: 28px;
		z-index: 2 !important;
		img {
			width: 28px;
		}
	}
	
	@keyframes shake {
		from {
			transform: rotate(0deg)
		}

		to {
			transform: rotate(359deg)
		}
	}
}
</style>