/**
 * 创建庆祝烟花
 */
export default class Fire
{
	canvas = null
	ctx = null

	x = 0
	y = 0

	top = 0
	left = 100

	w = 800
	h = 400
	zIndex = 300

	el = []
	probability = 0.04

	/**
	 * 构造函数
	 * @param {string} el 要挂载的对象 
	 * @param {object} opt 
	 */
	constructor( el, opt )
	{
		this.w = opt && opt.width || this.w
		this.h = opt && opt.height || this.h

		this.canvas = document.createElement( 'canvas' )
		this.canvas.width = this.w
		this.canvas.height = this.h

		this.setStyle( {
			pointerEvents : 'none',
			position : `absolute`,
			top : `${ opt && opt.top || this.top }px`,
			left : `${ opt && opt.left || this.left }px`,
			zInde : opt && opt.zIndex || this.zInde
		} )

		document.querySelector( el ).appendChild( this.canvas )

		this.ctx = this.canvas.getContext( '2d' )
	}

	/**
	 * 设置样式
	 * @param {object} opt 
	 */
	setStyle( opt )
	{
		for( let x in opt )
		{
			this.canvas.style[x] = opt[x]
		}
	}

	run()
	{
		this.addFire( 5 )
		this.render()

		requestAnimationFrame( this.run.bind( this ) )
	}

	/**
	 * 添加烟火
	 * @param {number} max 最多同时显示几个
	 */
	addFire( max )
	{
		if( this.el.length < max && Math.random() < this.probability )
			this.parse()

		let alive = []

		for( let i = 0, j = this.el.length; i < j; i++ )
		{
			if( this.el[i].move( i ) )
				alive.push( this.el[i] )
		} 
		this.el = alive
	}

	/**
	 * 渲染所有的烟花
	 */
	render()
	{
		this.ctx.globalCompositeOperation = 'destination-out'
		// this.ctx.globalCompositeOperation = 'source-over'
		this.ctx.fillStyle = 'rgba( 0, 0, 0, 0.2 )'

		this.ctx.fillRect( 0, 0, this.w, this.h )
		this.ctx.globalCompositeOperation = 'lighter'
		
		for( let i = 0, j = this.el.length; i < j; i++ )
		{
			// this.el[i].render( this.ctx )
			this.el[i].render( this.ctx )
		}
	}

	/**
	 * 创建烟火
	 */
	parse()
	{
		// let fire = 2//Math.random() * 50 + 100

		// for( let i = 0, j = fire; i < j; i++ )
		// {
			let el = new Particle()

			let vy = Math.sqrt( 25 - el.vx * el.vx )

			if( Math.abs( el.vy ) > vy )
			{
				el.vy = el.vy > 0 ? vy : -vy
			}

			el.create( this.ctx )
			this.el.push( el )
		// }
	}
}

/**
 * 烟花实例
 */
class Particle
{
	gravity = .5
	radius = 0
	speed = 2

	fire = []
	///	烟花数量
	count = 80

	///	最大持续时间
	timer = 5

	constructor()
	{
		this.w = this.h = Math.floor( Math.random() * 30 + 1 )

		this.posX = Math.floor( Math.random() * ( this.w - 200 ) ) + 200
		this.posY = Math.floor( Math.random() * ( this.h - 200 ) ) + 200

		this.x = this.posX - this.w / 2
		this.y = this.posY - this.h / 2

		// window.$dev && console.log( this.w, this.posX, this.posY )

		this.vx = ( Math.random() - 0.5 ) * 10
		this.vy = ( Math.random() - 0.5 ) * 10

		this.alpha = Math.random() * .5 + .5
	}

	/**
	 * 设置烟花的爆炸动画
	 * @param {number} index 当前烟花的索引值 
	 * @returns boolean
	 */
	move( index )
	{
		// this.x = this.x + this.vx
		this.vy = this.vy + this.gravity
		// this.y = this.y + this.vy

		// this.alpha = this.alpha - 0.01

		// // window.$dev && console.log( this.x <= -this.w, this.x >= this.w, this.y >= this.h, this.alpha <= 0 )
		// if( this.x <= -this.w || this.x >= this.w || this.y >= this.h || this.alpha <= 0 )
		// 	return false
		if( this.radius >= this.fire[index].timer )
			return false
		
		this.radius = this.radius + 0.1//this.speed
		// this.posX = this.posX + this.vx
		// this.posY = this.posY + this.vy

		return true
	}

	/**
	 * 生成随机色
	 * @returns string
	 */
	color()
	{
		let r = Math.floor( Math.random() * 200 ) + 55
		let g = Math.floor( Math.random() * 200 ) + 55
		let b = Math.floor( Math.random() * 200 ) + 55
		
		return `rgb( ${r}, ${g}, ${b} )`
	}

	// pos( index, x, y )
	// {
	// 	let angle = 360 / this.count * index
	// 	let rad = angle * Math.PI / 180
	// 	let posX = x + Math.cos( rad ) * this.radius + 200
	// 	let posY = y + Math.sin( rad ) * this.radius + 200

	// 	return { x : posX, y : posY }
	// }

	create( ctx )
	{
		for( let i = 0; i < this.count; i++ )
		{
			// let pos = this.pos( i, this.posX, this.posY )
			let angle = 360 / this.count * i
			let rad = angle * Math.PI / 180
			let posX = this.posX + Math.cos( rad ) * this.radius + 200
			let posY = this.posY + Math.sin( rad ) * this.radius + 200
			this.fire.push( { 
				x : posX, 
				y : posY, 
				alpha : Math.ceil( Math.random() * 100 ) / 100, 
				color : this.color(),
				timer : Math.ceil( Math.random() * this.timer * 10 )
			} )
		}
		this.render( ctx )
	}

	/**
	 * 渲染每束烟火
	 * @param {CanvasRenderingContext2D} ctx 
	 */
	render( ctx )
	{

		for( let i = 0; i < this.fire.length; i++ )
		{
			///	根据alpha值判断是否燃尽
			this.fire[i].alpha = this.fire[i].alpha - 0.016
			if( this.fire[i].alpha <= 0.01 ) continue

			let angle = 360 / this.count * i
			let rad = angle * Math.PI / 180

			// let angle = 360 / count * i
			// let rad = angle * Math.PI / 180
			// let posX = this.posX + Math.cos( rad ) * this.radius + 200
			// let posY = this.posY + Math.sin( rad ) * this.radius + 200 + this.vy
			
			// let pos = this.pos( i, this.fire[i].x, this.fire[i].y )
			this.fire[i].x = this.fire[i].x + ( Math.cos( rad ) * this.radius )
			this.fire[i].y = this.fire[i].y + ( Math.sin( rad ) * this.radius ) + this.vy / 15

			ctx.save()
			ctx.beginPath()

			ctx.arc( this.fire[i].x, this.fire[i].y, this.speed, Math.PI * 2, false )
			
			// let color = `rgb( ${this.fire[i].color.r}, ${this.fire[i].color.g}, ${this.fire[i].color.b} )`
			// window.$dev && console.log( color )

			ctx.fillStyle = this.fire[i].color		//'#f00'//this.fire[i].color
			ctx.globalAlpha = this.fire[i].alpha	//this.alpha//.fire[i].alpha

			ctx.closePath()

			ctx.fill()
			ctx.restore()
		}
		// window.$dev && console.log( this.fire[0].color )
		// debugger
	}
}