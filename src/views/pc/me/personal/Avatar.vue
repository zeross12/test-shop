<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useStore } from 'vuex';
import { ref, onMounted } from 'vue';
import { getAvaterFrameList, getAvaterList, uploadfile } from '@/network/api/user';
import { Dialog, Toast } from 'vant';
import { update } from '@/network/api/user'
import defaultIcon from '@/assets/romimg/common/defaultIcon.png'

const props = defineProps(['showState']);
const emit = defineEmits(['close']);
defineExpose({ showAvater });
const store = useStore();
const tabType = ref(1);

const headList = ref([]);
const frameList = ref([]);

const selectHead = ref({ id: 0, avater: defaultIcon });
const selectFrame = ref({});

const stateLabel = ref('');
const canUpload = ref(true);

onMounted(() => {
	getAvater();
	getFrame();
	uploadStateLabel();
})

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
	emit('close');
}

//修改
function updateInfo() {
	let params = {}
	if (selectHead.value.id != 0) {
		params.avaterId = selectHead.value.id;
	}
	if (selectFrame.value.id) {
		params.avaterFrameId = selectFrame.value.id;
	}

	update(params).then(res => {
		if (res.code == 0) {
			Success( { offset : 100, message : res.message } );
			store.dispatch("getUserInfo");
			// emit('close');
		}
	})
}

//头像修改
function uploadHeadFile(file) {
	if (navigator.userAgent.indexOf('UCBrowser') > -1) {
		alert( t( 'menu.browserNotSupport' ) )
	} else {
		if (file.file.type == 'image/jpeg' || file.file.type == 'image/png' || file.file.type ==
			'image/gif' || file.file.type ==
			'image/webp') {
			Toast.loading({
				message: t( 'common.loading' ),
				forbidClick: true,
			})
			let formData = new FormData();
			formData.set('upfile', file.file);

			uploadfile(formData, 1).then((res) => {
				if (res.code == 0) {
					Toast.clear();
					if (res.code == 0) {
						store.dispatch("getUserInfo");
					}
					Success( { offset : 100, message : res.message } );
					stateLabel.value = t( 'users.awaitingReview' );
					canUpload.value = false;
				} else {
					Toast.clear();
				}

			}).catch(err => Toast.clear())
		} else {
			Warn( { offset : 100, message : t( 'sign.formatFail' ), customClass : 'error' } )
		}
	}
}

function uploadStateLabel() {
	let label = t( 'users.vip5Upload' );
	if (store.state.avaterStatus == 0) {
		label = t( 'users.awaitingReview' )
	} else if (store.state.avaterStatus == 1) {
		label = t( 'users.reviewPass' )
	} else if (store.state.avaterStatus == 2) {
		label = t( 'users.reviewFailed' )
	}
	stateLabel.value = label;
	canUpload.value = store.state.userInfoBase.userLevel >= 5 && store.state.avaterStatus != 0;
}


function onClickHead(item, index) {
	selectHead.value = item;
	updateInfo();
}

function onClickFrame(item, index) {
	if (item.needUserLevel > store.state.userInfoBase.userLevel) {
		Warn( { offset : 100, message : t( 'users.needUpgrade' ), customClass : 'error' } )
		return;
	}
	selectFrame.value = item;
	updateInfo();
}

function lockFrame(item) {
	return item.needUserLevel > store.state.userInfoBase.userLevel;
}
</script>
		
<template>
	<div id="pc-edit-avatar">
		<van-overlay :show="showState" style="background-color: rgba(0,0,0,.7);" :z-index="200" :lock-scroll="false">
			<div class="wrapper">
				<div class="avatar-main">
					<div class="close" @click="onClickClose"><img src="@/assets/pcimg/common/close.png" alt="">
					</div>
					<div class="avater-title">{{ t( 'users.editAvater' ) }}</div>
					<div class="avater-content">
						<div class="avater-left">
							<div class="user-frame">
								<img class="icon_img" :src="selectHead.avater" alt=""
									:style="selectFrame && selectFrame.avaterFrame ? 'border:none' : ''">
								<img v-if="selectFrame && selectFrame.avaterFrame" class="icon_img_bg"
									:src="selectFrame.avaterFrame" alt="">
							</div>
							<div class="avater-tab-wrap">
								<div class="avater-tab-item" :class="{ 'active': tabType == 1 }" @click="onClickTab(1)">
									{{ t( 'users.avater' ) }}</div>
								<div class="avater-tab-item" :class="{ 'active': tabType == 2 }" @click="onClickTab(2)">
									{{ t( 'users.avaterFrame' ) }}
								</div>
							</div>
						</div>
						<div class="avater-right">
							<div class="head-wrap" v-show="tabType == 1">
								<div class="head-item" v-for="(item, index) in headList" :key="index" v-show="index != headList.length - 1"
									@click="onClickHead(item, index)">
									<img :src="item.avater" alt="">
								</div>
								<el-upload class="avatar-uploader" v-if="store.state.userInfoBase.userLevel >= 5" action="" accept="image/*" :show-file-list="false"
									:http-request='uploadHeadFile'>
									<div class="upload-icon"></div>
								</el-upload>
							</div>
							<div class="frame-wrap" v-show="tabType == 2">
								<div class="frame-item" v-for="(item, index) in frameList" :key="index">
									<div class="frame-bg" :class="[{ 'active': selectFrame.id == item.id },
									{ 'lock': lockFrame(item) }]" @click="onClickFrame(item, index)">
										<img class="frame" :src="item.avaterFrame" alt="">
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="update-wrap" v-show="tabType == 1" v-if="false">
						<span>{{ stateLabel }}</span>
						<div class="update-btn" v-if="canUpload">
							<el-upload class="avatar-uploader" action="" accept="image/*" :show-file-list="false"
								:http-request='uploadHeadFile'>
								<div>{{ t( 'common.upload' ) }}</div>
							</el-upload>
						</div>
					</div>
					<div class="save_btn" @click="updateInfo" v-if="false">{{ t( 'common.save' ) }}</div>
				</div>
			</div>

		</van-overlay>
	</div>
