<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useStore } from "vuex"
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import Verification from "../verification/Index.vue"
import { getVerifyCode, register, login } from "@/network/api/login"

import { getUUID, getDeviceType } from "@/util/common"
import Vcode from "vue3-puzzle-vcode"

const router = useRouter();
const route = useRoute();
const store = useStore();
const username_icon = new URL(
	"@/assets/romimg/sign/user-line.png",
	import.meta.url
).href;
const userpassword_icon = new URL(
	"@/assets/romimg/sign/password-lock.png",
	import.meta.url
).href;
const userphone = new URL(
	"@/assets/romimg/sign/user-phone.png",
	import.meta.url
).href;
const useryanzm = new URL("@/assets/romimg/sign/yanzm.png", import.meta.url)
	.href;

const registerShow = computed(() => store.state.showRegisterView);
const registerType = ref("tel"); // tel email
const agreementChecked = ref(true);

const formatterInvite = (value) => value.toUpperCase();

const telReg = ref({
	tel: "",
	verifyCode: "",
	password: "",
	name: "",
	inviteCode: "",
});

const mailReg = ref({
	email: "",
	verifyCode: "",
	password: "",
	name: "",
	inviteCode: "",
});

const countDownVal = ref(null);
const countDownTel = ref(true);
const countDownTelText = ref( t( 'sign.getVCode' ) );

const countDownMailVal = ref(null);
const countDownMailTel = ref(true);

const verificationRef = ref(null);
const verificationShow = ref(false);

const inputInviteAbled = ref(false);
const sliderShow = ref(false); //滑块验证显示

onMounted(() => {
	initInviteCode();
	store.commit("setFooterView", false);
	store.commit("setHeaderView", false);
	if (Window.googleChannel) {
		registerType.value = "email";
	}
});

function initInviteCode() {
	if (route.query.code) {
		telReg.value.inviteCode = route.query.code;
		mailReg.value.inviteCode = route.query.code;
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
		telReg.value.inviteCode = query.code;
		mailReg.value.inviteCode = query.code;
	}
	if (telReg.value.inviteCode != "") {
		inputInviteAbled.value = true;
	}
}

function switchTabType(str) {
	registerType.value = str;
}

// function onClickClose() {
//	 store.commit("setRegisterView", false);
//	 store.commit("setRegPacket", {
//		 closeRed: false,
//		 openRed: false,
//		 leftSmall: true,
//		 money: 0,
//	 });
// }

// 登陆界面
function onClickClose() {
	router.replace({
		path: "/m/sign",
	});
}

function onClickSign() {
	store.commit("setRegisterView", false);
	store.commit("setSignView", true);
}

async function onPhoneReg(v) {
	if (!agreementChecked.value) {
		NotifyF( t( 'sign.checkAgreementAndPrivacy' ) );
		return;
	}
	let params = {};
	params.mobile = /^\d{9}$/.test(v.tel) ? `0${v.tel}` : v.tel;
	params.hdCode = getUUID();
	params.hdType = getDeviceType();
	params.inviteCode = v.inviteCode;
	params.nickName = v.name;
	params.platformId = store.state.platformId;
	params.password = v.password;
	params.type = 1;
	params.verifyCode = v.verifyCode;
	params.spreadVid = localStorage.getItem("bd_vid");

	const res = await register(params);
	if (res.code === 0) {
		Notify(res.message);
		// onClickSign();
		onAccountLogin({ account: params.mobile, password: params.password });
		router.replace("/m/home");
	}
}

async function onMailReg(v) {
	if (!agreementChecked.value) {
		NotifyF( t( 'sign.checkAgreementAndPrivacy' ) );
		return;
	}
	let params = {};
	params.email = v.email;
	params.hdCode = getUUID();
	params.hdType = getDeviceType();
	params.inviteCode = v.inviteCode;
	params.nickName = v.name;
	params.platformId = store.state.platformId;
	params.password = v.password;
	params.type = 2;
	params.verifyCode = v.verifyCode;
	params.spreadVid = localStorage.getItem("bd_vid");

	const res = await register(params);
	if (res.code === 0) {
		Notify(res.message);
		// onClickSign();
		onAccountLogin({ account: params.email, password: params.password });
	}
}

