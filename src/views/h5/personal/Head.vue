<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, computed, onMounted } from "vue";
import { Dialog, Toast } from "vant";

import { useStore } from "vuex";
import {
	uploadfile,
	update,
	getAvaterFrameList,
	getAvaterList,
	getVipLevelList,
} from "@/network/api/user";

import TopTitleBack from "@/components/h5/common/TopTitleBack.vue";
import TabsFlex from "@/components/h5/home/TabsFlex.vue";
import defaultIcon from "@/assets/romimg/common/defaultIcon.png";
const userInfoBase = computed(() => store.state.userInfoBase);
const store = useStore();
const canUpload = ref(true);

const headList = ref([]);
const frameList = ref([]);

const selectHead = ref({ id: 0, avater: defaultIcon });
const selectFrame = ref({});

onMounted(() => {
	getAvater();
	getFrame();
	uploadStateLabel();
});

function uploadStateLabel() {
	let label = t('users.vip5Upload');
	if (store.state.avaterStatus == 0) {
		label = t('users.awaitingReview');
	} else if (store.state.avaterStatus == 1) {
		label = t('users.reviewPass');
	} else if (store.state.avaterStatus == 2) {
		label = t('users.reviewFailed');
	}
	// stateLabel.value = label;

	canUpload.value =
		store.state.userInfoBase.userLevel >= 5 && store.state.avaterStatus != 0;
}
//头像修改
function uploadHeadFile(file) {
	if (navigator.userAgent.indexOf("UCBrowser") > -1) {
		alert(t( 'menu.browserNotSupport' ));
	} else {
		if (
			file.file.type == "image/jpeg" ||
			file.file.type == "image/png" ||
			file.file.type == "image/gif" ||
			file.file.type == "image/webp"
		) {
			Toast.loading({
				message: t('common.loading'),
				forbidClick: true,
			});
			let formData = new FormData();
			formData.set("upfile", file.file);

			uploadfile(formData, 1)
				.then((res) => {
					if (res.code == 0) {
						update({ avater: res.data.fileUrl }).then((res) => {
							Toast.clear();
							if (res.code == 0) {
								store.dispatch("getUserInfo");
							}
							Notify(res.message);
							canUpload.value = false;
							window.$dev && console.log("canUpload.value", canUpload.value);
						});
					} else {
						Toast.clear();
					}
				})
				.catch((err) => Toast.clear());
		} else {
			NotifyF(t('sign.formatFail'));
		}
	}
}

let tabsFlexRef = ref({
	items: [t('users.changeAvater'), t('users.avaterFrame')],
	index: 0,
});

const tabType = ref(1);
function tabFlexChangedEvent(event) {
	tabType.value = event + 1;
}

async function getAvater() {
	let res = await getAvaterList();
	if (res.code == 0) {
		let items = res.data.items || [];
		headList.value = items;
		let avater = store.state.userInfoBase.avater;
		let isSystem = false;
		for (let index = 0; index < items.length; index++) {
			const item = items[index];
			if (item.avater == avater) {
				selectHead.value = item;
				isSystem = true;
			}
		}
		if (!isSystem) {
			selectHead.value.avater = avater;
		}
	}
}

//修改
function updateInfo() {
	let params = {};
	if (selectHead.value.id != 0) {
		params.avaterId = selectHead.value.id;
	}
	if (selectFrame.value.id) {
		params.avaterFrameId = selectFrame.value.id;
	}

	update(params).then((res) => {
		if (res.code == 0) {
			Notify(res.message);
			store.dispatch("getUserInfo");
			// emit("close");
		}
	});
}

async function getFrame() {
	let res = await getAvaterFrameList();
	if (res.code == 0) {
		let items = res.data.items || [];
		frameList.value = items;
		let avaterFrame = store.state.userInfoBase.avaterFrame;
		for (let index = 0; index < items.length; index++) {
			const item = items[index];
			if (item.avaterFrame == avaterFrame) {
				selectFrame.value = item;
			}
		}
	}
}
function onClickHead(item, index) {
	selectHead.value = item;
	updateInfo();
}

function onClickFrame(item, index) {
	if (item.needUserLevel > store.state.userInfoBase.userLevel) {
		NotifyFt('users.needUpgrade');
		return;
	}
	selectFrame.value = item;
	updateInfo();
}

function lockFrame(item) {
	// return true;
	return item.needUserLevel > store.state.userInfoBase.userLevel;
}
</script>

