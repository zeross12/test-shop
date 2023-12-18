<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { Dialog } from "vant";
import { ref, computed, onMounted } from "vue";
import { changeSpreadCode } from "@/network/api/user";
import { getStatsList } from "@/network/api/recharge";
import useClipboard from "vue-clipboard3";
import { useStore } from "vuex";
import { siteUrl } from "@/config";
const { toClipboard } = useClipboard();
const store = useStore();
const userInfoExt = computed(() => store.state.userInfoExt);
const userSpreadCode = ref(userInfoExt.value.spreadCode);
const ownerInvitation = ref(siteUrl + "?code=" + userInfoExt.value.spreadCode);
const statsList = ref([]);
const pageIndex = ref(1);
const loading = ref(false);
const finished = ref(false);

onMounted(() => {
	pageIndex.value = 1;
	getSpreadList();
});

//修改
function changeInvitation() {
	Dialog.confirm({
		message: `是否修改邀请码?`,
	})
		.then(() => {
			if (userSpreadCode.value == null || userSpreadCode.value.trim() == "") {
				NotifyF("未输入内容");
			} else {
				let params = {
					spreadCode: userSpreadCode.value,
				};
				changeSpreadCode(params).then((res) => {
					if (res.code == 0) {
						store.dispatch("getUserInfo");

						ownerInvitation.value = siteUrl + "?code=" + userSpreadCode.value;

						Notify(res.message);
					} else {
						userSpreadCode.value = userInfoExt.value.spreadCode;
					}
				});
			}
		})
		.catch(() => {});
}

async function copy(value) {
	try {
		await toClipboard(value);
		Notify(t('common.copySuccess' ));
	} catch (e) {
		NotifyF(t('common.copyFail' ));
	}
}

async function getSpreadList() {
	let params = {};
	params.page = pageIndex.value;
	params.limit = 10;
	const res = await getStatsList(params);
	if (res.code == 0) {
		let items = res.data.items || [];
		statsList.value;
		let preList = statsList.value;
		if (res.data.page == 1) {
			preList = [];
		}
		statsList.value = [...preList, ...items];
		loading.value = false;
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
	pageIndex.value += 1;
	getSpreadList();
}
</script>

<template>
	<div id="spread-wrap" class="min-wrap-height">
		<div class="title">推广分红</div>
		<div class="small-title">我的推广</div>

		<van-cell-group>
			<van-field
				label="推广链接"
				v-model="ownerInvitation"
				placeholder="请输入推广链接"
				readonly
			>
				<template #button>
					<van-button @click="copy(ownerInvitation)">t('common.copy' )</van-button>
				</template>
			</van-field>
			<div class="tip">*通过此链接进入的朋友注册时自动填写你的邀请码哟</div>
		</van-cell-group>

		<van-cell-group class="active">
			<van-field
				label="我的邀请码"
				v-model="userSpreadCode"
				placeholder="请输入邀请码"
				maxlength="20"
			>
				<template #button>
					<van-button class="active" @click="copy(userSpreadCode)"
						>t('common.copy' )</van-button
					>
					<van-button @click="changeInvitation()">修改</van-button>
				</template>
			</van-field>
			<div class="tip">*邀请码只可修改一次</div>
		</van-cell-group>

		<div class="small-title active">推广明细</div>

		<div class="spread-list">
			<div class="spread-list-title">
				<p>时间</p>
				<p>充值人数</p>
				<p>充值金额</p>
				<p>佣金比例</p>
				<p>我的佣金</p>
			</div>
			<div class="spread-list-tip" v-if="statsList.length == 0">
				您还没有推广
			</div>
			<van-list
				v-else
				v-model="loading"
				:finished="finished"
				:finished-text="t( 'common.noMore' )"
				@load="onLoad"
				:immediate-check="false"
			>
				<div class="spread-list-wrap">
					<div
						class="spread-item"
						v-for="(item, index) in statsList"
						:key="index"
					>
						<p class="hide">{{ item.dataDay }}</p>
						<p>{{ item.chargeNum }}</p>
						<p>{{ item.chargeAmount }}</p>
						<p>1%</p>
						<p>{{ (item.chargeAmount * 0.01).toFixed(2) }}</p>
					</div>
				</div>
			</van-list>
		</div>
	</div>
</template>

<style lang="scss">
#spread-wrap {
	padding: 0 20px;
	box-sizing: border-box;

	.title {
		margin-top: 40px;
		margin-bottom: 40px;
	}

	.small-title {
		font-size: 24px;
		font-weight: bold;
		color: #eee131;

		&.active {
			margin-top: 40px;
			margin-bottom: 40px;
		}
	}

	.van-cell-group {
		background: none;
		position: relative;

		.tip {
			position: absolute;
			color: #eee131;
			font-size: 18px;
			left: 170px;
			bottom: -30px;

			a {
				color: #eee131;
				text-decoration: underline;
			}
		}

		&.active {
			margin-top: 20px;
		}

		&::after {
			border: none;
			border-bottom: 2px solid #fff;
		}

		.van-cell {
			background: none;
			padding: 0;
			height: 100px;

			.van-field__label {
				box-sizing: border-box;
				width: 160px;
				line-height: 100px;
				color: #fff;
				font-size: 24px;
				padding-left: 20px;
			}

			.van-field__body {
				width: 100%;
				height: 100%;

				input {
					width: 100%;
					height: 100%;
					font-size: 24px;
					color: #fff;
				}
			}

			.van-button {
				width: 140px;
				height: 58px;
				border: 3px solid #eee131;
				background: none;
				color: #fff;
				font-size: 24px;

				&.active {
					margin-right: 20px;
				}

				&:active {
					color: #eee131;
				}
			}
		}
	}

	.spread-list {
		.spread-list-title {
			display: flex;
			height: 120px;
			margin-top: -40px;

			p {
				flex: 1;
				line-height: 120px;
				font-size: 24px;
				color: #eee131;
				font-weight: bold;
				text-align: center;
			}
		}

		.spread-list-tip {
			text-align: center;
			line-height: 80px;
			font-size: 28px;
			color: #eee131;
		}

		.spread-list-wrap {
			margin-bottom: 40px;

			.spread-item {
				display: flex;
				height: 100px;
				border-top: 2px solid #fff;
				border-bottom: 2px solid #fff;
				box-sizing: border-box;
				margin-top: -2px;

				p {
					flex: 1;
					line-height: 100px;
					font-size: 24px;
					color: #fff;
					text-align: center;

					span {
						display: block;
						width: 140px;
						height: 60px;
						border: 3px solid #eee131;
						border-radius: 6px;
						margin: 20px auto;
						line-height: 62px;
						text-align: center;
						font-weight: bold;

						&:active {
							color: #eee131;
						}
					}
				}
			}
		}
	}
}
</style>