async function onAccountLogin(v) {
	let params = {};
	params.account = /^\d{9}$/.test(v.account) ? `0${v.account}` : v.account;
	params.platformId = store.state.platformId;
	params.password = v.password;
	params.type = 2;

	const res = await login(params);
	if (res.code === 0) {
		// Notify(res.message);
		onLoginSuc(res.data);
		localStorage.setItem(
			"login_account",
			JSON.stringify({ account: params.account, password: params.password })
		);
	}
}

function onLoginSuc(data) {
	store.commit("setLoginInfo", data);
	store.dispatch("getUserInfo");
	store.dispatch("initModuleList");
	store.commit("setRegisterView", false);
	store.commit("setSignView", false);
	store.commit("setSwitchNotice", true);
	Window.webSocketSend({
		cid: 11,
		data: JSON.stringify({ token: data.token }),
	});
}

/*倒计时相关*/
function toCountDown(data, name) {
	let curTabName = registerType.value;
	if (curTabName == "tel") {
		if (!telReg.value.tel) {
			NotifyF( t( 'sign.enterPhoneNumber' ) );
			return;
		}
		if (!validatorTel(telReg.value.tel)) {
			NotifyF( t( 'sign.phoneNumberFail' ) );
			return;
		}
	} else {
		if (!mailReg.value.email) {
			NotifyF( t( 'sign.enterEmail' ) );
			return;
		}
	}
	showVcode();
	// verificationRef.value.openPicCode();
	// verificationShow.value = true;
}

function setAgreemenChecked() {
	agreementChecked.value = !agreementChecked.value;
}

function go(path) {
	store.commit("setRegisterView", false);
	store.commit("setSignView", false);
	router.push(path);
}

function startCountDown(name) {
	if (name == "tel") {
		countDownTel.value = false;
		countDownVal.value.start();
	} else {
		countDownMailTel.value = false;
		countDownMailVal.value.start();
	}
}

//倒计时结束
function countdownfinish(name) {
	if (name == "tel") {
		countDownTel.value = true;
		countDownVal.value.reset();
	} else {
		countDownMailTel.value = true;
		countDownMailVal.value.reset();
	}
}

// 通过图形验证
async function onVerificationSuc() {
	let params = {};
	let curTabName = registerType.value;
	if (curTabName == "tel") {
		params.mobile = /^\d{9}$/.test(telReg.value.tel) ? `0${telReg.value.tel}` : telReg.value.tel;
		params.type = 1;
	} else {
		params.email = mailReg.value.email;
		params.type = 2;
	}
	params.platformId = store.state.platformId;
	params.isRegister = true;

	const res = await getVerifyCode(params);
	if (res.code === 0) {
		startCountDown(curTabName);
		Notify(res.message);
	}
}

// 关闭图形验证
function onVerificationClose() {
	verificationShow.value = false;
}

function hasTelReg() {
	return !Window.googleChannel;
}

/*表单验证相关*/
//手机验证
function validatorTel(val) {
	return /^(\\+?84|0)?\d{9}$/.test(val);
}
function validatorMail(val) {
	return /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(
		val
	);
}

function onSuccess() {
	sliderShow.value = false;
	onVerificationSuc();
}

function showVcode() {
	sliderShow.value = true;
}

function hideVcode() {
	sliderShow.value = false;
}
</script>

