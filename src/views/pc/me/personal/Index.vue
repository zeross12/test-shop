<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, computed, onMounted } from 'vue';
import { Dialog,	Toast } from 'vant';
import { useStore } from 'vuex';
import { uploadfile, changeInvitationCode, changeSpreadCode, realName, update, changePassword, bindSteam } from '@/network/api/user';
import useClipboard from "vue-clipboard3";
const { toClipboard } = useClipboard();

const store = useStore();

const userInfoBase = computed(() => store.state.userInfoBase);
const userInfoExt = computed(() => store.state.userInfoExt);

const infoShow = ref(false);

const userRealName = ref('');
const password = ref('********');
const idNumber = ref('');
const realActive = ref(false);

const userSpreadCode = ref(userInfoExt.value.spreadCode);
const userInvitationCode = ref('');
const userSteamUrl = ref(userInfoExt.value.steamUrl);

const portraitBoxMesType = ref(false);

const soundChecked = ref(store.state.soundSwitch);
const animationChecked = ref(store.state.animationSwitch);

const formatterInvite = (value) => value.toUpperCase();

onMounted(() => {

})

//头像修改
function uploadHeadFile(file) {
	if (navigator.userAgent.indexOf('UCBrowser') > -1) {
		alert(t( 'menu.browserNotSupport' ))
	} else {
		if (file.file.type == 'image/jpeg' || file.file.type == 'image/png' || file.file.type ==
			'image/gif' || file.file.type ==
			'image/webp') {
			Toast.loading({
				message: t( 'common.loading' ),
				forbidClick: true,
			})
			let formData = new FormData();
			formData.set('upfile', file.file);

			uploadfile(formData, 1).then((res) => {
				if (res.code == 0) {
					update({ avater: res.data.fileUrl }).then(res => {
						Toast.clear();
						if (res.code == 0) {
							store.dispatch("getUserInfo");
						}
						Success( { offset : 100, message : res.message } );
					})
				} else {
					Toast.clear();
				}

			}).catch(err => Toast.clear())
		} else {
			Warn( { offset : 100, message : t( 'sign.formatFail' ), customClass : 'error' } )
		}
	}
}

//修改
function onBindSteam(v, str) {
	Dialog.confirm({
		message: t( 'common.modifyTip', { string : str } )
	}).then(() => {
		let params = {}
		if (v == 'steamUrl') {
			params.steamUrl = userSteamUrl.value;
		}
		if (params[v] == null || params[v].trim() == '') {
			Warn( { offset : 100, message : t( 'common.inputNil' ), customClass : 'error' })
		} else {
			bindSteam(params).then(res => {
				if (res.code == 0) {
					Success( { offset : 100, message : res.message } );
					store.dispatch("getUserInfo");
				} else {
					userSteamUrl.value = userInfoExt.value.steamUrl;
				}

			})
		}
	}
	)
}


function onFocusPW() {
	if (password.value === '********') {
		password.value = '';
	}
}

function setPassword(v, str) {
	Dialog.confirm({
		message: t( 'common.modifyTip', { string : str } )
	}).then(() => {
		if (password.value == null || password.value === '********' || password.value.trim() == '') {
			Warn( { offset : 100, message : t( 'common.inputNil' ), customClass : 'error' })
		} else {
			let params = {}
			params.password = password.value;

			changePassword(params).then(res => {
				if (res.code == 0) {
					Success( { offset : 100, message : res.message } );
					store.commit('logout');
					store.commit('setSignView', true);
				} else {
					password.value = '';
				}

			})
		}
	}
	).catch(() => {

	})
}

//实名认证
function onRealName() {
	if (userRealName.value && idNumber.value) {
		realActive.value = true
	} else {
		Warn( { offset : 100, message : t( 'common.inputNil' ), customClass : 'error' })
	}
}

//实名认证确认保存
function confirmReal() {
	let params = {
		realName: userRealName.value,
		idNumber: idNumber.value
	}
	realName(params).then(res => {
		if (res.code == 0) {
			store.dispatch("getUserInfo");
			realActive.value = false
			Success( { offset : 100, message : t( 'users.realnameRewardTip' ) } );
		} else {
			cancelReal();
		}

	})
}

