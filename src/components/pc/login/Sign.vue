<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
// import Verification from "../verification/Index.vue";
import { useStore } from "vuex";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
	login,
	getVerifyCode,
	register,
	forgotPassword,
} from "@/network/api/login";

import { getUUID, getDeviceType } from "@/util/common";
import { re } from "mathjs";
import DragVerify from "@/components/pc/common/DragVerify.vue"

const router = useRouter();
const route = useRoute();
const store = useStore();
const showSignView = computed(() => store.state.showSignView);
const agreementChecked = ref(true);
const signType = ref("account"); // account tel
const remember = ref(false);
const accountSign = ref({
	account: "",
	password: "",
	mobile: "",
	inviteCode: "",
	nickname: "",
	verifyCode: "",
});

// const telSign = ref({
// 	tel: "",
// 	verifyCode: "",
// });

// const countDownVal = ref(null);
// const countDownTel = ref(true);
// const countDownTelText = ref("发送");

const regcountDownVal = ref(null);
const regcountDownTel = ref(true);
const regcountDownTelText = ref(t('sign.send'));

// const verificationRef = ref(null);
// const verificationShow = ref(false);

// const telReg = ref({
// 	tel: "",
// 	verifyCode: "",
// 	password: "",
// 	name: "",
// 	inviteCode: "",
// });
const inputInviteAbled = ref(false);

// const formatterInvite = (value) => value.toUpperCase();
// const tabType = ref(1); //1-login 2-reg

const showPwd = ref(false); ///	是否显示密码
const errorMsg = ref(""); ///	错误信息
const showErrorMsg = ref(false); ///	错误显示状态
const sending = ref(false); ///	验证码发送状态
let intervalId = 0; 	///	计时器
const countDownVal = ref(120); ///	倒计时
const countDownText = ref(t('sign.getVCode'))
const sended = ref(false); ///	验证码是否已经发送

const accountError = ref(false); ///	账号错误标识
const passwordError = ref(false); ///	密码错误标识
const mobileError = ref(false); ///	手机号码错误标识
const verifyCodeError = ref(false); ///	验证吗错误标识
const dragVerifyError = ref(false); ///	滑动验证错误标识
// const nicknameError = ref( false )		///	昵称格式错误

const account = ref(null); ///	refs
const password = ref(null);
const mobile = ref(null);
const verifyCode = ref(null);
const dragVerify = ref(null);
const nickname = ref(null);
const signContainer = ref(null);

const type = ref("login"); ///	当前类型
const country = ref("china"); ///	当前选中的国家

const showDragVerify = ref(false); ///	是否显示拖拽组建
const isPassing = ref(false);

/**
 * 检测账号和密码输入情况
 */
function checkInput() {
	accountSign.value.account = accountSign.value.account.replace(/[^\d]/g, "");
	accountSign.value.mobile = accountSign.value.mobile.replace(/[^\d]/g, "");

	if (!/^(\\+?84|0)?\d{9}$/.test(accountSign.value.mobile) || accountSign.value.password.length < 6) {
		isPassing.value = false;
		return showDragVerify.value = false
	}

	return showDragVerify.value = true
}

/**
 * 重设账号信息
 * @returns object
 */
function resetData() {
	accountSign.value = {
		account: "",
		password: "",
		mobile: "",
		inviteCode: "",
		verifyCode: "",
		nickname: "",
	};
	showDragVerify.value = false;
	showErrorMsg.value = false;

	errorMsg.value = "";

	isPassing.value = false;
	sended.value = false;
	sending.value = false;

	accountError.value = false;
	passwordError.value = false;
	mobileError.value = false;
	verifyCodeError.value = false;
	dragVerifyError.value = false;
}

/**
 * 获取模块标题头
 * @returns string 账号名称
 */
function getTitle() {
	switch (type.value) {
		default:
		case "login":
			return t('sign.loginTitle');

		case "forget":
			return t('sign.forgetPassword');

		case "register":
			return t('sign.registerTitle');
	}
}

