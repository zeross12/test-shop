<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import Notice from "@/components/h5/home/Notice.vue";
import RecordSwiper from "@/components/h5/home/RecordSwiper.vue";
import Banner from "@/components/h5/home/Banner.vue";
import HomeList from "@/components/h5/home/HomeList.vue";
import TimeCountDown from "@/views/h5/timebox/TimeCountDown.vue";
import SpringTimeBox from "@/views/h5/timebox/SpringTimeBox.vue";
import TimeBoxSwiper from "@/components/h5/home/TimeBoxSwiper.vue";
components: {
	Notice, RecordSwiper, Banner, HomeList;
}
</script>

<template>
	<div class="home-wrap">
		<div class="home-bg"></div>
		<div class="home-top-wrap">
			<RecordSwiper></RecordSwiper>
			<Notice></Notice>
			<!-- <TimeBoxSwiper></TimeBoxSwiper> -->

			<Banner />
			<!-- <SpringTimeBox /> -->
		</div>
		<HomeList />
		<!-- <TimeCountDown /> -->
	</div>
</template>

<style lang="scss" scoped>
.home-wrap {
	// background: #10271f;
	background-size: 100%;
	padding-bottom: 50px;
	position: relative;

	.home-bg {
		// background: url('@/assets/romimg/base_back.png') no-repeat center top;
		// background-size: 100%;
		position: absolute;
		height: 1135px;
		width: 750px;
	}
	.home-top-wrap {
		width: 750px;
		// padding-top: 0px;
		//padding-bottom: 24px;
		position: relative;

		#recordswiper {
			// margin-top: 12px;
		}

		#bannerswiper {
			margin-top: 5px;
		}
	}
}
</style>
