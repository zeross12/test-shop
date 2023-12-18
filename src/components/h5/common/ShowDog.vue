<script setup>
import { computed, ref, watch } from "vue";
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
const store = useStore();
const route = useRoute();
const registerShow = computed(() => store.state.showRegisterView);
const showSignView = computed(() => store.state.showSignView);

let props = defineProps({
	show: { type: Boolean, default: false },
	title: { type: String, default: "提示" },
	title_register: { type: String, default: "" },
	// cancelShow: { type: Boolean, default: true },
	btnType: {
		type: Number,
		default: 0,
	},
	disable: { type: Boolean, default: false },
	money: { type: Number, default: 0 },
	prompt_key: {
		type: String,
		default: "提示",
	},
	prompt_show: { type: Boolean, default: false },
});

let tipsChecked = ref(false);

let $emit = defineEmits(["ok", "cancel"]);

function cancel() {
	console.log("cancel");
	$emit("cancel");
}
function ok() {
	$emit("ok");
}
//注册页面
function onClickRegister() {
	store.commit("setSignView", false);
	store.commit("setRegisterView", true);
}
//登陆页面
function onClickSign() {
	store.commit("setRegisterView", false);
	store.commit("setSignView", true);
}
function onClickTips() {
	tipsChecked.value = !tipsChecked.value;
	localStorage.setItem(props.prompt_key, tipsChecked.value);
}
</script>

