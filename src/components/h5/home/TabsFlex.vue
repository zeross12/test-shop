<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "@vue/reactivity";
import { onMounted, watch } from "vue";
let props = defineProps({
	label: { type: String, default: "" },
	items: {
		type: Array,
		default: [],
	},
	fontsize: {
		type: Number,
		default: 14,
	},
	itemWidth: {
		type: Number,
		default: 0,
	},
	itemHeight: {
		type: Number,
		default: 0,
	},
	paddingTop: {
		type: Number,
		default: 40,
	},
	full: {
		type: Boolean,
		default: false,
	},
	index: {
		type: Number,
		default: 0,
	},
});
let $emit = defineEmits(["tabFlexChangedEvent"]);

let tabIndex = ref(props.index);

function tabChangedEvent(index) {
	tabIndex.value = index;
	$emit("tabFlexChangedEvent", index);
}

onMounted(() => {});
watch(
	() => props.index,
	(newValue, oldValue) => {
		window.$dev && console.log("props.index newValue", newValue);
		tabIndex.value = newValue;
	}
);

// watch(
//	 () => props.items,
//	 (newValue, oldValue) => {
//		 window.$dev && console.log("props.items newValue", newValue);
//		 // if (val.length > 4) {
//		 //	 window.$dev && console.log(12222);
//		 // }
//	 }
// );
</script>

<template>
	<div
		id="tabsFlex"
		class="tabs"
		:class="{
			fontsize14: props.fontsize == 14,
			fontsize16: props.fontsize == 16,
			full: props.full,
			paddingTop20: props.paddingTop == 20,
		}"
	>
		<div class="label" v-if="props.label != ''">{{ props.label }}</div>
		<div
			v-for="(item, index) in props.items"
			:key="index"
			class="tab-item"
			:class="{
				active: tabIndex == index,
				tabWidth108: props.itemWidth == 108,
				tabHeight34: props.itemHeight == 34,
			}"
			@click="tabChangedEvent(index)"
		>
			{{ item }}
		</div>
		<!-- <div
			class="tab-item"
			:class="{ active: tabType == 2 }"
			@click="onClickTab(2)"
		>
			我的房间
		</div> -->
	</div>
</template>

<style lang="scss">
#tabsFlex {
	&.fontsize14 {
		font-size: 28px !important;
		padding: 10px 30px !important;
	}
	&.fontsize16 {
		font-size: 32px !important;
	}
	&.full {
		justify-content: space-between !important;
	}

	&.tabs {
		width: 100%;
		padding: 28px 30px;
		font-size: 32px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-start;
		font-weight: 300;
		box-sizing: border-box;
		background: #111324;
		&.paddingTop20 {
			padding: 20px 30px;
			background: unset;
		}

		.tab-item {
			&.tabWidth108 {
				width: 219px;
			}
			&.tabHeight34 {
				height: 68px !important;
			}

			width: unset;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 80px;
			margin: 8px 5px;
			padding: 0px 14px;
			border-radius: 8px;
			color: #b4b6c8;
			border-radius: 6px;
			border: 1px solid #1e2037;

			&.active {
				background-color: #4a45b1;
				color: #fff;
			}
		}
		.label {
			padding: 0 20px;
			color: #fff;
			font-weight: 300;
			font-size: 32px;
		}
	}
}
</style>
