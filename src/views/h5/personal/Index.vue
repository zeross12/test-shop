<script setup>
import { ref, computed, onMounted } from "vue";
import HeadPortrait from "@/components/h5/head/HeadPortrait.vue";
import information from "@/views/h5/information/Index.vue";
import spreadUser from "@/views/h5/spreadUser/Index.vue";
import record from "@/views/h5/record/Index.vue";
import bag from "@/views/h5/bag/Index.vue";

import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { getVipLevelList } from "@/network/api/user";
import Avatar from "./Avatar.vue";
import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const store = useStore();
const router = useRouter();
const userInfoBase = computed(() => store.state.userInfoBase);
const userInfoExt = computed(() => store.state.userInfoExt);

const editHeadType = ref(false);

const showAvatar = ref(false);
const avaterRef = ref(null);

// vip等级列表
const levelList = ref([]);
// 当前累计充值金额
const chargeAmount = ref(0);
// 当前vip等级
const level = ref(userInfoBase.value.userLevel);

// 最小等级金额
const minVipAmount = ref(0);
// 下个等级
const nextVipLevel = ref(0);
// 距离下个等级还需要
const nextVipAmount = ref(0);

onMounted(() => {
	getVipLevelRecord();
});

//修改

function onClickEditAvatar() {
	showAvatar.value = true;
	avaterRef.value.showAvater();
}
function onCloseAvatar() {
	showAvatar.value = false;
}

const tabs = ref({
	index: 0,
	items: [
		{ icon: "&#xe652;", text: t('users.inStock') },
		{ icon: "&#xe630;", text: t('menu.detail') },
		{ icon: "&#xe624;", text: t('users.incomeTitle')},
		{ icon: "&#xe631;", text: t('users.information')},
	],
});

// 获取vip等级列表
async function getVipLevelRecord() {
	const res = await getVipLevelList();
	if (res.code === 0) {
		let items = res.data.items || [];
		let cAmount = res.data.chargeAmount || 0;
		levelList.value = items;
		chargeAmount.value = cAmount;
		getVipRate();
	}
}

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
	if (nextVipAmount.value == 0) {
		level.value = levelArr[levelArr.length - 1].level; // 当前等级10
	} else {
		level.value = levelArr[nextIndex - 1].level; // 当前等级
	}
}
function goToInfo() {
	router.push("/m/personalInfo");
}
function goToPay() {
	router.push("/m/recharge");
}

function goToVip() {
	router.push("/m/vip");
}

function goToEdit(type) {
	router.push({ path: "/m/personalEdit", query: { type: type } });
}
</script>

<template>
	<div id="personal" @click="editHeadType = false">
		<TopTitleBack :title="t('router.userCenter')"></TopTitleBack>
		<div class="user-info" @click="goToInfo()">
			<div class="avatar-wrap">
				<div class="avatar-wrap2">
					<HeadPortrait :userModel="userInfoBase" :size="'four'"></HeadPortrait>
				</div>
			</div>
			<div class="username-wrap">
				<div class="username">
					{{ userInfoBase.nickName }}
					<div class="renzheng" v-if="userInfoExt.realName">{{ t('users.alreadyRealnameTitle') }}</div>
					<div class="renzheng" @click.stop="goToEdit('realName')" v-else>
						{{ t('users.noRealnameTitle') }}
					</div>
				</div>
				<div class="xxx">
					<div class="userlevel">LV{{ level }}</div>
				</div>
			</div>
			<div class="right-allow">
				<span class="icon iconfont">&#xe651;</span>
			</div>
		</div>
		<div class="level-wrap" @click="goToVip">
			<div class="score">
				<div><img src="@/assets/romimg/vip/v.png" alt="" srcset="" /></div>
				<div class="col-wrap">
					<div>{{ t('vip.stillFromNextLevel') }} {{ nextVipAmount }}</div>
				</div>
				<div class="question">
					<img src="@/assets/romimg/personal/question.png" alt="" srcset="" />
				</div>
			</div>
			<div class="pay" @click.stop="goToPay()">{{  t('notify.confirm') }}</div>
		</div>
		<div class="tab">
			<div
				class="tab-item"
				:class="{ active: index == tabs.index }"
				v-for="(item, index) in tabs.items"
				@click="tabs.index = index"
				:key="index"
			>
				<span class="icon iconfont" v-html="item.icon"></span>
				{{ item.text }}
				<div class="bottom"></div>
			</div>
		</div>
		<!--显示子控制-->

		<bag v-if="tabs.index == 0"></bag>
		<record v-if="tabs.index == 1"></record>
		<information v-if="tabs.index == 3"></information>
		<spreadUser v-if="tabs.index == 2"></spreadUser>
		<!--	<div v-if="tabs.index == 1">个人明细</div>
		<div v-if="tabs.index == 2">推广分红</div>
		<div v-if="tabs.index == 3">站内信息</div> -->

		<Avatar
			:showState="showAvatar"
			@close="onCloseAvatar"
			ref="avaterRef"
		></Avatar>
	</div>
