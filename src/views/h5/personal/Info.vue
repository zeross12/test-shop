<script setup>
import { ref, computed, inject, onMounted } from "vue";

import { useStore } from "vuex";
import { useRouter } from "vue-router";

import { logout } from "@/network/api/login";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import useClipboard from "vue-clipboard3";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const { toClipboard } = useClipboard();

const { reloadView } = inject("reloadView");

const store = useStore();
const router = useRouter();
const userInfoBase = computed(() => store.state.userInfoBase);
const userInfoExt = computed(() => store.state.userInfoExt);
const soundChecked = ref(store.state.soundSwitch);
const animationChecked = ref(store.state.animationSwitch);
const userID = ref("");
onMounted(() => {
	userID.value = store.state.userId;
});
function nameFilter(str) {
	if (str == undefined || str.length == 0) {
		return "";
	}
	let name = str.charAt(0) + "*".repeat(str.length - 1);
	return name;
}

function idFilter(str) {
	let id = str.slice(0, 8) + "*".repeat(10);
	return id;
}

function onSoundSwitchChange(flag) {
	soundChecked.value = flag;
	localStorage.setItem("soundSwitch", soundChecked.value);
	store.commit("setSoundSwitch", soundChecked.value);
}

function onAnimSwitchChange(flag) {
	animationChecked.value = flag;
	localStorage.setItem("animationSwitch", animationChecked.value);
	store.commit("setAnimationSwitch", animationChecked.value);
}

async function onClickExitLogin() {
	const res = await logout();
	if (res.code === 0) {
		Notify( t('menu.loggedOut') );
		store.commit("logout");
		nextTick(() => {
			reloadView();
		});
	}
}

function goToHead() {
	router.push("/m/personalHead");
}

function goToEdit(type) {
	router.push({ path: "/m/personalEdit", query: { type: type } });
}

async function copy() {
	try {
		let id = JSON.stringify(store.state.userId);
		await toClipboard(id);
		Notify(t('common.copySuccess' ));
	} catch (e) {
		NotifyF(t('common.copyFail' ));
	}
}
</script>

