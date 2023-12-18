import axios from '../axios'

//获取充值列表
export function getRechargeList() {
	return axios({
		url: '/api/recharge/getList',
		method: 'post',
	})
}

//用户支付
export function userPay(data) {
	return axios({
		url: '/api/recharge/pay',
		method: 'post',
		data
	})
}

//获取用户统计列表
export function getStatsList(data) {
	return axios({
		url: '/api/recharge/getStatsList',
		method: 'post',
		data
	})
}

//获取用户当日佣金列表
export function getTodayCommList(data) {
	return axios({
		url: '/api/spread/getTodayCommList',
		method: 'post',
		data
	})
}

//获取用户推广详情
export function getSpreadDetails(data) {
	return axios({
		url: '/api/spread/details',
		method: 'post',
		data
	})
}

/// 卡密支付
export function payCard( data )
{
	return axios( {
		url : '/api/recharge/payCard',
		method : 'post',
		data
	} )
}