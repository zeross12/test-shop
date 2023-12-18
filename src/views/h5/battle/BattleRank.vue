<script setup>
import { onMounted, ref, computed } from "vue";
import { getPointRank } from "@/network/api/extend";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useStore } from "vuex";
import { FormatNickname } from "@/util/common";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import ShowDialog from "@/components/h5/common/ShowDialog.vue";

const store = useStore();
const userInfoBase = computed(() => store.state.userInfoBase);
const rankData = ref([]);
const ruleShow = ref(false);
const rankDataTop3 = ref([]);
const rankDataTop3after = ref([]);
const endTime = ref(1697621533141);

onMounted(() => {
  getRank();
});

async function getRank() {
  const res = await getPointRank({ type: 0 });
  if (res.code === 0) {
	rankData.value = res.data || [];
  }
  // rankData.value = JSON.parse(`{
  //   "endTime": "2023-10-30",
  //   "isSettle": true,
  //   "items": [
  //	 {
  //	   "avater": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/head/58d9324c9a68ee0ad28ea17d38b2ece3.png",
  //	   "avaterFrame": "string",
  //	   "nickName": "sssssssss",
  //	   "rankNum": 1,
  //	   "rankPoint": "100",
  //	   "rewardAmount": "20000"
  //	 },
  //	 {
  //	   "avater": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/head/58d9324c9a68ee0ad28ea17d38b2ece3.png",
  //		 "avaterFrame": "string",
  //	   "nickName": "2",
  //	   "rankNum": 2,
  //	   "rankPoint": "2",
  //	   "rewardAmount": "2"
  //	 }, {
  //	   "avater": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/head/58d9324c9a68ee0ad28ea17d38b2ece3.png",
  //		 "avaterFrame": "string",
  //	   "nickName": "3",
  //	   "rankNum": 3,
  //	   "rankPoint": "3",
  //	   "rewardAmount": "20000"
  //	 }
  //	 , {
  //	   "avater": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/head/58d9324c9a68ee0ad28ea17d38b2ece3.png",
  //	   "avaterFrame": "string",
  //	   "nickName": "3",
  //	   "rankNum": 3,
  //	   "rankPoint": "3",
  //	   "rewardAmount": "20000"
  //	 }
  //   ],
  //   "myRankItem": {
  //	 "avater": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/head/58d9324c9a68ee0ad28ea17d38b2ece3.png",
  //	 "avaterFrame": "string",
  //	 "nickName": "string",
  //	 "point": "50",
  //	 "rankNum": 60,
  //	 "rewardAmount": "string",
  //	 "userId": 0
  //   },
  //   "rewardAmount": "20000",
  //   "startTime": "string",
  //   "surplusTime": 3354
  // }`);
  endTime.value = rankData.value.surplusTime * 1000;

  if (rankData.value.items != null && rankData.value.items.length <= 3) {
	rankDataTop3.value = rankData.value.items;
  }

  if (rankData.value.items != null && rankData.value.items.length > 3) {
	rankDataTop3.value = rankData.value.items.slice(0, 3);
	rankDataTop3after.value = rankData.value.items.slice(3);
  }
}
function finish() {
  getRank();
}
function parseInts(num) {
  return Math.floor(num).toLocaleString("en-US");
}
function ToastShow() {
  showToast.value = true;
  setTimeout(() => {
	showToast.value = false;
  }, 3000);
}
const top_name = ref([
  { name: "第一名", color: "#FFC164" },
  { name: "第二名", color: "#DAE3F5" },
  { name: "第三名", color: "#CE8372" },
]);
const showToast = ref(false);
</script>

