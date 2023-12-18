<script setup>
import { ref, computed, onMounted } from "vue";
import { getSpreadDetails, getTodayCommList } from "@/network/api/recharge";
import Detail from "@/views/h5/spreadUser/Detail.vue";
import useClipboard from "vue-clipboard3";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { siteUrl } from "@/config";
import TabsFlex from "@/components/h5/home/TabsFlex.vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const { toClipboard } = useClipboard();
const store = useStore();
const router = useRouter();
const userInfoExt = computed(() => store.state.userInfoExt);
const userSpreadCode = ref(userInfoExt.value.spreadCode);

const ownerInvitation = ref(siteUrl + "?code=" + userInfoExt.value.spreadCode);
const statsList = ref([]);
const pageIndex = ref(1);
const loading = ref(false);
const finished = ref(false);

const detailData = ref({});

onMounted(() => {
	pageIndex.value = 1;
	getSpreadList();
	getDetail();
});

async function copy(value) {
	try {
		await toClipboard(value);
		Notify(t('common.copySuccess' ));
	} catch (e) {
		NotifyF(t('common.copyFail' ));
	}
}

async function getDetail() {
	const res = await getSpreadDetails();
	if (res.code == 0) {
		detailData.value = res.data;
	}
}

const activeButtonIndex = -1; // 初始化为未选中状态

// 点击按钮时切换按钮状态
async function toggleButton(index) {
	this.activeButtonIndex = index;
}

