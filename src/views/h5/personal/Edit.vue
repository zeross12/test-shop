<script setup>

import QRCode from "qrcodejs2-fix";
import html2Canvas from "html2canvas";
import { ref, computed, onMounted, nextTick } from "vue";
import { Dialog, Toast } from "vant";
import { useStore } from "vuex";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import {
	uploadfile,
	update,
	realName,
	queryRealName,
	changePassword,
	changeInvitationCode,
	changeSpreadCode,
	bindSteam,
	getAvaterFrameList,
	getAvaterList,
} from "@/network/api/user";

import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import { count } from "mathjs";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const store = useStore();
const route = useRoute();
const router = useRouter();
const userInfoBase = computed(() => store.state.userInfoBase);
const userInfoExt = computed(() => store.state.userInfoExt);
const soundChecked = ref(store.state.soundSwitch);
const animationChecked = ref(store.state.animationSwitch);

const qrCodeShow = ref(false);
const qrCodeDivRef = ref(null);
let intervalId = null;

let editObj = ref({ val: "", key: "" });
let editCardID = ref("");

onBeforeRouteLeave(() => {
	if (intervalId != null) {
		clearInterval(intervalId);
		store.dispatch("getUserInfo");
	}
});

onMounted(() => {
	if (route.query.type == "nickName") {
		editObj.value = {
			title: t('users.modifyNickname'),
			val: userInfoBase.value.nickName,
			key: route.query.type,
			placeholder: t('users.enterNickname'),
			maxLength: 10,
			minLength: 3,
			handler: onClickEditSure,
			desc: t('users.nicknameLimit'),
		};
	} else if (route.query.type == "mobile") {
		editObj.value = {
			title: t('users.chagenPhone'),
			val: userInfoBase.value.mobile,
			key: route.query.type,
			handler: onClickEditSure,
		};
	} else if (route.query.type == "password") {
		editObj.value = {
			title: t('users.modifyPassword'),
			val: userInfoBase.value.password,
			key: route.query.type,
			placeholder: t('sign.enterPasswordAgain'),
			handler: onClickEditPassword,
			desc: t('users.passwordToLong'),
			maxLength: 16,
			minLength: 6,
		};
	} else if (route.query.type == "realName") {
		editObj.value = {
			title: t('users.realnameTitle') ,
			val: userInfoExt.value.realName,
			key: route.query.type,
			placeholder: t('users.enterRealname') ,
			handler: confirmReal,
		};
	} else if (route.query.type == "spreadCode") {
		editObj.value = {
			title: t('users.myInviteCode') ,
			val: userInfoExt.value.spreadCode,
			key: route.query.type,
			placeholder: t('users.enterSpreadCode') ,
			handler: changeUserSpreadCode,
		};
	} else if (route.query.type == "steamUrl") {
		editObj.value = {
			title: t('users.steamLink') ,
			val: userInfoExt.value.steamUrl,
			key: route.query.type,
			placeholder: t('users.enterSteamLink') ,
			handler: onBindSteam,
		};
	} else if (route.query.type == "invitationCode") {
		editObj.value = {
			title: t('users.bindInviteCode'),
			val: userInfoExt.value.invitationCode,
			key: route.query.type,
			placeholder: t('users.enterInviteCodeOptional'),
			handler: changeInviteCode,
			desc: t('users.spreadCodeTip'),
		};
	}
});

function closeQRCodeSure() {
	qrCodeShow.value = false;
}