<template>
	<div id="personal-head">
		<TopTitleBack title="个人信息"></TopTitleBack>
		<TabsFlex
			:fontsize="14"
			:items="tabsFlexRef.items"
			@tabFlexChangedEvent="tabFlexChangedEvent"
		></TabsFlex>
		<div class="current-head-wrap">
			<img
				class="icon_img"
				:src="selectHead.avater"
				alt=""
				v-show="tabType == 1"
			/>

			<img
				v-show="tabType == 2"
				class="icon_img"
				:src="selectHead.avater"
				alt=""
			/>
			<img
				v-show="tabType == 2"
				v-if="selectFrame && selectFrame.avaterFrame"
				class="icon_img_bg"
				:src="selectFrame.avaterFrame"
				alt=""
			/>

			<div class="name">{{t('users.currentAvater')}}</div>
		</div>
		<div class="head-wrap" v-show="tabType == 1">
			<div
				class="head-item"
				v-for="(item, index) in headList"
				:key="index"
				@click="onClickHead(item, index)"
			>
				<img :src="item.avater" alt="" />
			</div>

			<div class="head-item" v-if="canUpload">
				<el-upload
					class="avatar-uploader"
					action=""
					accept="image/*"
					:show-file-list="false"
					:http-request="uploadHeadFile"
				>
					<img src="@/assets/romimg/personal/avatar/add.png" alt="" />
				</el-upload>
			</div>
		</div>

		<div class="frame-wrap" v-show="tabType == 2">
			<div
				class="frame-item"
				:class="{ unlock: !lockFrame(item) }"
				v-for="(item, index) in frameList"
				:key="index"
				:style="'background-image: url(' + item.avaterFrame + ');'"
			>
				<div
					class="frame-bg"
					:class="{ active: selectFrame.id == item.id }"
					@click="onClickFrame(item, index)"
				>
					<!-- <img
						class="frame"
						:class="{ active: lockFrame(item) }"
						:src="item.avaterFrame"
						alt=""
					/> -->
					<img
						v-if="lockFrame(item)"
						class="lock"
						src="@/assets/romimg/personal/avatar/lock.png"
						alt=""
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
#personal-head {
	box-sizing: border-box;
	width: 750px;
	min-height: calc(100vh - 450px);

	.current-head-wrap {
		width: 710px;
		margin: auto;
		text-align: center;
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		padding: 20px 0;
		height: 200px;
		box-sizing: border-box;
		background: #111324;
		position: relative;
		.name {
			color: #b4b6c8;
			font-size: 24px;
			font-style: normal;
			font-weight: 500;
			margin-top: 10px;
		}
		.icon_img {
			width: 100px;
			height: 100px;
			border-radius: 20px;

			box-sizing: border-box;
		}
		.icon_img_bg {
			position: absolute;
			width: 200px;
			height: 200px;
			top: -22px;
		}
	}
	.head-wrap {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: wrap;
		width: 710px;
		margin: auto;
		.head-item {
			img {
				width: 100px;
				height: 100px;
				margin: 20px;
				border-radius: 20px;
			}
		}
	}

	.frame-wrap {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: wrap;
		width: 710px;
		margin: auto;
		.frame-item {
			width: 140px;
			height: 140px;
			display: flex;
			justify-content: center;
			align-items: center;
			background-size: 100%;
			filter: grayscale(100%);
			&.unlock {
				filter: grayscale(0) !important;
			}
			.frame-bg {
				width: 90px;
				height: 90px;
				position: relative;
				// background: url(@/assets/romimg/personal/avatar/item_bg.png) no-repeat
				//	 center;
				// background-size: contain;
				box-sizing: border-box;

				&.active {
					background: url(@/assets/romimg/personal/avatar/item_bg2.png)
						no-repeat center;
					width: 90px;
					height: 90px;
					background-size: contain;
				}

				.frame {
					width: 90px;
					height: 90px;
					&.active {
						filter: grayscale(100%);
					}
				}

				.lock {
					position: absolute;
					width: 23px;
					height: 24px;
					top: 30px;
					right: 33px;
					filter: grayscale(100%);
				}
			}
		}
	}
	.user-info {
		display: flex;
		align-items: center;
		position: relative;
		margin-bottom: 10px;
		height: 136px;
		padding: 20px;

		background: linear-gradient(153deg, #073146 10.26%, #15172c 62.06%);
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
		.username-wrap1 {
			margin-left: 20px;

			.username {
				color: #fff;
				font-size: 28px;
				font-style: normal;
				font-weight: 500;
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
		padding-left: 100px;
		box-sizing: border-box;
		padding-right: 40px;
		padding-bottom: 50px;
		.score {
			color: #4d362a;
			text-shadow: 0px 1px 0px #fef1de;
			font-size: 26px;
			font-style: normal;
			font-weight: 700;
		}
		.pay {
			color: #fff2df;
			font-size: 22px;
			font-style: normal;
			font-weight: 500;
			padding: 15px 30px;
			border-radius: 50px;
			background: linear-gradient(180deg, #563e32 0%, #331e13 100%);
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