async function getSpreadList() {
	let params = {};
	params.page = pageIndex.value;
	params.limit = 10;
	const res = await getTodayCommList(params);
	if (res.code == 0) {
		let items = res.data.items || [];
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

// 每日奖励
function onClickDayAward() {
	router.push({
		path: "/m/spreadUserDetail",
	});
}

// 每日奖励
function onClickRule() {
	router.push({
		path: "/m/rule",
	});
}

let tabIndex = ref(0);
function tabFlexChangedEvent(event) {
	tabIndex.value = event;
}
</script>

<template>
	<div id="spreadUser-wrap" class="min-wrap-height">
		<!-- <div class="title">推广分红</div> -->

		<div class="spread-data">
			<div class="spread-data-item">
				<div class="element">
					<img class="img" src="@/assets/romimg/spread/Vector.png" />
					<p>{{ t('users.promotion') }}</p>
				</div>
				<div class="spread-data-font">
					<span>{{ detailData.sumUserCount }}</span
					>人
				</div>
			</div>
			<div class="wire"></div>

			<div class="spread-data-item">
				<div class="element">
					<img class="img" src="@/assets/romimg/spread/Vector_5.png" />
					<p>{{ t('users.cumulativeIncome') }}</p>
				</div>
				<div class="spread-data-amount">
					<img src="@/assets/romimg/bag/coins.svg.png" />
					<span>{{ detailData.sumAmount }}</span>
				</div>
			</div>

			<div class="wire"></div>
			<div class="spread-data-item">
				<div class="element">
					<img class="img" src="@/assets/romimg/spread/Frame.png" />
					<p>{{ t('users.bonusRatio') }}</p>
				</div>
				<div class="spread-data-font">
					<span>{{ Math.floor(Number(detailData.rewardScale) * 100) }}</span
					>%
				</div>
			</div>
		</div>

		<div class="spread-cont flexCol">
			<!-- <div class="spread-item"	@click="onClickDayAward()">
				<div class="f-col">
					<div class="spread-item-info"><span>每日奖励</span></div>
				</div>
				<div class="spread-item-btn f-row">
					<img class="spread-title-img" src="@/assets/romimg/spread/arrow_right.png" alt="">
				</div>
			</div> -->

			<div class="spread-item">
				<div class="f-col">
					<div class="spread-item-info">
						<div class="equally">
							<span class="text-2">{{ t('users.mySpreadLink') }}：</span
							><img
								class="img-1"
								src="@/assets/romimg/spread/Vector-1.png"
								@click="onClickRule()"
							/>
						</div>
						<div class="level text">
							<span class="info-content hide">{{ ownerInvitation }}</span>
							<div class="spread-item-btn f-row">
								<div class="spread-btnCol" @click="copy(ownerInvitation)">
									{{ t('common.copy') }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="spread-item">
				<div class="f-col">
					<div class="spread-item-info">
						<span class="text-2">{{ t('users.myInviteCode') }}：</span>
						<div class="level text">
							<span class="text-1">{{ userSpreadCode }}</span>
							<div class="spread-item-btn f-row">
								<div class="spread-btnCol" @click="copy(userSpreadCode)">
									{{ t('common.copy' ) }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<TabsFlex
			@tabFlexChangedEvent="tabFlexChangedEvent"
			paddingTop="20"
			:full="true"
			:item-width="108"
			:items="[t('users.promotion'), t('users.rewardForDays'), t('users.romotionRules')]"
		></TabsFlex>

		<div v-if="tabIndex == 0">
			<div class="spread-list">
				<div class="spread-list-title">
					<p>{{ t('users.spreadUser' ) }}</p>
					<p>{{ t('users.spreadReward' ) }}</p>
					<p>{{ t('users.rechargeMoney' ) }}</p>
				</div>
				<div class="spread-list-tip" v-if="statsList.length == 0">
					········ {{ t('users.noMore' ) }} ········
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
							<p class="hide">{{ item.nickName }}</p>
							<div class="equally-1">
								<p>
									<img
										class="img-2"
										src="@/assets/romimg/bag/coins.svg.png"
									/>{{ item.rewardAmount }}
								</p>
							</div>
							<p>{{ item.chargeAmount }}</p>
						</div>
					</div>
				</van-list>
			</div>
		</div>
		<Detail v-if="tabIndex == 1"></Detail>
		<!-- <div v-if="tabIndex == 1">每日奖励</div> -->
		<div v-if="tabIndex == 2">
			<div class="head-1">
				<div class="head-2">
					<p>{{ t('users.spreadUser' ) }}</p>
					<p>{{ t('users.bonusRatio' ) }}</p>
					<p>{{ t('users.recharge' ) }}</p>
				</div>
				<div class="body-1">
					<p>1</p>
					<p>1%</p>
					<p>0</p>
				</div>
				<div class="body-1">
					<p>2</p>
					<p>2%</p>
					<p>65000</p>
				</div>

				<div class="body-1">
					<p>3</p>
					<p>3%</p>
					<p>130000</p>
				</div>
			</div>
		</div>

		<!-- <div class="piece">
			<div
				class="piece-button"
				:class="{ active: activeButtonIndex === 0 }"
				@click="toggleButton(0)"
			>
				推广分红
			</div>
			<div
				class="piece-button"
				:class="{ active: activeButtonIndex === 1 }"
				@click="toggleButton(1)"
			>
				每日奖励
			</div>
			<div
				class="piece-button"
				:class="{ active: activeButtonIndex === 2 }"
				@click="toggleButton(2)"
			>
				推广规则
			</div>
		</div> -->

		<!-- <div class="spread-steps flexCol">
			<div class="spread-steps-item flexRow">
				<img class="spread-steps-titleImg" src="@/assets/romimg/spread/share.png" alt="">
				<div class="spread-steps-itemInfo f-col">
					<p class="spread-steps-infoTitle">1.分享推广链接</p>
					<p class="spread-steps-infoCont">通过此链接进入的朋友注册时自动填写你的邀请码哟</p>
				</div>
			</div>
			<div class="spread-steps-item flexRow">
				<img class="spread-steps-titleImg" src="@/assets/romimg/spread/recharge.png" alt="">
				<div class="spread-steps-itemInfo f-col">
					<p class="spread-steps-infoTitle">2.好友充值成功</p>
					<p class="spread-steps-infoCont">新用户注册并充值</p>
				</div>
			</div>
			<div class="spread-steps-item flexRow">
				<img class="spread-steps-titleImg" src="@/assets/romimg/spread/bag.png" alt="">
				<div class="spread-steps-itemInfo f-col">
					<p class="spread-steps-infoTitle">3.获得奖励</p>
					<p class="spread-steps-infoCont">邀请奖励立即到账</p>
				</div>
			</div>
			<img class="spread-steps-bg" src="@/assets/romimg/spread/big_bag.png" alt="">
		</div> -->

		<!-- <div class="small-title">等级说明</div> -->

		<!-- <div class="spread-chart">
			<img src="@/assets/romimg/spread/datav.png" alt="">
		</div> -->

		<!-- <div class="small-title">邀请记录</div> -->
	</div>
</template>

<style lang="scss">
#spreadUser-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 750px;
	box-sizing: border-box;

	.head-1 {
		display: flex;
		justify-content: center; /* 水平居中 */
		align-items: center; /* 垂直居中 */
		flex-direction: column; /* 子元素垂直排列 */

		.head-2 {
			height: 80px;
			width: 710px;
			background-color: #111324;
			display: flex;
			// justify-content: center; /* 水平居中 */
			align-items: center; /* 垂直居中 */

			p {
				// // width: 33.333%;
				// color: #535155;
				line-height: 80px;
				text-align: center;/*控制文本居中对齐*/
				// flex: 1;
				font-size: 24px;
				color: #535155;

				&:nth-child(1) {
					width: 25%;
					// margin-left: 90px;
					// margin-left: 41px;
					// margin-right: 128px;
				}
				&:nth-child(2) {
					width: 40%;
					// margin-right: 98px;
				}
				&:nth-child(3) {
					width: 30%;
				}
			}
		}

		.body-1 {
			display: flex;
			// justify-content: center; /* 水平居中 */
			align-items: center; /* 垂直居中 */
			height: 116px;
			width: 710px;
			background-color: #131528;
			margin-bottom: 4px;

			p {
				// // width: 33.333%;
				// color: #535155;
				line-height: 80px;
				// text-align: center;/*控制文本居中对齐*/
				// flex: 1;
				font-size: 24px;
				color: #70c593;

				text-align: center; /*控制文本居中对齐*/
				&:nth-child(1) {
					// width: 23.529%;
					// margin-left: 80px;
					// margin-left: 85px;
					// margin-right: 42px;
					width: 25%;
					color: #ffffff;
					font-weight: bold; /* 加粗字体 */
				}
				&:nth-child(2) {
					// width: 23.529%;
					//	 margin-right: 225px;
					// color: #70C593;
					width: 39%;
					font-weight: bold; /* 加粗字体 */
				}
				&:nth-child(3) {
					// width: 52.941%;
					width: 32%;
					color: #ffffff;
					font-weight: bold; /* 加粗字体 */
				}
			}
		}
	}

	.equally-1 {
		width: 50%;
		display: flex;

		justify-content: center; /* 水平居中 */
		// flex-direction: column; /* 垂直排列 */
		// justify-content: center; /* 水平居中 */
		// margin-right: 45px;
		// background-color: #554BF7;
		// align-items: center; /* 垂直居中 */

		// justify-content: center; /* 水平居中 */
		// align-items: center; /* 垂直居中 */
		// justify-content: space-between; /* 子元素均匀分布，第一个元素在起始位置，最后一个元素在结束位置 */

		P {
			display: flex;
			justify-content: center; /* 水平居中 */
			align-items: center; /* 垂直居中 */
			color: #70c593 !important;
			font-weight: bold; /* 加粗字体 */
		}

		img {
			margin-top: 6px;
		}
	}

	.img-2 {
		width: 24px;
		height: 24px;

		// margin-left: 30px;
		margin-right: 10px;
		// margin-top: 10px;
	}

	// .button {
	//	 /* 按钮样式 */
	// }

	.active {
		background-color: #554bf7 !important;
	}

	.equally {
		display: flex;
		// justify-content: center; /* 水平居中 */
		align-items: center; /* 垂直居中 */
	}

	.img-1 {
		margin-top: 14px;
		width: 29px;
		height: 29px;
	}

	.text {
		// margin-bottom: 16px;
		margin-top: 16px;
	}

	.text-2 {
		margin-left: 20px;
		// margin-bottom: 16px;
		margin-top: 16px;
	}

	.text-1 {
		margin-left: 18px;
	}

	.level {
		display: flex;
		justify-content: center;
		/* 水平居中 */
		align-items: center;
		/* 垂直居中 */
		justify-content: space-between;
		/* 两端对齐 */
		border: 2px solid #1e2037;
		border-radius: 12px;
		// background-color: #E7E232;
		width: 640px;
		height: 53px;
		margin-bottom: 60px;
	}

	// .element {
	// 	// display: flex;
	// 	// justify-content: center; /* 水平居中 */
	// 	// align-items: center; /* 垂直居中 */
	// }

	.element {
		margin-bottom: 10px;
		/* 添加一些垂直间距 */
		display: flex;
		justify-content: center;
		/* 水平居中 */
		align-items: center;
		/* 垂直居中 */
	}

	.img {
		width: 28px;
		height: 28px;
		margin-right: 10px;
		margin-bottom: 19px;
		color: #aa00ff;
	}

	.wire {
		height: 116px;
		width: 2px;
		background-color: #2c3051;
	}

	.title {
		margin-top: 40px;
		margin-bottom: 40px;
	}

	.flexRow {
		width: 100%;
		display: flex;
		flex-direction: row;
		box-sizing: border-box;
	}

	.flexCol {
		width: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.f-row {
		display: flex;
		flex-direction: row;
		box-sizing: border-box;
	}

	.f-col {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.piece {
		width: 93%;
		height: 68px;
		margin-top: 32px;
		// background-color: #E5EFF6;
		display: flex;
		// justify-content: center; /* 水平居中 */
		// align-items: center; /* 垂直居中 */
		.piece-button {
			display: flex;
			justify-content: center; /* 水平居中 */
			align-items: center; /* 垂直居中 */
			width: 142px;
			height: 68px;
			background-color: #15172c;
			border-radius: 12px;
			border: 2px solid #181a31;
			color: #b4b6c8;
			font-size: 24px;
			margin-left: 20px;
		}
	}

	.spread-data {
		width: 92%;
		height: 160px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-end-end-radius: 12px;
		border-radius: 12px;
		background: rgba(25, 33, 44, 0.55);
		box-sizing: border-box;
		padding: 0 40px;
		margin-top: 40px;
		background-color: #1c203c;

		.spread-data-item {
			display: flex;
			justify-content: center;
			/* 水平居中 */
			align-items: center;
			/* 垂直居中 */
			flex-direction: column;
			/* 垂直排列元素 */
			font-size: 28px;

			p {
				color: #b4b6c8;
				line-height: 24px;
				margin-bottom: 15px;
				// font-weight: bold;
			}

			.spread-data-font {
				margin-left: 20px;
				color: #fff;
			}

			.spread-data-amount {
				display: flex;
				align-items: center;

				img {
					width: 30px;
					height: 30px;
					margin-right: 10px;
				}

				span {
					color: #fff;
					font-size: 24px;
					line-height: 24px;
				}
			}
		}
	}

	.spread-cont {
		margin-top: 74px;
		display: flex;
		justify-content: center; /* 水平居中 */
		align-items: center; /* 垂直居中 */
		background-color: #181a31;
		border-radius: 12px;
		width: 93%;
		border: 12px;

		.spread-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin: 0 34px;
			// margin-top: 20px;
			height: 140px;

			.spread-item-info {
				margin-top: 50px;
				display: flex;
				color: #fff;
				font-size: 24px;
				flex-direction: column;
				/* 垂直排列元素 */

				.info-content {
					margin-left: 18px;
					flex: 1;
				}
			}

			.spread-item-tip {
				color: #34587d;
				font-size: 20px;
			}

			.spread-btnCol {
				width: 134px;
				height: 54px;

				border-top-right-radius: 12px;
				/* 右上角圆角 */
				border-bottom-right-radius: 12px;
				/* 右下角圆角 */
				background-color: #554bf7;
				text-align: center;
				line-height: 54px;
				color: #e5eff6;
				font-size: 24px;
				margin-left: 5px;
			}

			.spread-title-img {
				width: 50px;
				height: 50px;
				margin-right: 33px;
			}
		}
	}

	.spread-steps {
		width: 100%;
		position: relative;
		box-sizing: border-box;
		padding: 0 33px;
		margin-top: 18px;

		.spread-steps-item {
			width: 100%;
			height: 140px;
			align-items: center;

			.spread-steps-titleImg {
				width: 44px;
				height: 44px;
			}

			.spread-steps-itemInfo {
				margin-left: 15px;

				.spread-steps-infoTitle {
					font-size: 24px;
					line-height: 24px;
					color: #eee131;
					margin-bottom: 12px;
				}

				.spread-steps-infoCont {
					font-size: 20px;
					color: #fff;
				}
			}
		}

		.spread-steps-bg {
			width: 221px;
			height: 165px;
			position: absolute;
			right: 67px;
			bottom: 35px;
		}
	}

	.small-title {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		line-height: 45px;
		color: #fff;
		font-size: 45px;
		color: #eee131;
		margin-top: 50px;
	}

	.spread-chart {
		width: 100%;
		height: 483px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 49px;
		margin-bottom: 50px;

		img {
			width: 529px;
			height: 483px;
		}
	}

	.spread-list {
		margin-bottom: 40px;
		width: 690px;

		.spread-list-title {
			display: flex;
			justify-content: center; /* 水平居中 */
			align-items: center; /* 垂直居中 */
			height: 80px;
			width: 710px;
			// border-bottom: 1px solid #fff;
			// 	margin-top: 37px;
			background-color: #111324;

			p {
				flex: 1;
				line-height: 60px;
				font-size: 24px;
				text-align: center;
				font-weight: bold;
				color: #535155;
			}

			p:nth-child(2) {
				flex: 2;
			}
		}

		.spread-list-tip {
			text-align: center;
			line-height: 150px;
			font-size: 24px;
			color: #fff;
		}

		.spread-list-wrap {
			// display: flex;
			align-items: center; /* 垂直居中 */
			// width: 710px;
			.spread-item {
				width: 710px;
				height: 116px;
				display: flex;
				align-items: center;
				position: relative;
				// border-bottom: 1px solid #fff;
				margin-bottom: 4px;
				background-color: #131528;
				p {
					text-align: center;
					color: #edf0f7;
					font-size: 24px;

					&:nth-child(1) {
						width: 25%;
					}

					//	 &:nth-child(2) {
					//			 width: 25%;
					// font-weight: bold; /* 加粗字体 */
					//	 }

					&:nth-child(3) {
						width: 25%;
						font-weight: bold; /* 加粗字体 */
						// color: #70C593;
					}

					// &:nth-child(4) {
					//		 width: 25%;
					// }
				}

				p:nth-child(2) {
					flex: 2;
				}
			}
		}
	}
}
</style>
