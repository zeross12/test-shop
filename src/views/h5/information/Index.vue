<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { getMessage, delReadyMessage } from "@/network/api/user";

const router = useRouter();
const store = useStore();
const pager = ref({ pageIndex: 1, limit: 20 });
const infoList = ref([]);

const loading = ref(false);
const finished = ref(false);
const totalRows = ref(0);

onMounted(() => {
	getMessageList();
});

async function getMessageList() {
	let res = await getMessage({
		page: pager.value.pageIndex,
		limit: pager.value.limit,
	});
	if (res.code == 0) {
		let items = res.data.items || [];
		let preList = infoList.value;
		if (res.data.page == 1) {
			preList = [];
		}
		infoList.value = [...preList, ...items];
		loading.value = false;
		totalRows.value = res.data.total;

		if (items.length < res.data.limit) {
			finished.value = true;
		}
	} else {
		loading.value = false;
		finished.value = true;
	}
}

//触底刷新
function onLoad() {
	pager.value.pageIndex += 1;
	getMessageList();
}

function onClickHelp() {
	let data = {
		show: true,
		html: t('menu.messageRule'),
	};
	store.commit("setHowPlay", data);
}

//删除已读
async function deleteReady() {
	let res = await delReadyMessage();
	if (res.code == 0) {
		Notify(t('users.delSuccess'));
		pager.value.pageIndex = 1;
		finished.value = false;
		getMessageList();
	}
}

//跳转详情
function toDetails(item) {
	router.push({
		path: "/m/informationDetail",
		query: {
			msgId: item.id,
		},
	});
}
</script>

<template>
	<div id="information" class="min-wrap-height">
		<!-- <div class="title">站内信息</div> -->
		<div class="info_top">
			<div class="info_count">
				<p>
					{{t('router.messageDetail')}}：<span>{{ totalRows }}</span>
				</p>
				<div v-if="false" class="help" @click="onClickHelp">?</div>
			</div>

			<div class="iconfont icon-changyonggoupiaorenshanchu iconf"></div>

			<div class="info_btn" @click="deleteReady">{{t('users.delAllReaded')}}</div>
		</div>
		<van-list
			v-model="loading"
			:finished="finished"
			:finished-text="t( 'common.noMore' )"
			@load="onLoad"
			:immediate-check="false"
		>
			<div class="information_list">
				<div
					class="information_item"
					v-for="(item, index) in infoList"
					:key="index"
					@click="toDetails(item)"
				>
					<div class="item_info">
						<div class="flag-unread" v-if="!item.isRead"></div>
						<div class="item_title">{{ item.title }}</div>
						<div class="item_time">{{ item.createTime }}</div>
					</div>
					<div class="item_data" v-html="item.content"></div>
				</div>
			</div>
		</van-list>
	</div>
</template>

<style lang="scss">
#information {
	width: 750px;
	padding: 0 20px;
	box-sizing: border-box;

	.title {
		margin-top: 40px;
	}

	.iconf {
		color: #5e5f6c;
		margin-left: 239px;
		font-size: 28px;
		display: flex;
		// justify-content: center;
		// align-items: center;
	}

	.info_top {
		display: flex;
		// justify-content: space-between;
		align-items: center;
		margin-top: 40px;
		width: 706px;
		background-color: #1c203c;
		height: 120px;
		border-radius: 12px; // 添加圆角

		.info_btn {
			width: 170px;
			// text-align: center;
			height: 43px;
			color: #acaec5;

			line-height: 43px;
			// font-weight: bold;
			font-size: 20px;
			margin-left: 10px;

			// &:active {
			// 	// color: #FBFA02;
			// }
		}

		.info_count {
			display: flex;
			align-items: center;
			width: 66%;
			p {
				margin-left: 30px;
				color: #fff;
				font-size: 28px;
				span {
					color: #ffffff;
				}
			}

			.help {
				font-size: 20px;
				margin-left: 20px;
				color: #fff;
			}
		}
	}

	.information_list {
		margin-bottom: 40px;
		margin-top: 20px;

		.information_item {
			height: 174px;
			margin: 20px 0px;
			background-color: #15172c;
			border: 4px solid #2e304e; // 默认描边样式，这里设置为实线黑色2px描边
			/* 取消上边描边，其余三个边保持描边样式 */

			border-radius: 12px;

			.item_info {
				height: 80px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 0 20px;
				box-sizing: border-box;
				background-color: #181a31;
				border-top-left-radius: 10px; // 左上角圆角
				border-top-right-radius: 10px; // 右上角圆角
				.flag-unread {
					width: 10px;
					height: 10px;
					background-color: #0092f3;
					border-radius: 50%;
					margin-top: 2px;
					margin-right: 5px;
				}

				.item_title {
					width: 380px;
					color: #b4b6c8;
					font-weight: bold;
					font-size: 22px;
				}

				.item_time {
					width: 240px;
					color: #b4b6c8;
					font-size: 20px;

					text-align: right;
				}
			}

			.item_data {
				box-sizing: border-box;
				color: #b4b6c8;
				height: 60px;
				margin-top: 15px;
				padding: 0 20px;
				font-size: 20px;
				overflow: hidden;
				// white-space: nowrap;
				// overflow: hidden;
				// text-overflow: ellipsis;

				text-overflow: -o-ellipsis-lastline;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;

				// p {
				//	 white-space: nowrap;
				//	 overflow: hidden;
				//	 text-overflow: ellipsis;
				// }
			}
		}
	}
}
</style>