function dragResult(val) {
	isPassing.value = val;
}

/**
 * 切换类型
 * @param module string 调用的模块类型名称
 */
function changeType(module) {
	type.value = module;
	// switch (module) {
	// 	case "login":
	// 		// signContainer.value.style.top = `calc( 50% - 493px / 2 )`;
	// 		break;

	// 	case "register":
	// 		signContainer.value.style.top = `calc( 50% - 624px / 2 )`;
	// 		break;

	// 	case "forget":
	// 		signContainer.value.style.top = `calc( 50% - 454px / 2 )`;
	// 		break;
	// }
	resetData();
	initInviteCode()
}

/**
 * 发送验证码
 */
async function sendSMS() {
	if (sending.value) return;
	if (!checkMobile() || !checkPassword()) return;
	if (!checkDragResult()) return;

	let params = {};
	params.mobile = /^\d{9}$/.test(accountSign.value.mobile) ? `0${accountSign.value.mobile}` : accountSign.value.mobile
	params.type = 1;
	params.platformId = store.state.platformId;
	params.graphicId = "eBsJRDsthDQ0u22GRudJ"; ///	无效值，占位用
	params.graphicCode = "";
	params.isRegister = type.value == "register";

	const res = await getVerifyCode(params);
	if (res.code != 0) return;

	sended.value = true;
	sending.value = true;
	verifyCode.value.focus();
	countDownText.value = t('sign.countDown', { sec: countDownVal.value })

	intervalId = setInterval(() => {
		if (countDownVal.value == 0) {
			sending.value = false;
			countDownText.value = t('sign.getVCode')
			clearInterval(intervalId)
			countDownVal.value = 120
		} else {
			countDownVal.value--;
			countDownText.value = t('sign.countDown', { sec: countDownVal.value })
		}
	}, 1000);
}

/**
 * 监听一下显示状态用来还原值
 */
watch(showSignView, async (val) => {
	if (val) {
		type.value = "login";
		await resetData();
		initInviteCode();
	}
});

onMounted(() => {
	if (localStorage.getItem("login_account")) {
		remember.value = true;
		accountSign.value = JSON.parse(localStorage.getItem("login_account"));
	}
	initInviteCode();
});

function initInviteCode() {
	if (route.query.code) {
		accountSign.value.inviteCode = route.query.code;
	} else {
		let query = {
			code: "",
		};
		location.search
			.substring(1)
			.split("&")
			.forEach((item) => {
				query[item.split("=")[0]] = item.split("=")[1];
			});
		accountSign.value.inviteCode = query.code;
	}

	if (accountSign.value.inviteCode != "") {
		inputInviteAbled.value = true;
	}
}

// function switchSignType(str) {
// 	signType.value = str;
// }

function onClickClose() {
	store.commit("setSignView", false);
	store.commit("setRegPacket", {
		closeRed: false,
		openRed: false,
		leftSmall: true,
		money: 0,
	});
}

/**
 * 显示错误消息
 * @param msg string 错误提示
 */
function showError(msg) {
	errorMsg.value = msg;
	showErrorMsg.value = true;
	hideError();
}

/**
 * 隐藏错误消息
 */
function hideError() {
	setTimeout(() => {
		showErrorMsg.value = false;
		accountError.value = false;
		passwordError.value = false;
	}, 5000);
}

async function onAccountReset() {
	if (
		!checkMobile() ||
		!checkPassword() ||
		!checkDragResult() ||
		!checkVerifyCode()
	)
		return;

	let params = {};
	params.mobile = /^\d{9}$/.test(accountSign.value.mobile) ? `0${accountSign.value.mobile}` : accountSign.value.mobile
	params.platformId = store.state.platformId;
	params.password = accountSign.value.password;
	params.type = 1;
	params.verifyCode = accountSign.value.verifyCode;

	const res = await forgotPassword(params);
	if (res.code === 0) {
		Success(res.message);
		changeType("login");
	}
}

