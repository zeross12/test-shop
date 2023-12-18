<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref } from "@vue/reactivity";
import { useStore } from "vuex";
import { getArticleList } from "@/network/api/index";
import { onMounted } from "vue";

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
		if (items.length > 0) {
			items.sort((a, b) => a.sort - b.sort);
			noticetxt.value = items[0].content;
			noticeArr.value = items;
		}
	}
}

const showDetail = ref(false)

</script>

<template >
	<div class="">
		<div class="separate" style="margin-top: 16px;" />
		<div id="pc-notice" class="container">
			<div class="notify-dialog-container" v-if="showDetail">
				<div class="notify-dialog">
					<div class="header">
						{{ t('common.notify') }}
						<img src="@/assets/pcimg/common/close.png" @click="showDetail = false">
					</div>
					<div class="body">
						<div class="item" v-for="( item, index ) in noticeArr" :key="index">
							<div class="content" v-html="item.content"></div>
							<div class="datetime">{{ item.createTime }}</div>
						</div>
					</div>
				</div>
			</div>
			<div class="notice-wrap">
				<div class="notice-wrap-icon">
					<!-- <img src="@/assets/pcimg/home/icon_notice.png" alt="" /> -->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path
							d="M12 8H4C3.46957 8 2.96086 8.21071 2.58579 8.58579C2.21071 8.96086 2 9.46957 2 10V14C2 14.5304 2.21071 15.0391 2.58579 15.4142C2.96086 15.7893 3.46957 16 4 16H5V20C5 20.2652 5.10536 20.5196 5.29289 20.7071C5.48043 20.8946 5.73478 21 6 21H8C8.26522 21 8.51957 20.8946 8.70711 20.7071C8.89464 20.5196 9 20.2652 9 20V16H12L17 20V4L12 8ZM21.5 12C21.5 13.71 20.54 15.26 19 16V8C20.53 8.75 21.5 10.3 21.5 12Z"
							fill="#FFE063" />
					</svg>
					<div class="ql-editor" v-html="noticetxt"></div>
				</div>
				<div class="more" @click="showDetail = true">{{ t('common.loadmore') }}</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#pc-notice {
	position: relative;
	margin-top: 16px;



	.notify-dialog-container {
		position: fixed;
		background: rgba(0, 0, 0, .7);
		display: flex;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
		z-index: 200;

		.notify-dialog {
			width: 590px;
			height: 520px;
			// border: 1px solid red;
			background: #16182E;

			.body {
				display: flex;
				padding: 32px 16px;

				.item {
					padding: 15px;
					border-radius: 8px;
					border: 1px solid #1C1F39;
					display: flex;
					flex-direction: column;
					gap: 10px;

					.content {
						color: #B4B6C8;

						font-size: 16px;
						font-weight: 400;
					}

					.datetime {
						color: #62636E;

						font-size: 14px;
						font-style: normal;
						font-weight: 400;
					}
				}
			}

			.header {
				background: #1C1F39;
				height: 94px;
				display: flex;
				align-items: center;
				padding-left: 38px;
				color: #CCCBDE;

				font-size: 16px;
				font-style: normal;
				font-weight: 700;
				position: relative;

				img {
					position: absolute;
					top: 14px;
					right: 14px;
				}
			}
		}
	}

	.notice-wrap {
		background: rgba(25, 28, 52, .3);
		display: flex;
		align-items: center;
		text-align: center;
		font-size: 16px;
		font-weight: 500;
		width: 100%;

		// overflow: hidden;

		.notice-wrap-icon {
			// flex: 1;
			display: flex;
			align-items: center;
			gap: 8px;

			overflow: hidden;

			svg {
				min-width: 24px;
				min-height: 24px;
			}

			p {
				text-overflow: ellipsis;
				overflow: hidden;
				word-break: break-all;
				white-space: nowrap;
			}
		}

		.more {
			color: #FFE063;
			padding: 0 8px;
			min-width: 80px;
			cursor: pointer;
		}

		.ql-editor {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			padding: 0px;
			color: #fff;
			white-space: nowrap !important;
		}
	}
}
</style>
