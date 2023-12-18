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
	<div id="pc-footer-wrap" v-if="store.state.showFooterView">
		<div class="site-info-container">
			<div class="info-wrap">
				<div class="logo"><img src="@/assets/pcimg/common/logo.png"></div>
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
		</div>
		<div class="footer-content-container">
			<div class="content-wrap">
				<div class="copyright">
					<div class="site">© 2020-2023 vnskin.club</div>
					<div class="site-subinfo">
						<p>CS:GO case opening. Win rare skins at best prices.</p>
						<p>Wish you good luck and lots of surprises</p>
					</div>
				</div>
				<div class="link">
					<a href="#"><img src="@/assets/pcimg/common/link/z.png"></a>
					<a href="#"><img src="@/assets/pcimg/common/link/facebook.png"></a>
					<a href="#"><img src="@/assets/pcimg/common/link/t.png"></a>
					<a href="#"><img src="@/assets/pcimg/common/link/tiktok.png"></a>
					<a href="#"><img src="@/assets/pcimg/common/link/twitter.png"></a>
					<a href="#"><img src="@/assets/pcimg/common/link/y.png"></a>
					<a href="#"><img src="@/assets/pcimg/common/link/s.png"></a>
				</div>
				<div class="agreement">
					<p @click="go('/p/me/help/compliance')" v-if="store.state.moduleHelpCompliance">
						{{ t('footer.complianceStatement') }}
					</p>
					<p @click="go('/p/me/help/privacy')" v-if="store.state.moduleHelpPrivacy">
						{{ t('footer.privacyPolicy') }}
					</p>
				</div>
				<div class="bank">
					<img src="@/assets/pcimg/common/bank/a.png">
					<img src="@/assets/pcimg/common/bank/b.png">
					<img src="@/assets/pcimg/common/bank/c.png">
					<img src="@/assets/pcimg/common/bank/d.png">
					<img src="@/assets/pcimg/common/bank/e.png">
					<img src="@/assets/pcimg/common/bank/f.png">
					<img src="@/assets/pcimg/common/bank/g.png">
					<img src="@/assets/pcimg/common/bank/h.png">
					<img src="@/assets/pcimg/common/bank/i.png">
					<img src="@/assets/pcimg/common/bank/j.png">
					<img src="@/assets/pcimg/common/bank/k.png">
				</div>
			</div>
		</div>
		<!-- <div class="footer-content-wrap">
			<div class="footer_info">
				<p @click="go('/p/me/help/compliance')" v-if="store.state.moduleHelpCompliance">
					{{ t( 'footer.complianceStatement' ) }}
				</p>
				<p @click="go('/p/me/help/privacy')" v-if="store.state.moduleHelpPrivacy">
					{{ t( 'footer.privacyPolicy' ) }}
				</p>
				<p @click="go('/p/me/help/regulations')" v-if="store.state.moduleHelpRegulation">
					{{ t( 'footer.userAgreement' ) }}
				</p>
				<p @click="go('/p/me/help/fandubo')" v-if="store.state.moduleHelpFanDuBoNotice">
					{{ t( 'footer.announcement' ) }}
				</p>
			</div>
		</div>
		<div class="gateway" v-if="securityNo">
			<img src="@/assets/romimg/footer/beian.png" />{{ securityNo }}
		</div>
		<div class="record" v-if="filingNo">
			<a target="_blank" href="https://beian.miit.gov.cn">{{ filingNo }}</a>
		</div>
		<div class="copyright">{{ companyName }}</div> -->
	</div>
</template>

<style lang="scss">
@media (max-width: 1280px) {
	#pc-footer-wrap {
		.site-info-container {
			.info-wrap {
				width: 1280px !important;

				.logo {
					img {
						width: 80%;
					}
				}
			}
		}

		.footer-content-container {
			.content-wrap {
				width: 1280px !important;
				padding: 20px 60px !important;

				.link {
					a {
						padding: 10px !important;
					}
				}

				.bank {
					width: 216px !important;

					img {
						// width: calc( 30px / 50px * 50px ) !important;
						// height: calc(  );
					}
				}
			}
		}
	}
}

#pc-footer-wrap {
	width: 100%;
	background-color: #0c0d19;
	margin: auto;
	color: #4e526c;
	overflow: hidden;

	.site-info-container {
		height: 234px;
		width: 100%;
		background: #101120;
		justify-content: center;
		display: flex;

		.info-wrap {
			height: 100%;
			width: 1440px;
			display: flex;
			justify-content: space-between;

			div {
				// border: 1px solid red;
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				justify-content: center;
				padding: 10px 0 0 50px;

				.f-title {
					color: #CBCCD6;

					font-size: 38px;
					font-style: normal;
					font-weight: 300;
				}

				.f-subtitle {
					color: #4F5165;

					font-size: 15px;
					font-style: normal;
					font-weight: 400;
					text-transform: uppercase;
					padding-top: 0;
				}

				&.logo {
					background: url(@/assets/pcimg/common/footer-logo-bg.png ) no-repeat;
					background-position: left bottom;
					width: 25%;
					flex-direction: row;
					align-items: center;
					height: 100%;
					padding: 0;
					min-width: 320px;
				}

				&.box {
					background: url(@/assets/pcimg/common/footer-box-bg.png ) no-repeat;
					background-position: 0px 50px;
					justify-content: center;
					height: 100%;
					min-width: 320px;
				}

				&.user {
					background: url(@/assets/pcimg/common/footer-user-bg.png ) no-repeat;
					background-position: 0px 30px;
					height: 100%;
					min-width: 320px;
				}

				&.battle {
					background: url(@/assets/pcimg/common/footer-battle-bg.png ) no-repeat;
					background-position: 0px 58px;
					height: 100%;
					min-width: 320px;
				}
			}
		}
	}

	.footer-content-container {
		display: flex;
		height: 258px;
		background: #0C0D19;
		justify-content: center;

		.content-wrap {
			display: flex;
			padding: 20px 86px;
			width: 1440px;
			box-sizing: border-box;
			height: 100%;
			align-items: center;
			justify-content: space-between;

			.link {
				display: flex;
				gap: 10px;

				a {
					display: flex;
					padding: 12px;
					border: 1px solid #17192A;
					border-radius: 50%;

					img {
						width: 16px;
						height: 16px;
					}
				}
			}

			.bank {
				display: flex;
				width: 328px;
				flex-wrap: wrap;
				gap: 5px;

				img {
					width: 50px;
					height: 40px;
				}
			}

			.agreement {
				display: flex;
				gap: 45px;

				p {

					font-size: 14px;
					font-style: normal;
					font-weight: 400;
					color: #8386A5;
					border-bottom: 1px solid #21243D;
					padding: 25px 0;
					cursor: default;
				}
			}

			.copyright {
				// width: 25%;

				.site {

					font-size: 16px;
					font-style: normal;
					font-weight: 300;
					color: #CBCCD6;
				}

				.site-subinfo p {

					font-size: 11.2px;
					font-style: normal;
					font-weight: 400;
					color: #57586C;
				}
			}
		}
	}
}
</style>
