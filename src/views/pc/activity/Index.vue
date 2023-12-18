<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
///	feat:新增
import { onMounted, ref, onUnmounted, nextTick, computed, watch } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useStore } from "vuex"
import { tokenName } from "@/config";
import { 
	getSigninRecords, 
	signin, 
	getUserSticker,
	getRewardRecords
} from "@/network/api/user"
import {
	exchangeReward,
	getRewardList,
	getTodayRecharge
} from "@/network/api/activity"

import { 
	getActivityList,
	openRedPacket
} from '@/network/api/redpacket'

import font0 from '@/assets/pcimg/activity/10.1/font-0.png'
import font1 from '@/assets/pcimg/activity/10.1/font-1.png'
import font2 from '@/assets/pcimg/activity/10.1/font-2.png'
import font3 from '@/assets/pcimg/activity/10.1/font-3.png'

import font4 from '@/assets/pcimg/activity/10.1/font-4.png'
import font5 from '@/assets/pcimg/activity/10.1/font-5.png'
import font6 from '@/assets/pcimg/activity/10.1/font-6.png'
import font7 from '@/assets/pcimg/activity/10.1/font-7.png'

import font_0 from '@/assets/pcimg/activity/10.1/font_0.png'
import font_1 from '@/assets/pcimg/activity/10.1/font_1.png'
import font_2 from '@/assets/pcimg/activity/10.1/font_2.png'
import font_3 from '@/assets/pcimg/activity/10.1/font_3.png'

import font_4 from '@/assets/pcimg/activity/10.1/font_4.png'
import font_5 from '@/assets/pcimg/activity/10.1/font_5.png'
import font_6 from '@/assets/pcimg/activity/10.1/font_6.png'
import font_7 from '@/assets/pcimg/activity/10.1/font_7.png'

import tip0 from '@/assets/pcimg/activity/10.1/ju.png'
import tip1 from '@/assets/pcimg/activity/10.1/guo.png'
import tip2 from '@/assets/pcimg/activity/10.1/tong.png'
import tip3 from '@/assets/pcimg/activity/10.1/qing.png'
import tip4 from '@/assets/pcimg/activity/10.1/yao.png'
import tip5 from '@/assets/pcimg/activity/10.1/ling.png'
import tip6 from '@/assets/pcimg/activity/10.1/xian.png'
import { Success, Warn } from "@/util/common";

const router = useRouter();
const route = useRoute();
const store = useStore();
const sticker = ref( [] )

const stickerTop = ref( [] )
const stickerBottom = ref( [] )
const showRule = ref( false )
const showRedPacketRule = ref( false )

const rewardList = ref( [] )
const exchangeRecord = ref( [] )

const redPackets = ref( [] )

///	可兑换的红包数量
const reward = ref( [
	3.99, 5.99, 9.99, 19.9, 39.9, 99.9, 199, 399, 999
] )
async function getActivityLists()
{
	let res = await getActivityList( { platformId : 1 } )
	
	if( res.code == 0 )
	{
		// window.$dev && console.log( res.data )
		redPackets.value = res.data.items.reverse()
		// window.$dev && console.log( redPackets.value )
	}
}

async function getExchangeRecord()
{
	let param =
	{
		limit : 10,
		page : 1,
		sortType : 2
	}
	let res = await getRewardRecords( param )
	if( res.code == 0 )
	{
		exchangeRecord.value = res.data.items
	}
}

async function getRewardLists()
{
	let res = await getRewardList()

	if( res.code == 0 )
	{
		// window.$dev && console.log( res.data )
		rewardList.value = res.data.items
	}
}

function onclickSignRoll()
{
	router.push(
		"/p/roll_detail?rollId=" + store.state.activityConfig.roll_id_500
	)
}

async function getStickerList()
{
	let res = await getUserSticker()
	if( res.code == 0 )
	{
		sticker.value = res.data.items

		stickerTop.value = sticker.value.slice( 0, 4 )
		stickerBottom.value = sticker.value.slice( 4 )
		stickerBottom.value.splice( 1, 0, stickerBottom.value[0] )

	}
}

const font = ref( [
	font0, font1, font2, font3,
	font4, font5, font6, font7
] )

const fontNil = ref( [
	font_0, font_1, font_2, font_3,
	font_4, font_5, font_6, font_7
] )

const tip = ref( [
	tip0, tip1, tip2, tip3, tip4, tip5, tip6
] )

const rewardId = ref( 0 )

const showExchange = ref( false )
const curReward = ref( {} )
const step = ref( 1 )								///	当前兑换步骤
const count = ref( 1 )

/**
 * 关闭兑奖窗口
 */
function closeExchange()
{
	showExchange.value = false
	rewardId.value = 0
	step.value = 1
	curReward.value = {}
	count.value = 1
}

/**
 * 选择奖品
 * @param item Object
 * @param id Number
 */
function selectReward( item, id )
{
	rewardId.value = id
	curReward.value = item
}

/**
 * 点击进入下一步
 * @returns mixed
 */