async function onAccountRegister() {
	if (
		!checkMobile() ||
		!checkPassword() ||
		!checkDragResult() ||
		!checkVerifyCode() ||
		!checkAgreement()
	)
		return;

	let params = {};
	params.mobile = /^\d{9}$/.test(accountSign.value.mobile) ? `0${accountSign.value.mobile}` : accountSign.value.mobile
	params.hdCode = getUUID();
	params.hdType = getDeviceType();
	params.inviteCode = accountSign.value.inviteCode;
	params.nickName = accountSign.value.name;
	params.platformId = store.state.platformId;
	params.password = accountSign.value.password;
	params.type = 1;
	params.verifyCode = accountSign.value.verifyCode;
	params.spreadVid = localStorage.getItem("bd_vid");

	const res = await register(params);
	if (res.code === 0) {
		Success(res.message);
		accountSign.value.account = /^\d{9}$/.test(accountSign.value.mobile) ? `0${accountSign.value.mobile}` : accountSign.value.mobile
		onAccountLogin();
	}
}

function checkVerifyCode() {
	if (
		accountSign.value.verifyCode.trim() == "" ||
		Number(accountSign.value.verifyCode.trim().length) != 6
	) {
		showError(t('sign.vCodeFail'));
		verifyCodeError.value = true;
		verifyCode.value.focus();
		return false;
	}
	return true;
}

function checkDragResult() {
	console.log(isPassing.value)
	if (!isPassing.value) {
		showError(t('sign.dropFail'));
		dragVerifyError.value = true;
		return false;
	}
	return true;
}

function checkMobile() {
	if (!/^(\\+?84|0)?\d{9}$/.test(accountSign.value.mobile)) {
		showError(t('sign.accountFormatFail'));
		mobileError.value = true;
		mobile.value.focus();
		return false;
	}
	return true;
}

function checkAccount() {
	if (!/^(\\+?84|0)?\d{9}$/.test(accountSign.value.account)) {
		showError(t('sign.accountFormatFail'));
		accountError.value = true;
		account.value.focus();
		return false;
	}
	return true;
}

function checkPassword() {
	if (accountSign.value.password.length < 6) {
		showError(t('sign.passwordToShort'));
		passwordError.value = true;
		password.value.focus();
		return false;
	}

	if (accountSign.value.password.length > 16) {
		showError(t('sign.passwordTooLong'));
		passwordError.value = true;
		password.value.focus();
		return false;
	}
	return true;
}

function checkAgreement() {
	if (!agreementChecked.value) {
		showError(t('sign.checkAgreementAndPrivacy'));
		return false;
	}
	return true;
}

///	账号登录
async function onAccountLogin() {
	if (!checkAccount() || !checkPassword() || !checkAgreement()) return;

	let params = {};
	params.account = /^\d{9}$/.test(accountSign.value.account) ? `0${accountSign.value.account}` : accountSign.value.account
	params.platformId = store.state.platformId;
	params.password = accountSign.value.password;
	params.type = 2;
	// console.log( params, accountSign.value, /^\d{9}$/.test(accountSign.value.mobile) )

	const res = await login(params);
	if (res.code === 0) {
		Success({ offset: 100, message: res.message });
		onLoginSuc(res.data);
		rememberPW();
	}
}

function onLoginSuc(data) {
	store.commit("setLoginInfo", data);
	store.dispatch("getUserInfo");
	store.dispatch("initModuleList");
	// store.dispatch("getNewYourConfig");
	store.commit("setSignView", false);
	store.commit("setSwitchNotice", true);
	store.commit("setActivityDialogVisible", true);

	ws.send(JSON.stringify({
		cid: 11,
		data: { token: data.token }
	}))
	// Window.webSocketSend({
	//	 cid: 11,
	//	 data: JSON.stringify({ token: data.token }),
	// });
}

function toRoute(path) {
	router.push(path);
	store.commit("setSignView", false);
}

function rememberPW() {
	if (remember.value) {
		localStorage.setItem("login_account", JSON.stringify(accountSign.value));
	} else {
		localStorage.removeItem("login_account");
	}
}

