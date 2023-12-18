<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useStore } from 'vuex';
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Verification from '../verification/Index.vue';
import { getVerifyCode, forgotPassword } from '@/network/api/login';

const router = useRouter();
const store = useStore();

const forgetViewShow = computed(() => store.state.showForgetPWView);
const forgetViewType = ref('tel') // tel email


const telReg = ref({
	tel: '',
	verifyCode: '',
	password: '',
	repeatpassword: '',
});

const mailReg = ref({
	email: '',
	verifyCode: '',
	password: '',
	repeatpassword: '',
});

const countDownVal = ref(null);
const countDownTel = ref(true);
const countDownTelText = ref( t( 'sign.sendSMS' ) );

const countDownMailVal = ref(null);
const countDownMailTel = ref(true);
const countDownMailText = ref( t( 'sign.sendSMS' ) );

const verificationRef = ref(null);
const verificationShow = ref(false);


onMounted(() => {
	if (Window.googleChannel) {
		forgetViewType.value = "email"
	}
})

function switchTabType(str) {
	forgetViewType.value = str;
}

function onClickClose() {
	store.commit('setForgetPWView', false);
}

function onClickSign() {
	onClickClose();
	store.commit('setSignView', true);
}

async function onPhoneGet(v) {
	let params = {};
	params.mobile = v.tel;
	params.platformId = store.state.platformId;
	params.password = v.password;
	params.type = 1;
	params.verifyCode = v.verifyCode;

	const res = await forgotPassword(params);
	if (res.code === 0) {
		Success( { offset : 100, message : res.message } )
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
		Success( { offset : 100, message : res.message } )
		onClickSign();
	}
}

/*倒计时相关*/
function toCountDown(data, name) {
	let curTabName = forgetViewType.value;
	if (curTabName == 'tel') {
		if (!telReg.value.tel) {
			Warn( { offset : 100, message : t( 'sign.enterPhoneNumber' ), customClass : 'error' } )
			return;
		}
		if (!validatorTel(telReg.value.tel)) {
			Warn( { offset : 100, message : t( 'sign.phoneNumberFail' ), customClass : 'error' } )
			return;
		}
	} else {
		if (!mailReg.value.email) {
			Warn( { offset : 100, message : t( 'sign.enterEmail' ), customClass : 'error' } )
			return;
		}
	}
	verificationRef.value.openPicCode();
	verificationShow.value = true;

}


function toRoute(path) {
	onClickClose();
	router.push(path);
}

function startCountDown(val) {
	if ('tel' == val) {
		countDownTel.value = false;
		countDownVal.value.start();
	} else {
		countDownMailTel.value = false;
		countDownMailVal.value.start();
	}

}

//倒计时结束
function countdownfinish(name) {
	if (forgetViewType.value == 'tel') {
		countDownTel.value = true;
		countDownVal.value.reset();
	} else {
		countDownMailTel.value = true;
		countDownMailVal.value.reset();
	}

}

// 通过图形验证
async function onVerificationSuc(picData) {
	verificationShow.value = false;

	let params = {};
	let curTabName = forgetViewType.value;
	if (curTabName == 'tel') {
		params.mobile = telReg.value.tel;
		params.type = 1;
	} else {
		params.email = mailReg.value.email;
		params.type = 2;
	}
	params.platformId = store.state.platformId;
	params.graphicId = picData.graphicId;
	params.graphicCode = picData.graphicCode;


	const res = await getVerifyCode(params);
	if (res.code === 0) {
		startCountDown(curTabName);
		Success( { offset : 100, message : res.message } )
	}
}

// 关闭图形验证
function onVerificationClose() {
	verificationShow.value = false;
}

function hasTelTab() {
	return !Window.googleChannel
}
/*表单验证相关*/
//手机验证
function validatorTel(val) {
		return /^(\\+?84|0)?((1(2([0-9])|6([2-9])|88|99))|(9((?!5)[0-9])))([0-9]{7})$/.test(val);
}
function validatorMail(val) {
	return /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(val)
}
function validatorRepeatPW(val) {
	return val == telReg.value.password || val == mailReg.value.password
}
</script>
		
