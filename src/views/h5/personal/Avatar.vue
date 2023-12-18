<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useStore } from "vuex";
import { ref, onMounted } from "vue";
import {
	getAvaterFrameList,
	getAvaterList,
	uploadfile,
} from "@/network/api/user";
import { Dialog, Toast } from "vant";
import { update } from "@/network/api/user";
import defaultIcon from "@/assets/romimg/common/defaultIcon.png";

const props = defineProps(["showState"]);
const emit = defineEmits(["close"]);
defineExpose({ showAvater });
const store = useStore();
const tabType = ref(1);

const headList = ref([]);
const frameList = ref([]);

const selectHead = ref({ id: 0, avater: defaultIcon });
const selectFrame = ref({});

const stateLabel = ref("");
const canUpload = ref(true);

onMounted(() => {
	getAvater();
	getFrame();
	uploadStateLabel();
});

function showAvater() {
	store.dispatch("getUserInfo");
	getAvater();
	getFrame();
	uploadStateLabel();
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

function onClickTab(type) {
	tabType.value = type;
}
function onClickClose() {
	emit("close");
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
			emit("close");
		}
	});
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
						Toast.clear();
						if (res.code == 0) {
							store.dispatch("getUserInfo");
						}
						Notify(res.message);
						stateLabel.value = t('users.awaitingReview');
						canUpload.value = false;
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

function uploadStateLabel() {
	let label = t('users.vip5Upload');
	if (store.state.avaterStatus == 0) {
		label = t('users.awaitingReview');
	} else if (store.state.avaterStatus == 1) {
		label = t('users.reviewPass');
	} else if (store.state.avaterStatus == 2) {
		label = t('users.reviewFailed');
	}
	stateLabel.value = label;
	canUpload.value =
		store.state.userInfoBase.userLevel >= 5 && store.state.avaterStatus != 0;
}

function onClickHead(item, index) {
	selectHead.value = item;
}

function onClickFrame(item, index) {
	if (item.needUserLevel > store.state.userInfoBase.userLevel) {
		NotifyF(t('users.needUpgrade'));
		return;
	}
	selectFrame.value = item;
}

function lockFrame(item) {
	return item.needUserLevel > store.state.userInfoBase.userLevel;
}
</script>

<template>
	<div id="edit-avatar">
		<van-overlay
			:show="showState"
			style="background-color: rgba(0, 0, 0, 0.7)"
			:z-index="200"
			:lock-scroll="false"
		>
			<div class="wrapper">
				<div class="avatar-main">
					<div class="close" @click="onClickClose">
						<img src="@/assets/romimg/sign/close.png" alt="" />
					</div>
					<div class="users-tab-wrap avater-title">
						<div
							class="users-tab-item"
							:class="{ active: tabType == 1 }"
							@click="onClickTab(1)"
						>
							{{ t('users.avater') }}
						</div>
						<div
							class="users-tab-item"
							:class="{ active: tabType == 2 }"
							@click="onClickTab(2)"
						>
							{{ t('users.avaterFrame') }}
						</div>
					</div>
					<div class="user-avatar" v-show="tabType == 1">
						<img class="icon_img" :src="selectHead.avater" alt="" />
					</div>
					<div class="user-frame" v-show="tabType == 2">
						<img
							class="icon_img"
							:src="selectHead.avater"
							alt=""
							:style="
								selectFrame && selectFrame.avaterFrame ? 'border:none' : ''
							"
						/>
						<img
							v-if="selectFrame && selectFrame.avaterFrame"
							class="icon_img_bg"
							:src="selectFrame.avaterFrame"
							alt=""
						/>
					</div>
					<div class="head-wrap" v-show="tabType == 1">
						<div
							class="head-item"
							v-for="(item, index) in headList"
							@click="onClickHead(item, index)"
							:key="index"
						>
							<img :src="item.avater" alt="" />
						</div>
					</div>
					<div class="frame-wrap" v-show="tabType == 2">
						<div class="frame-item" v-for="(item, index) in frameList" :key="index">
							<div
								class="frame-bg"
								:class="{ active: selectFrame.id == item.id }"
								@click="onClickFrame(item, index)"
							>
								<img class="frame" :src="item.avaterFrame" alt="" />
								<img
									v-if="lockFrame(item)"
									class="lock"
									src="@/assets/romimg/personal/avatar/lock.png"
									alt=""
								/>
							</div>
						</div>
					</div>
					<div class="update-wrap" v-show="tabType == 1">
						<span>{{ stateLabel }}</span>
						<div class="update-btn" v-if="canUpload">
							<el-upload
								class="avatar-uploader"
								action=""
								accept="image/*"
								:show-file-list="false"
								:http-request="uploadHeadFile"
							>
								<div>{{ t('common.upload') }}</div>
							</el-upload>
						</div>
					</div>
					<div class="save_btn" @click="updateInfo">{{ t('ucommonsers.save') }}</div>
				</div>
			</div>
		</van-overlay>
	</div>
