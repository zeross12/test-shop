<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import mheader from "@/components/h5/mheader/Index.vue";
import mfooter from "@/components/h5/mfooter/Index.vue";
import introduce from "@/components/h5/introduce/Index.vue";
import sidebar from "@/components/h5/sidebar/Index.vue";
import sign from "@/components/h5/login/Sign.vue";
import register from "@/components/h5/login/Register.vue";
import forgetPW from "@/components/h5/login/ForgetPW.vue";
import bindPhone from "@/components/h5/login/BindPhone.vue";
import BackToTop from "@/components/h5/common/BackToTop.vue";
import PasswordRed from "@/components/h5/pwred/Index.vue";
import RegRed from "@/components/h5/regred/Index.vue";
import UpdateNotice from "@/views/h5/download/UpdateNotice.vue";
import ActivityDialog from "@/views/h5/activity/ActivityDialog.vue";
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { UserType } from "@/util/util";
import { useStore } from "vuex";
import { _isMobile, isPCFunc } from "@/util/common";
const route = useRoute();
const router = useRouter();
const store = useStore();
components: {
	mheader, mfooter, introduce, PasswordRed;
}

onMounted(() => {
	// if (route.query.qhclickid) {
	// 	let bz = _isMobile() ? 2 : 1;
	// 	let snnid = route.query.qhclickid + "," + bz;
	// 	localStorage.setItem("bd_vid", snnid);
	// }
	// if (route.query.bd_vid) {
	// 	localStorage.setItem("bd_vid", route.query.bd_vid);
	// }

	// if (isPCFunc()) {
	// 	let params = { path: "/p/home" };
	// 	if (route.query.code) {
	// 		params.query = { code: route.query.code };
	// 	}
	// 	router.replace(params);
	// 	// let url="https://pc.199skins.com"
	// 	// if (route.query.code) {
	// 	//	 url+="?code="+route.query.code;
	// 	// }
	// 	// window.open(url, "_self");
	// }
});

watch(route, (newRoute, oldRoute) => {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
});
</script>

<template>
	<div id="container">
		<mheader></mheader>
		<router-view />
		<mfooter />
		<introduce />
		<BackToTop></BackToTop>
		<PasswordRed></PasswordRed>
		<RegRed></RegRed>
		<!-- <sidebar /> -->

		<!-- <register /> -->
		<!-- <forgetPW /> -->
		<bindPhone />
		<UpdateNotice />
		<ActivityDialog />
		<div v-if="store.state.userInfoBase.userType == UserType.anchor" class="live_tip">
			{{ t('common.liveTip') }}
			<!-- 直播内容仅供参考&nbsp;切勿随意模仿&nbsp; -->
		</div>
	</div>
</template>

<style lang="scss">
#container {
	// background: url('@/assets/romimg/base_back.png') no-repeat center top, #201E2C;
	// background: url('@/assets/romimg/spring/bg.png') no-repeat center top, #270204;

	// background-size: 100%;
	background-color: #15172c;
	width: 750px;
	position: relative;

	.live_tip {
		position: fixed;
		right: 6px;
		bottom: 20px;
		z-index: 100000;
		width: 12px;
		color: #fff;
		opacity: 1;
		font-size: 14px;
		letter-spacing: 2px;
		writing-mode: vertical-rl;
		font-weight: bold;
	}
}
</style>
