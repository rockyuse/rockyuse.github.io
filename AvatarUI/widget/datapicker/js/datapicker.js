/**
 * AvatarUI-内容选择
 * @version	v2.0.1
 * @author	Rocky(296456018@qq.com)
 * @date	2013-04-25
 */

;!function(win, $, undefined){
	$.fn.dataPicker = function(options){
		var defaults = {
			itemWidth: 200,
			itemHeight: 26,
			treeList: false,
			theme: 'Green',
			data: ''
		};

		var opt = $.extend({},defaults, options);

		$(this).click(function(e){
			e.stopPropagation();
			var _self = $(this);

			var methodAdd = $(this).hasClass("addPickerItem") ? true : false;

			//构建下拉列表dom
			$(document.body).append('<div class="picker pickerTheme'+opt.theme+'">'
								+'<div class="searchDiv">'
									+'<input type="text" class="searchInput" onkeydown="this.style.color=\'#404040\'" onblur="if(this.value==\'\'){this.value=\'输入关键字搜索\';this.style.color=\'#b6b7b9\';}" onfocus=" if(this.value!=\'输入关键字搜索\'){this.style.color=\'#404040\';}else{this.value=\'\';this.style.color=\'#404040\'}" autocomplete="off" value="输入关键字搜索" class="ddnewhead_search_input" style="color: rgb(182, 183, 185);" />'
								+'</div>'
								+'<div class="pickerCon">'
									+'<ul class="pickerTreeUl"></ul><ul class="pickerInsideCon pickerListUl"></ul>'
								+'</div>'

								+'<div class="pickerBot">'
									+'<input type="checkbox" class="pickerSwitch"/>'
									+'显示按名称排序的列表'
								+'</div>'
							+'</div>');
			
			var leftPadding = methodAdd == true ? 0 : 17;
			$(".picker").css({"top": _self.offset().top + _self.outerHeight(), "left": _self.offset().left - leftPadding}).show();


			var _data = opt.data;
			var str = "", str1 = "";
			for(var i = 0, len = _data.length; i < len; i++){
				str += '<li>';
					str += '<a class="title" href="javascript:;"><span class="arrow"></span>'+_data[i].title+'</a>';
					str += '<ul class="pickerInsideCon">';
					for(var j = 0, l = _data[i].itemList.length; j < l; j++){
						str += '<li><a href="javascript:;" id="itemList'+_data[i].itemList[j].id+'">'+_data[i].itemList[j].name+'</a></li>';
						str1 += '<li><a href="javascript:;" id="itemList'+_data[i].itemList[j].id+'">'+_data[i].itemList[j].name+'</a></li>';
					}
					str += '</ul>';
				str += '</li>';
			}
			$(".pickerTreeUl").html(str);
			$(".pickerListUl").html(str1);


			$(".pickerCon .title").click(function(){
				$(this).find(".arrow").toggleClass("arrowDown");
				$(this).parent().find(".pickerInsideCon").toggle();
			});

			$(".pickerInsideCon a").click(function(){
				if(methodAdd == true){
					var thisItem = $('<div class="pickerItem pickerItem'+opt.theme+'">'
						+'<div class="pickerItemCon">'
							+'<div class="pickerItemDrag"></div>'
							+'<div class="pickerItemTitle">'+$(this).html()+'</div>'
						+'</div>'
						+'<a class="pickerItemClose" href="javascript:;"></a>'
					+'</div>');

					thisItem.insertBefore(_self);

					if(opt.treeList == true){
						var thisWrap = thisItem.parent(".pickerItemWrapTree");
						var itemLen = thisWrap.find(".pickerItem").length;
						thisItem.css("margin-left", 20*(itemLen-1));
						_self.css("margin-left", 20*itemLen);
					}

					
					thisItem.find(".pickerItemTitle").dataPicker({});

					thisItem.find(".pickerItemClose").click(function(){
						var thisItem = $(this).parents(".pickerItem");
						var thisItemWrap = thisItem.parent(".pickerItemWrap");
						thisItem.remove();

						if(opt.treeList == true){
							var itemAll = thisItemWrap.find(".pickerItem");
							itemAll.each(function(k, v){
								$(this).css("margin-left", 20*k);
							});

							thisItemWrap.find(".addPickerItem").css("margin-left", 20*itemAll.length);
						}

					});

					thisItem.find(".pickerItemDrag").mousedown(function(e){
						e.stopPropagation();
						$(".picker").remove();

						var thisItem = $(this).parents(".pickerItem");
						thisItem.css("visibility", "hidden");

						var thisItemWrap = thisItem.parent(".pickerItemWrap");

						$(document.body).append('<div class="pickerItemMove pickerItemMove'+opt.theme+'">'+thisItem.html()+'</div>');
						var moveItem = $(".pickerItemMove");

						var spaceX = e.pageX - thisItem.offset().left;
						var spaceY = e.pageY - thisItem.offset().top;
						moveItem.css({"left": e.pageX - spaceX, "top": e.pageY - spaceY});
					
						var drag = true;
						$(document).mousemove(function(e){
							if(drag == true){
								win.getSelection ? win.getSelection().removeAllRanges() : document.selection.empty();
								var _x = e.pageX - spaceX;
								var _y = e.pageY - spaceY;
								moveItem.css({"left": _x, "top": _y});

								var _centerX = _x + opt.itemWidth/2;
								var _centerY = _y + opt.itemHeight/2;

								var itemAll = thisItemWrap.find(".pickerItem");
								var thisIndex = itemAll.index(thisItem);

								itemAll.each(function(i, v){
									if(thisIndex == i){
										return;
									}
									var thisX = $(this).offset().left;
									var thisY = $(this).offset().top;

									if(_centerX > thisX && (_centerX < (thisX + opt.itemWidth)) && _centerY > thisY && (_centerY < (thisY + opt.itemHeight))){
										if(thisIndex < i){
											thisItem.insertAfter($(this));
										}else{
											thisItem.insertBefore($(this));
										}

										if(opt.treeList == true){
											var itemAll = thisItemWrap.find(".pickerItem");
											itemAll.each(function(k, v){
												$(this).css("margin-left", 20*k);
											})
										}
										return false;
									}
								});
							}
						});

						$(document).mouseup(function(e){
							drag = false;
							$(".pickerItemMove").remove();
							thisItem.css("visibility", "visible");
						});
					});
				}else{
					_self.html($(this).html());
				}

				$(".picker").remove();
			});

			$(".pickerSwitch").click(function(){
				$(".pickerTreeUl").toggle();
				$(".pickerListUl").toggle();

				filterChar();
			});

			$(".picker .searchInput").bind("keyup", function(){
				filterChar();
			});

			$(document).bind("click", function(){
				$(".picker").remove();
			});

			$(".picker").click(function(e){
				e.stopPropagation();
			});

			//过滤字符
			function filterChar(){
				var _thisVal = $(".picker .searchInput").val(), aList;

				if($(".pickerListUl").is(":hidden")){
					if(_thisVal === "输入关键字搜索"){
						$(".pickerTreeUl").find(".title").show();
						$(".pickerTreeUl").find(".arrow").removeClass("arrowDown");
						$(".pickerTreeUl .pickerInsideCon").hide();
						return;
					}
					$(".pickerTreeUl").find(".title").hide();
					$(".pickerTreeUl").find(".arrow").addClass("arrowDown");
					$(".pickerTreeUl .pickerInsideCon").show();
					aList = $(".pickerTreeUl .pickerInsideCon a");
				}else{
					if(_thisVal === "输入关键字搜索"){
						console.log(12);
						$(".pickerListUl li a").show();
						return;
					}
					aList = $(".pickerListUl li a");
				}

				aList.each(function(k, v){
					var aHtml = $(this).html();
					var that = $(this);
					if(RegExp(_thisVal).test(aHtml)){
						that.show();
						that.parents(".pickerInsideCon").show();
						that.parents(".pickerInsideCon").parent("li").find(".title").show();
					}else{
						that.hide();
					}
				});
			}
		});
	};
}(this, jQuery);