<template>
	<div id="pc-forgetpw">
		<van-overlay :show="forgetViewShow" style="background-color: rgba(0,0,0,.7);">
			<div class="wrapper" @click.stop>
				<div class="fg-main-wrap">
					<div class="close" @click="onClickClose()"> <img src="@/assets/pcimg/home/close.png" alt="" />
					</div>
					<div class="tab-wrap">
						{{ t( 'sign.retrievePassword' ) }}
					</div>
					<van-form @submit="onPhoneGet" v-show="forgetViewType == 'tel'">
						<van-field v-model="telReg.tel" name="tel" label-width="0" 
							:placeholder="t( 'sign.enterPhoneNumber' )"
							:rules="[{ validator: validatorTel, message: t( 'sign.formatFail' ) }]" />

						<van-field v-model="telReg.verifyCode" center clearable name="verifyCode" label-width="0"
							:placeholder="t( 'sign.enterVCode' )" :rules="[{ required: true, message: t( 'sign.enterVCode' ) }]">
							<template #button>
								<div class="btn-verification" v-show="countDownTel"
									@click="toCountDown(telReg.tel, 'countDown_tel', '1')">{{ countDownTelText }}
								</div>

								<van-count-down v-show="!countDownTel" ref="countDownVal" millisecond :time="60 * 1000"
									:auto-start="false" format="ss" @finish="countdownfinish('countDown_tel')" />
							</template>
						</van-field>

						<van-field v-model="telReg.password" type="password" name="password" label-width="0"
							:placeholder="t( 'sign.passwordLimit' )" :rules="[{ required: true, message: t( 'sign.enterPassword' ) }]" />

						<van-field v-model="telReg.repeatpassword" type="password" name="Repeatpassword" label-width="0"
							:placeholder="t( 'sign.enterPasswordAgain' )" maxlength="16"
							:rules="[{ validator: validatorRepeatPW, message: t( 'sign.passwordAreInconsistent' ) }]" />



						<div class="button_out">
							<van-button round block type="info" native-type="submit">{{ t( 'sign.retrievePassword' ) }}</van-button>
							<p @click="onClickSign()"	v-if="false">{{ t( 'sign.toLoginBtn' ) }}</p>
						</div>
					</van-form>


					<!-- 邮箱注册 -->
					<van-form @submit="oonMailGet" class="mail" v-show="forgetViewType == 'email'">
						<van-field v-model="mailReg.email" name="email" label-width="0" 
							:placeholder="t( 'sign.enterEmail' )"
							:rules="[{ validator: validatorMail, message: t( 'sign.formatFail' ) }]" />
						<van-field v-model="mailReg.verifyCode" center clearable name="verifyCode" label-width="0"
							:placeholder="t( 'sign.enterVCode' )" :rules="[{ required: true, message: t( 'sign.enterVCode' ) }]">
							<template #button>
								<div class="btn-verification" v-show="countDownMailTel"
									@click="toCountDown(mailReg.email, 'countDown_mail', '2')">{{ countDownMailText }}
								</div>
								<van-count-down v-show="!countDownMailTel" ref="countDownMailVal" millisecond
									:time="60 * 1000" :auto-start="false" format="ss"
									@finish="countdownfinish('countDown_mail')" />
							</template>
						</van-field>
						<van-field v-model="mailReg.password" type="password" name="password" label-width="0"
							:placeholder="t( 'sign.passwordLimit' )" :rules="[{ required: true, message: t( 'sign.enterPassword' ) }]" />
						<van-field v-model="mailReg.repeatpassword" type="password" name="Repeatpassword" label-width="0"
							:placeholder="t( 'sign.enterPasswordAgain' )" maxlength="16"
							:rules="[{ validator: validatorRepeatPW, message: t( 'sign.passwordAreInconsistent' ) }]" />

						<div class="button_out">
							<van-button round block type="info" native-type="submit">{{ t( 'sign.retrievePassword' ) }}</van-button>
							<p @click="onClickSign()" v-if="false">{{ t( 'sign.toLoginBtn' ) }}</p>
						</div>
					</van-form>

				</div>

			</div>
			<Verification ref="verificationRef" :vrShow="verificationShow" @verificationSuc="onVerificationSuc"
				@verificationClose="onVerificationClose"></Verification>

		</van-overlay>
	</div>
