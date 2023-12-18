<script setup>
import { ref } from "@vue/reactivity";
import { useStore } from "vuex";
import { getArticleList } from "@/network/api/index";
import { onMounted } from "vue";
import { formProps } from "element-plus";
import ShowDog from "../common/ShowDog.vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n();

const props = defineProps(["isOpenBox"]);
const showMore = ref(false);
const store = useStore();
const noticeArr = ref([]);
const noticetxt = ref("");
const popType = ref(false);

const todayShowNotice = ref(false);

const testNotice = ref(false);

onMounted(() => {
	getNotice();
	initToday();
	popType.value = !todayShowNotice.value;
	setTimeout(() => {
		widthLoad.value = true;
	}, 200);
});

function initToday() {
	let day = localStorage.getItem("today_show_notice");
	let date = new Date();
	let nowday =
		date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
	todayShowNotice.value = nowday != day;
}

function onClickOpen() {
	store.commit("setSwitchNotice", true);
	todayShowNotice.value = true;
}

function onClickClose() {
	store.commit("setSwitchNotice", false);
	initToday();
}

//过滤
function filtersNotice(v) {
	return v.replace(/<[^>]+>/g, "");
}

function changeNoticeState(val) {
	if (val) {
		let date = new Date();
		let day =
			date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
		localStorage.setItem("today_show_notice", day);
	} else {
		localStorage.removeItem("today_show_notice");
	}
}

async function getNotice() {
	const res = await getArticleList({
		type: "Notice",
		platformId: store.state.platformId,
	});
	if (res.code === 0) {
		let items = res.data.items;
		if (items != null && items.length > 0) {
			items.sort((a, b) => a.sort - b.sort);
			//	noticetxt.value += items[0].content;
			for (let i = 0; i < items.length; i++) {
				noticetxt.value +=
					"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
					items[i].content;
			}
			noticeArr.value = items;
		}
	}
}
let widthLoad = ref(false);
</script>

<template>
	<div id="notice">
		<div
			class="notice-wrap"
			:class="{ openBox: isOpenBox }"
			@click="onClickOpen()"
		>
			<!-- <div class="notice-icon">
				<img src="@/assets/romimg/header/notice.png" alt="" />
			</div> -->
			<div class="notice-content" v-if="widthLoad">
				<div
					class="notice-content-bar"
					ref="wrapperRef"
					v-html="noticetxt"
				></div>
			</div>
			<div class="notice-icon">
				<span class="icon iconfont more" @click="showMore = true"
					>&#xe63b;</span
				>
			</div>
		</div>

		<van-overlay
			:show="store.state.switchNotice && todayShowNotice && testNotice"
			:z-index="200"
			style="background-color: rgba(0, 0, 0, 0.7)"
			:lock-scroll="false"
		>
			<div class="notice-main">
				<div class="notice-back">
					<div class="close" @click="onClickClose()">
						<!-- <img src="@/assets/romimg/common/close.png" alt="" /> -->
					</div>
					<div class="notice-html">
						<div class="ql-snow">
							<div class="ql-editor" v-html="noticetxt"></div>
						</div>
						<div class="PopupStatus">
							<van-checkbox v-model="popType" @change="changeNoticeState">
								{{ t( 'notify.dontPopupAgain' ) }}
							</van-checkbox>
						</div>
					</div>
				</div>
			</div>
		</van-overlay>

		
		<!-- <div class="van-swipe-container" @click="showMore = true">
			<van-swipe vertical :autoplay="3000" :show-indicators="false">
				<van-swipe-item v-for="(item, index) in noticeArr" :key="index">
					<div class="van-swipe-item-content hide" v-html="item.content"></div>
				</van-swipe-item>
			</van-swipe> 
			<div class="notice-icon">
				<span class="icon iconfont more">&#xe63b;</span>
			</div>
		</div> -->
		<ShowDog :title="t( 'common.notify' )" @cancel="showMore = false" :show="showMore">
			<div class="notice-list-wrap">
				<div
					class="notice-item"
					v-for="(item, index) in noticeArr"
					:key="index"
					@click="item.show = !item.show"
					:class="{ active: item.show }"
				>
					<!-- <div class="notice-title" v-html="item.title"></div> -->

					<div
						class="notice-content"
						:class="{ hide: !item.show }"
						v-html="item.content"
					></div>
					<div class="notice-time">{{ item.createTime }}</div>
				</div>
				<div class="more">{{t('users.noFurtherAnnouncements')}}</div>
			</div>
		</ShowDog>
	</div>
</template>

