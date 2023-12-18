<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { Dialog } from "vant";
import { ref, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import QRCode from "qrcodejs2-fix";
import { getDeviceType } from "@/util/common";
import { DeviceType } from "@/util/util";

const store = useStore();
const qrCodeDivRef = ref(null);
const showQRCode = ref(getDeviceType() == DeviceType.pc);

onMounted(() => {
	setTimeout(() => {
		let androidUrl = store.getters.getConfigItem("ApkDownloadUrl");
		let iosUrl = store.state.otherConfig.iosUrl;
		if (isIos() && iosUrl) {
			bindQRCode(iosUrl);
		} else {
			bindQRCode(androidUrl);
		}
	}, 200);
});

function isIos() {
	var u = navigator.userAgent;
	var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
	return isiOS;
}

function onClickDownload() {
	var u = navigator.userAgent;
	var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
	var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1; //android终端
	if (isiOS) {
		Dialog.confirm({
			message: `ios敬请期待`,
			showCancelButton: false,
		})
			.then(() => { })
			.catch(() => {
				// on cancel
			});
	} else {
		// location.replace(url.value);
		let androidUrl = store.getters.getConfigItem("ApkDownloadUrl");
		window.open(androidUrl);
	}
}

function onClickIos() {
	let iosUrl = store.state.otherConfig.iosUrl;
	if (iosUrl) {
		window.open(iosUrl);
	} else {
		Dialog.confirm({
			message: `ios敬请期待`,
			showCancelButton: false,
		})
			.then(() => { })
			.catch(() => {
			});
	}
}

function onClickAndroid() {
	let androidUrl = store.getters.getConfigItem("ApkDownloadUrl");
	if (androidUrl) {
		window.open(androidUrl);
	} else {
		Dialog.confirm({
			message: `敬请期待`,
			showCancelButton: false,
		})
			.then(() => { })
			.catch(() => {
			});
	}
}


async function bindQRCode(v) {
	await nextTick();
	qrCodeDivRef.value.innerHTML = "";
	new QRCode(qrCodeDivRef.value, {
		text: v,
		colorDark: "#000", //二维码颜色
		colorLight: "#fff", //二维码背景色
		correctLevel: QRCode.CorrectLevel.L, //容错率，L/M/H
	});
}
</script>

<template>
	<div class="dwonload min-wrap-height">
		<div class="code-wrap" v-if="showQRCode">
			<div class="code-content-wrap">
				<div class="qrCode_box">
					<div class="qrCode_box_ref" ref="qrCodeDivRef" id="qrCode"></div>
				</div>
			</div>
		</div>
		<div class="btn-wrap">
			<div v-if="isIos()" class="download" @click="onClickIos">
				<span class="btn-text"> {{t('common.iOSDownload')}} </span>
			</div>
			<div v-else class="download" @click="onClickAndroid">
				<span class="btn-text"> {{t('common.androidDownload')}} </span>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
.dwonload {
	box-sizing: border-box;
	position: relative;
	width: 750px;
	height: 1600px;
	background: url(@/assets/romimg/download/bg.jpg) no-repeat center;
	background-size: contain;

	.code-wrap {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		top: 80px;

		.code-content-wrap {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 323px;
			height: 323px;
			background: url(@/assets/romimg/download/code_bg.png) no-repeat center;
			background-size: contain;

			.qrCode_box {
				width: 260px;
				height: 260px;
				margin-bottom: 6px;

				.qrCode_box_ref {
					width: 260px;
					height: 260px;

					img {
						width: 260px;
						height: 260px;
					}
				}
			}
		}
	}

	.btn-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		bottom: 400px;
		width: 100%;

		.download {
			width: 391px;
			height: 85px;
			background: url(@/assets/romimg/download/btn.png) no-repeat;
			background-size: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.btn-text {
			font-size: 36px;
			font-weight: bold;
			color: #0D0C12;
		}
	}
}
</style>
