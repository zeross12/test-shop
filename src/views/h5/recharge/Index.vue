<script setup>
import QRCode from "qrcodejs2-fix";
import html2Canvas from "html2canvas";
import { nextTick, onMounted, ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import wechatImgUrl from "@/assets/romimg/recharge/wxpay.png";
import zfbImgUrl from "@/assets/romimg/recharge/ic_alipay.png";
import { getRechargeList, userPay, payCard } from "@/network/api/recharge";
import { useStore } from "vuex";

import { _isMobile } from "@/util/common";
import { getVipLevelList } from "@/network/api/user";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import Currency from "@/components/h5/common/Currency.vue";
import ShowDialog from "@/components/h5/common/ShowDialog.vue";
import useClipboard from "vue-clipboard3";
import { useI18n } from 'vue-i18n'
// import { el } from "element-plus/es/locale";
const { t } = useI18n()
// import { el } from "element-plus/es/locale";
const { toClipboard } = useClipboard();

const userInfoBase = computed(() => store.state.userInfoBase);
const userInfoExt = computed(() => store.state.userInfoExt);
const inputSteamContent = userInfoExt.steamUrl;
const router = useRouter();
const store = useStore();
const rechargeList = ref([]);
const curRechageIndex = ref(0);
const curRechageType = ref({});

const curMoneyIndex = ref(0);
const curMoneyItem = ref({});

// vip等级列表
const levelList = ref([]);
// 当前累计充值金额
const chargeAmount = ref(0);
// 当前vip等级
const level = ref(userInfoBase.value.userLevel);

// 最小等级金额
const minVipAmount = ref(0);
// 下个等级
const nextVipLevel = ref(0);
// 距离下个等级还需要
const nextVipAmount = ref(0);

const bankType = ref(null);

const rechargeType = {
	youmiZFB: 1,
	youmiWX: 2,
	jiujiaZFB: 3,
	jiujiaWX: 4,
};

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

const banks = [
	{ name: "ABC", url: new URL("@/assets/romimg/recharge/ABC.png", import.meta.url).href, },
	{ name: "MB", url: new URL("@/assets/romimg/recharge/mbBank.png", import.meta.url).href, },
	{ name: "TBK", url: new URL("@/assets/romimg/recharge/techcomBank.png", import.meta.url).href, },
	{ name: "BIDV", url: new URL("@/assets/romimg/recharge/BIDV.png", import.meta.url).href, }
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

// 新增选择支付方式弹框
const payTypeBoxMes = ref(false);
const wxType = ref(false);
const zfbType = ref(true);


const qrCodeDivRef = ref(null);
const qrCodeShow = ref(false);

const cardCode = ref(null);
const cardSecret = ref(null);

const bank = ref(null);
const cards = ref(null);

const isApplyPay = ref(false);
const applyProducts = ref([]);

const isPaying = ref(false);
const card = reactive({ cardNo: "", cardSecret: "" });

const noticeMsg = ref("");
let showDialog = ref(false);
let showPic = ref(false);
const isImg = ref(false);
const payUrl = ref(null);

async function bindQRCode(v) {
	qrCodeShow.value = true;
	await nextTick();
	qrCodeDivRef.value.innerHTML = "";
	isImg.value = false;
	if (v.indexOf("data:image") !== -1) {
		payUrl.value = v;
		isImg.value = true;
		window.$dev && console.log("isImg.value值为", isImg.value)
		window.$dev && console.log("判断为图片路径")
		window.$dev && console.log("payUrl.value 路径为", payUrl.value)
	}
	else {
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

store.commit("setFooterView", false);

onMounted(() => {
	if (isApplyPay.value) {
		initApplyPay();
	} else {
		getRechargeType();
	}
	getVipLevelRecord();

	setTimeout(() => {
		if (
			store.state.userInfoExt.idNumber === "" ||
			store.state.userInfoExt.realName === ""
		) {
			noticeMsg.value = t('recharge.pleaseConfirmOld');
			steamShow.value = true;
		} else {
			showDialog.value = true;
		}
	}, 500);
});

// 获取vip等级列表
async function getVipLevelRecord() {
	const res = await getVipLevelList();
	if (res.code === 0) {
		let items = res.data.items || [];
		let cAmount = res.data.chargeAmount || 0;
		levelList.value = items;
		chargeAmount.value = cAmount;
		getVipRate();
	}
}

const bankLeb = ref(0);

function setbankType(Type) {
	if (Type == 0) {
		bankType.value = "ACB";
		bankLeb.value = 0;
	} else if (Type == 1) {
		bankType.value = "MB";
		bankLeb.value = 1;
	} else if (Type == 2) {
		bankType.value = "TCB";
		bankLeb.value = 2;
	} else if (Type == 3) {
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

function getVipRate() {
	let levelArr = levelList.value;
	let cAmount = Number(chargeAmount.value);
	let nextIndex = 0; // 下一级索引
	let num = 0;
	if (levelArr.length == 0) {
		return;
	}
	let result = levelArr.filter((item, index) => {
		if (Number(item.needAmount) > cAmount) {
			if (nextIndex < 1) {
				nextIndex = index;
			}
			return item;
		}
	});
	// 获取下个等级
	let nextVip = {};
	if (result.length > 0) {
		nextVip = result[0];
	} else {
		nextVip = levelArr[levelArr.length - 1];
		nextIndex = levelArr.length - 1;
	}
	nextVipLevel.value = nextVip.level;
	minVipAmount.value = Number(levelArr[0].needAmount);

	let nextAmount = parseFloat(nextVip.needAmount); // 下个等级所需金额
	let preAmount = parseFloat(levelArr[nextIndex - 1].needAmount); // 上个等级所需金额
	nextVipAmount.value = parseFloat(nextAmount - cAmount);
	if (nextVipAmount.value == 0) {
		level.value = levelArr[levelArr.length - 1].level; // 当前等级10
	} else {
		level.value = levelArr[nextIndex - 1].level; // 当前等级
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

		for (let i = 0; i < length; i++) {
			let item = rechargeList.value[i];
			item.items = item.items || [];

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
					console.log(`找到匹配项：${item[0]}`);
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

async function handlePay() {
	if (
		store.state.userInfoExt.idNumber === "" ||
		store.state.userInfoExt.realName === ""
	) {
		noticeMsg.value = t('recharge.pleaseConfirmOld');
		steamShow.value = true;
		return;
	}

	if (isPaying.value) return;
	isPaying.value = true;
	let spreadVid = localStorage.getItem("bd_vid");
	let res = await userPay({
		amountId: curMoneyItem.value.id,
		returnUrl: location.origin,
		spreadVid: spreadVid,
		bankCode: bankType.value,
		cardCode: cardCode.value,
		cardSecret: cardSecret.value,

	});
	isPaying.value = false;

	if (res.code == 0) {
		let payUrl = res.data.payUrl;
		if (payUrl) {
			if (_isMobile()) {
				window.$dev && console.log("进入上部分判断")
				if (curRechageType.value.payMode == 1) {
					window.$dev && console.log("类型为1");
					if (curRechageType.value.payType == payTypeArray.km) {
						setTimeout(() => window.open(payUrl, "_blank"));
					} else {
						window.open(payUrl, "_self");
					}
				} else if (curRechageType.value.payMode == 2) {
					window.$dev && console.log("类型为2");
					bindQRCode(payUrl);
					qrCodeShow.value = true;
				}
			} else {
				// if(curRechageType.value.id==9){
				//     Notify('该支付通道不支持PC，请用手机支付');
				//     return
				// }
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

				// window.$dev && console.log("类型为6")
				// bindQRCode(payUrl);
				// qrCodeShow.value = true;
			}
		} else {
			window.$dev && console.log("错误")
			NotifyF(t('recharge.linkFail'));
		}
	}
}

async function initApplyPay() {
	inAppPurchase
		.getProducts(["iapay_id_6"])
		.then(function (products) {
			window.$dev && console.log(products);
			/*
					[{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', currency: '...', price: '...', priceAsDecimal: '...' }, ...]
			*/
			let proArr = [];

			for (let i = 0; i < products.length; i++) {
				let proItem = {};
				let product = products[i];
				proItem.amount = product.price;
				proItem.giveAmount = 0;
				proItem.payAmountCny = product.price;
				proArr.push(proItem);
			}
			applyProducts.value = proArr;
		})
		.catch(function (err) {
			window.$dev && console.log(err);
		});
}

async function applyPay() {
	inAppPurchase
		.buy("iapay_id_6")
		.then(function (data) {
			window.$dev && console.log(data);
			/*
							{
								transactionId: ...
								receipt: ...
								signature: ...
							}
						*/
		})
		.catch(function (err) {
			window.$dev && console.log(err);
		});
}

function saveQRCode() {
	html2Canvas(qrCodeDivRef.value).then((canvas) => {
		// let link = document.createElement("a");
		// link.href = canvas.toDataURL("image/jpeg", 1);
		// link.setAttribute("download", "199skins.png");
		// link.style.display = "none";
		// document.body.appendChild(link);
		// link.click();
		convertCanvasToImg(canvas);
	});
}

function convertCanvasToImg(canvas) {
	// canvas转base64 转 blob
	var myBlob = dataURLtoBlob(canvas.toDataURL("img/png", 0.92));
	// blob转URL对象
	let myUrl = URL.createObjectURL(myBlob);
	// 创建a标签，下载图片
	downImg(myUrl);
}
function downImg(url) {
	// 创建a标签 并设置其相关属性，最后触发其点击事件

	let a = document.createElement("a");
	let clickEvent = document.createEvent("MouseEvents");
	a.setAttribute("href", url);
	a.setAttribute("download", "199skins");
	a.setAttribute("target", "_blank");
	clickEvent.initEvent("click", true, true);
	a.dispatchEvent(clickEvent);
}

function dataURLtoBlob(dataurl) {
	var arr = dataurl.split(","),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new Blob([u8arr], { type: mime });
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

	if (curRechageType.value.items.length > 0) {
		if (curRechageType.value.items.length > curMoneyIndex.value) {
			curMoneyItem.value = curRechageType.value.items[curMoneyIndex.value];
		} else {
			curMoneyIndex.value = 0;
			curMoneyItem.value = curRechageType.value.items[0];
		}
	} else {
		// curMoneyItem.value.payAmountCny = 0;
		// curMoneyItem.value.id = 0;
		curMoneyItem.value = { id: 0, payAmountCny: "0", giveAmount: "0" };
	}
	if (item.payType == payTypeArray.taobao) {
		copy(false);
	}
}

function onClickMoneyItem(item, index) {
	curMoneyItem.value = item;
	curMoneyIndex.value = index;
}

function onClickApplyItem(item, index) {
	curMoneyItem.value = item;
	curMoneyIndex.value = index;
}

function onClickSure() {
	// if (store.state.userInfoExt.steamUrl === '') {
	//		 steamShow.value = true;
	//		 return;
	// }
	if (!userOkNeedFlag.value) {
		showDialog.value = true;
		return;
	}
	if (curMoneyItem.value.id == 0) {
		NotifyF(t('recharge.changeMondy'));
		return;
	}

	if (isApplyPay.value) {
		applyPay();
		return;
	}

	handlePay();
}

// 选择支付方式 type	wx 是微信 zfb 是支付宝
function changePayType(type) {
	if (type == "wx") {
		wxType.value = true;
		zfbType.value = false;
	} else if (type == "zfb") {
		wxType.value = false;
		zfbType.value = true;
	}
}

//关闭
function close() {
	steamShow.value = false;
	qrCodeShow.value = false;
	// this.getPersonalData()
}

function onBindSteam() {
	steamShow.value = false;
	// router.push("/m/personal");
	router.push({ path: "/m/personalEdit", query: { type: "realName" } });
}

function getRechargeTypeName(item) {
	let name = t('recharge.pay');
	if (item.payType == payTypeArray.bank) {
		//银行卡
		name = t('recharge.bankCardPayment');
	} else if (item.payType == payTypeArray.alipay) {
		name = t('recharge.alipay');
	} else if (item.payType == payTypeArray.wechat) {
		//微信
		name = t('recharge.weixinPay');
	} else if (item.payType == payTypeArray.taobao) {
		//微信
		name = t('recharge.taobaoPay');
	} else if (item.payType == payTypeArray.jd) {
		//微信
		name = t('recharge.jingdongPay');
	} else if (item.payType == payTypeArray.km) {
		//微信
		name = t('recharge.cardPay');
	} else if (item.payType == payTypeArray.ecny) {
		//微信
		name = t('recharge.digitalRmb');
	} else if (item.payType == payTypeArray.viBlan) {
		//微信
		name = t('recharge.VnBankCard');
	} else if (item.payType == payTypeArray.viMomo) {
		//微信
		name = t('recharge.VnMomo');
	} else if (item.payType == payTypeArray.viVt) {
		//微信
		name = t('recharge.VnVt');
	} else if (item.payType == payTypeArray.chargeCard) {
		//微信
		name = "Card Pay";
	}
	return name;
}

let userNeeds = ref([
	{
		selected: false,
		text: t('recharge.needAcceptAgreement'),
	},
	{
		selected: false,
		text: t('recharge.shipRule'),
	},
	{
		selected: false,
		text: t('recharge.noInduction'),
	},
	{
		selected: false,
		text: t('recharge.rationalConsumption'),
	},
	{
		selected: false,
		text: t('recharge.isSelf'),
	},
]);

let allChecked = computed(() => {
	let result = true;
	for (let i = 0; i < userNeeds.value.length; i++) {
		if (!userNeeds.value[i].selected) {
			result = false;
		}
	}
	return result;
});

async function copy(flag) {
	try {
		let value = JSON.stringify(store.state.userId);
		await toClipboard(value);
		if (flag) {
			Notify(t('common.copySuccess'));
		}
	} catch (e) {
		NotifyF(t('common.copyFail'));
	}
}

function hideUserNeed() {
	showDialog.value = false;
	window.$dev && console.log("showDialog.value", showDialog.value);
}
let userOkNeedFlag = ref(true);
function userOkNeed() {
	showDialog.value = false;
	userOkNeedFlag.value = true;
}

async function onClickKMPay() {
	if (card.cardSecret == "") {
		NotifyF(t('recharge.enterCard'));
		return;
	}
	card.cardSecret = card.cardSecret.replace(/[^\w\.\/]/gi, "");
	let cardno = card.cardSecret.substring(0, 12);
	let cardsecret = card.cardSecret.substring(12);

	var reg12 = /^[a-zA-Z]{2}\d{10}$/;
	if (!reg12.test(cardno)) {
		NotifyF(t('recharge.enterCorrectNumber'));
		return;
	}

	var reg15 = /^\d{15}$/;
	if (!reg15.test(cardsecret)) {
		NotifyF(t('recharge.enterCorrecCard'));
		return;
	}

	let res = await payCard({
		cardNo: cardno,
		cardSecret: cardsecret,
		id: curRechageType.value.id,
	});

	if (res.code == 0) {
		store.dispatch("getUserInfo");
		Notify(
			t('recharge.rechargeSuccessful') +
			(parseFloat(res.data.amount) + parseFloat(res.data.recvAmount)).toFixed(
				2
			)
		);
		card.cardNo = "";
		card.cardSecret = "";
	}
}

function handleKeyup() {
	card.cardSecret = card.cardSecret.replace(/[^\w\.\/]/gi, "");
}
</script>

<template>
	<div id="recharge" class="min-wrap-height">
		<div class="container">
			<TopTitleBack></TopTitleBack>
			<div class="level-wrap">
				<img src="@/assets/romimg/personal/ic_level.png" />
				<div class="score">
					{{ t('vip.stillFromNextLevel') }} <span>{{ nextVipAmount }}</span>
				</div>
			</div>
			<div class="recharge-wrap">
				<div class="recharge-type" v-if="!isApplyPay">
					<div class="recharge_title">
						<img src="@/assets/romimg/recharge/pay_tag.png" /> {{ t('recharge.method') }}
					</div>
					<div class="recharge-type-list">
						<div v-for="(item, index) in rechargeList" :key="index" @click="onclickType(item, index)">
							<div class="recharge-type-item" :class="{ active: curRechageIndex == index }">
								<div class="name">
									<img :src="payTypeIcon[item.payType - 1]" />
									<div>
										{{ getRechargeTypeName(item) }}
									</div>
								</div>
								<div class="viBanks" v-if="item.payType == payTypeArray.viBlan && curRechageIndex == index">
									<div class="recharge-bank" v-for="(item, index) in selectedBanks" :key="index"
										@click="setbankType(index)" :class="{ active: bankLeb == index }">
										<img :src="selectedBanks[index].url">
										{{ selectedBanks[index].name }}
									</div>
									<!-- <div class="recharge-bank" :class="{active: bankLeb == 1}" @click="setbankType(1)">
											<img src="@/assets/romimg/recharge/ABC.png">
											Acb Bank
										</div>
										<div class="recharge-bank" :class="{active: bankLeb == 2}" @click="setbankType(2)">
											<img src="@/assets/romimg/recharge/mbBank.png">
											Mb Bank
										</div>
										<div class="recharge-bank" :class="{active: bankLeb == 3}" @click="setbankType(3)">
											<img src="@/assets/romimg/recharge/techcomBank.png">
											techcom Bank
										</div>
										<div class="recharge-bank" :class="{active: bankLeb == 4}" @click="setbankType(4)">
											<img src="@/assets/romimg/recharge/BIDV.png">
											Bidv Bank
										</div> -->
								</div>
								<div class="cards-pay"
									v-if="item.payType == payTypeArray.chargeCard && curRechageIndex == index">
									<div v-for="(item, index) in selectedCrads" :key="index"
										@click="setCardType(item, index)" class="card"
										:class="{ active: index == cardLeb }">
										<img :src="item.url" alt="">
										<div class="card-text">
											{{ item.name }}
											<p>{{ t('recharge.Rate') }}：{{ item.Rate }}</p>
										</div>
									</div>
								</div>
								<!-- <div>
									<a
										v-if="
											item.payType == payTypeArray.taobao ||
											item.payType == payTypeArray.km
										"
										@click="showPic = true"
										style="text-decoration-line: underline"
										>充值指南</a
									>
								</div> -->
							</div>
							<!-- <div
								class="type_tips"
								v-if="
									curRechageIndex == index &&
									(rechargeList[index].payType == payTypeArray.taobao ||
										rechargeList[index].payType == payTypeArray.jd ||
										rechargeList[index].payType == payTypeArray.km)
								"
								@click.stop="copy(true)"
							>
							{{ t('recharge.userId')}}：<span>{{ store.state.userId }}</span>
								<span class="copy">{{ t('common.copy')}}点击复制</span>
								<div class="tips">{{ t('recharge.tipText')}}第三方合作商铺需要正确输入用户ID</div>
								<div class="tips" style="color: red">
									{{ t('vip.stillFromNextLevel')}}*请注意，ID输入错误充值将无法入账
								</div>
							</div> -->
							<!-- <div
								class="type_tips"
								v-if="
									curRechageIndex == index &&
									rechargeList[index].payType == payTypeArray.km
								"
							>
								<div class="km-wrap">
									<input
										@change="handleKeyup"
										class="cardsecret"
										v-model="card.cardSecret"
										placeholder="请输入卡密"
									/>
									<div class="km-btn" @click="onClickKMPay">{{ t('vip.stillFromNextLevel')}}确认充值</div>
								</div>
							</div> -->
						</div>
					</div>
				</div>
				<div class="recharge_title" v-if="curRechageType.payType != 11">
					<img src="@/assets/romimg/recharge/banknote.png" />
					{{
						curRechageType.payType == payTypeArray.km
						? t('recharge.changeCarMondy')
						: t('recharge.changeMondy')
					}}
				</div>
				<p class="recharge_explain" v-if="curRechageType.payType != 11"> {{ t('recharge.rechargeGift') }}</p>
				<div class="recharge_title" v-if="curRechageType.payType == 11">
					<img src="@/assets/romimg/recharge/banknote.png" />
					{{ t('users.steamLink') }}
				</div>

				<div class="recharge-wrap" v-if="!isApplyPay">
					<div class="recharge-content-wrap">

						<div class="input-sp" v-if="curRechageType.payType == 11">
							<div class="input-wrap">
								<input type="text" v-model="inputSteamContent" :placeholder="t('recharge.bindSteamTip')">
								<!-- <div class="btn-sure" @click="onBindSteam">
									<svg class="icon-check">
										<use xlink:href="@/assets/icon.svg#check"></use>
									</svg>
								</div> -->
							</div>
						</div>

						<div class="recharge-list-wrap" v-if="curRechageType.payType != 11">
							<div class="recharge-item" v-for="(item, index) in curRechageType.items" :key="index"
								@click="onClickMoneyItem(item, index)" :class="{ active: index == curMoneyIndex }">
								<div>
									<Currency :currency="item.amount" :hiedPoint="true"></Currency>
								</div>

								<div v-show="Number(item.giveAmount) != 0" class="give-wrap">
									{{ t('recharge.giveAway') }}{{ item.giveAmount }}
								</div>
							</div>
						</div>
						<div class="card-warp" v-if="curRechageType.payType == 12">
							<div class="card-tile">
								<img src="@/assets/romimg/recharge/cardimg.png" alt="">
								{{ t('recharge.fillInformation') }}
							</div>
							<div class="card-input">
								<p>{{ t('recharge.serialNumber') }}</p>
								<input type="text" :placeholder="t('recharge.serialNumberCard')" v-model="cardCode">
							</div>
							<div class="card-input">
								<p>PIN</p>
								<input type="text" :placeholder="t('recharge.codeUnderSilverLayer')" v-model="cardSecret">
							</div>
						</div>
						<div class="recharge-tip">
							{{ t('recharge.confirmText') }}
						</div>
					</div>
				</div>

				<!-- <div class="recharge-amount">
					wadopiajwoi
				</div> -->

				<div class="recharge-wrap" v-if="false">
					<!-- <div class="re-title">{{ t('recharge.money')}}</div> -->
					<div class="recharge-content-wrap">
						<div class="recharge-list-wrap">
							<div class="recharge-item" v-for="(item, index) in applyProducts" :key="index"
								@click="onClickMoneyItem(item, index)" :class="{ active: index == curMoneyIndex }">
								{{ item.amount }}
								<div v-show="Number(item.giveAmount) != 0" class="give-wrap">
									{{ t('recharge.give') }}{{ item.giveAmount }}
								</div>
							</div>
						</div>
						<div class="recharge-money-data">
							<div class="recharge-money-item">
								<p>{{ t('recharge.realPaymentMoney') }}</p>
								<span>{{ curMoneyItem.payAmountCny }}</span>
							</div>
							<div class="recharge-money-item">
								<p>{{ t('recharge.receiptMoney') }}</p>
								<span>{{
									Number(curMoneyItem.amount) + Number(curMoneyItem.giveAmount)
								}}</span>
							</div>
						</div>

						<div class="recharge_main_btn" @click="onClickSure">{{ t('vip.stillFromNextLevel') }}</div>
						<div class="recharge-tip">
							{{ t('recharge.confirmText') }}
						</div>
					</div>
				</div>
			</div>

			<van-overlay :show="qrCodeShow">
				<div class="pop-code">
					<div class="pop-code-bg">
						<div class="pop-code-title">
							<img src="@/assets/romimg/recharge/viBlan.png" alt="" />Bank QR
							<span class="icon iconfont close" @click="onQRCodeSure">&#xe637;</span>
						</div>
						<div class="qrCode_box">
							<div class="qrCode_box_bg">
								<img v-if="isImg" :src="payUrl" alt="">
								<div ref="qrCodeDivRef" id="qrCode" class="qrCode"></div>

							</div>
							<div class="qrCode_save_btn" @click="saveQRCode">{{ t('recharge.saveQrCode') }}</div>
						</div>
						<div class="qrCode_bottom">
							<div class="left-wrap">
								<img src="@/assets/romimg/recharge/scan.png" />
							</div>
							<div>
								<div class="qr-notice">
									{{ t('recharge.pleaseUse') }}{{
										curRechageType.payType == payTypeArray.wechat
										? t('recharge.weixin')
										: t('recharge.zhifubao')
									}}{{ t('grade.scanIt') }}
								</div>
								<div class="qr-notice">{{ t('recharge.payMethod') }}</div>

								<!-- <div class="pop-code-btn" @click="saveQRCode">保存二维码</div> -->
								<!-- <div class="pop-code-btn" @click="onQRCodeSure">已确定充值</div> -->
							</div>
						</div>
					</div>
				</div>
			</van-overlay>
			<!-- show-cancel-button cancelButtonText="取消"		@cancel="close" -->
			<!-- <van-dialog
				v-model:show="steamShow"
				:confirmButtonText=" t('users.goRealnameTitle')"
				@confirm="onBindSteam"
			>
				<p class="tip-text">{{ noticeMsg }}</p>
			</van-dialog> -->
		</div>
		<div class="fixed-bottom">
			<div class="recharge-money-data">
				<div class="recharge-money-item">
					{{ t('recharge.realPaymentMoney') }}：
					<span>
						<!-- <Currency
							:currency="curMoneyItem.payAmountCny"
							:hiedPoint="true"
						></Currency> -->
						{{ curMoneyItem.payAmountCny }}
					</span>
				</div>
				<div class="recharge-money-item arrival_amount">
					{{ t('recharge.receiptMoney') }} ：
					<span>
						<Currency :currency="(Number(curMoneyItem.amount) + Number(curMoneyItem.giveAmount)) *
							(1 - cardRate).toFixed(2)
							" :hiedPoint="true"></Currency>
					</span>
				</div>
			</div>

			<div class="recharge_main_btn" @click="onClickSure" id="h5dingdan">
				{{
					curRechageType.payType == payTypeArray.km ? t('recharge.buyCardNo') : t('notify.confirm')
				}}
			</div>
		</div>
		<div class="showPIC" v-show="showPic && curRechageType.payType == payTypeArray.taobao" @click="showPic = false">
			<img src="@/assets/romimg/recharge/jiaocheng.png" />
		</div>

		<div class="showPIC" v-show="showPic && curRechageType.payType == payTypeArray.km" @click="showPic = false">
			<img src="@/assets/romimg/recharge/jiaocheng_km.png" />
		</div>

		<!-- :disable="!allChecked" -->
		<ShowDialog :btn-type="1" :cancel-show="false" :show="false" @ok="userOkNeed" @cancel="hideUserNeed">
			<div class="dialog-x-content">
				<div class="dialog-row-wrap">{{ t('recharge.acceptAgreementTitle') }}</div>
				<!--   :class="{ unchecked: !item.selected }" -->
				<div class="dialog-row-wrap" v-for="(item, index) in userNeeds" :key="index"
					@click="item.selected = !item.selected">
					<!-- <img
				v-if="item.selected"
				src="@/assets/romimg/recharge/checked.png"
				alt=""
			/>
			<img v-else src="@/assets/romimg/recharge/unchecked.png" alt="" /> -->
					<div style="font-weight: 700">{{ index + 1 }}、</div>
					<div>{{ item.text }}</div>
				</div>
				<!-- <div v-for="(item, index) in userNeeds">
			<img src="@/assets/rommimg/recharge/checked.png" alt="" />
			{{ item.text }}
			</div> -->
			</div>
		</ShowDialog>

		<div class="loding-warp" v-if="isPaying">
			<div class="loding-body">
				<img src="@/assets/pcimg/recharge/loding.png">
			</div>
		</div>

	</div>
</template>

<style lang="scss">
#recharge {
	box-sizing: border-box;
	width: 750px;
	min-height: calc(100vh - 200px);

	display: flex;
	flex-direction: column;
	background-color: #15172c;

	.loding-warp {
		display: flex;
		justify-content: center;
		/* 水平居中 */
		align-items: center;
		/* 垂直居中 */
		position: fixed; //创建弹窗背景
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, .7);
		left: 0;
		top: 0;
		z-index: 200;

		.loding-body {
			display: flex;
			justify-content: center;
			/* 水平居中 */
			align-items: center;
			/* 垂直居中 */
			width: 360px;
			height: 360px;
			border-radius: 8px;
			background: rgba(0, 0, 0, 0.90);

			img {
				width: 92px;
				animation: rotateAnimation 1s infinite linear;
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

	.showPIC {
		position: absolute;
		top: 0;
		width: 750px;
		z-index: 20000;

		img {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 750px;
		}
	}

	.van-dialog {
		.van-dialog__content {
			height: 100px;
		}

		.van-dialog__footer {
			display: flex !important;
			justify-content: center;
			height: 120px;

			.van-button {
				height: 88px;
				width: 200px !important;

				// margin: 0 40px;
				.van-button__content {
					width: 200px !important;
					font-size: 30px;
				}
			}
		}

		.van-dialog__confirm {
			width: 200px !important;
			flex: unset;
			margin-left: 50px;
		}

		.van-dialog__cancel {
			width: 200px !important;
			flex: unset;
		}
	}

	/* 设置一个包含内容的容器，高度为视口高度减去底部 div 的高度 */
	.container {
		width: 100%;
		background-color: #15172c;
		// height: calc(100vh - 180px); /* 100px 是底部 div 的高度 */
		// overflow-y: auto; /* 允许滚动 */
	}

	.recharge-money-data {
		display: flex;
		gap: 40px;
		// flex-direction: column;
		// box-sizing: border-box;

		.recharge-money-item {
			display: flex;
			text-align: center;
			align-items: center;
			/* 垂直居中 */
			color: #fff;
			box-sizing: border-box;
			font-size: 28px;
			font-style: normal;
			font-weight: 700;

			#currency-wrap {
				margin-left: 20px;

				.span1 {
					font-size: 30px;
					font-weight: 500;
				}

				.span2 {
					font-size: 26px;
					font-weight: 500;
				}
			}
		}

		.arrival_amount {
			padding-top: 10px;
		}
	}

	/* 固定底部 div 的样式 */
	.fixed-bottom {
		position: fixed;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: column;
		/* 子元素垂直排列 */
		bottom: 0;
		gap: 30px;
		width: 750px;
		left: 50%;
		transform: translate(-375px);
		height: 230px;
		border-top: 2px solid #111424;
		background: #16182e;
		// padding-left: 40px;
		// padding-right: 40px;
		padding: 10px 40px;
		box-sizing: border-box;

		.recharge-money-data {
			width: 100%;
			display: flex;
			// flex-direction: column;
			flex-direction: column;
			/* 子元素垂直排列 */
			box-sizing: border-box;
			gap: 10px;

			.recharge-money-item {
				display: flex;
				text-align: center;
				color: #fff;
				box-sizing: border-box;
				font-size: 28px;
				font-style: normal;
				font-weight: 700;

				#currency-wrap {
					margin-left: 20px;

					.span1 {
						font-size: 30px;
						font-weight: 500;
					}

					.span2 {
						font-size: 26px;
						font-weight: 500;
					}
				}
			}

			.arrival_amount {
				padding-top: 10px;
			}
		}

		.recharge_main_btn {
			width: 600px;
			height: 88px;
			display: flex;
			justify-content: center;
			align-items: center;
			text-align: center;
			color: #fff;
			font-size: 28px;
			font-style: normal;
			font-weight: 500;
			border-radius: 50px;
			background: #554bf7;
			box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
		}
	}

	.level-wrap {
		display: flex;
		align-items: center;
		justify-content: start;
		height: 104px;
		margin-left: 20px;
		margin-right: 20px;
		border-radius: 24px 24px 0px 0px;
		background: url(@/assets/romimg/personal/level_bg.png) no-repeat center;
		background-size: cover;
		padding-left: 28px;
		box-sizing: border-box;
		padding-right: 40px;

		img {
			width: 52px;
			height: 46px;
			margin-right: 20px;
		}

		.score {
			color: #4d362a;
			text-shadow: 0px 1px 0px #fef1de;
			font-size: 26px;
			font-style: normal;
			font-weight: 700;
		}
	}


	.card-warp {
		display: flex;
		flex-direction: column;
		/* 子元素垂直排列 */
		width: 710px;
		margin-top: 20px;
		gap: 30px;

		.card-tile {
			// width: 200px;
			// height: 200px;
			// background: #fff;
			display: flex;
			align-items: center;
			/* 垂直居中 */
			text-align: left !important;
			gap: 20px;
			color: #FFF;

			font-size: 32px;
			font-style: normal;
			font-weight: 400;
			line-height: 27.6px;
			/* 172.5% */
		}

		.card-input {
			display: flex;
			align-items: center;
			/* 垂直居中 */
			padding: 0 30px;
			// width: 710px;
			height: 130px;
			gap: 40px;
			border-radius: 6px;
			border: 1px solid #1E2037;
			background: #1C1F39;
			color: #969494 !important;
			font-size: 30px;

			p {
				color: #FFF;
				text-align: center;

				font-size: 30px;
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
				font-size: 30px;
				/* 更改占位符文本字体大小 */
				/* 添加其他样式，如字体家族等，根据需要 */
			}
		}
	}

	.recharge-wrap {

		padding: 30px 20px;
		box-sizing: border-box;

		.recharge_title {
			display: flex;
			justify-content: start;
			align-items: center;
			font-size: 32px;
			font-style: normal;
			font-weight: 400;
			color: #fff;

			img {
				width: 24px;
				height: 24px;
				margin-right: 20px;
			}
		}

		.recharge_explain {
			color: #6c6c6c;
			text-align: start;
			font-size: 24px;
			margin-left: 55px;
			font-style: normal;
			font-weight: 500;
			line-height: normal;
		}

		.recharge-type {
			display: flex;
			flex-direction: column;
			align-items: start;
			justify-content: center;
			box-sizing: border-box;
			width: 100%;
			color: #fff;
			// margin-bottom: 50px;

			.recharge-type-list {
				padding: 20px 0;

				.recharge-type-item {
					height: auto !important;
					display: flex;
					align-items: center;
					/* 垂直居中 */
					flex-wrap: wrap;
					gap: 30px;

					.cards-pay {
						width: 100%;
						display: flex;
						flex-wrap: wrap;
						gap: 10px;
						align-items: center;
						/* 垂直居中 */

						.card-text {
							display: flex;
							flex-direction: column;

							/* 子元素垂直排列 */
							p {
								color: #939393;
							}
						}

						.card {
							display: flex;
							align-items: center;
							/* 垂直居中 */
							background: #15172C;
							width: 300px;
							height: 120px;
							padding: 0 20px;
							box-sizing: border-box;
							border-radius: 16px;
							gap: 16px;
							font-size: 25px;

							img {
								width: 100px !important;
								height: 80px;
								margin: 0;
							}

							&.active {
								background: #363481;
							}
						}

						&.active {}
					}

					.viBanks {
						width: 100%;
						display: flex;
						flex-direction: column;
						/* 子元素垂直排列 */
						// flex-wrap: wrap;
						gap: 30px;
						align-items: center;

						/* 垂直居中 */
						.recharge-bank {
							display: flex;
							// justify-content: center; /* 水平居中 */
							align-items: center;
							/* 垂直居中 */
							width: 640px;
							height: 120px;
							border-radius: 16px;
							// margin-bottom: 30px;
							background: #15172C;
							padding: 0 20px;

							&.active {
								background: #363481;
							}

							img {
								width: 100px !important;
								height: 80px;
							}
						}


					}

					.name {
						display: flex;
						justify-content: center;
						align-items: center;
					}

					border-radius: 12px;
					display: flex;
					justify-content: space-between;
					align-items: center;

					box-sizing: border-box;
					width: 710px;
					// height: 104px;
					padding: 20px 40px;
					font-size: 28px;
					color: #ffffff;
					border: 2px solid #1e2037;
					background: #1c1f39;
					box-sizing: border-box;
					margin-bottom: 20px;

					img {
						width: 64px;
						height: 64px;
						margin-right: 20px;
					}

					&.active {
						// border-radius: 6px;
						// border: 2px solid #3a3a7e;
						// background: #1c1f39;
						// box-shadow: 0px 0px 27px 1px rgba(41, 34, 139, 0.23) inset;

						border-radius: 12px;
						border: 2px solid #3a3a7e;
						background: #1c1f39;
						box-shadow: 0px 0px 40px 2px rgba(41, 34, 139, 0.5) inset;
					}
				}

				.type_tips {
					display: block !important;
					width: 710px;
					box-sizing: border-box;
					color: #fff;
					padding-left: 30px;
					padding-bottom: 30px;
					box-sizing: border-box;
					line-height: 45px;
					border-radius: 12px;
					font-weight: 700;
					font-size: 28px;

					.copy {
						border: 1px solid #fff;
						color: #fff;
						text-align: center;
						font-size: 24px;
						font-style: normal;
						font-weight: 400;
						margin-left: 30px;
						padding: 5px 10px;
						border-radius: 30px;
					}

					img {
						width: 24px;
						margin-left: 20px;
						vertical-align: middle;
						margin-bottom: 3px;
					}

					span {
						color: #7ef2ad;
						font-size: 28px;
						font-style: normal;
						font-weight: 700;
					}

					.tips {
						font-size: 28px;
						font-style: normal;
						font-weight: 400;
						line-height: 50px;
					}

					.km-wrap {
						display: flex;
						width: 660px;
						height: 82px;
						border-radius: 2px;
						margin-bottom: 20px;
						border: 1px solid #3a3967;
						background: #1c203c;

						.cardno {
							height: 80px;
							width: 690px;
							padding: 0;
							margin: 0;
							background: #1c203c;
							border: none;
							padding: 20px;
							font-weight: 400;
							font-size: 26px;
							box-sizing: border-box;

							border-radius: 4px;
						}

						.cardsecret {
							border-radius: 4px;
							height: 80px;
							width: 520px;
							padding: 0;
							margin: 0;
							background-color: transparent;
							border: none;
							padding: 20px;
							font-weight: 400;
							font-size: 26px;
							box-sizing: border-box;
						}

						.km-btn {
							width: 170px;
							height: 82px;
							border-radius: 4px;
							background: #8e61f3;
							line-height: 82px;
							text-align: center;
							font-size: 24px;
							font-weight: 700;
							margin-left: 20px;
						}
					}
				}
			}

			.recharge-tip {
				color: #a8a9ae;
				font-size: 24px;
				font-style: normal;
				font-weight: 300;
				margin-top: 40px;
				margin-left: 20px;
				margin-right: 20px;
				margin-bottom: 150px;
			}
		}

		.recharge-wrap {
			// margin-top: 40px;

			.re-title {
				color: #fff;
				font-size: 24px;
				display: flex;
				align-items: center;

				img {
					width: 37px;
					height: 37px;
					margin-left: 8px;
				}
			}

			.recharge-content-wrap {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				margin-top: 16px;
				margin-bottom: 20px;


				.input-sp {

					// height: 200px;
					.input-wrap {
						display: flex;
						width: 710px;
						height: 104px;
						margin-bottom: 10px;
						border-radius: 6px;
						background: #1C1F39;
						padding: 0 10px;

						input {
							flex: 1;
							border: none;
							background: none;
							box-sizing: border-box;
							font-size: 24px;
							color: #8D8D8D;
						}


						.btn-sure {
							display: flex;
							width: 72px;
							height: 72px;
							margin: auto;
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

				.recharge-list-wrap {
					display: grid;
					grid-template-columns: repeat(3, 1fr);
					row-gap: 30px;
					column-gap: 30px;
					justify-items: center;
					width: 710px;
					box-sizing: border-box;

					.recharge-item {
						border-radius: 12px;
						border: 2px solid #1e2037;
						background: #1c1f39;
						width: 100%;
						height: 192px;
						color: #fff;
						font-size: 32px;
						display: flex;
						flex-direction: column;
						justify-content: center;
						align-content: center;
						box-sizing: border-box;

						#currency-wrap {
							color: #fff;
							text-align: center;
							font-size: 32px;
							font-style: normal;
							font-weight: 500;

							img {
								width: 30px;
								height: 30px;
								margin-right: 10px;
								vertical-align: middle;
								object-fit: contain;
							}
						}

						.give-wrap {
							color: #6c6c6c;
							margin-top: 10px;
							font-size: 24px;
							text-align: center;
							font-style: normal;
							font-weight: 500;
							line-height: normal;
						}

						// img {
						//	 width: 60px;
						//	 height: 60px;
						//	 vertical-align: middle;
						//	 margin-bottom: 10px;
						//	 transform: translateX(10px);
						// }

						&.active {
							border-radius: 6px;
							border: 2px solid #3a3a7e;
							background: #1c1f39;
							box-shadow: 0px 0px 27px 1px rgba(41, 34, 139, 0.23) inset;

							.give-wrap {
								color: #fff;
							}
						}
					}
				}

				.recharge-tip {
					color: #a8a9ae;
					font-size: 24px;
					font-style: normal;
					font-weight: 300;
					margin-top: 40px;
					margin-left: 20px;
					margin-right: 20px;
					margin-bottom: 140px;
				}
			}
		}
	}

	.pop-code {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;

		.pop-code-bg {
			width: 655px;
			height: 690px;
			// background: url(@/assets/romimg/recharge/code_bg.png) no-repeat center;
			// background-size: contain;
			background-color: #15172c;
			text-align: center;
			box-sizing: border-box;

			.pop-code-title {
				// width: 200px;
				// margin: 30px 50px 20px;
				gap: 20px;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 32px;
				color: #fdfeff;
				height: 88px;
				background-color: #191c34;
				position: relative;

				img {
					width: 48px;
					height: 48px;
				}

				box-sizing: border-box;

				.close {
					position: absolute;
					right: 20px;
					color: #4b4f6d;
					font-size: 30px;
				}
			}

			.qrCode_box {
				// display: inline-block;
				// border: 4px solid #fbfa02;
				// margin: 20px auto 0;
				// position: relative;
				height: 582px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				background-color: rgb(21, 23, 44);
				box-sizing: border-box;

				.qrCode_box_bg {
					background-color: #fff;
					width: 360px;
					height: 352px;
					display: flex;
					justify-content: center;
					align-items: center;
					box-sizing: border-box;

					img {
						width: 360px;
						height: 352px;
					}

					// .qrCode {
					// }
				}

				.qrCode_save_btn {
					color: #fff;
					width: 360px;
					height: 88px;
					line-height: 88px;
					border-radius: 10px;
					background: #554bf7;
					margin-top: 40px;
					font-weight: 700;
				}
			}

			.qrCode_bottom {
				background-color: #191c34;
				height: 128px;
				display: flex;

				justify-content: center;
				align-items: center;

				.left-wrap {
					img {
						width: 64px;
						height: 64px;
						margin-right: 20px;
					}
				}

				.qr-notice {
					font-size: 24px;
					color: #a8a9ae;
					text-align: left;
				}

				.pop-code-btn {
					width: 140px;
					height: 52px;
					border: 2px solid #fbfa02;
					margin: 20px auto 0;
					text-align: center;
					line-height: 54px;
					color: #fbfa02;
					font-size: 22px;
				}
			}
		}
	}

	.tip-text {
		width: 100%;
		text-align: center;
		font-size: 26px;
		margin-top: 100px;
		margin-bottom: 20px;
		color: #fff;
	}
}
</style>
