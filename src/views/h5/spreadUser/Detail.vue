<script setup>
import { ref, onMounted} from "vue";
import { getStatsList } from "@/network/api/recharge";
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

//触底刷新
function onLoad() {
	pageIndex.value += 1;
	getSpreadList();
}
</script>

<template>
	<div id="spread-detail" class="min-wrap-height">
	
	<!-- <div class="title"></div> -->
	
	<!-- <div class="body">
	<div class="list">
		<img src="../../../assets/romimg/spread/Group 1.png"/>
		<div class="balance">
		<p class="p-1">分享推广链接</p>
		<p class="p-2">通过此链接进入的朋友注册时自动填写你的邀请码</p>
		</div>
	</div>
	<div class="list">
		<img src="../../../assets/romimg/spread/Group 2.png"/>
		<div class="balance">
		<p class="p-1">好友充值成功</p>
		<p class="p-2">新用户注册并充值</p>
		</div>
	</div>
	<div class="list">
		<img src="../../../assets/romimg/spread/Group 3.png"/>
		<div class="balance">
		<p class="p-1">获得奖励</p>
		<p class="p-2">邀请奖励立即到账</p>
		</div>
	</div>
	</div> -->
	
	<div class="spread-list">
		<div class="spread-list-title-1">
		<p>{{ t('users.datetime') }}</p>
		<p>{{ t('users.rechargeUser') }}</p>
		<p>{{ t('users.rechargeMoney') }}</p>
		<p>{{ t('users.incomeTitle') }}</p>
		</div>
		<div class="spread-list-tip" v-if="statsList.length == 0">
		········ {{ t('users.noMore') }} ········
		</div>
		<van-list
		v-else
		v-model="loading"
		:finished="finished"
		:finished-text="t('common.noMore')"
		@load="onLoad"
		:immediate-check="false"
		>
		<div class="spread-list-wrap-1">
			<div
			class="spread-item-1"
			v-for="(item, index) in statsList"
			:key="index"
			>
			<p class="hide">{{ item.dataDay }}</p>
			<p>{{ item.chargeNum }}</p>
			<p>${{ item.chargeAmount }}</p>
		<div class="equally-3">
		<img class="img-3" src="@/assets/romimg/bag/coins.svg.png"/>
			<p>{{ item.incomeAmount}}</p>
		</div>
			</div>
		</div>
		</van-list>
	</div>
	
	
	<!-- <div class="head-1">
		<div class="head-2">
		<p>默认等级</p>
		<p>奖励比例</p>
		<p>被邀请用户累计充值</p>
		</div>
		<div class="body-1">
				<p>1</p>
				<p>1%</p>
				<p>0</p>
		</div>
		<div class="body-1">
				<p>2</p>
				<p>2%</p>
				<p>65000</p>
		</div>
		
		<div class="body-1">
				<p>3</p>
				<p>3%</p>
				<p>130000</p>
		</div>
	</div> -->
	
	
	</div>
	
	
	
	
	
</template>