function next()
{
	if( rewardId.value == 0 )
	{
		return Warn( '请先选择一个要兑换的奖品' )
	}

	window.$dev && console.log( sticker.value[6] )
	switch( rewardId.value )
	{
		case 1 :
			if( sticker.value[1].stickerCount < 1 )
				return Warn( '对不起！您的“国”字字符不够' )
			if( sticker.value[3].stickerCount < 1 )
				return Warn( '对不起！您的”庆“字字符不够' )
		break

		case 2 :
			if( sticker.value[0].stickerCount < 1 )
				return Warn( '对不起！您的“举”字字符不够' )
			if( sticker.value[1].stickerCount < 1 )
				return Warn( '对不起！您的“国”字字符不够' )
			if( sticker.value[2].stickerCount < 1 )
				return Warn( '对不起！您的”同“字字符不够' )
			if( sticker.value[3].stickerCount < 1 )
				return Warn( '对不起！您的”庆“字字符不够' )
		break

		case 3 :
			if( sticker.value[5].stickerCount < 1 )
				return Warn( '对不起！您的“领”字字符不够' )
			if( sticker.value[6].stickerCount < 1 )
				return Warn( '对不起！您的”先“字字符不够' )
		break

		case 4 :
			if( sticker.value[4].stickerCount < 2 )
				return Warn( '对不起！您的“遥”字字符不够' )
			if( sticker.value[5].stickerCount < 1 )
				return Warn( '对不起！您的“领”字字符不够' )
			if( sticker.value[6].stickerCount < 1 )
				return Warn( '对不起！您的”先“字字符不够' )
		break
	}

	step.value = 2
}

const exchanging = ref( false )
async function exchange()
{
	// window.$dev && console.log( rewardId.value )
	if( exchanging.value ) return Warn( '您的奖品正在兑换中，请稍后再试' )
	let param =
	{
		count : count.value,
		rewardId : rewardId.value
	}
	// window.$dev && console.log( param )
	exchanging.value = true
	let res = await exchangeReward( param )
	exchanging.value = false

	if( res.code == 0 )
	{
		// Success( `恭喜您！成功兑换到${res.data.amount}个金币` )
		if( curReward.value.rewardType == 2 ) service()

		Success( `恭喜您！兑换成功` )
		getStickerList()
		getExchangeRecord()
		store.dispatch( 'getUserInfo' )
		closeExchange()
	}
}

/**
 * 减少兑换数量
 */
function reduce()
{
	if( count.value <= 1 ) return

	count.value--
}

/**
 * 增加兑换数量
 */
function add()
{
	switch( rewardId.value )
	{
		case 1 :
			if( sticker.value[1].stickerCount < count.value + 1 )
				return Warn( '对不起！您的“国”字字符不够' )
			if( sticker.value[3].stickerCount < count.value + 1 )
				return Warn( '对不起！您的”庆“字字符不够' )
		break

		case 2 :
			if( sticker.value[0].stickerCount < count.value + 1 )
				return Warn( '对不起！您的“举”字字符不够' )
			if( sticker.value[1].stickerCount < count.value + 1 )
				return Warn( '对不起！您的“国”字字符不够' )
			if( sticker.value[2].stickerCount < count.value + 1 )
				return Warn( '对不起！您的”同“字字符不够' )
			if( sticker.value[3].stickerCount < count.value + 1 )
				return Warn( '对不起！您的”庆“字字符不够' )
		break

		case 3 :
			if( sticker.value[5].stickerCount < count.value + 1 )
				return Warn( '对不起！您的“领”字字符不够' )
			if( sticker.value[6].stickerCount < count.value + 1 )
				return Warn( '对不起！您的”先“字字符不够' )
		break
		
		case 4 :
			if( sticker.value[4].stickerCount < count.value + 1 )
				return Warn( '对不起！您的“遥”字字符不够' )
			if( sticker.value[5].stickerCount < count.value + 1 )
				return Warn( '对不起！您的“领”字字符不够' )
			if( sticker.value[6].stickerCount < count.value + 1 )
				return Warn( '对不起！您的”先“字字符不够' )
		break
	}
	count.value++
}

function scrollTo( el )
{
	let section = document.querySelector( el )
	window.$dev && console.log( section )

	window.scrollTo( {
		top : section.offsetTop,
		behavior : 'smooth'
	} )
}

function onClickRed() {
	store.commit("setPassRed", true);
}

function getRedTitle( val )
{
	return val.replace( /[^\d]/g, '' )
}

/**
 * 领取红包
 */
async function getRedPacket( item )
{
	if( item.isGet ) return Warn( '您已领取过此红包' )

	let res = await getTodayRecharge()
	// window.$dev && console.log( res, item )
	if( res.code == 0 )
	{
		// window.$dev && console.log( item, Number( res.data.amount ) )
		if( Number( item.needConsumeAmount ) <= Number( res.data.amount ) )
		{
			let $res = await openRedPacket( { id : item.id } )

			if( $res.code == 0 )
			{
				Success( '红包领取成功' )
				getActivityLists()
				// store.dispatch( 'getUserInfo' )
				store.dispatch("getUserInfo")
			}
			else
			{
				tipShow.value = true
			}
		}
		else
		{
			Warn( '对不起！请先充值后再领取' )
		}
	}
}

