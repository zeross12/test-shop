<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from 'vue';
const list = ref([ 
]);

const activeIndex = ref(-1);

function onClickItem(item, index) {
	if (activeIndex.value == index) {
		activeIndex.value = -1;
	} else {
		activeIndex.value = index;
	}
}

</script>
			
<template>
	<div id="problem">
		<div class="problem_wrap">
			<div class="problem_item" v-for="(item, index) in list" :key="index" @click="onClickItem(item, index)">
				<div class="top">
					<img v-if="index == activeIndex" src="@/assets/romimg/help/icon_down.png" alt="" />
					<img v-else src="@/assets/romimg/help/icon_up.png" alt="" />
					{{ item.subject }}
				</div>
				<div class="problem_item_details" v-if="index == activeIndex">
					<div class="bottom">
						<div class="ql-snow">
							<div class="ql-editor" v-html="item.content">
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
			
<style lang="scss" scoped>
#problem {
	box-sizing: border-box;
	color: #fff;
	width: 100%;

	&::-webkit-scrollbar {
		width: 0px;
	}

	.problem_wrap {
		width: 100%;

		.problem_item {
			position: relative;
			width: 612px;
			margin-bottom: 20px;
			z-index: 2;

			.top {
				display: flex;
				align-items: center;
				width: 100%;
				height: 100px;
				background: rgba($color: #FBFA02, $alpha: .2);
				line-height: 100px;
				padding: 0 36px;
				box-sizing: border-box;
				position: relative;
				color: #FBFA02;
				font-size: 24px;

				img {
					width: 50px;
					height: 50px;
					margin-right: 23px;
				}
			}

			.problem_item_details {
				&::-webkit-scrollbar {
					width: 0px;
				}

				.bottom {
					position: relative;
					width: 100%;

					.ql-editor {
						color: #fff;

						img {
							max-width: 100%;
							text-align: center;
						}
					}
				}
			}
		}
	}
}
</style>