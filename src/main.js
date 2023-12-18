import { createApp } from 'vue'
import store from "./store"
import router from './router'
import { _isMobile, _canScroll, _stopScroll, Success, Warn } from './util/common'
import vant, { Notify } from 'vant';
import { Lazyload } from 'vant';
import countTo from 'vue3-count-to';
import { getChannel } from '@/network/api/index';
import UUID from "vue3-uuid";
// import { createI18n } from 'vue-i18n'
import i18n from '@/lang/index.js'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import 'vant/lib/index.css'
import 'swiper/css'
import './assets/main.css'
import './assets/iconfont/iconfont.css?v=2.28'
import './assets/quill.snow.css'
import 'element-plus/dist/index.css'

//px转rem
import 'lib-flexible'
import vhCheck from 'vh-check'
import Socket from '@/util/socket'
import App from './App.vue'

import { defaultChannelCode, defaultPlatformId ,siteUrl, wsurl} from './config';
window.ws = new Socket( wsurl, store )
window._hmt = window._hmt || [];
window.Success = Success
window.Warn = Warn
window.$dev = import.meta.env.MODE === 'development' || import.meta.env.MODE === 'staging'

///	设置网站标题
function setPageTitle( meta )
{
	if( typeof meta !== 'undefined' && typeof meta.name !== 'undefined' && meta.name !== '' )
		window.document.title = `${i18n.global.t( 'common.siteTitle' )} - ${i18n.global.t( `router.${meta.name}` )}`
	else
		window.document.title = i18n.global.t( 'common.siteTitle' )
}

async function initPlatform() {
	const res = await getChannel({ siteUrl: siteUrl});
	let platformId = defaultPlatformId;
	let channelCode = defaultChannelCode;
	if (res.code === 0) {
		platformId = res.data.platformId;
		channelCode = res.data.channelCode;
		let keyword=res.data.keyWord;
		(function () {
			var hm = document.createElement('script')
			hm.src = `https://hm.baidu.com/hm.js?${keyword}`
			var s = document.getElementsByTagName('script')[0]
			s.parentNode.insertBefore(hm, s)
		})()

		Window.channelInfo=res.data;
	}
	localStorage.setItem('platformId', platformId);
	localStorage.setItem('channelCode', channelCode);
	initApp(platformId);
}

router.afterEach( ( to, form ) => {
	setPageTitle( to.meta )
} )

function initApp(platformId) {
	const app = createApp(App)

	app.use(store).use(router).use(vant)

	for( const [key, component] of Object.entries( ElementPlusIconsVue ))
	{
		app.component( key, component )
	}
	// Notify.setDefaultOptions({
	//	 position:"bottom",
	// });

	app.use(Lazyload, {
		lazyComponent: true,
	})

	app.use(countTo)
	app.use(UUID)

	//i18n
	// const i18n = createI18n({
	//	 // something vue-i18n options here ...
	// })
	app.use(i18n);

	store.commit("setPlatformId", platformId)

	app.config.globalProperties._isMobile = _isMobile
	app.config.globalProperties._canScroll = _canScroll
	app.config.globalProperties._stopScroll = _stopScroll
	app.config.globalProperties.$t = i18n.global.t

	app.config.errorHandler = (err, instance, info) => {
		// 向追踪服务报告错误
		window.$dev && console.log(err)
		window.$dev && console.log('info:', info)
	}
	
	setPageTitle()
	app.mount( '#app' )
}

initPlatform()
vhCheck()