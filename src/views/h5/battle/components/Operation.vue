<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { watch, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const props = defineProps(["boxList", "watchCount", "start"]);
const emit = defineEmits(["openRule"]);
const store = useStore();
const router = useRouter();

watch(
	props.start,
	(newValue, oldValue) => {
		if (newValue.round > 3) {
			boxWrap.value.scrollLeft += 500;
		}
	},
	{
		immediate: true,
	}
);

function onClickRule() {
	// let data = {
	//		 show: true,
	//		 html: '<p>决战沙场</p><br><p>1、创建活动时，可以选择拼箱人数（2/3人），一个场次最多可以选择 6 个盲盒。</p><br><p>2、房间一但创建，不可取消，如在15分钟内未有用户加入，则房间自动解散，归还房间对应币值。</p><br><p>3、活动参与费用即本场活动开启的盲盒价格总和，支付费用后，即视为加入房间，中途退出房间，并不会退还盲盒或参与费。</p><br><p>4、多个玩家拼箱，开出最丰厚奖品的玩家优先分配。</p><br><p>5、当一场活动开出最丰厚奖品的玩家有多名时，非本人所得饰品将被回购为硬币发放到对应账户余额。</p><br><p>6、每场活动的结果受到（创建时间，用户ID，用户位置和开始时间等）多方面因素影响，为完全随机产生的结果。游戏完全公平可证。</p>'
	// }
	// store.commit('setHowPlay', data)
	emit("openRule");
}

function onClickBox(item) {
	let boxData = { boxName: item.name, boxId: item.boxId };
	store.commit("setClickBattleBoxData", boxData);
	router.push({
		path: "/m/battleBoxDetails",
		query: { boxData: encodeURIComponent(JSON.stringify(boxData)) },
	});
}

function onClickHistory() {
	router.push("/m/battle/battleHistory");
}

function getBoxImageStyle(item) {
	if (item.imageUrl) {
		return "background-image: url(" + item.imageUrl + ");";
	} else {
		return "";
	}
}

const boxWrap = ref(null);
</script>

<template>
	<div id="battle-operation">
		<div class="opt-main" v-if="false">
			<div class="opt-item">
				<p @click="onClickRule">{{ t('battle.gameRule') }}</p>
				<p @click="onClickHistory">{{ t('router.battleHistory') }}</p>
			</div>
			<div class="look-wrap">
				<img src="@/assets/romimg/battle/detail/player.png" />
				<div>{{ t('battle.watchTotal') }}: {{ watchCount }}</div>
			</div>
		</div>
		<div class="opt-box-wrap" ref="boxWrap">
			<!-- <div class="label">
				{{ start.round == -1 ? 0 : start.round + 1 }}/{{ boxList.length
				}}<span> {{ t( 'battle.round' ) }}</span>
			</div> -->
			<div
				class="opt-box-item"
				v-for="(item, index) in boxList"
				:key="index"
				:class="{ active: start.round == index }"
			>
				<div class="pic" :style="getBoxImageStyle(item)">
					<img class="box" :src="item.weaponImageUrl" alt="" />
					<span
						class="icon iconfont flag"
						:class="{ active: start.round == index }"
					>
						&#xe64b;</span
					>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#battle-operation {
	width: 750px;
	height: 170px;
	//	 background: url(@/assets/romimg/battle/back.png) no-repeat center;
	//	 background-size: contain;

	.opt-main {
		display: flex;
		justify-content: space-between;
		box-sizing: border-box;
		width: 100%;
		height: 80px;
		padding: 0 20px;

		.opt-item {
			display: flex;
			align-items: center;
			height: 80px;

			p {
				height: 46px;
				padding: 0 26px;
				border: 3px solid #fbfa02;
				box-sizing: border-box;
				line-height: 42px;
				font-size: 20px;
				margin: 0 10px;
				color: #fff;

				span {
					color: #fbfa02;
				}

				&:active {
					background-color: #fbfa02;
					color: #0e0d19;
				}
			}
		}

		.look-wrap {
			display: flex;
			align-items: center;
			color: #a9a6d3;
			font-size: 20px;
			padding-right: 20px;

			img {
				width: 27px;
				height: 20px;
				margin-right: 5px;
			}
		}
	}

	.opt-box-wrap::-webkit-scrollbar {
		/*隐藏滚轮*/
		display: none;
	}
	.opt-box-wrap {
		display: flex;
		align-items: center;
		justify-content: start;
		box-sizing: border-box;
		overflow-y: auto;
		// -webkit-overflow-scrolling: touch;
		min-width: 710px;
		height: 170px;
		padding: 0 20px;
		background-color: #111324;
		position: relative;
		.label {
			color: #fff;
			font-size: 28px;
			font-style: normal;
			font-weight: 500;
			width: 120px;
			span {
				color: #fff;

				font-size: 28px;
				font-style: normal;
				font-weight: 400;
			}
		}

		.opt-box-item {
			.pic {
				display: flex;
				justify-content: center;
				align-items: center;
				background-size: contain;
				background-position: center;
				background-repeat: no-repeat;
				width: 130px;
				height: 130px;
				margin: auto 10px;
				// filter: grayscale(80%);

				opacity: 0.4;
				position: relative;
				.box {
					max-width: 95%;
					max-height: 95%;
				}
				.flag {
					display: none;
					color: #4a45b1;
					position: absolute;
					bottom: -20px;

					&.active {
						display: block;
						font-size: 20px;
						transform: scale(0.8);
					}
				}
			}

			&.active {
				background: url(@/assets/romimg/battle/sanjiao.png) no-repeat;
				background-size: 16px 14px;
				background-position: 50% 110%;
				.pic {
					opacity: 1;
				}
			}
		}
	}
}
</style>
