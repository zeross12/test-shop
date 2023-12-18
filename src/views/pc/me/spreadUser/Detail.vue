<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted } from "vue";
import { getStatsList } from "@/network/api/recharge";

const statsList = ref([]);
const pageIndex = ref(1);
const loading = ref(false);
const customLoading = ref(false);
const finished = ref(false);

onMounted(() => {
	pageIndex.value = 1;
	getSpreadList();
})

async function getSpreadList() {
	let params = {};
	params.page = pageIndex.value;
	params.limit = 10;
	customLoading.value = true;
	const res = await getStatsList(params);
	if (res.code == 0) {
		let items = res.data.items || [];
		let preList = statsList.value;
		if (res.data.page == 1) {
			preList = [];
		}
		statsList.value = [...preList, ...items, ...items, ...items, ...items, ...items];
		loading.value = false;
		if (items.length < res.data.limit) {
			finished.value = true;
		}
	} else {
		loading.value = false;
		finished.value = true;
	}
	customLoading.value = false;
}

//触底刷新
function onLoad() {
	if (customLoading.value) returm;
	pageIndex.value += 1;
	getSpreadList();
}
</script>

<template>
	<div id="pc-spread-detail" class="min-wrap-height">
		<div class="title">{{ t( 'users.rewardForDays' ) }}</div>
		<div class="spread-list">
			<div class="spread-list-title">
				<p>{{ t( 'users.datetime' ) }}</p>
				<p>{{ t( 'users.rechargeUserTotal' ) }}</p>
				<p>{{ t( 'users.rechargeMoneyTotal' ) }}</p>
				<p>{{ t( 'users.incomeTitle' ) }}</p>
			</div>
			<div class="spread-list-tip" v-if="statsList.length == 0">
				········ {{ t( 'users.noMore' ) }} ········
			</div>
			<div class="spread-list-content" v-else>
				<van-list class="spread-list-wrap" v-model="loading" :finished="finished" :finished-text="t( 'common.noMore' )" @load="onLoad"
					:immediate-check="false">
					<div class="spread-item" v-for="(item, index) in statsList" :key="index">
						<p class="hide">{{ item.dataDay }}</p>
						<p>{{ item.chargeNum }}</p>
						<p>{{ item.chargeAmount }}</p>
						<p>{{ item.incomeAmount }}</p>
					</div>
				</van-list>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#pc-spread-detail {
	box-sizing: border-box;
	width: 1078px;
	height: 1060px;
	background: rgba($color: #141221, $alpha: .5);
	padding: 16px 45px;

	.title {
		margin-top: 30px;
		margin-bottom: 30px;
	}

	.spread-list {

		.spread-list-title {
			display: flex;
			height: 52px;
			border-bottom: 1px solid #71701B;

			p {
				flex: 1;
				line-height: 52px;
				font-size: 24px;
				font-weight: bold;
				color: #EEE131;
				text-align: center;
			}

		}

		.spread-list-tip {
			text-align: center;
			line-height: 150px;
			font-size: 24px;
			color: #fff;
		}

		.spread-list-content {
			overflow: scroll;
			height: 900px;

			&::-webkit-scrollbar {
				width: 0px;
			}

			.spread-list-wrap {
				margin-bottom: 30px;

				.spread-item {
					height: 100px;
					display: flex;
					align-items: center;
					position: relative;
					border-bottom: 1px solid #71701B;

					p {
						flex: 1;
						text-align: center;
						color: #ffffff;
						font-size: 24px;
					}

				}

			}
		}

	}
}
</style>