<template>
	<div id="register-wrap">
		<div class="head">
			<div class="wrapper" @click.stop>
				<div class="register-main-wrap">
					<div class="clos-1">
						<span class="icon iconfont" @click="onClickClose">&#xe637;</span>
					</div>

					<div class="login-title_sin" @click="onClickClose">{{ t( 'sign.loginTitle' ) }}</div>
					<div class="login-title">
						{{ t( 'sign.registerTitle' ) }}
						<div class="writ"></div>
					</div>

					<van-form @submit="onPhoneReg" v-show="registerType == 'tel'">
						<van-field
							v-model="telReg.tel"
							name="tel"
							:label="t( 'sign.phoneNumber' )"
							label-width="30%"
							placeholder=""
						/>

						<van-field
							v-model="telReg.verifyCode"
							center
							clearable
							:label="t( 'sign.verificationCode' )"
							label-width="30%"
							name="verifyCode"
							placeholder=""
						>
							<template #button>
								<div
									class="btn-verification"
									v-show="countDownTel"
									@click="toCountDown(telReg.tel, 'countDown_tel', '1')"
								>
									{{ countDownTelText }}
								</div>

								<van-count-down
									v-show="!countDownTel"
									ref="countDownVal"
									millisecond
									:time="60 * 1000"
									:auto-start="false"
									format="ss"
									@finish="countdownfinish('tel')"
								/>
							</template>
						</van-field>

						<van-field
							v-model="telReg.password"
							type="password"
							name="password"
							:label="t( 'sign.password' )"
							label-width="30%"
							:placeholder="t( 'sign.passwordMax' )"
							maxlength="16"
						/>

						<van-field
							v-model="telReg.name"
							name="name"
							:label="t( 'sign.name' )"
							label-width="30%"
							:placeholder="t( 'sign.optional' )"
						/>
						<van-field
							v-model="telReg.inviteCode"
							name="inviteCode"
							:label="t( 'sign.invitationCode' )"
							label-width="30%"
							:placeholder="t( 'sign.optional' )"
							:disabled="inputInviteAbled"
							:formatter="formatterInvite"
						/>

						<div class="agreement_box">
							<div
								class="agreement_icon"
								:class="{ active: agreementChecked }"
								@click="setAgreemenChecked"
							></div>
							<p class="text" :class="{ active: agreementChecked }">
								{{t( 'sign.over18YearsOld' )}}<span @click="toRoute('/m/help/regulations')"
									>《{{t( 'sign.userAgreement' )}}》</span
								>{{ t('sign.and') }}<span @click="toRoute('/m/help/privacy')">《{{t( 'sign.privacyPolicy' )}}》</span>
							</p>
						</div>

						<div class="button_out">
							<van-button
								round
								block
								type="info"
								native-type="submit"
								id="h5zhuce"
								>{{t( 'sign.registerBtn' )}}</van-button
							>
						</div>
					</van-form>

					<div class="bottom">
						<div>
							<img
								class="img"
								src="@/assets/romimg/sign/login-logo.png"
								alt=""
								srcset=""
							/>
						</div>
						<!-- <p>
							<span @click="onClickForget">找回密码</span>&nbsp; &nbsp;|
							&nbsp;&nbsp;<span @click="onClickRegister">用户注册</span>
						</p> -->
					</div>
				</div>
			</div>

			<Vcode
				:show="sliderShow"
				:canvasWidth="300"
				:canvasHeight="200"
				:puzzleScale="1"
				:sliderSize="40"
				:range="10"
				:successText="t( 'sign.verifySuccess' )"
				:failText="t( 'sign.verifyFail' )"
				:sliderText="t( 'sign.dropVerify' )"
				@success="onSuccess"
				@close="hideVcode"
			/>

			<Verification
				ref="verificationRef"
				:vrShow="verificationShow"
				@verificationSuc="onVerificationSuc"
				@verificationClose="onVerificationClose"
			></Verification>
		</div>
	</div>
</template>