//账号格式验证
function validatorAccount(val) {
	// if (/^(\\+?84|0)?((1(2([0-9])|6([2-9])|88|99))|(9((?!5)[0-9])))([0-9]{7})$/.test(val)) {
	if (!/^(\\+?84|0)?\d{9}$/.test(val)) {
		return true;
	} else {
		if (
			/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(val)
		) {
			return true;
		} else {
			if (/^[A-Za-z]{2}\d{6}$/.test(val)) {
				return true;
			} else {
				if (/^jiqiren\d+$/.test(val)) {
					return true;
				} else {
					return false;
				}
			}
		}
	}
}

//账号格式验证
function validatorTel(val) {
	return !/^(\\+?84|0)?\d{9}$/.test(val)
}

// function onClickTab(tab) {
// 	tabType.value = tab;
// }

watch(
	() => store.state.showSignViewTab,
	(newTab, pretab) => {
		tabType.value = newTab;
	}
);

function submit(e) {
	if (e.key == "Enter" && type.value == "login") {
		onAccountLogin();
	}

	if (e.key == "Enter" && type.value == "register") {
		onAccountRegister();
	}

	if (e.key == "Enter" && type.value == "forget") {
		onAccountReset();
	}
}
</script>

<template>
	<div id="pc-sign-wrap">
		<van-overlay :show="showSignView" style="background-color: rgba(0, 0, 0, 0.7)" :z-index="201">
			<div class="sign-container" :class="{ isSignUp: type == 'register' }" ref="signContainer" @keypress="submit">
				<div class="close-btn" @click="onClickClose">
					<!-- <img src="@/assets/pcimg/sign/close.png" /> -->
					<span class="icon iconfont" style="color: #c3c3e2">&#xe65f;</span>
				</div>
				<div class="sign-header">
					<div class="title">{{ getTitle() }}</div>
				</div>
				<div class="sign-body">
					<div :class="['error-message', showErrorMsg ? 'active' : '']">
						{{ errorMsg }}
					</div>

					<!-- 登录模块 -->
					<div class="sign-form" v-if="type == 'login'">
						<div :class="['form-item', accountError ? 'error' : '']">
							<input @keyup="checkInput" maxlength="11" type="tel" v-model="accountSign.account"
								:placeholder="t('sign.enterAccount')" ref="account" @keypress="accountError = false" />
						</div>

						<div :class="['form-item', passwordError ? 'error' : '']">
							<input maxlength="16" v-model="accountSign.password" :type="showPwd ? 'text' : 'password'"
								:placeholder="t('sign.enterPassword')" ref="password" @keypress="passwordError = false" />
							<button class="pwd-switch" @click="showPwd = !showPwd">
								<img src="@/assets/pcimg/sign/show-pwd.png" v-if="showPwd" />
								<img src="@/assets/pcimg/sign/hide-pwd.png" v-else />
							</button>
						</div>
						<div class="sign-footer" v-if="type != 'forget'">
							<div :class="['footer-item', remember ? 'active' : '']" v-if="type == 'login'">
								<div class="remember" @click="remember = !remember">
									<img src="@/assets/pcimg/sign/checkbox.png" v-if="!remember" />
									<img src="@/assets/pcimg/sign/checked.png" v-else />
									{{ t('sign.rememberPassword') }}
								</div>
								<div class="forget" @click="changeType('forget')">{{ t('sign.forgetPassword') }}</div>
							</div>
							<div :class="[
								'footer-item',
								'agreement',
								agreementChecked ? 'active' : '',
							]" v-if="type === 'register'">
								<!-- <I18nT keypath=" sign.acceptAgreement" tag="div" class="agreement">
					<template #acceptAgreement>
						<div class="agreement" @click="agreementChecked = !agreementChecked">
							<img src="@/assets/pcimg/sign/checked.png" v-if="agreementChecked" />
							<img src="@/assets/pcimg/sign/checkbox.png" v-else />
						</div>
					</template>

					<div class="lis">
						<span @click="toRoute('/p/help/regulations')">用户协议</span>
						<span @click="toRoute('/p/help/privacy')">隐私条款</span>
					</div>
					</I18nT> -->
								<div class="agreement" @click="agreementChecked = !agreementChecked">
									<img src="@/assets/pcimg/sign/checked.png" v-if="agreementChecked" />
									<img src="@/assets/pcimg/sign/checkbox.png" v-else />
									<p>
										{{ t('sign.over18YearsOldPc') }}
										<span @click="toRoute('/p/help/regulations')">"{{ t('sign.userAgreement') }}"</span>
										{{ t('sign.and') }}
										<span @click="toRoute('/p/help/privacy')">"{{ t('sign.privacyPolicy') }}"</span>
									</p>
								</div>
								<!-- <div class="lis">
						</div> -->
							</div>
						</div>
						<button class="button button--primary" @click="onAccountLogin">{{ t('sign.loginBtn') }}</button>
						<div class="to-reg ">
							<p @click="changeType('register')">{{ t('sign.toRegisterText') }}</p>
						</div>
					</div>
					<!-- /登录模块 -->

					<!-- 注册模块 -->
					<div class="sign-form" v-if="type == 'register'">
						<div :class="['form-item', mobileError ? 'error' : '']">
							<!-- <el-select v-model="country" placeholder="请选择"></el-select> -->
							<div class="country">
								<img src="@/assets/pcimg/sign/Vietnam.png" />
							</div>
							<input v-model="accountSign.mobile" maxlength="11" type="tel" @keyup="checkInput"
								:placeholder="t('sign.enterPhoneNumber')" ref="mobile" @keypress="mobileError = false"
								@change="checkInput" />
						</div>

						<div :class="['form-item', passwordError ? 'error' : '']">
							<input maxlength="16" v-model="accountSign.password" @keyup="checkInput" @change="checkInput"
								:type="showPwd ? 'text' : 'password'" :placeholder="t('enterPassword')" ref="password"
								@keypress="passwordError = false" />
							<button class="pwd-switch" @click="showPwd = !showPwd">
								<img src="@/assets/pcimg/sign/show-pwd.png" v-if="showPwd" />
								<img src="@/assets/pcimg/sign/hide-pwd.png" v-else />
							</button>
						</div>

						<div class="form-item" v-show="showDragVerify">
							<DragVerify @passing="dragResult" :is-passing="isPassing"></DragVerify>
						</div>

						<div :class="['form-item', verifyCodeError ? 'error' : '']">
							<input v-model="accountSign.verifyCode" :disabled="!sended" maxlength="6"
								:placeholder="t('sign.enterVCode')" ref="verifyCode" @keypress="verifyCodeError = false" />
							<button class="send-sms" :disabled="sending" @click="sendSMS">
								{{ countDownText }}
							</button>
						</div>

						<div class="form-item">
							<input v-model="accountSign.nickname" @keyup="checkInput"
								:placeholder="t('sign.enterNicknameOptional')" ref="nickname" />
						</div>

						<div class="form-item">
							<input v-model="accountSign.inviteCode" :placeholder="t('sign.enterInviteCodeOptional')" />
						</div>
						<button class="button button--primary" @click="onAccountRegister()">{{ t('sign.registerBtn')
						}}</button>
						<div class="to-reg ">
							<p @click="changeType('login')">{{ t('sign.toLoginText') }}</p>
						</div>
					</div>
					<!-- /注册模块 -->

					<!-- 忘记密码 -->
					<div class="sign-form" v-if="type == 'forget'">
						<div :class="['form-item', mobileError ? 'error' : '']">
							<!-- <el-select v-model="country" placeholder="请选择"></el-select> -->
							<div class="country">
								<img src="@/assets/pcimg/sign/Vietnam.png" />
							</div>
							<input v-model="accountSign.mobile" maxlength="11" type="tel" @keyup="checkInput"
								:placeholder="t('sign.enterPhoneNumber')" ref="mobile" @keypress="mobileError = false"
								@change="checkInput" />
						</div>

						<div :class="['form-item', passwordError ? 'error' : '']">
							<input maxlength="16" v-model="accountSign.password" @keyup="checkInput" @change="checkInput"
								:type="showPwd ? 'text' : 'password'" :placeholder="enterPassword" ref="password"
								@keypress="passwordError = false" />
							<button class="pwd-switch" @click="showPwd = !showPwd">
								<img src="@/assets/pcimg/sign/show-pwd.png" v-if="showPwd" />
								<img src="@/assets/pcimg/sign/hide-pwd.png" v-else />
							</button>
						</div>

						<div class="form-item" v-show="showDragVerify">
							<DragVerify @passing="dragResult" :is-passing="isPassing"></DragVerify>
						</div>

						<div :class="['form-item', verifyCodeError ? 'error' : '']">
							<input v-model="accountSign.verifyCode" :disabled="!sended" maxlength="6"
								:placeholder="t('sign.enterVCode')" ref="verifyCode" @keypress="verifyCodeError = false" />
							<button class="send-sms" :disabled="sending" @click="sendSMS">
								{{ countDownText }}
							</button>
						</div>
						<button class="button" @click="onAccountReset()">{{ t('sign.modifyBtn') }}</button>
						<div class="to-reg" style="margin-bottom: 20px">
							<p @click="changeType('login')">{{ t('sign.backAndLogin') }}>>></p>
						</div>
					</div>
					<!-- /忘记密码 -->
				</div>

			</div>
		</van-overlay>
	</div>
