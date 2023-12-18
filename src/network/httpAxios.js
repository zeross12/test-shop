import originAxios from 'axios'

export default function httpAxios(reqUrl, header, option) {
	return new Promise((resolve, reject) => {
		const instance = originAxios.create({
			baseURL: reqUrl,
			timeout: 10000
		});
		instance.interceptors.request.use(config => {
			if (header && header.Authorization) {
				config.headers.Authorization = header.Authorization;
			}
			return config
		}, err => {
			return err
		})
		instance.interceptors.response.use(
			response => {
				if (response.status === 200) {
					return Promise.resolve(response.data);
				} else {
					window.$dev && console.log('response error', response)
					return Promise.reject(response.data);
				}
			},
			error => {
				window.$dev && console.log('error', error.response)
				return Promise.reject(error.response);
			}
		)
		instance(option).then(res => {
			resolve(res)
		}).catch(err => {
			reject(err)
		})
	})
}