</template>

<style lang="scss">
#personal {
	//	 padding: 50px 76px;
	box-sizing: border-box;
	//	 margin: 50px 0px;
	min-height: 23px;
	width: 750px;
	//	 background: url(@/assets/romimg/personal/bg.png) no-repeat center;
	//	 background-size: contain;

	.user-info {
		display: flex;
		align-items: center;
		position: relative;
		margin-bottom: 10px;
		height: 136px;
		padding: 20px;

		background: linear-gradient(
			153deg,
			rgba(#073146, 0.3) 10.26%,
			rgba(#15172c, 0.3) 62.06%
		);
		.right-allow {
			position: absolute;
			right: 20px;
			span {
				color: #fff;
				font-size: 28px;
			}
		}
		.avatar-wrap {
			width: 96px;
			height: 96px;
			position: relative;

			.avatar-wrap2 {
				width: 96px;
				height: 96px;
				display: flex;
				justify-content: center;
				align-items: center;
				box-sizing: border-box;
			}
		}
		.username-wrap {
			margin-left: 20px;

			.username {
				color: #fff;

				font-size: 28px;
				font-style: normal;
				font-weight: 500;
				display: flex;
				.renzheng {
					border-radius: 20px;
					background: #15172c;
					color: #4c4f6b;
					padding: 5px 15px;
					margin-left: 30px;
					font-size: 20px;
					font-style: normal;
					font-weight: 500;
					line-height: normal;
				}
			}
			.xxx {
				display: flex;
				justify-content: start;
			}
			.userlevel {
				margin-top: 20px;
				color: #fff;
				font-size: 20px;
				font-style: normal;
				font-weight: 500;
				padding: 6px 16px;
				border-radius: 20px;
				background: linear-gradient(90deg, #39aeb8 0%, #52d8e1 100%);
			}
		}

		.user-phone {
			font-size: 24px;
			color: #ffffff;
			margin-top: 18px;
		}

		.edit {
			display: flex;
			align-items: center;
			font-size: 24px;
			color: #fbfa02;

			img {
				width: 26px;
				margin-right: 10px;
			}
		}
	}
	.level-wrap {
		display: flex;
		align-items: center;
		height: 160px;
		width: 710px;
		justify-content: space-between;
		margin: auto;
		border-radius: 12px 12px 0px 0px;
		background: linear-gradient(94deg, #fff2df 1.58%, #efbd8a 69.53%);
		background: url(@/assets/romimg/personal/level_bg.png) no-repeat center;
		background-size: contain;
		box-sizing: border-box;
		padding-right: 40px;
		// padding-bottom: 50px;
		.score {
			color: #4d362a;
			text-shadow: 0px 1px 0px #fef1de;
			font-size: 26px;
			font-style: normal;
			font-weight: 700;
			padding-left: 20px;
			box-sizing: border-box;
			display: flex;
			// flex-direction: column;
			justify-content: space-between;
			align-items: center;
			// span {
			//	 font-size: 28px;
			// }
			img {
				width: 52px;
				height: 46px;
			}
			.col-wrap {
				padding-left: 20px;
				.view {
					margin-top: 5px;
					color: #cea178;
					font-size: 24px;
					font-style: normal;
					font-weight: 600;
				}
			}
			.question {
				padding-bottom: 20px;
				padding-left: 10px;
				img {
					width: 32px;
					height: 32px;
				}
			}
		}
		.pay {
			color: #fff2df;
			font-size: 22px;
			font-style: normal;
			width: 160px;
			font-weight: 500;
			padding: 15px 30px;
			box-sizing:border-box;
			border-radius: 50px;
			background: linear-gradient(180deg, #563e32 0%, #331e13 100%);
		}
	}
	.tab {
		display: flex;
		justify-content: center;
		padding-top: 30px;
		background-color: #15172c;
		z-index: 2;
		.tab-item {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
			padding: 10px 0px;
			width: 300px;
			box-sizing: border-box;
			position: relative;

			color: #fff;
			font-size: 24px;
			font-style: normal;
			font-weight: 400;
			line-height: normal;
			height: 120px;
			span {
				font-size: 35px;
			}
			&.active {
				color: #0092f3;
				font-size: 28px;
				font-style: normal;
				font-weight: 700;
				line-height: normal;
				box-sizing: border-box;
				.bottom {
					display: block;
				}
			}
			.bottom {
				display: none;
				position: absolute;
				bottom: -10px;
				height: 6px;
				width: 24px;
				border-radius: 5px;
				background: linear-gradient(270deg, #00d3b6 0%, #0b8acf 100%);
			}
		}
	}

	.van-cell-group {
		background: none;
		position: relative;

		.van-cell {
			background: none;
			padding: 0;
			height: 72px;
			border: 1px solid #fbfa02;
			margin-top: 40px;

			.van-field__label {
				width: 150px;
				line-height: 72px;
				color: #fff;
				font-size: 24px;
				padding-left: 17px;
				box-sizing: border-box;
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
				width: 120px;
				height: 50px;
				border: none;
				background: #fbfa02;
				color: #010101;
				font-size: 22px;
				line-height: 50px;
				text-align: center;
				margin-right: 10px;

				&:active {
					color: #010101;
				}
			}
		}

		.steam-cell {
			.van-field__label {
				width: 200px;
			}
		}

		.tip {
			color: #00effe;
			font-size: 20px;
			position: absolute;
			left: 0px;
			bottom: 0px;

			a {
				color: #fbfa02;
				text-decoration: underline;
			}
		}

		&::after {
			border: none;
		}

		&.has-tip {
			padding-bottom: 30px;
		}
	}

	.btn-tosteam {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 242px;
		height: 60px;
		background: #fbfa02;
		font-size: 24px;
		color: #000000;
		margin: 30px auto;

		a {
			color: #000000;
		}
	}

	.other-cell {
		display: flex;
		flex-direction: column;
		margin-top: 40px;

		.switch-wrap {
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			height: 71px;
			border: 1px solid #fbfa02;
			margin-bottom: 40px;
			padding-right: 15px;
			box-sizing: border-box;

			.text {
				display: flex;
				align-items: center;
				margin-left: 17px;

				span {
					color: #fff;
					font-size: 24px;
				}

				p {
					color: #fff;
					font-size: 24px;
					margin-left: 98px;
				}
			}

			&:last-child {
				margin-bottom: 0px;
			}
		}
	}

	.edit_name {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		padding-bottom: 1.333333rem;
		box-sizing: border-box;
		opacity: 0;
		z-index: -1;
		transition: 0.3s;
		color: #fff;
		text-align: center;

		.edit_name_box {
			width: 550px;
			height: 340px;
			background: url(@/assets/romimg/personal/bg2.png) no-repeat center;
			background-size: contain;

			.en-title {
				margin-top: 50px;
			}

			input {
				width: 365px;
				height: 43px;
				border: 3px solid #fbfa02;
				background: none;
				padding: 10px;
				box-sizing: border-box;
				font-size: 20px;
				margin-top: 30px;
			}

			.edit-name-btns {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-top: 40px;

				.edit-name-btn {
					height: 49px;
					width: 168px;
					margin-top: 30px;
					background: url(@/assets/romimg/personal/btn1.png) no-repeat center;
					background-size: contain;
					color: #141221;
					font-size: 20px;
					text-align: center;
					line-height: 49px;
					margin: 0px 15px;
				}
			}
		}

		&.active {
			opacity: 1;
			z-index: 202;
		}
	}

	.pop-verify {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		padding-bottom: 50px;
		box-sizing: border-box;
		opacity: 0;
		z-index: -1;
		transition: 0.3s;

		.pop-verify-main {
			width: 702px;
			height: 331px;
			background: url(@/assets/romimg/personal/bg4.png) no-repeat 50%;
			background-size: contain;
			color: #fff;

			.pop-verify-title {
				font-size: 24px;
				box-sizing: border-box;
				text-align: center;
				margin-top: 40px;
			}

			.pop-verify-content {
				margin-top: 30px;
				padding: 0 100px;
				box-sizing: border-box;
				font-size: 22px;

				p {
					margin-bottom: 10px;
				}
			}

			.pop-verify-btn-wrap {
				display: flex;
				justify-content: center;
				margin-top: 30px;

				p {
					width: 168px;
					height: 50px;
					background: url(@/assets/romimg/header/btn_active.png) no-repeat
						center;
					background-size: 100% 100%;
					text-align: center;
					line-height: 50px;
					color: #20212b;
					font-weight: 700;
					font-size: 20px;
					margin: 0 10px;
				}
			}
		}

		&.active {
			opacity: 1;
			z-index: 202;
		}
	}
}
</style>
