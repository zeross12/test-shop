<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { runDeviceType } from "@/config";
import { DeviceType } from "@/util/util";
import { getPlatformStatistics } from '@/network/api/index'
import logoIcon2 from "@/assets/romimg/common/logo2.png"

const router = useRouter();
const store = useStore();

const companyName = ref(""); //版权所属：郴州网创电商服务有限公司
const filingNo = ref(""); //湘ICP备2022022225号-1
const securityNo = ref(""); //湘公网安备 43100202000401号

const renzhIcon = ref(false);
onMounted(() => {
	init()
	// companyName.value = localStorage.getItem('companyName', '') ;
	// filingNo.value = localStorage.getItem('filingNo', '');
	companyName.value = Window.channelInfo.companyName;
	filingNo.value = Window.channelInfo.filingNo;
	securityNo.value = Window.channelInfo.securityNo;

	if (store.state.otherConfig.renzhChannel) {
		let channelCode = localStorage.getItem("channelCode");
		let chIndex = store.state.otherConfig.renzhChannel.findIndex((v) => {
			return channelCode == v;
		});
		if (chIndex != -1) {
			renzhIcon.value = true;
		}
	}
});

const box = ref(0)
const users = ref(0)
const battle = ref(0)
async function init() {
	let res = await getPlatformStatistics()
	if (res.code == 0) {
		box.value = res.data.blindBoxOpenTotal
		battle.value = res.data.battleTotal
		users.value = res.data.userTotal
	}
}

function go(v) {
	router.push(v);
}

function getLogo() {
	if (Window.channelInfo.logoUrl2) {
		return Window.channelInfo.logoUrl2;
	} else {
		return logoIcon2;
	}
}
</script>

<template>
	<!-- <div id="footer-wrap" v-if="store.state.showFooterView">
		<div class="site-info-container">
			<div class="info-wrap">
				<div class="box">
					<div class="f-title">{{ box }}</div>
					<div class="f-subtitle">{{ t('footer.openedBoxs') }}</div>
				</div>
				<div class="user">
					<div class="f-title">{{ users }}</div>
					<div class="f-subtitle">{{ t('common.users') }}</div>
				</div>
				<div class="battle">
					<div class="f-title">{{ battle }}</div>
					<div class="f-subtitle">{{ t('footer.battle') }}</div>
				</div>
			</div>

			<div class="link">
				<a href="#"><img src="@/assets/pcimg/common/link/z.png"></a>
				<a href="#"><img src="@/assets/pcimg/common/link/facebook.png"></a>
				<a href="#"><img src="@/assets/pcimg/common/link/t.png"></a>
				<a href="#"><img src="@/assets/pcimg/common/link/tiktok.png"></a>
				<a href="#"><img src="@/assets/pcimg/common/link/twitter.png"></a>
				<a href="#"><img src="@/assets/pcimg/common/link/y.png"></a>
				<a href="#"><img src="@/assets/pcimg/common/link/discoid.png"></a>
			</div>

			<div class="agreement">
				<p @click="go('/m/help/compliance')">{{ t('footer.complianceStatement') }}</p>
				<p @click="go('/m/help/privacy')">{{ t('footer.privacyPolicy') }}</p>
			</div>

			<div class="copyright">
				<div class="site">© 2020-2023 vnskin.club</div>
				<div class="site-subinfo">
					<p>CS:GO case opening. Win rare skins at best prices.</p>
					<p>Wish you good luck and lots of surprises</p>
				</div>
			</div>
		</div>
	</div> -->
</template>

<style lang="scss">
#footer-wrap {
	width: 100%;
	background-color: #111324;
	background-size: contain;
	// overflow: hidden;
	display: flex;
	justify-content: start;
	flex-direction: column;
	align-items: center;

	.site-info-container {
		display: flex;
		flex-direction: column;
		padding: 40px;
		width: 100%;
		box-sizing: border-box;

		.copyright {
			display: flex;
			flex-direction: column;

			.site {

				font-size: 32px;
				font-style: normal;
				font-weight: 300;
				color: #CBCCD6;
				padding: 28px 0;
			}

			.site-subinfo {
				p {
					color: #57586C;

					font-size: 22px;
					font-style: normal;
					font-weight: 400;
				}
			}
		}

		.agreement {
			display: flex;
			gap: 40px;
			justify-content: center;
			padding: 0 0 40px 0;
			width: 100%;

			p {

				font-size: 28px;
				font-style: normal;
				font-weight: 400;
				color: #8386A5;
			}
		}

		.link {
			display: flex;
			padding: 40px 0;
			justify-content: space-between;
			width: 100%;

			a {
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 28px;
				border: 2px solid #17192A;
				border-radius: 50%;

				img {
					width: 32px;
					height: 32px;
				}
			}
		}

		.info-wrap {
			display: flex;
			height: 164px;

			div {
				display: flex;
				flex-direction: column;
				// border: 1px solid red;
				justify-content: flex-end;
				width: 33%;
				align-items: center;

				.f-title {
					color: #CBCCD6;

					font-size: 26px;
					font-style: normal;
					font-weight: 300;
					width: 100%;
				}

				.f-subtitle {
					width: 100%;
					color: #4F5165;

					font-size: 24px;
					font-style: normal;
					font-weight: 400;
					text-transform: uppercase;
				}
			}

			.box {
				background: url(@/assets/romimg/common/footer-box-bg.png ) no-repeat;
				background-size: 102px;
				background-position: top center;
				gap: 10px;
			}

			.user {
				background: url(@/assets/romimg/common/footer-users-bg.png ) no-repeat;
				background-size: 102px;
				background-position: top center;
				gap: 10px;
			}

			.battle {
				background: url(@/assets/romimg/common/footer-battle-bg.png ) no-repeat;
				background-size: 102px;
				background-position: top center;
				gap: 10px;
			}
		}
	}
}
</style>
