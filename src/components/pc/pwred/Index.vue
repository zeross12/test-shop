<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { getActivityList, getRecords, openRedPacket } from '@/network/api/redpacket'
import { tokenName } from '@/config'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useStore();

const PasswordRed = ref(null);
const rule_text = ref(null);

const Flip = ref('just'); //正反面 just/back
const tabType = ref('activity'); //红包分类
const redKey = ref('');//口令
const open = ref(false); //开红包(交互)
const notice_show = ref(true); //公告是否加载(有bug)
const ios_com = ref(false);//ios不兼容3d转换(普通切换)

const recordList = ref([]); //红包领取记录
const allRed = ref([]); //活动红包列表
const activityRed = ref([]); //活动红包列表
const luckyRed = ref([]); //定时活动红包

const redValue = ref('');
const ios_conclude = ref(false);
const qqGroupNumber = ref('');

const btnOpenActive = ref(true);//防快速点击

let recordsListTimer = null;
let redpacketTimer = null;

onMounted(() => {
	qqGroupNumber.value = store.getters.getConfigItem("QQGroupNum") || "";
})

watch(() => store.state.serverConfigList, val => {
	qqGroupNumber.value = store.getters.getConfigItem('QQGroupNum') || ''
})

watch(() => store.state.passRed, (newpw, prered) => {
	if (newpw) {
		startRedpacketListTime();
		startRecordsListTime();
	} else {
		stopRedpacketListTime();
		stopRecordsListTime();
	}

})

function startRedpacketListTime() {
	stopRedpacketListTime();
	getRedpacketList();
	redpacketTimer = setInterval(() => {
		getRedpacketList();
	}, 8000);
}

function stopRedpacketListTime() {
	if (redpacketTimer != null) {
		clearInterval(redpacketTimer);
		redpacketTimer = null;
	}
}

async function getRedpacketList() {
	let params = {}
	params.platformId = store.state.platformId;
	let res = await getActivityList(params);
	if (res.code == 0) {
		let items = res.data.items || [];
		allRed.value = items;
		activityRed.value = items.filter(item => { return item.type == 3 });
		luckyRed.value = items.filter(item => { return item.type == 4 });
	}
}

function startRecordsListTime() {
	stopRecordsListTime();
	getRecordsList();
	recordsListTimer = setInterval(() => {
		getRecordsList();
	}, 3500);
}

function stopRecordsListTime() {
	if (recordsListTimer != null) {
		clearInterval(recordsListTimer);
		recordsListTimer = null;
	}
}

async function getRecordsList() {
	let res = await getRecords({ limit: 30 });
	if (res.code == 0) {
		let items = res.data.items || [];
		recordList.value = items;
	}
}


//开红包
async function openRed(id) {
	if (!localStorage.getItem(tokenName)) {
		store.commit('setSignView', true);
		return;
	}
	if (redKey.value == '' && id == 0) {
		Warn({ offset: 100, message: t('redpack.enterPassword'), customClass: 'error' })
		return;
	}

	if (!btnOpenActive.value) return;
	btnOpenActive.value = false;

	let params = {};
	if (id != 0) {
		params.id = id
	}
	else {
		params.password = redKey.value
	}
	let res = await openRedPacket(params);
	// window.$dev && console.log( res )

	btnOpenActive.value = true;

	if (res.code == 0) {
		redValue.value = res.data.amount
		open.value = true
		store.dispatch("getUserInfo");
		startRedpacketListTime();
		startRecordsListTime();
	}
	else {
		let message = res.message

		if (message != t('redpack.enterPassword') && message != t('redpack.passwordFail')) {
			store.commit("setPassRed", false);
			tipShow.value = true
		}
	}

}

//关闭
function close() {
	store.commit('setPassRed', false);
	redKey.value = ''
	setTimeout(() => {
		Flip.value = 'just'
		open.value = false
		ios_com.value = false
	}, 300)
}


function subtime(v) {
	return v.substr(0, 16)
}

/// 提示内容
const tipInfo = ref([
	{
		checked: false,
		text: t('redpack.needAcceptAgreement'),
	},
	{
		checked: false,
		text: t('redpack.shipRule'),
	},
	{
		checked: false,
		text: t('redpack.noInduction'),
	},
	{
		checked: false,
		text: t('redpack.rationalConsumption'),
	},
	{ checked: false, text: t('redpack.isSelf') },
]);

/// 提示窗状态
const tipShow = ref(false);

function verify() {
	tipShow.value = false;
	store.commit("setRechargeView", true);
}
</script>
		
