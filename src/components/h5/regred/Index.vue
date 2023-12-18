<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { computed } from "@vue/runtime-core";
import { useStore } from "vuex";
import { onMounted } from "vue";
import { openRedPacket } from "@/network/api/redpacket";
import Currency from "../common/Currency.vue";
import { useRouter, useRoute } from "vue-router";

const store = useStore();
const route = useRoute();
const router = useRouter();
const regPacket = computed(() => store.state.regPacket);
const hasLogin = computed(() => store.getters.hasLogin);
const hasRegisterPacket = computed(() => store.state.hasRegisterPacket);

function setRed(data) {
	store.commit("setRegPacket", data);
}

function close() {
	setRed({
		closeRed: false,
		openRed: false,
		leftSmall: true,
		money: 0,
	});
}

async function openPacket() {
	if (hasLogin.value) {
		let res = await openRedPacket({ id: 1 });
		if (res.code == 0) {
			setRed({
				closeRed: false,
				openRed: true,
				leftSmall: false,
				money: res.data.amount,
			});
		} else {
			setRed({
				closeRed: false,
				openRed: false,
				leftSmall: false,
				money: 0,
			});
		}
	} else {
		setRed({
			closeRed: false,
			openRed: false,
			leftSmall: false,
			money: 0,
		});
		// store.commit("setRegisterView", true);
		router.push("/m/register");
	}
}

function closeView() {
	setRed({
		closeRed: false,
		openRed: false,
		leftSmall: false,
		money: 0,
	});
	store.dispatch("getUserInfo");
	store.commit("setSwitchNotice", true);
}

const noNeedShow = ["m_register", "m_sign", "m_forgetPW"];
//导航||返回
function isback() {
	return noNeedShow.includes(route.name);
}

function show() {
	if (isback()) {
		return;
	}
	let showView = false;
	window.$dev && console.log("route", route.name);

	if (!hasLogin.value || hasRegisterPacket.value) showView = true;
	setRed({
		closeRed: showView,
		openRed: false,
		leftSmall: false,
		money: 0,
	});
}

onMounted(() => {
	setTimeout(() => {
		show();
	}, 300);
});
</script>

<template>
	<div id="h5-reg-parket">
		<div class="reg-parket-wrap" :class="{ active: regPacket.closeRed }">
			<div class="no-pk-pic">
				<div class="close" @click="close"></div>
				<div class="no-pk-btn" @click="openPacket"></div>
			</div>
		</div>

		<div class="reg-parket-wrap" :class="{ active: regPacket.openRed }">
			<div class="open-pk-pic">
				<div class="red-amount">
					<Currency
						fontcolor="white"
						:currency="regPacket.money"
						:fontsize="24"
					></Currency>
				</div>
				<div class="open-btn" @click="closeView"></div>
			</div>
		</div>

		<div
			class="h5-reg-left-Small"
			:class="{ active: regPacket.leftSmall }"
			@click="show"
		></div>
	</div>
</template>

<style lang="scss">
#h5-reg-parket {
	.reg-parket-wrap {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba($color: #000000, $alpha: 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: -1;
		opacity: 0;
		color: #fff;

		&.active {
			z-index: 202;
			opacity: 1;
		}

		.no-pk-pic {
			width: 520px;
			height: 790px;
			background: url(@/assets/romimg/regred/center_reg.png) no-repeat center;
			background-size: 100% 100%;
			position: relative;

			.close {
				position: absolute;
				width: 50px;
				height: 50px;
				right: 0px;
				top: 0px;
				cursor: pointer;

				img {
					width: 100%;
					height: 100%;
				}
			}

			.no-pk-btn {
				width: 360px;
				height: 100px;
				margin: 580px auto 0;
				cursor: pointer;
			}
		}

		.open-pk-pic {
			width: 520px;
			height: 790px;
			background: url(@/assets/romimg/regred/open.png) no-repeat center;
			background-size: 100% 100%;
			position: relative;

			.red-amount {
				display: flex;
				justify-content: center;
				margin: 500px auto 0;
				color: #e9c529;

				padding-left: 35px;
				font-size: 48px;
				font-style: normal;
				font-weight: 700;
			}

			.open-btn {
				width: 50px;
				height: 50px;
				cursor: pointer;
				position: absolute;
				top: 0;
				right: 0;
			}
		}
	}

	.h5-reg-left-Small {
		width: 220px;
		height: 334px;
		background: url(@/assets/pcimg/regred/center_reg.png) no-repeat center;
		background-size: contain;
		position: fixed;
		left: 0;
		bottom: 10px;
		z-index: -1;
		opacity: 0;
		transition: 0.3s;
		transform: scale(0.8);

		&.active {
			opacity: 1;
			z-index: 100;
		}
	}
}
</style>