function saveQRCode() {
	html2Canvas(qrCodeDivRef.value).then((canvas) => {
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
function downImg(url) {
	// 创建a标签 并设置其相关属性，最后触发其点击事件

	let a = document.createElement("a");
	let clickEvent = document.createEvent("MouseEvents");
	a.setAttribute("href", url);
	a.setAttribute("download", "199skins_auth");
	a.setAttribute("target", "_blank");
	clickEvent.initEvent("click", true, true);
	a.dispatchEvent(clickEvent);
}

async function bindQRCode(v) {
	qrCodeShow.value = true;
	await nextTick();
	qrCodeDivRef.value.innerHTML = "";
	new QRCode(qrCodeDivRef.value, {
		text: v,
		width: 165,
		height: 165,
		correctLevel: QRCode.CorrectLevel.L, //容错率，L/M/H
	});
}

//修改邀请码
function changeInviteCode() {
	let params = {
		invitationCode: editObj.value.val,
	};
	changeInvitationCode(params).then((res) => {
		if (res.code == 0) {
			store.dispatch("getUserInfo");
			Notify(res.message);
			router.go(-1);
		}
	});
}

function changeUserSpreadCode() {
	let params = {
		spreadCode: editObj.value.val,
	};
	changeSpreadCode(params).then((res) => {
		if (res.code == 0) {
			store.dispatch("getUserInfo");
			Notify(res.message);
			nextTick(() => {
				router.go(-1);
			});
		}
	});
}

function onBindSteam() {
	let params = {};
	params.steamUrl = editObj.value.val;
	if (params.steamUrl == null || params.steamUrl.trim() == "") {
		NotifyF(t('common.inputNil'));
	} else {
		bindSteam(params).then((res) => {
			if (res.code == 0) {
				Notify(res.message);
				store.dispatch("getUserInfo");
				router.go(-1);
			}
		});
	}
}

function nameFilter(str) {
	if (str.length == 0) {
		return "";
	}
	let name = str.charAt(0) + "*".repeat(str.length - 1);
	return name;
}

//实名认证
function onRealName() {
	if (!editObj.value.val) {
		NotifyF(t('users.enterRealname') );
		return;
	}
	if (!editCardID.value) {
		NotifyF(t('users.enterIdcard') );
		return;
	}
	if (userRealName.value && idNumber.value) {
		realActive.value = true;
	} else {
		NotifyF(t('common.inputNil') );
	}
}

function repeatFunction() {}

let authUrl = "";

function toAlipay() {
	const urll = encodeURIComponent(authUrl);
	window.open(
		`alipays://platformapi/startapp?appId=20000067&url=${urll}`,
		"_self"
	);
}

//实名认证确认保存
function confirmReal() {
	if (!editObj.value.val) {
		NotifyF(t('users.enterRealname') );
		return;
	}
	if (!editCardID.value) {
		NotifyF(t('users.enterIdcard') );
		return;
	}

	let params = {
		realName: editObj.value.val,
		idNumber: editCardID.value,
	};
	realName(params).then((res) => {
		if (res.code == 0) {
			Notify( t('users.realnameRewardTip', { num : res.data.rewardAmount } ) );
			store.dispatch("getUserInfo");
			router.go(-1);
		}

		// store.dispatch("getUserInfo");
		// realActive.value = false;
		// Notify("实名认证成功 获得" + res.data.rewardAmount + "个金币！");

		// if (res.code == 0) {
		//	 authUrl = res.data["verifyUrl"];
		//	 bindQRCode(res.data["verifyUrl"]);
		//	 if (intervalId != null) {
		//		 clearInterval(intervalId);
		//		 intervalId = null;
		//	 }
		//	 intervalId = setInterval(() => {
		//		 queryRealName().then((res) => {
		//			 if (res.code == 0) {
		//				 if (res.data.state == 1) {
		//					 clearInterval(intervalId);
		//					 qrCodeShow.value = false;
		//					 Notify("实名认证成功 获得" + res.data.rewardAmount + "个金币！");
		//					 router.go(-1);
		//				 } else if (res.data.state == 2) {
		//					 clearInterval(intervalId);
		//					 qrCodeShow.value = false;
		//					 Notify("实名认证失败");
		//				 }
		//			 }
		//		 });
		//	 }, 2000);
		// }
	});
	// thirdCheckIDCard();
}

function onClickEditSure() {
	if (editObj.value.val) {
		editObj.value.val = editObj.value.val.replace(/\s+/g, "");
		if (editObj.value.val.length > 10 || editObj.value.val.length == 0) {
			NotifyF(t('users.nicknameLimit') );
			return;
		}
		let params = { nickName: editObj.value.val };
		update(params).then((res) => {
			if (res.code == 0) {
				Notify(res.message);
				store.dispatch("getUserInfo");
				router.go(-1);
			}
		});
	} else {
		NotifyF(t('common.inputNil') );
	}
}

function onClickEditPassword() {
	window.$dev && console.log(" editObj.value", editObj.value);
	let params = {};
	params.password = editObj.value.val;
	if (
		editObj.value.val == undefined ||
		params.password.length < editObj.value.minLength ||
		params.password.length > editObj.value.maxLength
	) {
		NotifyF(t('sign.passwordToLong') );
		return;
	}
	changePassword(params).then((res) => {
		if (res.code == 0) {
			Notify(res.message);
			store.commit("logout");
			router.push("/m/sign");
		}
	});
}
</script>

<template>
	<div id="personal-edit">
		<TopTitleBack :title="editObj.title"></TopTitleBack>
		<div class="row-wrap">
			<input
				v-model="editObj.val"
				:type="editObj.key == 'password' ? 'password' : 'text'"
				class="input"
				:maxlength="editObj.maxLength"
				:minlength="editObj.minLength"
				:placeholder="editObj.placeholder"
			/>
			<img
				class="clear"
				src="@/assets/romimg/personal/clear-line.png"
				alt=""
				srcset=""
				@click="editObj.val = ''"
			/>
		</div>
		<div class="desc-wrap" v-if="editObj.desc">{{ editObj.desc }}</div>

		<div class="row-wrap" v-if="editObj.key == 'realName'">
			<input v-model="editCardID" class="input" :placeholder="t('users.enterIdcard')" />
			<img
				class="clear"
				@click="editCardID = ''"
				src="@/assets/romimg/personal/clear-line.png"
			/>
		</div>
		<div class="desc-wrap" v-if="editObj.key == 'realName'">
			{{ t('users.realnameTip') }}
		</div>
		<div class="exit-warp" @click="editObj.handler">{{ t('common.save') }}</div>

		<van-overlay :show="qrCodeShow">
			<div class="pop-code">
				<div class="pop-code-bg">
					<div class="pop-code-title">
						{{ t('users.realnameTitle') }}
						<span class="icon iconfont close" @click="closeQRCodeSure"
							>&#xe637;</span
						>
					</div>
					<div class="qrCode_box">
						<div class="qrCode_box_bg">
							<div ref="qrCodeDivRef" id="qrCode" class="qrCode"></div>
						</div>
						<!-- <p class="qrcde_tip1">请使用<span>支付宝扫一扫</span></p> -->
						<p class="qrcde_tip2">{{ t( 'users.realnameHelp' ) }}</p>
					</div>
					<div class="qrcode_btn_c">
						<!-- <div class="qrcode_btn" @click="toAlipay">跳转支付宝认证</div> -->
						<span @click="closeQRCodeSure">{{ t('users.changeInformation') }}</span>
					</div>
				</div>
			</div>
		</van-overlay>
	</div>
</template>

<style lang="scss">
#personal-edit {
	box-sizing: border-box;
	width: 750px;

	min-height: calc(100vh - 80px); /* 减去页脚高度 */
	background: #15172c;
	.row-wrap {
		width: 690px;
		height: 120px;
		margin: auto;
		margin-top: 10px;
		border-bottom: 1px solid #2d2d67;
		justify-content: space-between;
		display: flex;
		align-items: center;
		position: relative;

		.input {
			width: 690px;
			height: 120px;
			border-radius: 8px;
			border: 1px solid #2d2d67;
			box-sizing: border-box;
			padding: 20px;
			font-size: 24px;
			font-weight: 400;
			background-color: transparent;
			color: #cfd0d3;
		}
		.clear {
			position: absolute;
			right: 20px;
			top: 45px;
			width: 32px;
			height: 32px;
		}
	}
	.exit-warp {
		margin: auto;
		margin-top: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 690px;
		height: 108px;

		color: #cfcee8;

		font-size: 26px;
		font-style: normal;
		font-weight: 700;

		border-radius: 8px;
		background: #3a34b0;
	}
	.desc-wrap {
		width: 690px;
		height: 60px;
		margin: auto;
		margin-top: 20px;
		color: #cfd0d3;
		font-size: 24px;
		font-style: normal;
		font-weight: 400;
		text-transform: uppercase;
	}

	.pop-code {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;

		.pop-code-bg {
			width: 655px;
			height: 860px;
			background-color: #15172c;
			text-align: center;
			box-sizing: border-box;
			.pop-code-title {
				width: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 32px;
				color: #fdfeff;
				height: 82px;
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
				padding-top: 60px;
				height: 598px;
				display: flex;
				flex-direction: column;
				justify-content: start;
				align-items: center;
				background-color: rgb(21, 23, 44);
				box-sizing: border-box;
				.qrCode_box_bg {
					background-color: #fff;
					width: 360px;
					height: 360px;
					display: flex;
					justify-content: center;
					align-items: center;
					box-sizing: border-box;

					.qrCode {
						display: flex;
						justify-content: center;
						align-items: center;
					}
				}
				.qrcde_tip1 {
					margin-top: 30px;
					color: #fff;
					font-size: 36px;
					font-style: normal;
					font-weight: 400;

					span {
						color: #e8b011;
					}
				}
				.qrcde_tip2 {
					margin-top: 10px;
					color: #fff;
					font-size: 28px;
					font-style: normal;
					font-weight: 400;
				}
			}

			.qrcode_btn_c {
				height: 186px;
				width: 100%;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				background-color: #191c34;

				.qrcode_btn {
					color: #fff;
					width: 360px;
					height: 88px;
					color: #fff;
					text-align: center;
					font-size: 30px;
					font-style: normal;
					font-weight: 700;
					border-radius: 10px;
					background: #554bf7;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				span {
					margin-top: 20px;
					color: #fff;
					text-align: center;
					font-size: 28px;
					font-style: normal;
					font-weight: 500;
					text-decoration-line: underline;
					text-transform: uppercase;
				}
			}
		}
	}
}
</style>
