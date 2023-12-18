import axios from '../axios'

export function getConsumeReward(data) {
	return axios({
		url: '/api/activity/getConsumeReward',
		method: 'post',
		data
	})
}

export function getFestivalResult(data) {
	return axios({
		url: '/api/activity/getFestivalResult',
		method: 'post',
		data
	})
}

export function getTodayConsume(data) {
	return axios({
		url: '/api/activity/getTodayConsume',
		method: 'post',
		data
	})
}

export function joinFestival(data) {
	return axios({
		url: '/api/activity/joinFestival',
		method: 'post',
		data
	})
}

/// 获取印花奖品列表
export function getRewardList( data )
{
	return axios({
		url : '/api/sticker/getRewardList',
		method : 'post',
		data
	})
}

/// 兑换奖品
export function exchangeReward( data )
{
	return axios( {
		url : '/api/user/stickerReward',
		method : 'post',
		data
	} )
}

/// 获取今日充值金额
export function getTodayRecharge( data )
{
	return axios({
		url : '/api/activity/getTodayRecharge',
		method : 'post',
		data
	})
}