/// 提示内容
const tipInfo = ref([
	{
		checked: false,
		text: "我已满18岁且具备完全行为能力。充值即代表同意《用户协议》和《隐私协议》。",
	},
	{
		checked: false,
		text: "购买的虚拟物品一经消费不可退还，取回的虚拟游戏道具将在5min-12h内发货。",
	},
	{
		checked: false,
		text: "本人没有受任何他人诱导欺骗，是在个人经济承受范围内消费，且将为消费行为承担后果。",
	},
	{
		checked: false,
		text: "盲盒娱乐，请理性消费，网站内禁止转售饰品。",
	},
	{ checked: false, text: "账号为本人操作，非他人代为操作。" },
]);

/// 提示窗状态
const tipShow = ref(false);

function verify() {
	tipShow.value = false;
	store.commit("setRechargeView", true);
}

///	2023-9-30 feat
const hasLogin = computed( () => store.getters.hasLogin )

onMounted( () => {
	if( hasLogin.value )
	{
		init()
	}
} )

/**
 * 请求数据
 */
function init()
{
	getStickerList()
	getRewardLists()
	getExchangeRecord()
	getActivityLists()
}

/**
 * 点击红包显示弹窗
 */
function openRedPacketDialog()
{
	///	如果用户未登录直接弹窗登录
	if( !hasLogin.value )
		return store.commit( "setSignView", true )
	
	showRedPacketRule.value = true
}

function onClickGroup()
{
	///	如果用户未登录直接弹窗登录
	if( !hasLogin.value )
		return store.commit( "setSignView", true )

	if (navigator.userAgent.indexOf("UCBrowser") > -1) {
		alert("UC浏览器暂不支持跳转,请更换浏览器");
	} else {
		let item = store.state.otherConfig.qqGroup[0];
		let qqGroupLink = item || store.getters.getConfigItem("GroupChatUrl");
		window.open(qqGroupLink);
	}
}

/**
 * 监听用户登录成功的状态
 * 如果成功 调用数据
 */
watch( () => hasLogin.value, val => {
	if( val ) init()
} )

/**
 * 点击立即兑换
 */
function exchangeRedPacket()
{
	if( !hasLogin.value )
		return store.commit( 'setSignView', true )

	showExchange.value = true
}

/**
 * 联系客服
 */
