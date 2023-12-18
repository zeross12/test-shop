<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
const router = useRouter();
const route = useRoute();
const store = useStore();

onMounted(() => {});

function close() {
	store.commit("setActivityDialogVisible", false);
}

function onClickDetail() {
	store.commit("setActivityDialogVisible", false);
	router.push("/m/activity");
}
</script>

<template>
	<div
		id="new-year-dialog-wrap"
		:class="{
			active: false && route.name != 'm_activity',
		}"
	>
		<div class="new-year-dialog" @click="onClickDetail">
			<div class="close" @click.stop="close"></div>
		</div>
	</div>
</template>

<style lang="scss">
#new-year-dialog-wrap {
	position: fixed;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: rgba($color: #000000, $alpha: 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: -1;
	opacity: 0;
	color: #fff;

	&.active {
		z-index: 202;
		opacity: 1;
	}

	.new-year-dialog {
		width: 750px;
		height: 693px;
		background: url(@/assets/romimg/activity/bg5.png) no-repeat center;
		background-size: contain;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: flex-end;

		.close {
			position: absolute;
			width: 60px;
			height: 60px;
			right: 65px;
			top: 20px;

			img {
				width: 100%;
				height: 100%;
			}
		}

		.detail {
			margin-bottom: 55px;
			width: 433px;
			height: 100px;
		}
	}
}
</style>