<style lang="scss">
#register-wrap {
	// .verification-code-field .van-field__error-message {
	//	 color: red; /* 将错误消息的文本颜色设置为红色 */
	//	 font-size: 104px; /* 设置字体大小 */
	//	 bottom: -15px;
	//	 // font-style: italic; /* 设置字体样式为斜体 */
	// }

	.clos-1 {
		// width: 60px;
		// height: 60px;
		// position: absolute;
		// right: 0px;
		// top: 30px;
		margin: 30px;
		color: #ffffff;
		text-align: right; /*控制文本居中对齐*/
		span {
			text-align: right; /*控制文本居中对齐*/
			font-size: 30px;
		}
	}

	.agreement_box {
		margin-top: 20px;
		width: 100%;
		display: flex;
		// align-items: center;
		// justify-content: center;
		// margin: 20px auto 0;
		font-size: 24px;
		margin-left: 19px;
		// margin-bottom: 20px;
		// padding-left: 20px;

		.agreement_icon {
			margin-left: 28px;
			width: 32px;
			height: 32px;
			background: #2c2e41;
			// border-radius: 9px; /* 添加圆角，使图标变为圆形 */
			margin-right: 15px;
			background: url(@/assets/romimg/sign/span.checkbox__box3.png) no-repeat
				center;
			background-size: contain;

			&.active {
				background: url(@/assets/romimg/sign/span.checkbox__box4.png) no-repeat
					center;
				background-size: contain;
			}
		}

		.text {
			color: #666e7a;
			&.active {
				color: #ffffff;
			}
		}

		// p {
		//	 color: #666E7A;
		//	 padding-right: 25px;
		// }
	}

	.close {
		width: 60px;
		height: 60px;
		position: absolute;
		right: 0px;
		top: 30px;
		color: #ffffff;
		span {
			font-size: 30px;
		}
	}


	.login-title {
		margin-top: 330px;
		margin-bottom: 77px;
		margin-left: 47.5px;
		color: #ffffff;
		font-size: 36px;
		font-style: normal;
		display: inline-block;
		.writ {
			// width: 146px;
			height: 4px;
			margin-top: 14px;
			background-color: #ffffff;
		}

	}

	.login-title_sin {
		margin-top: 330px;
		margin-bottom: 77px;
		margin-left: 47.5px;
		color: #666e7a;
		font-size: 36px;
		font-style: normal;
		display: inline-block;
	}

	.blu {
		color: #1a7ae4;
	}

	.img {
		margin-top: 0px;
		width: 344px;
	}

	.head {
		//		z-index: 201 !important;
		// position: absolute;
		left: 0%;
		top: 0;
		.wrapper {
			// display: flex;
			// align-items: center;
			// justify-content: center;
			width: 750px;
			height: 1552px;
			background: #15172c; /* 上到下的渐变背景色 */
			// min-height: 8000px;
			// min-width: 8000px;
			.register-main-wrap {
				width: 750px;
				height: 1552px;
				box-sizing: border-box;
				background-image: url("@/assets/romimg/sign/background.png"); /* 替换为你的图片 URL no-repeat*/
				background-size: contain;
				background-repeat: no-repeat;
				// display: flex;
				// justify-content: space-between;
				// flex-direction: column;
				overflow: auto;
				.register-header {
					width: 60px;
					height: 60px;
					position: absolute;
					right: 0px;
					top: 30px;
					color: #ffffff;
					span {
						font-size: 30px;
					}
				}
				// width: 659px;
				// height: 1077px;
				// background: url(@/assets/romimg/sign/back.png) no-repeat center;
				// background-size: contain;
				// position: relative;

				.close {
					width: 60px;
					height: 60px;
					position: absolute;
					right: -35px;
					top: -50px;

					img {
						width: 100%;
						height: 100%;
					}
				}

				.bottom {
					// background: linear-gradient(180deg, #f6fafb 0%, #2e5eab 100%);
					// position: fixed;
					// bottom: 0px;
					// position: absolute; /* 相对于父元素进行定位 */
					// height: 534px;
					width: 750px;
					// padding-bottom: 50px;
					// margin-top: 3000px;
					text-align: center;
					// position: absolute; /* 使用绝对定位 */
					// margin-top: 140px;
					color: #fff;
					font-size: 26.666px;

					font-weight: 400;
					// text-transform: uppercase;
					box-sizing: border-box;
					border-bottom-left-radius: 10px;
					border-bottom-right-radius: 10px;
					margin-top: 60px;

					p {
						margin-top: 30px;
					}
				}

				.van-form {
					width: 750px;
					box-sizing: border-box;

					.agreement {
						width: 100%;
						display: flex;
						align-items: center;
						// padding-left: 20px;
						margin-top: 40px;
						margin-bottom: 40px;
						font-size: 24px;
						margin-left: 18px;

						.agreement_icon {
							margin-left: 28px;
							width: 32px;
							height: 32px;
							background: #2c2e41;
							// border-radius: 9px; /* 添加圆角，使图标变为圆形 */
							margin-right: 15px;
							background: url(@/assets/romimg/sign/span.checkbox__box3.png)
								no-repeat center;
							background-size: contain;

							&.active {
								background: url(@/assets/romimg/sign/span.checkbox__box4.png)
									no-repeat center;
								background-size: contain;
							}
						}

						p {
							color: #aaacc1;
						}
					}

					.van-cell {
						display: flex;
						align-items: center;
						width: 660px;
						background: none;
						overflow: visible;
						height: 100px;
						padding: 0;
						// border-bottom: 1px solid #ecebee;
						background-color: #232749;
						margin: 0 auto;
						resize: none; /* 禁用用户调整大小的功能 */
						vertical-align: middle;
						color: #7a7e89;

						font-size: 26px;
						font-style: normal;
						font-weight: 400;
						margin-bottom: 10px;
						padding: 25px;
						border-radius: 4px;
						&::after {
							border-bottom: 1px solid #232749;
						}
						// &:first-child {
						//	 border-top-left-radius: 10px;
						//	 border-top-right-radius: 10px;
						// }

						// &:last-child {
						//		 border-bottom-left-radius: 10px;
						//		 border-bottom-right-radius: 10px;
						// }
						.van-field__left-icon {
							display: flex;
							align-items: center;
							box-sizing: border-box;
							.van-icon {
								font-size: 36px;
								line-height: 36px;
								margin-right: 10px;
								// margin-left: 10px;
							}
						}

						.van-field__control::placeholder {
							color: #8a8a8a; /* 设置 placeholder 文本的颜色 */
							font-size: 28px; /* 设置 placeholder 文本的字体大小 */
							text-align: right;
						}

						.van-cell__title {
							label {
								line-height: 90px;
								// margin-left: 10px;
								color: #dcdcdc;
								font-size: 26px;
							}
						}

						.van-field__control {
							margin-top: 0px;
							color: #dcdcdc;
							font-size: 26px;
							height: 50px;
							// line-height: 90px;
							font-style: normal;
							font-weight: 400;

							// text-transform: uppercase;
						}

						.van-cell__value {
							position: relative;

							.van-field__error-message {
								position: absolute;
								top: 45px;
								font-size: 22px;
								z-index: 1;
							}
						}

						.btn-verification {
							// width: 1.97rem;
							// height: 0.681rem;
							background: none;
							/* 添加 #3F8BEA 颜色的描边效果 */
							border-bottom: 2px solid #4af1b8;
							display: flex;
							align-items: center;
							justify-content: center;
							// border-radius: 0.37rem; /* 设置按钮圆角 */
							color: #4af1b8;
							font-size: 20px;
							// text-align: right;
							line-height: 38px;
							// margin-right: 30px;
							// margin-top: 15px;
						}

						.van-count-down {
							width: 145px;
							height: 58px;
							background: none;
							color: #dcdcdc;
							font-size: 22px;
							text-align: center;
							line-height: 58px;
						}

						//				&:nth-child(2) {
						//					.van-field__error-message {
						//						position: absolute;
						//						top: 43px;
						//						font-size: 22px;
						//					}

						// .van-field__control{

						//		margin-top: 0px;
						//		color: #DCDCDC;
						//		font-size: 26px;
						//		height: 50px;
						//		line-height: 90px;

						//		font-style: normal;
						//		font-weight: 400;

						//		text-transform: uppercase;

						// }

						//				}
					}

					.button_out {
						display: flex;
						justify-content: center;
						position: relative;
						width: 100%;
						margin: 0 auto; /* 水平居中 */
						height: 0.925rem;
						margin-top: 0.555rem;

						.van-button {
							width: 660px;
							height: 80px;
							border-radius: 4px;
							background: #3a34b0;
							font-size: 30px;
							color: #fff;
							// font-weight: bold;
							margin: 0 20px;
							border: none;
						}

						// .register-btn {
						//	 width: 208px;
						//	 height: 63px;
						//	 background: url(@/assets/romimg/sign/btn2.png) no-repeat center;
						//	 background-size: contain;
						//	 border: none !important;
						//	 border-radius: 0 !important;
						//	 font-size: 26px;
						//	 color: #20212b;
						//	 font-weight: bold;
						//	 line-height: 63px;
						//	 text-align: center;
						//	 margin: 0 20px;
						// }
					}
				}

				.register {
					width: 100%;
					height: 60px;
					margin-top: 65px;
					padding-left: 57px;
					display: flex;
					align-items: center;
					margin-bottom: 30px;

					.register-item {
						width: 197px;
						height: 65px;
						text-align: center;
						line-height: 65px;
						color: #fff;
						font-size: 25px;
						font-weight: bold;
						background: url(@/assets/romimg/common/tab_item.png) no-repeat
							center;
						background-size: 100% 100%;

						&.active {
							width: 197px;
							color: #141427;
							background: url(@/assets/romimg/common/tab_item_active.png)
								no-repeat center;
							background-size: 100% 100%;
						}

						// &:nth-child(2) {
						//	 margin-left: -3px;
						// }
					}
				}
			}
		}
	}
}
</style>