</template>
		
<style lang="scss" >
#pc-edit-avatar {
	.van-overlay {
		z-index: 201 !important;

		.wrapper {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;

			.avatar-main {
				width: 840px;
				height: 433px;
				background: #191C34;
				position: relative;
				box-sizing: border-box;
				color: #fff;

				.close {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 32px;
					height: 32px;
					position: absolute;
					right: 10px;
					top: 10px;
					cursor: pointer;

					img {
						width: 12px;
						height: 12px;
					}
				}

				.avater-title {
					display: flex;
					align-items: center;
					width: 100%;
					height: 72px;
					border-bottom: 1px solid #3A34B0;
					background: #16192F;
					padding-left: 30px;
					box-sizing: border-box;
					font-size: 21px;
				}

				.avater-content {
					display: flex;
					justify-content: space-between;
					width: 100%;
					box-sizing: border-box;
					padding: 26px 37px 32px 30px;

					.avater-left {
						display: flex;
						flex-direction: column;
						align-items: center;



						.user-frame {
							width: 116px;
							height: 116px;
							margin: 35px auto 38px;
							position: relative;

							.icon_img {
								position: absolute;
								width: 116px;
								height: 116px;
								border-radius: 25px;
								overflow: hidden;
								box-sizing: border-box;
							}

							.icon_img_bg {
								position: absolute;
								width: 210px;
								height: 210px;
								left: -50px;
								top: -50px;
							}
						}

						.avater-tab-wrap {
							display: flex;
							flex-direction: column;
							align-items: center;

							.avater-tab-item {
								display: flex;
								width: 232px;
								height: 47px;
								justify-content: center;
								align-items: center;
								color: #CFD4FF;
								font-size: 15px;
								border-radius: 6px;
								border: 1px solid #313350;
								margin-bottom: 14px;
								cursor: pointer;

								&.active {
									background: #3A34B0;
									border: 1px solid #3A34B0;
									color: #fff;
								}
							}
						}
					}

					.avater-right {
						width: 502px;
						height: 307px;
						background: #16192F;
						padding: 38px 30px 20px 36px;
						box-sizing: border-box;

						.head-wrap {
							width: 100%;
							height: 100%;
							display: grid;
							flex-wrap: wrap;
							grid-template-columns: repeat(auto-fill, 64px);
							grid-template-rows: repeat(auto-fill, 64px);
							column-gap: 25px;
							row-gap: 21px;

							.head-item {
								width: 64px;
								height: 64px;
								cursor: pointer;

								img {
									width: 64px;
									height: 64px;
									border-radius: 16px;
								}

							}

							.upload-icon
							{
								width: 64px;
								height: 64px;
								background: url( @/assets/pcimg/me/upload-icon.png ) no-repeat;
								background-size: cover;
							}
						}

						.frame-wrap {
							width: 100%;
							height: 100%;
							display: grid;
							flex-wrap: wrap;
							grid-template-columns: repeat(auto-fill, 64px);
							grid-template-rows: repeat(auto-fill, 64px);
							column-gap: 25px;
							row-gap: 21px;


							.frame-item {
								width: 64px;
								height: 64px;
								cursor: pointer;

								.frame-bg {
									width: 64px;
									height: 64px;
									box-sizing: border-box;
									position: relative;

									.frame {
										width: 64px;
										height: 64px;
									}

									&.lock {
										-webkit-filter: grayScale(100%);
										filter: grayScale(100%);
									}
								}

							}
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
						border: 1px solid #FBFA02;
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
					color: #20212B;
					font-weight: bold;
					text-align: center;
					line-height: 62px;
					cursor: pointer;
				}
			}
		}
	}
}
</style>