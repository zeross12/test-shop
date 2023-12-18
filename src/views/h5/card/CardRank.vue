<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import HeadPortrait from '@/components/h5/head/HeadPortrait.vue';
import { onMounted, ref } from 'vue';
import { getRankList } from "@/network/api/battle"
import { useStore } from 'vuex';

const store = useStore();
const rankData = ref([]);
const frontDayStar = ref({});

onMounted(() => {
	getRank();
})

async function getRank() {
	const res = await getRankList({ limit: 10 });
	if (res.code === 0) {
		rankData.value = res.data.items || [];
		frontDayStar.value = res.data.frontDayStar || {};
	}
}

function onClickHelp() {
	let data = {
		show: true,
		html: t('battle.battleRule')
	}
	store.commit('setHowPlay', data)
}

</script>
		
<template>
	<div id="battleRank">
		<div class="help" @click="onClickHelp"> <img src="@/assets/romimg/battle/rank/help.png"></div>
		<div class="top-wrap">
			<div class="head">
				<HeadPortrait :userModel='frontDayStar' :size="'head_n_rank_t'" v-if="frontDayStar.nickName">
				</HeadPortrait>
				<div v-if="!frontDayStar.nickName" class="no-front-day"> <img src="@/assets/romimg/battle/img_tx_9.jpg"
						alt=""></div>
			</div>
			<div class="name">{{ frontDayStar.nickName }}</div>
			<div class="balance">
				<img src="@/assets/romimg/common/gold.png" alt="">
				<span>{{ frontDayStar.sumScore }}</span>
			</div>
		</div>
		<div class="content-wrap">
			<div class="content-bg"></div>
			<div class="content-wrap2">
				<div class="rank-title"><img src="@/assets/romimg/battle/rank/title.png"></div>
				<div class="rank-wrap">
					<div v-for="(item, index) in rankData" :key="index" class="rank-item">
						<img v-if="index == 0" src="@/assets/romimg/battle/rank/win1.png">
						<img v-else-if="index == 1" src="@/assets/romimg/battle/rank/win2.png">
						<img v-else-if="index == 2" src="@/assets/romimg/battle/rank/win3.png">
						<div v-else class="left"></div>
						<div class="item-info">
							<HeadPortrait :userModel='item' :size="'head_n_one'"></HeadPortrait>
							<span>{{ item.nickName }}</span>
						</div>
						<div class="balance">
							<img src="@/assets/romimg/common/gold.png" alt="">
							<span>{{ item.sumScore }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
		
<style lang="scss" scoped>
#battleRank {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 750px;

	.help {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		margin: 15px 15px 8px 0;

		img {
			width: 35px;
			height: 35px;
		}
	}

	.top-wrap {
		background: url(@/assets/romimg/battle/rank/bg1.png) no-repeat;
		background-size: contain;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 690px;
		height: 437px;
		z-index: 5;

		.head {
			margin-top: 111px;
		}

		.name {
			font-size: 26px;
			height: 26px;
			color: #3A1B01;
			z-index: 1;
		}

		.balance {
			display: flex;
			align-items: center;
			margin-top: 54px;
			height: 26px;

			img {
				width: 32px;
				height: 33px;
			}

			span {
				color: #3A1B01;
				font-size: 26px;
				font-weight: bold;
				margin-left: 7px;
			}
		}

		.no-front-day {
			width: 186px;
			height: 186px;
			position: relative ;
			img {
				position: absolute;
				width: 100%;
				height: 100%;
				border: 1px;
				border-radius: 50%;
				overflow: hidden;
				box-sizing: border-box;
			}
		}
	}

	.content-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 963px;
		width: 690px;
		position: relative;
		margin-bottom: 24px;

		.content-bg {
			height: 1243px;
			width: 690px;
			position: absolute;
			top: -280px;
			border-image-slice: 12 34 12 34 fill;
			border-image-width: 12px 34px 12px 34px;
			border-image-source: url(@/assets/romimg/battle/rank/bg2.png);
		}

		.content-wrap2 {
			z-index: 1;
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;

			.rank-title {
				margin-top: 6px;

				img {
					width: 605px;
					height: 73px;
				}
			}

			.rank-wrap {
				width: 570px;
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-top: 20px;

				.rank-item {
					width: 100%;
					display: flex;
					align-items: center;
					color: #fff;
					font-size: 26px;
					height: 80px;
					border-bottom: 1px solid #FBFA02;

					img {
						width: 43px;
						height: 32px;
					}

					.left {
						width: 43px;
						height: 32px;
					}

					.item-info {
						flex: 1;
						display: flex;
						align-items: center;
						margin-left: 15px;

						span {
							margin-left: 18px;
						}
					}

					.balance {
						display: flex;
						align-items: center;
						width: 160px;

						img {
							width: 32px;
							height: 33px;
						}

						span {
							color: #FBFA02;
							font-size: 26px;
							font-weight: bold;
							margin-left: 5px;
						}
					}
				}
			}
		}


	}
}
</style>