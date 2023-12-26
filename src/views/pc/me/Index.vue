<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import QRCode from 'qrcodejs2-fix';
import { onMounted, computed, ref, inject, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { _isMobile } from '@/util/common'
import Avatar from './personal/Avatar.vue';
import { changeInvitationCode, changeSpreadCode, realName, queryRealName, update, changePassword, bindSteam } from '@/network/api/user';
import { Dialog, Toast } from 'vant';
import { logout } from '@/network/api/login';
import HeadPortrait from "@/components/pc/head/HeadPortrait.vue";
import { UserType } from '@/util/util'
import useClipboard from "vue-clipboard3";

const { toClipboard } = useClipboard();

const route = useRoute();
const router = useRouter();
const store = useStore();

// const { reloadView } = inject('reloadView')

const userInfoBase = computed(() => store.state.userInfoBase);
const userInfoExt = computed(() => store.state.userInfoExt);

const userInfoAssets = computed(() => store.state.userInfoAssets);
const noReadMessages = computed(() => store.state.noReadMessages);
const userId = computed(() => store.state.userId);
const hasLogin = computed(() => store.getters.hasLogin);

const editName = ref(false);
const userNickName = ref('');

const showAvatar = ref(false);
const avaterRef = ref(null);

const diagEditPW = ref(false);
const inputPWContent = ref('');

const diagReal = ref(false);
const inputRealContent = ref({ realName: userInfoExt.value.realName, idNumber: userInfoExt.value.idNumber });
const hasReal = ref(false);

const diagEditSpread = ref(false);
const inputSpreadContent = ref('');

const diagEditInvite = ref(false);
const inputInviteContent = ref('');

const diagEditSteam = ref(false);
const inputSteamContent = ref('');

/// 认证二维码
const qrCodeDivRef = ref(null);
const QRCodeUrl = ref('')
const QRCodeShow = ref(false)
const intervalID = ref(0)/// 提示内容

function onClickRecharge() {
	store.commit("setRechargeView", true);
}

/// 验证勾选
function verify() {
	// for (let i = 0, j = tipInfo.value.length; i < j; i++) {
	//	 if (!tipInfo.value[i].checked) {
	//	 ELNotifcation.Warn(`请确认${tipInfo.value[i].text}`);
	//	 return;
	//	 }
	// }
	tipShow.value = false;
	store.commit("setRechargeView", true);
}

onMounted(() => {
	if (userInfoExt.value.idNumber) {
		hasReal.value = true;
	}
})

//昵称修改
function openEditName() {
	editName.value = true
}

function opengEditPW() {
	diagEditPW.value = true
}

function openEditReal() {
	if (hasReal.value) return
	diagReal.value = true
}

function openEditSpread() {
	diagEditSpread.value = true;
	inputSpreadContent.value = userInfoExt.value.spreadCode;
}

function openEditInvite() {
	diagEditInvite.value = true;
	inputInviteContent.value = userInfoExt.value.invitationCode;
}

function openEditSteam() {
	diagEditSteam.value = true;
	inputSteamContent.value = userInfoExt.value.steamUrl;
}


function onClickEditAvatar() {
	showAvatar.value = true;
	avaterRef.value.showAvater();
}
function onCloseAvatar() {
	showAvatar.value = false;
}


function onClickEditSure() {
	if (userNickName.value) {
		userNickName.value = userNickName.value.replace(/\s+/g, "");
		let params = { nickName: userNickName.value }
		update(params).then(res => {
			if (res.code == 0) {
				Success({ offset: 100, message: res.message });
				store.dispatch("getUserInfo");
				cancelEditName();
			}
		})
	} else {
		Warn({ offset: 100, message: t('common.inputNil'), customClass: 'error' })
	}
}

function setPassword() {
	if (inputPWContent.value == null || inputPWContent.value.trim() == '') {
		Warn({ offset: 100, message: t('common.inputNil'), customClass: 'error' })
	} else {
		if (/[\u4e00-\u9fa5]|(\ud83c[\udc00-\udfff])|(\ud83d[\udc00-\udfff])|(\ud83e[\udc00-\udfff])|[\u2100-\u32ff]|[\u0030-\u007f][\u20d0-\u20ff]|[\u0080-\u00ff]/g.test(inputPWContent.value))
			return Warn({ offset: 100, message: t('users.enterPasswordFail'), customClass: 'error' })

		if (inputPWContent.value.length < 6)
			return Warn({ offset: 100, message: t('users.enterPasswordTooShort'), customClass: 'error' })

		if (inputPWContent.value.length > 16)
			return Warn({ offset: 100, message: t('users.enterPasswordTooLong'), customClass: 'error' })

		let params = {}
		params.password = inputPWContent.value;

		changePassword(params).then(res => {
			if (res.code == 0) {
				Success({ offset: 100, message: res.message });
				store.commit('logout');
				store.commit('setSignView', true);
			} else {
				inputPWContent.value = '';
			}

		})
	}
}

//实名认证确认保存
async function confirmRealName() {
	let params = {
		realName: inputRealContent.value.realName,
		idNumber: inputRealContent.value.idNumber,
	}

	// let res = await realName( params )

	// if( res.code != 0 ) return 

	// QRCodeUrl.value = res.data.verifyUrl
	// QRCodeShow.value = true

	// diagReal.value = false
	// createQRCode( QRCodeUrl.value )

	// nextTick( () => {
	//	 intervalID.value = setInterval( queryReal, 2000 )
	// } )

	// return window.$dev && console.log( res )
	// window.$dev && console.log( QRCodeUrl )

	realName(params).then(res => {
		if (res.code == 0) {
			store.dispatch("getUserInfo");
			diagReal.value = false;
			hasReal.value = true;
			if (res.data.rewardAmount && res.data.rewardAmount > 0) {
				Success({ offset: 100, message: t('users.realnameRewardTip') });
			}
		}
	})
}

/// 创建二维码
async function createQRCode(v) {
	await nextTick()
	qrCodeDivRef.value.innerHTML = '';
	new QRCode(qrCodeDivRef.value, {
		text: v,
		width: 182,
		height: 182,
		colorDark: "#000", //二维码颜色
		colorLight: "#fff", //二维码背景色
		correctLevel: QRCode.CorrectLevel.L //容错率，L/M/H
	})
}

/// 验证实名情况
async function queryReal() {
	let res = await queryRealName()

	if (res.code == 0) {

		if (res.data.state == 1) {
			clearInterval(intervalID.value)
			store.dispatch("getUserInfo")
			diagReal.value = false;
			QRCodeShow.value = false
			hasReal.value = true;
			if (res.data.rewardAmount && res.data.rewardAmount > 0) {
				Success({ offset: 100, message: t('users.realnameRewardTip') });
			}
		}
		else if (res.data.state == 2) {
			Warn({ offset: 100, message: t('users.realnameFail'), customClass: 'error' })
		}
	}
}

function closeQRcodeDialog() {
	QRCodeShow.value = false
	clearInterval(intervalID.value)
	if (!hasReal.value) diagReal.value = true
}

function changeUserSpreadCode() {
	let params = {
		spreadCode: inputSpreadContent.value,
	}
	changeSpreadCode(params).then(res => {
		if (res.code == 0) {
			store.dispatch("getUserInfo");
			Success({ offset: 100, message: res.message });
		} else {
			inputSpreadContent.value = userInfoExt.value.spreadCode;
		}
	})
}

//修改邀请码
function changeInviteCode() {
	return
	let params = {
		invitationCode: inputInviteContent.value,
	}
	changeInvitationCode(params).then(res => {
		if (res.code == 0) {
			store.dispatch("getUserInfo");
			Success({ offset: 100, message: res.message });
		} else {
			inputInviteContent.value = userInfoExt.value.invitationCode;
		}
	})
}

//修改
function onBindSteam() {
	let params = {}
	params.steamUrl = inputSteamContent.value;
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

function onClickCopyId() {
	copy(userId.value + '')
}

async function copy(value) {
	try {
		await toClipboard(value);
		Success({ offset: 100, message: t('common.copySuccess') });
	} catch (e) {
		Warn({ offset: 100, message: t('common.copyFail'), customClass: 'error' })
	}
}

//路由跳转
function jumpRoute(v) {
	router.push(v)
}

// function onClickRecharge() {
//	 store.commit("setRechargeView", true);
// }

</script>
	
<template>
	<div id="pc-me">
		<div class="top-info">
			<div class="header-info">
				<HeadPortrait :userModel='userInfoBase' :size="'pc-me-header'" @click="onClickEditAvatar()"></HeadPortrait>
				<div class="txt-edit" @click="onClickEditAvatar()">{{ t('users.changeAvater') }}</div>
			</div>
			<div class="top-info-wrap">
				<div class="info-item">
					<div class="item-t">{{ t('users.nickname') }}</div>
					<div class="item-c">{{ userInfoBase.nickName }}</div>
					<div class="item-btn" @click="openEditName">{{ t('users.modifyNickname') }}</div>
				</div>
				<div class="info-item">
					<div class="item-t">ID</div>
					<div class="item-c">{{ store.state.userId }}</div>
					<div class="item-btn" @click="onClickCopyId">{{ t('common.copy') }}ID</div>
				</div>
				<div class="info-item">
					<div class="item-t">{{ t('users.phone') }}</div>
					<div class="item-c">{{ userInfoBase.mobile }}</div>
					<div class="item-btn" @click="opengEditPW">{{ t('users.modifyPassword') }}</div>
				</div>
				<div class="info-item">
					<div class="item-t">{{ t('users.gold') }}</div>
					<div class="item-price"><img class="pc-price-coin" src="@/assets/pcimg/common/coin.svg" alt="" />{{
						userInfoAssets.amount }}</div>
					<div class="item-btn" @click="onClickRecharge">{{ t('recharge.title') }}</div>
				</div>
			</div>
			<div class="top-opt-wrap">
				<!-- <div class="top-opt-item" @click="openEditReal">
					<svg class="icon-switch">
						<use xlink:href="@/assets/icon.svg#pencil" ng-href="@/assets/icon.svg#pencil"></use>
					</svg>
					{{ hasReal ? t( 'users.isRealnamed' ) : t( 'users.realnameTitle' ) }}
				</div> -->
				<div class="top-opt-item" @click="openEditSpread">
					<svg class="icon-switch">
						<use xlink:href="@/assets/icon.svg#pencil" ng-href="@/assets/icon.svg#pencil"></use>
					</svg>
					{{ t('users.myInviteCode') }}
				</div>
				<div class="top-opt-item" @click="openEditInvite">
					<svg class="icon-switch">
						<use xlink:href="@/assets/icon.svg#pencil" ng-href="@/assets/icon.svg#pencil"></use>
					</svg>
					{{ t('users.bindInviteCode') }}
				</div>
				<div class="top-opt-item" @click="openEditSteam">
					<svg class="icon-switch">
						<use xlink:href="@/assets/icon.svg#pencil" ng-href="@/assets/icon.svg#pencil"></use>
					</svg>
					{{ t('users.steamLinkTitle') }}
				</div>
			</div>
		</div>
		<div class="top-tabs">
			<div class="top-tab-item" :class="{ active: route.name == 'p_bag' }" @click="jumpRoute('/p/me/bag')">
				<svg class="icon-tab">
					<use xlink:href="@/assets/icon.svg#user" ng-href="@/assets/icon.svg#user"></use>
				</svg>
				{{ t('users.inStock') }}
			</div>
			<div class="top-tab-item" :class="{ active: route.name == 'p_record' }" @click="jumpRoute('/p/me/record')">
				<img src="@/assets/pcimg/me/union.svg" alt="" />
				{{ t('router.myRecord') }}
			</div>

			<div class="top-tab-item" :class="{ active: route.name == 'p_spreadUser' }"
				@click="jumpRoute('/p/me/spreadUser')">
				<img src="@/assets/pcimg/me/users.svg" alt="" />
				{{ t('router.spread') }}
			</div>
			<div class="top-tab-item" :class="{ active: route.name == 'p_information' }"
				@click="jumpRoute('/p/me/information')">
				<img src="@/assets/pcimg/me/cancel.svg" alt="" />
				{{ t('router.message') }}
			</div>
			<div class="top-tab-item" :class="{ active: route.path.indexOf('/p/me/help') != -1 }"
				@click="jumpRoute('/p/me/help/compliance')">
				<img src="@/assets/pcimg/me/enter.svg" alt="" />
				{{ t('menu.supportCenter') }}
			</div>
			<div class="tab-vip" :class="{ active: route.name == 'p_vip' }" @click="jumpRoute('/p/me/vip')">
				{{ t('users.upgradeVip') }}
				<svg class="icon-tab">
					<use xlink:href="@/assets/icon.svg#premium" ng-href="@/assets/icon.svg#premium"></use>
				</svg>

			</div>
		</div>
		<div class="me-content-wrap">
			<router-view />
		</div>
		<van-overlay :show="editName" style="background-color: rgba(0,0,0,.7);" :z-index="200" :lock-scroll="false">
			<div class="wrapper">
				<div class="dialog-c-wrap">
					<div class="close" @click="editName = false"><img src="@/assets/pcimg/common/close.png" alt="">
					</div>
					<div class="diag-c-title">{{ t('users.modifyNickname') }}</div>
					<div class="input-wrap">
						<input type="text" v-model="userNickName" maxlength="10" :placeholder="t('sign.enterNickname')">
						<div class="btn-sure" @click="onClickEditSure">
							<svg class="icon-check">
								<use xlink:href="@/assets/icon.svg#check"></use>
							</svg>
						</div>
					</div>
				</div>
			</div>
		</van-overlay>
		<van-overlay :show="QRCodeShow" style="background-color: rgba(0,0,0,.7);" :z-index="200" :lock-scroll="false">
			<div class="qrcode-verify-container">
				<div class="header">
					<p>{{ t('users.realnameTitle') }}</p>
					<img @click="closeQRcodeDialog()" src="@/assets/pcimg/recharge/close-tip.png">
				</div>
				<div class="body">
					<div ref="qrCodeDivRef" id="qrCode"></div>
				</div>
				<div class="footer">
					{{ t('users.realnameHelp') }}
				</div>
			</div>
		</van-overlay>

		<van-overlay :show="diagEditPW" style="background-color: rgba(0,0,0,.7);" :z-index="200" :lock-scroll="false">
			<div class="wrapper">
				<div class="dialog-c-wrap">
					<div class="close" @click="diagEditPW = false"><img src="@/assets/pcimg/common/close.png" alt="">
					</div>
					<div class="diag-c-title">{{ t('users.modifyPassword') }}</div>
					<div class="input-wrap">
						<input type="text" v-model="inputPWContent" maxlength="16"
							:placeholder="t('users.enterPasswordTip')">
						<div class="btn-sure" @click="setPassword">
							<svg class="icon-check">
								<use xlink:href="@/assets/icon.svg#check"></use>
							</svg>
						</div>
					</div>
				</div>
			</div>
		</van-overlay>
		<van-overlay :show="diagReal" style="background-color: rgba(0,0,0,.7);" :z-index="200" :lock-scroll="false">
			<div class="wrapper">
				<div class="dialog-c-wrap">
					<div class="close" @click="diagReal = false"><img src="@/assets/pcimg/common/close.png" alt="">
					</div>
					<div class="diag-c-title">{{ t('users.realnameTitle') }}</div>
					<div class="input-wrap">
						<input type="text" v-model="inputRealContent.realName" :placeholder="t('users.enterRealname')"
							:disabled="hasReal">
					</div>
					<div class="input-wrap">
						<input type="text" v-model="inputRealContent.idNumber" :placeholder="t('users.enterIdcard')"
							:disabled="hasReal">
					</div>
					<div class="bottom-btn" @click="confirmRealName" v-if="!hasReal">{{ t('notify.confirm') }}</div>
				</div>
			</div>
		</van-overlay>
		<van-overlay :show="diagEditSpread" style="background-color: rgba(0,0,0,.7);" :z-index="200" :lock-scroll="false">
			<div class="wrapper">
				<div class="dialog-c-wrap">
					<div class="close" @click="diagEditSpread = false"><img src="@/assets/pcimg/common/close.png" alt="">
					</div>
					<div class="diag-c-title">{{ t('users.myInviteCode') }}</div>
					<div class="input-wrap">
						<input type="text" v-model="inputSpreadContent" maxlength="10">
						<div class="btn-sure" @click="changeUserSpreadCode">
							<svg class="icon-check">
								<use xlink:href="@/assets/icon.svg#check"></use>
							</svg>
						</div>
					</div>
					<div class="tip">{{ t('users.spreadCodeTip') }}</div>
				</div>
			</div>
		</van-overlay>

		<van-overlay :show="diagEditInvite" style="background-color: rgba(0,0,0,.7);" :z-index="200" :lock-scroll="false">
			<div class="wrapper">
				<div class="dialog-c-wrap">
					<div class="close" @click="diagEditInvite = false"><img src="@/assets/pcimg/common/close.png" alt="">
					</div>
					<div class="diag-c-title">{{ t('users.bindInviteCode') }}</div>
					<div class="input-wrap">
						<input type="text" v-model="inputInviteContent" maxlength="10" disabled>
						<div class="btn-sure" @click="changeInviteCode">
							<svg class="icon-check">
								<use xlink:href="@/assets/icon.svg#check"></use>
							</svg>
						</div>
					</div>
				</div>
			</div>
		</van-overlay>
		<van-overlay :show="diagEditSteam" style="background-color: rgba(0,0,0,.7);" :z-index="200" :lock-scroll="false">
			<div class="wrapper">
				<div class="dialog-c-wrap">
					<div class="close" @click="diagEditSteam = false"><img src="@/assets/pcimg/common/close.png" alt="">
					</div>
					<div class="diag-c-title">
						{{ t('users.steamLinkTitle') }}
						<div class="title-opt"><a
								href="https://steamcommunity.com/login/home/?goto=%2Fid%2Fme%2Ftradeoffers%2Fprivacy#trade_offer_access_url">{{
									t('users.jumpSteamLink') }}</a>
						</div>
					</div>
					<div class="input-wrap">
						<input type="text" v-model="inputSteamContent">
						<div class="btn-sure" @click="onBindSteam">
							<svg class="icon-check">
								<use xlink:href="@/assets/icon.svg#check"></use>
							</svg>
						</div>
					</div>
					<div class="tip">{{ t('users.steamTip') }}</div>
				</div>
			</div>
		</van-overlay>
		<Avatar :showState="showAvatar" @close="onCloseAvatar" ref="avaterRef"></Avatar>
	</div>
</template>
	
<style lang="scss" scoped>
#pc-me {
	max-width: 1440px;
	width: 100%;
	margin: auto;
	padding: 0 15px;
	box-sizing: border-box;
	min-height: 900px;
	display: flex;
	flex-direction: column;
	position: relative;
	color: #D8D9E5;
	font-size: 16px;
	font-weight: 500;

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
			color: #CCCBDE;
			;
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

				&:hover {
					background: #5A54CE;
					;
				}
			}
		}
	}

	.qrcode-verify-container {
		position: fixed;
		top: 400px;
		left: calc(50% - 560px / 2);
		width: 560px;
		height: 460px;
		background: #191C34;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-bottom: 64px;
		box-sizing: border-box;

		.header {
			padding: 49px 70px;
			color: #FFF;
			font-size: 21px;
			font-style: normal;
			font-weight: 400;
			line-height: 25.2px;
			/* 120% */
			position: relative;

			img {
				position: absolute;
				top: 20px;
				right: 20px;
			}
		}

		.body {
			display: flex;
			justify-content: center;
			align-items: center;

			#qrCode {
				width: 182px;
				height: 182px;
				border: 12px solid #fff;
			}
		}

		.footer {
			color: #FFF;
			text-align: center;
			font-size: 20px;
			font-style: normal;
			font-weight: 400;
			padding-top: 48px;

			span {
				color: #009FE8;
				font-size: 700;
			}
		}
	}

	.top-info {
		width: 100%;
		height: 288px;
		background: #111324;
		margin-top: 25px;
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;

		.header-info {
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			width: 280px;
			height: 100%;

			.txt-edit {
				display: flex;
				justify-content: center;
				align-items: center;
				position: absolute;
				display: inline-flex;
				width: 112px;
				height: 32px;
				border-radius: 18.519px;
				background: #3A34B0;
				bottom: 60px;
				cursor: pointer;
				font-size: 12px;
			}
		}

		.top-info-wrap {
			display: flex;
			flex-direction: column;

			.info-item {
				display: flex;
				align-items: center;
				height: 45px;

				.item-t {
					color: #CBCBCB;
					font-size: 20px;
					font-weight: 700;
					width: 100px;
					margin-right: 20px;
				}

				.item-c {
					color: #CBCBCB;
					font-size: 20px;
					font-weight: 700;

					width: 156px;
					margin-right: 30px;
				}

				.item-price {
					color: #75DC9E;
					font-size: 20px;
					font-weight: bold;

					width: 156px;
					margin-right: 30px;
					display: flex;
					align-items: center;

					img {
						width: 18px;
						height: 18px;
					}
				}

				.item-btn {
					display: flex;
					width: 100px;
					height: 30px;
					justify-content: center;
					align-items: center;
					border-radius: 2px;
					background: #404BB4;
					color: #E0DEF4;
					font-size: 13px;
					cursor: pointer;
				}
			}

		}

		.top-opt-wrap {
			padding-left: 72px;
			border-left: 1px solid #24274E;
			margin-left: 72px;
			display: grid;
			flex-wrap: wrap;
			grid-template-columns: repeat(auto-fill, 220px);
			column-gap: 56px;
			row-gap: 26px;
			height: 151px;
			flex: 1;

			.top-opt-item {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 220px;
				height: 60px;
				cursor: pointer;
				border-radius: 6px;
				background: #181A31;
				position: relative;

				.icon-switch {
					display: inline-block;
					vertical-align: middle;
					fill: currentColor;
					width: 18px;
					height: 18px;
					color: #6e708e;
					margin-right: 30px;
					position: relative;
				}

				&:hover {
					background: #0A0B16;

					.icon-switch {
						color: #5750E6;
					}
				}
			}
		}

		&::before {
			display: block;
			content: '';
			width: 432px;
			height: 372px;
			background: url(@/assets/pcimg/me/top_bg.png) no-repeat center;
			background-size: contain;
			position: absolute;
			left: 0;
			top: -60px;
		}
	}

	.top-tabs {
		width: 100%;
		height: 80px;
		display: flex;
		background: #111324;
		color: #E0DEF4;
		font-size: 16px;
		font-weight: 400;
		margin-top: 24px;

		.top-tab-item {
			display: flex;
			align-items: center;
			justify-content: center;
			white-space: nowrap;
			flex-grow: 1;
			padding-left: 15px;
			padding-right: 15px;
			height: 80px;
			padding-top: 3px;
			font-size: 16px;
			color: #9ca1c7;
			font-weight: 500;
			text-align: left;
			background-color: #111324;
			border-right: 1px solid #15172c;
			border-bottom: 1px solid transparent;
			transition: color .15s, border-color .15s;
			box-sizing: border-box;
			cursor: pointer;

			.icon-tab {
				display: inline-block;
				vertical-align: middle;
				fill: currentColor;
				width: 18px;
				height: 18px;
				color: #373c5b;
				margin-right: 10px;
				position: relative;
				top: 2px;
			}

			img {
				width: 18px;
				height: 18px;
				margin-right: 10px;
			}

			&.active {
				color: #e0def4;
				background-color: #404bb4;
				// border-right: 0;

				.icon-tab {
					color: #9aa0dc;
				}
			}


		}

		.tab-vip {
			display: flex;
			align-items: center;
			color: #fff;
			font-size: 16px;
			line-height: 1;
			padding: 13px 12px 12px 16px;
			background-image: linear-gradient(-111deg, #5c0feb 0, #ce40ed 100%);
			flex-grow: 1;
			font-weight: 700;
			white-space: nowrap;
			border-radius: 0 3px 3px 0;
			justify-content: center;

			.icon-tab {
				display: inline-block;
				vertical-align: middle;
				fill: currentColor;
				width: 16px;
				height: 16px;
				color: #fff;
				margin-left: 10px;
				position: relative;
				top: 2px;
			}
		}
	}

	.wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;

		.dialog-c-wrap {
			width: 560px;
			min-height: 205px;
			background: #191C34;
			position: relative;
			box-sizing: border-box;
			color: #fff;
			padding: 49px 70px 60px 70px;
			display: flex;
			flex-direction: column;

			.close {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 32px;
				height: 32px;
				position: absolute;
				right: 10px;
				top: 10px;
				cursor: pointer;

				img {
					width: 12px;
					height: 12px;
				}
			}

			.diag-c-title {
				color: #FFF;
				font-size: 21px;
				margin-bottom: 25px;
				display: flex;
				align-items: center;

				.title-opt {
					display: flex;
					height: 44px;
					// width: 145px;
					padding: 0 16px;
					align-items: center;
					justify-content: center;
					border-radius: 6px;
					background: rgba(89, 224, 159, 0.03);
					color: #61F4AB;
					font-size: 14px;
					font-weight: 700;
					margin-left: 20px;

					a {
						color: #61F4AB;
					}
				}
			}

			.input-wrap {
				display: flex;
				width: 100%;
				height: 44px;
				border-bottom: 1px solid #3A34B0;
				margin-bottom: 10px;

				input {
					flex: 1;
					border: none;
					background: none;
					box-sizing: border-box;
					font-size: 17px;
				}

				.btn-sure {
					display: flex;
					width: 32px;
					height: 32px;
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

			.tip {
				color: #FFA500;
				font-size: 14px;
				margin-top: 9px;
			}

			.bottom-btn {
				display: flex;
				width: 216px;
				height: 54px;
				justify-content: center;
				align-items: center;
				border-radius: 4px;
				background: #3A34B0;
				cursor: pointer;
				color: #FFF;
				font-size: 17px;
				font-weight: 700;
				margin: 35px auto 0;
			}

		}
	}

	input {
		&::placeholder {
			color: rgba($color: #fff, $alpha: .4);
		}
	}
}
</style>