<template>
	<div id="pw-packet" ref="PasswordRed">

		<div class="pw-packet-wrap" :class="{ 'active': store.state.passRed }">
			<div class="pw-packet-main" :class="{ 'active': Flip == 'just' }">
				<div class="pw-red-left">
					<van-notice-bar :scrollable="false" :delay="3" v-if="notice_show">
						<van-swipe vertical class="notice-swipe" :autoplay="3000" :show-indicators="false">
							<van-swipe-item v-for="(item, index) in recordList" :key="index">
								<span>{{ t('redpack.rewardText', {
									nickname: item.nickname || '', money: item.amount || 0
								}) }}</span>
							</van-swipe-item>
						</van-swipe>
					</van-notice-bar>
					<div class="red-list-wrap" v-if="allRed.length > 0">
						<div class="red-item-wrap" v-for="(item, index) in allRed" :key="index">
							<div class="red-item-title">
								{{ item.title }}
							</div>
							<div class="describe" v-html="t('redpack.receiveRule', { money: item.needAmount })"></div>
							<div class="red-item-time">
								<span>{{ t('redpack.activityTime') }}：{{ subtime(item.startTime) }} — {{
									subtime(item.endTime) }}</span>
							</div>
							<div class="red-item-bottom">
								<div class="red-item-total">
									{{ t('mall.totalPrice') }}
									<span>{{ item.sumAmount }}</span>
								</div>
								<div class="red-item-btn" v-show="!item.isGet" @click="openRed(item.id)">{{ t(
									'redpack.receive') }}</div>
								<div v-show="item.isGet" class="red-item-btn end">{{ t('redpack.receive') }}</div>
							</div>
						</div>
					</div>
					<div class="red-no-area" v-else>{{ t('redpack.comeSoonForRedpack') }}</div>
				</div>
				<div class="red-content">
					<div class="close" @click="close"><img src="@/assets/pcimg/home/close.png" alt=""></div>
					<div class="pw-title">{{ t('redpack.passwordRedpack') }}</div>
					<div class="award-wrap" v-if="open">
						<div class="red-wrap">
							<div class="red-wrap-title">
								{{ t('redpack.congratulation') }}
							</div>
							<div class="red-amount">
								{{ redValue }}
							</div>
						</div>
					</div>
					<div class="hb-icon" v-else><img src="@/assets/pcimg/pwred/icon_hb.png" alt=""></div>
					<!-- <div class="qq-group" v-html="t( 'redpack.joinQQGroup', { qqGroupNumber : qqGroupNumber || '' } )"></div> -->
					<div class="bottom-wrap">
						<input type="text" v-model="redKey" maxlength="16" :placeholder="t('redpack.enterPassword')">
						<div class="open" @click="openRed(0)"></div>
					</div>
				</div>

			</div>
		</div>

		<van-overlay :show="tipShow" style="background-color: rgba(0, 0, 0, 0.7)" :z-index="200" :lock-scroll="false">
			<div class="recharge-tip-container">
				<div class="header">
					<p>{{ t('redpack.acceptAgreementTitle') }}</p>
					<div class="closeBtn" @click="tipShow = false">
						<img src="@/assets/pcimg/recharge/close-tip.png" alt="" />
					</div>
				</div>
				<div class="body">
					<div class="tip-content" v-for="(item, index) in tipInfo" :key="index" @click="select(item)">
						<!-- <img v-if="item.checked" src="@/assets/pcimg/recharge/selected.png" alt="">
			<img v-else src="@/assets/pcimg/recharge/select.png" alt=""> -->
						<div style="font-weight: 700">{{ index + 1 }}、</div>
						<p>{{ item.text }}</p>
					</div>
				</div>
				<div class="footer">
					<button @click="verify()">{{ t('redpack.acceptAgreement') }}</button>
				</div>
			</div>
		</van-overlay>
	</div>
</template>

