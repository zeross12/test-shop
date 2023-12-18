<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "@vue/reactivity";
import { useStore } from "vuex";
import { onMounted } from "vue";

const store = useStore();

onMounted(() => {});
</script>

<template>
	<div id="pc-global-data">
		<div class="box">
			<div class="logo-image">
				<img src="@/assets/pcimg/home/logo1.png" alt="" />
			</div>
			<div class="open-box-number">
				<div>466666</div>
				<div class="desc">{{ t( 'footer.openedBoxs' ) }}</div>
			</div>
			<div class="play-number">
				<div>466666</div>
				<div class="desc">{{ t( 'common.users' ) }}</div>
			</div>
			<div class="online-number">
				<div>466666</div>
				<div class="desc">{{ t( 'common.online' ) }}</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#pc-global-data {
	width: 100%;
	height: 234px;
	background-color: #101120;

	.box {
		height: 234px;
		width: 100%;
		display: flex;
		justify-content: space-around;
		color: #cbccd6;
		font-size: 38px;
		.logo-image {
			width: 290px;
			background: url(@/assets/pcimg/home/logo_bg.png) no-repeat center;
			display: flex;
			justify-content: center;
			align-items: center;
			img {
				width: 173px;
				height: 97px;
			}
		}
		.open-box-number {
			width: 290px;
			background: url(@/assets/pcimg/home/open-box-number-bg.png) no-repeat;
			background-position: top 53px left -10px;
			display: flex;
			justify-content: center;
			flex-direction: column;
			align-items: left;
			padding-left: 80px;
			box-sizing: border-box;
			padding-top: 10px;
		}
		.desc {
			font-size: 12px;
			color: #4f5165;
		}

		.play-number {
			width: 290px;
			background: url(@/assets/pcimg/home/play-number-bg.png) no-repeat;
			background-position: top 30px left -10px;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: left;
			padding-left: 90px;
			box-sizing: border-box;
			padding-top: 10px;
		}

		.online-number {
			width: 290px;
			background: url(@/assets/pcimg/home/online-number-bg.png) no-repeat;
			background-position: top 60px left 15px;
			display: flex;
			justify-content: center;
			flex-direction: column;
			align-items: left;
			padding-left: 110px;
			box-sizing: border-box;
			padding-top: 10px;
		}
	}
}
</style>
