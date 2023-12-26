<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import QRCode from "qrcodejs2-fix";
import html2Canvas from "html2canvas";
import { nextTick, onMounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { getRechargeList, userPay, payCard } from "@/network/api/recharge";
import { useStore } from "vuex";

import { _isMobile } from "@/util/common";
import useClipboard from "vue-clipboard3"
// import { el } from 'element-plus/es/locale';
import forgetPW from '@/components/pc/login/ForgetPW.vue';

const { toClipboard } = useClipboard();

const router = useRouter();
const store = useStore();
const rechargeList = ref([]);
const curRechageIndex = ref(0);
const curRechageType = ref({});
const cardCode = ref(null);
const cardSecrets = ref(null);
const userInfoExt = computed(() => store.state.userInfoExt);
const inputSteamContent = userInfoExt.steamUrl;
const showRechargeView = computed(() => store.state.showRechargeView); //ref( false )

/// 提示窗状态
const tipShow = ref(false)	//computed( () => store.state.showRechargeView )

const curMoneyIndex = ref(-1);
const curMoneyItem = ref({ payAmountCny: 0.0, amount: 0.0, giveAmount: 0.0 });



const payTypeArray = {
	bank: 1,
	alipay: 2,
	wechat: 3,
	taobao: 4,
	jd: 5,
	km: 6,
	ecny: 7,
	viBlan: 8,
	viMomo: 9,
	viVt: 10,
	skins: 11,
	chargeCard: 12

};

const banks = [
	new URL("@/assets/pcimg/recharge/ABC.png", import.meta.url)
		.href,
	new URL("@/assets/pcimg/recharge/mbBank.png", import.meta.url)
		.href,
	new URL("@/assets/pcimg/recharge/techcomBank.png", import.meta.url).href,
	new URL("@/assets/pcimg/recharge/BIDV.png", import.meta.url)
		.href,
];

const payTypeIcon = [
	new URL("@/assets/romimg/recharge/pay_money.png", import.meta.url)
		.href,
	new URL("@/assets/romimg/recharge/ic_alipay.png", import.meta.url)
		.href,
	new URL("@/assets/romimg/recharge/wxpay.png", import.meta.url).href,
	new URL("@/assets/romimg/recharge/icon_taobao.png", import.meta.url)
		.href,
	new URL("@/assets/romimg/recharge/icon_jd.png", import.meta.url).href,
	new URL("@/assets/romimg/recharge/icon_km.png", import.meta.url).href,
	new URL("@/assets/romimg/recharge/ecny.png", import.meta.url).href,
	new URL("@/assets/romimg/recharge/viBlan.png", import.meta.url).href,
	new URL("@/assets/romimg/recharge/viMomo.png", import.meta.url).href,
	new URL("@/assets/romimg/recharge/viVt.png", import.meta.url).href,
	new URL("@/assets/pcimg/recharge/csgo-skins.png", import.meta.url).href,
	new URL("@/assets/romimg/recharge/cardPay.png", import.meta.url).href,
];

const payTypeIconWithNames = [
	{ Rate: 0.18, name: "Viettel", url: new URL("@/assets/romimg/recharge/Viettel.png", import.meta.url).href, },
	{ Rate: 0.20, name: "Mobifone", url: new URL("@/assets/romimg/recharge/Mobifone.png", import.meta.url).href, },
	{ Rate: 0.20, name: "Vinaphone", url: new URL("@/assets/romimg/recharge/Vinaphone.png", import.meta.url).href, },
	{ Rate: 0.18, name: "Vietnamobile", url: new URL("@/assets/romimg/recharge/Vietnamobile.png", import.meta.url).href, },
	{ Rate: 0.18, name: "Zing", url: new URL("@/assets/romimg/recharge/Zing.png", import.meta.url).href, },
	{ Rate: 0.30, name: "Gate", url: new URL("@/assets/romimg/recharge/Gate.png", import.meta.url).href, },
	{ Rate: 0.29, name: "Vcoin", url: new URL("@/assets/romimg/recharge/Vcoin.png", import.meta.url).href, },
	{ Rate: 0.29, name: "Garena", url: new URL("@/assets/romimg/recharge/Garena.png", import.meta.url).href, }
];

const steamShow = ref(false);

const qrCodeDivRef = ref(null);
const qrCodeShow = ref(false);

// const showPayHelp = ref( false )

const isPaying = ref(false);

const agreementChecked = ref(false);

const bank = ref(null);
const card = ref(null);

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

	if (v.indexOf("data:image") !== -1) {
		payUrl.value = v;
		isImg.value = true;
		window.$dev && console.log("isImg.value值为", isImg.value)
		window.$dev && console.log("判断为图片路径")
		window.$dev && console.log("payUrl.value 路径为", payUrl.value)
	}
	else {
		qrCodeDivRef.value.innerHTML = "";
		window.$dev && console.log("isImg.value值为", isImg.value)
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

const bankType = ref(null);
const bankLeb = ref(0);

function setbankType(index) {
	if (index == 0) {
		bankType.value = "ACB";
		bankLeb.value = 0;
	} else if (index == 1) {
		bankType.value = "MB";
		bankLeb.value = 1;
	} else if (index == 2) {
		bankType.value = "TCB";
		bankLeb.value = 2;
	} else if (index == 3) {
		bankType.value = "BIDV";
		bankLeb.value = 3;
	}
}

function getRateByName(name) {
	const item = selectedCrads.value.find(item => item.name === name);
	console.log(item)
	return item ? item.Rate : null;
}

const cardLeb = ref(0);
const cardRate = ref(0);

function setCardType(item, index) {
	bankType.value = item.name;
	cardLeb.value = index;
	cardRate.value = getRateByName(bankType.value);
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

const selectedBanks = ref([]);
const selectedCrads = ref([]);


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
			if (item.payType == 12) {
				let obj = JSON.parse(item.reserve1);
				card.value = Object.entries(obj);
				console.log("card", card.value.length);
			}
			if (item.payType == 8) {
				let obj = item.reserve1;
				bank.value = JSON.parse(obj)
			}
		}

		selectedBanks.value = [];

		for (let i = 0; i < bank.value.length; i++) {
			let item = bank.value[i];
			if (item === "ACB") {
				selectedBanks.value.push(banks[0]); // 添加 ACB 对应的图片路径
			} else if (item === "MB") {
				selectedBanks.value.push(banks[1]); // 添加 MB 对应的图片路径
			} else if (item === "TCB") {
				selectedBanks.value.push(banks[2]); // 添加 TCB 对应的图片路径
			} else if (item === "BIDV") {
				selectedBanks.value.push(banks[3]); // 添加 BIDV 对应的图片路径
			}
		}

		selectedCrads.value = [];

		for (let i = 0; i < card.value.length; i++) {
			let item = card.value[i];
			// 遍历 payTypeIconWithNames 数组，查找匹配的 name 属性
			for (let j = 0; j < payTypeIconWithNames.length; j++) {
				if (item[0] === payTypeIconWithNames[j].name) {
					// 找到匹配的 name，可以执行相关操作
					selectedCrads.value.push(payTypeIconWithNames[j]);
				}
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

// const dataArray = [];

// for (const key in bank) {
//   if (bank.hasOwnProperty(key)) {
//     const item = { name: key, value: parseFloat(bank[key]) };
//     dataArray.push(item);
//   }
// }

// console.log(dataArray);

function getRechargeTypeTitle(type) {
	switch (type) {
		case 4:
			return t('recharge.taobaoApp');

		case 5:
			return t('recharge.jingdongApp');
	}
}


async function handlePay() {
	// window.$dev && window.$dev && console.log( curRechageType.value )
	if (isPaying.value) return;
	isPaying.value = true;
	let spreadVid = localStorage.getItem("bd_vid");
	let res = await userPay({
		amountId: curMoneyItem.value.id,
		returnUrl: location.origin,
		spreadVid: spreadVid,
		bankCode: bankType.value,
		cardCode: cardCode.value,
		cardSecret: cardSecrets.value,
	});
	isPaying.value = false;
	if (res.code == 0) {
		let payUrl = res.data.payUrl;
		if (payUrl) {
			if (_isMobile()) {
				if (curRechageType.value.payMode == 1) {
					window.$dev && console.log("类型为1")
					window.open(payUrl, "_self");
				} else if (curRechageType.value.payMode == 2) {
					window.$dev && console.log("类型为2")
					bindQRCode(payUrl);
					qrCodeShow.value = true;
				}
			} else {
				// if(curRechageType.value.id==9){
				//		 Warn('该支付通道不支持PC，请用手机支付');
				//		 return
				// }
				// window.$dev && window.$dev && console.log( curRechageType.value )
				if (curRechageType.value.payMode == 1) {
					let url = payUrl;
					window.$dev && console.log("类型为1")
					window.$dev && console.log(url)
					window.open(payUrl, "_self");
					// router.push({
					// 	path: url,
					// });
				} else if (curRechageType.value.payMode == 2) {
					window.$dev && console.log("类型为2")
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

	if (index != curRechageIndex.value) {
		bankLeb.value = 0;
		bankType.value = "";
		cardLeb.value = 0;
		if (item.payType == payTypeArray.viBlan) {
			setbankType(0);
		} else if (item.payType == payTypeArray.chargeCard) {
			setCardType(0);
		}
	}

	curRechageIndex.value = index;
	curRechageType.value = item;
	// window.$dev && window.$dev && console.log( item )

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
		Warn({ offset: 100, message: t('users.rechargeMoney'), customClass: "error" });
		return;
	}

	handlePay();
}

//关闭
function close() {
	steamShow.value = false;
	qrCodeShow.value = false;
}

// function onBindSteam() {
// 	steamShow.value = false;
// 	router.push("/p/personal");
// }

function onBindSteam() {
	console.log("进入到方法");
	let params = {};
	params.value.steamUrl = inputSteamContent.value;
	if (!inputSteamContent.value) {
		Warn({ offset: 100, message: t('common.inputNil'), customClass: 'error' })
	} else {
		bindSteam(params).then(res => {
			if (res.code == 0) {
				Success({ offset: 100, message: res.message });
				store.dispatch("getUserInfo");
			} else {
				inputSteamContent.value = userInfoExt.value.steamUrl;
			}

		})
	}
}

// function getPayTypeIcon(item) {
// 	return selectedCrads[item.payType - 1].url
// } 

function getRechargeTypeIcon(item) {
	// let name = "";

	// switch (item.payType) {
	// 	case payTypeArray.alipay1:
	// 	case payTypeArray.alipay2:
	// 		return (name = zfbTypeUrl);
	// 	case payTypeArray.wechat:
	// 		return (name = wechatTypeUrl);
	// 	case payTypeArray.taobao:
	// 		return (name = taobaoTypeUrl);
	// 	case payTypeArray.jingdong:
	// 		return (name = jdTypeUrl);
	// 	case payTypeArray.cardpay:
	// 		return (name = cardTypeUrl);
	// }
	return payTypeIcon[item.payType - 1]
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
			name = t('recharge.taobaoPay')
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
	// window.$dev && window.$dev && console.log( res )
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

						<div class="banks-sum" v-if="curRechageType.payType == 8">
							<div class="banks-text">
								{{ t('recharge.selectBankType') }}
							</div>
							<div class="banss">
								<div class="bans-warp" v-for="(item, index) in selectedBanks" :key="index"
									@click="setbankType(index)" :class="{ active: bankLeb == index }">
									<img :src="selectedBanks[index]">
								</div>
							</div>
						</div>

						<div class="card-warp" v-if="curRechageType.payType == 12">
							{{ t('recharge.selectCardType') }}
							<div class="card-body">
								<div v-for="(item, index) in selectedCrads" :key="index" @click="setCardType(item, index)"
									class="cards" :class="{ active: index == cardLeb }">
									<img :src="item.url" alt="">
									<div class="card-text">
										{{ item.name }}
										<p>{{ t('recharge.Rate') }}：{{ item.Rate }}%</p>
									</div>
								</div>
							</div>
						</div>

						<div class="amount-wrap">
							<div v-if="curRechageType.payType != 11" class="amount-tile">{{ t('users.rechargeMoney') }}
							</div>
							<div v-else class="amount-tile">
								<!-- {{ t( 'users.steamLink' ) }} -->
								<a
									href="https://steamcommunity.com/login/home/?goto=%2Fid%2Fme%2Ftradeoffers%2Fprivacy#trade_offer_access_url">
									{{ t('users.steamLink') }}</a>
							</div>
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
												<input v-model="inputSteamContent"
													:placeholder="t('recharge.enterCardNoAndPassword')" type="text"
													@change="clear()" />
												<button :disabled="isPaying" @click="payByCardKey()"
													class="card-number-recharge" v-if="inputSteamContent == null">
													{{ t('recharge.cardRecharge') }}
												</button>
											</div>
										</div>
									</div>
								</div>

								<div class="input-sp" v-if="curRechageType.payType == 11">
									<div class="input-wrap">
										<input type="text" v-model="inputSteamContent"
											:placeholder="t('recharge.bindSteamTip')">
										<div class="btn-sure" @click="onBindSteam">
											<svg class="icon-check">
												<use xlink:href="@/assets/icon.svg#check"></use>
											</svg>
										</div>
									</div>
								</div>

								<div class="recharge-warp" v-if="curRechageType.payType != 11">
									<div class="recharge-item" v-for="(item, index) in curRechageType.items" :key="index"
										@click="onClickMoneyItem(item, index)" :class="[
											{
												active: index == curMoneyIndex,
											},
										]">
										<div class="price">
											<!-- <img src="@/assets/pcimg/common/coin.svg" alt="" /> -->
											{{
												item.amount
											}}
										</div>
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

						<div class="card-warp" v-if="curRechageType.payType == 12">
							{{ t('recharge.fillInformation') }}
							<div class="card-body">
								<div class="card-info">
									<p>{{ t('recharge.serialNumber') }}</p>
									<input type="text" :placeholder="t('recharge.serialNumberCard')" v-model="cardCode">
								</div>
								<div class="card-info">
									<p>PIN</p>
									<input type="text" :placeholder="t('recharge.codeUnderSilverLayer')"
										v-model="cardSecrets">
								</div>
							</div>
						</div>

						<div class="result-wrap" v-if="curRechageType.payType != 6">
							<div class="reg-all">
								<p>{{ t('recharge.realPayment') }} : {{ curMoneyItem.payAmountCny }}</p>
								<span>{{ t('recharge.receipt') }} :
									<img src="@/assets/pcimg/common/coin.svg" style="width: 24px" />
									{{
										(Number(curMoneyItem.amount) +
											Number(curMoneyItem.giveAmount)) *
										(1 - cardRate).toFixed(2)
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
									<img src="@/assets/pcimg/common/coin.svg" style="width: 24px" />
									{{
										Number(curMoneyItem.amount) +
										Number(curMoneyItem.giveAmount)
									}}</span>
							</div>
							<div class="btn-sure" id="pcdingdan" @click="onClickSure">
								{{ t('recharge.buyCardNo') }}
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
								<img v-if="isImg" :src="payUrl" alt="">
								<div v-else ref="qrCodeDivRef" id="qrCode"></div>
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
									{{ t('recharge.realPaymentMoney') }}<img src="@/assets/pcimg/common/coin.svg"
										style="width: 24px" alt="" /><span>{{ curMoneyItem.amount }}</span>
								</div>
								<div class="info-item">
									{{ t('recharge.receiptMoney') }}<img src="@/assets/pcimg/common/coin.svg"
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
			<!-- <van-dialog
				v-model:show="steamShow"
				show-cancel-button
				:confirmButtonText="t( 'recharge.toBind' )"
				:cancelButtonText="t( 'recharge.close' )"
				@confirm="onBindSteam"
				@cancel="close"
			>
				<p class="tip-text">{{ t( 'recharge.bindSteamTip' ) }}</p>
			</van-dialog> -->
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

					.banks-sum {
						display: flex;
						flex-direction: column;
						/* 子元素垂直排列 */
						padding: 0 42px;
						gap: 17px;

						.banks-text {
							color: #FFF;

							font-size: 17.016px;
							font-style: normal;
							font-weight: 400;
							line-height: normal;
						}

						.banss {
							display: flex;
							;
							gap: 15px;

							.bans-warp {
								display: flex;
								justify-content: center;
								/* 水平居中 */
								align-items: center;
								/* 垂直居中 */
								width: 190px;
								height: 95px;
								background: #1C1A31;
								border-radius: 6px;

								img {
									width: 150px;
									height: 55px;
								}

								&.active {
									border: 1.6px solid #3A3A7E;
									background: #1C1F39;
									box-shadow: 0px 0px 20px 1px rgba(41, 34, 139, 0.50) inset;
								}
							}
						}
					}

					.card-warp {
						display: flex;
						flex-direction: column;
						/* 子元素垂直排列 */
						padding: 0 40px;
						color: #FFF;

						font-size: 15.5px;
						font-style: normal;
						line-height: 16.02px;
						/* 103.357% */
						gap: 17px;

						.card-body {
							display: flex;
							flex-wrap: wrap;
							gap: 10px;
							width: 100%;

							.card-text {
								display: flex;
								flex-direction: column;

								/* 子元素垂直排列 */
								p {
									color: #939393;
								}
							}

							.card-info {
								display: flex;
								align-items: center;
								/* 垂直居中 */
								width: 400px;
								height: 60px;
								border-radius: 6px;
								border: 1px solid #1E2037;
								background: #1C1F39;
								padding: 0px 15px;
								gap: 20px;
								color: #969494 !important;

								p {
									color: #FFF;
									text-align: center;

									font-size: 15px;
									font-style: normal;
									font-weight: 500;
									line-height: 15px;
									/* 100% */
								}

								input {
									width: 70%;
									background: #1C1F39;
									border: 1px solid #1C1F39;
								}

								input::placeholder {
									color: #969494;
									/* 更改占位符文本颜色 */
									font-size: 15px;
									/* 更改占位符文本字体大小 */
									/* 添加其他样式，如字体家族等，根据需要 */
								}
							}

							.cards {
								display: flex;
								align-items: center;
								/* 垂直居中 */
								width: 155px;
								height: 60px;
								padding: 0 10px;
								background: #15172C;
								box-sizing: border-box;
								border-radius: 8px;
								gap: 8px;
								color: #DCDCDC;
								leading-trim: both;
								text-edge: cap;

								font-size: 12.578px;
								font-style: normal;
								font-weight: 700;
								line-height: 19.25px;

								/* 153.043% */
								&.active {
									border-radius: 4.618px;
									border: 1px solid rgba(102, 94, 179, 0.92);
									background: #1C1A31;
									box-shadow: 0px 0px 10px 1px rgba(102, 94, 179, 0.30) inset;
								}

								img {
									width: 50px;
									height: 40px;
								}
							}
						}

					}

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

							a {
								color: #61F4AB;
							}
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

							.input-sp {
								height: 200px;

								.input-wrap {
									display: flex;
									width: 750px;
									height: 49px;
									margin-bottom: 10px;
									border-radius: 6px;
									background: #1C1F39;
									padding: 0 0 0 10px;

									input {
										flex: 1;
										border: none;
										background: none;
										box-sizing: border-box;
										font-size: 16px;
										color: #8D8D8D;
									}

									.btn-sure {
										display: flex;
										width: 50px;
										// height: 32px;
										justify-content: center;
										align-items: center;
										border-radius: 10px;
										background: #3A34B0;
										cursor: pointer;

										.icon-check {
											display: inline-block;
											vertical-align: middle;
											fill: currentColor;
											width: 14px;
											height: 10px;
											color: #fff;
											position: relative;
										}
									}
								}
							}

							.recharge-warp {
								display: flex;
								flex-wrap: wrap;
								gap: 15px;

								.recharge-item {
									// width: 337px;
									width: 110px; //calc( 100% / 3 );
									height: 70px;
									border-radius: 6px;
									// border: 1px solid #393c4d;
									box-sizing: border-box;
									position: relative;
									cursor: pointer;
									display: flex;
									align-items: center;
									overflow: hidden;
									background: #1C1F39;
									justify-content: center;
									border: 1px solid #1E2037;

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
										color: #FFF;
										text-align: center;

										font-size: 15px;
										font-style: normal;
										font-weight: 500;
										line-height: 15px;
										/* 100% */
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
							gap: 15px;

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
								background: #1C1A31;
								border-radius: 4.618px;

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
