<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import Verification from "../verification/Index.vue";
import { useStore } from "vuex";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { login, getVerifyCode } from "@/network/api/login";

import activeIcon from "../../../assets/romimg/sign/span.checkbox__box3.png";
import inactiveIcon from "../../../assets/romimg/sign/span.checkbox__box4.png";
import Vcode from "vue3-puzzle-vcode"

const router = useRouter();
const route = useRoute();
const store = useStore();
const showSignView = computed(() => store.state.showSignView);
const agreementChecked = ref(true);
const signType = ref("account"); // account tel
const remember = ref(true);
const steamUrl = ref("");
const accountSign = ref({
	account: "",
	password: "",
});
const textStyle = {
	color: "#666E7A", // 设置文本颜色
};
const textStylele = {
	color: "#FFFFFF", // 设置文本颜色
};

const telSign = ref({
	tel: "",
	verifyCode: "",
});

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

const countDownVal = ref(null);
const countDownTel = ref(true);
const countDownTelText = ref( t( 'sign.getVCode' ) );

const verificationRef = ref(null);
const verificationShow = ref(false);
const sliderShow = ref(false); //滑块验证显示

onMounted(() => {
	store.commit("setFooterView", false);
	store.commit("setHeaderView", false);

	//store.state.regPacket
	//   store.commit('setHeaderView',false);
	if (localStorage.getItem("login_account")) {
		remember.value = true;
		accountSign.value = JSON.parse(localStorage.getItem("login_account"));
	}

	store.commit("setRegPacket", {
		closeRed: false,
		openRed: false,
		leftSmall: false,
		money: 0,
	});
});

function switchSignType(str) {
	signType.value = str;
}

// function onClickClose() {
//	 store.commit("setSignView", false);
// }

// 返回home
function onClickClose() {
	router.push({
		path: "/p",
	});
}

function scrollToElement() {
	// 获取要滚动到的元素
	var elementToScrollTo = document.getElementById("scrollToThisElement");

	// 使用 scrollIntoView 方法将元素滚动到可视区域
	elementToScrollTo.scrollIntoView({
		behavior: "smooth", // 可选，添加平滑滚动效果
		alignWithTop: true, // 可选，将元素顶部与可视区域顶部对齐
	});
}

async function onAccountLogin(v) {
	if (!agreementChecked.value) {
		NotifyF( t( 'sign.checkAgreementAndPrivacy' ) )
		return;
	}
	let params = {};
		params.account = /^\d{9}$/.test(v.account) ? `0${v.account}` : v.account;
		params.platformId = store.state.platformId;
		params.password = v.password;
		params.type = 2;

	const res = await login(params);
	if (res.code === 0) {
		Notify(res.message);
		onLoginSuc(res.data);
		rememberPW();

		let returnURL = localStorage.getItem("returnURL");
		if (returnURL) {
			localStorage.removeItem("returnURL");
			router.replace(returnURL);
		} else if (route.query.type == "forgetpw") {
			router.replace("/m/home");
		} else {
			router.go(-1);
		}
		// router.replace({
		//	 path: "/m",
		// });
	}
}

async function onPhoneLogin(v) {
	if (!agreementChecked.value) {
		NotifyF( t( 'sign.checkAgreementAndPrivacy' ) );
		return;
	}

	let params = {};
		params.account = v.tel;
		params.platformId = store.state.platformId;
		params.verifyCode = v.verifyCode;
		params.type = 1;

	const res = await login(params);
	if (res.code === 0) {
		Notify(res.message);
		onLoginSuc(res.data);
		if (route.query.type == "forgetpw") {
			router.replace("/m/home");
		} else {
			router.go(-1);
		}
		// router.replace({
		//	 path: "/m",
		// });
	}
}

