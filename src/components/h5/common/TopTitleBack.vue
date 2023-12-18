<script setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
let props = defineProps({
	title: { type: String, default: "" },
	handler: { type: Function, default: undefined },
	url: { type: String, default: "" },
});
function back() {
	if (route.name == "m_my_battle_history" || route.name == "m_battle_history") {
		router.replace("/m/battle/list");
	} else if (props.url !== "") router.push(props.url);
	else router.go(-1);
}
onMounted(() => {});
</script>

<template>
	<div id="toptitleback" class="toptitleback">
		<div class="back-wrap">
			<span class="icon iconfont" @click="back()">&#xe61e;</span>
		</div>
		<div class="top-title-wrap" v-if="props.title != ''">
			{{ props.title }}
		</div>
		<div class="top-title-wrap" v-else>
			{{ route.meta.name }}
		</div>
		<div class="right-wrap">
			<img
				src="@/assets/romimg/grade/question.png"
				alt=""
				class="help"
				:class="{ show: props.handler != undefined }"
				@click="props.handler"
			/>
		</div>
	</div>
</template>

<style lang="scss">
#toptitleback {
	&.toptitleback {
		background: url(@/assets/romimg/common/top-title-back-bg.png) no-repeat
			center;
		background-size: contain;

		width: 750px;
		height: 120px;
		padding: 0 60px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		.back-wrap {
			span {
				color: #e2e2e2;
				font-size: 36px;
			}
		}
		// background: #111324;
		.top-title-wrap {
			color: #fff;
			text-align: center;

			font-size: 36px;
			font-style: normal;
			font-weight: 400;
			text-transform: uppercase;
		}

		.right-wrap {
			.help {
				width: 36px;
				height: 36px;
				display: none;
				&.show {
					display: block;
				}
			}
		}
	}
}
</style>
