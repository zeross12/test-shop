<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { getArticleList } from '@/network/api/index';
const store = useStore()
const infoText = ref('');

onMounted(() => {
	getArticle();
})
async function getArticle() {
	let channelCode = localStorage.getItem('channelCode');
	if (!channelCode) {
		channelCode = 'DEFAULT'
	}
	let type = channelCode + '_HelpContact'
	const res = await getArticleList({ type: type, platformId: store.state.platformId });
	if (res.code === 0) {
		let items = res.data.items;
		if (items.length > 0) {
			items.sort((a, b) => (a.sort - b.sort));
			infoText.value = items[0].content;
		}
	}
}

function openWechat() {
	if (navigator.userAgent.indexOf('UCBrowser') > -1) {
		alert("UC浏览器暂不支持跳转,请更换浏览器")
	} else {
		window.location.href = 'weixin://'
	}

}
function openDouyin() {

}
</script>
		
<template>
	<div id="contact">
		<div class="contact-main">
			<div class="ql-snow">
				<div class="ql-editor" v-html="infoText">
				</div>
			</div>
		</div>
	</div>
</template>
		
<style lang="scss" scoped>
#contact {
	.contact-main {
		color: #fff;
	}
}
</style>