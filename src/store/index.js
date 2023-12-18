import { createStore } from 'vuex'
import { tokenName } from '../config'
import { getInfo } from '@/network/api/user';
import { verifyToken } from '@/network/api/login';
import { getConfigList, getModuleList, getArticleList, getGoodsBgImages } from '@/network/api/index';
// import { getGoodsBgImages } from '@/network/api/third';
import router from '../router'

const state = {
	platformId: 1,//平台ID
	token: '',//toekn
	userId: 0,
	sectionModule: [],	///	首页显示的板块
	//个人信息
	userInfoAssets: {
		ammon: '0.00',//弹壳
		amount: '0.00',//金额
		point: '0.00',//积分
		spreadBoxCount: 0,//推广箱子数
		spreadRewardAmount: 0//推广奖励的金额(可提取)
	},
	userInfoBase: {
		account: "",
		avater: "",
		avaterFrame: 0,
		mobile: "",
		nickName: "",
		platformId: 1,
		userLevel: 0,
		userType: 1
	},
	userInfoExt: {
		channelCode: "",//当前的渠道
		idNumber: "",//身份证
		invitationCode: "",//邀请码
		isChangeInvitationCode: true,//是否可修改邀请码(true:可以修改,false:不可修改)
		isChangeSpreadCode: true,//是否可修改推广码(true:可以修改,false:不可修改)
		realName: "",//真实姓名
		sex: 0,//性别 0.不公开 1.男 2.女
		spreadCode: "",//推广码
		steamUrl: ""//steam仓库链接
	},
	hasRegisterPacket: false,//是否可领取注册红包(true-可以领取, false-不可领取)
	noReadMessages: 0,//未读取的消息条数
	avaterStatus: -1,//头像状态 0审核中, 1-审核通过, 2-审核未通过
	reserveStatus: 1,

	onlineUser: 0,	///	当前在线用户数

	//配置信息
	serverConfigList: [],

	//模块信息
	moduleList: [],
	moduleBlindBox: true,
	moduleRoll: true,
	moduleLucky: true,
	moduleBattleRank: true,
	moduleContract: true,
	moduleGrade: true,
	moduleTiming: true,
	moduleMall: true,
	moduleAmmonBox: true,
	moduleBattle: true,
	moduleRecharge: true,
	moduleRucksack: true,
	moduleAppDownload: true,
	moduleService: true,
	moduleGroupChat: true,
	moduleSpread: true,
	moduleHelpContact: true,
	moduleHelpPrivacy: true,
	moduleHelpRegulation: true,
	moduleHelpProblem: true,
	moduleHelpRelevant: true,
	moduleHelpCompliance: true,
	moduleHelpFanDuBoNotice: true,
	moduleHelpChengMiNotice: true,

	//装备背景图信息
	goodsBgList: [],

	//用户协议相关
	agreementChecked: false,


	showSignView: false, //登录弹框
	showSignViewTab: 1, //登录弹框
	showRegisterView: false, //注册弹框
	showForgetPWView: false, //忘记密码
	showBindPhoneiew: false, //绑定手机
	showRechargeView: false,
	showFooterView: false, //底部
	showHeaderView: true, //顶部

	//玩法介绍
	howPlay: {
		show: false,
		html: ""
	},

	switchNotice: false, //公告

	//绑定手机弹框
	bindingmobileShow: false,

	//注册红包
	regPacket: {
		closeRed: false, //未开
		openRed: false, //已开
		leftSmall: false, //侧边
		money: 0 //金额
	},

	//口令红包
	passRed: false,


	//盲盒最近掉落
	boxDropList: [],

	//对战 新的房间信息
	battleCreateRoom: [],
	battleJoinRoom: null,
	watchUserCount: 0,
	notJoinRoomNotice: false,
	clickBattleBoxData: {},

	//roll
	openResultRollId: 0,

	//时间盲盒首页提示
	timingIndexNotice: true,

	//审核控制显示
	beiAnExamine: false,

	//幸运盲盒
	fliterParams: { type: 1, subType: 0, roomSort: 0 },

	battleListSort: 1,

	//开关
	soundSwitch: true,
	animationSwitch: true,
	openboxSoundSwitch: true,
	luckySoundSwitch: true,

	showActivityDialog: false,
	activityConfig: {},

	otherConfig: {},

	//pc h5
	isPCClient: false,
}