function reqRealName() {
	let params = {
		realName: userRealName.value,
		idNumber: idNumber.value
	}
	realName(params).then(res => {
		if (res.code == 0) {
			store.dispatch("getUserInfo");
			realActive.value = false
			Success( { offset : 100, message : t( 'users.realnameRewardTip' ) } );
		} else {
			cancelReal();
		}

	})
}

function cancelReal() {
	userRealName.value = ''
	idNumber.value = ''
	realActive.value = false
	portraitBoxMesType.value = false
}

//修改邀请码
function changeInviteCode() {
	let params = {
		invitationCode: userInvitationCode.value,
	}
	changeInvitationCode(params).then(res => {
		if (res.code == 0) {
			store.dispatch("getUserInfo");
			Success( { offset : 100, message : res.message } );
		} else {
			userInvitationCode.value = '';
		}
	})
}

//修改推广码
function changeUserSpreadCode() {
	let params = {
		spreadCode: userSpreadCode.value,
	}
	changeSpreadCode(params).then(res => {
		if (res.code == 0) {
			store.dispatch("getUserInfo");
			Success( { offset : 100, message : res.message } );
		} else {
			userSpreadCode.value = userInfoExt.value.spreadCode;
		}
	})
}

function onSoundSwitchChange() {
	localStorage.setItem("soundSwitch", soundChecked.value);
	store.commit("setSoundSwitch", soundChecked.value);
}

function onAnimSwitchChange() {
	localStorage.setItem("animationSwitch", animationChecked.value);
	store.commit("setAnimationSwitch", animationChecked.value);
}

function nameFilter(str) {
	let name = str.charAt(0) + '*'.repeat(str.length - 1)
	return name
}

function idFilter(str) {
	let id = str.slice(0, 8) + '*'.repeat(10)
	return id
}

async function copy(value) {
	try {
	await toClipboard(value);
	Success( { offset : 100, message : t('common.copySuccess' ) } );
	} catch (e) {
	Warn( { offset : 100, message : t('common.copyFail' ), customClass : 'error' } )
	}
}

</script>
		
