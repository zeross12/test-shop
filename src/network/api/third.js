import httpAxios from '../httpAxios'

//获取列表
export function checkIDCard(reqUrl,header,data) {
	return httpAxios(reqUrl,header,{
		url: '/eid/check?idcard='+data.idcard+'&name='+data.name,
		method: 'post',
	})
}


//获取列表
export function getGoodsBgImages(header) {
	let reqUrl="http://47.98.133.119:21080"
	return httpAxios(reqUrl,header,{
		url: '/api/index/getGoodsBgImages',
		method: 'post',
	})
}