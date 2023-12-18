<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import Notice from '@/components/pc/home/Notice.vue';
import RecordSwiper from '@/components/pc/home/RecordSwiper.vue';
import Banner from '@/components/pc/home/Banner.vue';
import AmmonHomeList from '@/components/pc/home/AmmonHomeList.vue';
import TimeCountDown from '@/views/pc/timebox/TimeCountDown.vue';
components: { Notice, RecordSwiper, Banner, AmmonHomeList };

</script>
		
<template>
	 <div class="pc-home-wrap">
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
.pc-home-wrap {
	 // background: url('@/assets/romimg/spring/bg.png') no-repeat center top, #270204;
	 background-size: 100%;
	 padding-bottom: 50px;
	 display: flex;
	 flex-direction: column;
	 align-items: center;
	 .home-top-wrap {
			width: 100%;
			padding-top: 0px;
			padding-bottom: 24px;

			#recordswiper {
				 margin-top: 10px;
			}

			#bannerswiper {
				 margin-top: 5px;
			}

	 }
}
</style>