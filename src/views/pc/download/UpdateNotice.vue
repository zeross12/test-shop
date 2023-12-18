<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref } from 'vue';
import { useStore } from "vuex";
import { runDeviceType, localAndroidVersion } from '@/config'
import { DeviceType } from '@/util/util'

const store = useStore();
const showDialog = ref(false);
const showCancelBtn = ref(true);
const version = ref('');

onMounted(() => {
	setTimeout(() => {
		checkVersion();
	}, 2000)
	 
})

function onClickJoinCancel() {
	showDialog.value = false;
}

function onClickJoinSure() {
	if (runDeviceType == DeviceType.android) {
		let androidUrl = store.getters.getConfigItem("ApkDownloadUrl");
		window.open(androidUrl, '_self');
	}
	showDialog.value = !showCancelBtn.value;
}

function checkVersion() {
	if (runDeviceType == DeviceType.android) {
		let androidVersion = store.getters.getConfigItem("AndroidVersion");
		if (androidVersion&&localAndroidVersion != androidVersion) {
			version.value = androidVersion;
			showDialog.value = true;

			let apkvs = androidVersion.split('.');
			let androidvs = localAndroidVersion.split('.');
			showCancelBtn.value = (apkvs[0] == androidvs[0] && apkvs[1] == androidvs[1])
		}
	}
}
</script>

<template>
	<van-dialog v-model:show="showDialog" :showCancelButton="showCancelBtn" class="pc-join-dialog" @confirm="onClickJoinSure"
		@cancel="onClickJoinCancel">
		<div class="join-dialog-wrap">
			<div class="join-content-wrap">
				{{ t( 'common.upgrade', { version : version } ) }}
			</div>
		</div>
	</van-dialog>
</template>
<style	lang="scss" scoped>
.pc-join-dialog {

	.join-dialog-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #fff;
		font-size: 28px;
		line-height: 1.75em;

		.join-content-wrap {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 40px;

			img {
				width: 34px;
			}

			p {
				color: #FFC400;
				font-weight: bold;
			}
		}


	}

}
</style>