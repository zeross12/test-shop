<script setup>

import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const store = useStore();
const router = useRouter();
const route = useRoute();

function goRoute(path) {
	router.push(path);
}

</script>
		
<template>
	<div id="help-wrap" class="min-wrap-height">
	<div class="head">
		<img class="img-vevtor" src="@/assets/romimg/help/Vector.png"/>
		<div class="titl">{{ t('support.contactService') }}</div>

		<p class="p">{{ t('support.textTip') }}</p>
	</div>
		<div class="help-main">
			<div class="help-nav">
				<!-- <div class="help-nav-item" :class="{ 'active': route.name == 'm_regulations' }"
<<<<<<< HEAD
					v-if="store.state.moduleHelpRegulation" @click="goRoute('/m/help/regulations')"> -->
					 <!-- <img v-if="route.name == 'm_regulations'" src="@/assets/romimg/help/icon1_active.png" alt="用户协议" />
					<img v-else src="@/assets/romimg/help/icon1.png" alt="用户协议" /> -->
					<!-- {{ t('footer.userAgreement') }}
=======
					v-if="store.state.moduleHelpRegulation" @click="goRoute('/m/help/regulations')">
					{{ t('footer.userAgreement') }}
>>>>>>> 165b828970d4bbbec360a568a99b54f95b08cc3b
				</div> -->
				<div class="help-nav-item" :class="{ 'active': route.name == 'm_compliance' }"
					v-if="store.state.moduleHelpCompliance" @click="goRoute('/m/help/compliance')">
					 <!-- <img v-if="route.name == 'm_compliance'" src="@/assets/romimg/help/icon2_active.png" alt="合规声明" />
					<img v-else src="@/assets/romimg/help/icon2.png" alt="合规声明" /> -->
					{{ t('footer.complianceStatement') }}
				</div>
				<div class="help-nav-item" :class="{ 'active': route.name == 'm_privacy' }"
					v-if="store.state.moduleHelpPrivacy" @click="goRoute('/m/help/privacy')">
					<!-- <img v-if="route.name == 'm_privacy'" src="@/assets/romimg/help/icon3_active.png" alt="隐私条款" />
					<img v-else src="@/assets/romimg/help/icon3.png" alt="隐私条款" /> -->
					{{ t('footer.privacyPolicy') }}
				</div>
				<!-- <div class="help-nav-item" :class="{ 'active': route.name == 'm_fandubo' }"
<<<<<<< HEAD
					v-if="store.state.moduleHelpFanDuBoNotice" @click="goRoute('/m/help/fandubo')"> -->
					<!-- <img v-if="route.name == 'm_fandubo'" src="@/assets/romimg/help/icon5_active.png" alt="预防公告" />
					<img v-else src="@/assets/romimg/help/icon5.png" alt="预防公告" /> -->
					<!-- {{ t('footer.announcement') }}
=======
					v-if="store.state.moduleHelpFanDuBoNotice" @click="goRoute('/m/help/fandubo')">
					{{ t('footer.announcement') }}
>>>>>>> 165b828970d4bbbec360a568a99b54f95b08cc3b
				</div> -->
				<div class="help-nav-item" :class="{ 'active': route.name == 'm_contact' }"
					v-if="store.state.moduleHelpContact" @click="goRoute('/m/help/contact')">
					{{ t('router.contact') }}
				</div>
			</div>
			<div class="help-container">
				<div class="center"></div>
				<router-view class="router-view"></router-view>
			</div>
		</div>
	</div>
</template>

		
<style lang="scss">
#help-wrap {
	padding: 0px 32px;
	box-sizing: border-box;
	margin: 50px 0px;
	min-height: 1623px;
	width: 750px;
	// background: url(@/assets/romimg/personal/bg.png) no-repeat center;
	background-size: contain;
	
	display: flex;
	// justify-content: center; /* 水平居中 */
	align-items: center; /* 垂直居中 */
	flex-direction: column; /* 子元素垂直排列 */

	.p{
	width: 95%;
	color: #8C8DA6;
	font-size: 28px;
	margin-left: 3%;
	}

	.head{
	
	// display: flex;
	// justify-content: center; /* 水平居中 */
	// align-items: center; /* 垂直居中 */
	width: 706px;
	height: 220px;
	// margin-left: 3%;
	background-color: #1C203C;
	display: flex;
	flex-wrap: wrap;
	border-radius: 16px;
	
	}
	
	.img-vevtor{
	width: 42.222px;
	height: 48px;
	margin-right: 24px;
	margin-left: 30px;
	margin-top: 30px;
	}

	.titl {
		// margin-top: 40px;
		// margin-bottom: 40px;
	// padding-bottom: 300px;
	height: 48px;
	width: 50%;
	padding-top: 30px;
	font-size: 28px;
	color: #E6E6F1;
	
	font-weight: bold; /* 将文本字体加粗 */
	
	}

	.help-main {
		display: flex;
		align-items: center;
		flex-direction: column;
		margin-top: 30px;

		.help-nav {
			display: flex;
			font-size: 24px;
			color: #fff;
			// justify-content: center;
			justify-content: flex-start;
			align-items: center;
			border-bottom: 2px solid #1E2037;
			padding-bottom: 30px;
			width: 706px;


			.help-nav-item {
				display: flex;
				min-width: 192px;
				width: 50%;
				padding: 0 32px;
				height: 68px;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				box-sizing: border-box;
				font-size: 24px;
				color: #B4B6C8;
				margin-right: 14px;
				background-color: #15172C;
				border: 2px solid #46495F;
				border-radius: 12px;

				img {
					height: 46px;
					margin-bottom: 17px;
				}

				&.active {
					// color: #FFFF00;
			background-color: #554BF7;
			color: #FFFFFF;
			border: none; /* 取消描边 */
				}


				&:last-child {
					margin-right: 0px;
				}
			}

		}

		.help-container {
			height: 1276px;
			margin: 15px;
		width: 100%;
			.router-view {
				width: 100%;
				overflow: hidden;
				padding: 0 10px 40px;
				box-sizing: border-box;
				height: calc(100% - 32px - 20px);
				overflow-y: auto;

				p{
					font-size: 28px;
					line-height: 45px;
			color: #8C8DA6;
				}
			}
		}
	}
}
</style>