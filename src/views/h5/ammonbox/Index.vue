<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import Notice from '@/components/h5/home/Notice.vue';
import RecordSwiper from '@/components/h5/home/RecordSwiper.vue';
import Banner from '@/components/h5/home/Banner.vue';
import AmmonHomeList from '@/components/h5/home/AmmonHomeList.vue';
import TimeCountDown from '@/views/h5/timebox/TimeCountDown.vue';
components: { Notice, RecordSwiper, Banner, AmmonHomeList };

</script>
		
<template>
	 <div class="home-wrap">
			<div class="home-top-wrap">
				 <Notice></Notice>
				 <RecordSwiper></RecordSwiper>
				 <Banner />
			</div>
			<AmmonHomeList />
			<TimeCountDown />
	 </div>
</template>
		
<style lang="scss" scoped>
.home-wrap {
	 // background: url('@/assets/romimg/spring/bg.png') no-repeat center top, #270204;
	 background-size: 100%;
	 padding-bottom: 50px;

	 .home-top-wrap {
			width: 100%;
			padding-top: 0px;
			padding-bottom: 24px;

			#recordswiper {
				 margin-top: 40px;
			}

			#bannerswiper {
				 margin-top: 5px;
			}

	 }
}
</style>