</template>
		
<style lang="scss" >
#pc-forgetpw {
	.van-overlay {
		z-index: 201 !important;

		.wrapper {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;

			.fg-main-wrap {
				width: 590px;
				border-radius: 7px;
				background: #272C51;
				position: relative;
				box-sizing: border-box;
				box-shadow: 0px 0px 4px 0px #6E6AB2 inset;
				filter: drop-shadow(0px 0px 2px #3A34B0);

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


				.tab-wrap {
					width: 586px;
					height: 75px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: #16182E;
					margin: 3px 2px 0;
					box-sizing: border-box;
					color: #FFF;
			
					font-size: 21px;
					font-weight: 600;
				}

				.forgetpw {
					width: 100%;
					height: 60px;
					margin-top: 42px;
					padding-left: 57px;
					display: flex;
					align-items: center;
					margin-bottom: 30px;

					.fg-tab-item {
						width: 139px;
						height: 50px;
						text-align: center;
						line-height: 50px;
						color: #fff;
						font-size: 18px;
						font-weight: bold;
						background: url(@/assets/romimg/common/tab_item.png) no-repeat center;
						background-size: contain;
						cursor: pointer;

						&.active {
							color: #141427;
							background: url(@/assets/romimg/common/tab_item_active.png) no-repeat center;
							background-size: contain;
						}

						&:nth-child(2n) {
							margin-left: -6px;
						}
					}
				}


				.van-form {
					width: 503px;
					margin: 0 auto;


					.van-cell {
						width: 503px;
						background: #fff;
						border: 1px solid #3A3967;
						border-radius: 4px;
						margin-top: 20px;
						overflow: visible;

						&::after {
							border-bottom: none;
						}

						.van-cell__title {
							label {
								display: none;
							}
						}

						.van-field__control {
							color: #494C6A;
							font-size: 14px;
							height: 40px;

							&::placeholder {
								color: #494C6A;
							}
						}

						.van-cell__value {
							position: relative;

							.van-field__error-message {
								position: absolute;
								top: 50px;
								font-size: 14px;
							}
						}

						.btn-verification {
							width: 83px;
							height: 20px;
							background: none;
							border-left: 1px solid #2A2E38;
							color: #494C6A;
							font-size: 14px;
							text-align: center;
							line-height: 20px;
							cursor: pointer;
						}

						.van-count-down {
							width: 83px;
							height: 20px;
							background: none;
							border-left: 1px solid #2A2E38;
							color: #494C6A;
							font-size: 14px;
							text-align: center;
							line-height: 20px;
						}
					}

					.remember-wrap {
						display: flex;
						justify-content: space-between;
						align-items: center;
						width: 100%;
						margin: 20px 0;
						box-sizing: border-box;

						.remember {
							.van-checkbox {
								height: 30px;

								.van-checkbox__label {
									font-size: 15px;
									color: #A5A8BD;
									height: 20px;
									line-height: 20px;
								}

							}
						}

						.forget {
							text-align: right;
							font-size: 15px;
							color: #A5A8BD;
							height: 20px;
							line-height: 20px;
							cursor: pointer;
						}
					}

					.button_out {
						display: flex;
						justify-content: center;
						align-items: center;
						position: relative;
						width: 100%;
						margin-top: 30px;
						margin-bottom: 42px;

						.van-button {
							width: 503px;
							height: 58px;
							background: #3A34B0;
							border-radius: 6px 6px 6px 6px;
							border: none !important;
							font-size: 15px;
							color: #fff;
							font-weight: bold;
							cursor: pointer;
						}

						.register-btn {
							font-size: 16px;
							color: #fff;
							font-weight: bold;
							cursor: pointer;
						}
					}

					.reg-button {
						display: flex;
						justify-content: center;
						align-items: center;
						position: relative;
						width: 100%;
						margin-top: 30px;
						margin-bottom: 42px;

						.van-button {
							width: 503px;
							height: 58px;
							background: #3A34B0;
							border-radius: 6px 6px 6px 6px;
							border: none !important;
							font-size: 15px;
							color: #fff;
							font-weight: bold;
							cursor: pointer;
						}
					}
				}
			}
		}
	}
}
</style>