<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getMessage, delReadyMessage } from '@/network/api/user';


const router = useRouter();
const store = useStore();
const pager = ref({ pageIndex: 1, limit: 20 });
const infoList = ref([]);

const loading = ref(false);
const finished = ref(false);
const totalRows = ref(0);

onMounted(() => {
	getMessageList();
})

async function getMessageList() {
	let res = await getMessage({ page: pager.value.pageIndex, limit: pager.value.limit });
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


//删除已读
async function deleteReady() {
	let res = await delReadyMessage();
	if (res.code == 0) {
		Success( { offset : 100, message : t( 'users.delSuccess' ) } );
		pager.value.pageIndex = 1;
		getMessageList();
	}
}

//跳转详情
function toDetails(item) {
	router.push({
		path: '/p/me/informationDetail',
		query: {
			msgId: item.id
		}
	})
}
</script>
		
<template>
	<div id="pc-information">
		<div class="p-com-header">
			<div class="p-com-header-l">
			</div>
			<div class="p-com-header-c">{{ t( 'router.message' ) }}</div>
			<div class="p-com-header-r">
				<div class="btn-wrap" @click="deleteReady">
					<img src="@/assets/pcimg/me/delete.png" alt="" />
					{{ t( 'users.delAllReaded' ) }}
				</div>
			</div>
		</div>
		<van-list class="information-list" v-model="loading" :finished="finished" :finished-text="t( 'common.noMore' )" @load="onLoad"
			:immediate-check="false">
			<div class="information-item" v-for="(item, index) in infoList" :key="index" @click="toDetails(item)"
				:class="{ read: item.isRead }">
				<img class="icon" src="@/assets/pcimg/me/wallet.png" alt="" />
				<div class="info-center">
					<div class="item-title">{{ item.title }}</div>
					<div class="item-data" v-html="item.content"></div>
				</div>
				<div class="item-time">{{ item.createTime }}</div>
			</div>

		</van-list>
	</div>
</template>
		
<style lang="scss" >
#pc-information {
	box-sizing: border-box;
	padding-top: 3px;
	width: 100%;
	min-height: 500px;
	padding-bottom: 50px;

	.p-com-header {
		width: 100%;
		display: flex;
		align-items: center;
		margin-bottom: 5px;
		color: #8488A6;
		font-size: 16px;
		margin-top: 5px;

		.p-com-header-l {
			flex: 1;
		}

		.p-com-header-c {
			display: flex;
			justify-content: center;
			align-items: center;
			// width: 197px;
			height: 105px;
			background: url(@/assets/pcimg/me/header_bg.png) center no-repeat;
			background-size: 100% 100%;
			color: #FFF;
			font-size: 24px;
		}


		.p-com-header-r {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			flex: 1;
		}


		.btn-wrap {
			display: inline-flex;
			height: 48px;
			justify-content: center;
			align-items: center;
			color: #878B91;
			font-size: 18.188px;
			margin-right: 70px;
			cursor: pointer;

			img {
				width: 23px;
				height: auto;
				margin-right: 5px;
			}
		}
	}

	.information-list {
		display: flex;
		flex-direction: column;
		width: 100%;

		.information-item {
			display: flex;
			align-items: center;
			height: 116px;
			margin-bottom: 2px;
			width: 100%;
			background: #181A31;
			cursor: pointer;
			opacity: 1;
			padding: 0 30px;
			box-sizing: border-box;
			position: relative;

			.icon {
				width: 56px;
				height: 53px;
			}

			.info-center {
				display: flex;
				flex-direction: column;
				color: #EFEFF0;
				font-size: 14px;
				margin-left: 40px;
				box-sizing: border-box;
				width: calc( 100% - 100px );

				.item-title {
					margin-bottom: 6px;
				}

				.item-data {
					box-sizing: border-box;
					height: 50px;
					overflow: hidden;

					p {
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}
			}


			.item-time {
				color: #EFEFF0;
				font-size: 14px;
				text-align: right;
				position: absolute;
				top: 16px;
				right: 16px;
			}

			&.read {
				opacity: 0.4;
			}
		}
	}
}
</style>