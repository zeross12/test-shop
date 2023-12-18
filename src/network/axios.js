import originAxios from 'axios'
import { url, tokenName } from '../config'
import i18n from '@/lang/index.js'
import store from "../store";
import router from '../router'
import { _isMobile } from '@/util/common';

export const t = i18n.global.t

//200 suc 401重新登录 其他code fail msg
export default function axios(option) {
	return new Promise((resolve, reject) => {
		const instance = originAxios.create({
			baseURL: url,
			timeout: 10000
		});
		//token
		instance.interceptors.request.use(config => {
			config.headers.Authorization = localStorage.getItem(tokenName)
			if (option.channel) {
				config.headers["x-channel-code"] = localStorage.getItem('channelCode')
			}
			return config
		}, err => {
			return err
		})
		// 接口错误拦截
		instance.interceptors.response.use(
			response => {
				// window.$dev && console.log(response.data)
				if (response.status === 200) {
					if (response.data.code == 0) {
						return Promise.resolve(response.data)
					} else {
						if( _isMobile() )
							NotifyF(response.data.message);
						else
							Warn( response.data.message )

						return Promise.resolve(response.data)
					}
				} else if (response.status === 401) {
					//token 失效
					if( _isMobile() )
						NotifyF( t( 'network.unauthorized' ) )
					else
						Warn(  t( 'network.unauthorized' )  )

					localStorage.removeItem(tokenName);
					router.replace('/');
					store.commit('setSignView', true);
					return Promise.resolve(response.data);
				} else {
					if( _isMobile() )
						NotifyF(response.data.message);
					else
						Warn( response.data.message )

					return Promise.resolve(response.data);
				}
			},
			error => {
				window.$dev && console.log('error', error)
				if (error && error.response) {

					if (error.response.status === 401) {
						//token 失效 
						if( _isMobile() )
							NotifyF( t( 'network.unauthorized' ) )
						else
							Warn(  t( 'network.unauthorized' )  )

						localStorage.removeItem(tokenName);
						router.replace('/');
						store.commit('setSignView', true);
						return Promise.resolve(error.response.data);
					}

					// if( error.response.status === 400 )
					// {
					// 	if( error.response.data.code == 20001 ) return
					// }

					if (error.response.data && error.response.data.message) {
						if( _isMobile() )
							NotifyF(error.response.data.message);
						else
							Warn( error.response.data.message )
					} else {
						if( _isMobile() )
							NotifyF( t( 'network.error' ) )
						else
							Warn(  t( 'network.error' )  )
					}
					let res = {};
					res.code = 100;
					res.message = error.response.data.message
					return Promise.resolve(res);
				} else {
					if(error&&error.code=="ECONNABORTED"){
						if( _isMobile() )
							NotifyF( t( 'network.overtime' ) )
						else
							Warn(  t( 'network.overtime' )  )
					}else{
						if( _isMobile() )
							NotifyF( t( 'network.error' ) )
						else
							Warn(  t( 'network.error' )  )
					}
					
				}
				return Promise.resolve({ code: 500 })
			}
		)

		//传入对象进行网络请求
		instance(option).then(res => {
			resolve(res)
		}).catch(err => {
			reject(err)
		})
	})
}