import axios from '../axios'

// 试玩登录
export function demoLogin(data) {
	return axios({
		url: '/api/auth/demoLogin',
		method: 'post',
		data
	})
}

// 获取验证码
export function getPicVerifyCode() {
	return axios({
		url: '/api/auth/getGraphicCode',
		method: 'post',		
	})
}

// 获取验证码
export function getVerifyCode(data) {
	return axios({
		url: '/api/auth/getVerifyCode',
		method: 'post',
		data
	})
}

// 登录
export function login(data) {
	return axios({
		url: '/api/auth/login',
		method: 'post',
		channel:true,
		data
	})
}

// 登出
export function logout() {
	return axios({
		url: '/api/auth/logout',
		method: 'post',
	})
}


// 注册
export function register(data) {
	return axios({
		url: '/api/auth/register',
		method: 'post',
		channel:true,
		data
	})
}

// 验证token
export function verifyToken() {
	return axios({
		url: '/api/auth/verifyToken',
		method: 'post',
	})
}

// 找回密码
export function forgotPassword(data) {
	return axios({
		url: '/api/auth/forgotPassword',
		method: 'post',
		data
	})
}

// 绑定手机号码
export function bindMobile(data) {
	return axios({
		url: '/api/auth/bindMobile',
		method: 'post',
		data
	})
}
