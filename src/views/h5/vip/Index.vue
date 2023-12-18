<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, computed, onMounted } from "vue";

import { Autoplay, Pagination, Navigation, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { getAvaterFrameList } from "@/network/api/user";
import "swiper/less/autoplay";
import "swiper/css/navigation";
import { getVipLevelList, getVipReward } from "@/network/api/user";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import TabsFlex from "@/components/h5/home/TabsFlex.vue";
 

// import { transform } from 'lodash';

const router = useRouter();
const store = useStore();
const userInfoBase = computed(() => store.state.userInfoBase);
// vip等级列表
const levelList = ref([]);
const frameList = ref([]);
// 当前vip等级
const level = ref(userInfoBase.value.userLevel);
// 当前累计充值金额
const chargeAmount = ref(0);
// vip进度
const vipRate = ref(0);

// 最小等级金额
const minVipAmount = ref(0);
// 下个等级
const nextVipLevel = ref(0);
// 距离下个等级还需要
const nextVipAmount = ref(0);

const navigation = ref({
	nextEl: ".swiper-button-next",
	prevEl: ".swiper-button-prev",
});

const swiperModules = [Autoplay, Pagination, Navigation];

onMounted(() => {
	getVipLevelRecord();
	getFrame();
});

// 获取vip等级列表
async function getVipLevelRecord() {
	const res = await getVipLevelList();
	if (res.code === 0) {
		// window.$dev && console.log('用户VIP信息',res.data);
		// window.$dev && console.log('用户V信息',store.state.useStore);
		let items = res.data.items || [];
		let cAmount = res.data.chargeAmount || 0;
		//let cAmount = store.state.useStore.chargeAmount || 0;
		levelList.value = items;
		window.$dev && console.log("levelList.value", levelList.value);
		//chargeAmount.value = cAmount;
		chargeAmount.value = cAmount;
		getVipRate();
	}
}

// 获取vip进度
function getVipRate() {
	let levelArr = levelList.value;
	let cAmount = Number(chargeAmount.value);
	let nextIndex = 0; // 下一级索引
	let num = 0;
	if (levelArr.length == 0) {
		return;
	}
	let result = levelArr.filter((item, index) => {
		if (Number(item.needAmount) > cAmount) {
			if (nextIndex < 1) {
				nextIndex = index;
			}
			return item;
		}
	});
	// 获取下个等级
	let nextVip = {};
	if (result.length > 0) {
		nextVip = result[0];
	} else {
		nextVip = levelArr[levelArr.length - 1];
		nextIndex = levelArr.length - 1;
	}
	nextVipLevel.value = nextVip.level;
	minVipAmount.value = Number(levelArr[0].needAmount);

	let nextAmount = parseFloat(nextVip.needAmount); // 下个等级所需金额
	let preAmount = parseFloat(levelArr[nextIndex - 1].needAmount); // 上个等级所需金额

	nextVipAmount.value = parseFloat(nextAmount - cAmount);

	let toAmount = nextAmount - preAmount;
	let needAmount = nextAmount - cAmount;
	// nextVipAmount.value = needAmount > 0 ? needAmount : 0	// 距离下级需要

	if (nextVipAmount.value == 0) {
		level.value = levelArr[levelArr.length - 1].level; // 当前等级10
	} else {
		level.value = levelArr[nextIndex - 1].level; // 当前等级
	}

	let curRateAmount = cAmount - preAmount;

	let curRate = (curRateAmount / toAmount) * 100;

	curRate = curRate < 100 ? curRate : 100;

	vipRate.value = curRate + "%";
}

//路由跳转
function jumpRoute(v) {
	router.push(v);
}

// 领取vip福利
function getWelfare(item) {
	if (item.level) {
		let params = {
			level: item.level,
		};
		getVipReward(params).then((res) => {
			if (res.code == 0) {
				store.dispatch("getUserInfo");
				Notify(t('vip.receiveReward',{amount : res.data.amount}));
				getVipLevelRecord();
			}
		});
	}
}
let tabsData = ref({
	items: [t('vip.reward'), t('vip.intro')],
	index: 0,
});
function tabChangedEvent(event) {
	tabsData.value.index = event;
}
const prevEl = (item, index) => {
	window.$dev && console.log(t('lucky.prev') + index + item);
};
const nextEl = () => {
	window.$dev && console.log(t('lucky.next'));
};

function goToPay() {
	router.push("/m/recharge");
}
async function getFrame() {
	let res = await getAvaterFrameList();
	if (res.code == 0) {
		let items = res.data.items || [];
		frameList.value = items;
		window.$dev && console.log("frameList", frameList.value);
	}
}
</script>

<template>
	<div id="vip">
		<TopTitleBack :title="t('vip.rewmyLevelard')"></TopTitleBack>
		<!-- <div class="vip-top-wrap">
			<div class="level-wrap">
				<div class="level-img" v-if="false">
					 <img class="level0 level" :class="{ active: level == 0 }" src="@/assets/romimg/vip/vip_r_vip0.png">
								<img class="level1 level" :class="{ active: level == 1 }" src="@/assets/romimg/vip/vip_r_vip1.png">
								<img class="level2 level" :class="{ active: level == 2 }" src="@/assets/romimg/vip/vip_r_vip2.png">
								<img class="level3 level" :class="{ active: level == 3 }" src="@/assets/romimg/vip/vip_r_vip3.png">
								<img class="level4 level" :class="{ active: level == 4 }" src="@/assets/romimg/vip/vip_r_vip4.png">
								<img class="level5 level" :class="{ active: level == 5 }" src="@/assets/romimg/vip/vip_r_vip5.png">
								<img class="level6 level" :class="{ active: level == 6 }" src="@/assets/romimg/vip/vip_r_vip6.png">
								<img class="level7 level" :class="{ active: level == 7 }" src="@/assets/romimg/vip/vip_r_vip7.png">
								<img class="level8 level" :class="{ active: level == 8 }" src="@/assets/romimg/vip/vip_r_vip8.png">
								<img class="level9 level" :class="{ active: level == 9 }" src="@/assets/romimg/vip/vip_r_vip9.png">
								<img class="level10 level" :class="{ active: level == 10 }" src="@/assets/romimg/vip/vip_r_vip10.png">
								<div class="jiantou_wrap" :class="'jiantou_wrap' + level">
										<img class="jiantou" src="@/assets/romimg/vip/vip_jiantou.png">
								</div>	
					<div class="level-back">
						<div class="level-info-wrap">
							<HeadPortrait
								:userModel="userInfoBase"
								:size="'roll_join'"
							></HeadPortrait>
							<img
								v-if="level == 0"
								class="level-img-cont"
								src="@/assets/romimg/vip/vip_vip0.png"
							/>
							<img
								v-else-if="level == 1"
								class="level-img-cont"
								src="@/assets/romimg/vip/vip_vip1.png"
							/>
							<img
								v-else-if="level == 2"
								class="level-img-cont"
								src="@/assets/romimg/vip/vip_vip2.png"
							/>
							<img
								v-else-if="level == 3"
								class="level-img-cont"
								src="@/assets/romimg/vip/vip_vip3.png"
							/>
							<img
								v-else-if="level == 4"
								class="level-img-cont"
								src="@/assets/romimg/vip/vip_vip4.png"
							/>
							<img
								v-else-if="level == 5"
								class="level-img-cont"
								src="@/assets/romimg/vip/vip_vip5.png"
							/>
							<img
								v-else-if="level == 6"
								class="level-img-cont"
								src="@/assets/romimg/vip/vip_vip6.png"
							/>
							<img
								v-else-if="level == 7"
								class="level-img-cont"
								src="@/assets/romimg/vip/vip_vip7.png"
							/>
							<img
								v-else-if="level == 8"
								class="level-img-cont"
								src="@/assets/romimg/vip/vip_vip8.png"
							/>
							<img
								v-else-if="level == 9"
								class="level-img-cont"
								src="@/assets/romimg/vip/vip_vip9.png"
							/>
							<img
								v-else-if="level == 10"
								class="level-img-cont"
								src="@/assets/romimg/vip/vip_vip10.png"
							/>
							<span>累计金额</span>
							<p>{{ chargeAmount }}</p>
						</div>
						<div
							class="level-num-wrap level-num-wrap0"
							:class="{ active: level == 0 }"
						>
							<div class="level-num-v"></div>
							<div class="level-num-d"></div>
						</div>
						<div
							class="level-num-wrap level-num-wrap1"
							:class="{ active: level == 1 }"
						>
							<div class="level-num-v"></div>
							<div class="level-num-d"></div>
						</div>
						<div
							class="level-num-wrap level-num-wrap2"
							:class="{ active: level == 2 }"
						>
							<div class="level-num-v"></div>
							<div class="level-num-d"></div>
						</div>
						<div
							class="level-num-wrap level-num-wrap3"
							:class="{ active: level == 3 }"
						>
							<div class="level-num-v"></div>
							<div class="level-num-d"></div>
						</div>
						<div
							class="level-num-wrap level-num-wrap4"
							:class="{ active: level == 4 }"
						>
							<div class="level-num-v"></div>
							<div class="level-num-d"></div>
						</div>
						<div
							class="level-num-wrap level-num-wrap5"
							:class="{ active: level == 5 }"
						>
							<div class="level-num-v"></div>
							<div class="level-num-d"></div>
						</div>
						<div
							class="level-num-wrap level-num-wrap6"
							:class="{ active: level == 6 }"
						>
							<div class="level-num-d"></div>
							<div class="level-num-v"></div>
						</div>
						<div
							class="level-num-wrap level-num-wrap7"
							:class="{ active: level == 7 }"
						>
							<div class="level-num-d"></div>
							<div class="level-num-v"></div>
						</div>
						<div
							class="level-num-wrap level-num-wrap8"
							:class="{ active: level == 8 }"
						>
							<div class="level-num-d"></div>
							<div class="level-num-v"></div>
						</div>
						<div
							class="level-num-wrap level-num-wrap9"
							:class="{ active: level == 9 }"
						>
							<div class="level-num-d"></div>
							<div class="level-num-v"></div>
						</div>
						<div
							class="level-num-wrap level-num-wrap10"
							:class="{ active: level == 10 }"
						>
							<div class="level-num-d"></div>
							<div class="level-num-v"></div>
						</div>
						<div
							class="level-num-wrap level-num-wrap10"
							:class="{ active: level == 11 }"
						>
							<div class="level-num-d"></div>
							<div class="level-num-v"></div>
						</div>
						<div
							class="level-num-light"
							:class="'level-num-light' + level"
						></div>
					</div>
				</div>
				<div class="current">
					<div class="current-cont">
						<div class="current-flag"></div>

						<div class="current-title">
							<i
								>LV<span>{{ level }}</span></i
							><span class="current-title-font">会员</span>
						</div>
						<div class="current-sum">
							当前累计<span>{{ chargeAmount }}</span>
						</div>
						<div class="current-bottom">
							<div class="current-info">
								<div class="current-need-price">
									距离升级还需要<span>{{ nextVipAmount }}</span>
								</div>
								<div class="current-need-line">
									<div
										class="current-need-lineLight"
										:style="{ width: vipRate }"
									></div>
								</div>

								<div class="current-leavl" v-if="chargeAmount < minVipAmount">
									<span>LV</span>
									<span>LV{{ nextVipLevel }}</span>
								</div>
								<div
									class="current-leavl"
									v-else-if="chargeAmount > minVipAmount && level < 10"
								>
									<span>LV{{ level }}</span>
									<span>LV{{ nextVipLevel }}</span>
								</div>
								<div class="current-leavl" v-else>
									<span>LV{{ nextVipLevel - 1 }}</span>
									<span>LV{{ nextVipLevel }}</span>
								</div>
							</div>
							<div class="current-recharge" @click="jumpRoute('/m/recharge')">
								立即充值
							</div>
						</div>
					</div>
				</div>
			</div>
		</div> -->
		<div class="level-swiper-wrap">
			<swiper
				class="swiper-container swiper-wrapper"
				:slides-per-view="1.2"
				:initial-slide="level"
				:centered-slides="true"
				:speed="400"
				:allowTouchMove="true"
				:navigation="navigation"
				:pagination="{ clickable: true }"
			>
				<swiper-slide
					class="swiper-slide"
					v-for="(item, index) in levelList"
					:key="index"
				>
					<div class="swiper-item">
						<div
							class="left-top-wrap"
							:class="{
								done: parseFloat(chargeAmount) > parseFloat(item.needAmount),
							}"
						>
							{{
								parseFloat(chargeAmount) > parseFloat(item.needAmount)
									? t('vip.achieved')
									: t('vip.unAchieved')
							}}
						</div>
						<div class="level">LV.{{ item.level }}</div>
						<div class="desc">
							{{ t('timebox.needRecharge') }}
							<span v-if="levelList[index + 1]">
								{{
									parseFloat(levelList[index + 1].needAmount) -
										parseFloat(chargeAmount) >
									0
										? parseFloat(levelList[index + 1].needAmount) -
											parseFloat(chargeAmount)
										: 0
								}}
							</span>
							<span v-else>
								{{
									parseFloat(levelList[index].needAmount) -
										parseFloat(chargeAmount) >
									0
										? parseFloat(levelList[index].needAmount) -
											parseFloat(chargeAmount)
										: 0
								}}
							</span>
							{{ t('vip.upgradeToLevel') }}.{{
								item.level == levelList.length - 1 ? item.level : item.level + 1
							}}
						</div>
						<div
							class="frame-wrap"
							:class="{
								active: parseFloat(chargeAmount) > parseFloat(item.needAmount),
							}"
						>
							<img
								v-if="
									index > 0 &&
									parseFloat(chargeAmount) < parseFloat(item.needAmount)
								"
								class="lock-img"
								src="@/assets/romimg/vip/lock.png"
								alt=""
							/>
							<img
								class="frame-img"
								v-if="index > 0 && frameList[index - 1]"
								:src="frameList[index - 1].avaterFrame"
								alt=""
							/>
							<img
								class="frame-img"
								v-else-if="index > 0"
								:src="frameList[index - 2].avaterFrame"
								alt=""
							/>
						</div>
						<div
							class="unlock"
							@click="goToPay"
							v-if="parseFloat(chargeAmount) > parseFloat(item.needAmount)"
						>
							{{ t('vip.buyPoint') }}
						</div>
						<div class="unlock" @click="goToPay" v-else>{{ t('vip.lock') }}</div>
						<div
							class="current-need-line"
							v-if="
								levelList[index + 1] &&
								parseFloat(chargeAmount) <
									parseFloat(levelList[index + 1].needAmount)
							"
						>
							<div
								class="current-need-lineLight"
								:style="{ width: vipRate }"
							></div>
						</div>
						<!-- <div class="current-need-line" v-else>
							<div
								class="current-need-lineLight"
								:style="{ width: vipRate }"
							></div>
						</div> -->
					</div>
				</swiper-slide>
			</swiper>
		</div>
		<div class="tabs-wrap">
			<TabsFlex
				@tabFlexChangedEvent="tabChangedEvent"
				:paddingTop="20"
				:item-height="34"
				:fontsize="14"
				:items="tabsData.items"
			></TabsFlex>
		</div>
		<div class="vip-table-wrap" v-if="tabsData.index == 0">
			<div class="vip-table-item-list">
				<div class="vip-table-item-title">
					<div>{{ t('vip.myLevel') }}</div>
					<div>{{ t('users.rechargeMoneyTotal') }}</div>
					<div>{{ t('vip.award') }}</div>
					<div>{{ t('vip.giftpack') }}</div>
				</div>
				<div
					class="vip-table-item-list-item"
					v-for="item in levelList"
					:key="item.level"
				>
					<div>VIP{{ item.level }}</div>
					<div>{{ item.needAmount }}</div>
					<div>{{ item.rewardAmount }}</div>
					<div v-if="item.status == 1" class="get-status1">
						<p v-if="item.level == 0" class="vip0-p">-</p>
						<p v-else class="btn-get-status" @click="getWelfare(item)">{{ t('redpack.receive') }}</p>
					</div>
					<div v-else-if="item.status == 2" class="get-status2">
						<p class="btn-get-status">{{ t('redpack.received') }}</p>
					</div>
					<div v-else class="get-status0">{{ t('vip.unlock') }}</div>
				</div>

				<div class="not_yet" v-if="!levelList || levelList.length == 0">
					{{ t('users.noMore') }}
				</div>
			</div>
		</div>
		<div class="vip-notice-wrap" v-if="tabsData.index == 1">
			<div class="vip-notice-title">{{ t('vip.intro') }}</div>
			<div class="vip-notice-item">
				<div class="vip-notice-item-q">
					<img src="@/assets/romimg/vip/question.png" alt="" /> {{ t('vip.question1') }}
				</div>
				<div class="vip-notice-item-a">
					<img src="@/assets/romimg/vip/answer.png" alt="" />
					{{ t('vip.answer1') }}
				</div>
			</div>
			<div class="vip-notice-item">
				<div class="vip-notice-item-q">
					<img src="@/assets/romimg/vip/question.png" alt="" />
					{{ t('vip.question2') }}
				</div>
				<div class="vip-notice-item-a">
					<img src="@/assets/romimg/vip/answer.png" alt="" />
					{{ t('vip.answer2') }}
				</div>
			</div>
			<div class="vip-notice-item">
				<div class="vip-notice-item-q">
					<img src="@/assets/romimg/vip/question.png" alt="" />
					{{ t('vip.question3') }}
				</div>
				<div class="vip-notice-item-a">
					<img src="@/assets/romimg/vip/answer.png" alt="" />
					{{ t('vip.answer3') }}
				</div>
			</div>
			<div class="vip-notice-item">
				<div class="vip-notice-item-q">
					<img src="@/assets/romimg/vip/question.png" alt="" />
					{{ t('vip.question4') }}
				</div>
				<div class="vip-notice-item-a">
					<img src="@/assets/romimg/vip/answer.png" alt="" />
					{{ t('vip.answer4') }}
				</div>
			</div>
			<div class="vip-notice-item">
				<div class="vip-notice-item-q">
					<img src="@/assets/romimg/vip/question.png" alt="" />
					{{ t('vip.question5') }}
				</div>
				<div class="vip-notice-item-a">
					<img src="@/assets/romimg/vip/answer.png" alt="" />
					{{ t('vip.answer5') }}
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
#vip {
	.level-swiper-wrap {
		.swiper-container {
			box-sizing: border-box;
			width: 750px;
			height: 260px;

			.swiper-slide-active {
				transform: scale(1);
			}

			.swiper-slide-next {
				transform: scale(0.9);
			}
			.swiper-slide-prev {
				transform: scale(0.9);
			}

			.swiper-slide {
				width: 100%;
				height: 100%;
				transition: transform 0.3s ease-in-out;

				.swiper-item {
					display: block;
					background-image: url(@/assets/romimg/vip/user-level-bg.png);
					width: 100%;
					height: 100%;
					background-position: center;
					background-repeat: no-repeat;
					background-size: cover;
					padding-top: 10px;
					box-sizing: border-box;
					position: relative;
					border-radius: 20px !important;
					.left-top-wrap {
						position: absolute;
						border-top-left-radius: 20px;
						border-bottom-right-radius: 20px;
						color: #fff;
						background: linear-gradient(286deg, #c6c6c6 0%, #8a8b90 100%);
						top: 0;
						left: 0;
						padding-left: 10px;
						padding-right: 10px;
						height: 48px;
						line-height: 48px;
						&.done {
							color: #353232;
							background: linear-gradient(286deg, #e7dab2 0%, #9c9374 100%);
						}
					}
					.level {
						color: #fff;
						font-size: 28px;
						font-style: normal;
						font-weight: 400;
						margin-left: 24px;
						margin-top: 72px;
					}
					.desc {
						margin-left: 24px;
						margin-top: 40px;
						color: #838594;
						font-size: 24px;
						font-style: normal;
						font-weight: 400;
						span {
							color: #ddd1aa;
						}
					}
					.frame-wrap {
						position: absolute;
						top: 20px;
						right: 50px;
						width: 160px;
						height: 160px;
						.lock-img {
							position: absolute;
							top: 60px;
							right: 63px;
							width: 38px;
						}
						.frame-img {
							right: 160px;
							width: 160px;
							filter: grayscale(100%);
						}
						&.active {
							.frame-img {
								filter: grayscale(0%);
							}
						}
					}
					.unlock {
						position: absolute;
						border-radius: 50px;
						background: linear-gradient(180deg, #a48f46 0%, #f9e5a3 100%);

						color: #211c0d;
						font-size: 22px;
						font-style: normal;
						font-weight: 500;

						width: 128px;
						height: 44px;
						line-height: 44px;
						right: 70px;
						top: 180px;
						text-align: center;
					}
					.current-need-line {
						width: 260px;
						height: 12px;
						border-radius: 12px;
						background: #191c23;
						position: relative;
						margin: 14px 0;
						margin-left: 24px;
						.current-need-lineLight {
							width: 100px;
							height: 4px;
							background: #c6c6c6;
							border-radius: 12px;
							position: absolute;

							left: 0;
							top: 5px;
						}
					}
				}
			}
			.swiper-button-prev {
				color: #fff;
				// padding-bottom: 100px !important;
				top: 110px;
				position: absolute;
				// top: 66px;
				// left: 20px;
				// span {
				//	 font-size: 50px;
				// }
			}

			.swiper-button-next {
				top: 110px;
				position: absolute;
				color: #fff;
				// font-size: 40px !important;
				// font-weight: 300;
			}
		}

		.swiper-container .swiper-wrapper {
			-webkit-transition-timing-function: linear;
			-moz-transition-timing-function: linear;
			-ms-transition-timing-function: linear;
			-o-transition-timing-function: linear;
			transition-timing-function: linear;
		}
	}
	.tabs-wrap {
		width: 710px;
		border-radius: 12px;
		background: #1c203c;
		margin: auto;
		margin-top: 40px;
	}

	.level-wrap {
		background-size: 100% auto;
		width: 100%;
		position: relative;

		.vip-title {
			display: flex;
			justify-content: center;
			align-items: center;
			color: #fff;
			font-size: 32px;

			img {
				margin-right: 8px;
				width: 32px;
				height: 40px;
			}
		}

		.level-img {
			width: 100%;
			height: 418px;
			overflow: hidden;

			.level-back {
				width: 574px;
				height: 293px;
				background: url(@/assets/romimg/vip/level_back.png) no-repeat center
					center;
				background-size: cover;
				margin: 75px auto 0;
				position: relative;

				.level-info-wrap {
					width: 200px;
					position: absolute;
					left: 50%;
					transform: translateX(-50%);
					bottom: -30px;
					display: flex;
					flex-direction: column;
					align-items: center;

					.level-img-cont {
						margin-top: 20px;
						width: 125px;
						height: 43px;
					}

					span {
						display: block;
						margin: 10px 0;
						color: #3bafff;
						font-size: 24px;
					}

					p {
						font-size: 26px; 
						color: #ffffff;
						font-weight: 700;
					}
				}

				.level-num-light {
					height: 293px;
					background: url(@/assets/romimg/vip/level_back_act.png) no-repeat;
					background-position: bottom left;
					background-size: auto 100%;
					position: absolute;
					left: 0;
					bottom: 0;

					&.level-num-light0 {
						width: 0;
						height: 0;
					}

					&.level-num-light1 {
						width: 18px;
					}

					&.level-num-light2 {
						width: 48px;
					}

					&.level-num-light3 {
						width: 106px;
					}

					&.level-num-light4 {
						width: 190px;
					}

					&.level-num-light5 {
						width: 290px;
					}

					&.level-num-light6 {
						width: 390px;
					}

					&.level-num-light7 {
						width: 465px;
					}

					&.level-num-light8 {
						width: 525px;
					}

					&.level-num-light9 {
						width: 558px;
					}

					&.level-num-light10 {
						width: 574px;
					}
				}

				.level-num-wrap {
					position: absolute;
					width: 100px;
					display: flex;
					justify-content: space-between;
					z-index: 9;

					.level-num-v {
						width: 50px;
						height: 50px;
						background-size: cover;
						background-repeat: no-repeat;
						background-position: center center;
					}

					.level-num-d {
						width: 50px;
						height: 50px;
						background-size: cover;
						background-repeat: no-repeat;
						background-position: center center;
						background-image: url(@/assets/romimg/vip/doc.png);
					}

					&.active {
						.level-num-d {
							background-image: url(@/assets/romimg/vip/doc_act.png);
						}
					}
				}

				.level-num-wrap0 {
					left: -67px;
					bottom: -25px;

					.level-num-v {
						background-image: url(@/assets/romimg/vip/d_vip0.png);
						transform: translateX(10px) translateY(-10px);
					}

					&.active {
						.level-num-v {
							background-image: url(@/assets/romimg/vip/vip0.png);
						}
					}
				}

				.level-num-wrap1 {
					left: -58px;
					bottom: 50px;

					.level-num-v {
						background-image: url(@/assets/romimg/vip/d_vip1.png);
						transform: translateX(20px) translateY(-20px);
					}

					&.active {
						.level-num-v {
							background-image: url(@/assets/romimg/vip/vip1.png);
						}
					}
				}

				.level-num-wrap2 {
					left: -28px;
					bottom: 125px;

					.level-num-v {
						background-image: url(@/assets/romimg/vip/d_vip2.png);
						transform: translateX(30px) translateY(-30px);
					}

					&.active {
						.level-num-v {
							background-image: url(@/assets/romimg/vip/vip2.png);
						}
					}
				}

				.level-num-wrap3 {
					left: 32px;
					bottom: 195px;

					.level-num-v {
						background-image: url(@/assets/romimg/vip/d_vip3.png);
						transform: translateX(30px) translateY(-30px);
					}

					&.active {
						.level-num-v {
							background-image: url(@/assets/romimg/vip/vip3.png);
						}
					}
				}

				.level-num-wrap4 {
					left: 110px;
					bottom: 240px;

					.level-num-v {
						background-image: url(@/assets/romimg/vip/d_vip4.png);
						transform: translateX(30px) translateY(-30px);
					}

					&.active {
						.level-num-v {
							background-image: url(@/assets/romimg/vip/vip4.png);
						}
					}
				}

				.level-num-wrap5 {
					left: 214px;
					bottom: 260px;

					.level-num-v {
						background-image: url(@/assets/romimg/vip/d_vip5.png);
						transform: translateX(50px) translateY(-35px);
					}

					&.active {
						.level-num-v {
							background-image: url(@/assets/romimg/vip/vip5.png);
						}
					}
				}

				.level-num-wrap6 {
					right: 110px;
					bottom: 240px;

					.level-num-v {
						background-image: url(@/assets/romimg/vip/d_vip6.png);
						transform: translateX(-30px) translateY(-30px);
					}

					&.active {
						.level-num-v {
							background-image: url(@/assets/romimg/vip/vip6.png);
						}
					}
				}

				.level-num-wrap7 {
					right: 32px;
					bottom: 195px;

					.level-num-v {
						background-image: url(@/assets/romimg/vip/d_vip7.png);
						transform: translateX(-30px) translateY(-30px);
					}

					&.active {
						.level-num-v {
							background-image: url(@/assets/romimg/vip/vip7.png);
						}
					}
				}

				.level-num-wrap8 {
					right: -28px;
					bottom: 125px;

					.level-num-v {
						background-image: url(@/assets/romimg/vip/d_vip8.png);
						transform: translateX(-30px) translateY(-30px);
					}

					&.active {
						.level-num-v {
							background-image: url(@/assets/romimg/vip/vip8.png);
						}
					}
				}

				.level-num-wrap9 {
					right: -58px;
					bottom: 50px;

					.level-num-v {
						background-image: url(@/assets/romimg/vip/d_vip9.png);
						transform: translateX(-20px) translateY(-20px);
					}

					&.active {
						.level-num-v {
							background-image: url(@/assets/romimg/vip/vip9.png);
						}
					}
				}

				.level-num-wrap10 {
					right: -67px;
					bottom: -25px;

					.level-num-v {
						background-image: url(@/assets/romimg/vip/d_vip10.png);
						transform: translateX(-10px) translateY(-10px);
					}

					&.active {
						.level-num-v {
							background-image: url(@/assets/romimg/vip/vip10.png);
						}
					}
				}
			}

			.level {
				opacity: 0.2;
			}

			.level.active {
				opacity: 1;
			}

			.level0 {
				bottom: 120px;
				left: 120px;
				position: absolute;
				width: 138px;
				height: 101px;
			}

			.level1 {
				bottom: 216px;
				left: 40px;
				position: absolute;
				width: 128px;
				height: 101px;
			}

			.level2 {
				bottom: 366px;
				left: 30px;
				position: absolute;
				width: 101px;
				height: 78px;
			}

			.level3 {
				top: 158px;
				left: 50px;
				position: absolute;
				width: 119px;
				height: 103px;
			}

			.level4 {
				top: 67px;
				left: 130px;
				position: absolute;
				width: 125px;
				height: 99px;
			}

			.level5 {
				top: 30px;
				left: 322px;
				position: absolute;
				width: 90px;
				height: 104px;
			}

			.level6 {
				top: 66px;
				right: 134px;
				position: absolute;
				width: 131px;
				height: 101px;
			}

			.level7 {
				right: 50px;
				top: 155px;
				position: absolute;
				width: 129px;
				height: 103px;
			}

			.level8 {
				bottom: 336px;
				right: 24px;
				position: absolute;
				width: 119px;
				height: 110px;
			}

			.level9 {
				bottom: 210px;
				right: 44px;
				position: absolute;
				width: 128px;
				height: 104px;
			}

			.level10 {
				bottom: 126px;
				right: 136px;
				position: absolute;
				width: 125px;
				height: 100px;
			}

			.xuanzhuan {
				width: 50vw;
				height: 50vw;
				position: absolute;
				left: calc(50% - 25vw);
				top: calc(50% - 25vw);
				animation: xuanzhuan-ani 10s linear infinite;
			}
		}

		.bg1 {
			width: 49.6vw;
			height: 46.66vw;
			position: absolute;
			left: calc(50% - 24.8vw);
			top: calc(50% - 24.33vw);
		}

		.jiantou_wrap {
			width: 112px;
			height: 290px;
			position: absolute;
			left: 50%;
			top: 230px;
			margin-left: -61px;

			&.jiantou_wrap0 {
				transform: rotate(-150deg);
			}

			&.jiantou_wrap1 {
				transform: rotate(-120deg);
			}

			&.jiantou_wrap2 {
				transform: rotate(-90deg);
			}

			&.jiantou_wrap3 {
				transform: rotate(-60deg);
			}

			&.jiantou_wrap4 {
				transform: rotate(-30deg);
			}

			&.jiantou_wrap5 {
				transform: rotate(0deg);
			}

			&.jiantou_wrap6 {
				transform: rotate(30deg);
			}

			&.jiantou_wrap7 {
				transform: rotate(60deg);
			}

			&.jiantou_wrap8 {
				transform: rotate(90deg);
			}

			&.jiantou_wrap9 {
				transform: rotate(120deg);
			}

			&.jiantou_wrap10 {
				transform: rotate(150deg);
			}

			.jiantou {
				// width: 50vw;
				// height: 50vw;
				// position: absolute;
				// left: calc(50% - 25vw);
				// top: calc(50% - 25vw);
				width: 112px;
				height: 86px;
				transform: translateY(-86px);
			}
		}

		.current {
			width: 100%;
			height: 323px;
			margin-top: var(--base-margin-top);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			.current-cont {
				width: 96%;

				height: 323px;
				background: var(--info-box-background);
				border: var(--info-box-border);
				border-radius: 15px;
				background-size: cover;
				position: relative;
				display: flex;
				flex-direction: column;
				justify-content: center;
				box-sizing: border-box;
				padding: 0 38px;

				.current-flag {
					position: absolute;
					top: 24px;
					right: 19px;
					width: 249px;
					height: 198px;
					background: url(@/assets/romimg/vip/current_flag.png) no-repeat center
						center;
					background-size: cover;
				}

				.current-title {
					display: flex;
					font-size: 37px;
					font-weight: 400;
					color: #fafdff;
					align-items: center; 
					i {
						margin-right: 12px;
						font-size: 55px;
						font-weight: bold;
						color: #fafdff;
					}

					.current-title-font {
						margin-top: 6px;
					}
				}

				.current-sum,
				.current-need-price {
					font-size: 24px;
					font-weight: 400;
					color: #9898aa;
					display: flex;
					align-items: center;

					img {
						width: 24px;
						height: auto;
						margin-left: 9px;
						margin-right: 2px;
					}
					span { 
						font-size: 26px;
						font-weight: 700;
						color: gold;
					}
				}

				.current-bottom {
					display: flex;
					justify-content: space-between;
					align-items: flex-end;
					margin-top: 62px;

					.current-info {
						.current-need-line {
							width: 333px;
							height: 11px;
							background: #000000;
							border-radius: 6px;
							position: relative;
							margin: 14px 0;

							.current-need-lineLight {
								width: 100px;
								height: 11px;
								background: #0eccf9;
								border-radius: 6px;
								position: absolute;
								left: 0;
								top: 0;
							}
						}

						.current-leavl {
							width: 333px;
							display: flex;
							align-items: center;
							justify-content: space-between;

							span {
								line-height: 26px;
								font-size: 24px;
								font-weight: bold;
								font-style: italic;
								color: #fafdff;
							}
						}
					}

					.current-recharge {
						margin-right: 28px;
						width: 154px;
						height: 50px;
						line-height: 50px;
						text-align: center;
						background: var(--button-background);
						font-size: 22px;
						font-weight: bold;
						color: #ffffff;
					}
				}
			}
		}
	}

	.vip-table-wrap {
		.vip-table-title-line {
			padding: 0px 36px;
			box-sizing: border-box;
			height: 110px;
			display: flex;
			justify-content: center;
			align-items: center;

			.vip-table-title-line-title {
				color: #b8b6b4;
				font-size: 32px;
			}
		}

		.vip-table-item-list {
			.vip-table-item-list-item {
				height: 80px;
				width: 100%;
				display: flex;
				align-items: center;

				div {
					flex: 1;
					display: flex;
					align-items: center;
					justify-content: center;
					color: #b8b6b4;
					font-size: 24px;
				}

				.get-status0 {
					color: #ffffff;
				}

				.get-status1 {
					display: flex;
					justify-content: center;
					align-items: center;

					.vip0-p {
						color: #7bade0;
					}

					.btn-get-status {
						background: #554bf7;
						color: #fff;
						font-size: 24px;
						font-style: normal;
						font-weight: 500;
						text-align: center;
						line-height: 60px;
						border-radius: 12px;
						width: 140px !important;
						height: 60px;
					}
				}

				.get-status2 {
					display: flex;
					justify-content: center;
					align-items: center;
					.btn-get-status {
						color: #b4b6c8;
						font-size: 24px;
						text-align: center;
						line-height: 60px;

						width: 140px !important;
						height: 60px;
						border-radius: 12px;
						border: 1px solid #1e2037;
						// background: linear-gradient(
						//	 to bottom,
						//	 #e2e2e2 0%,
						//	 #dbdbdb 50%,
						//	 #d1d1d1 51%,
						//	 #fefefe 100%
						// );
					}
				}
			}

			.vip-table-item-title {
				background: var(--info-box-background);
				display: flex;
				justify-content: space-between;
				align-items: center;
				div {
					width: 25%;
					height: 80px;
					line-height: 80px;
					text-align: center;
					color: #535155;
					font-size: 24px;
					font-style: normal;
					font-weight: 400;

					text-transform: uppercase;
				}
			}
			.vip-table-item-list-item {
				margin-top: 20px;
				div {
					color: white;
				}
			}
			.vip-table-item-list-item:nth-child(even) {
				background: var(--list-single-backgroud);
			}

			.vip-table-item-list-item:nth-child(odd) {
				background: var(--list-double-backgroud);
			}

			// .vip-table-item-list-item:nth-child(odd) {
			//		 //background: var(--list-single-backgroud);
			// }

			// .vip-table-item-list-item:nth-child(even) {
			//		 // background: var(--list-double-backgroud);
			// }
		}
	}

	.vip-notice-wrap {
		width: 100%;
		box-sizing: border-box;
		padding: 67px 37px;

		.vip-notice-title {
			margin-bottom: 50px;
			display: flex;
			justify-content: left;
			align-items: center;

			color: #535155;

			font-size: 24px;
			font-style: normal;
			font-weight: 400;
			line-height: 18px; /* 150% */
			text-transform: uppercase;
		}

		.vip-notice-item {
			margin-bottom: 30px;

			.vip-notice-item-q {
				display: flex;
				justify-content: left;
				align-items: center;
				font-size: 24px;
				color: #b4b6c8;
				line-height: 44px;
				img {
					width: 32px;
					height: auto;
					margin-right: 9px;
				}
			}

			.vip-notice-item-a {
				line-height: 36px;
				font-size: 20px;
				color: #b4b6c8;
				font-size: 24px;

				line-height: 44px;
				img {
					width: 32px;
					height: auto;
					position: relative;
					top: 5px;
				}
				span {
					width: 200px;
					color: #10c5fa;
				}
			}
		}
	}

	@keyframes xuanzhuan-ani {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(1turn);
		}
	}
}
</style>
