<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted } from 'vue'

const props = defineProps(['list']);

///	历史爆点
const historyBoomArr = ref([])

onMounted(() => {

})

</script>

<template>
	<div class="pc-crash-list">
		<div class="user-item">
			<!-- <div class="eyes">
								<img src="@/assets/pcimg/crash/eye.png">
						</div> -->
			<div class="user-item-container">
				<div class="user-head">
					<img src="http://dummyimage.com/80x90">
					<div class="watcher">65</div>
					<!-- <div class="item-pic">
												<img src="">
										</div> -->
				</div>
				<div class="bet-container">
					<img src="@/assets/pcimg/crash/gold.png" />
					<p>11.00</p>
				</div>
				<div class="times-container">5.00x</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.pc-crash-list {
	top: 50px;
	position: absolute;
	/* 使用绝对定位 */
	display: flex;
	width: 195.21px;
	height: 40.97px;
	padding: 1.55px 7.81px;
	justify-content: center;
	align-items: center;
	border-radius: 4.8px;
	opacity: 0.7605;
	background: #2D5347;

	.user-item {
		width: 100%;
		height: 46px;
		// border: 1px solid red;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		position: relative;
		justify-content: flex-end;

		.user-item-container {
			// width: 332px;
			// height: 100%;
			display: flex;
			box-sizing: border-box;
			// padding: 0 8px 0 18px;
			align-items: center;
			position: relative;
			justify-content: space-between;
			// background: #31353D;
			border-radius: 4.8px;

			.times-container {
				width: 64px;
				height: 27.5px;
				display: flex;
				align-items: center;
				justify-content: center;
				box-sizing: border-box;
				// border: 1px solid yellow;
				color: #00C74D;
				text-align: center;

				font-size: 14.055px;
				font-style: normal;
				font-weight: 700;
				line-height: 21.6px;
				/* 153.681% */
				border-radius: 3.2px;
				background: #262A30;
			}

			.bet-container {
				display: flex;
				justify-content: center;
				/* 水平居中 */
				align-items: center;
				/* 垂直居中 */
				width: 87px;
				// border: 1px solid red;
				height: 20px;
				box-sizing: border-box;
				gap: 5px;

				img {
					width: 16.8px;
					height: 16.8px;
				}

				p {
					color: #8E8E99;

					font-size: 14px;
					font-style: normal;
					font-weight: 400;
					line-height: 14px;
					/* 100% */
				}
			}

			.user-head {
				display: flex;
				align-items: center;
				// width: calc( 36px + 24px + 34px );
				border: 1px solie red;
				box-sizing: border-box;
				gap: 24px;

				.item-pic {
					border: 1px solid red;
					width: 34px;
					height: 26px;

					img {
						border: none;
						border-radius: 0;
					}
				}

				img {
					width: 36px;
					height: 36px;
					box-sizing: border-box;
					border: 4px solid yellow;
					border-radius: 50%;
				}

				.watcher {
					position: absolute;
					border: 1px solid #1D2126;
					box-sizing: border-box;
					width: 18px;
					height: 18px;
					border-radius: 50%;
					bottom: -2px;
					left: -3 px;
					color: #1D2126;
					display: flex;
					align-items: center;
					justify-content: center;

					font-size: 7.375px;
					font-style: normal;
					font-weight: 700;
					background: #fff;
				}

			}
		}

		.eyes {
			display: flex;
			justify-content: center;
			/* 水平居中 */
			align-items: center;
			/* 垂直居中 */
			width: 24px;
			height: 24px;
			border-radius: 50%;
			// border: 1px solid red;
			box-sizing: border-box;
			position: absolute;
			background: #31353D;
			left: 0;
			z-index: 1;

			img {
				width: 14px;
				height: 10px;
			}
		}
	}
}
</style>