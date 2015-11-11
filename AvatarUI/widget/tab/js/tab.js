/**
 * AvatarUI-tab
 * @version v2.0.1
 * @author  Rocky(296456018@qq.com)
 * @date    2013-04-25
 */

;!function(win, $, undefined){
	$.fn.Tab = function(options) {
		var defaults = {
			changeType: "click",					//点击方式
			activeCallback: function(index){},
			
			addTab: false,
			addCallback: function(index){},
			
			delTab: false,
			delCallback: function(index){},
			
			tabShowIndex: 0
		};
		var opt = $.extend({},defaults, options);
		var _self = $(this);
		
		// 绑定切换
		bindChange();
		
		// 添加删除tab标签
		opt.delTab && addDel();
		
		if(opt.addTab == true){
			_self.find('.addTab').click(function(){
				var tabLi = _self.find('.tab li');
				var tabCon = _self.find('.tabCon');
		
				tabLi.removeClass('active');
				var thisLi = $('<li class="active"><a href="javascript:;">tab</a></li>');
				thisLi.appendTo(_self.find('.tab ul'));
				
			
				tabCon.hide();
				var thisCon = $('<div class="tabCon"></div>');
				thisCon.appendTo(_self);

				thisLi.find('a').css('padding-right', 25);
				thisLi.append('<div class="tabDel">X</div>');
				delThisLi(thisLi);

				bindChange();
				
				var index = _self.find(".tabNav li").length;
				opt.addCallback(index-1);
			})
		};
		
		
		// 绑定切换
		function bindChange(){
			var thisTabLi = _self.find(".tabNav li");
			var thisTabCon = _self.find(".tabCon");
			
			thisTabLi.eq(opt.tabShowIndex).addClass('active');
			thisTabCon.eq(opt.tabShowIndex).show();
			
			thisTabLi.each(function(i){
				$(this).bind(opt.changeType, function(){
					thisTabCon.hide().eq(i).show();
					thisTabLi.removeClass('active').eq(i).addClass('active');
	
					opt.activeCallback(i);
				})
			});
		}
		
		// 添加del
		function addDel(){
			var thisTabLi = _self.find(".tabNav li");
			var thisTabCon = _self.find(".tabCon");
			thisTabLi.each(function(i){
				$(this).find('a').css('padding-right', 25);
				$(this).append('<div class="tabDel">X</div>');
				
				delThisLi($(this));
			});
		}
		
		// 删除tab
		function delThisLi(thisLi){
			var _this = thisLi;
			thisLi.find('.tabDel').click(function(){
				var thisTabText = _this.find('a').html();
				if(!confirm('确认要删除 "'+thisTabText+'" 吗?')){
					return;
				}
				
				var tabLi = _self.find('.tabNav li');
				var tabCon = _self.find('.tabCon');
				
				var index = tabLi.index(_this);
				
				if(_this.hasClass('active')){
					if(tabLi.length > index+1){
						tabLi.removeClass('active').eq(index+1).addClass('active');
						tabCon.hide().eq(index+1).show();
					}else{
						tabLi.removeClass('active').eq(index-1).addClass('active');
						tabCon.hide().eq(index-1).show();
					}
				}
				tabLi.eq(index).remove();
				tabCon.eq(index).remove();
				opt.delCallback(index);
			})
		}
		
	};
}(this, jQuery);