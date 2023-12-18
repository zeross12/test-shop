<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useStore } from 'vuex';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Verification from '../verification/Index.vue';
import { getVerifyCode, register, login } from '@/network/api/login';
 
import { getUUID, getDeviceType } from '@/util/common'

const router = useRouter();
const route = useRoute();
const store = useStore();

const registerShow = computed(() => store.state.showRegisterView);
const registerType = ref('tel') // tel email
const agreementChecked = ref(false);

const telReg = ref({
	tel: '',
	verifyCode: '',
	password: '',
	name: '',
	inviteCode: ''
});

const mailReg = ref({
	email: '',
	verifyCode: '',
	password: '',
	name: '',
	inviteCode: ''
});

const countDownVal = ref(null);
const countDownTel = ref(true);
const countDownTelText = ref( t( 'sign.sendSMS' ) );

const countDownMailVal = ref(null);
const countDownMailTel = ref(true);
const countDownMailText = ref( t( 'sign.sendSMS' ) );

const verificationRef = ref(null);
const verificationShow = ref(false);

const inputInviteAbled=ref(false);

const formatterInvite=(value) => value.toUpperCase();

onMounted(() => {
	initInviteCode();

	if(Window.googleChannel){
		registerType.value="email"
	}
})

function initInviteCode() {
	if (route.query.code) {
		telReg.value.inviteCode = route.query.code
		mailReg.value.inviteCode = route.query.code
	} else {
		let query = {
			code: ''
		}
		location.search.substring(1).split('&').forEach(item => {
			query[item.split('=')[0]] = item.split('=')[1]
		})
		telReg.value.inviteCode = query.code
		mailReg.value.inviteCode = query.code
	}
	if( telReg.value.inviteCode !=''){
		inputInviteAbled.value=true;
	}
}


function switchTabType(str) {
	registerType.value = str;
}

function onClickClose() {
	store.commit('setRegisterView', false);
	store.commit('setRegPacket', { closeRed: false, openRed: false, leftSmall: true, money: 0 })
}

function onClickSign() {
	store.commit('setRegisterView', false);
	store.commit('setSignView', true);
}

async function onPhoneReg(v) {
	if (!agreementChecked.value) {
		Warn( { offset : 100, message : t( 'sign.checkAgreementAndPrivacy' ), customClass : 'error' } )
		return
	}
	let params = {};
	params.mobile = v.tel;
	params.hdCode = getUUID();
	params.hdType = getDeviceType();
	params.inviteCode = v.inviteCode;
	params.nickName = v.name;
	params.platformId = store.state.platformId;
	params.password = v.password;
	params.type = 1;
	params.verifyCode = v.verifyCode;
	params.spreadVid = localStorage.getItem('bd_vid');

	const res = await register(params);
	if (res.code === 0) {
		Success( { offset : 100, message : res.message } )
		// onClickSign();
		onAccountLogin({account:params.mobile,password:params.password});
	}
}

async function onMailReg(v) {
	if (!agreementChecked.value) {
		Warn( { offset : 100, message : t( 'sign.checkAgreementAndPrivacy' ), customClass : 'error' } )
		return
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
	params.spreadVid = localStorage.getItem('bd_vid');

	const res = await register(params);
	if (res.code === 0) {
		Success( { offset : 100, message : res.message } )
		// onClickSign();
		onAccountLogin({account:params.email,password:params.password});
	}
}

async function onAccountLogin(v) {
	let params = {};
	params.account = v.account;
	params.platformId = store.state.platformId;
	params.password = v.password;
	params.type = 2;

	const res = await login(params);
	if (res.code === 0) {
	onLoginSuc(res.data);
	localStorage.setItem("login_account", JSON.stringify({account:params.account,password:params.password}));
	}
}

function onLoginSuc(data) {
	store.commit("setLoginInfo", data);
	store.dispatch("getUserInfo");
	store.dispatch("initModuleList");
	store.commit('setRegisterView', false);
	store.commit("setSignView", false);
	store.commit("setSwitchNotice", true);
	ws.send( JSON.stringify( {
	cid : 11,
	data : { token : data.token }
	} ) )
//	 Window.webSocketSend({
//	 cid: 11,
//	 data: JSON.stringify({ token: data.token }),
//	 });
}

/*倒计时相关*/
function toCountDown(data, name) {
	let curTabName = registerType.value;
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
			Warn( { offset : 100, message : t( 'sign.enterMail' ), customClass : 'error' } )
			return;
		}
	}

	verificationRef.value.openPicCode();
	verificationShow.value = true;

}