const getters = {
	hasLogin(state) {
		return state.token != '';
	},
	//获取配置
	getConfigItem(state) {
		return function (key) {
			for (let i = 0; i < state.serverConfigList.length; i++) {
				let item = state.serverConfigList[i];
				if (item.itemKey === key) {
					return item.itemValue;
				}
			}
		}
	},

	getGoodsBgImage(state) {
		return function (type, level) {
			return state.goodsBgList[type][level];
		}
	},
}

const mutations = {
	setSectionModule(state, data) {
		state.sectionModule = data
	},
	initLocalData(state) {
		let soundSwitch = localStorage.getItem("soundSwitch");
		let animationSwitch = localStorage.getItem("animationSwitch");
		if (soundSwitch == null || soundSwitch == undefined) {
			localStorage.setItem("soundSwitch", true);
			soundSwitch = "true";
		}
		if (animationSwitch == null || animationSwitch == undefined) {
			localStorage.setItem("animationSwitch", true);
			animationSwitch = "true";
		}
		state.soundSwitch = soundSwitch == "true";
		state.animationSwitch = animationSwitch == "true";
	},

	setOnlineUser(state, data) {
		state.onlineUser = data
	},

	setSoundSwitch(state, data) {
		state.soundSwitch = data;
	},

	setAnimationSwitch(state, data) {
		state.animationSwitch = data;
	},

	setOpenBoxSoundSwitch(state, data) {
		state.openboxSoundSwitch = data;
	},

	setLuckySoundSwitch(state, data) {
		state.luckySoundSwitch = data;
	},

	setBattleListSort(state, data) {
		state.battleListSort = data;
	},

	setPlatformId(state, data) {
		state.platformId = data;
	},

	setLoginInfo(state, data) {
		state.token = data.token;
		state.userId = data.userId;
		localStorage.setItem(tokenName, data.token);
	},

	setUserInfo(state, data) {
		state.userInfoAssets = data.assets;
		state.userInfoBase = data.base;
		state.userInfoExt = data.ext;
		state.noReadMessages = data.noReadMessages;
		state.userId = data.userId;
		state.avaterStatus = data.avaterStatus;
		state.reserveStatus = data.reserveStatus;

		let preHasRegisterPacket = state.hasRegisterPacket;
		state.hasRegisterPacket = data.hasRegisterPacket;

		if (!preHasRegisterPacket && data.hasRegisterPacket) {
			state.regPacket.closeRed = true;
			state.regPacket.openRed = false;
			state.regPacket.leftSmall = false;
		}
		if (!data.hasRegisterPacket) {
			state.regPacket.closeRed = false;
			state.regPacket.openRed = false;
			state.regPacket.leftSmall = false;
		}
	},

	setUserAmount(state, amount) {
		state.userInfoAssets.amount = amount;
	},


	refreshToken(state, token) {
		state.token = token;
	},

	//登出
	logout(state) {
		state.token = '';
		state.userId = 0;
		state.reserveStatus = 1;
		localStorage.removeItem(tokenName);
		router.replace('/');
		// Window.closeWebSocketSend(false);
		ws.close()
	},

	initConfigList(state, data) {
		state.serverConfigList = data;
	},

	initModuleList(state, data) {
		let items = data.items;
		state.moduleList = items;

		let hasModule = function (arr, name) {
			for (let i = 0; i < arr.length; i++) {
				if (arr[i].name === name) {
					return arr[i].status == 1;
				}
			}
		}
		state.moduleBlindBox = hasModule(items, 'BlindBox');
		state.moduleRoll = hasModule(items, 'Roll');
		state.moduleLucky = hasModule(items, 'Lucky');
		state.moduleBattleRank = hasModule(items, 'BattleRank');
		state.moduleContract = hasModule(items, 'Contract');
		state.moduleGrade = hasModule(items, 'Grade');
		state.moduleTiming = hasModule(items, 'Timing');
		state.moduleMall = hasModule(items, 'Mall');
		state.moduleAmmonBox = hasModule(items, 'AmmonBox');
		state.moduleBattle = hasModule(items, 'Battle');
		state.moduleRecharge = hasModule(items, 'Recharge');
		state.moduleRucksack = hasModule(items, 'Rucksack');
		state.moduleAppDownload = hasModule(items, 'AppDownload');
		state.moduleService = hasModule(items, 'Service');
		state.moduleGroupChat = hasModule(items, 'GroupChat');
		state.moduleSpread = hasModule(items, 'Spread');
		state.moduleHelpContact = hasModule(items, 'HelpContact');
		state.moduleHelpPrivacy = hasModule(items, 'HelpPrivacy');
		state.moduleHelpRegulation = hasModule(items, 'HelpRegulation');
		state.moduleHelpProblem = hasModule(items, 'HelpProblem');
		state.moduleHelpRelevant = hasModule(items, 'HelpRelevant');
		state.moduleHelpCompliance = hasModule(items, 'HelpCompliance');
		state.moduleHelpFanDuBoNotice = hasModule(items, 'HelpFanDuBoNotice');
		state.moduleHelpChengMiNotice = hasModule(items, 'HelpFangChengMiNotice');

	},

	initGoodsBgList(state, data) {
		state.goodsBgList = data;
	},

	//登录弹框
	setSignView(state, data) {
		state.showSignView = data
	},

	setSignViewTab(state, data) {
		state.showSignViewTab = data
	},

	//注册弹框
	setRegisterView(state, data) {
		state.showRegisterView = data
	},

	//忘记密码弹框
	setForgetPWView(state, data) {
		state.showForgetPWView = data
	},

	//绑定手机弹框
	setBindPhoneView(state, data) {
		state.showBindPhoneiew = data
	},

	setRechargeView(state, data) {
		state.showRechargeView = data
	},


	//用户协议
	setAgreementChecked(state, condition) {
		state.agreementChecked = condition
	},

	//玩法介绍
	setHowPlay(state, data) {
		state.howPlay.show = data.show
		state.howPlay.html = data.html
	},

	//公告
	setSwitchNotice(state, data) {
		state.switchNotice = data
	},

	//绑定手机弹框
	setbindingmobileShow(state, data) {
		state.bindingmobileShow = data
	},

	//设置底部
	setFooterView(state, data) {
		state.showFooterView = data;
	},
	//设置头部
	setHeaderView(state, data) {
		state.showHeaderView = data;
	},
	//红包
	setRegPacket(state, data) {
		state.regPacket.closeRed = data.closeRed
		state.regPacket.openRed = data.openRed
		state.regPacket.leftSmall = data.leftSmall
		state.regPacket.money = data.money
	},

	//口令红包
	setPassRed(state, data) {
		state.passRed = data
	},

	//盲盒最近掉落
	updateBoxDropList(state, data) {
		state.boxDropList = data;
	},
	//对战 新的房间信息
	updateCreateBattleRoom(state, data) {
		state.battleCreateRoom = data;
	},
	updateJoinBattleRoom(state, data) {
		state.battleJoinRoom = data;
	},
	updateRoomWatchCount(state, data) {
		state.watchUserCount = data;
	},
	//加入对战房间弹框
	setBattleNotJoinNoitce(state, data) {
		state.notJoinRoomNotice = data
	},
	//点击箱子的信息
	setClickBattleBoxData(state, data) {
		state.clickBattleBoxData = data
	},

	//roll房开奖
	setOpenResultRollId(state, data) {
		state.openResultRollId = data
	},
	setTimingIndexNotice(state, data) {
		state.timingIndexNotice = data
	},

	setFliterParams(state, params) {
		state.fliterParams = params;
	},
	setActivityDialogVisible(state, data) {
		state.showActivityDialog = data;
	},
	setActivityConfig(state, data) {
		state.activityConfig = data;
	},
	setOtherConfig(state, data) {
		state.otherConfig = data;
	},
	setPCClient(state, isPC) {
		state.isPCClient = isPC;
	},
}

