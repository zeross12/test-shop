<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { boolean } from "mathjs";
// import { ref, watch } from "vue";
import { onMounted } from "vue";
// import { useRouter, useRoute } from "vue-router"

let props = defineProps({
	show: { type: Boolean, default: false },
	title: { type: String, default: '' },
	// cancelShow: { type: Boolean, default: true },
	btnType: {
		type: Number,
		default: 0,
	},
	disable: { type: Boolean, default: false },
});

let $emit = defineEmits(["ok", "cancel"]);

function cancel() {
	window.$dev && console.log("cancel");
	$emit("cancel");
}
function ok() {
	$emit("ok");
}
</script>

<template>
	<div id="h5-show-dialog" class="popup" :class="{ active: props.show }">
		<div class="popup-wrap">
			<div class="close" @click="cancel">
				<span class="icon iconfont">&#xe637;</span>
			</div>
			<div class="popup-title">
				<div class="pop-title-top">{{ title }}</div>
			</div>
			<div class="popup-content">
				<div class="popup-main">
					<slot></slot>
				</div>

				<div class="popup-btn-wrap" v-if="btnType == 0">
					<div v-if="props.cancelShow" class="popup-sure-btn popup-cancel-btn" @click="cancel()">
						{{ t('notify.cancel') }}
					</div>
					<div class="popup-sure-btn" @click="ok()">{{ t('notify.confirm') }}</div>
				</div>
				<div class="popup-btn-wrap" v-else-if="btnType == 1">
					<div class="popup-know-btn" @click="ok()" v-if="!props.disable">
						{{ t('notify.acceptAgreement') }}
					</div>
					<div class="popup-know-btn disable" v-if="props.disable">
						{{ t('notify.acceptAgreement') }}
					</div>
				</div>
				<div class="popup-btn-wrap" v-else-if="btnType == 2">
					<div class="popup-sure-btn popup-cancel-btn" @click="cancel()">
						{{ notify.cancel }}
					</div>
					<div class="popup-sure-btn" @click="ok()">{{ notify.confirm }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#h5-show-dialog {
	&.popup {
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		box-sizing: border-box;
		background-color: rgba(16, 16, 30, 0.9);
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		transition: 0.3s;
		z-index: -1;
		opacity: 0;

		.popup_top_bg {
			position: relative;
			top: -240px;
			width: 100%;

			img {
				width: 100%;
				height: auto;
			}
		}

		.popup-wrap_bg {
			background: #0d0e1c !important;
			width: 100% !important;
		}

		.popup-wrap {
			background: #191c34;
			width: 710px;
			position: absolute;

			.close {
				align-items: center;
				position: absolute;
				height: 48px;
				width: 48px;
				top: 20px;
				right: 20px;
				z-index: 1;

				span {
					font-size: 36px;
					color: #4b4f6d;
				}
			}

			.popup-title {
				width: 100%;
				margin: 20px 0;
				display: flex;
				align-items: center;
				text-align: center;
				justify-content: center;
				height: 82px;
				background: var(--title-background);

				&::before {
					content: "";
					position: absolute;
					left: 0px;
					width: 228px;
					height: 40px;
					box-sizing: border-box;
					background: var(--title-left-background);
				}

				&::after {
					content: "";
					position: absolute;
					width: 229px;
					height: 41px;
					box-sizing: border-box;
					background: var(--title-right-background);
					right: 0px;
				}

				span {
					font-size: 40px;
					font-family: var(--base-title-font-family);
					color: #fff;
					text-align: center;
					line-height: 48px;
					text-shadow: var(--title-text-shadow);
				}

				.pop-title-top {
					font-size: 36px;
					color: #fff;
					text-align: center;

					font-style: normal;
					font-weight: 400;
					text-transform: capitalize;
				}
			}

			.popup-content {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				width: 100%;
				margin: 0 auto;
				box-sizing: border-box;

				// overflow-y: auto;
				// margin-top: 30px;
				// margin-bottom: 68px;
				.help_detail_info {
					color: #b4b6c8;

					font-size: 28px;
					font-style: normal;
					font-weight: 500;
					padding-top: 20px;
					padding-left: 46px;
					padding-right: 46px;
					margin-bottom: 40px;

					p {
						margin-bottom: 20px;

						span {
							color: #00cbff;
							margin: 0 5px;
						}
					}
				}

				.btn-auto {
					width: 344px;
					height: 62px;
					border-radius: 50px;
					background: #3a34b0;
					color: #fff;

					font-size: 24px;
					font-style: normal;
					font-weight: 400;
					margin-top: 60px;
					margin-bottom: 20px;
					text-align: center;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.popup-main {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					width: 100%;

					.btn-auto-title {
						width: 100%;
						margin-top: 30px;
						display: flex;
						align-items: center;
						text-align: center;
						justify-content: center;
						height: 80px;
						background: var(--title-background);

						&::before {
							content: "";
							position: absolute;
							left: 0px;
							width: 228px;
							height: 40px;
							box-sizing: border-box;
							background: var(--title-left-background);
						}

						&::after {
							content: "";
							position: absolute;
							width: 229px;
							height: 41px;
							box-sizing: border-box;
							background: var(--title-right-background);
							right: 0px;
						}

						span {
							font-size: 40px;
							font-family: var(--base-title-font-family);
							color: #fff;
							text-align: center;
							line-height: 48px;
							text-shadow: var(--title-text-shadow);
						}
					}

					.btn-auto-input {
						display: flex;
						align-items: center;
						justify-content: space-between;
						width: 100%;
						box-sizing: border-box;
						padding-left: 50px;
						padding-right: 50px;
						margin-top: 100px;

						span {
							width: 20px;
							height: 2px;
							background: #4b4f6d;
						}

						input {
							box-sizing: border-box;
							text-align: center;
							width: 296px;
							height: 80px;
							color: #b4b6c8;

							font-size: 24px;
							font-style: normal;
							font-weight: 300;
							border-radius: 8px;
							border: 2px solid #4b4f6d;
							background: #212540;
						}
					}

					.goods-wrap {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 100%;
						// height: 147px;
						// margin-top: 77px;

						img {
							height: 200px;
						}
					}

					.goods-name {
						color: #e8e8e8;
						line-height: 40px;
						font-size: 24px;
						margin: 20px 0;
						text-align: center;
					}

					.price {
						display: flex;
						justify-content: center;
						align-items: center;
						color: #30fdfd;


						p {
							display: flex;
							align-items: center;
							font-size: 24px;
							margin: 0 15px;
							color: #aeabf4;

							img {
								width: 30px;
								margin-right: 10px;
							}
						}
					}

					.one-result {
						width: 230px;
						height: 290px;
						background-color: #171930;
						margin: 0 auto;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						background-repeat: no-repeat;
						background-position: center center;
						background-size: contain;

						.weapon-con {
							width: 168px;
							padding-top: 20px;
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: center;

							.one-weapon {
								width: 160px;
							}

							.prize-item-name {
								margin-top: 40px;
								width: 168px;
								box-sizing: border-box;
								color: #cbccd6;
								text-align: center;

								font-size: 24px;
								font-style: normal;
								font-weight: 300;
							}
						}
					}

					.result-totle-price {
						width: 100%;

						text-align: center;
						font-size: 28px;
						font-weight: 500;
						color: #6ecf96;
						margin-bottom: 50px;
					}
				}

				.popup-btn-wrap {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100%;
					margin-top: 20px;
					margin-bottom: 20px;

					.popup-sure-btn {
						box-sizing: border-box;
						display: flex;
						align-items: center;
						justify-content: center;
						width: 212px;
						height: 96px;
						border-radius: 4px;
						background: #7d51df;
						background-size: 100% 100%;
						text-align: center;
						font-size: 28px;
						font-weight: 700;
					}

					.popup-cancel-btn {
						width: 212px;
						height: 96px;
						margin-right: 30px;
						border-radius: 4px;
						background: #3a34b0;
						font-size: 28px;
						font-weight: 700;
					}

					.popup-know-btn {
						display: flex;
						justify-content: center;
						align-items: center;
						border-radius: 5px;
						background: #554bf7;
						color: #fff;
						text-align: center;
						font-size: 30px;
						font-style: normal;
						font-weight: 700;
						width: 460px;

						height: 82px;

						&.disable {
							background-color: transparent;
							color: #4d4f63;
							text-align: center;
							font-weight: 700;
						}
					}
				}
			}
		}

		&.active {
			z-index: 999;
			opacity: 1;
		}
	}

	// .dialog-x-content {
	//	 background-color: rgb(21, 23, 44);
	//	 padding: 50px 30px;
	//	 .dialog-row-wrap {
	//	 color: #aaacc1;
	//	 font-size: 26px;
	//	 font-style: normal;
	//	 font-weight: 400;
	//	 line-height: 40px;
	//	 margin-bottom: 20px;
	//	 }
	// }

	.dialog-x-content {
		background-color: rgb(21, 23, 44);
		color: #aaacc1;
		padding: 27px;
		width: 100%;
		box-sizing: border-box;

		// padding: 50px 0;
		.dialog-row-wrap {
			font-size: 26px;
			margin: 40px 20px;
			display: flex;

			&.unchecked {
				color: #80849b;
			}

			img {
				width: 32px;
				height: 32px;
				margin-right: 10px;
			}

			&.tips {
				font-weight: 700;
				color: #fff;
				font-size: 28px;
				// word-wrap: break-word;
			}
		}
	}
}
</style>
