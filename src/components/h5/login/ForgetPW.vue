<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useStore } from "vuex";
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Verification from "../verification/Index.vue";
import { getVerifyCode, forgotPassword } from "@/network/api/login";

import Vcode from "vue3-puzzle-vcode";

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
const router = useRouter();
const store = useStore();

const forgetViewShow = computed(() => store.state.showForgetPWView);
const forgetViewType = ref("tel"); // tel email
const sliderShow = ref(false); //滑块验证显示
const telReg = ref({
	tel: "",
	verifyCode: "",
	password: "",
	repeatpassword: "",
});

const mailReg = ref({
	email: "",
	verifyCode: "",
	password: "",
	repeatpassword: "",
});

const countDownVal = ref(null);
const countDownTel = ref(true);
const countDownTelText = ref( t( 'sign.getVCode' ) );

const countDownMailVal = ref(null);
const countDownMailTel = ref(true);
const countDownMailText = ref( t( 'sign.sendSMS' ) );

const verificationRef = ref(null);
const verificationShow = ref(false);

onMounted(() => {
	store.commit("setFooterView", false);
	store.commit("setHeaderView", false);
	if (Window.googleChannel) {
		forgetViewType.value = "email";
	}
});

function switchTabType(str) {
	forgetViewType.value = str;
}

// function onClickClose() {
//	 store.commit("setForgetPWView", false);
// }

// 登陆界面
function onClickClose() {
	router.push({
		path: "/m/sign",
		query: { type: "forgetpw" },
	});
}

function onClickSign() {
	onClickClose();
	store.commit("setSignView", true);
}

async function onPhoneGet(v) {
	let params = {};
		params.mobile = /^\d{9}$/.test(v.tel) ? `0${v.tel}` : v.tel;
		params.platformId = store.state.platformId;
		params.password = v.password;
		params.type = 1;
		params.verifyCode = v.verifyCode;

	const res = await forgotPassword(params);
	if (res.code === 0) {
		Notify(res.message);
		onClickSign();
	}
}

async function oonMailGet(v) {
	let params = {};
	params.email = v.email;
	params.platformId = store.state.platformId;
	params.password = v.password;
	params.type = 2;
	params.verifyCode = v.verifyCode;

	const res = await forgotPassword(params);
	if (res.code === 0) {
		Notify(res.message);
		onClickSign();
	}
}

