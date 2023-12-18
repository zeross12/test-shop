<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "@vue/reactivity";
import { useStore } from "vuex";
import { getBannerList } from "@/network/api/index";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import useClipboard from "vue-clipboard3";

const { toClipboard } = useClipboard();

const store = useStore();
const router = useRouter();
const banner = ref([]);

onMounted(() => {
	getBanner();
});

async function getBanner() {
	const res = await getBannerList({
		type: "BlindBox",
		platformId: store.state.platformId,
	});
	if (res.code === 0 && res.data.items.length > 0) {
		let items = res.data.items;
		items.sort((a, b) => a.sort - b.sort);
		banner.value = items;
	}
}

function onClickOpen(url) {
	if (!url) return;
	if (url == "activity") {
		router.push("/m/activity");
		return;
	} else if (url.startsWith("copytext")) {
		let textArr = url.split("//");
		window.$dev && console.log(url, textArr);
		if (textArr[1]) {
			copy(textArr[1]);
		}
		return;
	}
	window.open(url, "_self");
}

async function copy(value) {
	try {
		await toClipboard(value);
		Notify( $t( common.copySuccess ) );
	} catch (e) {
		NotifyF( $t( common.copyFail ) );
	}
}
</script>

<template>
	<div id="bannerswiper">
		<van-swipe :indicator-dots="true" :autoplay="3000" indicator-color="white">
			<van-swipe-item v-for="(item, index) in banner" :key="index"
				><img :src="item.image" alt="" @click="onClickOpen(item.url)" />
			</van-swipe-item>
		</van-swipe>
		<!-- <div class="banner-mask"></div> -->
	</div>
</template>

<style lang="scss">
#bannerswiper {
	width: 750px;
	height: 420px;
	margin: auto;
	overflow: hidden;
	box-sizing: border-box;
	position: relative;

	.van-swipe {
		width: 750px;
		height: 350px;
		// overflow: hidden;
		padding: 0% 10px;
		overflow: visible;
		img {
			border-radius: 16px;
			width: 730px;
			height: 350px;
		}
	}

	.van-swipe__indicators {
		bottom: -45px !important;
		position: absolute !important;
		z-index: 1000 !important;
		.van-swipe__indicator {
			width: 12px !important;
			height: 12px !important;
			background-color: transparent;
			border: 1px solid #cccccc;
			margin: auto 5px;
		}
		.van-swipe__indicator--active {
			background-color: #cccccc !important;
		}
	}
}
</style>