<template>
	<div id="pc-personal">
		<div class="account-info-wrap">
			<div class="title personal-title">{{ t( 'users.accountSafe' ) }}</div>
			<van-cell-group v-if="false">
				<van-field :label="t( 'sign.toRegister' )" v-model="userInfoBase.account" readonly />
			</van-cell-group>
			<van-cell-group>
			<van-field :label="`${ t( 'users.title' ) }ID`" v-model="store.state.userId" readonly>
				<template #button>
					<van-button @click="copy(store.state.userId)">{{ t( 'common.copy' ) }}</van-button>
				</template>
			</van-field>
		</van-cell-group>
			<van-cell-group>
				<van-field :label="t( 'sign.bindPhoneTitle' )" v-model="userInfoBase.mobile" readonly />
			</van-cell-group>
			<van-cell-group>
				<van-field :label="t( 'users.password' )" v-model="password" type="password" maxlength="16" v-on:focus="onFocusPW"
					:placeholder="t( 'sign.passwordLimit' )">
					<template #button>
						<van-button @click="setPassword('password', t( 'users.passwordTitle' ))">{{ t( 'users.modifyBtn' ) }}</van-button>
					</template>
				</van-field>
				<div class="tip">*{{ t( 'sign.passwordTooLong' ) }}</div>
			</van-cell-group>

			<van-cell-group :class="[{ 'tiny': !userInfoExt.realName }, { 'active': userInfoExt.realName }]">
				<div v-if="userInfoExt.realName">
					<van-field v-if="!infoShow" :label="t( 'users.realname' )" :model-value="nameFilter(userInfoExt.realName)" readonly>
					</van-field>
					<van-field v-else :label="t( 'users.realname' )" :model-value="userInfoExt.realName" readonly></van-field>
				</div>

				<van-field v-else :label="t( 'users.realname' )" v-model="userRealName" :placeholder="t( 'users.enterRealnameOptional' )"></van-field>
			</van-cell-group>

			<van-cell-group :class="{ 'essence': !userInfoExt.realName }">
				<div v-if="userInfoExt.idNumber">
					<van-field v-if="!infoShow" :label="t( 'users.idcard' )" :model-value="idFilter(userInfoExt.idNumber)" readonly>
						<template #button>
							<van-button @click="infoShow = !infoShow">{{ t( 'common.show' ) }}</van-button>
						</template>
					</van-field>
					<van-field v-else :label="t( 'users.idcard' )" :model-value="userInfoExt.idNumber" readonly>
						<template #button>
							<van-button @click="infoShow = !infoShow">{{ t( 'common.hide' ) }}</van-button>
						</template>
					</van-field>
				</div>
				<van-field v-else :label="t( 'users.idcard' )" v-model="idNumber" :placeholder="t( 'users.enterIdcardOptional' )" maxlength="20">
					<template #button>
						<van-button v-show="!userInfoExt.idNumber" @click="onRealName">{{ t( 'common.save' ) }}</van-button>
					</template>
				</van-field>
				<div class="tip" v-show="!userInfoExt.idNumber">*{{ t( 'users.realnameTip' ) }}</div>
			</van-cell-group>
		</div>
		<div class="invite-wrap">
			<div class="title personal-title">{{ t( 'users.inviteCode' ) }}</div>
			<van-cell-group>
				<van-field :label="t( 'users.myInviteCode' )" v-model="userSpreadCode" :placeholder="t( 'users.enterInviteCodeOptional' )" maxlength="10"
					:formatter="formatterInvite">
					<template #button>
						<van-button @click="changeUserSpreadCode()">{{ t( 'users.modifyBtn' ) }}</van-button>
					</template>
				</van-field>
				<div class="tip">{{ t( 'users.spreadCodeTip' ) }}</div>
			</van-cell-group>
			<van-cell-group v-if="userInfoExt.invitationCode" class="active">
				<van-field :label="t( 'users.bindinviteCode' )" v-model="userInfoExt.invitationCode" :placeholder="t( 'users.enterSpreadCodeOptional' )" maxlength="10"
					readonly>
				</van-field>
			</van-cell-group>
			<van-cell-group v-else class="active">
				<van-field :label="t( 'users.bindinviteCode' )" v-model="userInvitationCode" :placeholder="t( 'users.enterSpreadCodeOptional' )" maxlength="10"
					:formatter="formatterInvite">
					<template #button>
						<van-button @click="changeInviteCode()">{{ t( 'common.save' ) }}</van-button>
					</template>
				</van-field>
			</van-cell-group>
		</div>
		<div class="steam-wrap">
			<div class="title personal-title">{{ t( 'users.steamLinkTitle' ) }}</div>
			<van-cell-group>
				<van-field :label="t( 'users.steamLink' )" v-model="userSteamUrl" :placeholder="t( 'users.enterSteamLink' )">
					<template #button>
						<van-button @click="onBindSteam('steamUrl', t( 'users.steamLink' ))">{{ t( 'common.save' ) }}</van-button>
					</template>
				</van-field>
				<div class="tip">{{ t( 'users.steamTip' ) }}</div>
				<div class="tip tip-two"><a
						href="https://steamcommunity.com/login/home/?goto=%2Fid%2Fme%2Ftradeoffers%2Fprivacy#trade_offer_access_url">{{ t( 'users.jumpSteamLink' ) }}</a>
				</div>
			</van-cell-group>
			<div class="other-cell">
				<div class="switch-wrap">
					<span>{{ t( 'common.sound' ) }}</span>
					<van-switch v-model="soundChecked" @change="onSoundSwitchChange" />
				</div>
				<div class="switch-wrap">
					<span>{{ t( 'common.animation' ) }}</span>
					<van-switch v-model="animationChecked" @change="onAnimSwitchChange" />
				</div>
			</div>
		</div>
		<div class="pc-pop-verify" :class="{ 'active': realActive }">
			<div class="pc-pop-verify-main">
				<div class="pc-pop-verify-tit">
					{{ t( 'users.checkTip' ) }}
				</div>
				<div class="pc-pop-verify-data">
					<p>{{ t( 'users.name' ) }}:<span>{{ userRealName }}</span></p>
					<p>{{ t( 'users.idcard' ) }}:<span>{{ idNumber }}</span></p>
				</div>
				<div class="pc-pop-verify-bts">
					<p @click="cancelReal">{{ t( 'users.cancelModify' ) }}</p>
					<p @click="confirmReal">{{ t( 'users.confirmModify' ) }}</p>
				</div>
			</div>
		</div>
	</div>
