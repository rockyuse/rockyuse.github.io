/**
 * AvatarUI-饼图
 * @version v2.0.1
 * @author  Rocky(296456018@qq.com)
 * @date    2013-04-25
 */

;!function(win, $, undefined){
	$.fn.Pie = function(options) {
		var defaults = {
			width: 500,		//宽度
			height: 500,	//高度
			offsetX: 0,		//横向偏移量
			offsetY: 0,		//纵向偏移量

			radius: 250,	//直径

			bgColor: '#cfcfcf',			//背景颜色
			colorArr: ['#aaa', '#bbb', '#ccc', '#ddd'],		//饼形颜色组
			valueArr: [30, 20, 40, 10],						//饼形数据

			startAngle: -90,			//偏移角度

			circleInnerRadius: 0,		//中心圆心直径
			circleInnerColor: '#fff',	//中心圆心背景

			beforeCallback: function(canvas){},	//绘制之前的回调
			initCallback: function(canvas){}	//绘制之后的回调
		};

		var opt = $.extend({}, defaults, options);

		//生成svg
		var canvas = Raphael($(this).attr('id'), opt.width, opt.height);

		//svg角度算法
		canvas.customAttributes.arc = function(x, y, r, a1, a2, fillColor) {
			var flag = (a2 - a1) > 180,
				clr = (a2 - a1) / 360;
			a1 = (a1 % 360) * Math.PI / 180;
			a2 = (a2 % 360) * Math.PI / 180;
			return {
				path: [["M", x, y], ["l", r * Math.cos(a1), r * Math.sin(a1)], ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)], ["z"]],
				fill: fillColor
			};
		};

		//填充背景
		var background = canvas.circle(opt.radius + opt.offsetX, opt.radius + opt.offsetY, opt.radius).attr({'fill': opt.bgColor, stroke: "none"});

		//绘制之前的回调
		opt.beforeCallback(canvas);
		
		//起始角度
		var startAngle = opt.startAngle;

		//区块存储
		var pieItem = [];
		

		//循环出色块
		for(var i = 0, len = opt.valueArr.length; i < len; i++){
			var thisVal = opt.valueArr[i] * 3.6;
			var _canvas = canvas.path().attr({arc: [opt.radius + opt.offsetX, opt.radius + opt.offsetY, opt.radius, startAngle, startAngle + thisVal, opt.colorArr[i]], stroke: "none"});

			pieItem.push(_canvas);
			startAngle += thisVal;
		}

		//绘制圆心
		var center = canvas.circle(opt.radius + opt.offsetX, opt.radius + opt.offsetY, opt.circleInnerRadius).attr({'fill': opt.circleInnerColor, stroke: "none"});

		//绘制之后的回调
		opt.initCallback(canvas, pieItem, center);
	};
}(this, jQuery);