function setAgreemenChecked() {
	agreementChecked.value = !agreementChecked.value;
}

function go(path) {
	store.commit('setRegisterView', false);
	router.push(path);
}

function startCountDown(name) {
	if (name == 'tel') {
		countDownTel.value = false;
		countDownVal.value.start();
	} else {
		countDownMailTel.value = false;
		countDownMailVal.value.start();
	}

}

//倒计时结束
function countdownfinish(name) {
	if (name == 'tel') {
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
	let curTabName = registerType.value;
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
	params.isRegister = true;

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

function hasTelReg(){
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
</script>
		
<template>
	<div id="pc-register-wrap">
		<van-overlay :show="registerShow" style="background-color: rgba(0,0,0,.7);">
			<div class="wrapper" @click.stop>
				<div class="register-main-wrap">
					<div class="close" @click="onClickClose()"><img src="@/assets/romimg/sign/close.png" alt="">
					</div>
					<div class="register">
						<div class="register-item" :class="{ 'active': registerType == 'tel' }" v-if="hasTelReg()"
							@click="switchTabType('tel')">{{ t( 'sign.registerByPhoneNumber' ) }}</div>
						<div class="register-item" :class="{ 'active': registerType == 'email' }"
							@click="switchTabType('email')">{{ t( 'sign.registerByEmail' ) }}</div>
					</div>
					<van-form @submit="onPhoneReg" v-show="registerType == 'tel'">
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
									:auto-start="false" format="ss" @finish="countdownfinish('tel')" />
							</template>
						</van-field>

						<van-field v-model="telReg.password" type="password" name="password" label-width="0"
							:placeholder="t( 'sign.passwordLimit' )" :rules="[{ required: true, message: t( 'sign.enterPassword' ) }]" />


						<van-field v-model="telReg.name" name="name" label-width="0"
							:placeholder="t( 'sign.enterNicknameOptional' )" />
						<van-field v-model="telReg.inviteCode" name="inviteCode" label-width="0"
							:placeholder="t( 'sign.enterInviteCodeOptional' )" :disabled="inputInviteAbled" :formatter="formatterInvite"/>

						<div class="agreement">
							<div class="agreement_icon" :class="{ 'active': agreementChecked }"
								@click="setAgreemenChecked"></div>
							<!-- <i18n-t keypath="sign.over18YearsOld" tag="p">
								<template v-slot:userAgreement>
									<span @click="go('/p/help/regulations')">{{ t( 'sign.userAgreement' ) }}</span>
								</template>
								<template v-slot:privacyPolicy>
									<span @click="go('/p/help/privacy')">{{ t( 'sign.privacyPolicy' ) }}</span>
								</template>
							</i18n-t> -->
							<p>我已满18岁，并阅读和同意<span @click="go('/p/help/regulations')">《用户协议》</span>和<span
									@click="go('/p/help/privacy')">《隐私政策》</span>，承诺理性消费。</p>
						</div>

						<div class="button_out">
							<van-button round block type="info" native-type="submit">{{ t( 'sign.registerBtn' ) }}</van-button>
							<div class="login-btn" @click="onClickSign()">{{ t( 'sign.toLoginBtn' ) }}</div>
						</div>
					</van-form>


					<!-- 邮箱注册 -->
					<van-form @submit="onMailReg" class="mail" v-show="registerType == 'email'">
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
									@finish="countdownfinish('email')" />
							</template>
						</van-field>
						<van-field v-model="mailReg.password" type="password" name="password" label-width="0"
							:placeholder="t( 'sign.passwordLimit' )" :rules="[{ required: true, message: t( 'sign.enterPassword' ) }]" />
						<van-field v-model="mailReg.name" name="name" label-width="0"
							:placeholder="t( 'sign.enterNicknameOptional' )" />
						<van-field v-model="mailReg.inviteCode" name="inviteCode" label-width="0"
							:placeholder="t( 'sign.enterInviteCodeOptional' )"	:disabled="inputInviteAbled" :formatter="formatterInvite"/>

						<div class="agreement">
							<div class="agreement_icon" :class="{ 'active': agreementChecked }"
								@click="setAgreemenChecked()"></div>
							<!-- <i18n-t keypath="sign.over18YearsOld" tag="p">
								<template v-slot:userAgreement>
									<span @click="go('/p/help/regulations')">{{ t( 'sign.userAgreement' ) }}</span>
								</template>
								<template v-slot:privacyPolicy>
									<span @click="go('/p/help/privacy')">{{ t( 'sign.privacyPolicy' ) }}</span>
								</template>
							</i18n-t> -->
							<p>我已满18岁，并阅读和同意<span @click="go('/m/help/regulations')">《用户协议》</span>和<span
									@click="go('/m/help/privacy')">《隐私政策》</span>，承诺理性消费。</p>
						</div>

						<div class="button_out">
							<van-button round block type="info" native-type="submit">{{ t( 'sign.registerBtn' ) }}</van-button>
							<div class="login-btn" @click="onClickSign()">{{ t( 'sign.toLoginBtn' ) }}</div>
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
#pc-register-wrap {
	.van-overlay {
		z-index: 201 !important;

		.wrapper {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;

			.register-main-wrap {
				width: 659px;
				height: 1077px;
				background: url(@/assets/romimg/sign/back.png) no-repeat center;
				background-size: contain;
				position: relative;
				padding: 6px;
				box-sizing: border-box;
				transform: scale(0.82);

				.close {
					width: 60px;
					height: 60px;
					position: absolute;
					right: -35px;
					top: -50px;
					cursor: pointer;

					img {
						width: 100%;
						height: 100%;
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
						background: url(@/assets/romimg/common/tab_item.png) no-repeat center;
						background-size: 100% 100%;
						cursor: pointer;

						&.active {
							width: 197px;
							color: #141427;
							background: url(@/assets/romimg/common/tab_item_active.png) no-repeat center;
							background-size: 100% 100%;
						}

						&:nth-child(2n) {
							margin-left: -3px;
						}
					}
				}

				.van-form {
					width: 565px;
					margin: 0 auto;

					.agreement {
						width: 100%;
						display: flex;
						align-items: center;
						padding-left: 20px;
						margin-top: 40px;
						font-size: 18px;

						.agreement_icon {
							width: 38px;
							height: 38px;
							background: url(@/assets/romimg/common/unselected.png) no-repeat center;
							background-size: contain;
							margin-right: 15px;
							cursor: pointer;


							&.active {
								background: url(@/assets/romimg/common/selected.png) no-repeat center;
								background-size: contain;
							}
						}

						p {
							color: #fff;
						}
					}

					.van-cell {
						width: 100%;
						background: none;
						margin-top: 60px;
						overflow: visible;

						&::after {
							border-bottom: 2px solid #fbfa02;
						}

						.van-cell__title {
							label {
								display: none;
							}
						}

						.van-field__control {
							color: #fff;
							font-size: 22px;
							height: 40px;
						}

						.van-cell__value {
							position: relative;

							.van-field__error-message {
								position: absolute;
								top: 60px;
								font-size: 22px;
							}
						}

						.btn-verification {
							width: 145px;
							height: 58px;
							background: none;
							border: 2px solid #FBFA02;
							color: #fff;
							font-size: 20px;
							text-align: center;
							line-height: 58px;
							cursor: pointer;
						}

						.van-count-down {
							width: 145px;
							height: 58px;
							background: none;
							border: 2px solid #FBFA02;
							color: #fff;
							font-size: 22px;
							text-align: center;
							line-height: 58px;
						}

						&:nth-child(2) {
							.van-field__error-message {
								position: absolute;
								top: 84px;
								font-size: 22px;
							}
						}

					}


					.button_out {
						width: 100%;
						position: relative;
						margin-top: 60px;
						display: flex;
						justify-content: center;

						.van-button {
							width: 208px;
							height: 63px;
							background: url(@/assets/romimg/sign/btn1.png) no-repeat center;
							background-size: contain;
							border: none !important;
							border-radius: 0 !important;
							font-size: 26px;
							color: #20212b;
							font-weight: bold;
							margin-right: 15px;
						}

						.login-btn {
							width: 208px;
							height: 63px;
							background: url(@/assets/romimg/sign/btn2.png) no-repeat center;
							background-size: contain;
							border: none !important;
							border-radius: 0 !important;
							font-size: 26px;
							color: #C0222E;
							font-weight: bold;
							line-height: 63px;
							text-align: center;
							margin-left: 15px;
							cursor: pointer;
						}

					}

				}
			}
		}
	}
}
</style>