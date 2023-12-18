<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import {	useRouter } from "vue-router";
const router = useRouter();

function jumpRoute(v) {
	router.push(v)
}
</script>

<template>
	<div id="ammon-box-card-wrap">
		<div class="card-item" @click="jumpRoute('/m/ammonbox')">
			<img src="@/assets/romimg/card/tab_box.png" alt="" />
		</div>
		<div class="card-item" @click="jumpRoute('/m/ammoncard')">
			<img src="@/assets/romimg/card/tab_card.png" alt="" />
		</div>
	</div>
</template>

<style lang="scss">
#ammon-box-card-wrap {
	box-sizing: border-box;
	width: 750px;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	.card-item {
		width: 611px;
		height: 228px;
		margin: 32px 0;

		img {
			width: 611px;
		}

	}

}
</style>
