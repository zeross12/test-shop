<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import CrashList from '@/components/crash/CrashList.vue'

const getRandomPositionStyle = () => {
	const randomLeft = Math.floor(Math.random() * 200); // 范围内的左偏移
	const randomTop = Math.floor(Math.random() * 100); // 范围内的上偏移

	return {
		left: `${randomLeft}px`,
		top: `${randomTop}px`
	};
};
</script>

<template>
	<div class="crash-body">
		<div class="crash-header">
			<div class="crash-header-item wanted">
				<div class="wanted-text">
					<p>20,000</p>
					<span>{{ t('crash.curOnList') }} 3000+</span>
				</div>
			</div>
			<div class="crash-header-item token">
				<div class="token-text">
					<p>Tokenmania</p>
				</div>
			</div>
		</div>
		<div class="crash-history">
			<div class="history-item" :class="[{ 'green': false }, { 'gold': false }]" v-for="item in 10" :key="item">1.58
			</div>
		</div>
		<div class="bet-box">
			<div class="bet-wrap" v-show="true">
				<div class="bet-title">{{ t('lucky.nextRound') }}...</div>
				<div class="next-round-at">7.62</div>
				<div class="progress-container">
					<div class="cur-progress"></div>
				</div>
			</div>
			<TransitionGroup name="success" tag="ul">
				<div v-for="item in 2" :key="item">
					<CrashList class="escape-success" :style="getRandomPositionStyle()"></CrashList>
				</div>
			</TransitionGroup>
		</div>
		<div class="btn" :class="{ active: false }">
			<button>
				<span class="text">{{ t('battle.join') }}</span>
				<img src="@/assets/pcimg/crash/gold.png" />
				<span class="number">11.00</span>
			</button>
		</div>
		<div class="bet-items mt-20px">
			<div class="flex justify-between">
				<span class="">BET ITEMS</span>
				<div class="setting"></div>
			</div>
			<div class="flex items-list">
				<div class="item-scroll flex flex1">
					<div class="item flex items-center justify-center" v-for="item in 8" :key="item">
						<div class="leve"></div>
						<img src="@/assets/pcimg/crash/gun.png" />
					</div>
				</div>
				<div class="flex bag-box">
					<div class="split"></div>
					<div class="my-bag flex items-center justify-center">
						<button></button>
					</div>
				</div>
			</div>
			<div class="user-list">
				<transition-group name="list">
					<div class="user-item flex items-center justify-center" v-for="item in 5" :key="item">
						<div class="eyes">
							<img src="@/assets/pcimg/crash/eye.png">
						</div>
						<div class="user-item-container">
							<div class="user-head">
								<img src="">
								<div class="watcher">65</div>
								<div class="item-pic" v-show="true">
									<img src="">
								</div>
							</div>
							<div class="bet-container">
								<img src="@/assets/pcimg/crash/gold.png" />
								<p>11.00</p>
							</div>
							<div class="times-container" v-show="true">x5.00</div>
							<div class="boom" v-show="false">
								<img src="@/assets/pcimg/crash/boom_2.png">
							</div>
						</div>
					</div>
				</transition-group>
			</div>
		</div>
	</div>
</template>

<style lang='scss' scoped>
@import '@/assets/unocss.css';

