<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import {
	getActivityList,
	getRecords,
	openRedPacket,
} from "@/network/api/redpacket";
import { tokenName } from "@/config";
import Currency from "../common/Currency.vue";
import { useRoute, useRouter } from "vue-router"

const router = useRouter();
const store = useStore();

const PasswordRed = ref(null);
const rule_text = ref(null);

const Flip = ref("just"); //正反面 just/back
const tabType = ref("activity"); //红包分类
const redKey = ref(""); //口令
const open = ref(false); //开红包(交互)
const notice_show = ref(true); //公告是否加载(有bug)
const ios_com = ref(false); //ios不兼容3d转换(普通切换)

const recordList = ref([]); //红包领取记录
const allRed = ref([]); //活动红包列表
const activityRed = ref([]); //活动红包列表
const luckyRed = ref([]); //定时活动红包
const text = ref({
	lucky: t( 'redpack.luckyRule' ),
	activity: t( 'redpack.activityRule' ),
	register: "",
}); //规则

const redValue = ref("");
const ios_conclude = ref(false);
const qqGroupNumber = ref("858667815");

const btnOpenActive = ref(true); //防快速点击

let recordsListTimer = null;
let redpacketTimer = null;

onMounted(() => {
	qqGroupNumber.value =
		store.getters.getConfigItem("QQGroupNum") || "858667815";
	iosJudge();
	getRedpacketList();
});

