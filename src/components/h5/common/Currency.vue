<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, watch } from "vue";
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

let props = defineProps({
	currency: { type: [Number, String], default: 0 },
	fontsize: { type: Number, default: 14 },
	hiedPoint: { type: Boolean, default: false },
	fontcolor: { type: String, default: "" },
	hide: { type: Boolean, default: false },
	fontWeight: { type: Number, default: 400 },
	size: { type: String, default: "" },
});

let val1 = ref(0);
let val2 = ref(0);

watch(
	props,
	(newValue, oldValue) => {
		let arr = (Number(props.currency).toFixed(2) + "").split(".");
		if (arr.length == 2) {
			val1.value = arr[0];
			val2.value = arr[1];
		} else {
			val1.value = arr[0];
		}
	},
	{
		immediate: true,
	}
);
</script>

<template>
	<div id="currency-wrap" :class="{ white: fontcolor == 'white', hide_c: hide }">
		<img class="img" :class="{ mini: props.size == 'mini', minis: props.size == 'minis' }"
			src="@/assets/romimg/common/c.png" />
		<!-- <span class="icon iconfont" style="color: unset">&#xe65c;</span> -->
		<div :class="{ fontWeight700: fontWeight == 700 }">
			<span class="span1" :class="{
				font12: fontsize == 12,
				font13: fontsize == 13,
				font24: fontsize == 24,
				font16: fontsize == 16,
			}">{{ val1 }}</span>
			<div v-if="!hiedPoint">
				<span class="span2" :class="{
					font12: fontsize == 12,
					font13: fontsize == 13,
					font24: fontsize == 24,
					font16: fontsize == 16,
				}">.{{ val2 }}</span>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#currency-wrap {

	color: #75dc9e;
	display: flex;
	justify-content: center;
	align-items: center;
	font-style: normal;

	&.white {
		color: #fff;
	}

	&.hide_c {
		img {
			display: none;
		}
	}

	div {
		display: inline-block;
		vertical-align: bottom;
		line-height: unset;

		&.fontWeight700 {
			font-weight: 700;
		}

		.span1 {
			line-height: unset;

			font-size: 28px;

			&.font12 {
				font-size: 24px;
			}

			&.font13 {
				font-size: 26px;
			}

			&.font24 {
				font-size: 48px;
			}

			&.font16 {
				font-size: 32px;
			}
		}

		.span2 {

			font-size: 28px;

			&.font12 {
				font-size: 24px;
			}

			&.font13 {
				font-size: 26px;
			}

			&.font24 {
				font-size: 48px;
			}

			&.font16 {
				font-size: 32px;
			}
		}
	}

	.img {
		width: 32px;
		height: 32px;
		vertical-align: middle;
		margin-right: 10px;
		margin-top: -1px;
		object-fit: contain;

		&.mini {
			width: 28px !important;
			height: 28px !important;
		}

		// &.minis {
		//	 width: 24px !important;
		//	 height: 24px !important;
		// }
	}
}
</style>
