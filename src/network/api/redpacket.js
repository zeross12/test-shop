import axios from '../axios'

//获取列表
export function getActivityList(data) {
	return axios({
		url: '/api/redPacket/getActivityList',
		method: 'post',
		data
	})
}

//获取列表
export function getRecords(data) {
	return axios({
		url: '/api/redPacket/getRecords',
		method: 'post',
		data
	})
}

//领取红包
export function openRedPacket(data) {
	return axios({
		url: '/api/user/openRedPacket',
		method: 'post',
		data
	})
}