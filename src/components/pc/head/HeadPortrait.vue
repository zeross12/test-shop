<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import defaultIcon from '@/assets/romimg/common/defaultIcon.png'
import anchorImgUrl from '@/assets/pcimg/battle/tv.png';
const props = defineProps(['userModel', 'size', 'hideFrame']);

function changeMyClass() {
	let val = props.size;
	return val;
}

function hasFrame() {
	return (props.userModel.avaterFrame != 0 && props.userModel.avaterFrame != undefined);
}
</script>
<template>
	<div :class="changeMyClass()">
		<img class="icon_img" :src="props.userModel.avater || defaultIcon" :style="hasFrame() ? 'border:none' : ''" alt="">
		<img v-show="hasFrame() && !props.hideFrame" class="icon_img_bg" :src="props.userModel.avaterFrame" alt="">
		<img v-if="props.userModel.isAnchor" class="tv-flag" :src="anchorImgUrl" />
	</div>
</template>
		
<style lang="scss" scoped>
.pc-home-header {
	width: 46px;
	height: 46px;
	position: relative;

	.icon_img {
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 6px;
		overflow: hidden;
		box-sizing: border-box;
	}

	.icon_img_bg {
		position: absolute;
		width: 180%;
		height: 180%;
		transform: translate(-22%, -22%)
	}
}

.pc-openbox-header {
	width: 35px;
	height: 35px;
	position: relative;

	.icon_img {
		width: 100%;
		height: 100%;
		border-radius: 5px;
		overflow: hidden;
		box-sizing: border-box;
	}

	.icon_img_bg {
		position: absolute;
		width: 180%;
		height: 180%;
		transform: translate(-49px, -22%)
	}
}

.pc-roll-player {
	width: 74px;
	height: 74px;
	position: relative;

	.icon_img {
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 8px;
		overflow: hidden;
		box-sizing: border-box;
	}

	.icon_img_bg {
		position: absolute;
		width: 185%;
		height: 185%;
		transform: translate(-23%, -23%)
	}
}

.pc-me-header {
	width: 130px;
	height: 130px;
	position: relative;

	.icon_img {
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 20px;
		overflow: hidden;
		box-sizing: border-box;
	}

	.icon_img_bg {
		position: absolute;
		width: 180%;
		height: 180%;
		transform: translate(-22%, -22%)
	}
}

.pc-battle-header {
	width: 64px;
	height: 64px;
	position: relative;
	border-radius: 100%;
	overflow: hidden;

	.icon_img {
		width: 100%;
		height: 100%;
		border-radius: 6px;
		overflow: hidden;
		box-sizing: border-box;
	}

	.icon_img_bg {
		position: absolute;
		width: 180%;
		height: 180%;
		transform: translate(-65px, -22%)
	}

	.tv-flag {
		position: absolute;
		width: 18px;
		height: 18px;
		left: -5px;
		bottom: -5px;
	}
}

.pc-battle-header-small {
	width: 30px;
	height: 30px;
	position: relative;

	.icon_img {
		width: 100%;
		height: 100%;
		border-radius: 6px;
		overflow: hidden;
		box-sizing: border-box;
	}

	.icon_img_bg {
		position: absolute;
		width: 180%;
		height: 180%;
		transform: translate(-65px, -22%)
	}

	.tv-flag {
		position: absolute;
		width: 18px;
		height: 18px;
		left: -5px;
		bottom: -5px;
	}
}

.pc-battle-big-header {
	width: 97px;
	height: 97px;
	position: relative;

	.icon_img {
		width: 100%;
		height: 100%;
		border-radius: 14px;
		overflow: hidden;
		box-sizing: border-box;
	}

	.icon_img_bg {
		position: absolute;
		width: 180%;
		height: 180%;
		transform: translate(-137px, -22%)
	}
}

.pc-battleDetail-header {
	width: 20px;
	height: 20px;
	position: relative;

	.icon_img {
		position: absolute;
		left: 0;
		border-radius: 5px;
		width: 100%;
		height: 100%
	}

	.icon_img_bg {
		position: absolute;
		position: absolute;
		width: 180%;
		height: 180%;
		transform: translate(-22%, -22%)
	}
}
</style>