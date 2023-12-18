<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { getVipLevelList, getVipReward } from '@/network/api/user'


const store = useStore()
const userInfoBase = computed(() => store.state.userInfoBase);
// vip等级列表
const levelList = ref([])
// 当前vip等级
const level = ref(userInfoBase.value.userLevel);
// 当前累计充值金额
const chargeAmount = ref(0)
// vip进度
const vipRate = ref(0)


onMounted(() => {
	getVipLevelRecord()
})
// 获取vip等级列表
async function getVipLevelRecord() {
	const res = await getVipLevelList();
	if (res.code === 0) {
		let items = res.data.items || [];
		let cAmount = res.data.chargeAmount || 0;

		levelList.value = items;
		chargeAmount.value = cAmount;
		vipRate.value = level.value / (items.length - 1) * 100;
	}
}


// 领取vip福利
function getWelfare(item) {
	if (item.level) {
		let params = {
			level: item.level
		}
		getVipReward(params).then(res => {
			if (res.code == 0) {
				store.dispatch("getUserInfo");
				Success({ offset: 100, message: t('vip.receiveReward', { amount: res.data.amount }) });
				getVipLevelRecord()
			}
		})
	}
}


</script>
		
<template>
	<div id="pc-vip">
		<div class="vip-content">
			<div class="vip-title">{{ t('vip.title') }}<img src="@/assets/pcimg/vip/help.png" alt="" /></div>
			<div class="list-wrap">
				<div class="progress-wrap">
					<van-progress :percentage="vipRate" pivot-text="" pivot-color="#79ECDD" color="#79ECDD" />
				</div>
				<div class="vip-list-wrap">
					<div class="vip-item" v-for="item in levelList" :key="item.level">
						<div class="item-first">{{ item.needAmount }}</div>
						<div class="item-second">{{ item.rewardAmount }}</div>
						<div v-if="item.status == 1">
							<p v-if="item.level == 0" class="vip0-p"> - </p>
							<p v-else class="get-status" @click="getWelfare(item)">{{ t('redpack.receive') }}</p>
						</div>
						<div v-else-if="item.status == 2" class="get-status">{{ t('redpack.received') }}</div>
						<div v-else class="get-status">{{ t('vip.unlock') }}</div>
					</div>
				</div>

			</div>
		</div>
	</div>
</template>
		
<style lang="scss" >
#pc-vip {
	box-sizing: border-box;
	padding-top: 3px;
	width: 100%;
	min-height: 1000px;
	padding-bottom: 50px;
	background: url(@/assets/pcimg/vip/pseudo.png) top no-repeat;
	background-size: 1414px, 1084px;
	display: flex;

	.vip-content {
		width: 1373px;
		height: 460px;
		background: #121324;
		margin-top: 329px;
		padding: 16px;
		box-sizing: border-box;
		margin: 329px auto 0;

		.vip-title {
			display: flex;
			align-items: center;
			color: #47CBB9;
			font-size: 12px;

			img {
				width: 14px;
				height: 15px;
				margin-left: 6px;
			}
		}

		.list-wrap {
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			width: 1349px;
			height: 376px;
			margin-top: 26px;
			background: url(@/assets/pcimg/vip/bg.png) center no-repeat;
			background-size: 1349px, 376px;
			padding-left: 103px;

			.progress-wrap {
				display: flex;
				width: 1234px;
				height: 51px;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				margin-top: 50px;

				.van-progress {
					width: 1145px;
					height: 7px;
				}
			}

			.vip-list-wrap {
				display: flex;
				margin-top: 5px;
				color: #79ECDD;

				font-size: 15px;
				font-weight: 700;

				.vip-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					height: 263px;
					width: 103px;

					.item-first {
						margin-top: 32px;
					}


					.item-second {
						margin-top: 65px;
					}

					.get-status {
						display: flex;
						width: 77px;
						height: 26px;
						justify-content: center;
						align-items: center;
						border-radius: 13px;
						border: 1px solid #2C3039;
						color: rgba(255, 255, 255, 0.30);
						font-size: 10px;
						font-weight: 400;
						margin-top: 65px;
					}

					.vip0-p {
						margin-top: 65px;
					}
				}
			}
		}
	}
}
</style>