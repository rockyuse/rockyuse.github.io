var replaceStr = function(str){var reg = /%/g;return str.replace(reg, '_')};

;(function($){
    $.fn.AvatarChart = function(options) {
        var dafaults = {
            width: '',
            height: 800,
            cellWidth: 100,
            cellHeight: 40,
            cellNum: 100,
            cellMargin: 5,
            percentWidth: 44,
            data: ''
        };

        var opt = $.extend({}, dafaults, options);
        var isIE = $.browser.msie && $.browser.version < 9;
        
        var dragChart = function(dom){
            var _drag = false, _x, _scrollLeft;
            dom.css('cursor', 'move');
            dom.mousedown(function(e){
                _drag = true;
                _x = e.pageX;
                _scrollLeft = $('#Chart').scrollLeft();
                document.body.setCapture && dom[0].setCapture(); 
                $(document).mousemove(function(e){
                    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                    if(_drag){
                        var x = e.pageX - _x;
                        $('#Chart').scrollLeft(_scrollLeft - x);
                    }
                }).mouseup(function(){
                    _drag = false;
                    document.body.releaseCapture && dom[0].releaseCapture();
                });
            });
        }
        var _self = $(this);
        var _cellNum = 0;

        for(var i = 0; i < opt.data.length; i++){
            if(_cellNum < opt.data[i].reachName.length){
                _cellNum = opt.data[i].reachName.length;
            }
        }

        var cellHeightHalf = (opt.cellHeight - 2) / 2;
        var cellOuterWidth = opt.cellWidth + opt.cellMargin * 2;
        var cellWidthHalf = cellOuterWidth / 2;

        var cellWrapWidth = cellOuterWidth * _cellNum;

        _self.append('<div class="chartWrap" style="position:absolute; width:20000px; z-index:100"></div>');
        _self.append('<canvas class="chartCanvas" id="ChartCanvas" width="16000" height="'+opt.height+'" style="position:absolute; top:0; left:0;"></canvas>');
        var chartWrap = _self.find('.chartWrap');

        var _data = opt.data;
        var replaceStr = function(str){var reg = /%/g;return str.replace(reg, '_')};
        
        var originX = $('#Chart').offset().left;
        var originY = $('#Chart').offset().top;

        var myCanvas = document.getElementById("ChartCanvas");
        if(isIE){
            myCanvas = window.G_vmlCanvasManager.initElement(myCanvas);
        }
        var cvs =  myCanvas.getContext("2d");

        var thisFirst = _data[0];
        var firstIndex = true;
        chartWrap.append('<div class="chartCon leavl_0"><div rate="100" class="chartConText first ChartTitle_'+replaceStr(thisFirst.name)+'" titlename="'+thisFirst.name+'"><div class="moreText" style="width:200px">'+thisFirst.aliasName+'<br/>'+thisFirst.name+'<br/><b class="linkA">查看行为</b></div><p>'+thisFirst.aliasName+'</p><span>'+thisFirst.name+'</span></div></div>');

        creatChart(thisFirst.name, 0, 0);
        creatLine(thisFirst.name, 0, 0);
        
        _self.height(_self.find('.chartWrap').outerHeight() + 80);
        bindHover();

        _self.find('.chartCon .linkA').die().live('click', function(e){
            console.log()
        });

        _self.find('.chartCon .chartConText').die().live('click', function(e){
            $('#ChartCanvasMask').remove();
            _self.find('.chartPerText').removeClass('chartPerTextActive');
            _self.append('<canvas class="chartCanvas" id="ChartCanvasMask" width="16000" height="'+opt.height+'" style="position:absolute; top:0; left:0;"></canvas>');
            var myCanvasMask = document.getElementById("ChartCanvasMask");
            if(isIE){
                myCanvasMask = window.G_vmlCanvasManager.initElement(myCanvasMask);
            }
            var cvsMask =  myCanvasMask.getContext("2d");
            var leavl = $(this).parents('.chartCon');
            leavl = $('#Chart .chartCon').index(leavl);
            
            cvsMaskDraw(cvsMask, leavl, $(this));
            
            if($(e.target).closest('.linkA').length == 0){
                if(!$(this).hasClass('disable') && !$(this).hasClass('lastLeavl')){
                    $(this).parents('.chartCon').find('.chartConText').removeClass('active');
                    $(this).addClass('active');

                    var thisParent = $(this).parent('.chartCon');
                    var index = $('.chartCon').index(thisParent);
                    var dd = thisParent.find('.chartConText').index($(this));
                    if(index == 0){
                        offsetY = cellHeightHalf;
                        firstIndex = true;
                    }else{
                        offsetY = cellHeightHalf;
                    }
                    creatChart($(this).find('span').html(), index, dd, $(this).offset().left - originX + $('#Chart').scrollLeft() + $(this).outerWidth()/2);
                    cvs.clearRect(0, $(this).offset().top + offsetY - originY, 20000, opt.height);

                    if(isIE){
                        creatLineForIE(thisFirst.name, 0, 0, index);
                    }
    
                    creatLine($(this).find('span').html(), index, dd);
                    _self.height(_self.find('.chartWrap').outerHeight() + 80);
                }
                bindHover();
            }
        });

        _self.find('.chartConTextTip').die().live('click', function(e){
            $('#ChartCanvasMask').remove();
            
            firstIndex = true;
            var thisParentCon = $(this).parent('.chartConText');
            var thisName = thisParentCon.attr('titlename');
            var thisText = thisParentCon.html();

            _self.find('.leavl_0 .chartConText').removeClass().addClass('chartConText').addClass('first');
            _self.find('.leavl_0 .chartConText').html(thisText).attr('titlename', thisName);
            _self.find('.leavl_0 .chartConText').find('.moreText').css('width','200px').hide();

            creatChart(thisName, 0, 0);
            cvs.clearRect(0, 0, 20000, opt.height);
            creatLine(thisName, 0);

            _self.height(_self.find('.chartWrap').outerHeight() + 80);
            
            bindHover();
            
            $('#BackRoot').show();
            return false;
        });
        
        dragChart($('#Chart'));
        
        function bindHover(){
            _self.find('.chartCon .chartConText').hover(function(){
                if($(this).find('p').html() != '离开系统'){
                    $(this).find('.moreText').show();
                }
                if(!$(this).hasClass('disable')){
                    $(this).addClass('hover');
                }
            }, function(){
                $(this).find('.moreText').hide();
                $(this).removeClass('hover');
            });
        }
        
        function cvsMaskDraw(cvsMask, leavl, _this, thisIndex){
            var chartCons = $('#Chart .chartCon');
            var chartScrollLeft = $('#Chart').scrollLeft();
            
            var activeCon = [];
            for(var i = 0; i < leavl; i++){
                if(i == 0){
                    activeCon.push(chartCons.eq(i).find('.first'));
                }else{
                    activeCon.push(chartCons.eq(i).find('.active'));
                }
            }
            activeCon.push(_this)
            
            for(var i = 0; i < activeCon.length-1; i++){
                var preTitle = activeCon[i];
                var nextTitle = activeCon[i+1];
                
                var offsetX, offsetY;
                if(i == 0){
                    offsetX = 100;
                }else{
                    offsetX = cellWidthHalf - opt.cellMargin;
                }
                offsetY = cellHeightHalf;
                
                drawLineMask(preTitle.offset().left + offsetX - originX + chartScrollLeft, 
                        preTitle.offset().top + offsetY - originY, 
                        nextTitle.offset().left + cellWidthHalf - originX + chartScrollLeft - opt.cellMargin, 
                        nextTitle.offset().top + cellHeightHalf - originY, 
                        cvsMask
                    );
                
                var thisIndex = nextTitle.parent().find('.chartConText').index(nextTitle);
                $('#Chart .chartPer').eq(i).find('.chartPerText').eq(thisIndex).addClass('chartPerTextActive');
            }
        }

        function creatChart(fName, leavlIndex, inlineIndex, parentDomX){
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

                    if(thisOutLen < 10){
                        var thisConLen = thisOutLen + 1;
                        var _left = (10 - 1  - thisOutLen) * cellWidthHalf + opt.cellMargin;
                        if(parentDomX){
                            var thisConWidth = thisConLen * cellOuterWidth / 2;
                            _left = parentDomX - thisConWidth + opt.cellMargin;
                        }
                        _left = _left < opt.cellMargin ? opt.cellMargin : _left
                    }else if(thisOutLen < _cellNum){
                        var thisConLen = thisOutLen;
                        // var _left = (_cellNum - 1  - thisOutLen) * cellOuterWidth/2 + opt.cellMargin;
                        var _left = opt.cellMargin;

                        if(parentDomX){
                            var thisConWidth = thisConLen * cellOuterWidth / 2;
                            _left = parentDomX - thisConWidth + opt.cellMargin;
                        }
                        _left = _left < opt.cellMargin ? opt.cellMargin : _left
                    }else {
                        var thisConLen = _cellNum;
                        var _left = opt.cellMargin;
                    }


                    var fRate;

                    $.each(v.reachName, function(k,v){
                        if(k > opt.cellNum){
                            return false;
                        }
                        fRate = _self.find('.chartCon').eq(leavlIndex).find('.chartConText').eq(inlineIndex).attr('rate');
                        var name = v.name;
                        var aliasName = v.aliasName;
                        
                        var percent = v.rate;
                        var _percent = parseFloat(percent);
                        var _thisRate = Math.round(_percent*fRate)/100;
                        hasPercent = hasPercent + _percent;
                        var marginLeft = 0, conMarginLeft = opt.cellMargin, offsetX, offsetY;
                        var noChild = true;
                        $.each(_data, function(k,v){
                            if(v.name == name){
                                noChild = false;
                                return;
                            }
                        });

                        var disableStr = (name == '离开系统' || noChild) ? 'disable' : '';
                        var lastStr = leavlIndex == 3 ? 'lastLeavl' : '';
                        var linkStr = (name != '离开系统' && !noChild) ? '<a href="javascript:;" titlename="'+name+'" class="chartConTextTip" title="设为第一级"></a>' : '';
                        var disableStr1 = (name == '离开系统' || noChild) ? 'disable' : '';

                        if(k == 0){
                            conMarginLeft = _left;
                        }
                        
                        _self.find('.chartPer').eq(leavlIndex).append('<div class="chartPerText '+disableStr1+'" style="margin-right:'+(cellWidthHalf - opt.percentWidth) +'px">'+_thisRate+'%</div>');
                        if(name == '离开系统'){
                            _self.find('.chartCon').eq(leavlIndex + 1).append('<div rate="'+_thisRate+'" class="chartConText '+lastStr+' '+disableStr+'" titlename="'+name+'" style="margin-left:'+conMarginLeft+'px"><span></span><p>离开系统</p></div>');
                        }else{
                            _self.find('.chartCon').eq(leavlIndex + 1).append('<div rate="'+_thisRate+'" class="chartConText '+lastStr+' '+disableStr+'" titlename="'+name+'" style="margin-left:'+conMarginLeft+'px"><div class="moreText">'+aliasName+'<br/>'+name+'<br/><b class="linkA">查看行为</b></div><p>'+aliasName+'</p><span>'+name+'</span>'+linkStr+'</div>');
                        }
                        if(k == 0){
                            inlineIndex = inlineIndex || 0;
                            var preLeavlLeft = _self.find('.chartCon').eq(leavlIndex).find('.chartConText').eq(inlineIndex).offset().left - originX + $('#Chart').scrollLeft();
                            var thisLeavlLeft = _self.find('.chartCon').eq(leavlIndex + 1).find('.chartConText').eq(0).offset().left - originX + $('#Chart').scrollLeft();

                            var thisOffset = thisLeavlLeft - preLeavlLeft;
                            var orgLeft = preLeavlLeft;
                            if(thisOffset < 0){
                                thisOffset = thisOffset.toString().substring(1);
                                orgLeft = thisLeavlLeft;
                            }

                            var ss =  orgLeft + parseInt(thisOffset)/2 + cellWidthHalf - opt.percentWidth/2 - opt.cellMargin;
                            if(firstIndex){
                                ss = ss + cellWidthHalf - opt.percentWidth/2 - opt.cellMargin;
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
                    
//                    var otherRate = Math.round((100-hasPercent)*fRate)/100;
//                    otherRate = otherRate < 0 ? 0 : otherRate;
//
//                    _self.find('.chartPer').eq(leavlIndex).append('<div class="chartPerText disable">'+otherRate+'%</div>');
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
                        if(k > 500){
                            return false
                        }
                        var name = v.name;
                        if(leavlIndex == 0){
                            offsetX = 100;
                        }else{
                            offsetX = cellWidthHalf - opt.cellMargin;
                        }
                        offsetY = cellHeightHalf;
                        
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
                        drawLine(preTitle.offset().left + offsetX - originX + $('#Chart').scrollLeft(), 
                                    preTitle.offset().top + offsetY - originY, 
                                    thisTitle.offset().left + cellWidthHalf - originX + $('#Chart').scrollLeft() - opt.cellMargin, 
                                    thisTitle.offset().top + cellHeightHalf - originY, 
                                    disableLine
                                );
                        if(k == 0 && name == '离开系统'){
                            thisIndex = 1;
                        }

                        if(!hasNext && name != '离开系统' && leavlIndex < 3){
                            hasNext = true;

                            thisTitle.addClass('active');
                            creatLine(name, leavlIndex + 1, thisIndex);
                        }
                    });
                }else{
                    return
                }
            });
        }

        function creatLineForIE(fName, leavlIndex, dd, maxLeavl){
            $.each(_data, function(k,v){
                if(v.name == fName){
                    var hasNext = false;
                    var thisIndex = false;
                    var preTitle;
                    var thisTitle
                    $.each(v.reachName, function(k,v){
                        if(k > 500){
                            return false
                        }
                        var name = v.name;
                        if(leavlIndex == 0){
                            offsetX = 100;
                        }else{
                            offsetX = cellWidthHalf - opt.cellMargin;
                        }
                        offsetY = cellHeightHalf;

                        
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
                        drawLine(preTitle.offset().left + offsetX - originX + $('#Chart').scrollLeft(), 
                                    preTitle.offset().top + offsetY - originY, 
                                    thisTitle.offset().left + cellWidthHalf - originX + $('#Chart').scrollLeft() - opt.cellMargin, 
                                    thisTitle.offset().top + cellHeightHalf - originY, 
                                    disableLine
                                );

                        if(thisTitle.hasClass('active')){
                            thisIndex = k;
                            hasNext = true;
                            if(leavlIndex + 1 < maxLeavl){
                                creatLineForIE(name, leavlIndex + 1, thisIndex, maxLeavl);
                            }
                        }
                    });
                }else{
                    return
                }
            });
        }

        function drawLine(sx,sy,ex,ey,disable){
            cvs.fillStyle = 'rgba(255,0,0,.3)';
            if(disable){
                cvs.strokeStyle = 'rgba(200,200,200,1)';
            }else{
                cvs.strokeStyle = 'rgba(105,135,195,.9)';
            }
            cvs.lineWidth = 1;
            cvs.beginPath();
            cvs.moveTo(sx,sy);
            cvs.lineTo(ex,ey);
            cvs.closePath();//可以把这句注释掉再运行比较下不同
            cvs.stroke();//画线框
        }
        
        function drawLineMask(sx,sy,ex,ey,cvsMask){
            cvsMask.fillStyle = 'rgba(184,85,82,.3)';
            cvsMask.strokeStyle = 'rgba(184,85,82,1)';
            cvsMask.lineWidth = 2;
            cvsMask.beginPath();
            cvsMask.moveTo(sx,sy);
            cvsMask.lineTo(ex,ey);
            cvsMask.closePath();
            cvsMask.stroke();
        }
    }
})(jQuery);