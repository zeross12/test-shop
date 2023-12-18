<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref, watch } from "vue";
let props = defineProps({
	label: { type: String, default: "" },
	items: {
		type: Array,
		default: [],
	},
	index: {
		type: Number,
		default: 0,
	},
});
let $emit = defineEmits(["tabChangedEvent"]);

const tabIndex = ref( 0 );

function tabChangedEvent(index) {
	tabIndex.value = index;
	$emit("tabChangedEvent", index);
}

onMounted(() => {
	tabIndex.value = props.index;
});

// watch(props, (newValue, oldValue) => {
// 	tabIndex.value = props.index;
// });
</script>

<template>
	<div id="tabs" class="tabs">
		<div class="label" v-if="props.label != ''">{{ props.label }}</div>
		<div
			v-for="(item, index) in props.items"
			:key="index"
			class="tab-item"
			:class="{ active: tabIndex == index }"
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
#tabs {
	// &.flex {
	//	 flex-wrap: wrap;
	//	 line-height: 100px;
	//	 .tab-item {
	//		 width: unset !important;
	//		 margin-right: 20px;
	//		 padding: 0px 30px;
	//	 }
	// }

	&.tabs {
		width: 100%;
		padding: 40px 30px;
		display: flex;
		align-items: center;
		// justify-content: start;
		box-sizing: border-box;
		background: #111324;
		justify-content: space-between;
		// .tab-item:last-child {
		// 	// margin-right: 0px;
		// }
		.tab-item {
			// margin-right: 20px;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			justify-content: center;
			min-width: 212px;
			// min-width: 33%;
			height: 80px;
			border-radius: 6px;
			color: #b4b6c8;
			// border-radius: 6px;
			border: 1px solid #1e2037;
			font-size: 20px;
			padding: 0 12px;
			&.active {
				font-size: 20px;
				border: 1px solid #554bf7;
				color: #fff;
			}
		}
		.label {
			padding: 0 20px;
			color: #fff;
			font-weight: 300;
			font-size: 24px;
		}
	}
}
</style>