function service()
{
	if( !hasLogin.value )
		return store.commit( 'setSignView', true )

	if (localStorage.getItem(tokenName)) 
	{
		let channelId = store.getters.getConfigItem("CustomerServiceUrl") || "A12fdC";

		if (!window._AIHECONG) {
			(function (d, w, c) {
				if (w[c]) return;
				var s = d.createElement("script");
				w[c] = function () {
					(w[c].z = w[c].z || []).push(arguments);
				};
				s.async = true;
				s.src = "https://static.ahc.ink/hecong.js";
				if (d.head) d.head.appendChild(s);
			})(document, window, "_AIHECONG");

			_AIHECONG("ini", {
				channelId: channelId,
				uniqueId: `199skins${store.state.userInfoBase.account}`,
				button: false,
			});
			_AIHECONG("customer", {
				名称: store.state.userInfoBase.nickName,
				手机: store.state.userInfoBase.mobile,
				终端: "MODILE",
				会员账号: store.state.userInfoBase.account,
			});
			_AIHECONG("showChat");
		} else {
			_AIHECONG("showChat");
		}
	} else {
		store.commit("setSignView", true);
	}
}
</script>
<template>
	<div class="pc-act-container">
		<div class="act-header">
			<img src="@/assets/pcimg/activity/10.1/header-bg.png">

			<div class="close" @click="router.push( '/' )">
				<img src="@/assets/pcimg/activity/10.1/close.png">
			</div>
		</div>
		<div class="act-body">
			<div class="top-btn-group">
				<div class="btn" @click="scrollTo( '.section-text-1-subtitle' )"><img src="@/assets/pcimg/activity/10.1/top-btn-1.png"></div>
				<div class="btn" @click="scrollTo( '#red-packet' )"><img src="@/assets/pcimg/activity/10.1/top-btn-2.png"></div>
				<div class="btn" @click="scrollTo( '#roll' )"><img src="@/assets/pcimg/activity/10.1/top-btn-3.png"></div>
				<div class="btn" @click="scrollTo( '#group' )"><img src="@/assets/pcimg/activity/10.1/top-btn-4.png"></div>
			</div>

			<div class="section-1">
				<div class="card-container">
					<img src="@/assets/pcimg/activity/10.1/section-1-text.png" class="pc-title">
					<div class="section-text-1-subtitle">
						<img @click="showRule = true" src="@/assets/pcimg/activity/10.1/section-1-text-subtitle.png" class="pc-rule">
					</div>
					
					<div class="card-items">

						<!-- feat:添加用户未登录时的占位图 -->
						<div class="card-item-nil" v-if="!hasLogin">
							<img src="@/assets/pcimg/activity/10.1/nil.png">
						</div>
						<!-- /feat -->

						<!-- feat:这里新增了template标签 -->
						<template v-else>
							<div class="items-title">
								<img src="@/assets/pcimg/activity/10.1/card-text-1.png">
								<img src="@/assets/pcimg/activity/10.1/card-subtext-1.png">
							</div>
							<div class="card-item">
								<div
									class="item"
									v-for="( item, index ) in stickerTop"
									:key="index"
								>
									<div class="word">
										<img :src="font[index]" v-if="item.stickerCount > 0">
										<img :src="fontNil[index]" v-else>
									</div>
									<div class="total">
										已收集：{{ item.stickerCount }}
									</div>
								</div>
							</div>

							<div class="items-title margin-top">
								<img src="@/assets/pcimg/activity/10.1/card-text-2.png">
								<img src="@/assets/pcimg/activity/10.1/card-subtext-2.png">
							</div>
							<div class="card-item">
								<div
									class="item"
									v-for="( item, index ) in stickerBottom"
									:key="index"
								>
									<div class="word">
										<img :src="font[index + 4]" v-if="item.stickerCount > 0 || index == 1">
										<img :src="fontNil[index + 4]" v-else>
									</div>
									<div class="total" v-if="index != 1">
										已收集：{{ item.stickerCount }}
									</div>
								</div>
							</div>

							<div class="card-help">
								<img src="@/assets/pcimg/activity/10.1/card-text-3.png">
							</div>
						</template>
						<!-- /feat -->
					</div>

					<div class="card-btn-group">
						<div @click="showRule = true"></div>
						<div @click="exchangeRedPacket"></div>
					</div>
				</div>
			</div>

			<div class="section-2">
				<div class="act-list-container">
					<img src="@/assets/pcimg/activity/10.1/section-2-text.png">
					<div class="section-text-2-subtitle">
						<img src="@/assets/pcimg/activity/10.1/section-2-text-subtitle.png">
					</div>

					<div class="card-items">
						<!-- feat:添加弹窗判断是否登录 -->
						<div class="card-item" id="red-packet" @click="openRedPacketDialog">
						<!-- /feat -->
							<div class="icon">
								<img src="@/assets/pcimg/activity/10.1/act-title-1.png">
								<img src="@/assets/pcimg/activity/10.1/act-icon-1.png">
							</div>
							<div class="content">
								<div class="header">
									<img src="@/assets/pcimg/activity/10.1/act-subtitle-1.png">
									<!-- <div class="show-rule" @click="showRedPacketRule = true" > -->
										<!-- <img src="@/assets/pcimg/activity/10.1/act-red-rule.png"> -->
									<!-- </div> -->
									<!-- <img @click="onClickRed" src="@/assets/pcimg/activity/10.1/act-btn-1.png"> -->
									<img src="@/assets/pcimg/activity/10.1/act-btn-1.png">
								</div>
								<img src="@/assets/pcimg/activity/10.1/act-text-1.png">
							</div>
						</div>
						<div class="card-item" id="roll" @click="onclickSignRoll">
							<div class="icon">
								<img src="@/assets/pcimg/activity/10.1/act-title-2.png">
								<img src="@/assets/pcimg/activity/10.1/act-icon-2.png" class="icon2">
							</div>
							<div class="content">
								<div class="header">
									<img src="@/assets/pcimg/activity/10.1/act-subtitle-2.png">
									<img src="@/assets/pcimg/activity/10.1/act-btn-2.png" class="btn2">
								</div>
								<img src="@/assets/pcimg/activity/10.1/act-text-2.png">
							</div>
						</div>
						<div class="card-item" id="group" @click="onClickGroup">
							<div class="icon">
								<img src="@/assets/pcimg/activity/10.1/act-title-3.png">
								<img src="@/assets/pcimg/activity/10.1/act-icon-3.png">
							</div>
							<div class="content">
								<div class="header">
									<img src="@/assets/pcimg/activity/10.1/act-subtitle-3.png">
									<img src="@/assets/pcimg/activity/10.1/act-btn-3.png">
								</div>
								<img src="@/assets/pcimg/activity/10.1/act-text-3.png">
							</div>
						</div>
					</div>

					<div class="more">
						<img src="@/assets/pcimg/activity/10.1/more.png">
					</div>
				</div>
			</div>
			<div class="act-footer">
				<div>
					<img src="@/assets/pcimg/activity/10.1/beian.png">
					琼公网安备46020302000293号
				</div>
				<div>琼ICP备 2023003937号-3</div>
				<div>版权所属：海南群友科技有限公司</div>
			</div>
		</div>

		<van-overlay :show="showRule" style="background: rgba( 0, 0, 0, .7 )" z-index="200">
			<div class="rule-container">
				<div class="close-btn" @click="showRule = false">
					<img src="@/assets/pcimg/activity/10.1/close-btn.png">
				</div>
				<div class="service" @click="service"></div>
			</div>
		</van-overlay>

		<van-overlay :show="showRedPacketRule" style="background: rgba( 0, 0 ,0, .7 )" z-index="200">
			<div class="red-packet-rule-container">
				<div class="close-btn" @click="showRedPacketRule = false">
					<img src="@/assets/pcimg/activity/10.1/close-btn.png">
				</div>

				<div class="red-packet-table">
					<div class="table">
						<div class="th head">当日累计充值</div>
						<div class="td">对应领取红包</div>
					</div>
					<div class="table"
						v-for="( item, index ) in redPackets" :key="index"
					>
						<div class="th">{{ getRedTitle( item.title ) }}</div>
						<div class="td">
							<div class="val">{{ reward[index] }}</div>
							<div class="btn" :class="{ disabled : item.isGet }" @click="getRedPacket( item )"></div>
						</div>
					</div>
				</div>
			</div>
		</van-overlay>

		<van-overlay :show="showExchange" style="background: rgba( 0, 0, 0, .7 )" z-index="200">
			<div class="exchange-container">
				<div class="close-btn" @click="closeExchange">
					<img src="@/assets/pcimg/activity/10.1/close-btn.png">
				</div>

				<div class="header">
					<div class="left">
						<img src="@/assets/pcimg/activity/10.1/exchange-tip.png">
					</div>
					<div class="right">
						<div
							v-for="( item, index ) in sticker"
							:key="index"
						>
							<img :src="tip[index]">
							<div class="count" v-if="item.stickerCount > 0">{{ item.stickerCount }}</div>
						</div>
					</div>
				</div>

				<div class="body" v-if="step == 1">
					<div class="body-title">
						请选择您要兑换的奖励：
						<div class="record" @click="step = 3">兑换记录</div>
					</div>
					<div class="items">
						<div
							class="item"
							v-for="( item, index ) in rewardList"
							:key="index"
							@click="selectReward( item, index + 1 )"
						>
							<img src="@/assets/pcimg/activity/10.1/19.9.png" v-if="index + 1 == 1">
							<img src="@/assets/pcimg/activity/10.1/199.png" v-if="index + 1 == 2">
							<img src="@/assets/pcimg/activity/10.1/1999.png" v-if="index + 1 == 3">
							<img src="@/assets/pcimg/activity/10.1/mate60.png" v-if="index + 1 == 4">

							<img
								class="selected" 
								src="@/assets/pcimg/activity/10.1/mark.png" 
								v-if="rewardId == index + 1"
							>
						</div>
					</div>
				</div>

				<div class="body row" v-if="step == 2">
					<div class="reward-icon">
						<img src="@/assets/pcimg/activity/10.1/19.9.png" v-if="rewardId == 1">
						<img src="@/assets/pcimg/activity/10.1/199.png" v-if="rewardId == 2">
						<img src="@/assets/pcimg/activity/10.1/1999.png" v-if="rewardId == 3">
						<img src="@/assets/pcimg/activity/10.1/mate60.png" v-if="rewardId == 4">
					</div>

					<div class="form">
						<div class="re-title">{{ curReward.rewardName }}</div>
						<div class="input">
							<div>兑换数量：</div>
							<div class="input-number">
								<button @click="reduce">-</button>
								<input readonly v-model="count">
								<button @click="add">+</button>
							</div>
						</div>
						<div class="desc">
							<div v-if="rewardId == 1">本次兑换将消耗"国"、"庆"字符各1个</div>
							<div v-if="rewardId == 2">本次兑换将消耗"举"、"国"、"欢"、"庆"字符各1个</div>
							<div v-if="rewardId == 3">本次兑换将消耗"领"、"先"字符各1个</div>
						</div>
					</div>
				</div>

				<div class="body column" v-if="step == 3">
					<div class="table-header">
						<div class="date">兑换日期</div>
						<div class="reward">兑换奖品</div>
						<div class="spend">消耗字符卡</div>
					</div>
					<div class="table-body">
						<div class="table-item" v-for="( item, index ) in exchangeRecord" :key="index">
							<div class="date">{{ item.createTime }}</div>
							<div class="reward">{{ item.rewardName }}</div>
							<div class="spend">
								<div
									class="spend-list"
									v-for="( card, i ) in item.consumeStickerItems"
									:key="i"
								>
									<img :src="card.iconUrl"> ✖️ {{ card.stickerCount }}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="footer">
					<div class="next-btn" @click="next" v-if="step == 1">
						<img src="@/assets/pcimg/activity/10.1/next-btn.png">
					</div>
					<div class="next-btn" @click="exchange" v-if="step == 2">
						<img src="@/assets/pcimg/activity/10.1/exchange-btn.png">
					</div>
					<div class="next-btn" @click="step = 1" v-if="step == 3">
						<img src="@/assets/pcimg/activity/10.1/back-btn.png">
					</div>
				</div>
			</div>
		</van-overlay>

		<van-overlay
			:show="tipShow"
			style="background-color: rgba(0, 0, 0, 0.7)"
			:z-index="200"
			:lock-scroll="false"
		>
			<div class="recharge-tip-container">
				<div class="header">
					<p>请阅读以下协议，点击同意即可前往充值</p>
					<div class="closeBtn" @click="tipShow = false">
						<img src="@/assets/pcimg/recharge/close-tip.png" alt="" />
					</div>
				</div>
				<div class="body">
					<div
						class="tip-content"
						v-for="(item, index) in tipInfo"
						:key="index"
						@click="select(item)"
					>
						<!-- <img v-if="item.checked" src="@/assets/pcimg/recharge/selected.png" alt="">
						<img v-else src="@/assets/pcimg/recharge/select.png" alt=""> -->
						<div style="font-weight: 700">{{ index + 1 }}、</div>
						<p>{{ item.text }}</p>
					</div>
				</div>
				<div class="footer">
					<button @click="verify()">我已阅读并同意以上协议</button>
				</div>
			</div>
		</van-overlay>
	</div>