<template>
  <div id="battleRank" class="">
	<TopTitleBack>排行榜</TopTitleBack>
	<div class="banner-wrap">
	  <div class="open-box-rule-desc">{{ t( 'rank.timeLeft' ) }}</div>
	  <div class="open-box-rule-money">
		<img class="currency" src="@/assets/romimg/common/c.png" alt="" />{{
		  parseInts(rankData.rewardAmount)
		}}
		<img
		  class="hot"
		  v-if="false"
		  src="@/assets/romimg/rank/hot.png"
		  alt=""
		/>
	  </div>

	  <div class="to-timing-desc">{{ t( 'rank.timeLeft' ) }}</div>
	  <div class="to-timing-wrap">
		<van-count-down
		  millisecond
		  :time="endTime"
		  format="DD 天, HH:mm:ss"
		  @finish="finish"
		>
		</van-count-down>
	  </div>
	  <div class="open-box-rule-btn" @click="ruleShow = true">{{ t( 'rank.rule' ) }}</div>
	</div>

	<div class="rank-wrap">
	  <div class="rank-item head">
		<div class="item-info"># &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ t( 'battle.users' ) }}</div>
		<div class="point">{{ t( 'rank.point' ) }}</div>
		<div class="balance">{{ t( 'rank.balance' ) }}</div>
	  </div>
	  <div
		class="self-item rank-item"
		v-if="
		  rankData.items && rankData.myRankItem && rankData.myRankItem != null
		"
	  >
		<div class="item-info">
		  <span class="no"
			>{{
			  rankData.myRankItem.rankNum > 50 ||
			  rankData.myRankItem.rankNum <= 0
				? "50+"
				: rankData.myRankItem.rankNum + ""
			}}
		  </span>
		  <img v-if="userInfoBase" :src="userInfoBase.avater" alt="" />
		  <div>
			<!-- <div class="sort-desc">您的排名</div> -->
			<div class="self-nickname">
			  {{ FormatNickname(userInfoBase.nickName, 6) }}
			</div>
		  </div>
		</div>
		<div class="point">
		  {{ rankData.myRankItem.point == "" ? 0 : rankData.myRankItem.point }}
		</div>
		<div class="balance" style="padding-left: 0px">
		  <div class="next-desc">{{ t( 'rank.onListTip' ) }}</div>
		  <div class="next-point">
			{{
			  rankData.myRankItem.point == ""
				? parseInt(rankData.items[rankData.items.length - 1].point)
				: parseInt(rankData.items[rankData.items.length - 1].point) -
				  parseInt(rankData.myRankItem.point)
			}}
			<img
			  class="warn"
			  @click="ToastShow"
			  src="@/assets/romimg/rank/warn.png"
			  alt=""
			/>
		  </div>
		</div>
	  </div>
	  <div
		class="rank-item"
		:class="{
		  top1: index == 0,
		  top2: index == 1,
		  top3: index == 2,
		}"
		v-for="(item, index) in rankDataTop3"
		:key="index"
	  >
		<div class="item-info">
		  <img :src="item.avater" alt="" />
		  <div>
			<div class="self-nickname">
			  {{ FormatNickname(item.nickName, 6) }}
			</div>
			<div class="sort-desc" :style="{ color: top_name[index].color }">
			  <!-- {{ top_name[index].name }} -->
			</div>
		  </div>
		</div>
		<div class="point">
		  {{  Math.floor(item.point) }}
		</div>
		<div class="balance">{{  Math.floor(item.rewardAmount) }}</div>
	  </div>

	  <div
		v-for="(item, index) in rankDataTop3after"
		class="rank-item bottom-border"
		:key="index"
	  >
		<div class="item-info">
		  <span class="no">{{ index + 4 }}</span>
		  <img :src="item.avater" alt="" />
		  <span class="nickname">{{ FormatNickname(item.nickName, 6) }}</span>
		</div>
		<div class="point">
		  {{ item.point }}
		</div>
		<div class="balance">{{ item.rewardAmount }}</div>
	  </div>
	  <!-- <div v-if="rankData.items == null" class="nodata">暂无数据</div> -->
	</div>

	<ShowDialog
	  :btnType="-1"
	  :title="t( 'rank.rule' )"
	  :show="ruleShow"
	  @cancel="ruleShow = false"
	>
	  <div class="dialog-x-content">
		<div class="dialog-row-wrap">* {{ t( 'rank.top50Tip' ) }}</div>
		<div class="dialog-row-wrap">* {{ t( 'rank.settleTip' ) }}</div>
		<div class="dialog-row-wrap">
		  * {{ t( 'rank.pointTip' ) }}
		</div>
		<div class="dialog-row-wrap">
		  * {{ t( 'rank.finishTip' ) }}
		</div>
		<div class="dialog-row-wrap">
		  * {{ t( 'rank.ruleTip' ) }}
		</div>
	  </div>
	</ShowDialog>
	<div class="toast-wrap" v-if="showToast">
	   {{ t( 'rank.myRankTip' ) }}
	</div>
  </div>