function onLoginSuc(data) {
	store.commit("setLoginInfo", data);
	store.dispatch("getUserInfo");
	store.dispatch("initModuleList");
	store.dispatch("getActivityConfig");
	store.commit("setSignView", false);
	store.commit("setSwitchNotice", true);
	ws.send( JSON.stringify( {
		cid : 11,
		data : JSON.stringify( { token : data.token } )
	} ) )
	// Window.webSocketSend({
	//	 cid: 11,
	//	 data: JSON.stringify({ token: data.token }),
	// });
}

// //忘记密码
// function onClickForget() {
//	 store.commit("setSignView", false);
//	 store.commit("setForgetPWView", true);
// }
// 每日奖励
function onClickForget() {
	router.push({
		path: "/m/forgetPW",
	});
}

function setAgreemenChecked() {
	agreementChecked.value = !agreementChecked.value;
}

// function onClickRegister() {
//	 // store.commit("setSignView", false);
//	 store.commit("setRegisterView", true);
// }

// 每日奖励
function onClickRegister() {
	router.replace({
		path: "/m/register",
	});
}

function toRoute(path) {
	router.push(path);
	store.commit("setSignView", false);
}

/*倒计时相关*/
//点击获取时(校验格式+图形验证)
function toCountDown(data, name) {
	if (!telSign.value.tel) {
		NotifyF( t( 'sign.enterPhoneNumber' ) )
		return;
	}
	if (!validatorTel(telSign.value.tel))
	{
		NotifyF( t( 'sign.phoneNumberFail' ) )
		return;
	}
	showVcode();
}

function startCountDown() {
	countDownTel.value = false;
	countDownVal.value.start();
}