.crash-body {
	padding: 20px;
	background-color: #17171F;

	.crash-header {
		display: flex;
		height: 80px;
		padding: 6px 3px;
		gap: 6px;
		justify-content: space-between;

		.crash-header-item {
			width: calc(100% / 2 - 6px);
			height: 100%;
			border-radius: 8px;
			display: flex;
			align-items: center;
			background-size: contain;
			background-repeat: no-repeat;

			&.wanted {
				padding-left: 20px;
				background-image: url("@/assets/pcimg/crash/wanted.png");

				/* 替换为你的图片 URL no-repeat*/
				.wanted-text {
					p {
						color: #fff;
						font-weight: 600;
					}

					span {
						color: #FFBD81;
					}
				}
			}

			&.token {
				background-image: url("@/assets/pcimg/crash/token.png");
				/* 替换为你的图片 URL no-repeat*/
				opacity: .4; //透明度设置

				.token-text {
					p {
						color: #fff;

						font-weight: 900;
						transform: scale(.7);
					}

				}
			}
		}
	}

	.crash-history {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;

		.history-item {
			display: flex;
			padding: 14px 24px;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			width: calc(100% / 6 - 6px);
			border-radius: 20px;
			background: #262A30;
			font-size: 14px;
			color: #FFF;
			margin: 3px;

			&.green {
				background: #1E3930;
				color: #00E258;
			}

			&.gold {
				background: #423E2E;
				color: #FFE063;
			}
		}
	}

	.bet-box {
		height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		box-sizing: border-box;
		background: url(@/assets/pcimg/crash/diamond.png ) no-repeat;
		background-size: cover;
		background-position: center center;
		transition: all 0.3s ease;
		margin: 30px 0 60px;
		opacity: .8;
		position: relative;

		.bet-wrap {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			transition: all 0.3s ease;

			.bet-title {
				color: #6C757D;

				font-size: 11.813px;
				font-style: normal;
				font-weight: 600;
				line-height: 18px;
				/* 152.381% */
				text-transform: uppercase;
			}

			.next-round-at {
				color: #FFF;

				font-size: 28.8px;
				font-style: normal;
				font-weight: 700;
				line-height: 43.2px;
				/* 150% */
				margin: 18px 0 27px 0;
			}

			.progress-container {
				width: 160px;
				height: 5px;
				border-radius: 30px;
				background: #1A1E23;
				box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.10) inset, 0px 1px 0px 0px rgba(255, 255, 255, 0.02);

				.cur-progress {
					border-radius: 30px;
					height: 100%;
					width: 60%;
					background: #00E258;
					box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.10) inset, 0px 1px 0px 0px rgba(255, 255, 255, 0.02);
				}
			}
		}


		.escape-success {
			// opacity: 1;//透明度设置
			transition: all 0.3s ease;
			// border:1px solid red;
		}
	}

	.btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;

		button {
			height: 84px;
			width: 50%;
			border: none;
			border-radius: 16px;
			background: #00C74D;
			box-shadow: 0px 2px 0px 0px #35D87B inset, 0px -3px 0px 0px #00913C inset, 0px 10px 27px 0px rgba(0, 255, 12, 0.10);
			color: #FFF;

			font-size: 26px;
			font-style: normal;
			font-weight: 700;
			line-height: 14px;
			/* 70% */
			text-transform: uppercase;
			display: flex;
			justify-content: center;
			/* 水平居中 */
			align-items: center;

			/* 垂直居中 */
			img {
				height: 21.6px;
				padding: 0 5px;
				margin: 0 8px 0 16px;
			}
		}

		&.active {
			opacity: .4; //透明度设置
		}
	}

	.bet-items {
		span {
			color: #fff;
			font-weight: 900;
		}

		.setting {
			width: 30px;
			height: 30px;
			background: url(@/assets/pcimg/crash/gear.png ) no-repeat;
		}

		.items-list {
			padding: 10px;
			background-color: #1A1E23;
			border-radius: 12px;

			.item-scroll {
				overflow-x: auto;

				.item {
					width: 80px;
					height: 80px;
					margin-right: 10px;
					background-color: #262A30;
					border-radius: 8px;
				}
			}

			.item-scroll::-webkit-scrollbar {
				display: none;
			}


			.bag-box {
				border-radius: 8px;

				.split {
					width: 0px;
					height: 80px;
					margin: 0 20px;
					border: 1px solid #262A30;
				}

				.my-bag {
					width: 80px;
					height: 80px;
					background-color: #262A30;

					button {
						width: 36px;
						height: 36px;
						border: none;
						border-radius: 6px;
						background: #262A30;
						background: url(@/assets/pcimg/crash/myBag.png ) no-repeat;
						background-position: center center;
					}
				}
			}


		}

		.user-list {
			.user-item {
				width: 100%;
				height: 100px;
				box-sizing: border-box;
				position: relative;
				margin-bottom: 10px;

				&.active {
					.user-item-container {
						background: #523433;
					}

					.eyes {
						background: #523433;
					}
				}

				.user-item-container {
					width: calc(100% - 38px);
					height: 100%;
					display: flex;
					box-sizing: border-box;
					padding: 0 8px 0 40px;
					align-items: center;
					position: relative;
					justify-content: space-between;
					background: #31353D;
					border-radius: 8px;

					&.escape {
						background: #2D5347;

						.times-container {
							color: #00C74D;
							text-align: center;

							font-size: 14.4px;
							font-style: normal;
							font-weight: 700;
							line-height: 21.6px;
							/* 150% */
						}

						.bet-container {
							p {
								color: #00E258;

								font-size: 14px;
								font-style: normal;
								font-weight: 400;
								line-height: 14px;
								/* 100% */
							}
						}
					}

					.boom {
						margin-left: 50px;
					}

					.times-container {
						width: 64px;
						height: 27.5px;
						display: flex;
						align-items: center;
						justify-content: center;
						box-sizing: border-box;
						// border: 1px solid yellow;
						color: #FFE063;

						font-size: 13px;
						font-style: normal;
						font-weight: 400;
						border-radius: 3.2px;
						background: #262A30;
					}

					.bet-container {
						display: flex;
						justify-content: center;
						/* 水平居中 */
						align-items: center;
						/* 垂直居中 */
						width: calc(16px + 96px);
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
						width: calc(72px + 42px + 68px);
						border: 1px solie red;
						box-sizing: border-box;
						gap: 24px;

						.item-pic {
							border: 1px solid red;
							width: 66px;
							height: 46px;

							img {
								border: none;
								border-radius: 0;
							}
						}

						img {
							width: 62px;
							height: 62px;
							box-sizing: border-box;
							border: 4px solid yellow;
							border-radius: 50%;
						}

						.watcher {
							position: absolute;
							border: 1px solid #fff;
							box-sizing: border-box;
							width: 36px;
							height: 36px;
							border-radius: 50%;
							bottom: 12px;
							left: 38px;
							color: #fff;
							// background:#fff;
							display: flex;
							align-items: center;
							justify-content: center;

							font-size: 12px;
							font-style: normal;
							font-weight: 700;
						}

					}
				}

				.eyes {
					display: flex;
					justify-content: center;
					/* 水平居中 */
					align-items: center;
					/* 垂直居中 */
					width: 36px;
					height: 36px;
					border-radius: 50%;
					// border: 1px solid red;
					box-sizing: border-box;
					position: absolute;
					background: #31353D;
					left: 0;
					z-index: 1;

					img {
						width: 24px;
						height: 16px;
					}
				}
			}
		}
	}
}
</style>
