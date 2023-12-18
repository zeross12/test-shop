<template>
	<div class="nc-wrap">
		<div :id="ncid"></div>
	</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted } from 'vue'
import { getNcId } from '@/util/ncid'
const emit = defineEmits(['onSuccess'])
const props = defineProps(['picCodeInfo'])

const ncid = ref(`nc${getNcId()}`)

let windowNc

onMounted(() => {
	window.$dev && console.log('onMounted', ncid.value);
	// https://help.aliyun.com/document_detail/121893.html?spm=a2c4g.190301.0.0.13dd2f52dq90aC
	AWSC.use("nc", function (state, module) {
		window.$dev && console.log(state, module);
		windowNc = module.init({
			appkey: props.picCodeInfo.appkey,
			scene: props.picCodeInfo.scene,
			renderTo: ncid.value,
			success: function (data) {
				emit('onSuccess', data)
				windowNc.reset()
			},
		})
	})
})

</script>

<style lang="scss">
.nc-wrap {
	width: 80%;
	position: relative;
	padding-top: 20px;
	padding-bottom: 60px;
	margin: 0 auto;

	.nc_wrapper {
		width: 100% !important;
	}
}
</style>