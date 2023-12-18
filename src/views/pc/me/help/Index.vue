<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const router = useRouter();
const route = useRoute();

function goRoute(path) {
	router.push(path);
}

</script>
		
<template>
	<div id="pc-help-wrap">
		<div class="p-com-header">
			<div class="p-com-header-c">{{ t( 'menu.supportCenter' ) }}</div>
		</div>
		<div class="help-notice">
			<div class="notice-wrap">
				<p>{{ t( 'support.contactService' ) }}</p>
				<p>{{ t( 'support.textTip' ) }}</p>
			</div>
		</div>
		<div class="pc-common-tabs">
			<!-- <div class="tab-item" :class="{ 'active': route.name == 'p_regulations' }"
				v-if="store.state.moduleHelpRegulation" @click="goRoute('/p/me/help/regulations')">
				<svg class="icon">
					<use xlink:href="@/assets/icon.svg#gifts"></use>
				</svg>
				{{ t( 'router.regulations' ) }}
			</div> -->
			<div class="tab-item" :class="{ 'active': route.name == 'p_compliance' }"
				v-if="store.state.moduleHelpCompliance" @click="goRoute('/p/me/help/compliance')">
				<svg class="icon">
					<use xlink:href="@/assets/icon.svg#history"></use>
				</svg>{{ t( 'router.compliance' ) }}
			</div>
			<div class="tab-item" :class="{ 'active': route.name == 'p_privacy' }" v-if="store.state.moduleHelpPrivacy"
				@click="goRoute('/p/me/help/privacy')">
				<svg class="icon">
					<use xlink:href="@/assets/icon.svg#gift-3"></use>
				</svg>{{ t( 'router.privacy' ) }}
			</div>
			<!-- <div class="tab-item" :class="{ 'active': route.name == 'p_fandubo' }"
				v-if="store.state.moduleHelpFanDuBoNotice" @click="goRoute('/p/me/help/fandubo')">
				<svg class="icon">
					<use xlink:href="@/assets/icon.svg#gift-3"></use>
				</svg>{{ t( 'router.notice' ) }}
			</div> -->
		</div>
		<div class="help-main">
			<router-view class="router-view"></router-view>
		</div>
	</div>
</template>
		
<style lang="scss">
#pc-help-wrap {
	box-sizing: border-box;
	padding-top: 3px;
	width: 100%;
	min-height: 500px;
	padding-bottom: 50px;
	display: flex;
	align-items: center;
	flex-direction: column;

	.p-com-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 5px;
		margin-bottom: 5px;

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

	}

	.help-notice {
		display: flex;
		width: 1440px;
		height: 193px;
		background: url(@/assets/pcimg/help/bg.png) center no-repeat;
		// background-size: 100% 100%;
		padding-left: 150px;
		box-sizing: border-box;

		&:hover
		{
			background: url( @/assets/pcimg/help/bg-hover.png ) center no-repeat;
			// background-size: 100% 100%;
		}

		.notice-wrap {
			display: flex;
			flex-direction: column;
			margin-top: 45px;

			p:first-child {
				color: #E6E6F1;
				font-size: 22px;
				font-weight: 700;
			}

			p:last-child {
				color: #8C8DA6;
				font-size: 17px;
				font-weight: 400;
			}
		}
	}

	.pc-common-tabs {
		margin-top: -50px;
		width: 100%;

		.tab-item {
			flex: 1;
		}
	}


	.help-main {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 500px;

		.router-view {
			width: 100%;
			overflow: hidden;
			box-sizing: border-box;
			font-size: 14px;
			color: #CBCCD6;
		}
	}
}
</style>