<style lang="scss">
#notice {
	width: 100%;
	height: 100px;
	position: relative;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	background-color: #15172c;

	.notice-list-wrap {
		max-height: 1000px;
		width: 100%;
		overflow-y: auto;
		padding: 20px;
		box-sizing: border-box;
		background: #15172C;
		border-bottom-left-radius: 20px; /* 左下角设置为圆角 */
		border-bottom-right-radius: 20px; /* 右下角设置为圆角 */
		.notice-item {
			width: 100%;
			margin: 20px auto;
			border-radius: 12px;
			border: 1px solid #22232f;
			padding: 20px;
			box-sizing: border-box;
			&.active {
				border-radius: 12px;
				background: #191C34;
			}
			.notice-title {
				width: 100%;
				overflow: hidden;
				color: #b4b6c8;
				text-overflow: ellipsis;
				font-size: 24px;
				font-style: normal;
				font-weight: 400;
				line-height: 32px; /* 133.333% */
			}
			.notice-content {
				width: 622px;
				color: #b4b6c8;
				font-size: 24px;
				font-style: normal;
				font-weight: 400;
				line-height: 32px; /* 133.333% */
			}
			.notice-time {
				color: #434452;
				font-style: normal;
				font-weight: 400;
				margin-top: 10px;
			}
		}
		.more {
			margin: 40px auto;
			color: #787a8d;
			text-align: center;

			font-size: 26px;
			font-style: normal;
			font-weight: 400;
			line-height: 48px; /* 184.615% */
		}
	}

	.van-swipe-container {
		width: 750px;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0% 50px;
		box-sizing: border-box;
		.van-swipe {
			height: 92px;
			.van-swipe-item {
				color: #bac1d3;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 24px;
				z-index: 1;
				background-color: transparent;
				.van-swipe-item-content {
					height: 92px;
					line-height: 92px;

					width: 630px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					font-size: 28px;
					color: #bac1d3 !important;
					* {
						color: #BAC1D3 !important;
					}

					a
					{
						color: #E59d5d;
						* { color: #E59d5d !important; }
					}
					// line-height: 92px !important;
				}

				
			}
		}

		.notice-icon {
			width: 32px;
			height: 32px;
			margin-left: 16px;
			transform: rotate(180deg);
			.more {
				font-size: 28px;
				color: #aea49a;
			}
		}
	}

	.notice-icon {
		width: 32px;
		height: 32px;
		margin-left: 16px;
		transform: rotate(180deg);
		.more {
			font-size: 28px;
			color: #aea49a;
		}
	}

	.notice-wrap {
		width: 100%;
		height: 52px;
		display: flex;
		align-items: center;
		box-sizing: border-box;
		flex-wrap: nowrap;
		padding: 0 10px 0 12px;
		// background-color: rgb(0, 0, 0, 0.35);
		// opacity: 0.6;
		// background: rgba($color: #232323, $alpha: .5);
		border-radius: 6px;

		&.openBox {
			background: transparent;
		}

		.notice-icon {
			width: 32px;
			height: 32px;
			margin-right: 16px;

			img {
				width: 32px;
				height: 32px;
			}
		}

		.notice-content {
			width: 690px;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			overflow: hidden;
			margin: 0 auto;

			.notice-content-bar {
				// margin: 0 10px;
				// width: auto;
				display: flex;
				flex-wrap: nowrap;
				align-items: center;
				animation: 30s wordsLoop linear infinite normal;
				font-size: 28px;

				-webkit-transform-style: preserve-3d;
				transform-style: preserve-3d;

				color: #ffffff;
				line-height: 33px;

				p {
					color: #b4b6c8 !important;
					span {
						color: #ffffff !important;
					}
				}

				& > * {
					white-space: nowrap;
				}
			}

			@keyframes wordsLoop {
				0% {
					transform: translateX(600px);
				}
				100% {
					// -webkit-transform: translateX(-100%);
					// transform: translateX(-100%);
					-webkit-transform: translateX(-100%);
					-o-transform: translateX(-100%);
					-moz-transform: translateX(-100%);
					transform: translate(-100%, 0);
				}
			}
		}
	}

	.notice--tuzi-icon {
		position: absolute;
		right: 0px;
		top: 1px;
		width: 93px;
		height: 101px;

		img {
			width: 80%;
			height: 80%;
		}
	}

	.left_txt {
		position: absolute;
		left: 18px;
		top: 0;
		width: 95px;
		height: 32px;
		font-size: 16px;
		color: #fff;
		line-height: 30px;
		text-align: right;
		padding-right: 30px;
		box-sizing: border-box;
	}

	.van-overlay {
		z-index: 200 !important;
	}

	.notice-main {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;

		.notice-back {
			width: 600px;
			height: 800px;
			padding: 20px;
			box-sizing: border-box;
			position: relative;
			background: rgba($color: #13181f, $alpha: 0.9);
			border-radius: 30px;

			.close {
				width: 40px;
				height: 40px;
				position: absolute;
				right: 10px;
				top: 10px;

				img {
					width: 100%;
					height: 100%;
				}
			}

			.notice-html {
				margin-top: 40px;
				height: 660px;
				overflow-y: auto;
				color: #fff;
			}
		}
	}
}

.PopupStatus {
	// 今日不在弹出样式
	position: absolute;
	bottom: 20px;
	right: 40px;
	color: white;

	.van-checkbox {
		height: 40px;

		.van-checkbox__icon {
			width: 30px;
			height: 30px;
			display: flex;
			align-items: center;
			justify-content: center;

			.van-icon {
				width: 24px;
				height: 24px;
				border: 3px solid #fff;
				color: #000;

				&::before {
					font-size: 20px;
					line-height: 26px;
				}
			}
		}

		.van-checkbox__label {
			color: #fff;
			font-size: 18px;
			font-weight: bold;
			height: 40px;
			line-height: 44px;
		}
	}

	.van-checkbox__icon--checked .van-icon {
		border-color: #3bb0ed !important;
		background-color: #3bb0ed;
	}

	&.active {
		.van-checkbox__label {
			color: #3bb0ed;
		}
	}
}
</style>
