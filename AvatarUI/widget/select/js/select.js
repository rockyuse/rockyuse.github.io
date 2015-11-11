/**
 * AvatarUI-模拟下拉框
 * @version v2.0.1
 * @author  Rocky(296456018@qq.com)
 * @date    2013-04-25
 */

;!function(win, $, undefined){
	$.fn.ImitSelect = function(options){
		var defaults = {
			selectWidth: 200,			//选择框的宽度   
			selectUlWidth: 200,			//下拉框的宽度

			selectUlHeight: "",			//下拉框的高度
			selectUlNum: 12,			//下拉框高度根据显示条数来定

			option: [],					//内容选项
			selectOptionId: [],			//选中的id
			selectOptionName: [],		//选中的名称
			
			initCallback: function(_self){},			//初始化成功
			selectCallback: function(id,name){},		//选中后的回调
			removeCallback: function(id,name){},		//移出后的回调
			

			selectType: "",								//是否多选 single||""

			showSelectAll: false,						//显示全选
			selectAllCallback: function(){},			//全选后的回调
			unSelectAllCallback: function(){},			//取消全选后的回调

			showTip: false,								//显示提示框
			selectTipWidth: 150,						//提示框的宽度
			clickSelectCallback: function(_self){},
			noSelectCallback: function(_self){}
		};

		var opt = $.extend({},defaults, options);

		var _self = $(this);

		/**
		 * @获取数组元素索引
		 * @example: arr.indexOf("a");
		 */
		Array.prototype.indexOf = function(val) {
			for (var i = 0; i < this.length; i++) {
				if (this[i] == val) return i;
			}
			return -1;
		};

		/**
		 * @数组删除元素
		 * @example: arr.remove("a");
		 */
		Array.prototype.remove = function(val) {
			var index = this.indexOf(val);
			if (index > -1) {
				this.splice(index, 1);
			}
		};
		
		/**
		 * @判断数组中是否包含某一元素
		 * @example: arr.contains("a");
		 */
		Array.prototype.contains = function (element) {    
			for (var i = 0; i < this.length; i++){
				if (this[i] == element) {
					return true;  
				}  
			}  
			return false;    
		}
		
		/**
		 * @去除字符串首尾空格
		 * @example: str.trim();
		 */
		String.prototype.trim = function(){return this.replace(/^\s*|\s*$/g,"");};

		
		//构建下拉列表dom
		_self.append('<div class="imitSelect">'
						+'<a href="javascript:;" class="selectBtn"></a>'
						+'<input type="text" class="selectInputName" val="" />'
						+'<input type="hidden" class="selectInputId" />'
						+'<div class="selectUl">'
						+'<ul></ul>'
						+'</div>'
					+'</div>');
		
		//初始化下拉列表的宽度
		_self.find(".imitSelect").css("width", opt.selectWidth);
		_self.find(".selectInputName").css("width", opt.selectWidth - 24);

		//初始化提示框的窗体
		if(opt.showTip == true){
			var thisId = $(this).attr("id");
			if($("#ImitSelectTip_"+thisId).length == 0){
				$(document.body).append('<div id="ImitSelectTip_'+thisId+'" class="imitSelectTip"><div class="tipInner"><div class="tipCon"></div></div></div>');
				$("#ImitSelectTip_"+thisId).width(opt.selectTipWidth);
				$("#ImitSelectTip_"+thisId).find(".tipInner").width(opt.selectTipWidth + 2);
				$("#ImitSelectTip_"+thisId).find(".tipCon").width(opt.selectTipWidth - 6);
			}
			
			$("#ImitSelectTip_"+thisId).mouseleave(function(){
				var _self = $(this);
				timeO = setTimeout(function(){_self.hide()},1000);
			});
			$("#ImitSelectTip_"+thisId).mouseenter(function(){
				clearTimeout(timeO);
				$(this).show();
			});
		}

		if(opt.selectType != "single" && opt.showSelectAll == true){
			_self.find(".selectUl").append('<div class="selectAll" style="position:absolute; top:0; left:0; height:20px; font-size:12px; line-height:20px; background:#f8f8f8; border:1px solid #838790; border-bottom:none; " ><input type="checkbox" style="float:left; margin:4px 3px 0 3px; display:inline;"/> 全选</div>');
			_self.find(".selectUl .selectAll").css({"width":opt.selectUlWidth});
			_self.find(".selectUl ul").css("padding-top","20px");
		}

		//填充下拉列表选项值
		$.each(opt.option,function(i,val){
			var input = "";
			if(opt.selectType != "single"){
				var input = '<input type="checkbox"/>';
			}
			
			_self.find(".selectUl ul").append('<li><a href="javascript:;" thisid="'+val.id+'">'+input+'<span>'+val.name+'</span></a></li>');
		});
		
		//初始化下拉列表选择项的宽度
		var thisUlHeight;
		
		if(opt.selectUlHeight == ""){
			if(opt.option.length < opt.selectUlNum){
				thisUlHeight = opt.option.length * 22;
			}else{
				thisUlHeight = opt.selectUlNum * 22;
			}
		}else{
			thisUlHeight = opt.selectUlHeight
		}
		
		_self.find(".selectUl ul").css({"width":opt.selectUlWidth,"height":thisUlHeight});
		
		
		//下拉列表的初始值
		var optionNameArr = [];

		if(opt.selectOptionName.length != 0){
			$.each(opt.selectOptionName, function(i,val){
				optionNameArr.push(val);
			});
		}else if(opt.selectOptionId.length != 0){
			_self.find(".selectUl a").each(function(){
				if(opt.selectOptionId.contains($(this).attr("thisid")) ){
					optionNameArr.push($(this).find("span").html());
				}
			});
		}

		_self.find(".selectInputName").val(optionNameArr);
		
		//初始化完成后的操作
		opt.initCallback(_self);

		_self.find(".selectBtn").bind("click", function(){
			showSelectUl("toggle");
		});

		_self.find(".selectInputName").bind("click", function(){
			opt.clickSelectCallback(_self);
			_self.find(".imitSelect").css("z-index", 10000);
			showSelectUl();
		});
		
		//
		_self.find(".selectAll input").bind("click",function(){
			if($(this).attr("checked") == true){
				var inputVal = [];
				_self.find(".selectUl a").each(function(index,val){
					$(this).find("input").attr("checked",true);
					$(this).addClass("selected");
					inputVal.push($(this).find("span").html().trim());
				});
				_self.find(".selectInputName").val(inputVal);

				opt.selectAllCallback();
			}else{
				_self.find(".selectInputName").val("");
				_self.find(".selectUl ul a").removeClass("selected");
				_self.find(".selectUl input").removeAttr("checked");
				opt.unSelectAllCallback();
			}
		});


		_self.find(".selectInputName").bind("keyup", function(){
			_self.find(".selectUl").find("a").removeClass("searched");
			var thisVal = $(this).val();

			var thisA = _self.find(".selectUl").find("a");
			if(thisVal != ""){
				thisA.each(function(){
					var thisV = $(this).find("span").html().trim();
					if(RegExp(thisVal).test(thisV)){
						$(this).addClass("searched");
						$(this).parent().prependTo(".selectUl ul");
					}
				});
			}
		});
		
		if(opt.showTip == true){
			$("#ImitSelectTip_"+thisId+" li a").live("click", function(){
				var thisName = $(this).parent().find("span").html();
				var thisTipId;
				
				var inputName = _self.find(".selectInputName").val().split(",");
				inputName.remove(thisName);
				_self.find(".selectInputName").val(inputName);
				
				_self.find(".selectUl a").each(function(index,val){
					var thisVal = $(this).find("span").html().trim();
					if(thisVal == thisName){
						thisTipId = $(this).attr('thisid');
						$(this).find("input").removeAttr("checked");
						$(this).removeClass("selected");
					}
				});
	
				opt.removeCallback(thisTipId, thisName);
				
				var thisHeight = $(this).parent().outerHeight();
				$(this).parent().remove();
				
				$("#ImitSelectTip_"+thisId).animate({'top': '+='+thisHeight}, 150, function(){
					if($(this).find('ul').html() == ''){
						$(this).hide();
					}
				});
			});
		}
		

		//显示下拉列表
		function showSelectUl(type){
			if(!_self.find(".selectBtn").hasClass("selectBtnDown")){
				_self.find(".selectUl").find("a").removeClass("selected searched");
				_self.find(".selectUl").find("input").removeAttr("checked");

				if(_self.find(".selectInputName").val() != ""){
					var valArr = _self.find(".selectInputName").val().split(",");
					_self.find(".selectUl a").each(function(index,val){
						var thisVal = $(this).find("span").html().trim();
						if(valArr.contains(thisVal)){
							$(this).find("input").attr("checked","checked");
							$(this).addClass("selected");
						}
					});
				}
				_self.find(".selectBtn").addClass("selectBtnDown");
				_self.find(".selectUl").slideDown(50);
			}else{
				if(type == "toggle"){
					_self.find(".selectBtn").removeClass("selectBtnDown");
					_self.find(".selectUl").slideUp(100);
					_self.find(".imitSelect").css("z-index", 100);
					fillInput();
				}
			}
		}
		
		//选择操作
		_self.find(".selectUl a").bind("click", function(){
			var thisVal = $(this).find("span").html().trim();
			if(opt.selectType == "single"){
				_self.find(".selectUl a").removeClass("selected");
				$(this).addClass("selected");
				_self.find(".selectBtn").removeClass("selectBtnDown");
				_self.find(".selectUl").slideUp(100);
				_self.find(".imitSelect").css("z-index", 100);
				fillInput();
				opt.selectCallback($(this).attr("thisid"), thisVal);
			}else{
				if($(this).hasClass("selected")){
					$(this).find("input").removeAttr("checked");
					$(this).removeClass("selected");
					fillInput();
				
					opt.removeCallback($(this).attr("thisid"), thisVal);
				}else{
					$(this).find("input").attr("checked","checked");
					$(this).addClass("selected");
					fillInput();
					opt.selectCallback($(this).attr("thisid"), thisVal);
				}
			}
		});

		$(document).bind("mousedown", function(e){
			if(!$(e.target).closest(".imitSelect").is("div") && !_self.find(".selectUl").is(":hidden") && !$(e.target).closest(".imitSelectTip").is("div")){
				_self.find(".selectBtn").removeClass("selectBtnDown");
				_self.find(".selectUl").slideUp(100);
				_self.find(".imitSelect").css("z-index", 100);

				fillInput();
				$("#ImitSelectTip_"+thisId).hide();
			}
		});
		
		//填充选择项到input
		function fillInput(){
			var valArr = [], selectVal = false;
			_self.find(".selectUl a").each(function(index,val){
				if($(this).hasClass("selected")){
					var thisVal = $(this).find("span").html().trim();
					valArr.push(thisVal);
					selectVal = true;
				}
			});
			
			selectVal ? _self.find(".selectInputName").val(valArr).css('color', '#333') : opt.noSelectCallback(_self);
			
			if(opt.showTip == true){
				$("#ImitSelectTip_"+thisId).find(".tipArrow").remove();
				var _selfOffset = _self.offset();
				
				var valStr = "";
				for(var i = 0; i < valArr.length; i++){
					valStr += '<li><a href="javascript:;" class="delSelect">x</a><span>'+valArr[i]+'</span></li>';
				}
				$("#ImitSelectTip_"+thisId).find(".tipCon").html("<b>已选项：</b><ul>"+valStr+"</ul>");
				
				
				$("#ImitSelectTip_"+thisId).css({"top":_selfOffset.top - $("#ImitSelectTip_"+thisId).outerHeight() - 8, "left":_selfOffset.left}).show();
				$("#ImitSelectTip_"+thisId).append('<span class="tipArrow tipArrow1"></span><span class="tipArrow"></span>');

				$("#ImitSelectTip_"+thisId).find(".tipArrow").css("left", opt.selectTipWidth - 20);
			}
		}
	};
}(this, jQuery);