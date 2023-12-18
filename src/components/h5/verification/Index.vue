<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "vue";
import NcVerify from './NcVerify.vue'
// import Vcode from "vue3-puzzle-vcode";
import { getPicVerifyCode } from "@/network/api/login"

const props = defineProps(['vrShow']);
const emit = defineEmits(['verificationSuc', 'verificationClose'])
defineExpose({ openPicCode });

const picCodeInfo = ref({
	id: "",
	pic: "",
	// // 滑动验证
	// appkey: 'FFFF0N0000000000B641',
	// scene: 'nc_register_h5',
	// sessionId: '',
	// sig: '',
	// token: '',
});

const codeInput = ref('');
const showDialog = ref(false);
const btnActive = ref(true);

function onSuccess() {
	window.$dev && console.log('onSuccess');
	showDialog.value = false;
	emit('verificationSuc', { graphicId: picCodeInfo.value.id, graphicCode: codeInput.value })

	// emit('verificationSuc', { graphicId: picCodeInfo.value.id, graphicCode: codeInput.value, ...picCodeInfo.value })
}

function onClose() {
	showDialog.value = false;
	emit('verificationClose')
}

function openPicCode() {
	codeInput.value = '';
	picCodeInfo.value.id = '';
	picCodeInfo.value.pic = '';
	getPicCode();
	showDialog.value = true;
}

async function getPicCode() {
	if (!btnActive.value) return;
	btnActive.value = false;

	const res = await getPicVerifyCode();
	if (res.code === 0) {
		picCodeInfo.value.id = res.data.id;
		picCodeInfo.value.pic = res.data.pic;
	}
	btnActive.value = true;
}

function onNcVerifySuccess(data) {
	window.$dev && console.log(data)
	picCodeInfo.value.sessionId = data.sessionId
	picCodeInfo.value.sig = data.sig
	picCodeInfo.value.token = data.token
	onSuccess()
}

</script>

<template>
	<teleport to="body">
		<div id="verification" v-show="props.vrShow">
			<van-dialog v-model:show="showDialog" :showConfirmButton="true" :show-cancel-button="true" @cancel="onClose"
				@confirm="onSuccess">
				<!-- <div class="title">滑动发送</div> -->
				<div class="code-wrap">
					<div class="code-content">
						<input type="text" v-model="codeInput" 
							:placeholder="t( 'sign.enterVCode' )" 
							@keyup.enter="onSureInput"
						>
						<div class="pic-wrap" @click="getPicCode">
							<img v-if="picCodeInfo.pic" :src="picCodeInfo.pic" alt="" />
						</div>
					</div>
				</div>
				<!-- <NcVerify @onSuccess="onNcVerifySuccess" :picCodeInfo="picCodeInfo" /> -->
			</van-dialog>
		</div>
	</teleport>
</template>
		
<style lang="scss">
#verification {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	z-index: 202;
	position: fixed;
	left: 0;
	top: 0;
	background-color: rgba(0, 0, 0, 0.7);


	.code-wrap {
		display: flex;
		align-items: center;
		justify-content: center;

		.code-content {
			margin-top: 40px;
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;
			border-bottom: 2px solid #fbfa02;
			width: 500px;
			margin-bottom: 15px;
			padding-bottom: 10px;

			input {
				width: 300px;
				height: 60px;
				background: none;
				text-align: left;
				border: none;
				font-size: 26px;
				color: #fff;
			}

			.pic-wrap {
				margin-left: 10px;
				width: 160px;

				img {
					width: 160px;
				}
			}
		}

	}


}
</style>
