<script setup>
import { ref, onMounted} from "vue";
import { getStatsList } from "@/network/api/recharge";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const statsList = ref([]);
const pageIndex = ref(1);
const loading = ref(false);
const finished = ref(false);

onMounted(()=>{
	pageIndex.value=1;
	getSpreadList();
})

async function getSpreadList() {
	let params = {};
	params.page = pageIndex.value;
	params.limit = 10;
	const res = await getStatsList(params);
 if (res.code == 0) {
	let items = res.data.items || [];
	statsList.value;
	let preList = statsList.value;
	if (res.data.page == 1) {
		preList = [];
	}
	statsList.value = [...preList, ...items];
	loading.value = false;
	if (items.length < res.data.limit) {
		finished.value = true;
	}
	} else {
	loading.value = false;
	finished.value = true;
	}
}


// 个人中心
function onClickPersonal() {
	router.push({
	path: "/m/personal",
	});
}

// 每日奖励
function onClickDayAward() {
	router.push({
	path: "/m/spreadUserDetail",
	});
}


//触底刷新
function onLoad() {
	pageIndex.value += 1;
	getSpreadList();
}
</script>

<template>
	<TopTitleBack></TopTitleBack>
	<div id="spread-detail" class="min-wrap-height">
	<div class="body">
	<div class="list">
		<img src="../../../assets/romimg/spread/Group_1.png"/>
		<div class="balance">
		<p class="p-1">{{ t('users.shareTitle1' ) }}</p>
		<p class="p-2">{{ t('users.shareRule1' ) }}</p>
		</div>
	</div>
	<div class="list">
		<img src="../../../assets/romimg/spread/Group_2.png"/>
		<div class="balance">
		<p class="p-1">{{ t('users.shareTitle2' ) }}</p>
		<p class="p-2">{{ t('users.shareRule2' ) }}</p>
		</div>
	</div>
	<div class="list">
		<img src="../../../assets/romimg/spread/Group_3.png"/>
		<div class="balance">
		<p class="p-1">{{ t('users.shareTitle3' ) }}</p>
		<p class="p-2">{{ t('users.shareRule3' ) }}</p>
		</div>
	</div>
	</div>
	
	<!-- <div class="spread-list">
		<div class="spread-list-title">
		<p>日期</p>
		<p>充值人数</p>
		<p>充值总额</p>
		<p>收益</p>
		</div>
		<div class="spread-list-tip" v-if="statsList.length == 0">
		········ 暂无数据 ········
		</div>
		<van-list
		v-else
		v-model="loading"
		:finished="finished"
		:finished-text="t( 'common.noMore' )"
		@load="onLoad"
		:immediate-check="false"
		>
		<div class="spread-list-wrap">
			<div
			class="spread-item"
			v-for="(item, index) in statsList"
			:key="index"
			>
			<p class="hide">{{ item.dataDay }}</p>
			<p>{{ item.chargeNum }}</p>
			<p>{{ item.chargeAmount }}</p>
			<p>{{ item.incomeAmount}}</p>
			</div>
		</div>
		</van-list>
	</div> -->
	</div>
</template>

<style lang="scss">
#spread-detail {
	width: 750px;
	box-sizing: border-box;
	padding: 0 33px;
	
 .register-header{
 	color: #4B4D5F;
 	font-size: 27px;
 	display: flex;
	margin:0px 0px;
	padding-top:73px;
 	// justify-content: center; /* 水平居中 */
 	// align-items: center; /* 垂直居中 */
 }
	
	.list{
	width: auto;
	height: auto;
	margin-bottom: 50px;
	display: flex;
	// justify-content: center; /* 水平居中 */
	align-items: center; /* 垂直居中 */
	
	img{
		width: 32px;
		height: 32px;
	}
	
	.balance{
		margin-left: 40px;
		
		.p-1{
		font-size: 24px;
		color: #ffffff;	
		font-weight: bold; /* 加粗字体 */
		}
		
		.p-2{
		font-size: 20px;	
		color: #B4B6C8;	
		}
		
	}
	
	// p{
	 //	font-weight: bold; /* 加粗字体 */
	 //	color: #ffffff;
	// }
	
	}
	
	.body{
	width: 710px;
	height: 400px;
	background-image: url("@/assets/romimg/spread/Rectangle_52.png"); /* 替换为你的图片 URL no-repeat*/
	background-repeat: no-repeat;
	background-size: cover; /* 调整背景图片的显示方式，保持图片比例并填充容器 */
	padding-top: 60px;
	}
	
	.title {
	// margin-top: 30px;
	// margin-bottom: 30px;
	width: 750px;
	height: 180px;
	background-image: url("@/assets/romimg/spread/Group 1209.png"); /* 替换为你的图片 URL no-repeat*/
	background-repeat: no-repeat;
	background-size: cover; /* 调整背景图片的显示方式，保持图片比例并填充容器 */
	background-position: -30px center; 
	
	}

	.spread-list {

	.spread-list-title {
		display: flex;
		height: 52px;
		border-bottom: 1px solid #EEE131;

		p {
		flex: 1;
		line-height: 52px;
		font-size: 24px;
		font-weight: bold;
		color: #EEE131;
		text-align: center;
		}

	}

	.spread-list-tip {
		text-align: center;
		line-height: 150px;
		font-size: 24px;
		color: #fff;
	}

	.spread-list-wrap {
		margin-bottom: 40px;

		.spread-item {
		height: 100px;
		display: flex;
		align-items: center;
		position: relative;
		border-bottom: 1px solid #fff;
		p {
			flex: 1;
			text-align: center;
			color: #ffffff;
			font-size: 24px;
		}

		}

	}
	}
}
</style>