<style lang="scss" >
#pw-packet {
	.recharge-tip-container {
		position: fixed;
		// top: 396px;
		left: calc(50% - 590px / 2);
		display: flex;
		flex-direction: column;
		background: #16182e;
		width: 590px;
		height: 551px;
		top: calc(50% - 551px / 2);

		.header {
			display: flex;
			background: #1c1f39;
			height: 100px;
			color: #CCCBDE;
			;
			align-items: center;
			// justify-content: center;
			padding-left: 58px;
			font-size: 20px;
			position: relative;
			font-weight: 700;

			.closeBtn {
				position: absolute;
				top: 16px;
				right: 16px;
			}
		}

		.body {
			display: flex;
			padding: 28px 57.5px 28px 58px;
			flex-direction: column;

			.tip-content {
				display: flex;
				// gap: 21px;
				align-items: flex-start;
				color: #aaacc1;
				font-size: 16px;
				font-weight: 300;
				line-height: 1.5;
				padding: 10px 0;
				// cursor: pointer;

				// &:hover {
				//	 color: #fff;
				// }
			}
		}

		.footer {
			display: flex;
			width: 100%;
			padding-bottom: 42px;
			justify-content: center;

			button {
				width: 208px;
				height: 58px;
				color: #fff;
				background: #3a34b0;
				border: none;
				border-radius: 6px;
				font-size: 16px;

				&:hover {
					background: #5A54CE;
					;
				}
			}
		}
	}

	.pw-packet-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		background: rgba($color: #000000, $alpha: .8);
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		z-index: -1;
		opacity: 0;
		color: #fff;
		transition: .2s;

		&.active {
			z-index: 200;
			opacity: 1;
		}

		.pw-packet-main {
			display: flex;
			align-items: center;
			position: relative;

			.pw-red-left {
				display: flex;
				flex-direction: column;
				align-items: center;
				position: relative;
				width: 523px;
				margin-right: 18px;

				.van-notice-bar {
					position: relative;
					width: 689px;
					height: 67px;
					background: url(@/assets/pcimg/pwred/notice_bg.png) center no-repeat;
					background-size: 689px 67px;
					overflow: visible;

					.notice-swipe {
						width: 689px;
						height: 67px;
						line-height: 67px;

						.van-swipe-item {
							width: 100%;
							color: #fff;
							display: flex;
							align-items: center;
							justify-content: center;
							font-size: 20px;
							z-index: 1;

							span {
								color: #FDC11D;
								margin-right: 4px;

								&.right {
									margin-left: 4px;
									margin-right: 4px;
								}
							}
						}
					}
				}


				.red-list-wrap {
					position: relative;
					box-sizing: border-box;
					width: 523px;
					height: 480px;
					margin-top: 20px;
					overflow-x: hidden;
					overflow-y: scroll;

					&::-webkit-scrollbar {
						width: 0;
					}

					.red-item-wrap {
						display: flex;
						flex-direction: column;
						width: 523px;
						height: 233px;
						margin-bottom: 15px;
						box-sizing: border-box;
						color: #fff;
						position: relative;
						border-radius: 14px;
						background: rgba($color: #191C34, $alpha: .9);
						padding: 20px;
						box-sizing: border-box;


						.red-item-title {
							display: flex;
							align-items: center;
							color: #FEBB04;
							font-size: 20px;
							margin-top: 5px;
						}

						.describe {
							font-size: 20px;
							margin-top: 10px;
							color: #FFF;
						}

						.red-item-time {
							font-size: 20px;
							margin-top: 9px;
							color: #FFF;
						}

						.red-item-bottom {
							display: flex;
							justify-content: space-between;
							align-items: center;
							width: 100%;
							margin-top: 20px;
							color: #FFF;
							font-size: 20px;
							font-weight: 700;

							.red-item-total {
								display: flex;

								span {
									color: #E6AA07;
								}
							}


							.red-item-btn {
								display: flex;
								justify-content: center;
								align-items: center;
								font-size: 21px;
								font-weight: 600;
								width: 181px;
								height: 58px;
								border-radius: 6px;
								background: #3A34B0;
							}
						}

					}
				}

				.red-no-area {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 523px;
					height: 480px;
					margin-top: 20px;
					border-radius: 14px;
					background: rgba($color: #191C34, $alpha: .9);
				}
			}


			.red-content {
				display: flex;
				flex-direction: column;
				align-items: center;
				box-sizing: border-box;
				width: 343px;
				height: 566px;
				background: url(@/assets/pcimg/pwred/bg.png) no-repeat center bottom;
				background-size: 100% 100%;
				position: relative;

				.close {
					width: 49px;
					height: 49px;
					position: absolute;
					right: -23px;
					top: -23px;
					cursor: pointer;

					img {
						width: 100%;
						height: 100%;
					}
				}

				.pw-title {
					font-size: 26px;
					color: #fff;
					font-weight: bold;
					margin-top: 26px;
				}

				.hb-icon {
					margin-top: 6px;

					img {
						width: 275px;
						height: 275px;
					}
				}

				.bottom-wrap {
					display: flex;
					flex-direction: column;
					box-sizing: border-box;
					width: 100%;

					input {
						display: block;
						position: relative;
						width: 304px;
						height: 54px;
						background: url(@/assets/pcimg/pwred/input_bg.png) no-repeat center;
						background-size: 100%;
						border: none;
						margin: 26px auto 0;
						color: #fff;
						text-align: left;
						font-size: 16px;
						padding: 0 20px;
						box-sizing: border-box;


						&::-webkit-input-placeholder {
							color: #757575;
						}

						&::-moz-placeholder {
							color: #757575;
						}

						&:-ms-input-placeholder {
							color: #757575;
						}

					}

					.open {
						width: 177px;
						height: 64px;
						box-sizing: border-box;
						background: url(@/assets/pcimg/pwred/btnhb.png) no-repeat center;
						background-size: 100%;
						margin: 21px auto 0;
					}

				}

				.award-wrap {
					display: flex;
					flex-direction: column;
					align-items: center;
					box-sizing: border-box;
					position: relative;
					width: 100%;
					margin-top: 6px;
					height: 275px;


					.red-wrap {
						display: flex;
						align-items: center;
						justify-content: center;
						flex-direction: column;
						background: url(@/assets/pcimg/pwred/light.png) no-repeat center;
						background-size: contain;
						width: 299px;
						height: 262px;
						color: #fff;


						.red-wrap-title {
							color: #FFF;

							font-size: 40px;
							font-style: normal;
							font-weight: 700;
						}

						.red-amount {
							display: flex;
							align-items: center;
							justify-content: center;
							margin-top: 15px;
							color: #E9C529;
							font-size: 36px;
							font-weight: 700;
						}


					}


				}

				.qq-group {
					text-align: center;
					color: #fff;
					font-size: 14px;
					position: relative;

					span {
						color: #E6AA07;
					}
				}



			}



		}

	}
}
</style>