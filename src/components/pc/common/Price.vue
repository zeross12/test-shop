<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
/**
 * example 1 > props :
 * <Price :value="item.price" color="#fff" before-color="#fff" before-size="20px"></Price>
 * 
 * example 2 > slot :
 * <Price>
 * 	<div #before>{{item.price.split( '.' )[0]}}.</div>
 * 	<div #after>{{item.price.split( '.' )[1]}}</div>
 * </Price>
 */
const prop = defineProps({
	value:
	{
		type: [String, Number, Boolean],
		default: false
	},

	color:
	{
		type: String,
	},

	showIcon:
	{
		type: Boolean,
		default: false
	},

	beforeColor:
	{
		type: String,
		// default: '#fff'
	},

	afterColor:
	{
		type: String,
		// default: '#fff'
	},

	beforeSize:
	{
		type: String,
		default: '16px'
	},

	afterSize:
	{
		type: String,
		default: '16px'
	},

	fontWeight:
	{
		type: String,
		default: '400'
	}
})
</script>
<template>
	<div class="price-container">
		<img v-if="showIcon" src="@/assets/pcimg/common/coin.svg"
			:style="{ width: `${beforeSize}`, height: `${beforeSize}` }">
		<div class="prices">
			<div :style="{ color: color ? color : beforeColor, fontWeight: fontWeight, fontSize: beforeSize }">
				{{ prop.value && prop.value.split('.')[0] }}{{ prop.value && prop.value.split('.')[1] ? '.' : '' }}
				<slot name="brefor"></slot>
			</div>
			<div :style="{ color: color ? color : afterColor, fontWeight: fontWeight, fontSize: afterSize }">
				{{ prop.value && prop.value.split('.')[1] }}
				<slot name="after"></slot>
			</div>
		</div>
	</div>
</template>
<style lang="scss" scoped>
.price-container {
	display: flex;
	align-items: center;
	gap: 8px;

	img {
		margin: 0 !important;
	}

	.prices {
		display: flex;
		align-items: baseline;

		div {
			display: flex;
			align-items: baseline;
		}
	}
}
</style>