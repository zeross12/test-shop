<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { readyMessage } from '@/network/api/user';
import { useStore } from 'vuex';
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
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
	router.push('/m/information')
}
</script>
		
<template>
	<TopTitleBack class=""></TopTitleBack>
	<div id="information_details" class="min-wrap-height">
	
	<!-- <div class="head">
		
		<span class="icon iconfont register-header" @click="returnList">&#xe61e;</span>
		
	</div> -->
	
	
	
	<div class="container">
		<!-- <img class="img" src="@/assets/romimg/information/wallet 1.png"/> -->
		<div class="info_title">{{ detailData.title }}</div>
		<div class="time">{{ detailData.createTime }}</div>
	</div>
		<div class="content" v-html="detailData.content"></div>
		
		<!-- <div class="btn_return" @click="returnList">返回</div> -->
	</div>
</template>
		
<style lang="scss">
#information_details {
	padding: 0 50px;
	width: 750px;
	box-sizing: border-box;
	
	.container{
	display: flex;
		// justify-content: space-between;
	}
	
	.img{
	width: 32px;
	height: 32px;
	margin-top: 100px;
	}
	
	.head{
	
		 background-position: -60px center; 
		
	}
	
	.register-header{
	color: #4B4D5F;
	font-size: 27px;
	
	}

	.info_title {
	// display: flex;
		// align-items: center;
		// justify-content: center;
	width: 100%;
		// text-align: center;
		font-size: 24px;
		color: #fff ;
		// font-weight: bold;
		margin-top: 100px;
	// margin-left: 9px;
	}

	.content {
		color: #B4B6C8 !important;
		margin-top: 22px;
	
	
	
	}

	.time {
	margin-top: 100px;
	// display: flex;
		// align-items: center;
		// justify-content: center;
	width: 100%;
		text-align: right;
		color: #fff;
		font-size: 20px;
	color: #B4B6C8;
		// margin: 50px auto;
	}

	.btn_return {
		margin: 80px auto;
		width: 185px;
		height: 43px;
		// border: 3px solid #FBFA02;
		text-align: center;
		line-height: 43px;
		font-size: 22px;
		color: #fff;

		&:active {
		
			color: #B4B6C8;
		}
	}

}
</style>