<style lang="scss">
#spread-detail {
	width: 750px;
	box-sizing: border-box;
	padding: 0 33px;
	
	
	
	.head-1{
	display: flex;
	justify-content: center; /* 水平居中 */
	align-items: center; /* 垂直居中 */
	flex-direction: column; /* 子元素垂直排列 */
	
	.head-2{
		height: 80px;
		width: 710px;
		background-color: #111324;
		display: flex;
		// justify-content: center; /* 水平居中 */
		align-items: center; /* 垂直居中 */
		
		p{	
		// // width: 33.333%;
		// color: #535155;
		line-height: 80px;
		// text-align: center;/*控制文本居中对齐*/
		// flex: 1;
		font-size: 24px;
		color: #535155;
		
		&:nth-child(1) {
			// width: 23.529%;
			// margin-left: 90px;
			margin-left: 41px;
			margin-right: 128px;
		}
		&:nth-child(2) {
			// width: 23.529%;
			margin-right: 98px;
		}
		&:nth-child(3) {
			// width: 52.941%;
		}
		
		}
		
	}
	
	 .body-1{
	 		display: flex;
	 		// justify-content: center; /* 水平居中 */
	 		align-items: center; /* 垂直居中 */
	 		height: 116px;
	 		width: 710px;
	 		background-color: #131528;
	 		margin-bottom: 4px;
		
		p{
				// // width: 33.333%;
				// color: #535155;
				line-height: 80px;
				// text-align: center;/*控制文本居中对齐*/
				// flex: 1;
				font-size: 24px;
				color: #ff5500;
				
				text-align: center;/*控制文本居中对齐*/
				&:nth-child(1) {
					// width: 23.529%;
					// margin-left: 80px;
					// margin-left: 85px;
					// margin-right: 42px;
				width: 25%;
				color: #FFFFFF;
				font-weight: bold; /* 加粗字体 */
				}
				&:nth-child(2) {
					// width: 23.529%;
				//	 margin-right: 225px;
				// color: #70C593;
				width: 39%;
				font-weight: bold; /* 加粗字体 */
				}
				&:nth-child(3) {
					// width: 52.941%;
				width: 32%;
				color: #FFFFFF;
				font-weight: bold; /* 加粗字体 */
				}
				
		}
		
	 }
	
	}
	
	
	
	
	
	.equally-3{
		width: 25%;
		display: flex;
		
	justify-content: center; /* 水平居中 */
		// flex-direction: column; /* 垂直排列 */
		// justify-content: center; /* 水平居中 */
		// margin-right: 45px;
		// background-color: #554BF7;
		// align-items: center; /* 垂直居中 */
		
		// justify-content: center; /* 水平居中 */
		// align-items: center; /* 垂直居中 */
		// justify-content: space-between; /* 子元素均匀分布，第一个元素在起始位置，最后一个元素在结束位置 */
		
		P{
		// background-color: #70C593;
		color: #70C593 !important;
		}
		
		img{
		margin-top: 6px;
		}
		
	}
	
	.img-3{
	width: 24px;
	height: 24px;
	// margin-left: 30px;
	margin-right: 10px;
	// margin-top: 10px;
	}
	
	.text{
	width: 60px;
	height: 60px;
	border: 2px solid #B4B6C8;
	border-radius: 12px;
	color: #70C593;
	background-color: #535155;
	margin-bottom: 100px;
	padding: 20px;
	font-size: 30px;
	
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

	.spread-list-title-1 {
		display: flex;
		justify-content: center; /* 水平居中 */
		align-items: center; /* 垂直居中 */
		height: 80px;
	//	 width: 710px;
	background-color: #111324; 
		// border-bottom: 1px solid #EEE131;
	
		p {
		flex: 1;
		line-height: 52px;
		font-size: 24px;
		font-weight: bold;
		color: #535155;
		text-align: center;
		}

	}

	.spread-list-tip {
		text-align: center;
		line-height: 150px;
		font-size: 24px;
		color: #fff;
	}

	.spread-list-wrap-1 {
		margin-bottom: 40px;

		.spread-item-1 {
	// width: 710px;
		height: 116px;
		display: flex;
		align-items: center;
		position: relative;
	background-color: #131528;
	margin-bottom: 4px;
	
		// border-bottom: 1px solid #fff;
		// p	{
		//	 flex: 1;
		//	 text-align: center;
		//	 color: #FFFFFF;
		//	 font-size: 24px;
		// }
	
	p {
		text-align: center;
		color: #EDF0F7;
		font-size: 24px;
	
		&:nth-child(1) {
			width: 25%;
		}
	
		&:nth-child(2) {
			width: 25%;
		font-weight: bold; /* 加粗字体 */
		}
	
		&:nth-child(3) {
			width: 25%;
		font-weight: bold; /* 加粗字体 */
		// color: #70C593;
		}
		
		// &:nth-child(4) {
		//	 width: 25%;
		// }
	}	
		
		
	
		// &:nth-child(5) {
		//	 width: 40%;
		// }

		}

	}
	}
}
</style>
