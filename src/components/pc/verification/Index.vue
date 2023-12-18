<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "vue";
import Vcode from "vue3-puzzle-vcode";
import { getPicVerifyCode } from "@/network/api/login";
const props = defineProps(['vrShow']);
const emit = defineEmits(['verificationSuc', 'verificationClose'])
defineExpose({ openPicCode });

const picCodeInfo = ref({
	id: "",
	pic: "",
});

const codeInput = ref('');
const showDialog = ref(false);
const btnActive = ref(true);

function onSuccess() {
	showDialog.value = false;
	emit('verificationSuc',{graphicId:picCodeInfo.value.id,graphicCode:codeInput.value})
}

function onClose() {
	showDialog.value = false;
	emit('verificationClose')
}

function openPicCode() {
	codeInput.value='';
	picCodeInfo.value.id='';
	picCodeInfo.value.pic='';
	getPicCode();
	showDialog.value = true;
}

async function getPicCode() {
	if(!btnActive.value)return;
	btnActive.value=false;

	const res = await getPicVerifyCode();
	if (res.code === 0) {
		picCodeInfo.value.id = res.data.id;
		picCodeInfo.value.pic = res.data.pic;
	}
	btnActive.value=true;
}


</script>

<template>
	<div id="pc-verification" v-show="props.vrShow">
		<!-- <van-dialog v-model:show="showDialog" :showConfirmButton="true" :show-cancel-button="true" @cancel="onClose" @confirm="onSuccess">
			<div class="code-wrap">
				<div class="code-content">
					<input type="text" v-model="codeInput" placeholder="请输入验证码" @keyup.enter="onSureInput">
					<div class="pic-wrap" @click="getPicCode">
						<img v-if="picCodeInfo.pic" :src="picCodeInfo.pic" alt="" />
					</div>
				</div>
			</div>
		</van-dialog> -->
		<Vcode :show="showDialog" @success="onSuccess" @close="onClose"></Vcode>

	</div>
</template>
		
<style lang="scss">
#pc-verification {
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
			padding-bottom:10px;

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
				cursor: pointer;
				img {
					width: 160px;
				}
			}
		}

	}


}

</style>