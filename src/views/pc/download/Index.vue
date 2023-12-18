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
const showQRCode=ref(getDeviceType() == DeviceType.pc);

onMounted(() => {
	setTimeout(() => {
			let androidUrl = store.getters.getConfigItem("ApkDownloadUrl");
			let iosUrl=store.state.otherConfig.iosUrl;
			if(isIos()&&iosUrl){
				bindQRCode(iosUrl);
			}else{
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
			message: t( 'comeSoonIOS' ),
			showCancelButton: false,
		})
			.then(() => {})
			.catch(() => {
			});
	} else {
		// location.replace(url.value);
		let androidUrl = store.getters.getConfigItem("ApkDownloadUrl");
		window.open(androidUrl);
	}
}

function onClickIos() {
	let iosUrl=store.state.otherConfig.iosUrl;
		if(iosUrl){
			window.open(iosUrl);
		}else{
		Dialog.confirm({
			message: `ios敬请期待`,
			showCancelButton: false,
		})
			.then(() => {})
			.catch(() => {
			});
		}
}

function onClickAndroid() {
	let androidUrl = store.getters.getConfigItem("ApkDownloadUrl");
		window.open(androidUrl);
		if(androidUrl){
			window.open(androidUrl);
		}else{
		Dialog.confirm({
			message: t( 'common.comeSoon' ),
			showCancelButton: false,
		})
			.then(() => {})
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
	<div class="pc-dwonload">
		<div class="code-wrap" v-if="showQRCode">
			<div class="code-content-wrap">
				<div class="qrCode_box">
					<div class="qrCode_box_ref" ref="qrCodeDivRef" id="qrCode"></div>
				</div>
			</div>
		</div>
		<div class="btn-wrap">
			<div class="download" @click="onClickAndroid">
				<span class="btn-text"> {{ t( 'common.androidDownload' ) }} </span>
			</div>
			<div class="download" @click="onClickIos">
				<span class="btn-text"> {{ t( 'common.iOSDownload' ) }} </span>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
.pc-dwonload {
	box-sizing: border-box;
	position: relative;
	width: 100%;
	height: 1034px;
	background: url(@/assets/pcimg/download/download_bg.jpg) no-repeat center #0F131C;
	background-size: 1919px 955px;

	.code-wrap {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		bottom:202px;

		.code-content-wrap {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 200px;
			height: 200px;

			.qrCode_box {
				width: 200px;
				height: 200px;

				.qrCode_box_ref {
					width: 200px;
					height: 200px;

					canvas{
						width: 200px !important;
						height: 200px !important;
					}

					img {
						width: 200px;
						height: 200px;
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
		bottom: 50px;
		width: 100%;

		.download {
			width: 301px;
			height: 85px;
			// background: url(@/assets/romimg/download/btn.png) no-repeat;
			// background-size: 100%;
			border: 2px solid #FBFA02;
			border-radius: 10px;
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
			margin: 0 20px;
		}

		.btn-text {
			font-size: 36px;
			font-weight: bold;
			// color: #0D0C12;
			color: #fff;
		}
	}
}
</style>