</template>

<style lang="scss">
#edit-avatar {
	.van-overlay {
		z-index: 201 !important;

		.wrapper {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;

			.avatar-main {
				width: 550px;
				height: 919px;
				background: url(@/assets/romimg/sign/back.png) no-repeat center;
				background-size: contain;
				position: relative;
				padding: 6px;
				box-sizing: border-box;

				.close {
					width: 60px;
					height: 60px;
					position: absolute;
					right: -55px;
					top: -60px;

					img {
						width: 100%;
						height: 100%;
					}
				}

				.avater-title {
					margin-top: 50px;
					margin-left: 60px;
				}

				.user-avatar {
					width: 142px;
					height: 142px;
					margin: 64px auto 20px;
					position: relative;

					.icon_img {
						position: absolute;
						width: 142px;
						height: 142px;
						border: 3px solid #fbfa02;
						border-radius: 50%;
						overflow: hidden;
						box-sizing: border-box;
					}
				}

				.user-frame {
					width: 142px;
					height: 142px;
					margin: 64px auto 20px;
					position: relative;

					.icon_img {
						position: absolute;
						width: 142px;
						height: 142px;
						border: 3px solid #fbfa02;
						border-radius: 50%;
						overflow: hidden;
						box-sizing: border-box;
					}

					.icon_img_bg {
						position: absolute;
						width: 190px;
						height: 190px;
						left: -20px;
						top: -25px;
					}
				}

				.head-wrap {
					width: 430px;
					height: 341px;
					margin: 60px auto 50px;
					display: flex;
					flex-wrap: wrap;
					justify-content: space-between;
					align-items: center;
					align-content: flex-start;
					background: url(@/assets/romimg/personal/avatar/bg.png) no-repeat
						center;
					background-size: contain;
					padding: 0 20px;

					.head-item {
						margin-top: 45px;

						img {
							width: 95px;
							height: 95px;
							border-radius: 50%;
						}
					}
				}

				.frame-wrap {
					width: 430px;
					height: 341px;
					margin: 60px auto 50px;
					display: flex;
					flex-wrap: wrap;
					padding: 0px 32px;
					justify-content: space-between;
					align-items: center;
					align-content: flex-start;
					padding-bottom: 35px;
					overflow-y: scroll;
					background: url(@/assets/romimg/personal/avatar/bg.png) no-repeat
						center;
					background-size: contain;
					padding: 0 20px;

					&::-webkit-scrollbar {
						width: 0px;
					}

					.frame-item {
						margin-top: 35px;

						.frame-bg {
							width: 133px;
							height: 133px;
							background: url(@/assets/romimg/personal/avatar/item_bg.png)
								no-repeat center;
							background-size: contain;
							box-sizing: border-box;
							position: relative;

							&.active {
								background: url(@/assets/romimg/personal/avatar/item_bg2.png)
									no-repeat center;
								width: 133px;
								height: 133px;
								background-size: contain;
							}

							.frame {
								width: 106px;
								height: 106px;
								margin: auto;
								position: absolute;
								top: 12px;
								right: 13px;
							}

							.lock {
								position: absolute;
								width: 23px;
								height: 24px;
								top: 50px;
								right: 55px;
							}
						}

						&:last-child {
							margin-bottom: 30px;
						}
					}
				}

				.update-wrap {
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 25px;
					margin-top: -15px;

					span {
						color: #fff;
						margin-right: 10px;
					}

					.update-btn {
						width: 80px;
						height: 30px;
						display: flex;
						align-items: center;
						justify-content: center;
						text-align: center;
						color: #fff;
						border: 1px solid #fbfa02;
					}
				}

				.save_btn {
					width: 246px;
					height: 62px;
					margin: 0px auto;
					background: url(@/assets/romimg/personal/btn1.png) no-repeat center;
					background-size: contain;
					border: none !important;
					border-radius: 0 !important;
					font-size: 24px;
					color: #20212b;
					font-weight: bold;
					text-align: center;
					line-height: 62px;
				}
			}
		}
	}
}
</style>
