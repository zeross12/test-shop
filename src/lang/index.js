import { createI18n } from 'vue-i18n'
import zh_CN from './locales/zh_CN'
import en_US from './locales/en_US'
import ko_KR from './locales/ko_KR'
import vi_VN from './locales/vi_VN'

const i18n = createI18n({
	legacy: false,
	globalInjection: true,
	locale: 'vi',//localStorage.getItem( 'lang' ) || navigator.language,
	fallbackLocale: 'vi',//localStorage.getItem( 'lang' ) || navigator.language,
	messages: {
		'zh': zh_CN,
		'en': en_US,
		'vi': vi_VN,
		'ko': ko_KR
	}
})

export default i18n