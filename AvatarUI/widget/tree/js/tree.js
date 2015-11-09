/**
 * AvatarUI-tree
 * @version v2.0.1
 * @author  Rocky(296456018@qq.com)
 * @date    2013-04-25
 */

;!function(win, $, undefined){
	$.fn.Tree = function(options) {
		var defaults = {
			url: "",
			mothod: "post",
			checkbox: false,
			
			folderImg: "images/folder.gif",
			folderUnfoldImg: "images/folder_unfold.gif",
			fileImg: "images/file.gif",

			initCallback: function(){},

			clickCallback: function(){console.log(1)},

			innerText:"",
			
			rightMenu: false,  //右键菜单显示

			editBtnShow: false,  //修改
			editCallBack: function(id,name){alert("修改的id："+id+"修改的name："+name);},  //修改后的操作
			
			delBtnShow: false,
			delCallBack: function(id){alert("要删除的id："+id);},

			dragNode: false
		};

		var opt = $.extend({},defaults, options);
		var _self = $(this);
		
		/*
		$.ajax({
	            url: opt.url,
	            type: opt.method,
	            dataType: "json",
	            success: function(data){
					
	            },
	            error: function(xml,error){

	            }
	    });
		*/
		var checkbox = opt.checkbox ? '<ins class="treeCheckbox"></ins>' : '';
		_self.append('<input type="hidden" class="thisValStr"/><div class="treeCon"><ul class="treeUlLast" id="TreeUl_p"><li id="Tree_0" class="treeLiLast"><div class="treeClose treeCloseSingle"></div><a id="TreeA_0">'+checkbox+'<ins class="treeFolder"><img src="'+opt.folderUnfoldImg+'"/></ins>所有</a></li></ul></div>');

		//_self.append('<div class="treeClick"></div><div class="treeHover"></div>');
		//_self.append('<div class="treeRightMenu"><ul><li><a href="">编辑</a></li><li><a href="">删除</a></li></ul></div><div class="treeRightMenuShadow"></div>');
		


		//把json数据转换成树状结构
		function transData(a){
			var r = [];
			var hash = {};
			var id = "id", fid = "fid", children = "children";

			for(var i=0; i<a.length; i++){
				hash[a[i][id]] = a[i];
			}
			for(var i=0; i<a.length; i++){
				var aVal = a[i];
				if(hash[aVal[fid]]){
					if(!hash[aVal[fid]][children]){
						hash[aVal[fid]][children] = [];
					}
					hash[aVal[fid]][children].push(aVal);
				}else{
					r.push(aVal);
				}
			}
			
			return r;

		}

		function createTree(jsonData, fid){
			$("#Tree_"+fid).append('<ul id="TreeUl_'+fid+'"></ul>');

			var jsonDataLen = jsonData.length;
			
			$.each(jsonData, function(key, val){
				var link = "";
				if(val.links){
					link = 'link="'+val.links+'"';
				}
				var folderImg = val.folderImg || opt.folderImg;
				var folderUnfoldImg = val.folderUnfoldImg || opt.folderUnfoldImg;
				var fileImg = val.fileImg || opt.fileImg;
				var rightMenu = val.rightMenu || opt.rightMenu;
				var treeARightMenu = rightMenu == true ? "treeARightMenu" : "";

				var innerText = val.innerText || val.name;
				var editBtnShow = val.editBtnShow || opt.editBtnShow;
				var treeEdit = editBtnShow == true ? "treeAedit" : "";
				var treeEditText = editBtnShow == true ? '<input type="button" class="treeEdit"/>' : "";

				var delBtnShow = val.delBtnShow || opt.delBtnShow;
				var treeDel = delBtnShow == true ? "treeAedit" : "";
				var treeDelText = delBtnShow == true ? '<input type="button" class="treeDel"/>' : "";
				var checkbox = opt.checkbox ? '<ins class="treeCheckbox"></ins>' : '';

				if(val.open){
					$("#TreeUl_"+fid).append('<li id="Tree_'+val.id+'" style="display:none"><div class="treeClose treeOpen" id="Node_'+val.id+'"></div><a '+link+' class="treeA '+treeARightMenu+' '+treeEdit+' '+treeDel+'" id="TreeA_'+val.id+'">'+checkbox+'<ins class="treeFolder"><img src="'+folderImg+'" folderUnfoldImg="'+folderUnfoldImg+'" folderImg="'+folderImg+'" fileImg="'+fileImg+'"/></ins><span>'+innerText+'</span>'+treeEditText+''+treeDelText+'</a></li>');
				}else{
					$("#TreeUl_"+fid).append('<li id="Tree_'+val.id+'"><div class="treeClose treeOpen" id="Node_'+val.id+'"></div><a '+link+' class="treeA '+treeARightMenu+' '+treeEdit+' '+treeDel+'" id="TreeA_'+val.id+'">'+checkbox+'<ins class="treeFolder"><img src="'+folderImg+'" folderUnfoldImg="'+folderImg+'" folderImg="'+folderImg+'" fileImg="'+fileImg+'"/></ins><span>'+innerText+'</span>'+treeEditText+''+treeDelText+'</a></li>');
				}
				
				
				if((key+1) == jsonDataLen){
					$("#Tree_"+val.id).addClass("treeLiLast");
					$("#Tree_"+val.id).find(".treeClose").addClass("treeCloseLast");
				}

				if(val.children){
					createTree(val.children, val.id);
					if(val.open){
						$("#TreeUl_"+fid).find('ul').hide();
					}else{
						$("#TreeUl_"+fid).find('ul').show();
					}
					$("#TreeA_"+val.id).find("img").attr("src", folderUnfoldImg);
				}else{
					if((key+1) == jsonDataLen){
						$("#Tree_"+val.id).find(".treeClose").addClass("treeJoinLast");
					}else{
						$("#Tree_"+val.id).find(".treeClose").addClass("treeJoinMid");
					}
					$("#TreeA_"+val.id).find("img").attr("src", fileImg);
				}
			});
		};

		
		//修改节点的标识符
		function reloadTree(){
			var selfUl = _self.find("ul");
			selfUl.each(function(){
				if($(this).html() == ""){
					$(this).parent("li").find(".treeClose").addClass("treeJoinMid");
				}

				//$(this).find("li:last").find("ul").css("background","none");

			});
		}
		
		//var categoryJson = eval('({"category":[{"id":"4","fid":"1","name":"大家电","link":"http://www.3.com"},{"id":"5","fid":"1","name":"生活电器","link":"http://www.4.com"},{"id":"1","fid":"0","name":"家用电器"},{"id":"2","fid":"0","name":"服饰","link":"http://www.2.com"},{"id":"3","fid":"0","name":"化妆","link":"http://www.2.com"},{"id":"7","fid":"4","name":"空调","link":"http://www.5.com"},{"id":"8","fid":"4","name":"冰箱","link":"http://www.6.com"},{"id":"9","fid":"4","name":"洗衣机","link":"http://www.6.com"},{"id":"10","fid":"4","name":"热水器","link":"http://www.7.com"},{"id":"11","fid":"3","name":"面部护理","link":"http://www.8.com"},{"id":"12","fid":"3","name":"口腔护理","link":"http://www.9.com"},{"id":"13","fid":"2","name":"男装","link":"http://www.10.com"},{"id":"14","fid":"2","name":"女装","link":"http://www.10.com"},{"id":"15","fid":"7","name":"海尔空调","link":"http://www.11.com"},{"id":"16","fid":"7","name":"美的空调","link":"http://www.12.com"},{"id":"19","fid":"5","name":"加湿器","link":"http://www.13.com"},{"id":"20","fid":"5","name":"电熨斗","link":"http://www.14.com"}]})');
		//var data = transData(categoryJson.category);


		var categoryJsonDemo = [
			{"id":1,"fid":0,"name":"家用电器"},
			{"id":2,"fid":0,"name":"服饰","links":"http://www.2.com"},
			{"id":3,"fid":0,"name":"化妆","links":"http://www.2.com"},
			{"id":4,"fid":1,"name":"大家电","links":"http://www.3.com"},
			{"id":5,"fid":1,"name":"生活电器","links":"http://www.4.com"},
			//{"id":7,"fid":4,"name":"空调","links":"http://www.5.com", "folderImg":"images/icons/1_open.png", "folderUnfoldImg":"images/icons/1_close.png",},
			{"id":8,"fid":4,"name":"冰箱","links":"http://www.6.com"},
			{"id":9,"fid":4,"name":"洗衣机","links":"http://www.6.com"},
			{"id":10,"fid":4,"name":"热水器","links":"http://www.7.com"},
			{"id":11,"fid":3,"name":"面部护理","links":"http://www.8.com"},
			{"id":12,"fid":3,"name":"口腔护理","links":"http://www.9.com"},
			//{"id":23,"fid":3,"name":"文字内容自定义","innerText":"<b>自定义</b><font color='red'>文字</font>"},
			{"id":13,"fid":2,"name":"男装","links":"http://www.10.com"},
			{"id":14,"fid":2,"name":"女装","links":"http://www.10.com"},
			//{"id":15,"fid":7,"name":"海尔空调","links":"http://www.11.com", "fileImg": "images/icons/5.png"},
			//{"id":16,"fid":7,"name":"美的空调","links":"http://www.12.com", "fileImg": "images/icons/5.png"},
			{"id":22,"fid":7,"name":"右键菜单","rightMenu": true},
			{"id":19,"fid":5,"name":"加湿器","links":"http://www.13.com"},
			{"id":20,"fid":5,"name":"电熨斗","links":"http://www.14.com"},
			{"id":21,"fid":0,"name":"大家电","links":"http://www.3.com"},
			{"id":24,"fid":2,"name":"女装","links":"http://www.10.com"},
			//{"id":25,"fid":7,"name":"海尔空调","links":"http://www.11.com", "fileImg": "images/icons/6.png"},
			//{"id":26,"fid":7,"name":"美的空调","links":"http://www.12.com", "fileImg": "images/icons/7.png"},
			{"id":27,"fid":2,"name":"女装","links":"http://www.10.com"},
			//{"id":28,"fid":7,"name":"海尔空调","links":"http://www.11.com", "fileImg": "images/icons/8.png"},
			//{"id":29,"fid":7,"name":"美的空调","links":"http://www.12.com", "fileImg": "images/icons/9.png"},
			{"id":30,"fid":4,"name":"可编辑","editBtnShow":true},
			{"id":31,"fid":4,"name":"可删除","delBtnShow":true},
			//{"id":32,"fid":4,"name":"可编辑和删除","editBtnShow":true, "delBtnShow":true}
		];

		var categoryJson = [
			{"id":1,"fid":0, "name":"家用电器", 'open': true},
			{"id":2,"fid":0, "name":"服饰", 'open': true},
			{"id":3,"fid":0, "name":"化妆", 'open': true},
			{"id":4,"fid":1, "name":"大家电"},
			{"id":5,"fid":1, "name":"生活电器"},
			{"id":8,"fid":4, "name":"冰箱"},
			{"id":9,"fid":4, "name":"洗衣机"},
			{"id":10,"fid":4, "name":"热水器"},
			{"id":11,"fid":3, "name":"面部护理"},
			{"id":12,"fid":3, "name":"口腔护理"},
			{"id":13,"fid":2, "name":"男装"},
			{"id":14,"fid":2, "name":"女装"},
			{"id":22,"fid":7, "name":"右键菜单"},
			{"id":19,"fid":5, "name":"加湿器"},
			{"id":20,"fid":5, "name":"电熨斗"},
			{"id":21,"fid":0, "name":"大家电", 'open': true},
			{"id":24,"fid":2, "name":"女装"},
			{"id":27,"fid":2, "name":"女装"},
		];

		var data = transData(categoryJson);
		
		var dataFidArr = [];
		$.each(data, function(key,val){
			dataFidArr.push(val.fid);
		});
		dataFidArr.sort();
		createTree(data, dataFidArr[0]);

		_self.find('li').show();

		opt.initCallback(_self);

		_self.find(".treeA").live("click",function(){
			_self.find(".treeA").removeClass('treeAClick');
			$(this).addClass('treeAClick');
			opt.clickCallback($(this));
		});
		
		//折叠展开按钮
		_self.find(".treeClose").live("click",function(){
			if($(this).hasClass("treeCloseSingle")){
				$(this).toggleClass("treeOpenSingle");
			}else if($(this).hasClass("treeCloseLast")){
				$(this).toggleClass("treeOpenLast");
			}else{
				$(this).toggleClass("treeOpen");
			}


			var thisId = $(this).parent().attr("id");
				thisAId = thisId.substring(thisId.lastIndexOf("_"));
			
			var folderUnfoldImg = opt.folderUnfoldImg;
			var thisImg = $("#TreeA"+thisAId).find("img");

			var parentLi = $(this).parent("li");
			var liId = parentLi.attr("id");
			liId = liId.substring(thisId.lastIndexOf("_"));

			


			if($("#TreeUl"+liId).is(":hidden")){
				thisImg.attr("src", thisImg.attr("folderUnfoldImg"));
			}else{
				thisImg.attr("src", thisImg.attr("folderImg"));
			}
			$("#TreeUl"+liId).slideToggle(300);
		});

	
		//选择按钮
		_self.find(".treeCheckbox").live("click",function(e){
			e.stopPropagation();
			var parentLi = $(this).parent().parent();
			$(this).removeClass("treeCheckboxIncomplete");
			if($(this).hasClass("treeCheckboxClick")){
				parentLi.find(".treeCheckbox").removeClass("treeCheckboxClick");
			}else{
				parentLi.find(".treeCheckbox").addClass("treeCheckboxClick");
			}

			var parentLiS = parentLi.parents("li");
			
			parentLiS.each(function(){
				var isAllChecked = 0;
				var thistreeCheckbox = $(this).find("ul").find('.treeCheckbox');
				thistreeCheckbox.each(function(){
					if($(this).hasClass("treeCheckboxClick")){
						isAllChecked++;
					}
				});

				var thisId = $(this).attr("id");
					thisAId = thisId.substring(thisId.lastIndexOf("_"));

				$("#TreeA"+thisAId).find(".treeCheckbox").removeClass("treeCheckboxClick treeCheckboxIncomplete");
				if(isAllChecked == thistreeCheckbox.length){
					$("#TreeA"+thisAId).find(".treeCheckbox").addClass("treeCheckboxClick");
				}else if(isAllChecked > 0){
					$("#TreeA"+thisAId).find(".treeCheckbox").addClass("treeCheckboxIncomplete");
				}
			});
			return false;
		});
		
		//查询关键字
		$("#TreeSearchBtn").live("click", function(){
			_self.find(".treeA").removeClass("selected");
			var keywords = $("#TreeKeywords").val();
			var treeA = _self.find(".treeA");

			var toTop = 0;
			var firstEle = 0;
			
			console.log(treeA);
			treeA.each(function(i){
				var thisHtml = $(this).find("span").html();
				if(thisHtml == keywords){
					
					var thisId = $(this).attr("id");
					thisId = thisId.substring(thisId.lastIndexOf("_")+1);
					
					//父级节点展开
					chainShow(thisId);

					$(this).addClass("selected");
					if(firstEle == 0){
						toTop = $(this).offset().top - _self.offset().top;
						_self.animate({scrollTop: toTop}, 300);
					}
					firstEle++;
				}
			});
			if(firstEle == 0){
				alert("没有相关数据");
			}
		});
		
		//父级节点展开
		function chainShow(id){
			var thisUl = $("#Tree_"+id).parent();
			$("#Node_"+id).removeClass("treeOpen");
			if(thisUl.is("ul")){
				thisUl.show();
				var thisId = thisUl.attr("id");
				thisId = thisId.substring(thisId.lastIndexOf("_")+1);
				chainShow(thisId);
			}else{
				return false;
			}
		}

		
		//编辑按钮
		_self.find(".treeEdit").live("click",function(){
			var thisId = $(this).parent().attr("id");
			thisId = thisId.substring(thisId.lastIndexOf("_")+1);

			var thisA = $(this).parent();
			var thisSpanText = thisA.find("span").html();
			thisA.after('<input type="text" class="treeEditInput" id="TreeEditInput_'+thisId+'" value="'+thisSpanText+'"/><input type="button" class="treeSave" id="TreeSave_'+thisId+'"/>');
			thisA.find("span").hide();
			thisA.find(".treeEdit").hide();
			thisA.find(".treeDel").hide();
		});

		//编辑按钮
		_self.find(".treeSave").live("click",function(){
			var thisId = $(this).attr("id");
			thisId = thisId.substring(thisId.lastIndexOf("_")+1);

			var thisA = $("#TreeA_"+thisId);

			var thisName = $("#TreeEditInput_"+thisId).val();

			thisA.find("span").html(thisName);

			thisA.find("span").show();
			$("#TreeEditInput_"+thisId).remove();
			$(this).remove();

			//修改后的操作
			opt.editCallBack(thisId, thisName);

			//重新绑定划入划出事件
			_self.find(".treeA").bind("mouseenter",function(){
				if($(this).find("span").is(":hidden")){
					return false;
				}
				$(this).find(".treeEdit").show();
				$(this).find(".treeDel").show();
			});

			_self.find(".treeA").bind("mouseleave",function(){
				if($(this).find("span").is(":hidden")){
					return false;
				}
				$(this).find(".treeEdit").hide();
				$(this).find(".treeDel").hide();
			});
		});


		//删除按钮
		_self.find(".treeDel").live("click",function(){
			var thisId = $(this).parent().attr("id");
			thisId = thisId.substring(thisId.lastIndexOf("_")+1);

			if(win.confirm("确定要删除此节点及它下面的所有子节点？")){
				opt.delCallBack(thisId);
			}
		});


		_self.find("li a").mousedown(function(e){
			if(opt.dragNode == true){
				e.stopPropagation();

				_self.append('<div class="mousemove" style="position:absolute; display:none; width:200px; border:1px solid #ddd; height:24px; background:#eee;" ></div><div class="mousemoveIcon" style="position:absolute; display:none; width:16px; height:16px; background:url(images/tree/arrow_right.gif);" ></div>');
				
				var drag = true;
				var initEle = $(e.target).closest(".tree li");
				var thisId = initEle.attr("id");
				thisId = thisId.substring(thisId.lastIndexOf("_")+1);

				$(".mousemove").html($("#TreeA_"+thisId).html());
				$(".mousemove").show();

				$(document).mousemove(function(e){
					if(drag == true){
						win.getSelection ? win.getSelection().removeAllRanges() : document.selection.empty(); //禁止拖放对象文本被选择的方法
						initEle.hide();
						if($(e.target).closest(".tree li").is("li")){
							$(".mousemove").css({"left":e.pageX - _self.offset().left + 10, "top":e.pageY - _self.offset().top + _self.scrollTop() + 10});

							var thisAOffset = $(e.target).closest(".tree li").offset();

							$(".mousemoveIcon").css({"left":thisAOffset.left - _self.offset().left + 10, "top":thisAOffset.top - _self.offset().top + _self.scrollTop()}).show();

						}
					}
					return false;
				});

				$(document).mouseup(function(e){
					
					if(drag == true){
						var targetLi = $(e.target).closest(".tree li");
						var thisId = targetLi.attr("id");
							thisId = thisId.substring(thisId.lastIndexOf("_")+1);


						if(targetLi.find("ul").length <= 0){
							
							targetLi.find(".treeClose").removeClass("treeJoinLast treeJoinMid");

							//判断是不是最后的元素
							if(isLast(thisId)){
								targetLi.find(".treeClose").addClass("treeCloseLast");
								targetLi.addClass("treeLiLast");
							}else{
								targetLi.find(".treeClose").addClass("treeClose");
							}


							targetLi.append('<ul id="TreeUl_'+thisId+'"></ul>');
						}

						$("#TreeUl_"+thisId).append(initEle);
						initEle.find(".treeClose").addClass("treeJoinLast");
						initEle.siblings().find(".treeClose").removeClass("treeJoinLast");
						initEle.show();

						$(".mousemove").remove();
						$(".mousemoveIcon").remove();
					}

					drag = false;
					
				});

			}
		});
		//判断当前的li是不是最后一个
		function isLast(id){
			var thisUl = $("#Tree_"+id).parent();
			var thisLis = thisUl.find("li");

			if(thisLis.length == thisLis.index($("#Tree_"+id))+1){
				return true;
			}else{
				return false;
			}
		}
		


		//右键显示菜单
		$(document).mousedown(function(e){
			if($(e.target).closest(".treeARightMenu").is("a")){
				if(e.which == 3){
					$(document).bind("contextmenu.right", function(){
						return false; 
					});
					e.stopPropagation();
					var treeRightMenu = _self.find('.treeRightMenu');
					var thisTreeA = $(e.target).closest(".treeA");
					var _left = thisTreeA.offset().left - _self.offset().left + 44;
					var _top = thisTreeA.offset().top - _self.offset().top + _self.scrollTop() + thisTreeA.outerHeight();
					
					treeRightMenu.css({'left': _left,'top': _top});
					treeRightMenu.show();

					var treeRightMenuShadow = _self.find('.treeRightMenuShadow');
					treeRightMenuShadow.css({"width": treeRightMenu.outerWidth(), "height": treeRightMenu.outerHeight(), 'left': _left, 'top': _top});

					return false;
				}
			}else{
				_self.find('.treeRightMenu').hide();
				_self.find('.treeRightMenuShadow').hide();
				$(document).unbind('.right');
			}
		})

//		_self.find(".treeA").live("hover", function(){
//			var thisATop = $(this).offset().top;
//			_self.find(".treeHover").css("top", thisATop);
//		});
//
//		_self.find(".treeA").live("mouseleaver", function(){
//			var thisATop = $(this).offset().top;
//			_self.find(".treeHover").css("top", "-100px");
//		});
//
//
//		_self.find(".treeA").live("click", function(){
//			var thisATop = $(this).offset().top;
//			_self.find(".treeClick").css("top", thisATop);
//		});

		reloadTree();
	};
}(this, jQuery);