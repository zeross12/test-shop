<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from 'vue';

const list = ref([]);
const showDetail = ref(false);
const detailItem = ref({});

function onClickItem(item) {
	detailItem.value = item;
	showDetail.value = true;
}
function onClickBack() {
	showDetail.value = false;
}
</script>
			
<template>
	<div id="study" v-if="!showDetail">
		<div class="study_main">
			<div class="study_item" v-for="(item) in list" :key="item.id" @click="onClickItem(item)">
				<div class="top">{{ item.subject }}<i></i></div>
			</div>
		</div>
	</div>
	<div id="study_item_details" v-else>
		<div class="top">{{ detailItem.subject }}<div class="btn_return" @click="onClickBack"><i></i></div>
		</div>
		<div class="bottom">
			<div class="ql-snow">
				<div class="ql-editor" v-html="detailItem.content">
				</div>
			</div>
		</div>
	</div>
</template>
			
<style lang="scss" scoped>
#study {
	box-sizing: border-box;
	color: #fff;

	.study_main {
		.study_item {
			position: relative;
			width: 100%;
			margin-bottom: 20px;
			z-index: 2;

			.top {
				width: 100%;
				height: 54px;
				background: rgba($color: #FBFA02, $alpha: .2);
				line-height: 54px;
				padding: 0 20px;
				box-sizing: border-box;
				position: relative;
				color: #FBFA02;
				i {
					position: absolute;
					display: block;
					width: 20px;
					height: 12px;
					background: url(@/assets/romimg/help/arrow.png) no-repeat center;
					background-size: contain;
					right: 20px;
					top: 20px;
					transition: .2s;
					transform: rotate(90deg);
				}
			}
		}
	}
}

#study_item_details {
	&::-webkit-scrollbar {
	width: 0px;
	}
	.top {
		width: 100%;
		height: 54px;
		line-height: 54px;
		padding: 0 20px;
		box-sizing: border-box;
		position: relative;
		color: #FBFA02;
		text-align: center;

		.btn_return {
			position: absolute;
			display: flex;
			justify-content: center;
			align-items: center;
			box-sizing: border-box;
			width: 100px;
			height: 50px;
			left: 20px;
			top: 0;
			padding-right: 60px;

			i {
				display: block;
				background: url(@/assets/romimg/help/back.png) no-repeat center;
				background-size: contain;
				width: 16px;
				height: 25px;
				transform: rotate(-180deg);
			}
		}
	}

	.bottom {
		position: relative;
		width: 100%;
		height: calc(100% - 54px);

		&::after {
			display: block;
			position: absolute;
			content: '';
			width: calc(100% - 40px);
			height: 4px;
			border-bottom: 1px solid #FBFA02;
			left: 20px;
			top: 0;
		}

		.ql-editor {
			color: #fff;

			img {
				max-width: 100%;
				text-align: center;
			}
		}
	}
}
</style>