<template>
	<div id="personal-info">
		<TopTitleBack :title=" t('router.userInfo') "></TopTitleBack>
		<div class="row-wrap">
			<div class="label">{{ t('users.avater') }}</div>
			<div class="value" @click="goToHead">
				<div><img class="head" :src="userInfoBase.avater" alt="" /></div>
				<span class="icon iconfont">&#xe651;</span>
			</div>
		</div>
		<div class="row-wrap">
			<div class="label">{{ t('users.nickname') }}</div>
			<div class="value" @click="goToEdit('nickName')">
				{{ userInfoBase.nickName }}<span class="icon iconfont">&#xe651;</span>
			</div>
		</div>
		<div class="row-wrap">
			<div class="label">ID</div>
			<div class="value">
				{{ store.state.userId }}
				<!-- <van-button @click="copy(store.state.userId)">t('common.copy' )</van-button> -->
				<div class="copy" @click="copy">{{t('common.copy' )}}</div>
			</div>
		</div>
		<div class="row-wrap">
			<div class="label">{{ t('sign.bindPhoneTitle') }}</div>
			<div class="value">
				{{ userInfoBase.mobile }}
			</div>
		</div>
		<div class="row-wrap">
			<div class="label">{{ t('users.myPassword') }}</div>
			<div class="value" @click="goToEdit('password')">
				******<span class="icon iconfont">&#xe651;</span>
			</div>
		</div>
		<!-- <div class="row-wrap">
			<div class="label">{{ t('users.realnameTitle') }}</div>
			<div class="value" v-if="userInfoExt.realName">
				{{ nameFilter(userInfoExt.realName) }}
				{{ idFilter(userInfoExt.idNumber) }}
				<div class="copy">{{ t('users.alreadyRealnameTitle') }}</div>
			</div>
			<div v-else class="value" @click="goToEdit('realName')">
				{{ t('users.noRealnameTitle') }}未认证<span class="icon iconfont">&#xe651;</span>
			</div>
		</div> -->

		<div class="row-wrap">
			<div class="label">{{ t('users.myInviteCode') }}</div>
			<div class="value" @click="goToEdit('spreadCode')">
				{{ userInfoExt.spreadCode }}<span class="icon iconfont">&#xe651;</span>
			</div>
		</div>
		<div class="row-wrap">
			<div class="label">{{ t('users.bindInviteCode') }}</div>
			<div class="value" v-if="userInfoExt.invitationCode">
				{{ userInfoExt.invitationCode }}
			</div>
			<div class="value" v-else @click="goToEdit('invitationCode')">
				"{{ t('users.optional') }}"<span class="icon iconfont">&#xe651;</span>
			</div>
		</div>
		<div class="row-wrap">
			<div class="label">{{ t('users.steamLink') }}</div>
			<div class="value" v-if="userInfoExt.steamUrl">
				{{ userInfoExt.steamUrl.substring(43) }}
				<!-- <span class="icon iconfont">&#xe651;</span> -->
			</div>
			<div class="value" v-else @click="goToEdit('steamUrl')">
				{{ t('users.enterSteamLink') }}
				<span class="icon iconfont">&#xe651;</span>
			</div>
		</div>

		<div class="switch-wrap">
			<div class="switch-item">
				{{ t('common.sound') }}
				<img
					v-if="soundChecked"
					@click="onSoundSwitchChange(false)"
					src="@/assets/romimg/personal/switch_open.png"
				/>
				<img
					v-else
					@click="onSoundSwitchChange(true)"
					src="@/assets/romimg/personal/switch_close.png"
				/>
			</div>
			<div class="switch-item">
			 {{ t('common.animation') }}
				<img
					v-if="animationChecked"
					@click="onAnimSwitchChange(false)"
					src="@/assets/romimg/personal/switch_open.png"
				/>
				<img
					v-else
					@click="onAnimSwitchChange(true)"
					src="@/assets/romimg/personal/switch_close.png"
				/>
			</div>
		</div>
		<div class="exit-warp" @click="onClickExitLogin">{{ t('menu.logout') }}</div>
	</div>
</template>

<style lang="scss">
#personal-info {
	box-sizing: border-box;
	width: 750px;
	.row-wrap {
		width: 690px;
		height: 120px;
		margin: auto;

		border-bottom: 1px solid #2d2d67;
		justify-content: space-between;
		display: flex;
		align-items: center;
		.copy {
			border-radius: 8px;
			border: 1px solid #2d2d67;
			background: #181a31;
			color: #b4b8cd;
			font-size: 24px;
			font-style: normal;
			font-weight: 500;
			line-height: 48px;
			height: 48px;

			padding-left: 20px;
			padding-right: 20px;
			margin-left: 20px;
		}
		.label {
			display: flex;
			color: #cfd0d3;
			font-size: 26px;
			font-style: normal;
			font-weight: 400;
			text-transform: uppercase;
		}
		.value {
			display: flex;
			justify-content: center;
			align-items: center;

			color: #46495f;
			text-align: right;
			font-size: 24px;
			font-style: normal;
			font-weight: 400;

			span {
				color: #e3f1f6;
				font-size: 30px;
				margin-left: 10px;
			}
			.head {
				width: 64px;
				height: 64px;
				border-radius: 20px;
				margin-right: 10px;
			}
		}
	}
	.switch-wrap {
		width: 690px;
		height: 120px;
		margin: auto;

		display: flex;
		align-items: center;
		justify-content: start;
		.switch-item {
			color: #2ae1bc;
			font-size: 30px;
			font-style: normal;
			font-weight: 400;
			line-height: 48px;
			margin-right: 50px;
			img {
				width: 92px;
				height: 48px;
				vertical-align: middle;
				margin-left: 20px;
			}
		}
	}
	.exit-warp {
		margin: auto;
		margin-top: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 690px;
		height: 108px;

		color: #cfcee8;

		font-size: 26px;
		font-style: normal;
		font-weight: 700;

		border-radius: 8px;
		background: #3a34b0;
	}
}
</style>