/*倒计时相关*/
function toCountDown(data, name) {
	let curTabName = forgetViewType.value;
	if (curTabName == "tel") {
		if (!telReg.value.tel) {
			NotifyF( t(' sign.enterPhoneNumber' ) );
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

function toRoute(path) {
	onClickClose();
	router.push(path);
}

function startCountDown(val) {
	if ("tel" == val) {
		countDownTel.value = false;
		countDownVal.value.start();
	} else {
		countDownMailTel.value = false;
		countDownMailVal.value.start();
	}
}

//倒计时结束
function countdownfinish(name) {
	if (forgetViewType.value == "tel") {
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
	let curTabName = forgetViewType.value;
	if (curTabName == "tel") {
		params.mobile = /^\d{9}$/.test(telReg.value.tel) ? `0${telReg.value.tel}` : telReg.value.tel;
		params.type = 1;
	} else {
		params.email = mailReg.value.email;
		params.type = 2;
	}
	params.platformId = store.state.platformId;
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

function hasTelTab() {
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

function validatorRepeatPW(val) {
	return val == telReg.value.password || val == mailReg.value.password;
}
function goToLogin() {
	store.commit("setForgetPWView", false);
	store.commit("setSignView", true);
}
</script>

<template>
	<div id="forgetpw">
		<div class="head">
			<div class="wrapper" @click.stop>
				<div class="fg-main-wrap">
					<div class="clos-1">
						<span class="icon iconfont" @click="onClickClose">&#xe637;</span>
					</div>

					<div class="login-title">
						{{ t('sign.retrievePassword') }}
						<div class="writ"></div>
					</div>

					<!-- 手机号注册 -->
					<van-form @submit="onPhoneGet" v-show="forgetViewType == 'tel'">
						<div class="">
							<van-field
								v-model="telReg.tel"
								name="tel"
								label-width="30%"
								placeholder=""
								:label="t( 'sign.phoneNumber' )"
							/>

							<van-field
								v-model="telReg.verifyCode"
								center
								clearable
								name="verifyCode"
								:label="t( 'sign.verificationCode' )"
								label-width="30%"
								placeholder=""
								class="verification-code-field"
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
										@finish="countdownfinish('countDown_tel')"
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
								v-model="telReg.repeatpassword"
								type="password"
								name="Repeatpassword"
								:label="t( 'sign.againPassword' )"
								label-width="35%"
								:placeholder="t( 'sign.passwordSame' )"
								maxlength="16"
							/>
						</div>

						<div class="button_out">
							<van-button round block type="info" native-type="submit"
								>{{ t('users.confirmModify') }}</van-button
							>
						</div>

						<!-- <div class="codeloginsa" @click="goToLogin">去登录</div> -->
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
				successText="验证成功！"
				failText="验证失败，请重试！"
				sliderText="拖动滑块验证"
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
#forgetpw {
	.head {
		//		z-index: 201 !important;
		// position: absolute;
		left: 0%;
		top: 0;
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

		.codeloginsa {
			color: #3d89df;
			display: flex;
			align-items: center; /* 垂直居中 */
			justify-content: center; /* 水平居中 */
			margin-top: 0.555rem;
			font-size: 28px;
		}

		.img {
			margin-top: 60px;
			width: 344px;
		}
		.bottom {
			// background: linear-gradient(180deg, #f6fafb 0%, #2e5eab 100%);
			// position: fixed;
			// bottom: 0px;

			height: 200px;
			width: 750px;
			// padding-top: 250px;
			// margin-top: 3000px;
			text-align: center;
			margin-top: 90px;
			color: #fff;
			font-size: 28px;

			font-weight: 400;
			// text-transform: uppercase;
			box-sizing: border-box;
			border-bottom-left-radius: 10px;
			border-bottom-right-radius: 10px;

			img {
				top: 1150px;
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

		.wrapper {
			// display: flex;
			// align-items: center;
			// justify-content: center;
			height: 100%;
			width: 750px;
			margin: auto;

			background: #15172c; /* 上到下的渐变背景色 */
			.fg-main-wrap {
				width: 750px;
				height: 100%;
				position: relative;
				// padding: 6px;
				box-sizing: border-box;
				overflow: auto;
				background-image: url("@/assets/romimg/sign/background.png"); /* 替换为你的图片 URL no-repeat*/
				background-size: contain;
				background-repeat: no-repeat;
				// display: flex;
				// // justify-content: space-between;
				// flex-direction: column;
				// align-items: center;

				// .backin{
				// 	// margin-right: 20px;
				// 	height: 4.9rem;

				// 	margin: 0 auto;
				// 	// margin-right: calc(50% - 3.055rem);
				// 	background-color: #FFFFFF;
				// 	width: 90%;
				// 	 border-radius: 10px; /* 添加圆角 */
				// }

				.register-header {
					// display: flex;
					// align-items: center;
					// justify-content: center
					// flex-shrink: 0;
					// background: #2c65a8;
					color: #fff;

					font-size: 32px;
					font-style: normal;
					// font-weight: 400;
					// text-transform: uppercase;
					position: relative;
					text-align: right;
					margin: 26px;
					// margin-bottom: 4.874rem;
					span {
						font-size: 30px;
					}
				}

				.close {
					width: 60px;
					height: 60px;
					position: absolute;
					right: -65px;
					top: -60px;

					img {
						width: 100%;
						height: 100%;
					}
				}

				.forgetpw {
					width: 100%;
					height: 60px;
					margin-top: 42px;
					padding-left: 57px;
					display: flex;
					align-items: center;
					margin-bottom: 30px;
					box-sizing: border-box;
					.fg-tab-item {
						width: 150px;
						height: 50px;
						text-align: center;
						line-height: 50px;
						color: #fff;
						font-size: 18px;
						font-weight: bold;
						background: url(@/assets/romimg/common/tab_item.png) no-repeat
							center;
						background-size: contain;

						&.active {
							color: #141427;
							background: url(@/assets/romimg/common/tab_item_active.png)
								no-repeat center;
							background-size: contain;
						}

						&:nth-child(2n) {
							margin-left: -6px;
						}
					}
				}

				.van-form {
					width: 750px;
					padding: 0px 40px;
					box-sizing: border-box;

					.agreement {
						width: 100%;
						display: flex;
						align-items: center;
						padding-left: 20px;
						margin-top: 20px;

						.agreement_icon {
							width: 38px;
							height: 38px;
							background: url(@/assets/romimg/common/unselected.png) no-repeat
								center;
							background-size: contain;
							margin-right: 10px;
							transform: translateY(1px);
							transform: translateY(-16px);

							&.active {
								background: url(@/assets/romimg/common/selected.png) no-repeat
									center;
								background-size: contain;
							}
						}

						p {
							color: #424242;

							span {
								color: #ffc400;
							}
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
						border-radius: 4px;
						resize: none; /* 禁用用户调整大小的功能 */
						vertical-align: middle;
						color: #7a7e89;

						font-size: 26px;
						font-style: normal;
						font-weight: 400;
						margin-bottom: 10px;
						padding: 25px;
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
							line-height: 90px;
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
						//		color: #4f4f4f;
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
						// justify-content: center;
						position: relative;
						width: 6600px;
						margin: 0 auto; /* 水平居中 */
						height: 0.925rem;
						margin-top: 0.55rem;
						margin-right: 30px;
						.van-button {
							width: 660px;
							height: 80px;
							border-radius: 4px;
							background: #3a34b0;
							font-size: 30px;
							color: #fff;
							margin-left: 8px;
							// font-weight: bold;
							// margin: 0 20px;
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
			}
		}
	}
}
</style>
