;(function($){
	$('<span style="margin-left:10px; line-height:30px; color:#DB4701">本报表通常情况下将在每天9：30计算完成!</span>').insertAfter('.crumb h1');
    $.fn.AvatarChart = function(options) {
        var dafaults = {
            width: '',
            height: 312,
            data: ''
        };
        
        var opt = $.extend({}, dafaults, options);
        var _self = $(this);
        var chartCanvasWidth = opt.width || _self.outerWidth();
        var chartCanvasHeight = opt.height || _self.outerHeight();

        _self.append('<canvas class="chartCanvas" id="ChartCanvas" width="'+chartCanvasWidth+'" height="'+chartCanvasHeight+'" style="position:absolute; top:0; left:0;"></canvas>');
        _self.append('<div id="ChartCanvasSVG" width="'+chartCanvasWidth+'" height="'+chartCanvasHeight+'" style="position:absolute; top:0; left:0;"></div>');
        var r = Raphael("ChartCanvasSVG", chartCanvasWidth, chartCanvasHeight);
        _self.append('<div class="chartWrap" style="position:absolute; width:800px; z-index:100"></div>');
        var chartWrap = _self.find('.chartWrap');

        var _data = opt.data;
        var replaceStr = function(str){var reg = /%/g;return str.replace(reg, '_')};
        
        var originX = $('#Chart').offset().left;
        var originY = $('#Chart').offset().top;

        var myCanvas = document.getElementById("ChartCanvas");
        if($.browser.msie && $.browser.version < 9){
        	myCanvas = window.G_vmlCanvasManager.initElement(myCanvas);
        }
        var cvs =  myCanvas.getContext("2d");


        var thisFirst = _data[0];
        var firstIndex = true;
        chartWrap.append('<div class="chartCon leavl_0"><div rate="100" class="chartConText first ChartTitle_'+replaceStr(thisFirst.name)+'" titlename="'+thisFirst.name+'"><span>'+thisFirst.name+'</span></div></div>');

        creatChart(thisFirst.name, 0, 0);
        creatLine(thisFirst.name, 0, 0);
        
        _self.height(_self.find('.chartWrap').outerHeight());

        _self.find('.chartCon div').hover(function(){
            if(!$(this).hasClass('disable')){
                $(this).addClass('hover');
            }
        }, function(){
            $(this).removeClass('hover');
        });

        _self.find('.chartCon div').die().live('click', function(){
            if(!$(this).hasClass('disable')){
                var thisParent = $(this).parent('.chartCon');
                var index = $('.chartCon').index(thisParent);
                var dd = thisParent.find('div').index($(this));
                if(index == 0){
                    offsetY = 26;
                    firstIndex = true;
                }else{
                    offsetY = 20;
                }
                creatChart($(this).find('span').html(), index, dd);
                cvs.clearRect(0, $(this).offset().top + offsetY - originY, 800, 800);
                creatLine($(this).find('span').html(), index, dd);

                _self.find('.chartCon div').hover(function(){
                    if(!$(this).hasClass('disable')){
                        $(this).addClass('hover');
                    }
                }, function(){
                    $(this).removeClass('hover');
                });
                _self.height(_self.find('.chartWrap').outerHeight());
                
            }
        });

        _self.find('.chartConTextTip').die().live('click', function(e){
            firstIndex = true;
            var thisName = $(this).attr('titlename');

            _self.find('.leavl_0 div').removeClass().addClass('chartConText').addClass('first');
            _self.find('.leavl_0 span').html(thisName).attr('titlename', thisName);

            creatChart(thisName, 0, 0);
            cvs.clearRect(0, 0, 800, 800);
            creatLine(thisName, 0);

            _self.find('.chartCon div').hover(function(){
                if(!$(this).hasClass('disable')){
                    $(this).addClass('hover');
                }
            }, function(){
                $(this).removeClass('hover');
            });
            
            _self.height(_self.find('.chartWrap').outerHeight());
            
            $('#BackRoot').show();
            return false;
        });


        function creatChart(fName, leavlIndex, inlineIndex){
            var chartPer = _self.find('.chartPer');
            var chartCon = _self.find('.chartCon');

            var len = chartCon.length;
            if(len > leavlIndex){
                for(var i = len - 1; i > leavlIndex; i--){
                    chartPer.eq(i-1).remove();
                    chartCon.eq(i).remove();
                }
            }

            chartWrap.append('<div class="chartPer"></div><div class="chartCon leavl_'+(leavlIndex+1)+'"></div>');
            $.each(_data, function(k,v){
                if(v.name == fName){
                    var hasNext = false;
                    var thisIndex = false;
                    var thisOutLen = v.reachName.length;
                    var hasPercent = 0;
                    var _left = 0;
                    var thisConLen = 5;
                    if(thisOutLen == 1){
                        _left = 240;
                        thisConLen = 2;
                    }else if(thisOutLen == 2){
                        _left = 160;
                        thisConLen = 3;
                    }if(thisOutLen == 3){
                        _left = 80;
                        thisConLen = 4;
                    }
                    
                    var fRate;

                    $.each(v.reachName, function(k,v){
                        if(k > 3){
                            return false;
                        }
                        fRate = _self.find('.chartCon').eq(leavlIndex).find('.chartConText').eq(inlineIndex).attr('rate');
                        
                        var name = v.name;
                        var percent = v.rate;
                        var _percent = parseFloat(percent);
                        var _thisRate = Math.round(_percent*fRate)/100;
                        hasPercent = hasPercent + _percent;
                        var marginLeft = 0, conMarginLeft = 10, offsetX, offsetY;
                        var noChild = true;
                        $.each(_data, function(k,v){
                        	if(v.name == name){
                        		noChild = false;
                        		return;
                        	}
                        });

                        var disableStr = (name == '离开系统' || leavlIndex == 3 || noChild) ? 'disable' : '';
                        var linkStr = (name != '离开系统' && !noChild) ? '<a href="javascript:;" titlename="'+name+'" class="chartConTextTip" title="设为第一级"></a>' : '';
                        var disableStr1 = (name == '离开系统' || noChild) ? 'disable' : '';

                        if(k == 0){
                            conMarginLeft = conMarginLeft + _left;
                        }
                        
                        _self.find('.chartPer').eq(leavlIndex).append('<div class="chartPerText '+disableStr1+'">'+_thisRate+'%</div>');
                        _self.find('.chartCon').eq(leavlIndex + 1).append('<div rate="'+_thisRate+'" class="chartConText '+disableStr+'" title="点击查看改页面的行为" titlename="'+name+'" style="margin-left:'+conMarginLeft+'px"><span>'+name+'</span>'+linkStr+'</div>');

                        if(k == 0){
                            inlineIndex = inlineIndex || 0;
                            var preLeavlLeft = _self.find('.chartCon').eq(leavlIndex).find('.chartConText').eq(inlineIndex).offset().left - originX;
                            var thisLeavlLeft = _self.find('.chartCon').eq(leavlIndex + 1).find('.chartConText').eq(0).offset().left - originX;

                            var thisOffset = thisLeavlLeft - preLeavlLeft;
                            var orgLeft = preLeavlLeft;
                            if(thisOffset < 0){
                                thisOffset = thisOffset.toString().substring(1);
                                orgLeft = thisLeavlLeft;
                            }

                            var ss =  orgLeft + parseInt(thisOffset)/2 + 48;
                            if(firstIndex){
                                ss = ss + 25;
                                firstIndex = false;
                            }
                            _self.find('.chartPer').eq(leavlIndex).css('padding-left', ss);
                        }
                        if(k == 0 && name == '离开系统'){
	                    	thisIndex = 1;
	                    }
	
	                    if(!hasNext && name != '离开系统' && leavlIndex < 3){
	                        hasNext = true;
	                        creatChart(name, leavlIndex + 1, thisIndex);
	                    }

                    });
                    
                    var otherRate = Math.round((100-hasPercent)*fRate)/100;
                    otherRate = otherRate < 0 ? 0 : otherRate;

                    _self.find('.chartPer').eq(leavlIndex).append('<div class="chartPerText disable">'+otherRate+'%</div>');
                    _self.find('.chartCon').eq(leavlIndex+1).append('<div class="chartConText ChartTitle_other disable" titlename="other"><span>其他</span></div>');
                }
            });
        }

        function creatLine(fName, leavlIndex, dd){
            $.each(_data, function(k,v){
                if(v.name == fName){
                    var hasNext = false;
                    var thisIndex = false;
                    var preTitle;
                    var thisTitle
                    $.each(v.reachName, function(k,v){
                        if(k > 3){
                            return false
                        }
                        var name = v.name;
                        if(leavlIndex == 0){
                            offsetX = 120;
                            offsetY = 26;
                        }else{
                            offsetX = 70;
                            offsetY = 20;
                        }

                        
                        var noChild = true;
                        $.each(_data, function(k,v){
                        	if(v.name == name){
                        		noChild = false;
                        		return;
                        	}
                        });
                        
                        var disableLine = false;
                        
                        if(name == '离开系统' || noChild){
                            disableLine = true;
                        }
                        preTitle = $('.leavl_'+leavlIndex).find('.chartConText');
                        thisTitle = $('.leavl_'+(leavlIndex+1)).find('.chartConText');
                        preTitle.each(function(){
                        	if($(this).attr('titlename') == fName){
                        		preTitle = $(this);
                        		return;
                        	}
                        });
                        
                        thisTitle.each(function(){
                        	if($(this).attr('titlename') == name){
                        		thisTitle = $(this);
                        		return;
                        	}
                        })
                        drawLine(preTitle.offset().left + offsetX - originX, 
                        			preTitle.offset().top + offsetY - originY, 
                        			thisTitle.offset().left + 70- originX, 
                        			thisTitle.offset().top + 20 - originY, 
                                    disableLine
                                );
                        if(k == 0 && name == '离开系统'){
                            thisIndex = 1;
                        }

                        if(!hasNext && name != '离开系统' && leavlIndex < 3){
                            hasNext = true;
                            creatLine(name, leavlIndex + 1, thisIndex);
                        }
                    });
                    drawLine(preTitle.offset().left + offsetX - originX, 
                    		preTitle.offset().top + offsetY - originY, 
                                $('.leavl_'+(leavlIndex+1)).find('.ChartTitle_other').offset().left + 70- originX, 
                                $('.leavl_'+(leavlIndex+1)).find('.ChartTitle_other').offset().top + 20 - originY, 
                                true
                            );
                }else{
                    return
                }
            });
        }

var connection = [];
var a,b;

        function drawLine(sx,sy,ex,ey,disable){
        	if(disable){
            	a = r.path("M"+sx+" "+sy+"L"+ex+" "+ey+"").attr({stroke: 'rgba(200,200,200,1)', fill: "none", "stroke-width": 1});
            }else{
                b = r.path("M"+sx+" "+sy+"L"+ex+" "+ey+"").attr({stroke: 'rgba(105,135,195,.9)', fill: "none", "stroke-width": 1});
            }
        	

            // cvs.fillStyle = 'rgba(255,0,0,.3)';
            // if(disable){
            //     cvs.strokeStyle = 'rgba(200,200,200,1)';
            // }else{
            //     cvs.strokeStyle = 'rgba(105,135,195,.9)';
            // }
            // cvs.lineWidth = 2;
            // cvs.beginPath();
            // cvs.moveTo(sx,sy);
            // cvs.lineTo(ex,ey);
            // cvs.closePath();//可以把这句注释掉再运行比较下不同
            // cvs.stroke();//画线框
            // context.fill();//填充颜色
        }


  //       Raphael.fn.connection = function(obj1, obj2, line, borderWidth, fromY, toY){
		// 	Array.prototype.indexOf = function(b){for(var a=0,c=this.length;a<c;a++)if(this[a]==b)return a;return-1};
		// 	var obj1Id = obj1.id,
		// 		obj2Id = obj2.id;
		// 	if(obj1.$id.attr('strokes')){
		// 		var strokes = obj1.$id.attr('strokes').split(',');
		// 		if(strokes.indexOf(obj2Id) < 0){
		// 			strokes.push(obj2Id);
		// 			obj1.$id.attr('strokes', strokes.join(','));
		// 		}
		// 	}else{
		// 		obj1.$id.attr('strokes', obj2Id);
		// 	}
		// 	if(obj2.$id.attr('strokes')){
		// 		var strokes = obj2.$id.attr('strokes').split(',');
		// 		if(strokes.indexOf(obj1Id) < 0){
		// 			strokes.push(obj1Id);
		// 			obj2.$id.attr('strokes', strokes.join(','));
		// 		}
		// 	}else{
		// 		obj2.$id.attr('strokes', obj1Id);
		// 	}
			
		//     if (obj1.line && obj1.from && obj1.to) {
		//         line = obj1;
		//         obj1 = line.from;
		//         obj2 = line.to;
		//     }
		//     var bb1 = obj1,
		//         bb2 = obj2,
		//         p = [{x: bb1.x + bb1.width / 2, y: bb1.y + 1},
		//         {x: bb1.x + bb1.width / 2, y: bb1.y + fromY + borderWidth/2 + 1},
		//         {x: bb1.x - 1, y: bb1.y + fromY + borderWidth/2 + 1},
		//         {x: bb1.x + bb1.width + 1, y: bb1.y + fromY + borderWidth/2 + 1},
		//         {x: bb2.x + bb2.width / 2, y: bb2.y + 1},
		//         {x: bb2.x + bb2.width / 2, y: bb2.y + toY + borderWidth/2 + 1},
		//         {x: bb2.x - 1, y: bb2.y + toY + borderWidth/2 + 1},
		//         {x: bb2.x + bb2.width + 1, y: bb2.y + toY + borderWidth/2 + 1}],
		//         d = {}, dis = [];
		//     for (var i = 0; i < 4; i++) {
		//         for (var j = 4; j < 8; j++) {
		//             var dx = Math.abs(p[i].x - p[j].x),
		//                 dy = Math.abs(p[i].y - p[j].y);
		//             if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
		//                 dis.push(dx + dy);
		//                 d[dis[dis.length - 1]] = [i, j];
		//             }
		//         }
		//     }
		//     if (dis.length == 0) {
		//         var res = [0, 4];
		//     } else {
		//         res = d[Math.min.apply(Math, dis)];
		//     }
		//     var x1 = p[res[0]].x,
		//         y1 = p[res[0]].y,
		//         x4 = p[res[1]].x,
		//         y4 = p[res[1]].y;
		//     dx = Math.max(Math.abs(x1 - x4) / 2, 10);
		//     dy = Math.max(Math.abs(y1 - y4) / 2, 10);
		//     var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
		//         y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
		//         x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
		//         y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
		//     var path = ["M", x1.toFixed(3)-180, y1.toFixed(3), "C", x2-180, y2, x3-180, y3, x4.toFixed(3)-180, y4.toFixed(3)].join(",");
		//     if (line && line.line) {
		//         // line.bg && line.bg.attr({path: path});
		//         line.line.attr({path: path});
		//     } else {
		//         var color = typeof line == "string" ? line : "#000";
		//         return {
		//             //bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
		//             line: this.path(path).attr({stroke: line, fill: "none", "stroke-width": borderWidth || 3}),
		//             from: obj1Id,
		//             to: obj2Id
		//         };
		//     }
		// };
console.log(a)
a.remove();
		console.log(a)


    }
})(jQuery);