//倒计时结束
function countdownfinish(name) {
	if (name == "countDownTel") {
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
	params.mobile = telSign.value.tel;
	params.type = 1;
	params.platformId = store.state.platformId;
	const res = await getVerifyCode(params);
	if (res.code === 0) {
		startCountDown();
		Notify(res.message);
	}
}

// 关闭图形验证
function onVerificationClose() {
	verificationShow.value = false;
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
	if (/^(\\+?84|0)?\d{9}$/.test(val)) {
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
	return /^(\\+?84|0)?\d{9}$/.test(val)
}

function hasTelLogin() {
	return !Window.googleChannel;
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
	<!-- <van-popup v-model="show" :lock-scroll="false" /> -->
	<div id="sign-wrap">
		<!--		<van-overlay
			:show="showSignView"
			style="background-color: rgba(255, 255, 255, 1)"
			:z-index="999999"
		> -->
		<!-- <van-popup v-model="show" :lock-scroll="false" /> -->
		<!-- <div class="background"></div> -->
		<div class="head">
			<div class="wrapper">
				<div class="signup-main">
					<div class="close" @click="onClickClose">
						<span class="icon iconfont">&#xe637;</span>
					</div>

					<div
						class="login-title"
						:class="{ 'my-style': signType === 'account' }"
						@click="switchSignType('account')"
					>
						{{ t( 'sign.loginTitle' ) }}
						<div class="writ" v-show="signType == 'account'"></div>
					</div>
					<div class="login-title" @click="onClickRegister">
						{{ t( 'sign.registerTitle' ) }}
						<div class="writ" v-show="signType == 'tel'"></div>
					</div>

					<van-form @submit="onAccountLogin" v-show="signType == 'account'">
						<van-field
							autofocus="true"
							v-model="accountSign.account"
							name="account"
							:left-icon="username_icon"
							label-width="0"
							:placeholder="t( 'sign.enterAccount' )"
							@onclick="scrollToElement"
						>
						</van-field>

						<van-field
							v-model="accountSign.password"
							type="password"
							name="password"
							:left-icon="userpassword_icon"
							label-width="0"
							:placeholder="t( 'battle.enterPassword' )"
							maxlength="16"
							@onclick="scrollToElement"
						>
							<template #button>
								<div
									class="btn-verification"
									v-show="countDownTel"
									@click="onClickForget"
								>
									{{ t( 'sign.forgetPassword' ) }}？
								</div>

								<van-count-down
									v-show="!countDownTel"
									ref="countDownVal"
									millisecond
									:time="60 * 1000"
									:auto-start="false"
									format="ss"
									@finish="countdownfinish('countDownTel')"
								/> </template
						></van-field>

						<div class="remember-wrap">
							<div class="remember">
								<van-checkbox
									v-model="remember"
									checked-color="#FBFA02"
									shape="square"
									><p class="text-1" :class="{ active: !remember }">{{ t( 'sign.rememberPassword' ) }}</p>
									<template #icon="props">
										<img
											class="img-icon"
											:src="props.checked ? inactiveIcon : activeIcon"
										/>
										{{ props.checked }}
									</template>
								</van-checkbox>
							</div>
						</div>

						<div class="agreement_box">
							<div
								class="agreement_icon"
								:class="{ active: agreementChecked }"
								@click="setAgreemenChecked"
							></div>
							<p class="text" :class="{ active: agreementChecked }">
								{{ t( 'sign.over18YearsOld' ) }}<span @click="toRoute('/m/help/regulations')"
									>《{{ t( 'sign.userAgreement' ) }}》</span
								>{{ t( 'sign.and' ) }}<span @click="toRoute('/m/help/privacy')">《{{ t( 'sign.privacyPolicy' ) }}》</span>
							</p>
						</div>

						<!-- <div class="steam">

														<a :href="steamUrl">
																<img src="@/assets/romimg/sign/steam.png" alt="">
														</a>
														<p>steam一键登录</p>
												</div> -->

						<div class="button_out">
							<van-button round block type="info" native-type="submit"
								>{{ t( 'sign.loginBtn' ) }}</van-button
							>
						</div>

						<!-- <div class="codeloginsa" @click="onClickRegister">注册账号</div> -->
					</van-form>

					<van-form
						@submit="onPhoneLogin"
						class="tel"
						v-show="signType == 'tel'"
					>
						<van-field
							v-model="telSign.tel"
							name="tel"
							label-width="0"
							:left-icon="userphone"
							:placeholder="t( 'sign.enterPhoneNumber' )"
							:rules="[{ validator: validatorTel, message: t( 'sign.formatFail' ) }]"
						>
						</van-field>
						<van-field
							v-model="telSign.verifyCode"
							clearable
							:left-icon="useryanzm"
							name="verifyCode"
							label-width="50%"
							:placeholder="t( 'sign.enterVCode' )"
						>
							<template #button>
								<div
									class="btn-verification"
									v-show="countDownTel"
									@click="toCountDown(telSign.tel, 'countDownTel')"
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
									@finish="countdownfinish('countDownTel')"
								/>
							</template>
						</van-field>
						<!-- <div class="remember-wrap">
							<div class="zhanwei"></div>
							<div class="forget" @click="onClickForget()">忘记密码</div>
						</div> -->

						<!-- <div class="agreement_box">
							<div
								class="agreement_icon"
								:class="{ active: agreementChecked }"
								@click="setAgreemenChecked"
							></div>
							<p>
								我已满18岁，并阅读和同意<span
									@click="toRoute('/m/help/regulations')"
									>《用户协议》</span
								>和<span @click="toRoute('/m/help/privacy')">《隐私政策》</span
								>，承诺理性消费。
							</p>
						</div> -->

						<div class="agreement_box">
							<div
								class="agreement_icon"
								:class="{ active: agreementChecked }"
								@click="setAgreemenChecked"
							></div>
							<p class="text" :class="{ active: agreementChecked }">
								{{ t( 'sign.over18yearsOld' ) }}<span @click="toRoute('/m/help/regulations')"
									>《{{ t( 'sign.userAgreement' ) }}》</span
								>{{ t( 'sign.and' ) }}<span @click="toRoute('/m/help/privacy')">《{{ t( 'sign.privacyPolicy' ) }}》</span>
							</p>
						</div>

						<!-- <div class="steam">
														<a :href="steamUrl">
																<img src="@/assets/romimg/sign/steam.png" alt="">
														</a>
														<p>steam一键登录</p>
												</div> -->
						<div class="button_out">
							<van-button
								class="top"
								round
								block
								type="info"
								native-type="submit"
								>{{ t( 'sign.loginBtn' ) }}</van-button
							>
							<!-- <div class="register-btn" @click="onClickRegister()">去注册</div> -->
						</div>

						<div class="codeloginsa" @click="onClickRegister">{{ t( 'sign.toRegister' ) }}</div>
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
#sign-wrap {
	// .background{
	// 	width: 100%;
	// 	height: 100%;
	// 	position: absolute;
	// 	background-image: url("@/assets/romimg/sign/Mask group_1.png"); /* 替换为你的图片 URL no-repeat*/
	// 	background-size: contain;
	// 	background-repeat: no-repeat;
	// 	z-index: 1; /* 适当的z-index值 */
	// }

	.text-1 {
		color: #ffffff;
		&.active {
			color: #666e7a;
		}
	}

	.my-style {
		// font-weight: bold; /* 加粗字体 */
		color: #ffffff !important ;
	}

	.writ {
		width: 100%;
		height: 4px;
		margin-top: 14px;
		background-color: #ffffff;
	}

	.verification-code-field .van-field__error-message {
		color: red; /* 将错误消息的文本颜色设置为红色 */
		font-size: 14px; /* 设置字体大小 */
		bottom: -15px;
		// font-style: italic; /* 设置字体样式为斜体 */
	}

	.head {
		//		z-index: 201 !important;
		// position: absolute;
		left: 0%;
		top: 0;
		height: 100%;
		// overflow: auto;
		.img {
			margin-top: 100px;
			width: 344px;
		}

		.blu {
			color: #1a7ae4;
		}

		.codeloginsa {
			display: flex;
			justify-content: center;
			position: relative;
			width: 656px;
			margin: 0 auto; /* 水平居中 */
			height: 76px;
			margin-top: 0.555rem;
			// background-color: #1a7ae4;
			border: 4px solid #3a34b0;
			align-items: center; /* 垂直居中 */
			font-size: 28px;
			color: #ffffff;
		}

		.codelogins {
			color: #3d89df;
			margin-left: 40px;
			margin-top: 0.61rem;
			margin-bottom: 70px;
			font-size: 28px;
			width: 20%;
		}

		.wrapper {
			width: 750px;
			height: 1552px;
			background: #15172c; /* 上到下的渐变背景色 */
			// box-sizing: border-box;
			// box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.05);
			.signup-main {
				width: 750px;
				height: 1552px;
				// position: relative;
				// display: flex;
				// flex-direction: column;
				// justify-content: space-between;
				&::-webkit-scrollbar {
					display: none;
				}

				padding: 6px;
				box-sizing: border-box;
				// position: absolute;
				background-image: url("@/assets/romimg/sign/background.png"); /* 替换为你的图片 URL no-repeat*/
				background-size: contain;
				background-repeat: no-repeat;
				overflow: auto;
				.login-title {
					// display: flex;
					// box-sizing: border-box;
					// flex-direction: column; /* 子元素垂直排列 */
					// padding: 30px;
					// height: 200px;
					margin-top: 410px;
					margin-bottom: 77px;
					margin-left: 47.5px;
					color: #666e7a;

					// text-align: left;

					font-size: 36px;
					font-style: normal;
					display: inline-block;
					// font-weight: 400;
					// line-height: 200px;
					// text-transform: uppercase;
					// justify-content: center; /* 在主轴上水平居中 */
				}

				.close {
					// width: 60px;
					// height: 60px;
					// position: absolute;
					// right: 0px;
					// top: 30px;
					margin: 25px;
					color: #ffffff;
					text-align: right; /*控制文本居中对齐*/
					span {
						text-align: right; /*控制文本居中对齐*/
						font-size: 30px;
					}
				}

				.van-form {
					width: 100%;
					margin: 0 auto;
					min-height: 500px;
					.van-cell {
						display: flex;
						align-items: center;
						width: 660px;
						background: none;
						border-radius: 4px;
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
						// &:first-child {
						//	 border-top-left-radius: 10px;
						//	 border-top-right-radius: 10px;
						// }

						&::after {
							border-bottom: 1px solid #232749;
						}

						.van-cell__title {
							label {
								display: none;
							}
						}

						.van-field__control {
							resize: none; /* 禁用用户调整大小的功能 */
							color: #dcdcdc;

							font-size: 26px;
							font-style: normal;
							font-weight: 400;
						}
						.van-field__left-icon {
							display: flex;
							align-items: center;
							box-sizing: border-box;
							.van-icon {
								font-size: 36px;
								line-height: 36px;
								margin-right: 10px;
								margin-left: 30px;
							}
						}
						.van-cell__value {
							position: relative;
							.van-field__error-message {
								width: 25%;
								position: absolute;
								// margin-top: 20px;
								// left: 10px;
								font-size: 24px;
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
							margin-right: 30px;
							// margin-top: 15px;
						}

						.van-count-down {
							width: 145px;
							height: 58px;
							background: none;
							// border: 2px solid #fbfa02;
							color: #dcdcdc;
							font-size: 22px;
							text-align: center;
							line-height: 58px;
						}
					}

					// &.tel {
					// .van-cell {
					//	 &:nth-child(2) {
					//		 .van-field__error-message {
					//			 // position: absolute;
					//			 top: 45px;
					//			 font-size: 22px;
					//		 }
					//	 }
					// }
					// }

					.remember-wrap {
						display: flex;
						justify-content: space-between;
						align-items: center;
						// width: 100%;
						// margin: 20px 0;
						margin-top: 30px;
						// padding-right: 45px;
						// box-sizing: border-box;
						margin-left: 20px;

						.remember {
							.van-checkbox {
								height: 40px;
								font-size: 24px;

								.van-checkbox__label {
									font-size: 24px;
									color: #666e7a;
									height: 30px;
									line-height: 30px;
								}

								i {
									width: 25px;
									height: 25px;
									border: 2px solid #fff;

									&::before {
										color: #000;
										width: 25px;
										height: 25px;
										line-height: 25px;
									}
								}
								.van-checkbox__icon {
									width: 40px;
									height: 40px;
									padding-left: 20px;
									.img-icon {
										width: 32px;
										height: 32px;
									}
								}
							}
						}

						.forget {
							text-align: right;
							color: #fff;
							font-size: 22px;
							margin-right: 20px;
						}
						.codelogin {
							color: #2c65a8;

							font-size: 14px;
							font-style: normal;
							font-weight: 400;
							line-height: 21.6px; /* 154.286% */
							// text-transform: uppercase;
						}
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

				.agreement_box {
					margin-top: 20px;
					width: 100%;
					display: flex;
					// align-items: center;
					// justify-content: center;
					// margin: 20px auto 0;
					font-size: 24px;
					margin-left: 12px;
					// margin-bottom: 20px;
					// padding-left: 20px;

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

					img {
						top: 1300px;
						position: absolute; /* 使用绝对定位 */
						display: flex;
						justify-content: center; /* 水平居中 */
						align-items: center; /* 垂直居中 */
						margin-left: 200px;
						// justify-content: center; /* 水平居中 */
						// align-items: center; /* 垂直居中 */
					}

					p {
						margin-top: 30px;
					}
				}
			}
		}
	}
}

.cancellation-message {
	height: 480px !important;
	background-size: 100% 100% !important;

	.van-dialog__header {
		text-align: center;
		font-size: 30px !important;
		color: #ffc400;
		transform: translateY(20px);
	}

	.van-dialog__message {
		text-align: left !important;
		padding: 0 20px !important;
		box-sizing: border-box !important;
	}
}
</style>
