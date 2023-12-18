<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { readyMessage } from '@/network/api/user';
import { useStore } from 'vuex';
const router = useRouter();
const route = useRoute();
const store = useStore();
const msgId = Number(route.query.msgId);

const detailData = ref({});
onMounted(() => {
	// detailData.value = JSON.parse(route.query.item)
	getInfo();
})

async function getInfo() {
	let res = await readyMessage({ msgId: msgId });
	if (res.code == 0) {
		detailData.value = res.data || {};
		store.dispatch("getUserInfo");
	}
}
//返回
function returnList() {
	router.push('/p/me/information')
}
</script>
		
<template>
	<div id="pc-information-details">
		<div class="p-com-header">
			<div class="p-com-header-l">
				<div class="btn-wrap" @click="returnList">
					{{ t( 'common.back' ) }}
					<img src="@/assets/pcimg/me/back.png" alt="" />
				</div>
			</div>
			<div class="p-com-header-c">{{ t( 'common.systemInfo' ) }}</div>
			<div class="p-com-header-r">

			</div>
		</div>
		<div class="info-content">
			<div class="info-title">{{ detailData.title }}</div>
			<div class="content" v-html="detailData.content"></div>
			<div class="time">{{ detailData.createTime }}</div>
		</div>

	</div>
</template>
		
<style lang="scss">
#pc-information-details {
	box-sizing: border-box;
	padding-top: 3px;
	width: 100%;
	min-height: 500px;
	padding-bottom: 50px;

	.p-com-header {
		width: 100%;
		display: flex;
		align-items: center;
		margin-bottom: 5px;
		color: #8488A6;
		font-size: 16px;
		margin-top: 5px;

		.p-com-header-l {
			flex: 1;
		}

		.p-com-header-c {
			display: flex;
			justify-content: center;
			align-items: center;
			// width: 197px;
			height: 105px;
			background: url(@/assets/pcimg/me/header_bg.png) center no-repeat;
			background-size: 100% 100%;
			color: #FFF;
			font-size: 24px;
		}


		.p-com-header-r {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			flex: 1;
		}


		.btn-wrap {
			display: inline-flex;
			width: 146px;
			height: 48px;
			justify-content: center;
			align-items: center;
			color: #8488A6;
			font-size: 16px;
			background: #181A31;
			cursor: pointer;

			img {
				width: 18px;
				height: auto;
				margin-left: 6px;
			}
		}
	}

	.info-content {
		width: 1410px;
		height: 528px;
		background: #181A31;
		position: relative;
		color: #EFEFF0;
		font-size: 14px;
		padding:15px 58px;
		box-sizing: border-box;

		.info-title {
			width: 100%;
			text-align: center;
		}

		.content {
			margin-top: 30px;
		}

		.time {
			position: absolute;
			right: 16px;
			top: 16px;
		}
	}

}
</style>