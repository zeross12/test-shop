<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import Notice from "@/components/pc/home/Notice.vue";
import Banner from "@/components/pc/home/Banner.vue";
import HomeList from "@/components/pc/home/HomeList.vue";
import GlobalData from "@/components/pc/home/GlobalData.vue";
components: {
	Notice, Banner, HomeList, GlobalData;
}
</script>

<template>
	<div class="pc-home-wrap">
		<div class="pc-home-bg">

		</div>
		<div class="pc-home-bg bg-2">

		</div>
		<div class="pc-home-bg bg-3">

		</div>
		<div class="home-top-wrap">
			<Notice></Notice>
			<Banner />
		</div>
		<HomeList />
	</div>
</template>

<style lang="scss" scoped>
.pc-home-wrap {
	// background: url('@/assets/romimg/spring/bg.png') no-repeat center top, #270204;
	background-size: 100%;
	// padding-bottom: 50px;
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;

	.pc-home-bg {
		position: absolute;
		inset: 0;
		background-image: url("@/assets/pcimg/home/bg_main.png");
		background-repeat: no-repeat;
		top: 10%;
		z-index: 1;

		&.bg-2 {
			top: 50%;
			left: 80%;
			background-image: url("@/assets/pcimg/home/bg_main2.png");
		}

		&.bg-3 {
			top: 90%;
		}

		// transform: translateX(-8%);
		// background-position: 30% 40%;
		@media screen and (max-width: 768px) {
			// bottom: -1000px;
			// background-size: cover;
			top: 400px;
			background-size: 400px;
		}
	}

	.home-top-wrap {
		width: 100%;
		padding-top: 0px;
		padding-bottom: 24px;
		position: relative;
		z-index: 0;

		#recordswiper {
			margin-top: 10px;
		}

		#bannerswiper {
			margin-top: 5px;
		}
	}
}
</style>