</template>
		
<style lang="scss">
#pc-personal {
	width: 100%;

	.title {
		font-size: 32px;
	}

	.account-info-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 1078px;
		height: 502px;
		background: rgba(20, 18, 33, 0.5);
		padding: 0 38px;
	}

	.invite-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 1078px;
		height: 259px;
		background: rgba(20, 18, 33, 0.5);
		padding: 0 38px;
		margin-top: 20px;
	}

	.steam-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 1078px;
		height: 259px;
		background: rgba(20, 18, 33, 0.5);
		padding: 0 38px;
		margin-top: 20px;
	}

	.personal-title {
		margin-top: 21px;
		margin-bottom: 0px;
	}

	.van-cell-group {
		background: none;
		position: relative;
		width: 100%;
		border: none;
		height: 81px;

		.tip {
			color: #FBFA02;
			font-size: 14px;
			position: absolute;
			left: 115px;
			bottom: 2px;

			a {
				color: #FBFA02;
				text-decoration: underline
			}


		}

		.tip-two {
			bottom: -30px;
			right: 0;
			text-align: right;
		}

		.van-cell {
			background: none;
			padding: 0;
			height: 81px;
			border-bottom: #71701B 1px solid;

			.van-field__label {
				width: 102px;
				line-height: 87px;
				color: #fff;
				font-size: 18px;
				text-align: center;
				box-sizing: border-box;
			}

			.van-field__body {
				width: 100%;
				height: 100%;

				input {
					width: 100%;
					height: 100%;
					font-size: 18px;
					color: #fff
				}
			}

			.van-button {
				width: 110px;
				height: 44px;
				border: 2px solid #FBFA02;
				background: none;
				color: #fff;
				font-size: 20px;
				line-height: 44px;
				text-align: center;

				&:active {
					color: #FBFA02
				}
			}

			&::after {
				border: none;
			}
		}

		.tiny {
			width: 6.133333rem;
			margin-top: .533333rem;

			.van-cell {
				height: 1.066667rem;

				.van-field__label {
					line-height: 1.066667rem
				}
			}
		}

		.essence {
			.van-cell {
				height: 1.066667rem;

				.van-field__label {
					line-height: 1.066667rem
				}
			}
		}

		&.active {
			margin-top: .266667rem
		}
	}

	.van-hairline--top-bottom {
		&::after {
			border-width: 0 0;
		}
	}

	&::after {
		border: none;
		border-bottom: 2px solid #FBFA02
	}

	.other-cell {
		display: flex;
		justify-content: space-between;
		margin-top: 30px;
		padding-left: 50px;
		padding-right: 50px;
		margin-bottom: 20px;
		width: 500px;

		.switch-wrap {
			display: flex;
			align-items: center;

			span {
				color: #fff;
				font-size: 20px;
				margin-right: 15px;
			}
		}
	}

	.pc-pop-verify {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, .8);
		display: flex;
		justify-content: center;
		align-items: center;
		padding-bottom: 20px;
		box-sizing: border-box;
		opacity: 0;
		z-index: -1;
		transition: .3s;

		.pc-pop-verify-main {
			width: 702px;
			height: 331px;
			background: url(@/assets/romimg/personal/bg4.png) no-repeat 50%;
			background-size: contain;
			color: #fff;

			.pc-pop-verify-tit {
				font-size: 22px;
				box-sizing: border-box;
				text-align: center;
				margin-top: 40px;
			}

			.pc-pop-verify-data {
				margin-top: 20px;
				padding: 0 80px;
				box-sizing: border-box;

				p {
					margin-bottom: 20px;
					font-size: 20px;
				}
			}

			.pc-pop-verify-bts {
				display: flex;
				justify-content: center;
				margin-top: 20px;

				p {
					width: 168px;
					height: 60px;
					background: url(@/assets/romimg/header/btn_active.png) no-repeat center;
					background-size: 100%;
					text-align: center;
					line-height: 60px;
					color: #20212b;
					font-weight: 700;
					font-size: 20px;
					margin: 0 10px
				}
			}
		}

		&.active {
			opacity: 1;
			z-index: 202
		}
	}

}</style>