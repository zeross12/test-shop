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
		if (androidVersion && localAndroidVersion != androidVersion) {
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
	<div id="update-notice">
		<van-overlay :show="showDialog" style="background-color: rgba(0, 0, 0, 0.7)">
			<van-dialog v-model:show="showDialog" :showCancelButton="showCancelBtn" class="update-notice-dialog"
				@confirm="onClickJoinSure" @cancel="onClickJoinCancel">
				<div class="update-notice-wrap">
					<div class="update-content-wrap">{{ t('common.upgrade',{version : version}) }}
						<!-- 检测到新版本
						{{ version }}，是否更新? -->
					</div>
				</div>
			</van-dialog>
		</van-overlay>
	</div>
</template>
<style	lang="scss">
#update-notice {
	.van-overlay {
		z-index: 201 !important;
	}

	.update-notice-dialog {

		.update-notice-wrap {
			display: flex;
			flex-direction: column;
			align-items: center;
			color: #fff;
			font-size: 28px;
			line-height: 1.75em;

			.update-content-wrap {
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
}
</style>