</template>

<style lang="scss" scoped>
#battleRank {
  width: 750px;
  min-height: calc(100vh - 500px);
  .toast-wrap {
	padding: 30px 20px;
	border-radius: 16px;
	background: #282830;
	color: #d6d5d6;
	text-align: center;
	font-size: 24px;
	font-style: normal;
	font-weight: 400;
	line-height: 32px; /* 133.333% */
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	white-space: nowrap;
  }
  .dialog-row-wrap {
	margin: 20px !important;
  }

  .banner-wrap {
	width: 710px;
	height: 360px;
	margin: auto;
	border-radius: 8px;
	background: url(@/assets/romimg/rank/banner.png) no-repeat;
	background-size: cover;
	padding: 40px 32px;
	box-sizing: border-box;
	.open-box-rule-desc {
	  color: #898a91;
	  font-size: 24px;
	  font-style: normal;
	  font-weight: 400;
	  line-height: 24px; /* 100% */
	}
	.open-box-rule-money {
	  color: #fff8f2;
	  font-size: 56px;
	  font-style: normal;
	  font-weight: 700;
	  line-height: 66px; /* 120% */

	  .currency {
		width: 40px;
		height: 40px;
		vertical-align: middle;
		margin-right: 10px;
		margin-top: -8px;
	  }
	  .hot {
		width: 60px;
		height: 40px;
		vertical-align: top;
		margin-top: -16px;
	  }
	}
	.to-timing-desc {
	  color: #898a91;
	  font-size: 24px;
	  font-style: normal;
	  font-weight: 400;
	  line-height: 32px;
	  margin-top: 40px;
	}
	.to-timing-wrap {
	  color: #ffcd6c;
	  font-size: 28px;
	  font-style: normal;
	  font-weight: 700;
	  line-height: 36px;
	  .van-count-down {
		color: #ffcd6c;
		font-size: 28px;
		font-style: normal;
		font-weight: 700;
		line-height: 36px;
	  }
	}
	.open-box-rule-btn {
	  margin-top: 20px;
	  width: 196px;
	  height: 68px;
	  color: #6c6b74;
	  line-height: 68px;
	  text-align: center;
	  font-weight: bold;
	  border-radius: 12px;
	  background: #31313f;
	}
  }

  .top-item-wrap {
	margin-top: 20px;
	display: flex;
	width: 710px;
	height: 190px;
	padding: 0px 10px 0px 25px;
	box-sizing: border-box;
	justify-content: center;
	align-items: center;

	border-radius: 16px;
	// border: 1px dashed rgba(119, 106, 102, 0.12);
	// background: rgba(37, 35, 43, 0.7);

	border-radius: 8px;
	border: 2px dashed #1e2037;

	background: #111324;

	.head-wrap {
	  background: url(@/assets/romimg/rank/top_bg.png) no-repeat;
	  background-size: cover;
	  width: 130px;
	  height: 188px;
	  position: relative;
	  display: flex;
	  flex-direction: column;
	  justify-content: center;
	  align-items: center;
	  img {
		width: 60px;
		height: 60px;
		margin-top: 50px;
		border-radius: 24px;
	  }
	  .num {
		margin-top: 10px;
		color: #2c1812;
		font-size: 28px;
		font-style: normal;
		font-weight: 700;
		line-height: 28px; /* 95.087% */
	  }
	}
	.item-wrap {
	  width: 510px;
	  height: 190px;
	  display: flex;
	  flex-direction: column;
	  justify-content: center;
	  align-items: center;
	  .row1 {
		color: #71e3a0;

		font-size: 32px;
		font-style: normal;
		font-weight: 700;
		line-height: 36px; /* 112.5% */
	  }
	  .row2 {
		color: #ffcd6c;
		font-size: 24px;
		font-style: normal;
		font-weight: 700;
		line-height: 36px; /* 150% */
		img {
		  width: 32px;
		  height: 32px;
		  vertical-align: middle;
		  margin-left: 10px;
		}
	  }
	  .row3 {
		margin-top: 16px;
		color: #bec0c5;
		font-size: 24px;
		font-style: normal;
		font-weight: 400;
		line-height: 36px; /* 150% */
	  }
	}
  }

  .rank-wrap {
	width: 710px;
	// display: flex;
	// flex-direction: column;
	// align-items: center;
	// justify-content: center;
	margin: auto;
	margin-top: 20px;

	box-sizing: border-box;

	.rank-item {
	  width: 100%;
	  display: flex;
	  align-items: center;
	  color: #fff;
	  font-size: 24px;
	  height: 116px;
	  font-weight: 500;
	  margin-bottom: 4px;
	  &.bottom-border {
		border-radius: 12px;
		//  border-bottom: 1px solid #1d203e;
		background: #0d0f1e;
	  }
	  &.self-item {
		width: 710px;
		height: 148px !important;
		display: flex;
		align-items: center;
		border-radius: 12px;
		background: url(@/assets/romimg/rank/self_bg.png) no-repeat;
		background-size: cover;
	  }
	  &.top1 {
		background: url(@/assets/romimg/rank/top1_bg.png) no-repeat;
		background-size: cover;
		.item-info {
		  padding-left: 60px !important;
		  box-sizing: border-box;
		}
	  }
	  &.top2 {
		background: url(@/assets/romimg/rank/top2_bg.png) no-repeat;
		background-size: cover;
		.item-info {
		  padding-left: 60px !important;
		  box-sizing: border-box;
		}
	  }
	  &.top3 {
		background: url(@/assets/romimg/rank/top3_bg.png) no-repeat;
		background-size: cover;
		.item-info {
		  padding-left: 60px !important;
		  box-sizing: border-box;
		}
	  }

	  &.head {
		color: #535155 !important;
		font-size: 24px;
		height: 90px !important;
		.item-info {
		  width: 270px;
		  padding-left: 20px !important;
		  box-sizing: border-box;
		}
		.point {
		  color: #535155 !important;
		  width: 220px;
		  text-align: left;
		  font-weight: 400;
		}
		.balance {
		  text-align: left;
		  font-weight: 400;
		  width: 210px;
		  color: #535155 !important;
		}
	  }

	  .left {
		width: 43px;
		height: 32px;
	  }

	  .item-info {
		width: 270px;
		display: flex;
		align-items: center;
		padding-left: 15px;
		box-sizing: border-box;
		position: relative;

		.no {
		  color: #a1a1a5;
		  font-size: 24px;
		  font-weight: 500;
		  width: 50px;
		  box-sizing: border-box;
		}
		.nickname {
		  color: #edf0f7;
		  margin-left: 20px;
		  box-sizing: border-box;
		}
		img {
		  width: 52px;
		  height: 52px;
		  border-radius: 8px;
		}
		.sort-desc {
		  padding-left: 20px;
		  color: #ffe2b8;
		  box-sizing: border-box;
		}
		.self-nickname {
		  box-sizing: border-box;
		  padding-left: 20px;
		  color: #edf0f7;
		  font-size: 26px;
		}
	  }
	  .point {
		width: 220px;
		color: #ffcd6c;
		font-weight: bold;
		text-align: left;
		padding-left: 40px;
		box-sizing: border-box;
	  }

	  .balance {
		font-weight: bold;
		padding-left: 40px;
		box-sizing: border-box;
		width: 210px;
		color: #70c593;
		.warn {
		  width: 42px;
		  height: 30px;
		  vertical-align: middle;
		}
		.next-desc {
		  color: #8f8479;
		  font-size: 24px;
		  font-weight: 700;
		}
		.next-point {
		  color: #ecdfd2;
		  font-size: 24px;
		  font-weight: 700;
		  line-height: 24px;
		  margin-top: 10px;
		}
	  }
	}
  }
}
</style>
