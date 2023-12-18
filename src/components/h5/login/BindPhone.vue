<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import Verification from "../verification/Index.vue";
import { useStore } from "vuex";
import { computed, onMounted, ref } from "vue";
import { bindMobile, getVerifyCode } from "@/network/api/login";

const store = useStore();
const showBindPhoneiew = computed(() => store.state.showBindPhoneiew);

const telSign = ref({
	tel: "",
	verifyCode: "",
});

const countDownVal = ref(null);
const countDownTel = ref(true);
const countDownTelText = ref( t( 'sign.sendSMS' ) );

const verificationRef = ref(null);
const verificationShow = ref(false);

onMounted(() => {});

async function onBindPhone(v) {
	let params = {};
		params.mobile = /^\d{9}$/.test(v.tel) ? `0${v.tel}` : v.tel;
		params.verifyCode = v.verifyCode;

	const res = await bindMobile(params);
	if (res.code === 0) {
		Notify( t( 'sign.bindSuccess' ) );
		store.commit("setBindPhoneView", false);
		store.dispatch("getUserInfo");
	}
}

/*倒计时相关*/
//点击获取时(校验格式+图形验证)
function toCountDown(data, name) {
	if (!telSign.value.tel) {
		NotifyF( t( 'sign.enterPhoneNumber' ) );
		return;
	}
	if (!validatorTel(telSign.value.tel)) {
		NotifyF( t( 'sign.phoneNumberFail' ) );
		return;
	}
	verificationRef.value.openPicCode();
	verificationShow.value = true;
}

function startCountDown() {
	countDownTel.value = false;
	countDownVal.value.start();
}

//倒计时结束
function countdownfinish(name) {
	countDownTel.value = true;
	countDownVal.value.reset();
}

// 通过图形验证
async function onVerificationSuc(picData) {
	verificationShow.value = false;

	let params = { ...picData };
		params.mobile = /^\d{9}$/.test(telSign.value.tel) ? `0${telSign.value.tel}` : telSign.value.tel;
		params.type = 1;
		params.platformId = store.state.platformId;
		params.graphicId = picData.graphicId;
		params.graphicCode = picData.graphicCode;
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

//账号格式验证
function validatorTel(val) {
	return /^(\\+?84|0)?\d{9}$/.test(val);
}
</script>

<template>
	<div id="bind-phone-wrap">
		<van-overlay
			:show="showBindPhoneiew"
			style="background-color: rgba(0, 0, 0, 0.8)"
		>
			<div class="wrapper">
				<div class="signup-main">
					<div class="sign-tab-wrap">
						<div class="sign-tab-item active">{{ t( sign.bindPhoneTitle ) }}</div>
					</div>
					<van-form @submit="onBindPhone" class="tel">
						<van-field
							v-model="telSign.tel"
							name="tel"
							label-width="0"
							:placeholder="t( sign.enterPhoneNumber )"
							:rules="[{ validator: validatorTel, message: t( sign.formatFail ) }]"
						/>
						<van-field
							v-model="telSign.verifyCode"
							center
							clearable
							name="verifyCode"
							label-width="0"
							:placeholder="t( sign.enterVCode )"
							:rules="[{ required: true, message: t( sign.enterVCode ) }]"
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

						<div class="button_out">
							<van-button
								class="top"
								round
								block
								type="info"
								native-type="submit"
								>{{ t( sign.confirmBind ) }}</van-button
							>
						</div>
					</van-form>
				</div>
			</div>
			<Verification
				ref="verificationRef"
				:vrShow="verificationShow"
				@verificationSuc="onVerificationSuc"
				@verificationClose="onVerificationClose"
			></Verification>
		</van-overlay>
	</div>
</template>

<style lang="scss">
#bind-phone-wrap {
	.van-overlay {
		z-index: 201 !important;

		.wrapper {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;

			.signup-main {
				width: 516px;
				height: 839px;
				background: url(@/assets/romimg/sign/back.png) no-repeat center;
				background-size: contain;
				position: relative;
				padding: 6px;
				box-sizing: border-box;

				.sign-tab-wrap {
					width: 100%;
					height: 60px;
					margin-top: 42px;
					padding-left: 57px;
					display: flex;
					align-items: center;
					margin-bottom: 100px;

					.sign-tab-item {
						width: 139px;
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
					width: 390px;
					margin: 0 auto;

					.van-cell {
						width: 100%;
						background: none;
						margin-top: 120px;
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
							font-size: 24px;
							height: 40px;
						}

						.van-cell__value {
							position: relative;

							.van-field__error-message {
								position: absolute;
								top: 60px;
								font-size: 20px;
							}
						}

						.btn-verification {
							width: 105px;
							height: 35px;
							background: none;
							border: 2px solid #fbfa02;
							color: #fff;
							font-size: 16px;
							text-align: center;
							line-height: 35px;
						}

						.van-count-down {
							width: 105px;
							height: 35px;
							background: none;
							border: 2px solid #fbfa02;
							color: #fff;
							font-size: 20px;
							text-align: center;
							line-height: 35px;
							border-radius: 4px;
						}
					}

					&.tel {
						.van-cell {
							&:nth-child(2) {
								.van-field__error-message {
									position: absolute;
									top: 84px;
									font-size: 20px;
								}
							}
						}
					}

					.button_out {
						width: 100%;
						position: relative;
						margin-top: 120px;

						.van-button {
							width: 128px;
							height: 49px;
							margin: 40px auto 0;
							background: url(@/assets/romimg/sign/btn1.png) no-repeat center;
							background-size: contain;
							border: none !important;
							border-radius: 0 !important;
							font-size: 20px;
							color: #20212b;
							font-weight: bold;
						}

						p {
							position: absolute;
							color: #fbfa02;
							font-size: 24px;
							right: 30px;
							top: 10px;
						}
					}
				}
			}
		}
	}
}
</style>
