<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import QRCode from "qrcodejs2-fix";
import html2Canvas from "html2canvas";
import { nextTick, onMounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import wechatTypeUrl from "@/assets/pcimg/recharge/wxpay.png";
import zfbTypeUrl from "@/assets/pcimg/recharge/alipay.png";
import taobaoTypeUrl from "@/assets/pcimg/recharge/taobao.png";
import jdTypeUrl from "@/assets/pcimg/recharge/jdpay.png";
import cardTypeUrl from "@/assets/pcimg/recharge/cardpay.png";
import { getRechargeList, userPay, payCard } from "@/network/api/recharge";
import { useStore } from "vuex";

import { _isMobile } from "@/util/common";
import useClipboard from "vue-clipboard3"
// import { el } from 'element-plus/es/locale';

const { toClipboard } = useClipboard();

const router = useRouter();
const store = useStore();
const rechargeList = ref([]);
const curRechageIndex = ref(0);
const curRechageType = ref({});
const showRechargeView = ref(false)	//computed(() => store.state.showRechargeView);

const curMoneyIndex = ref(-1);
const curMoneyItem = ref({ payAmountCny: 0.0, amount: 0.0, giveAmount: 0.0 });

const payTypeArray = {
	// bank: 1,
	alipay1: 1,
	alipay2: 2,
	wechat: 3,
	taobao: 4,
	jingdong: 5,
	cardpay: 6,
};

const steamShow = ref(false);

const qrCodeDivRef = ref(null);
const qrCodeShow = ref(false);

// const showPayHelp = ref( false )

const isPaying = ref(false);

const agreementChecked = ref(false);

/// 卡密号码
const cardSecret = ref("");
const cardNo = ref("");
const showCardHelp = ref(false);
const isImg = ref(false);
const payUrl = ref(null);

async function bindQRCode(v) {
	window.$dev && console.log("进入方法")
	isImg.value = false
	qrCodeShow.value = true;
	await nextTick();
	qrCodeDivRef.value.innerHTML = "";

	if (v.indexOf("data:image") !== -1) {
		payUrl.value = v;
		isImg.value = true;
		window.$dev && console.log("判断为图片路径")
	}
	else {
		window.$dev && console.log("判断不为图片路径")
		new QRCode(qrCodeDivRef.value, {
			text: decodeURI(v),
			width: 220,
			height: 220,
			colorDark: "#000", //二维码颜色
			colorLight: "#fff", //二维码背景色
			correctLevel: QRCode.CorrectLevel.L, //容错率，L/M/H
		});
	}

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
const tipShow = computed(() => store.state.showRechargeView)

onMounted(() => {
	// getRechargeType();
});

function verify() {
	showRechargeView.value = true
}

function onClickCopyId() {
	copy(store.state.userId + "");
}
async function copy(value) {
	try {
		await toClipboard(value);
		Success({ offset: 100, message: t('common.copySuccess') });
	} catch (e) {
		Warn({ offset: 100, message: t('common.copyFail'), customClass: "error" });
	}
}

async function getRechargeType() {
	let res = await getRechargeList();
	if (res.code == 0) {
		let items = res.data.items || [];
		rechargeList.value = items;
		let length = rechargeList.value.length;

		let typeCount = [0, 0, 0];
		let typeIndex = [0, 0, 0];
		for (let i = 0; i < length; i++) {
			let item = rechargeList.value[i];
			item.items = item.items || [];
			typeCount[item.payType - 1] += 1;
		}

		for (let i = 0; i < length; i++) {
			let item = rechargeList.value[i];
			if (typeCount[item.payType - 1] > 1) {
				typeIndex[item.payType - 1] += 1;
				item.typeIndex = typeIndex[item.payType - 1];
			}
		}

		if (length > 0) {
			curRechageIndex.value = 0;
			curRechageType.value = rechargeList.value[0];

			if (curRechageType.value.items.length > 0) {
				curMoneyIndex.value = 0;
				curMoneyItem.value = curRechageType.value.items[0];
			}
		}
	}
}

function getRechargeTypeTitle(type) {
	switch (type) {
		case 4:
			return t('recharge.taobaoApp');

		case 5:
			return t('recharge.jingdongApp');
	}
}


async function handlePay() {
	// window.$dev && console.log( curRechageType.value )
	if (isPaying.value) return;
	isPaying.value = true;
	let spreadVid = localStorage.getItem("bd_vid");
	let res = await userPay({
		amountId: curMoneyItem.value.id,
		returnUrl: location.origin,
		spreadVid: spreadVid,
	});
	isPaying.value = false;
	if (res.code == 0) {
		let payUrl = res.data.payUrl;
		if (payUrl) {
			if (_isMobile()) {
				if (curRechageType.value.payMode == 1) {
					console.log("类型为1")
					window.open(payUrl, "_self");
				} else if (curRechageType.value.payMode == 2) {
					console.log("类型为2")
					bindQRCode(payUrl);
					qrCodeShow.value = true;
				}
			}
			else {
				// if(curRechageType.value.id==9){
				//		 Warn('该支付通道不支持PC，请用手机支付');
				//		 return
				// }
				// window.$dev && console.log( curRechageType.value )
				if (curRechageType.value.payType == 6) {
					window.open(payUrl, "_blank");
				} else {
					console.log("类型为6")
					bindQRCode(payUrl);
					qrCodeShow.value = true;
				}
			}
		} else {
			Warn({
				offset: 100,
				message: t('recharge.linkFail'),
				customClass: "error",
			});
		}
	}
}

function onQRCodeSure() {
	qrCodeShow.value = false;
	store.dispatch("getUserInfo");
}

function onclickType(item, index) {
	curRechageIndex.value = index;
	curRechageType.value = item;
	// window.$dev && console.log( item )

	curMoneyIndex.value = 0;
	if (curRechageType.value.items.length > 0) {
		curMoneyItem.value = curRechageType.value.items[0];
	} else {
		// curMoneyItem.value.payAmountCny = 0;
		// curMoneyItem.value.id = 0;
		curMoneyItem.value = { id: 0, payAmountCny: 0, amount: 0.0, giveAmount: 0 };
	}
}

function openNewWindows(href) {
	window.open(href, "_blank");
}

function onClickMoneyItem(item, index) {
	curMoneyItem.value = item;
	curMoneyIndex.value = index;
	// handlePay();
}

function onClickSure() {
	// if (store.state.userInfoExt.steamUrl === '') {
	//		 steamShow.value = true;
	//		 return;
	// }
	if (curMoneyItem.value.id == 0) {
		Warn({ offset: 100, message: t('recharge.changeMoney'), customClass: "error" });
		return;
	}

	handlePay();
}

//关闭
function close() {
	steamShow.value = false;
	qrCodeShow.value = false;
}

function onBindSteam() {
	steamShow.value = false;
	router.push("/m/personal");
}

function getRechargeTypeIcon(item) {
	let name = "";

	switch (item.payType) {
		case payTypeArray.alipay1:
		case payTypeArray.alipay2:
			return (name = zfbTypeUrl);
		case payTypeArray.wechat:
			return (name = wechatTypeUrl);
		case payTypeArray.taobao:
			return (name = taobaoTypeUrl);
		case payTypeArray.jingdong:
			return (name = jdTypeUrl);
		case payTypeArray.cardpay:
			return (name = cardTypeUrl);
	}
	// return name;
}

function getRegTypeName(item, index) {
	let name = t('recharge.pay');
	switch (item.payType) {
		// case payTypeArray.bank :
		//		 name = '银行卡'
		case payTypeArray.alipay1:
		case payTypeArray.alipay2:
			name = t('recharge.alipay')
			break;
		case payTypeArray.wechat:
			name = t('recharge.weixinPay')
			break;
		case payTypeArray.taobao:
			name = t('recharge.taobaopay')
			break;
		case payTypeArray.jingdong:
			name = t('recharge.jingdongPay')
			break;

		case payTypeArray.cardpay:
			name = t('recharge.cardPay')
			break;
	}
	if (index) {
		name = name + index;
	}
	return name;
}

function onClickClose() {
	cardNo.value = "";
	cardSecret.value = "";
	showRechargeView.value = false
	store.commit("setRechargeView", false);
}
function setAgreemenChecked() {
	agreementChecked.value = !agreementChecked.value;
}

watch(
	showRechargeView,
	(newTab, pretab) => {
		if (newTab) {
			getRechargeType();
		}
	}
);

function clear() {
	return (cardSecret.value = cardSecret.value.replace(/[^\w\.\/]/gi, ""));
}

async function payByCardKey() {
	await clear();

	if (cardSecret.value.trim() == "" || cardSecret.value == "")
		return Warn({
			offset: 100,
			message: t('recharge.enterCardNoAndPassword'),
			customClass: "error",
		});

	if (cardSecret.value.length != 27) return Warn(t('recharge.cardNoOrPasswordFail'));

	// if( cardNo.value.trim() == '' || cardNo.value == '' )
	//		 return Warn( { offset : 100, message : '请输入卡号', customClass : 'error' } )

	// if( !/^([A-Za-z]{2})([0-9]{10})$/g.test( cardNo.value ) || cardNo.value.length != 12 )
	//		 return Warn( { offset : 100, message : '您输入的卡号有误，请重新输入', customClass : 'error' } )

	// if( cardSecret.value.trim() == '' || cardSecret.value == '' )
	//		 return Warn( { offset : 100, message : '请输入卡密', customClass : 'error' } )

	// if( !/^(\d+)$/g.test( cardSecret.value ) || cardSecret.value.length != 15 )
	// {
	//		 cardSecret.value = ''
	//		 return Warn( { offset : 100, message : '请输入有效的卡密', customClass : 'error' } )
	// }

	let no = cardSecret.value.slice(0, 12);
	let secret = cardSecret.value.slice(12);

	isPaying.value = true;
	let res = await payCard({
		cardSecret: secret,
		cardNo: no,
		id: curRechageType.value.id,
	});
	// window.$dev && console.log( res )
	isPaying.value = false;

	if (res.code == 0) {
		cardSecret.value = "";
		cardNo.value = "";
		Success({ offset: 100, message: t('recharge.rechargeSuccess') });
		store.dispatch("getUserInfo");
	}
}

function closeTip() {
	store.commit("setRechargeView", false)
}

</script>

<template>
	<div id="pc-recharge">
		<van-overlay :show="tipShow" style="background-color: rgba(0, 0, 0, 0.7)" :z-index="200" :lock-scroll="false">
			<div class="recharge-tip-container">
				<div class="header">
					<p>{{ t('redpack.acceptAgreementTitle') }}</p>
					<div class="closeBtn" @click="closeTip">
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
		<van-overlay :show="showRechargeView" style="background-color: rgba(0, 0, 0, 0.7)" :z-index="999999">
			<div class="wrapper">
				<div class="pc-recharge-main">
					<div class="close" @click="onClickClose">
						<img src="@/assets/pcimg/recharge/close.png" alt="" />
					</div>
					<div class="recg-title">
						<div class="title">{{ t('recharge.title') }}</div>
						<!-- <div class="sub-title">
							{{ t( 'recharge.userId' ) }}：<span>{{ store.state.userId }}</span>
							<svg @click="onClickCopyId" class="icon-c">
								<use xlink:href="/src/assets/icon.svg#copy"></use>
							</svg>
						</div> -->
					</div>
					<div class="recharge-wrap">
						<div class="type-wrap">
							<div class="rechatge-tile">{{ t('recharge.method') }}</div>
							<div class="recharge-type-list">
								<div class="recharge-type-item" v-for="(item, index) in rechargeList" :key="index"
									@click="onclickType(item, index)" :class="{ active: curRechageIndex == index }">
									<!-- <div class="quan">
										<img src="@/assets/pcimg/recharge/quan2.png" alt="" />
									</div> -->
									<div class="item-info">
										<img :src="getRechargeTypeIcon(item)" alt="" />
										<div class="info1">
											<!-- <p>{{ getRegTypeName(item, item.typeIndex) }}</p> -->
											<!-- <p>即刻</p> -->
											<!-- <p>{{ getRegTypeName(item, item.typeIndex) }}</p> -->
											<p>{{ item.name }}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="amount-wrap">
							<div class="amount-tile">{{ t('recharge.changeMondy') }}</div>
							<div class="recharge-list-wrap">
								<div class="card-pay-container" v-if="curRechageType.payType == 6">
									<div class="help-tip-btn" @click="showCardHelp = true">
										{{ t('recharge.help') }}
									</div>
									<div class="card-pay-form">
										<div class="card-pay-input">
											<!-- <div class="pay-input card-number">
																								<input v-model="cardNo" placeholder="请输入卡号" type="text">
																						</div> -->
											<div class="pay-input">
												<input v-model="cardSecret"
													:placeholder="t('recharge.enterCardNoAndPassword')" type="text"
													@change="clear()" />
												<button :disabled="isPaying" @click="payByCardKey()"
													class="card-number-recharge">
													{{ t('recharge.cardRecharge') }}
												</button>
											</div>
										</div>
									</div>
								</div>

								<div class="recharge-item" v-for="(item, index) in curRechageType.items" :key="index"
									@click="onClickMoneyItem(item, index)" :class="[
										{
											active: index == curMoneyIndex,
										},
									]">
									<!-- <div class="quan"> <img src="@/assets/pcimg/recharge/quan2.png" alt="" /></div> -->
									<div class="price">
										<img src="@/assets/pcimg/common/coin.png" alt="" />{{
											item.amount
										}}
									</div>
									<!-- <div v-show="Number(item.giveAmount) != 0" class="give-wrap">
										{{ t( 'recharge.give' ) }}{{ item.giveAmount }}
									</div>
									<img
										v-show="index == curMoneyIndex"
										src="@/assets/pcimg/recharge/vector.png"
										class="checked"
									/> -->
								</div>
							</div>
						</div>

						<div class="result-wrap" v-if="curRechageType.payType != 6">
							<div class="reg-all">
								<p>{{ t('recharge.realPayment') }} {{ curMoneyItem.amount }}</p>
								<span>{{ t('recharge.receipt') }}
									<img src="@/assets/pcimg/common/coin.png" style="width: 24px" />
									{{
										Number(curMoneyItem.amount) +
										Number(curMoneyItem.giveAmount)
									}}</span>
							</div>
							<div class="btn-sure" id="pcdingdan" @click="onClickSure">
								<img v-if="isPaying" src="@/assets/pcimg/recharge/loding.png">
								{{ t('recharge.toPay') }}
							</div>
						</div>
						<div class="result-wrap" v-else>
							<div class="reg-all">
								<p>{{ t('recharge.realPayment') }} {{ curMoneyItem.amount }}</p>
								<span>{{ t('recharge.receipt') }}
									<img src="@/assets/pcimg/common/coin.png" style="width: 24px" />
									{{
										Number(curMoneyItem.amount) +
										Number(curMoneyItem.giveAmount)
									}}</span>
							</div>
							<div class="btn-sure" id="pcdingdan" @click="onClickSure">
								{{ t('buyCardNo') }}
							</div>
						</div>
					</div>
				</div>
				<van-overlay style="background-color: rgba(0, 0, 0, 0.7)" :show="qrCodeShow">
					<div class="pc-pop-code">
						<div class="pc-pop-code-bg">
							<div class="recg-title">
								{{ t('recharge.pay') }}
								<!-- <img src="@/assets/pcimg/recharge/help-center.png" @click="showPayHelp = true"> -->
							</div>
							<div class="close" @click="qrCodeShow = false">
								<img src="@/assets/pcimg/recharge/close.png" alt="" />
							</div>
							<!-- <div class="pay-tip" v-show="curRechageType.payType == 4">
																<div>您当前的用户D是： <code>{{store.state.userId}}</code> <span @click="onClickCopyId">（点击复制）</span></div>
																<div>第三方合作商铺需要正确输入用户ID</div>
														</div> -->
							<div class="qrCode-box">
								<div ref="qrCodeDivRef" id="qrCode">
									<img v-if="isImg" :src="payUrl" alt="">
								</div>
							</div>
							<div :class="{
								'pay-tip': true,
								taobao: curRechageType.payType == 4,
								jd: curRechageType.payType == 5,
							}" v-show="curRechageType.payType == 4 || curRechageType.payType == 5
	">
								<div
									v-html="t('recharge.payMethod', { method: getRechargeTypeTitle(curRechageType.payType) })">
								</div>
								<div>{{ t('recharge.scanTip') }}</div>
								<div class="userid"
									v-html="t('recharge.currentInfo', { userId: store.state.userId, area: 199 })"></div>
								<div class="more-tip">{{ t('recharge.tipText') }}</div>
							</div>
							<div class="qr-info" v-show="curRechageType.payType != 4 && curRechageType.payType != 5
								">
								<div class="info-item">
									{{ t('recharge.realPaymentMoney') }}<img src="@/assets/pcimg/common/coin.png"
										style="width: 24px" alt="" /><span>{{ curMoneyItem.amount }}</span>
								</div>
								<div class="info-item">
									{{ t('recharge.receiptMoney') }}<img src="@/assets/pcimg/common/coin.png"
										style="width: 24px" alt="" /><span>{{
											Number(curMoneyItem.amount) +
											Number(curMoneyItem.giveAmount)
										}}</span>
								</div>
							</div>
							<!-- <div class="pop-code-tip">
																<div>本人已满18岁且具有完全民事行为能力</div>
																<div>本人仅在经济承受范围内消费，且将为消费行为承担后果</div>
																<div>本人已知通过充值购买的虚拟物品不可退货或换货，且不根据七天无理由退换货主张权利</div>
																<div>本人已知饰品发起提取流程后，通常在24小时完成</div>
														</div> -->
						</div>
						<!-- <van-overlay style="background-color: rgba( 16, 16, 30, .9 )" :show="showPayHelp" @click="showPayHelp = false">
														<div class="help-img-container">
																<img src="@/assets/pcimg/recharge/pay-help.png">
														</div>
												</van-overlay> -->
					</div>
				</van-overlay>

				<van-overlay :show="showCardHelp" style="background-color: rgba(0, 0, 0, 0.7)" :z-index="200"
					@click="showCardHelp = false">
					<div class="card-help-content">
						<img src="@/assets/pcimg/help/help-content.png" />
					</div>
				</van-overlay>
			</div>
			<van-dialog v-model:show="steamShow" show-cancel-button :confirmButtonText="t('recharge.toBind')"
				:cancelButtonText="t('recharge.close')" @confirm="onBindSteam" @cancel="close">
				<p class="tip-text">{{ t('recharge.bindSteamTip') }}</p>
			</van-dialog>
		</van-overlay>
	</div>