</template>

<style lang="scss">
#pc-sign-wrap {
	.sign-container {
		display: flex;
		align-items: center;
		justify-content: center;
		position: fixed;
		max-width: 544px;
		// max-height: 463px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		overflow: hidden;
		flex-direction: column;
		width: 100%;
		padding: 40px;




		&::after {
			content: "";
			background: url(@/assets/pcimg/common/login_bg.png);
			background-repeat: no-repeat;
			background-position: center;
			background-size: contain;
			position: absolute;
			z-index: 0;
			inset: 0;

		}

		&.isSignUp {

			&::after {
				background: url(@/assets/pcimg/common/sign-up_bg.png);
				background-repeat: no-repeat;
				background-position: center;
				background-size: contain;
			}

		}

		.close-btn {
			position: absolute;
			z-index: 1;
			right: 10px;
			top: 10px;
			// border: 1px solid red;
			width: 32px;
			height: 32px;
			display: flex;
			align-items: center;
			justify-content: center;

			img {
				width: 14px;
			}

			&:hover {
				img {
					width: 18px;
				}

				span {
					font-size: 18px;
				}
			}
		}

		.sign-header {
			width: 100%;
			position: relative;
			z-index: 1;
			text-align: center;

			.title {
				width: 100%;
				font-size: 24px;
				font-style: normal;
				font-weight: 700;
				line-height: 26px;
				text-align: center;
				color: #fff;
				position: relative;
				margin: 0;

			}
		}

		.sign-body {
			width: 100%;
			display: flex;
			flex-direction: column;
			gap: 20px;
			box-sizing: border-box;
			position: relative;
			z-index: 1;

			.error-message {
				border-radius: 5px;
				background: rgba(255, 92, 92, 0.2);
				color: #ff5c5c;
				height: 0px;
				display: flex;
				justify-content: flex-start;
				align-items: center;
				box-sizing: border-box;
				padding: 0 16px;
				font-size: 14px;
				overflow: hidden;
				transition: 0.5s;

				&.active {
					height: 48px;
				}
			}

			.sign-form {
				display: flex;
				gap: 13px;
				margin-top: 20px;
				flex-direction: column;

				.form-item {
					width: 100%;
					border-radius: 5px;
					background: #191c33;
					display: flex;
					box-sizing: border-box;
					border: 1px solid #191c33;
					align-items: center;

					.country {
						width: 88px;
						height: 28px;
						border-right: 1px solid #2b2d38;
						padding: 0 20px;
						box-sizing: border-box;
						display: flex;
						align-items: center;
						position: relative;

						img {
							width: 30px;
						}

						&::after {
							content: "";
							position: absolute;
							width: 10px;
							height: 5px;
							right: 16px;
							background: url(@/assets/pcimg/sign/arrow-down.png) no-repeat;
						}
					}

					&.error {
						border: 1px solid red !important;
					}

					&:focus-within {
						border: 1px solid #FFE063;
					}

					input {
						border: none;
						outline: none;
						background: transparent;
						padding: 16px 24px;
						color: #fff;
						height: 100%;
						box-sizing: border-box;
						font-weight: 400;
						flex: 1;
						font-family: Archivo;
						width: 100%;
						font-size: 16px;
						line-height: 24px;

						&::placeholder {
							color: #8D8D8D;
							text-transform: uppercase;
						}

						&:-internal-autofill-selected {
							background-color: #191c33 !important;
							border-radius: 5px !important;
							border: none !important;
							color: #fff !important;
							transition: background-color 5000s ease-in-out 0s,
								color 5000s ease-in-out 0s !important;
						}
					}

					.pwd-switch {
						background: transparent;
						border: none;
						outline: none;
						padding: 0 12px;
						display: flex;
						align-items: center;
						width: 48px;
					}

					.send-sms {
						background: transparent;
						border: none;
						outline: none;
						padding: 0 12px;
						display: flex;
						align-items: center;
						color: #c3c3e2;
						font-size: 14px;
						font-weight: 200;
					}
				}

				.button {
					border-radius: 5px;
					// background: #0985ed;
					// color: #fff;
					width: 100%;
					height: 44px;
					border: none;
					font-size: 16px;
					font-weight: 700;

					&:hover {
						border: 1px solid #FFE063;
					}
				}

				.to-reg {
					color: white;
					margin-top: 24px;
					text-transform: uppercase;
					font-size: 16px;
					width: 100%;
					display: flex;
					justify-content: center;
					cursor: default;

					p {
						&:hover {
							color: #fff;
						}
					}
				}
			}
		}

		.sign-footer {
			display: flex;
			flex-direction: column;
			width: 100%;
			padding: 24px 0px;
			box-sizing: border-box;
			gap: 22px;
			position: relative;
			z-index: 1;

			.footer-item {
				display: flex;
				justify-content: space-between;
				color: #848492;
				font-size: 14px;
				font-weight: 400;
				align-items: center;
				line-height: 22px;

				&.active {
					color: #0985ed;
				}

				&.agreement {
					justify-content: flex-start;
					gap: 12px;

					&:hover {
						color: #fff;

						span {
							color: #fff;
						}
					}
				}

				div {
					display: flex;
					align-items: center;
					// height: 19px;
					gap: 12px;

					&.agreement,
					&.remember {
						cursor: pointer;

						&:hover {
							color: #fff;
						}
					}

					&.agreement {
						align-items: flex-start;

						span {
							// padding: 6px;
							margin: 0 !important;
						}
					}

					&.forget {
						color: #848492;
						cursor: default;

						&:hover {
							color: #fff;
						}
					}

					img {
						width: 18px;
						height: 18px;
					}

					span {
						color: #b4b4cf;
						margin: 0 -6px;
						text-decoration: underline;
						cursor: default;
					}
				}
			}
		}
	}

	@media screen and (max-width: 768px) {
		.sign-container {
			max-width: 400px;
			padding: 30px;

			.sign-form {
				margin-top: 0px !important;
			}

			.sign-footer {
				padding: 0px 0px;
			}

			.to-reg {

				margin-top: 0px !important;
			}

			.form-item input {
				padding: 10px 24px !important;
			}

			&::after {
				// background: url(@/assets/romimg/common/arrow_top.png) no-repeat center;
				// background-size: contain;
				// position: absolute;
				// inset: 0;

			}
		}
	}

}
</style>