watch(
	() => store.state.passRed,
	(newpw, prered) => {
		if (newpw) {
			startRedpacketListTime();
			startRecordsListTime();
		} else {
			stopRedpacketListTime();
			stopRecordsListTime();
		}
	}
);

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
	let params = {};
	params.platformId = store.state.platformId;
	let res = await getActivityList(params);
	if (res.code == 0) {
		let items = res.data.items || [];
		allRed.value = items;
		activityRed.value = items.filter((item) => {
			return item.type == 3;
		});
		luckyRed.value = items.filter((item) => {
			return item.type == 4;
		});
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
//判断ios，兼容滑动
function iosJudge() {
	const u = navigator.userAgent;
	const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
	ios_conclude.value = !isiOS;
}

//转换
function convert() {
	const u = navigator.userAgent;
	let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
	isiOS = true;
	if (isiOS) {
		ios_com.value = true;
	} else {
		Flip.value = "back";
	}
}

// ios兼容
function ios_to_red() {
	ios_com.value = false;
	store.commit("setPassRed", true);
}

//红包分类切换
function toswitch(type) {
	tabType.value = type;
}

//开红包
async function openRed(id) {
	if (!localStorage.getItem(tokenName)) {
		router.push("/m/sign");
		return;
	}
	if (redKey.value == "" && id == 0) {
		NotifyF( t( 'redpack.enterPassword' ) );
		return;
	}

	if (!btnOpenActive.value) return;
	btnOpenActive.value = false;

	let params = {};
	if (id != 0) {
		params.id = id;
	} else {
		params.password = redKey.value;
	}
	let res = await openRedPacket(params);

	btnOpenActive.value = true;

	if (res.code == 0) {
		redValue.value = res.data.amount;
		open.value = true;

		store.dispatch("getUserInfo");
		startRedpacketListTime();
		startRecordsListTime();
	} else {
		store.commit("setPassRed", false);
		router.push("/m/recharge");
	}
}

//继续领
function redContinue() {
	redValue.value = "";
	redKey.value = "";
	open.value = false;
}

//关闭
function close() {
	store.commit("setPassRed", false);
	redKey.value = "";
	setTimeout(() => {
		Flip.value = "just";
		open.value = false;
		ios_com.value = false;
	}, 300);
}

function subtime(v) {
	return v.substr(0, 16);
}

let redTypeIndex = ref(0);
function onClickRedTypeIndex(index) {
	redTypeIndex.value = index;
	// open.value = true;
}
</script>

<template>
	<div id="pw-packet" ref="PasswordRed">
		<div class="pw-packet-wrap" :class="{ active: store.state.passRed }">
			<div
				class="pw-packet-main"
				v-show="!ios_com"
				:class="{ active: Flip == 'just' }"
			>
				<div class="close" @click="close"></div>
				<div
					class=" "
					v-if="redTypeIndex == 1 || redTypeIndex == 0 || redTypeIndex == 2"
				>
					<div class="pw-packet-title-wrap">
						<div class="pw-packet-left-wrap">
							<div
								class="pw-packet-title-item"
								:class="{ active: redTypeIndex == 0 }"
								@click="onClickRedTypeIndex(0)"
							>
								{{ t( 'redpack.passwordRedpack' ) }}
							</div>
							<div
								class="pw-packet-title-item"
								:class="{ active: redTypeIndex == 1 }"
								@click="onClickRedTypeIndex(1)"
							>
								{{ t( 'redpack.activityRedpack' ) }}
							</div>
							<div
								class="pw-packet-title-item"
								:class="{ active: redTypeIndex == 2 }"
								@click="onClickRedTypeIndex(2)"
							>
								{{ t( 'redpack.luckyRedpack' ) }}
							</div>
						</div>
					</div>
					<div class="red-content" v-if="redTypeIndex == 0">
						<div class="top-wrap" v-if="!open">
							<img
								class="liwu-img"
								src="@/assets/romimg/pwred/liwu.png"
								alt=""
							/>
							<van-notice-bar :scrollable="false" :delay="3" v-if="notice_show">
								<van-swipe
									vertical
									class="notice-swipe"
									:autoplay="3000"
									:show-indicators="false"
								>
									<van-swipe-item
										v-for="(item, index) in recordList"
										:key="index"
									>
										{{ item.nickname }}<span>{{ t( 'redpack.won' ) }}</span>
										<img src="@/assets/romimg/common/c.svg" alt="" />
										{{ item.amount }}<span class="right">{{ t( 'redpack.redpack' ) }}</span>
									</van-swipe-item>
								</van-swipe>
							</van-notice-bar>
							<input
								type="text"
								:class="{ active: open }"
								v-model="redKey"
								maxlength="16"
								:placeholder="t( 'redpack.enterPassword' )"
							/>
							<!-- <div class="open" v-show="!open" @click="openRed(0)"></div> -->
						</div>
						<div class="bottom-wrap" v-if="open">
							<div class="red-wrap">
								<div class="red-wrap-title">{{ t( 'redpack.congratulation' ) }}</div>
								<img
									class="liwu-img"
									src="@/assets/romimg/pwred/liwu.png"
									alt=""
								/>
								<div class="red-amount">
									<currency
										:fontsize="24"
										fontcolor="white"
										:currency="redValue"
									></currency>
									<!-- {{ redValue }} <span>币</span> -->
								</div>
							</div>
							<!-- <div class="continue" v-show="open" @click="redContinue">
								继续领
							</div> -->
						</div>

						<!-- <div v-if="!open" class="qq-group" v-html="t( 'redpack.joinQQGroup', { qqGroupNumber : qqGroupNumber } )"></div> -->

						<div v-if="!open" class="open-btn-wrap" @click="openRed(0)">
							{{ t( 'redpack.open' ) }}
							<img
								@click.stop="redTypeIndex = 3"
								class="question"
								src="@/assets/romimg/pwred/question.png"
								alt=""
							/>
						</div>
						<div v-if="open" class="opened-btn-wrap" @click="redContinue">
							{{ t( 'redpack.continueToCollect' ) }}
						</div>

						<div class="common-tab-wrap" v-if="false">
							<div
								class="common-tab-item"
								:class="{ active: tabType == 'activity' }"
								@click="toswitch('activity')"
							>
								{{ t( 'redpack.activityRedpack' ) }}
							</div>
							<div
								class="common-tab-item"
								:class="{ active: tabType == 'lucky' }"
								@click="toswitch('lucky')"
							>
								{{ t( 'redpack.luckyRedpack' ) }}
							</div>
						</div>

						<div v-if="false" class="red-list-wrap">
							<div class="red-list-title">{{ t( 'redpack.rechargeRedpack' ) }}</div>
							<div
								class="red-item-wrap"
								v-for="(item, index) in allRed"
								:key="index"
							>
								<div class="red-item-total">
									<p>{{ t( 'redpack.totalPrize' ) }}</p>
									<span>{{ item.sumAmount }}</span>
								</div>
								<div class="red-item-data">
									<div class="red-item-title">
										<p>{{ item.title }}</p>
										<div
											class="red-item-btn"
											v-show="!item.isGet"
											@click="openRed(item.id)"
										>
											{{ t( 'redpack.receive' ) }}
										</div>
										<div v-show="item.isGet" class="red-item-btn end">
											{{ t( 'redpack.received' ) }}
										</div>
									</div>
									<div class="describe" v-html="t( 'redpack.receiveRule', { money : item.needAmount } )"></div>
									<div class="red-item-time">
										<span
											>{{ t( 'redpack.activityTime' ) }}：{{ subtime(item.startTime) }} —
											{{ subtime(item.endTime) }}</span
										>
									</div>
								</div>
							</div>
						</div>
						<div class="rule" v-if="false">
							<p @click="convert">{{ t( 'redpack.passwordRedpackRule' ) }}</p>
						</div>
					</div>
					<div class="act-red-content" v-if="redTypeIndex == 1">
						<div class="activity-contaner-wrap" v-if="activityRed.length > 0">
							<div
								class="activity-item-wrap"
								v-for="(item, index) in activityRed"
								:key="index"
							>
								<div class="activity-item-title">{{ item.title }}</div>
								<div class="amount-item-warp">
									{{ t( 'redpack.totalPrize' ) }}: {{ item.sumAmount }}
								</div>
								<div class="where-item-warp">
									<div>
										{{ t( 'redpack.receiveRuleText', { money : item.needAmount } ) }}
									</div>
									<div
										v-if="!item.isGet"
										class="get-btn"
										@click="openRed(item.id)"
									>
										{{ t( 'redpack.receive' ) }}
									</div>
									<div v-else class="get-btn opened">{{ t( 'redpack.receive' ) }}</div>
								</div>
							</div>
						</div>
						<div class="no-data-wrap" v-else>
							<img src="@/assets/romimg/pwred/liwu1.png" alt="" />
							<div class="desc">{{ t( 'redpack.comeSoonForRedpack' ) }}</div>
						</div>
					</div>
					<div class="act-red-content" v-if="redTypeIndex == 2">
						<div class="activity-contaner-wrap" v-if="luckyRed.length > 0">
							<div
								class="activity-item-wrap"
								v-for="(item, index) in luckyRed"
								:key="index"
							>
								<div class="activity-item-title">{{ item.title }}</div>
								<div class="amount-item-warp">
									{{ t( 'redpack.totalPrize' ) }}: {{ item.sumAmount }}
								</div>
								<div class="where-item-warp">
									<div>
										{{ t( 'redpack.receiveRuleText' ) }}
									</div>
									<div
										v-if="!item.isGet"
										class="get-btn"
										@click="openRed(item.id)"
									>
										{{ t( 'redpack.receive' ) }}
									</div>
									<div v-else class="get-btn opened">{{ t( 'redpack.receive' ) }}</div>
								</div>
							</div>
						</div>
						<div class="no-data-wrap" v-else>
							<img src="@/assets/romimg/pwred/liwu1.png" alt="" />
							<div class="desc">{{ t( 'redpack.comeSoonForLucky' ) }}</div>
						</div>
					</div>
					<div class="open-red-content" v-if="open">
						<div class="bottom-wrap">
							<div class="red-wrap">
								<div class="red-wrap-title">{{ t( 'redpack.congratulation' ) }}</div>
								<img
									class="liwu-img"
									src="@/assets/romimg/pwred/liwu.png"
									alt=""
								/>
								<div class="red-amount">
									<currency
										:fontsize="24"
										fontcolor="white"
										:currency="redValue"
									></currency>
									<!-- {{ redValue }} <span>币</span> -->
								</div>
							</div>
							<!-- <div class="continue" v-show="open" @click="redContinue">
								继续领
							</div> -->
						</div>
						<div class="opened-btn-wrap">
							<div v-if="open" class="opened-btn" @click="redContinue">
								{{ t( 'redpack.continueToCollect' ) }}
							</div>
						</div>
					</div>
				</div>
				<div v-if="redTypeIndex == 3">
					<div class="red-rule-title">{{ t( 'redpack.passwordRedpackRule' ) }}</div>
					<div class="rule-content">
						<div class="rule-text-title">{{ t( 'redpack.activityRedpack' ) }}:</div>
						<div class="ql-snow">
							<div
								class="ql-editor"
								style="max-height: none"
								v-html="text.activity"
							></div>
						</div>
						<div class="rule-text-title">{{ t( 'redpack.luckyRedpack' ) }}</div>
						<div class="ql-snow">
							<div
								class="ql-editor"
								style="max-height: none"
								v-html="text.lucky"
							></div>
						</div>
					</div>
					<div class="red-back">
						<p @click="redTypeIndex = 0">{{ t( 'redpack.back' ) }}</p>
					</div>
				</div>
			</div>
			<div class="red-ios-rule" :class="{ active: ios_com }">
				<div class="rule-title">{{ t( 'redpack.passwordRedpackRule' ) }}</div>
				<div class="close" @click="close()">
					<img src="@/assets/romimg/pwred/close.png" alt="" />
				</div>

				<div class="rule-text" ref="rule_text">
					<div class="rule-text-title">{{ t( 'redpack.activityRedpack' ) }}</div>
					<div class="ql-snow">
						<div
							class="ql-editor"
							style="max-height: none"
							v-html="text.activity"
						></div>
					</div>
					<div class="rule-text-title">{{ t( 'redpack.luckyRedpack' ) }}</div>
					<div class="ql-snow">
						<div
							class="ql-editor"
							style="max-height: none"
							v-html="text.lucky"
						></div>
					</div>
				</div>
				<div class="red-back">
					<p @click="ios_to_red">{{ t( 'redpack.backAndContinue' ) }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#pw-packet {
	.pw-packet-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		background: rgba($color: #000000, $alpha: 0.8);
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		z-index: -1;
		opacity: 0;
		color: #fff;
		transition: 0.2s;

		&.active {
			z-index: 200;
			opacity: 1;
		}

		.pw-packet-main {
			width: 520px;
			height: 790px;
			position: relative;
			transition: all ease-in 0.6s;
			transform-style: preserve-3d;
			perspective: 800px;
			background: url(@/assets/romimg/pwred/bg.png) no-repeat center bottom;
			background-size: contain;

			display: flex;
			flex-direction: column;
			.close {
				position: absolute;
				right: 20px;
				top: 30px;
				width: 36px;
				height: 36px;
			}

			.pw-packet-title-wrap {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20px 20px;
				height: 106px;
				width: 100%;
				box-sizing: border-box;
				.pw-packet-left-wrap {
					display: flex;
					justify-content: start;
					align-items: start;

					.pw-packet-title-item {
						color: rgba($color: #fff, $alpha: 0.6);
						font-size: 26px;
						font-style: normal;
						font-weight: 400;
						padding: 0 10px;
						// width: 120px;
						&.active {
							color: #fff;
							font-size: 28px;
							font-style: normal;
							font-weight: 700;
						}
					}
				}
			}

			.red-content {
				width: 480px;
				height: 552px;
				border-radius: 12px;
				border: 1px solid #344d8b;
				background: #293c6e;
				box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.05);
				box-sizing: border-box;
				margin: 0 auto;

				// transform: rotateY(180deg) translateZ(1px);
				// transform: rotateY(180deg);
				backface-visibility: hidden;
				-webkit-backface-visibility: hidden;
				-moz-backface-visibility: hidden;
				-ms-backface-visibility: hidden;
				transform-style: preserve-3d;
				-webkit-transform-style: preserve-3d;

				.top-wrap {
					display: flex;
					flex-direction: column;

					align-items: center;
					box-sizing: border-box;
					width: 100%;
					z-index: 1;
					transform: translateZ(1px);

					.liwu-img {
						width: 230px;
						height: 224px;
						margin-top: 30px;
					}

					.van-notice-bar {
						position: relative;
						width: 414px;
						height: 50px;
						background: transparent;
						border-radius: 5px;
						margin: 20px auto 0;
						z-index: 1;
						transform: translateZ(1px);
					}

					.notice-swipe {
						width: 414px;
						height: 50px;
						line-height: 50px;
						z-index: 1;

						.van-swipe-item {
							width: 100%;
							color: #fbfa02;
							display: flex;
							align-items: center;
							justify-content: center;
							font-size: 20px;
							z-index: 1;

							img {
								width: 28px;
								height: 28px;
								margin-right: 4px;
								vertical-align: middle;
							}

							span {
								color: #fff;
								margin-right: 4px;

								&.right {
									margin-right: 0;
									margin-left: 2px;
								}
							}
						}
					}

					input {
						display: block;
						position: relative;
						border-radius: 8px;
						border: 1px solid #395597;
						background: #344d8b;
						width: 400px;
						height: 80px;
						color: #d8dee8;
						text-align: center;
						font-size: 24px;
						z-index: 5;
						transform: translateZ(5px);
						margin-top: 20px;

						&::-webkit-input-placeholder {
							color: #d8dee8;
							font-size: 24px;
						}

						&::-moz-placeholder {
							color: #d8dee8;
							font-size: 24px;
						}

						&:-ms-input-placeholder {
							color: #d8dee8;
							font-size: 24px;
						}

						&.active {
							z-index: 1;
							transform: translateZ(1px);
						}
					}

					.open {
						width: 165px;
						height: 175px;
						box-sizing: border-box;
						background: url(@/assets/romimg/pwred/open.png) no-repeat center;
						background-size: 100%;
						margin: 21px auto 0;
					}
				}

				.bottom-wrap {
					display: flex;
					flex-direction: column;
					align-items: center;
					box-sizing: border-box;
					position: relative;
					width: 100%;
					z-index: 5;
					transform: translateZ(4px);
					margin-bottom: 20px;

					.red-wrap {
						// background: url(@/assets/romimg/pwred/red_bg.png) no-repeat center;
						background-size: contain;
						width: 511px;
						z-index: 2;
						margin-top: 10px;
						transition: 0.5s;
						color: #fff;
						.liwu-img {
							width: 270px;
							height: 262px;
							margin: 20px auto;
							display: flex;
							justify-content: center;
							align-items: center;
						}

						.red-wrap-title {
							// font-size: 24px;
							// color: #7b3e07;
							// margin: 35px auto 0px;
							// text-align: center;

							// color: #fff;

							// font-size: 24px;
							// font-style: normal;
							// font-weight: 700;

							margin: 30px auto 0px;
							color: #fff;

							font-size: 36px;
							font-style: normal;
							font-weight: 700;
							line-height: 80px; /* 200% */
							text-align: center;
						}

						.red-amount {
							// display: flex;
							// align-items: center;
							// justify-content: center;
							// font-size: 48px;
							// margin-top: 45px;
							// font-weight: bold;
							// color: #7b3e07;

							// span {
							//	 font-size: 24px;
							//	 font-weight: 400;
							//	 color: #7b3e07;
							//	 margin-top: 10px;
							//	 margin-left: 5px;
							// }
						}

						&.active {
							bottom: 400px;
							z-index: 2;
						}
					}

					.continue {
						width: 268px;
						height: 64px;
						background: url(@/assets/romimg/common/btn1.png) center no-repeat;
						background-size: contain;
						color: #34332d;
						font-size: 24px;
						font-weight: bold;
						margin: 20px auto 0;
						text-align: center;
						line-height: 64px;
					}
				}

				.qq-group {
					text-align: center;
					color: #fff3bf;
					font-size: 24px;
					position: relative;
					z-index: 8;
					transform: translateZ(8px);
					margin-top: 50px;

					//	 span {
					//		 color: #fbfa02;
					//		 font-weight: bold;
					//	 }
				}
				.open-btn-wrap {
					position: relative;
					margin: auto;
					margin-top: 65px;
					border-radius: 50px;
					background: #e9c529;
					color: #10170f;
					text-align: center;
					font-size: 32px;
					font-style: normal;
					font-weight: 700;
					width: 350px;
					height: 82px;
					line-height: 82px;
					.question {
						position: absolute;
						left: 370px;
						width: 36px;
						top: 20px;
					}
				}
				.opened-btn-wrap {
					margin: auto;
					margin-top: 90px;
					bottom: 0;
					border-radius: 50px;
					background: #e9c529;
					color: #10170f;
					text-align: center;
					font-size: 32px;
					font-style: normal;
					font-weight: 700;
					width: 350px;
					height: 82px;
					line-height: 82px;
					.question {
						position: absolute;
						left: 370px;
						width: 36px;
						top: 20px;
					}
				}
				.red-list-wrap {
					position: relative;
					box-sizing: border-box;
					width: 449px;
					height: 379px;
					background: #351010;
					border: 2px solid rgba(251, 250, 2, 0.57);
					border-radius: 5px;
					margin: 20px auto 0;
					overflow-x: hidden;
					overflow-y: scroll;
					-webkit-overflow-scrolling: touch;
					z-index: 8;
					transform: translateZ(8px);

					.red-list-title {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 204px;
						height: 44px;
						background: url(@/assets/romimg/pwred/list_title.png) center
							no-repeat;
						background-size: contain;
						font-size: 24px;
						color: #000000;
						margin: 0 auto;
					}

					.red-tip-wrap {
						text-align: center;
						margin-top: 100px;
						font-size: 32px;
					}

					.red-item-wrap {
						display: flex;
						margin: 20px 10px;
						box-sizing: border-box;
						color: #fff;
						position: relative;
						border-bottom: 2px solid #fbfa02;
						padding-bottom: 10px;

						.red-item-total {
							width: 115px;
							height: 80px;
							border: 2px solid #fbfa02;
							border-radius: 8px;
							text-align: center;
							padding-top: 5px;
							box-sizing: border-box;

							p {
								font-size: 24px;
								color: #fff;
							}

							span {
								font-size: 26px;
								color: #fbfa02;
							}
						}

						.red-item-data {
							// flex:1;
							width: 300px;
							margin-left: 10px;

							.red-item-title {
								display: flex;
								justify-content: space-between;
								align-items: center;

								p {
									font-size: 22px;
									width: 280px;
								}

								.red-item-btn {
									box-sizing: border-box;
									text-align: center;
									line-height: 38px;
									color: #000;
									font-size: 18px;
									width: 80px;
									height: 38px;
									background: #fbfa02;
									border: 2px solid #fbfa02;
								}
							}

							.describe {
								font-size: 18px;
								line-height: 1.7em;
								margin-top: 6px;
							}

							.red-item-time {
								font-size: 18px;
								margin-top: 4px;
							}
						}
					}

					&::-webkit-scrollbar {
						width: 5px;
						background-color: #34332d;
					}

					&::-webkit-scrollbar-track {
						border-radius: 10px;
						background-color: #34332d;
					}

					&::-webkit-scrollbar-thumb {
						border-radius: 10px;
						background-color: #fbfa02;
					}
				}

				.rule {
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 22px;
					font-weight: bold;
					color: #fbfa02;
					position: relative;
					z-index: 8;
					transform: translateZ(8px);
					margin-top: 13px;

					img {
						margin-left: 7px;
						width: 13px;
					}
				}
			}

			.act-red-content {
				width: 480px;
				height: 650px;

				box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.05);
				box-sizing: border-box;
				margin: 0 auto;

				// transform: rotateY(180deg) translateZ(1px);
				// transform: rotateY(180deg);
				backface-visibility: hidden;
				-webkit-backface-visibility: hidden;
				-moz-backface-visibility: hidden;
				-ms-backface-visibility: hidden;
				transform-style: preserve-3d;
				-webkit-transform-style: preserve-3d;

				.no-data-wrap {
					display: flex;
					justify-content: center;
					flex-direction: column;
					align-items: center;
					padding-top: 80px;
					box-sizing: border-box;
					img {
						width: 270px;
						height: 264px;
					}
					.desc {
						color: #fff;
						text-align: center;
						margin-top: 50px;
						font-size: 28px;
						font-style: normal;
						font-weight: 400;
					}
				}
				.activity-contaner-wrap {
					overflow-x: hidden;
					overflow-y: scroll;
					-webkit-overflow-scrolling: touch;
					background-color: transparent;
					height: 650px;
					.activity-item-wrap {
						border-radius: 12px;
						border: 1px solid #344d8b;
						background-color: #293c6e;
						width: 480px;
						height: 200px;
						box-sizing: border-box;
						margin-bottom: 10px;
						.activity-item-title {
							color: #fff;
							font-size: 28px;
							font-style: normal;
							font-weight: 700;
							height: 70px;
							line-height: 70px;
							border-bottom: 1px dashed #344d8b;
							margin: auto 20px;
						}
						.amount-item-warp {
							color: #e9c529;
							font-size: 24px;
							font-style: normal;
							font-weight: 400;
							margin: auto 20px;
							line-height: 40px;
						}
						.where-item-warp {
							display: flex;
							margin: auto 20px;
							.get-btn {
								margin-left: 30px;
								border-radius: 50px;
								background: #e9c529;
								display: inline-flex;
								width: 104px;
								height: 46px;
								flex-direction: column;
								justify-content: center;
								align-items: center;
								color: #10170f;
								&.opened {
									border-radius: 25px;
									background: #787d8a;
									color: #414141;
								}
							}
						}
					}
				}
				.activity-contaner-wrap::-webkit-scrollbar {
					display: none;
				}
			}

			.open-red-content {
				position: absolute;
				top: 106px;
				left: 19px;
				z-index: 10;

				width: 482px;
				height: 555px;

				margin: 0 auto;

				.bottom-wrap {
					border-radius: 12px;
					border: 1px solid #344d8b;
					background: #293c6e;
					box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.05);
					box-sizing: border-box;
					height: 552px;
					display: flex;
					flex-direction: column;
					align-items: center;
					box-sizing: border-box;
					position: relative;
					width: 100%;
					z-index: 5;
					transform: translateZ(4px);
					// margin-bottom: 20px;

					.red-wrap {
						// background: url(@/assets/romimg/pwred/red_bg.png) no-repeat center;
						background-size: contain;
						width: 511px;
						z-index: 2;
						margin-top: 10px;
						transition: 0.5s;
						color: #fff;
						.liwu-img {
							width: 270px;
							height: 262px;
							margin: 20px auto;
							display: flex;
							justify-content: center;
							align-items: center;
						}

						.red-wrap-title {
							// font-size: 24px;
							// color: #7b3e07;
							// margin: 35px auto 0px;
							// text-align: center;

							// color: #fff;

							// font-size: 24px;
							// font-style: normal;
							// font-weight: 700;

							margin: 30px auto 0px;
							color: #fff;

							font-size: 36px;
							font-style: normal;
							font-weight: 700;
							line-height: 80px; /* 200% */
							text-align: center;
						}

						.red-amount {
							// display: flex;
							// align-items: center;
							// justify-content: center;
							// font-size: 48px;
							// margin-top: 45px;
							// font-weight: bold;
							// color: #7b3e07;

							// span {
							//	 font-size: 24px;
							//	 font-weight: 400;
							//	 color: #7b3e07;
							//	 margin-top: 10px;
							//	 margin-left: 5px;
							// }
						}

						&.active {
							bottom: 400px;
							z-index: 2;
						}
					}

					.continue {
						width: 268px;
						height: 64px;
						background: url(@/assets/romimg/common/btn1.png) center no-repeat;
						background-size: contain;
						color: #34332d;
						font-size: 24px;
						font-weight: bold;
						margin: 20px auto 0;
						text-align: center;
						line-height: 64px;
					}
				}
				.opened-btn-wrap {
					background-color: #1e3a6b;
					height: 120px;
					padding-top: 20px;
					box-sizing: border-box;
					width: 100%;

					.opened-btn {
						margin: auto;
						bottom: 0;
						border-radius: 50px;
						background: #e9c529;
						color: #10170f;
						text-align: center;
						font-size: 32px;
						font-style: normal;
						font-weight: 700;
						width: 350px;
						height: 82px;
						line-height: 82px;
						.question {
							position: absolute;
							left: 370px;
							width: 36px;
							top: 20px;
						}
					}
				}
			}

			.red-rule-title {
				display: flex;
				justify-content: center;
				align-items: center;
				box-sizing: border-box;
				padding-top: 20px;
				height: 106px;
				width: 100%;
				color: #fff;
				font-size: 28px;
				font-style: normal;
				font-weight: 700;
			}

			.rule-content {
				margin: 0 20px;
				border-radius: 12px;
				border: 1px solid #344d8b;
				background: #293c6e;
				box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.05);

				color: #c0c9d9;
				font-size: 24px;
				font-style: normal;
				font-weight: 400;
				padding: 30px;
				width: 480px;
				height: 552px;
				box-sizing: border-box;
				overflow-x: hidden;
				overflow-y: scroll;
			}
			.rule-content::-webkit-scrollbar {
				display: none;
			}
			.red-rule {
				position: absolute;
				box-sizing: border-box;
				// background: url(@/assets/romimg/pwred/rule_bg.png) no-repeat center;
				// background-size: 100% 100%;
				// top: 0;
				// left: 0;
				width: 582px;
				height: 928px;
				backface-visibility: hidden;
				-webkit-backface-visibility: hidden;
				-moz-backface-visibility: hidden;
				-ms-backface-visibility: hidden;
				color: #fff;
				z-index: 0;
				transform: translateZ(5px);

				&.active {
					z-index: 0;
				}

				.red-rule-title {
					text-align: center;
					margin-top: 20px;
					font-size: 24px;
				}

				.close {
					position: absolute;
					width: 48px;
					height: 48px;
					right: -40px;
					top: -40px;

					img {
						width: 100%;
						height: 100%;
					}
				}

				.rule-text {
					box-sizing: border-box;
					width: 480px;
					height: 748px;
					margin: 30px auto 20px;
					overflow-y: hidden;
					font-size: 24px;
					color: #fff;

					.rule-text-title {
						color: #fbfa02;
					}

					&::-webkit-scrollbar {
						width: 5px;
						background-color: #34312d;
					}

					&::-webkit-scrollbar-track {
						border-radius: 10px;
						background-color: #34312d;
					}

					&::-webkit-scrollbar-thumb {
						border-radius: 10px;
						background-color: #fbfa02;
					}

					&.active {
						overflow-y: auto;
					}
				}

				.red-back {
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 22px;
					font-weight: bold;
					color: #fbfa02;
					position: relative;
					z-index: 8;
					margin-top: 10px;

					img {
						margin-right: 7px;
						width: 13px;
						transform: rotate(180deg);
					}
				}
			}
			.red-back {
				margin: auto;
				margin-top: 25px;
				border-radius: 50px;
				background: #e9c529;
				color: #10170f;
				text-align: center;
				font-size: 32px;
				font-style: normal;
				font-weight: 700;
				width: 260px;
				height: 82px;
				line-height: 82px;
			}

			&.active {
				// transform: rotateY(180deg);
			}
		}

		.red-ios-rule {
			position: absolute;
			width: 582px;
			height: 928px;
			background: url(@/assets/romimg/pwred/rule_bg.png) no-repeat center;
			background-size: 100% 100%;
			margin: auto;
			color: #fff;
			z-index: -1;
			opacity: 0;
			left: 0;
			top: 0;
			right: 0;
			bottom: 0;
			z-index: -1;
			opacity: 0;

			.rule-title {
				margin-top: 20px;
				text-align: center;
				font-size: 24px;
			}

			.close {
				position: absolute;
				width: 48px;
				height: 48px;
				right: -40px;
				top: -40px;

				img {
					width: 100%;
					height: 100%;
				}
			}

			.rule-text {
				box-sizing: border-box;
				width: 480px;
				height: 748px;
				margin: 30px auto 20px;
				overflow-y: hidden;
				font-size: 24px;
				color: #fff;

				.rule-text-title {
					color: #fbfa02;
				}

				&::-webkit-scrollbar {
					width: 5px;
					background-color: #34312d;
				}

				&::-webkit-scrollbar-track {
					border-radius: 10px;
					background-color: #34312d;
				}

				&::-webkit-scrollbar-thumb {
					border-radius: 10px;
					background-color: #fbfa02;
				}
			}

			.red-back {
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 22px;
				font-weight: bold;
				color: #fbfa02;
				position: relative;
				z-index: 8;
				margin-top: 10px;

				img {
					margin-right: 7px;
					width: 13px;
					transform: rotate(180deg);
				}
			}

			&.active {
				z-index: 900;
				opacity: 1;
			}
		}
	}
}
</style>