</template>
<style lang="scss" scoped>
.pc-act-container
{
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
	height: calc( 100% - 233px );
	background: #2e0d14;

	.recharge-tip-container {
		position: fixed;
		// top: 396px;
		left: calc(50% - 590px / 2);
		display: flex;
		flex-direction: column;
		background: #16182e;
		width: 590px;
		height: 551px;
		top: calc(50% - 551px / 2);

		.header {
			display: flex;
			background: #1c1f39;
			height: 100px;
			color: #CCCBDE;;
			align-items: center;
			// justify-content: center;
			padding-left: 58px;
			font-size: 20px;
			position: relative;
			font-weight: 700;

			.closeBtn {
				position: absolute;
				top: 16px;
				right: 16px;
			}
		}

		.body {
			display: flex;
			padding: 28px 57.5px 28px 58px;
			flex-direction: column;

			.tip-content {
				display: flex;
				// gap: 21px;
				align-items: flex-start;
				color: #aaacc1;
				font-size: 16px;
				font-weight: 300;
				line-height: 1.5;
				padding: 10px 0;
				// cursor: pointer;

				// &:hover {
				//	 color: #fff;
				// }
			}
		}

		.footer {
			display: flex;
			width: 100%;
			padding-bottom: 42px;
			justify-content: center;

			button {
				width: 208px;
				height: 58px;
				color: #fff;
				background: #3a34b0;
				border: none;
				border-radius: 6px;
				font-size: 16px;

				&:hover
				{
					background: #5A54CE;;
				}
			}
		}
	}

	.exchange-container
	{
		background: url( @/assets/pcimg/activity/10.1/exchange-bg.png ) no-repeat;
		position: fixed;
		width: 1042px;
		height: 697px;
		top: calc( 50% - 697px / 2 );
		left: calc( 50% - 1042px / 2 );
		padding: 42px 43px;
		box-sizing: border-box;

		.footer
		{
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			// border: 1px solid red;
			padding: 33px 0;
		}

		.body
		{
			width: 954px;
			height: 320px;
			box-sizing: border-box;
			// border: 1px solid red;
			margin-top: 24px;
			padding: 28px 30px;

			&.column
			{
				flex-direction: column;
				// border: 1px solid red;
				color: #910c22;
				padding: 28px 48px;

				.table-header
				{
					display: flex;
					width: 100%;
					font-size: 18px;
					border-bottom: 1px solid #e6aa44;
					padding-bottom: 12px;

					.date
					{
						width: 200px;
					}

					.reward
					{
						width: 300px;
						display: flex;
						align-content: center;
					}
				}

				.table-body
				{
					display: flex;
					flex-direction: column;
					font-size: 16px;
					font-weight: 400;
					// border: 1px solid red;
					height: 220px;
					overflow: hidden;
					overflow-y: scroll;
					// flex: 1;

					.table-item
					{
						width: 100%;
						display: flex;
						height: 64px;
						border-bottom: 1px solid #e6aa44;
						align-items: center;
						flex: 1 0 auto;

						.date
						{
							width: 200px;
						}

						.reward
						{
							width: 300px;
							display: flex;
							align-content: center;
						}

						.spend
						{
							display: flex;
							.spend-list
							{
								display: flex;

								img
								{
									width: 36px;
								}
							}
						}
					}
				}
			}

			&.row
			{
				display: flex;
				padding: 55px 160px 65px 160px;
				gap: 24px;

				.form
				{
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					justify-content: center;
					gap: 12px;
					font-weight: 300;

					.input
					{
						display: flex;
						align-items: center;
						color: #910C22;
						font-size: 16px;

						.input-number
						{
							display: flex;
							border: 2px solid #78081D;
							background: #FADB99;
							border-radius: 38px;
							width: 120px;
							height: 38px;
							justify-content: center;
							align-items: center;
							box-sizing: border-box;

							button
							{
								background: transparent;
								border: none;
								outline: none;
								height: 100%;
								width: 36px;
								// border: 1px solid red;
							}

							input
							{
								background: transparent;
								border: none;
								outline: none;
								text-align: center;
								height: 100%;
								border-right: 2px solid #78081D;
								border-left: 2px solid #78081D;;
								width: calc( 120px - 36px * 2 );
							}
						}
					}

					.re-title
					{
						font-size: 24px;
						color: #910C22;
						margin-bottom: 14px;
						font-weight: 700;
					}

					.desc
					{
						color: #910C22;
						font-size: 16px;
					}
				}
			}

			.items
			{
				display: flex;
				// border: 1px solid red;
				justify-content: center;
				padding: 18px 0;
				gap: 40px;
				width: calc( 190px * 4 + 40px * 3 );

				.item
				{
					// border: 1px solid red;
					width: 188px;
					height: 220px;
					flex: 0 0 0;
					display: flex;
					align-items: center;
					justify-content: center;

					.selected
					{
						position: absolute;
					}
				}
			}

			.body-title
			{
				color: #910C22;
				position: relative;
				width: 100%;
				display: flex;
				justify-content: center;
				font-size: 18px;

				.record
				{
					position: absolute;
					top: 0;
					right: 0;
					text-decoration: underline;
					user-select: none;
					cursor: default;
				}
			}
		}

		.close-btn
		{
			position: absolute;
			top: 16px;
			right: -20px;
		}

		.header
		{
			width: 100%;
			display: flex;
			justify-content: space-between;
			padding: 74px 0 0 0;
			align-items: center;

			.right
			{
				display: flex;
				gap: 12px;

				div
				{
					width: 55px;
					height: 62px;
					// border: 1px solid red;
					position: relative;

					.count
					{
						position: absolute;
						width: 26px;
						color: #fff;
						height: 26px;
						background: #D91E46;
						border-radius: 50%;
						display: flex;
						justify-content: center;
						align-items: center;
						top: -13px;
						right: -10px;
					}
				}

			}
		}
	}

	.red-packet-rule-container
	{
		background: url( @/assets/pcimg/activity/10.1/red-packet-rule.png ) no-repeat;
		width: 1042px;
		height: 502px;
		position: fixed;
		top: calc( 50% - 502px / 2 );
		left: calc( 50% - 1042px / 2 );
		padding: 36px;
		box-sizing: border-box;

		.close-btn
		{
			position: absolute;
			top: 18px;
			right: -20px;
		}

		.red-packet-table
		{
			display: flex;
			// border: 1px solid red;
			// padding-top: 100px;
			margin-top: 160px;

			.table
			{
				border: 1px solid #efc16b;
				height: 240px;
				flex: 1;

				.th
				{
					background: #f4c779;
					color: #910C22;
					font-size: 18px;
					display: flex;
					justify-content: center;
					align-items: center;
					height: 100px;
					padding: 0 20px;

					&.head
					{
						width: 110px;
					}
				}

				.td
				{
					background: #f9ce87;
					display: flex;
					justify-content: center;
					align-items: center;
					color: #910C22;
					font-size: 18px;
					height: 140px;
					flex-direction: column;
					gap: 8px;
					// min-width: ;

					.btn
					{
						background: url( @/assets/pcimg/activity/10.1/able.png ) no-repeat;
						width: 72px;
						height: 34px;

						&.disabled
						{
							background: url( @/assets/pcimg/activity/10.1/dis.png ) no-repeat !important;
						}

						&:hover
						{
							background: url( @/assets/pcimg/activity/10.1/hover.png ) no-repeat;
						}
					}
				}
			}
		}
	}

	.rule-container
	{
		background: url( @/assets/pcimg/activity/10.1/rule-1.png ) no-repeat;
		width: 1062px;
		height: 705px;
		position: fixed;
		top: calc( 50% - 705px / 2 );
		left: calc( 50% - 1062px / 2 );

		.close-btn
		{
			position: absolute;
			top: 25px;
			right: 0px;
		}

		.service
		{
			// border: 1px solid red;
			width: 110px;
			height: 24px;
			bottom: 112px;
			position: absolute;
			left: 418px;
			background: #fff;
			opacity: 0;
		}
	}

	.act-header
	{
		z-index: 10;
		position: relative;
		.close
		{
			position: absolute;
			top: 0;
			right: 274px;
		}
	}

	.act-body
	{
		// border: 1px solid red;
		height: calc( 100% - 233px );
		padding: 310px 0 0 0;
		width: 1920px;
		background: url( @/assets/pcimg/activity/10.1/bgimg.png ) no-repeat;
		margin-top: -234px;

		.act-footer
		{
			width: 1920px;
			height: 195px;
			// border: 1px solid red;
			background-color: rgba( 0, 0, 0, .25 );
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 4px;

			div
			{
				display: flex;
				justify-content: center;
				align-items: center;
				color: #555;
				font-size: 16px;
				gap: 8px;
			}
		}

		.top-btn-group
		{
			display: flex;
			// border: 1px solid red;
			// width: ;
			gap: 40px;
			justify-content: center;

			.btn
			{
				height: 293px;
				height: 96px;

				img
				{
					width: 100%;
					height: 100%;
				}
			}
		}

		.section-2
		{
			width: 100%;
			display: flex;
			flex-direction: column;
			// height: 100px;
			// border: 1px solid red;
			// justify-content: center;
			align-items: center;
			padding: 80px 0 0 0;

			.act-list-container
			{
				width: 1009px;
				// border: 1px solid red;
				display: flex;
				flex-direction: column;
				align-items: center;

				.section-text-2-subtitle
				{
					margin-top: 120px;
				}

				.card-items
				{
					display: flex;
					// border: 1px solid red;
					flex-direction: column;
					margin-top: 50px;
					gap: 48px;

					.card-item
					{
						width: 1009px;
						height: 284px;
						background: url( @/assets/pcimg/activity/10.1/act-card-bg.png ) no-repeat;
						display: flex;
						padding: 42px 56px 24px 42px;
						box-sizing: border-box;
						justify-content: space-between;

						.icon
						{
							display: flex;
							flex-direction: column;
							width: 244px;
							position: relative;
							justify-content: flex-end;
							align-items: center;

							.icon2
							{
								// width: 241px;
								height: 180px;
								width: 185px;
								margin-bottom: 16px;
							}

							img
							{
								&:first-child
								{
									position: absolute;
									top: -26px;
									left: 30px;
								}
							}
						}

						.content
						{
							display: flex;
							flex-direction: column;
							width: 622px;
							height: 100%;
							justify-content: center;
							gap: 18px;
							padding-bottom: 12px;
							box-sizing: border-box;

							.header
							{
								display: flex;
								justify-content: space-between;
								height: 73px;
								align-items: center;

								.show-rule
								{
									margin-left: -30px;
								}

								.btn2
								{
									margin-top: -64px;
								}

								img
								{
									&:first-child
									{
										width: 180px;
										height: 34px;
									}
								}
							}
						}
					}
				}

				.more
				{
					width: 100%;
					// margin-top: 100px;
					padding: 80px 0 40px 0;
					display: flex;
					justify-content: center;
				}
			}
		}

		.section-1
		{
			display: flex;
			// justify-content: center;
			padding-top: 70px;
			// border: 1px solid red;
			flex-direction: column;
			width: 100%;
			height: 1091px;
			align-items: center;

			.card-container
			{
				width: 1053px;
				display: flex;
				flex-direction: column;
				align-items: center;
				flex-grow: 0;
				box-sizing: border-box;
				// justify-content: center;
				// border: 1px solid red;

				height: 1091px;			///	feat:设置容器高

				// .pc-rule
				// {
				// }

				.section-text-1-subtitle
				{
					margin-top: 100px;
					margin-bottom: 24px;
					width: 100%;
					// border: 1px solid red;
					display: flex;
					justify-content: flex-end;
					padding-right: 31px;
					box-sizing: border-box;
				}
			}

			.card-items
			{
				height: 726px;
				width: 100%;
				// border: 1px solid red;
				padding: 48px 61px;
				box-sizing: border-box;
				background: url( @/assets/pcimg/activity/10.1/card-bg.png ) no-repeat;
				background-position: top center;
				background-size: cover;
				display: flex;
				flex-direction: column;
				align-items: flex-start;

				///	feat:新增样式
				position: relative;
				.card-item-nil
				{
					// border: 1px solid blue;
					position: absolute;
					left: 0;
					top: 0;
				}
				/// feat:end

				.items-title
				{
					margin-bottom: 16px;

					img
					{
						&:first-child
						{
							margin-bottom: 12px;
						}
					}

					&.margin-top
					{
						margin-top: 48px;
					}
				}

				.card-item
				{
					display: flex;
					justify-content: space-between;
					width: 100%;

					.item
					{
						height: 188px;
						width: 211px;
						// border: 1px solid red;
						background: url( @/assets/pcimg/activity/10.1/card-item-bg.png ) no-repeat;
						display: flex;
						flex-direction: column;

						.word
						{
							width: 100%;
							height: 148px;
							// border: 1px solid red;
							box-sizing: border-box;
							display: flex;
							justify-content: center;
							align-items: center;
						}

						.total
						{
							width: 100%;
							height: 40px;
							// border: 1px solid red;
							justify-content: center;
							align-items: center;
							display: flex;
							color: #FBE28D;
							font-size: 16px;
						}
					}
				}

				.card-help
				{
					display: flex;
					justify-content: center;
					width: 100%;
					padding: 24px 0 0 0;
				}
			}

			.card-btn-group
			{
				display: flex;
				// border: 1px solid red;
				width: 100%;
				height: 68px;
				justify-content: space-between;
				margin-top: 60px;

				div
				{
					width: 497px;
					height: 68px;

					&:first-child
					{
						background: url( @/assets/pcimg/activity/10.1/rule-btn.png ) no-repeat;
					}

					&:last-child
					{
						background: url( @/assets/pcimg/activity/10.1/change-btn.png ) no-repeat;
					}
				}
			}
		}
	}
}
</style>