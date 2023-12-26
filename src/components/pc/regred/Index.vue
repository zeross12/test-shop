<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { computed } from "@vue/runtime-core";
import { useStore } from "vuex";
import { onMounted } from "vue";
import { openRedPacket } from "@/network/api/redpacket";
import { routeLocationKey } from "vue-router";
import { useRouter, useRoute } from "vue-router";
const route = useRoute();
const store = useStore();
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
		store.commit("setSignViewTab", 2);
		store.commit("setSignView", true);
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

function show() {
	let showView = false;
	// window.$dev && console.log("route", route.name);
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
	<div id="pc-reg-parket">
		<!-- <div class="reg-parket-wrap" :class="{ active: regPacket.closeRed }">
			<div class="no-pk-pic">
				<div class="close" @click="close"></div>
				<div class="no-pk-btn" @click="openPacket"></div>
			</div>
		</div> -->

		<div class="reg-parket-wrap" :class="{ active: regPacket.openRed }">
			<div class="open-pk-pic">
				<div class="red-amount">
					<img src="@/assets/pcimg/common/coin.svg">
					{{ regPacket.money }}
				</div>
				<div class="open-btn" @click="closeView"></div>
			</div>
		</div>

		<div class="pc-reg-left-Small" :class="{ active: regPacket.leftSmall }" @click="show"></div>
	</div>
</template>

<style lang="scss">
#pc-reg-parket {
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
			width: 345px;
			height: 526px;
			background: url(@/assets/pcimg/regred/center_reg.png) no-repeat center;
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
				width: 245px;
				height: 120px;
				margin: 360px auto 0;
				cursor: pointer;
			}
		}

		.open-pk-pic {
			width: 345px;
			height: 526px;
			background: url(@/assets/pcimg/regred/open.png) no-repeat center;
			background-size: 100% 100%;
			position: relative;

			.red-amount {
				display: flex;
				justify-content: center;
				margin-top: 168px;
				color: #E58123;
				// padding-left: 35px;
				font-size: 36px;
				font-style: normal;
				font-weight: 700;
				width: 100%;
				box-sizing: border-box;
				align-items: center;
				gap: 6px;

				img {
					width: 32px;
					height: 32px;
				}
			}

			.open-btn {
				width: 250px;
				height: 62px;
				cursor: pointer;
				position: absolute;
				bottom: 103px;
				// right: 0;
				left: calc(50% - 258px / 2);
				// border: 1px solid red;
				border-radius: 60px;
				opacity: 0;
			}

			// .open-btn {
			//	 width: 50px;
			//	 height: 50px;
			//	 cursor: pointer;
			//	 position: absolute;
			//	 top: 0;
			//	 right: 0;
			// }
		}
	}

	// .pc-reg-left-Small {
	// 	width: 172px;
	// 	height: 263px;
	// 	background: url(@/assets/pcimg/regred/center_reg.png) no-repeat center;
	// 	background-size: contain;
	// 	position: fixed;
	// 	left: 0;
	// 	bottom: 10px;
	// 	z-index: -1;
	// 	opacity: 0;
	// 	transition: 0.3s;
	// 	transform: scale(0.8);

	// 	&.active {
	// 		opacity: 1;
	// 		z-index: 100;
	// 	}
	// }
}
</style>
