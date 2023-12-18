<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { tokenName } from "../../../config"

const store = useStore();
const router = useRouter();
const active = ref(false);
const taskShow = ref(true);
const appShow = ref(true);
const qqGroupDialog = ref(false);

function onClickRed() {
	store.commit("setPassRed", true);
}

function onClickRecharge() {
	router.push("/m/recharge");
}

function onClickBag() {
	router.push("/m/bag");
}

function onClickService() {
	if (localStorage.getItem(tokenName)) {
		let channelId = store.getters.getConfigItem("CustomerServiceUrl") || "e5V7gB";

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
	router.push("/m/download");
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
	<div id="sidebar" :class="{ active: active }">
		<div class="switch" @click="active = !active">
			<img src="@/assets/romimg/sidebar/side_icon2.png" alt="" />
		</div>
		<div class="sidebar_box">
			<div class="award-img" @click="onClickRed()" v-if="!store.state.beiAnExamine">
				<img src="@/assets/romimg/sidebar/red_icon.png" />
			</div>
			<div class="sidebar_item" @click="onClickRecharge()" v-if="store.state.moduleRecharge">
				<img src="@/assets/romimg/sidebar/btn_recharge.png" alt="" />
				<p>{{ t( 'menu.recharge' ) }}</p>
			</div>
			<div class="sidebar_item" @click="onClickBag()" v-if="!store.state.beiAnExamine && store.state.moduleRucksack">
				<img src="@/assets/romimg/sidebar/btn_bag.png" alt="" />
				<p>{{ t( 'menu.bag' ) }}</p>
			</div>
			<div class="sidebar_item app" @click="onClickApp()" v-show="appShow"
				v-if="!store.state.beiAnExamine && store.state.moduleAppDownload">
				<img src="@/assets/romimg/sidebar/btn_download.png" alt="" class="appDownload" />
				<p>{{ t( 'menu.appDownload' ) }}</p>
			</div>
			<div class="sidebar_item" @click="onClickService()" v-if="store.state.moduleService">
				<img src="@/assets/romimg/sidebar/btn_custom.png" alt="" />
				<p>{{ t( 'menu.service' ) }}</p>
			</div>
			<div class="sidebar_item" @click="onClickGroup()" v-if="!store.state.beiAnExamine && store.state.moduleGroupChat">
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
#sidebar {
	position: fixed;
	right: -103px;
	bottom: 235px;
	z-index: 100;
	width: 150px;
	display: flex;
	align-items: center;
	color: #fff;
	transition: 0.3s;

	.switch {
		width: 54px;
		height: 156px;
		background: url(@/assets/romimg/sidebar/side_icon.png) no-repeat center;
		background-size: 100%;
		display: flex;
		justify-content: center;
		margin-right: -2px;

		img {
			width: 15px;
			height: 22px;
			margin-top: 18px;
			transition: 0.3;
		}
	}

	.sidebar_box {
		width: 108px;
		height: 799px;
		background: url(@/assets/romimg/sidebar/bg.png) center no-repeat;
		background-size: 100% 100% ;
 
		.award-img {
			display: block;
			text-align: center;
			margin-top: 30px;

			img {
				width: 99px;
				height: 105px;
			}
		}

		.sidebar_item {
			display: block;
			text-align: center;
			margin-top: 30px;

			img {
				width: 55px;
				height: 55px;
				margin-bottom: 5px;
			}

			p {
				font-size: 20px;
				color: #FFFFFF;
			}

		}
	}

	&.active {
		right: 0;

		.switch {
			img {
				transform: rotate(180deg);
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