</template>

<style lang="scss">
#pc-recharge {
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
			color: #cccbde;
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
				cursor: pointer; //鼠标变手
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
				cursor: pointer; //鼠标变手
				transition: all 0.3s ease;

				&:hover {
					background: #5a54ce;
				}
			}
		}
	}

	.card-help-content {
		position: fixed;
		z-index: 1000000;
		top: calc(50% - 688px / 2);
		left: calc(50% - 1204px / 2);
	}

	.van-overlay {
		z-index: 200 !important;

		.wrapper {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;

			.pc-recharge-main {
				width: 1060px;
				// height: 800px;
				padding-bottom: 47px;
				background: #100F1F;
				position: relative;
				display: flex;
				flex-direction: column;

				.close {
					width: 20px;
					height: 20px;
					position: absolute;
					right: 33px;
					top: 34px;
					cursor: pointer;

					img {
						width: 19px;
						height: 19px;
					}
				}

				.recg-title {
					color: #fff;
					font-size: 29px;
					font-weight: 700;
					// margin-left: 45px;
					// margin-top: 38px;
					display: flex;
					background: #141225;
					box-shadow: 0px 6px 8px 0px rgba(0, 0, 0, 0.25);
					height: 85px;
					// width: 274px;
					justify-content: space-between;
					// align-items: baseline;
					align-items: center;
					/* 垂直居中 */
					padding-left: 38px;
					box-sizing: border-box;

					.title {
						font-size: 24px;
						// width: 60px;
						padding: 0;
						margin: 0;
					}

					.sub-title {
						font-size: 16px;
						display: flex;
						align-items: center;
						justify-content: space-between;
						gap: 6px;
						font-weight: 200;

						span {
							color: #2cab40;

							font-size: 20px;
							font-weight: 500;
						}

						.icon-c {
							color: #fff;
							width: 22px;
							height: 22px;
							fill: currentColor;
							cursor: pointer; //鼠标变手
						}
					}
				}

				.recharge-wrap {
					display: flex;
					flex-direction: column;
					/* 子元素垂直排列 */
					width: 100%;
					margin-top: 30px;
					gap: 27px;

					.amount-wrap {
						display: flex;
						flex-direction: column;
						flex: 1;
						// height: 348px;
						padding: 0 42px;
						// margin-right: 40px;
						gap: 17px;
						box-sizing: border-box;

						.amount-tile {
							color: #FFF;

							font-size: 17.016px;
							font-style: normal;
							font-weight: 400;
							line-height: normal;
						}

						.card-pay-container {
							// height: 100%;
							width: 100%;
							display: flex;
							align-items: center;
							justify-content: center;
							height: 60px;
							margin-bottom: 28px;

							.help-tip-btn {
								position: absolute;
								top: 60px;
								right: 68px;
								font-size: 22px;
								color: #fff;
								text-decoration: underline;
								font-weight: 300;
								cursor: pointer;
							}

							.card-pay-form {
								// width: 503px;
								width: 100%;
								// height: 145px;
								height: 60px;
								display: flex;
								flex-direction: column;
								justify-content: space-between;

								.card-pay-input {
									display: flex;
									width: 100%; //calc( 213px * 3 );
									flex-direction: column;
									gap: 12px;

									.pay-input {
										display: flex;
										border-radius: 4px;
										border: 1px solid #393c4d;
										background: #191c34;
										height: 60px;
										box-sizing: border-box;

										&.card-number {
											width: 100%;

											input {
												width: 100%;
											}
										}

										input {
											border-radius: 4px;
											// border: 1px solid rgba(58, 57, 103, 0.40);
											// background: #FFF;
											background: transparent;
											border: none;
											color: #fff;
											// display: inline-flex;
											padding: 16.5px 12px;
											// align-items: flex-start;
											font-size: 14px;
											outline: none;
											width: calc(100% - 123px);
											box-sizing: border-box;

											&::placeholder {
												color: #494c6a;
											}
										}

										.card-number-recharge {
											border-radius: 4px;
											background: #3a34b0;
											display: flex;
											height: 59px;
											padding: 0px 22.241px 0px 22.365px;
											justify-content: center;
											align-items: center;
											color: #fff;
											width: 123px;
											border: none;
											font-size: 14px;
										}
									}
								}
							}
						}

						.recharge-list-wrap {
							// display: grid;
							flex-wrap: wrap;
							// grid-template-columns: repeat(auto-fill, 337px);
							// column-gap: 10px;
							// row-gap: 10px;
							display: flex;
							gap: 15px;
							// width: calc(213px * 3 + 20px);

							.recharge-item {
								// width: 337px;
								width: 150px; //calc( 100% / 3 );
								height: 150px;
								border-radius: 6px;
								// border: 1px solid #393c4d;
								box-sizing: border-box;
								position: relative;
								cursor: pointer;
								display: flex;
								align-items: center;
								overflow: hidden;
								background: #1C1A31;
								justify-content: center;

								.quan {
									display: flex;
									align-items: center;
									justify-content: center;
									background: url(@/assets/pcimg/recharge/quan.png) center no-repeat;
									background-size: 100% 100%;
									width: 22px;
									height: 22px;
									position: relative;
									margin-left: 17px;

									img {
										display: none;
										width: 14px;
										height: 14px;
									}
								}

								.price {
									color: #fff;
									font-size: 24px;
									font-weight: bold;

									// margin-left: 22px;
									// width: 180px;
									display: flex;
									align-items: center;
									justify-content: center;
									flex-direction: column;

									/* 子元素垂直排列 */
									img {
										width: 42px;
										height: 42px;
										margin-bottom: 20px;
									}
								}

								.give-wrap {
									// text-align: center;
									display: flex;
									align-items: center;
									justify-content: center;
									width: 100px;
									left: -28px;
									top: 12px;
									height: 19px;
									// line-height: 40px;
									font-size: 18px;
									background: #2cab40;
									box-sizing: border-box;
									// margin-left: 20px;
									transform: rotateZ(-45deg);
									color: #000;
									position: absolute;
									padding: 2px 0;
									box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2);
								}

								.checked {
									width: 14px;
									position: absolute;
									bottom: 4px;
									right: 2px;
									z-index: 100;
								}

								&.active {
									border-radius: 5px;
									border: 1px solid #665EB3;
									background: #1C1A31;
									box-shadow: 0px -8px 40px 0px rgba(102, 94, 178, 0.30) inset;

									// &::after {
									//	 content: "✔️";
									//	 color: #fff;
									//	 background: #2cab40;
									//	 position: absolute;
									//	 bottom: -8px;
									//	 right: -27px;
									//	 width: 80px;
									//	 height: 20px;
									//	 transform: rotateZ(-45deg);
									// }
									// background: #353C4F;

									// .quan {
									//		 img {
									//				 display: block;
									//		 }
									// }
								}
							}
						}
					}

					.type-wrap {
						display: flex;
						flex-direction: column;
						gap: 20px;

						// width: 294px;
						// height: 422px;
						// margin-right: 39px;
						.rechatge-tile {
							color: #FFF;

							font-size: 15.5px;
							font-style: normal;
							font-weight: 400;
							line-height: 16px;
							/* 103.226% */
							text-transform: uppercase;
							padding-left: 42px;

						}

						.recharge-type-list {
							display: flex;
							// flex-direction: column;
							box-sizing: border-box;
							padding: 0 42px;
							width: 100%;
							// height: 100%;
							flex-wrap: wrap;
							overflow-y: scroll;

							&::-webkit-scrollbar {
								width: 0px;
							}



							.recharge-type-item {
								position: relative;
								cursor: pointer;
								display: flex;
								align-items: center;
								width: 177px;
								height: 72px;

								.quan {
									display: flex;
									align-items: center;
									justify-content: center;
									background: url(@/assets/pcimg/recharge/quan.png) center no-repeat;
									background-size: 100% 100%;
									width: 22px;
									height: 22px;
									position: relative;
									margin-left: 43px;

									img {
										display: none;
										width: 14px;
										height: 14px;
									}
								}

								.item-info {
									margin-left: 19px;
									// border-bottom: 1px solid #333647;
									height: 100%;
									width: 209px;
									display: flex;
									align-items: center;

									img {
										width: 37px;
										height: 37px;
										margin-left: 8px;
									}

									.info1 {
										display: flex;
										flex-direction: column;
										margin-left: 20px;

										p {
											font-size: 16px;
											color: #ffffff;

											&:last-child {
												color: #858897;
												margin-top: 5px;
											}
										}
									}
								}

								&.active {
									border-radius: 4.618px;
									border: 1px solid rgba(102, 94, 179, 0.92);
									background: #1C1A31;
									box-shadow: 0px 0px 10px 1px rgba(102, 94, 179, 0.30) inset;
									box-sizing: border-box;
								}
							}
						}
					}

					.result-wrap {
						display: flex;
						// position: absolute;
						right: 64px;
						// bottom: 45px;
						// width: calc(213px * 3);
						bottom: 34px;
						justify-content: flex-end;
						flex-direction: column;
						/* 子元素垂直排列 */
						gap: 20px;

						.reg-all {
							display: flex;
							align-items: flex-end;
							border-radius: 6px;
							color: #fff;
							font-size: 21px;
							padding-left: 42px;
							box-sizing: border-box;
							gap: 37px;

							span {
								color: #fff;
								// 
								// font-size: 24px;
								margin-top: 3px;
								display: flex;
								align-items: center;

								img {
									margin: 0 4px 0 12px;
								}
							}
						}

						.btn-sure {
							display: flex;
							align-items: center;
							justify-content: center;
							width: 980px;
							height: 74px;
							border-radius: 6px;
							background: #3A34B0;
							color: #fff;
							font-size: 24px;
							cursor: pointer;
							margin: auto;
							gap: 28px;

							img {
								width: 32px;
								animation: rotateAnimation 1s infinite linear;
							}
						}

						@keyframes rotateAnimation {
							from {
								transform: rotate(360deg);
							}

							to {
								transform: rotate(0deg);
							}
						}

					}
				}
			}

			.pc-pop-code {
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100%;

				.help-img-container {
					width: 100%;
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;

					img {
						width: 800px;
					}
				}

				.pc-pop-code-bg {
					width: 784px;
					// height: 586px;
					background: #15172c;
					display: flex;
					flex-direction: column;
					position: relative;

					.recg-title {
						color: #fff;
						font-size: 29px;
						font-weight: 700;
						background: #191c34;
						display: flex;
						align-items: center;
						height: 95px;
						padding-left: 48px;
						// margin-left: 45px;
						// margin-top: 38px;
						// display: flex;
						// align-items: center;
						// gap: 24px;

						// img
						// {
						//		 width: 36px;
						// }
					}

					.close {
						width: 20px;
						height: 20px;
						position: absolute;
						right: 33px;
						top: 34px;
						cursor: pointer;

						img {
							width: 19px;
							height: 19px;
						}
					}

					// .pay-tip
					// {
					//		 color: #fff;
					//		 width: 100%;
					//		 font-size: 16px;
					//		 display: flex;
					//		 justify-content: center;
					//		 flex-direction: column;
					//		 align-items: center;
					//		 padding: 56px 0 0;
					//		 gap: 5px;

					//		 span,
					//		 code
					//		 {
					//				 color: #2CAB40;
					//				 cursor: pointer;
					//		 }
					// }

					.qrCode-box {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 254px;
						height: 254px;
						background: #fff;
						margin: 30px auto 0;
						position: relative;
					}

					.pay-tip {
						padding: 34px 0;
						display: flex;
						color: #fff;
						font-size: 29px;
						font-weight: 700;
						align-items: center;
						justify-content: center;
						flex-direction: column;
						padding-bottom: 60px;

						&.taobao {
							display: flex;
							align-items: center;
							font-size: 29px;
							height: 200px;
						}

						&.taobao {
							.userid {
								font-size: 29px;
								line-height: 100px;

								span {
									color: #f06d23;
								}

								// padding-top: 12px;
								// font-size: 32px;
								// height: 80px;
							}

							span {
								color: #f06d23;
							}
						}

						&.jd {
							.userid {
								color: #fe3018;
								// padding-top: 12px;
								// font-size: 32px;
								// height: 80px;
							}

							span {
								color: #fe3018;
							}
						}

						.more-tip {
							color: #ebbd31;
							font-size: 14px;
							font-weight: 400;
						}
					}

					.qr-info {
						display: flex;
						margin-top: 50px;
						color: #fff;
						font-size: 21px;
						font-weight: 700;
						justify-content: center;
						align-items: center;
						margin-bottom: 50px;

						.info-item {
							display: flex;
							align-items: center;
							margin: 0 24px;
							height: 24px;

							img {
								margin-left: 10px;
							}

							span {
								color: #75dc9e;

								font-size: 24px;
								font-weight: 500;
								margin-left: 5px;
								line-height: 24px;
							}
						}
					}

					.pop-code-tip {
						padding: 28px 40px;
						background: #191c34;
						color: #8b8e9e;
						font-size: 14px;
						font-style: normal;
						font-weight: 400;
						line-height: 19px;
						display: flex;
						gap: 5px;
						flex-direction: column;
					}
				}
			}

			.tip-text {
				width: 100%;
				text-align: center;
				font-size: 26px;
				margin-top: 80px;
				color: #fff;
			}

			.check-icon-wrap {
				display: flex;
				align-items: center;
				width: 19px;

				.checked-wrap {
					width: 19px;
					height: 17px;
				}

				.check-wrap {
					width: 17px;
					height: 17px;
					background: #272b49;
					border-radius: 3px 3px 3px 3px;
				}
			}
		}
	}
}
</style>