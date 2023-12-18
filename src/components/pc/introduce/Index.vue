<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useStore } from 'vuex';

const store = useStore();
const howPlay = store.state.howPlay;

function onClickClose() {
	let data = {
		show: false,
		html: ''
	}
	store.commit('setHowPlay', data)
}
</script>
		
<template>
	<div id="pc-introduce" :class="{ 'active': howPlay.show }">
		<div class="introduce-wrap">
			<div class="introduce-title">{{ t( 'common.gameIntroduction' ) }}</div>
			<div class="close" @click="onClickClose()"><img src="@/assets/pcimg/common/close.png" alt=""></div>
			<div class="introduce-content" v-html="howPlay.html">
			</div>
		</div>
	</div>
</template>
		
<style lang="scss">
#pc-introduce {
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	box-sizing: border-box;
	background-color: rgba($color: #000000, $alpha: .6);
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	transition: .3s;
	z-index: -1;
	opacity: 0;

	.introduce-wrap {
		display: flex;
		flex-direction: column;
		position: relative;
		width: 590px;
		background: #191C34;

		.introduce-title {
			width: 100%;
			height: 109px;
			display: flex;
			align-items: center;
			padding-left: 70px;
			box-sizing: border-box;
			color: #FFF;
			font-size: 21px;
		}

		.close {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 20px;
			height: 20px;
			position: absolute;
			right: 20px;
			top: 20px;
			cursor: pointer;

			img {
				width: 12px;
				height: 12px;
			}
		}

		.introduce-content {
			width: 100%;
			// height: 431px;
			padding: 40px 60px;
			overflow-y: auto;
			color: #AAACC1;
			font-size: 14px;
			background: #16182E;
			box-sizing: border-box;
		}
	}

	&.active {
		z-index: 999;
		opacity: 1;
	}
}
</style>
		