<template>
	<div id="h5-show-dialog" class="popup" :class="{ active: props.show }">
		<div class="popup-wrap">
			<div class="close" :class="{ top: title_register !== '' }" @click="cancel">
				<span class="icon iconfont">&#xe65f;</span>
			</div>
			<div class="popup-title">
				<div v-if="title_register === ''" class="pop-title-top">
					{{ title }}
				</div>
				<div v-if="title_register === '账号注册' || title_register === '账号登陆'" class="pop-title-top-register"
					:class="{ active: !registerShow }" @click="onClickSign">
					{{ title }}
				</div>
				<div v-if="title_register === '账号注册' || title_register === '账号登陆'" class="pop-title-top-register"
					:class="{ active: !showSignView }" @click="onClickRegister">
					{{ title_register }}
				</div>
			</div>
			<div class="popup-content">
				<div class="popup-main">
					<slot></slot>
				</div>

				<div class="popup-btn-wrap" v-if="btnType == 1">
					<div class="popup-sure-btn" @click="ok()">确定</div>
				</div>
				<div v-else-if="btnType == 2">
					<div class="popup-btn-wrap">
						<div class="popup-sure-btn" @click="ok()">确定</div>
						<div class="popup-sure-btn popup-cancel-btn" @click="cancel()">
							取消
						</div>
					</div>
					<div v-if="prompt_show" :class="{ active: tipsChecked }" class="popup-tips-wrap" @click="onClickTips">
						<img v-if="!tipsChecked" src="@/assets/romimg/common/unselected1.png" alt="" />
						<img v-else src="@/assets/romimg/common/selected1.png" alt="" />
						下次不再提示
					</div>
				</div>
				<div class="popup-btn-wrap" v-else-if="btnType == 3">
					<div class="popup-sure-btn bag" @click="cancel()">
						<span class="icon iconfont">&#xe66c;</span>放入背包
					</div>
					<div class="popup-sure-btn huishou" @click="ok()">
						<span class="icon iconfont">&#xe665;</span>分解
						{{ props.money.toFixed(2) }}
					</div>
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
		background: rgba(0, 0, 0, 0.7);
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		transition: 0.3s;
		z-index: -1;
		opacity: 0;

		.pop-title-top-register {
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 32px;
			color: #fff;
			opacity: 0.5;
			text-align: left;
			flex: 1;
			height: 100%;
			box-sizing: border-box;
			// padding-left: 50px;
			z-index: 10000;
			font-style: normal;
			// background:#fff;

			&.active {
				// width: 222px;
				// text-align: left;
				color: #ffbd98;
				font-weight: 500;
				background: var(--G-PAY,
						linear-gradient(289deg, #313340 0.4%, #483c40 100%));
				font-weight: 700;
				opacity: 1;
				// padding-right: 150px;
			}
		}

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
			background: #21212a;
			width: 690px;
			position: absolute;
			border-radius: 20px;

			.close {
				align-items: center;
				position: absolute;
				// height: 36px;
				// width: 36px;
				top: 40px;
				right: 40px;
				z-index: 1;

				span {
					font-size: 30px;
					color: #4b4f6d;
				}

				&.top {
					// background: url(@/assets/romimg/common/top_close.png) no-repeat;
					background-size: cover;
					width: 40px;
					height: 40px;
					top: -50px;
					right: 0px;

					span {
						display: none;
					}
				}
			}

			.popup-title {
				width: 100%;
				display: flex;
				align-items: center;
				text-align: center;
				// justify-content: center;
				margin: 0px;
				height: 130px;
				background: #191C34;
				border-radius: 20px 20px 0px 0px;
				overflow: hidden;

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
					font-size: 32px;
					color: #fff;
					text-align: left;
					width: 100%;
					box-sizing: border-box;
					padding-left: 50px;

					font-style: normal;
					font-weight: 700;
				}
			}

			.popup-content {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				width: 100%;
				margin: 0 auto;

				border-bottom-right-radius: 20px;
				border-bottom-left-radius: 20px;
				box-sizing: border-box;
				// overflow-y: auto;
				// margin-top: 30px;
				// margin-bottom: 68px;
				background-color: #17171f;

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
					margin-bottom: 50px;
					background-color: #17171f;

					.popup-sure-btn {
						box-sizing: border-box;
						display: flex;
						align-items: center;
						justify-content: center;
						width: 260px;
						height: 106px;
						border-radius: 8px;
						background: #e59d5d;
						background-size: 100% 100%;
						text-align: center;
						font-size: 30px;
						font-weight: 700;
						color: #272735;

						&.bag {
							border-radius: 12px;
							border: 2px solid #e59d5d;
							background: unset;
							color: #e59d5d;
							font-size: 24px;
							margin-bottom: 30px;

							span {
								font-size: 32px;
								font-weight: bold;
								margin-right: 20px;
							}
						}

						&.huishou {
							border-radius: 12px;
							color: #392c22;
							font-size: 24px;
							margin-left: 30px;
							margin-bottom: 30px;

							// width: 100%;
							span {
								font-size: 30px;
								margin-right: 20px;
							}
						}
					}

					.popup-cancel-btn {
						width: 260px;
						height: 106px;
						margin-left: 30px;
						border-radius: 8px;
						background: #282934;
						font-size: 30px;
						font-weight: 700;
						color: #787a8d;
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

				.popup-tips-wrap {
					color: #aaacc1;
					text-align: center;
					font-size: 24px;
					margin-bottom: 30px;

					font-weight: 400;
					line-height: 32px;

					/* 140% */
					&.active {
						color: #e59d5d;
					}

					img {
						width: 32px;
						height: 32px;
						vertical-align: middle;
						margin-right: 20px;
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
	//		 color: #aaacc1;
	//		 font-size: 26px;
	//		 font-style: normal;
	//		 font-weight: 400;
	//		 line-height: 40px;
	//		 margin-bottom: 20px;
	//	 }
	// }

	.dialog-x-content {
		background-color: #17171f;
		color: #aaacc1;
		padding: 27px;
		width: 100%;
		padding-bottom: 30px;
		border-radius: 20px;
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
				display: flex;
				justify-content: center;
				align-items: center;

				#currency-wrap {
					white-space: nowrap;
					padding: 0;

					.span1 {
						font-size: 28px;
					}

					.span2 {
						font-size: 28px;
					}
				}
			}
		}
	}
}
</style>
