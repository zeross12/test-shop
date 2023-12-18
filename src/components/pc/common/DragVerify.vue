<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { ref, onMounted, defineProps, computed, watch } from 'vue'

const emit = defineEmits( [ 'passing' ] )
const props = defineProps( {
	width :
	{
		type : Number,
		default : 418
	},

	height :
	{
		type : Number,
		default : 44
	},
	
	successText :
	{
		type : String,
		default : 'common.verifyPass'
	},

	text :
	{
		type : String,
		default : 'common.dropVerify'
	},

	handlerBg :
	{
		type : String,
		default : '#fefefe'
	},

	background :
	{
		type : String,
		default : '#eee'
	},

	progressBarBg :
	{
		type : String,
		default : '#5bcb87'
	},

	completedBg :
	{
		type : String,
		default : '#5bcb87'
	},

	radius :
	{
		type : String,
		defualt : '4px'
	},

	textSize :
	{
		type : String,
		default : '14px'
	},

	textColor :
	{
		type : String,
		default : '#999'
	},

	allowDrag :
	{
		type : Boolean,
		default : true
	},

	isPassing :
	{
		type : Boolean,
		default : false
	}
} )

const dragVerify = ref( null )				///	refs
const progressBar = ref( null )
const handler = ref( null )
const message = ref( null )

const isMoving = ref( false )
const isOk = ref( false )
const x = ref( 0 )

onMounted( () => {
	let el = dragVerify.value
		el.style.setProperty( "--textColor", props.textColor )
		el.style.setProperty( "--width", `${Math.floor( props.width / 2 )}px` )
		el.style.setProperty( "--pwidth", `${-Math.floor( props.width / 2 )}px` )
		el.style.borderRadius = props.radius
} )

const handlerStyle = computed( () => {
	return {
		left : !props.isPassing ? 0 : handler.value.style.left,
		width : `${props.height}px`,
		height : `${props.height}px`,
		background : props.handlerBg
	}
} )

const progressBarStyle = computed( () => {
	return {
		background : props.progressBarBg,
		height : `${ props.height }px`,
		width : !props.isPassing ? 0 : '100%'
	}
} )

const textStyle = computed( () => {
	return {
		height : `${props.height}px`,
		width : `${props.width}px`,
		fontSize : props.textSize
	}
} )

const content = computed( {
	get()
	{
		return props.isPassing ? t( props.successText ) : t( props.text )
	},

	set( val )
	{
		return val
	}
} )

const dragVerifyStyle = computed( () => {
	return {
		width : `${props.width}px`,
		height : `${props.height}px`,
		lineHeight : `${props.height}px`,
		background : props.background,
		borderRadius : props.radius
	}
} )

/**
 * 拖拽开始
 */
function dragStart( e )
{
	if( !props.allowDrag ) return

	if( !props.isPassing )
	{
		isMoving.value = true
		x.value = e.pageX - parseInt( handler.value.style.left, 10 )
	}
}

/**
 * 拖拽中
 */
function dragMoving( e )
{
	if( isMoving.value && !props.isPassing ) 
	{
		let _x = e.pageX - x.value

		if( _x > 0 && _x <= props.width - props.height )
		{
			handler.value.style.left = `${ _x }px`
			progressBar.value.style.width = `${ _x + props.height / 2 }px`

		}
		else if( _x > props.width - props.height )
		{
			// window.$dev && console.log( props.width - props.height )
			handler.value.style.left = `${props.width - props.height}px`
			progressBar.value.style.width = `${props.width - props.height / 2}px`
			passVerify()
		}
	}
}

/**
 * 拖拽结束
 */
function dragFinish( e )
{
	if( isMoving.value && !props.isPassing )
	{
		let _x = e.pageX - x.value
		if( _x < props.width - props.height )
		{
			isOk.value = true
			
			setTimeout( () => {
				handler.value.style.left = "0"
				progressBar.value.style.width = "0"
				isOk.value = false
			}, 500 )
		}
		else 
		{
			handler.value.style.left = `${props.width - props.height}px`
			progressBar.value.style.width = `${props.width - props.height / 2 }px`
			passVerify()
		}
		isMoving.value = false
	}
}

function passVerify() 
{
	emit( "passing", true )
	isMoving.value = false
	progressBar.value.style.background = props.completedBg
	message.value.style["-webkit-text-fill-color"] = "unset"
	message.value.style.animation = "slidetounlock2 3s infinite"
	message.value.style.color = "#fff"
}

</script>
<template>
	<div 
		class="drag-verify-container" 
		ref="dragVerify"
		@mousemove="dragMoving"
		@mouseup="dragFinish"
		@mouseleave="dragFinish"
	>
		<div
			class="progress-bar"
			:class="{ goFirst2 : isOk }"
			ref="progressBar"
			:style="progressBarStyle"
		>

		</div>
		<div
			class="text"
			:style="textStyle"
			ref="message"
		>
			{{ content }}
		</div>

		<div
			class="handler handler-bg"
			:class="{ goFirst : isOk, over : props.isPassing }"
			@mousedown="dragStart"
			ref="handler"
			:style="handlerStyle"
		>
			<el-icon v-if="!props.isPassing"><DArrowRight /></el-icon>
			<el-icon :size="20" v-else><SuccessFilled /></el-icon>
		</div>
	</div>
</template>
<style lang="scss">
.drag-verify-container
{
	position: relative;
	background-color: #e8e8e8;
	text-align: center;
	overflow: hidden;
	box-sizing: content-box !important;
	height: 100%;
	width: 100%;
	border-radius: 4px;

	.progress-bar
	{
		position: absolute;
		height: 34px;
		width: 0px;
	}

	.text
	{
		position: absolute;
		top: 0px;
		color: transparent;
		user-select: none;
		display: flex;
		align-items: center;
		justify-content: center;
		background: gradient(
			linear,
			left top,
			right top,
			color-stop(0, var(--textColor)),
			color-stop(0.4, var(--textColor)),
			color-stop(0.5, #fff),
			color-stop(0.6, var(--textColor)),
			color-stop(1, var(--textColor))
		);
		background-clip: text;
		-webkit-text-fill-color: transparent;
		text-size-adjust: none;
		animation: slidetounlock 3s infinite;
		-webkit-text-fill-color: var( --textColor );
	}

	.handler
	{
		display: flex !important;
		position: absolute;
		top: 0px;
		left: 0px;
		align-items: center;
		justify-content: center;
		cursor: move;
		user-select: none;

		&.goFirst {
			left: 0px !important;
			transition: left 0.5s;
		}
		
		&.goFirst2 {
			width: 0px !important;
			transition: width 0.5s;
		}

		&.over
		{
			background: #02BF4D !important;
			color: #fff !important;
		}

		img
		{
			user-select: none;
		}

		.el-icon-circle-check {
			color: #6c6;
			margin-top: 9px;
		}
	}
}

@keyframes slidetounlock {
	0% {
		background-position: var( --pwidth ) 0;
	}
	100% {
		background-position: var( --width ) 0;
	}
}
@keyframes slidetounlock2 {
	0% {
		background-position: var( --pwidth ) 0;
	}
	100% {
		background-position: var( --pwidth ) 0;
	}
}
</style>