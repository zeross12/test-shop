<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { tokenName } from "../../../config";


const store = useStore();
const router = useRouter();
const active = ref(false);
const taskShow = ref(true);
const qqGroupDialog = ref(false);

function onClickRed() {
	store.commit("setPassRed", true);
}

function onClickRecharge() {
	router.push("/p/recharge");
}

function onClickBag() {
	router.push("/p/me/bag");
}

function onClickService() {
	if (localStorage.getItem(tokenName)) {
		let channelId = store.getters.getConfigItem("CustomerServiceUrl");

		if (!window._AIHECONG) {
			(function (d, w, c) {
				if (w[c]) return;
				var s = d.createElement("script");
				w[c] = function () {
					(w[c].z = w[c].z || []).push(arguments);
				};
				s.async = true;
				s.src = "https://static.ahc.ink/hecong.js";
				if (d.head) d.head.appendChild(s);
			})(document, window, "_AIHECONG");

			_AIHECONG("ini", {
				channelId: channelId,
				uniqueId: `199skins${store.state.userInfoBase.account}`,
				button: false,
			});
			_AIHECONG("customer", {
				名称: store.state.userInfoBase.nickName,
				手机: store.state.userInfoBase.mobile,
				终端: "MODILE",
				会员账号: store.state.userInfoBase.account,
			});
			_AIHECONG("showChat");
		} else {
			_AIHECONG("showChat");
		}
	} else {
		store.commit("setSignView", true);
	}
}

function onClickApp() {
	router.push("/p/download");
}

function onClickHelp(){
	router.push("/p/help");
}

function onClickGroup() {
	if (navigator.userAgent.indexOf("UCBrowser") > -1) {
		alert( t( 'menu.browserNotSupport' ) );
	} else {
		if (store.state.otherConfig.qqGroup && store.state.otherConfig.qqGroup.length > 0) {
			qqGroupDialog.value = true;
			return;
		}
		let qqGroupLink = store.getters.getConfigItem("GroupChatUrl") || "https://jq.qq.com/?_wv=1027&k=e1Zb57os";
		window.open(qqGroupLink);
	}
}

function onClickGroupItem(item) {
	window.$dev && console.log(item);
	let qqGroupLink = item || store.getters.getConfigItem("GroupChatUrl") || "https://jq.qq.com/?_wv=1027&k=e1Zb57os";
	window.open(qqGroupLink);
}
</script>

<template>
	<div id="pc-sidebar" :class="{ active: active }">
		<div class="switch">
		</div>
		<div class="line1"></div>
		<div class="sidebar_box">
			<div class="sidebar_item" @click="onClickRed()">
				<div class="red-img"><img src="@/assets/romimg/sidebar/red_icon.png" /></div>
			</div>
			<div class="line2"></div>
			<div class="sidebar_item" @click="onClickRecharge()" v-if="store.state.moduleRecharge">
				<img src="@/assets/romimg/sidebar/btn_recharge.png" alt="" />
				<p>{{ t( 'menu.recharge' ) }}</p>
			</div>
			<div class="line2"></div>
			<div class="sidebar_item" @click="onClickBag()" v-if="store.state.moduleRucksack">
				<img src="@/assets/romimg/sidebar/btn_bag.png" alt="" />
				<p>{{ t( 'menu.bag' ) }}</p>
			</div>
			<div class="line2"></div>
			<div class="sidebar_item app" @click="onClickApp()" v-if="store.state.moduleAppDownload">
				<img src="@/assets/romimg/sidebar/btn_download.png" alt="" class="appDownload" />
				<p>{{ t( 'menu.appDownload' ) }}</p>
			</div>
			<div class="line2"></div>
			<div class="sidebar_item" @click="onClickHelp()">
				<!-- <img src="@/assets/pcimg/home/icon_pep2.png" alt="" /> -->
				<p>{{ t( 'menu.helpShort' ) }}</p>
			</div>
			<div class="line2"></div>
			<div class="sidebar_item" @click="onClickService()" v-if="store.state.moduleService">
				<img src="@/assets/romimg/sidebar/btn_custom.png" alt="" />
				<p>{{ t( 'menu.service' ) }}</p>
			</div>
			<div class="line2"></div>
			<div class="sidebar_item" @click="onClickGroup()" v-if="store.state.moduleGroupChat">
				<img src="@/assets/romimg/sidebar/btn_qq.png" alt="" />
				<p>{{ t( 'menu.groupChat' ) }}</p>
			</div>
		</div>
		<van-dialog v-model:show="qqGroupDialog" :showConfirmButton="false" :show-cancel-button="true">
			<div class="qqGroup-list-dialog">
				<div class="qqGroup-item-wrap" v-for="(item, index) in store.state.otherConfig.qqGroup" :key="index"
					@click="onClickGroupItem(item)">
					<img src="@/assets/romimg/sidebar/btn_qq.png" alt="" />
					<p>{{ t( 'menu.groupChat' ) }}{{ index + 1 }}</p>
				</div>
			</div>
		</van-dialog>
	</div>
</template>

<style lang="scss" scoped>
#pc-sidebar {
	display: flex;
	align-items: center;
	flex-direction: column;
	position: fixed;
	right: 38px;
	top: 286px;
	z-index: 100;
	width: 65px;
	color: #fff;

	.switch {
		width: 42px;
		height: 42px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: 0px;
		z-index: 2;
	}

	.line1 {
		width: 2px;
		height: 47px;
		margin-top: -15px;
		background: #FBFA02;
	}

	.sidebar_box {
		display: flex;
		flex-direction: column;
		align-items: center;


		.line2 {
			width: 2px;
			height: 30px;
			background: #FBFA02;
		}

		.sidebar_item {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			text-align: center;
			width: 65px;
			height: 65px;
			background: rgba(17, 15, 24, 0.3);
			border: 2px solid #FBFA02;
			border-radius: 6px;

			img {
				width: 35px;
			}

			p {
				font-size: 16px;
				color: #fff;
				width: 70px;
			}

			&:hover {
				cursor:pointer;
				p {
					color: #FBFA02;
				}
			}

			.red-img {
				display: flex;
				align-items: center;
				justify-content: center;

				img {
					width: 60px;
				}
			}
		}
	}

	.qqGroup-list-dialog {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 80px;

		.qqGroup-item-wrap {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			margin: 0 50px;
			cursor: pointer;

			img {
				width: 55px;
				height: 55px;
				margin-bottom: 5px;
			}

			p {
				font-size: 20px;
				color: #fff;
			}
		}
	}
}
</style>
