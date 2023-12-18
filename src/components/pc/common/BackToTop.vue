<template>
	<transition name="pc-back-to-top-fade">
		<div class="pc-back-to-top" :style="`bottom:${this.bottom};right:${this.right};`" v-show="visible"
			@click="backToTop">
			<slot>
				<div class="default">
					<span>
						{{ text }}
					</span>
				</div>
			</slot>
		</div>
	</transition>
</template>

<script>
export default {
	name: 'BackToTop',
	props: {
		text: {
			type: String,
			default: 'Voltar ao topo',
		},
		visibleoffset: {
			type: [String, Number],
			default: 600,
		},
		visibleoffsetbottom: {
			type: [String, Number],
			default: 0,
		},
		right: {
			type: String,
			default: '150px',
		},
		bottom: {
			type: String,
			default: '40px',
		},
		scrollFn: {
			type: Function,
			default: function (eventObject) { },
		}
	},
	data() {
		return {
			visible: false
		}
	},
	mounted() {
		window.smoothscroll = () => {
			let currentScroll = document.documentElement.scrollTop || document.body.scrollTop
			if (currentScroll > 0) {
				window.requestAnimationFrame(window.smoothscroll)
				window.scrollTo(0, Math.floor(currentScroll - (currentScroll / 5)))
			}
		}
		window.addEventListener('scroll', this.catchScroll)
	},
	destroyed() {
		window.removeEventListener('scroll', this.catchScroll)
	},
	methods: {
		/**
		 * Catch window scroll event 
		 * @return {void}
		 */
		catchScroll() {
			const pastTopOffset = window.pageYOffset > parseInt(this.visibleoffset)
			const pastBottomOffset = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - parseInt(this.visibleoffsetbottom)
			this.visible = parseInt(this.visibleoffsetbottom) > 0 ? pastTopOffset && !pastBottomOffset : pastTopOffset
			this.scrollFn(this)
		},
		/**
		 * The function who make the magics
		 * @return {void}
		 */
		backToTop() {
			window.smoothscroll()
			this.$emit('scrolled')
		}
	},
}
</script>
<style	lang="scss" scoped>
.pc-back-to-top-fade-enter-active,
.pc-back-to-top-fade-leave-active {
	transition: opacity .7s;
}

.pc-back-to-top-fade-enter,
.pc-back-to-top-fade-leave-to {
	opacity: 0;
}

.pc-back-to-top {
	cursor: pointer;
	position: fixed;
	z-index: 1000;
	display: block;
	content: '';
	width: 30px;
	height: 50px;
	background: url(@/assets/romimg/common/back_to_top.png) no-repeat center;
	background-size: contain;
}

.pc-back-to-top .default {
	background-color: #f5c85c;
	border-radius: 3px;
	color: #ffffff;
	height: 30px;
	line-height: 30px;
	text-align: center;
	width: 160px;
	display: none;
}

.pc-back-to-top .default span {
	color: #ffffff;
}

.pc-back-to-top--is-footer {
	bottom: 50% !important;
	position: absolute;
	transform: translateY(50%);
}

</style>