const actions = {
	async getUserInfo(store) {
		const res = await getInfo();
		if (res.code === 0) {
			store.commit("setUserInfo", res.data);

			if (res.data.base.mobile == '' && !Window.googleChannel) {
				store.commit("setBindPhoneView", true);
			}
		}
	},
	async refreshToken(store) {
		let token = localStorage.getItem(tokenName);
		if (token) {
			const res = await verifyToken();
			if (res.code === 0) {
				if (res.data.isValid) {
					store.commit('refreshToken', token);
					store.commit('setSwitchNotice', true);
					store.dispatch('getUserInfo');
					store.dispatch('getActivityConfig');
					ws.send(JSON.stringify({
						cid: 11,
						data: JSON.stringify({ token: token })
					}))
					// Window.webSocketSend({ cid: 11, data: JSON.stringify({ token: token }) });
				} else {
					store.commit('logout');
				}
			}
		}

	},

	async initConfigList(store) {
		const res = await getConfigList();
		if (res.code === 0) {
			store.commit('initConfigList', res.data.items);
		}
	},

	async initModuleList(store) {
		const res = await getModuleList();
		if (res.code === 0) {
			store.commit('initModuleList', res.data);
		}
	},

	async initGoodsBgList(store) {
		const res = await getGoodsBgImages();
		// const res={
		// 	"code": 0,
		// 	"data": {
		// 	"items": [
		// 		{
		// 		"id": 1,
		// 		"type": 1,
		// 		"goodsLevel": 1,
		// 		"name": "跑马灯1",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/b711b21245ac27df0c61e44a3e7abd67.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 2,
		// 		"type": 1,
		// 		"goodsLevel": 2,
		// 		"name": "跑马灯2",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/d5a78aede72f8eb96d488b9ddc2c27ac.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 3,
		// 		"type": 1,
		// 		"goodsLevel": 3,
		// 		"name": "跑马灯3",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/fba14f7ae5f5314e6fcd2eeeac514254.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 4,
		// 		"type": 1,
		// 		"goodsLevel": 4,
		// 		"name": "跑马灯4",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/798de6caddd093e53ff2cadec9ab50e6.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 5,
		// 		"type": 1,
		// 		"goodsLevel": 5,
		// 		"name": "跑马灯5",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/0b88bb016f5468cb1d5dd63f7ac7ddd9.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 6,
		// 		"type": 1,
		// 		"goodsLevel": 6,
		// 		"name": "跑马灯6",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/740e5ec942c117fe10a0dc01839c6eaa.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 7,
		// 		"type": 1,
		// 		"goodsLevel": 7,
		// 		"name": "跑马灯7",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/0c13726d59db1a6bab661d2fa068ded7.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 8,
		// 		"type": 2,
		// 		"goodsLevel": 1,
		// 		"name": "盲盒页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/78c048515bf5bbc86eef9f7b9dcf90d0.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 9,
		// 		"type": 2,
		// 		"goodsLevel": 2,
		// 		"name": "盲盒页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/f1d8ce06c2643d36db2590237a371007.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 10,
		// 		"type": 2,
		// 		"goodsLevel": 3,
		// 		"name": "盲盒页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/018a58a0108fffb3b391ce177e0b35ab.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 11,
		// 		"type": 2,
		// 		"goodsLevel": 4,
		// 		"name": "盲盒页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/4b007d3c6e9e86bfa8feec8427f55744.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 12,
		// 		"type": 2,
		// 		"goodsLevel": 5,
		// 		"name": "盲盒页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/34362ec5060e44739158bbab18cfd20c.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 13,
		// 		"type": 2,
		// 		"goodsLevel": 6,
		// 		"name": "盲盒页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/ab95769e3d84ee2427a558f8e9defec2.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 14,
		// 		"type": 2,
		// 		"goodsLevel": 7,
		// 		"name": "盲盒页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/95650736f2a0040c4a40f3dfba557944.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 15,
		// 		"type": 3,
		// 		"goodsLevel": 1,
		// 		"name": "roll房",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/3e03fdf61d7ca244fae01ac6ca839570.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 16,
		// 		"type": 3,
		// 		"goodsLevel": 2,
		// 		"name": "roll房",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/b9835fd01d7caf3aef32ac15214dd211.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 17,
		// 		"type": 3,
		// 		"goodsLevel": 3,
		// 		"name": "roll房",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/c2ffcfbccf7123dcfcf80407a09bfe11.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 21,
		// 		"type": 3,
		// 		"goodsLevel": 4,
		// 		"name": "roll房",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/422932ba2ac32d8fd171ea8b44b87034.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 18,
		// 		"type": 3,
		// 		"goodsLevel": 5,
		// 		"name": "roll房",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/f69b7544be07ed2f0777dba1e05f8da8.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 19,
		// 		"type": 3,
		// 		"goodsLevel": 6,
		// 		"name": "roll房",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/ef884506e34a2cb3c23ae7f4134221fa.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 20,
		// 		"type": 3,
		// 		"goodsLevel": 7,
		// 		"name": "roll房",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/6749172da8df15177902752ce1d2c194.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 48,
		// 		"type": 4,
		// 		"goodsLevel": 1,
		// 		"name": "对战页1",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/5badf018af18a432dc60cfb3a2eeb66f.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 49,
		// 		"type": 4,
		// 		"goodsLevel": 2,
		// 		"name": "对战页2",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/b60f7da97c4912d34a643bea3a7ec69b.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 50,
		// 		"type": 4,
		// 		"goodsLevel": 3,
		// 		"name": "对战页3",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/984327d73a7dc87c1f08e587f42a84a0.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 51,
		// 		"type": 4,
		// 		"goodsLevel": 4,
		// 		"name": "对战页4",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/79d6a27de6ad645865bfedd82813ed13.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 52,
		// 		"type": 4,
		// 		"goodsLevel": 5,
		// 		"name": "对战页5",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/570157ae5fba6ab4263251a24351a81b.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 53,
		// 		"type": 4,
		// 		"goodsLevel": 6,
		// 		"name": "对战页6",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/ae84318a361dccbdfe04b249579d6e07.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 54,
		// 		"type": 4,
		// 		"goodsLevel": 7,
		// 		"name": "对战页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/e032af228ab166dc24102a68de14d4d1.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 36,
		// 		"type": 5,
		// 		"goodsLevel": 1,
		// 		"name": "对战房间信息1",
		// 		"image": "https://hztupian.oss-cn-hangzhou.aliyuncs.com/files/box/04bec3bb58bb5608bb8f121aaf56ea96.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 37,
		// 		"type": 5,
		// 		"goodsLevel": 3,
		// 		"name": "对战房间信息2",
		// 		"image": "https://hztupian.oss-cn-hangzhou.aliyuncs.com/files/box/4bd0575dfef0e3fad1299e0fea59f139.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 38,
		// 		"type": 5,
		// 		"goodsLevel": 4,
		// 		"name": "对战房间信息3",
		// 		"image": "https://hztupian.oss-cn-hangzhou.aliyuncs.com/files/box/b23af97d40d8b01db44950e23a4330bd.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 39,
		// 		"type": 5,
		// 		"goodsLevel": 6,
		// 		"name": "对战房间信息4",
		// 		"image": "https://hztupian.oss-cn-hangzhou.aliyuncs.com/files/box/929390035bfec9c09758e9eabfa67eac.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 40,
		// 		"type": 5,
		// 		"goodsLevel": 7,
		// 		"name": "对战房间信息5",
		// 		"image": "https://hztupian.oss-cn-hangzhou.aliyuncs.com/files/box/379eb84dccf3ad2de465133f1bb830ba.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 29,
		// 		"type": 6,
		// 		"goodsLevel": 1,
		// 		"name": "回收",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/cc97bd24f9ddd02027bab051c4dd3038.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 30,
		// 		"type": 6,
		// 		"goodsLevel": 2,
		// 		"name": "回收",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/43c06d19d26da9a5286e3e660ce55ec0.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 31,
		// 		"type": 6,
		// 		"goodsLevel": 3,
		// 		"name": "回收",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/d46e7828cc03ca79f0b5a9bd781b69e2.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 32,
		// 		"type": 6,
		// 		"goodsLevel": 4,
		// 		"name": "回收",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/f77afd01547e08aa9292de403c1e77a8.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 33,
		// 		"type": 6,
		// 		"goodsLevel": 5,
		// 		"name": "回收",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/7d2a265114654751d2e3f59b5c1abe71.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 34,
		// 		"type": 6,
		// 		"goodsLevel": 6,
		// 		"name": "回收",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/136c349c6cf8c5279bd4928531388f4c.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 35,
		// 		"type": 6,
		// 		"goodsLevel": 7,
		// 		"name": "回收",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/d07d780fdb52f5031a4f9876a8b71e17.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 67,
		// 		"type": 7,
		// 		"goodsLevel": 1,
		// 		"name": "商城背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/72686718213eb883696ee0a9e0dd5a74.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 68,
		// 		"type": 7,
		// 		"goodsLevel": 2,
		// 		"name": "商城背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/de2052b30c762d21d1556245a839a2ff.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 62,
		// 		"type": 7,
		// 		"goodsLevel": 3,
		// 		"name": "商城背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/c90349ec981ce4dec7eb4ae241d739d9.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 63,
		// 		"type": 7,
		// 		"goodsLevel": 4,
		// 		"name": "商城背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/61e2605833550d4dbdd45f7f21191095.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 64,
		// 		"type": 7,
		// 		"goodsLevel": 5,
		// 		"name": "商城背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/e3d494a2910ca1503c6b3e175a57252c.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 65,
		// 		"type": 7,
		// 		"goodsLevel": 6,
		// 		"name": "商城背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/a9127d42a56174fbaca651529a08c310.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 66,
		// 		"type": 7,
		// 		"goodsLevel": 7,
		// 		"name": "商城背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/679dd01161e791c970537b46d2877843.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 22,
		// 		"type": 8,
		// 		"goodsLevel": 1,
		// 		"name": "盲盒结果页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/f8df9ccf9d8d8a2633e67d24e58e009d.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 23,
		// 		"type": 8,
		// 		"goodsLevel": 2,
		// 		"name": "盲盒结果页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/11edf226313c17ae54131151af90d665.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 24,
		// 		"type": 8,
		// 		"goodsLevel": 3,
		// 		"name": "盲盒结果页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/b0cd63c60bab4c1fc3315fe4dc07a291.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 25,
		// 		"type": 8,
		// 		"goodsLevel": 4,
		// 		"name": "盲盒结果页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/7e88e666f8cd682289c6d018198bf061.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 26,
		// 		"type": 8,
		// 		"goodsLevel": 5,
		// 		"name": "盲盒结果页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/65519177efbb7881d8b58961a1531015.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 27,
		// 		"type": 8,
		// 		"goodsLevel": 6,
		// 		"name": "盲盒结果页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/e3197d9c8b85247bbcc00f97c90e5c9e.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 28,
		// 		"type": 8,
		// 		"goodsLevel": 7,
		// 		"name": "盲盒结果页",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/82ed08ba4939d98d8158e325bbdc83fa.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 41,
		// 		"type": 9,
		// 		"goodsLevel": 1,
		// 		"name": "对战武器光圈1",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/22899ee5de7492fe5125c65ec409a4cc.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 42,
		// 		"type": 9,
		// 		"goodsLevel": 2,
		// 		"name": "对战武器光圈2",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/b1a9a3115e293005683e2663c4b5bbe5.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 43,
		// 		"type": 9,
		// 		"goodsLevel": 3,
		// 		"name": "对战武器光圈3",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/1b86d0fbc109842e44d435982162dc67.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 44,
		// 		"type": 9,
		// 		"goodsLevel": 4,
		// 		"name": "对战武器光圈4",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/58d8536ba04efb2f85514ff7f1e61a75.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 45,
		// 		"type": 9,
		// 		"goodsLevel": 5,
		// 		"name": "对战武器光圈5",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/f509745775e60d87871deb5143642946.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 46,
		// 		"type": 9,
		// 		"goodsLevel": 6,
		// 		"name": "对战武器光圈6",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/fdd41b38e78a81f79fe49b8c2217772a.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 47,
		// 		"type": 9,
		// 		"goodsLevel": 7,
		// 		"name": "对战武器光圈7",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/e6cdea817041cb208ef9aedffcc479ef.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 55,
		// 		"type": 10,
		// 		"goodsLevel": 1,
		// 		"name": "汰换武器背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/37c6d471917208aeb3a8cbd57798a6dd.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 56,
		// 		"type": 10,
		// 		"goodsLevel": 2,
		// 		"name": "汰换武器背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/494366bc11b1a10776a2de72342317f3.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 57,
		// 		"type": 10,
		// 		"goodsLevel": 3,
		// 		"name": "汰换武器背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/d519dface22ac9287615693f7c548bf9.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 58,
		// 		"type": 10,
		// 		"goodsLevel": 4,
		// 		"name": "汰换武器背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/7c233ccb48b5f1ff6b7d33d04383a845.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 59,
		// 		"type": 10,
		// 		"goodsLevel": 5,
		// 		"name": "汰换武器背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/8a171a982afc8833312dc03f2c45dd4f.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 60,
		// 		"type": 10,
		// 		"goodsLevel": 6,
		// 		"name": "汰换武器背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/aa631faf4f1dad8a10cc71c0bffa6aa9.png",
		// 		"sort": 0
		// 		},
		// 		{
		// 		"id": 61,
		// 		"type": 10,
		// 		"goodsLevel": 7,
		// 		"name": "汰换武器背景",
		// 		"image": "https://199tpzy.oss-cn-hangzhou.aliyuncs.com/files/box/69b87126321cb9778f762271b84e768a.png",
		// 		"sort": 0
		// 		}
		// 	]
		// 	},
		// 	"message": "操作成功"
		// }
		if (res.code === 0) {
			let items = res.data.items;
			let list = {};
			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				if (!list[item.type]) {
					list[item.type] = {};
				}
				list[item.type][item.goodsLevel] = item.image;
			}
			store.commit('initGoodsBgList', list);
		}
	},
	async getActivityConfig(store) {
		let type = 'ActivityConfig';
		const res = await getArticleList({ type: type, platformId: store.state.platformId });
		if (res.code === 0) {
			let items = res.data.items;
			if (items && items.length > 0) {
				items.sort((a, b) => (a.sort - b.sort));
				let infoText = items[0].content;
				infoText = infoText.replace("<p>", "");
				infoText = infoText.replace("</p>", "");
				let config = JSON.parse(infoText);
				if (config) {
					store.commit("setActivityConfig", config);
					store.commit("setActivityDialogVisible", config.open);
				}
			}
		}
	},
	async getOtherConfig(store) {
		let type = 'OtherConfig';
		const res = await getArticleList({ type: type, platformId: store.state.platformId });
		if (res.code === 0) {
			let items = res.data.items;
			if (items && items.length > 0) {
				items.sort((a, b) => (a.sort - b.sort));
				let infoText = items[0].content;
				infoText = infoText.replace("<p>", "");
				infoText = infoText.replace("</p>", "");
				var reg = new RegExp('&amp;', "g")
				infoText = infoText.replace(reg, "&");
				let config = JSON.parse(infoText);
				if (config) {
					store.commit("setOtherConfig", config);
				}
			}
		}
	},
}

export default createStore({
	state: state,
	getters: getters,
	mutations: mutations,
	actions: actions
})