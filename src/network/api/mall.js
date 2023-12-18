import axios from '../axios'

//获取列表
export function getMallList(data) {
	return axios({
		url: '/api/mall/getList',
		method: 'post',
		data
	})
}