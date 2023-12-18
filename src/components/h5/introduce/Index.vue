<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useStore } from "vuex"

const store = useStore();
const howPlay = store.state.howPlay;

function onClickClose() {
	let data = {
		show: false,
		html: "",
	};
	store.commit("setHowPlay", data);
}
</script>

<template>
	<div id="introduce" :class="{ active: howPlay.show }">
		<div class="introduce-wrap">
			<div class="introduce-title">{{ t( 'common.gameIntroduction' ) }}</div>
			<div class="close" @click="onClickClose()">
				<img src="@/assets/romimg/sign/close.png" alt="" />
			</div>
			<div class="introduce-content" v-html="howPlay.html"></div>
		</div>
	</div>
</template>

<style lang="scss">
#introduce {
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	box-sizing: border-box;
	background-color: rgba($color: #000000, $alpha: 0.6);
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	transition: 0.3s;
	z-index: -1;
	opacity: 0;

	.introduce-wrap {
		position: relative;
		background: url(@/assets/romimg/sign/back.png) no-repeat center;
		background-size: contain;
		width: 561px;
		height: 839px;

		.introduce-title {
			position: absolute;
			color: #fbfa02;

			font-size: 30px;
			left: 60px;
			top: 54px;
			border-bottom: 1px solid #fbfa02;
		}

		.close {
			width: 60px;
			height: 60px;
			position: absolute;
			right: -65px;
			top: -60px;

			img {
				width: 100%;
				height: 100%;
			}
		}

		.introduce-content {
			width: 430px;
			height: 650px;
			margin: 120px auto 0;
			overflow-y: auto;
			color: #fff;
		}
	}

	&.active {
		z-index: 999;
		opacity: 1;
	}
}
</style>
