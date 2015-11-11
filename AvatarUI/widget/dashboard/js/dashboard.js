/**
 * AvatarUI-dashboard
 * @version	v2.0.1
 * @author	Rocky(296456018@qq.com)
 * @date	2013-04-25
 */

;!function(win, $, undefined){
	$.fn.Dashboard = function(options){
		var defaults = {
			colWidth: [500, 500, 500],
			space: 18,
			drag: true,
			initCallback: function(newColWidth){},
			resizeCallback: function(){}
		};
		var opt = $.extend({},defaults, options),
			_self = $(this),
			dashboardWrap = $(this).find('.dashboardWrap'),
			colWidthAll = 0,
			resizeTimer;

		for (var i = opt.colWidth.length - 1; i >= 0; i--) {
			colWidthAll += opt.colWidth[i];
		};

		opt.initCallback(adjustWidth());

		function adjustWidth(){
			var colWidthRate = _self.width()/colWidthAll,
				newColWidth = [];
			dashboardWrap.each(function(i,v){
				var newWidth = opt.colWidth[i]*colWidthRate - opt.space;
				$(this).width(newWidth);
				newColWidth.push(newWidth);
			});
			return newColWidth;
		}

		$(win).bind('resize.dashboard', function(){
//			resizeTimer && clearTimeout(resizeTimer);
//			resizeTimer = setTimeout(function(){
				opt.resizeCallback(adjustWidth());
//			}, 10);
		});
		
		if(opt.drag){
			_self.find('.dashboard').hover(function(){
				$(this).addClass('dashboardHover');
			},function(){
				$(this).removeClass('dashboardHover');
			});
			_self.find('.dashboardTitle').hover(function(){
				$(this).addClass('dashboardTitleHover');
			},function(){
				$(this).removeClass('dashboardTitleHover');
			});
			_self.find('.dashboardSet').hover(function(){
				$(this).addClass('dashboardSetHover');
			},function(){
				$(this).removeClass('dashboardSetHover');
			});
			
			_self.find('.dashboardTitle').live('mousedown', function(e){
				e.stopPropagation();
				var thisDashboard = $(this).parents('.dashboard'),
					thisTitle = thisDashboard.find('.dashboardTitle h3').html(),
					spaceX = e.pageX - thisDashboard.offset().left + 2,
					spaceY = e.pageY - thisDashboard.offset().top + 4,
					dashboardMove,
					drag = true,
					width = thisDashboard.outerWidth() + 4,
					height = thisDashboard.outerHeight() - 2;
	
				$('<div class="dashboard dashboardOrigin" style="height:'+(height)+'px;"></div>').insertAfter(thisDashboard);
	
				$(document.body).append('<div class="dashboardMove"></div>');
				thisDashboard.appendTo($('.dashboardMove'));
				thisDashboard = $('.dashboardOrigin');
	
				dashboardMove = $('.dashboardMove');
				dashboardMove.css({'left': e.pageX - spaceX, 'top': e.pageY - spaceY, 'width': width, 'height': height});
				dashboardMove.find('.dashboard').css({'opacity': .9});
	
				$(document).bind("mousemove.dashboard", function(e){
					if(drag){
						$('.dashboardGhost').remove();
						win.getSelection ? win.getSelection().removeAllRanges() : document.selection.empty();
	
						var _x = e.pageX - spaceX,
							_y = e.pageY - spaceY,
							_centerX = _x + width/2,
							_centerY = _y + height/2,
							thisWrap = thisDashboard.parent(".dashboardWrap"),
							dashboardWrap = $(".dashboardWrap"),
							thisWrapIndex = dashboardWrap.index(thisWrap);
	
	
						dashboardMove.css({'left': _x, 'top': _y});
	
						dashboardWrap.each(function(key, val){
							var _self = $(this),
								dashboards = $(this).find('.dashboard'),
								thisIndex = dashboards.index(thisDashboard),
								thisX = $(this).offset().left;
	
							if(_centerX < thisX || (_centerX > (thisX + $(this).width()))){
								return;
							}
	
							if(dashboards.size() == 0){
								_self.append('<div class="dashboardGhost">'+thisTitle+'</div>');
								return;
							}else{
								if(thisWrapIndex == key){
									dashboards.each(function(i, v){
										if(thisIndex == i){
											return;
										}
										var thisY = $(this).offset().top,
											_width = $(this).outerWidth(),
											_height = $(this).outerHeight();
										
										if(_centerX > thisX && (_centerX < (thisX + _width)) && _centerY > thisY && (_centerY < (thisY + _height))){
											if(thisIndex < i){
												$('<div class="dashboardGhost">'+thisTitle+'</div>').insertAfter($(this));
											}else{
												$('<div class="dashboardGhost">'+thisTitle+'</div>').insertBefore($(this));
											}
											return false;
										}
	
										if(i == dashboards.size()-1 && thisWrapIndex !== key){
											_self.append('<div class="dashboardGhost">'+thisTitle+'</div>');
											return false;
										}
									});
								}else{
									dashboards.each(function(i, v){
										if(thisWrapIndex == key && thisIndex == i){
											return;
										}
										var thisY = $(this).offset().top,
											_width = $(this).outerWidth(),
											_height = $(this).outerHeight();
	
										if(_centerY > thisY && (_centerY < (thisY + _height/2))){
											$('<div class="dashboardGhost">'+thisTitle+'</div>').insertBefore($(this));
											return false;
										}else if((_centerY > (thisY + _height/2)) && (_centerY < (thisY + _height))){
											$('<div class="dashboardGhost">'+thisTitle+'</div>').insertAfter($(this));
											return false;
										}
	
										if(i == dashboards.size()-1 && thisWrapIndex !== key){
											_self.append('<div class="dashboardGhost">'+thisTitle+'</div>');
											return false;
										}
									});
								}
								return false;
							}
						});
					}
				});
	
				$(document).bind("mouseup.dashboard", function(e){
					if(drag == true){
						var endX, endY;
						if($('.dashboardGhost').length > 0){
							$(dashboardMove.html()).insertAfter($('.dashboardGhost')).hide();
							endX = $('.dashboardGhost').offset().left;
							endY = $('.dashboardGhost').offset().top;
						}else{
							$(dashboardMove.html()).insertAfter($('.dashboardOrigin')).hide();
							endX = $('.dashboardOrigin').offset().left;
							endY = $('.dashboardOrigin').offset().top;
						}
	
						dashboardMove.animate({'left': endX, 'top': endY, 'opacity': 1}, 250, function(){
							dashboardMove.remove(); 
							$('.dashboard').css({'opacity': 1}).show();
							$('.dashboardGhost').remove();
							$('.dashboardOrigin').remove();
						});
						drag = false;
						$(document).unbind('.dashboard');
					}
				});
			});
		}
	};
}(this, jQuery)