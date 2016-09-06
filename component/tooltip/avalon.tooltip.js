define(['avalon',  'text!./avalon.tooltip.html', 'css!./avalon.tooltip.css','../base/normalThings'], function(avalon, template) {
	var _interface = function () {};
	avalon.component("aoyou:tooltip", {
		//外部标签属性
        fromtarget:'tooltip',
		tipshow:false,
		backgroundcolor:"#3d9854",
		color:"#fff",
		content: "",
        usezindex:1,
        showflag:true,//是否激活弹出
        mouseclickout:false,//是否在点击别处时隐藏tooltip
		//对外方法
        showtip: _interface,
		hidetip: _interface,
		toggletip:_interface,
        //内部方法
        mouseleave:true,
        linkobj:null,
        _showToolTip:_interface,
        _addTips:_interface,
        _getMousePos:_interface,
        _getElementPos:_interface,
        _getTextSize:_interface,
        _getViewportSize:_interface,
        getRealtag:_interface,
        _getMaxzindex:function(){
            var children = document.body.children,
                maxIndex = 10, //当body子元素都未设置zIndex时，默认取10
                zIndex;
            for (var i = 0, el; el = children[i++];) {
                if (el.nodeType === 1) {
                    zIndex = parseInt(avalon(el).css("z-index"), 10)
                    if (zIndex) {
                        maxIndex = Math.max(maxIndex, zIndex)
                    }
                }
            }
            return maxIndex + 1
        },
		//默认配置
		$template: template,
		$construct: function (hooks, vmOpts, elemOpts) {
			var options = avalon.mix(hooks, vmOpts, elemOpts);
			return options;
		},
		$init: function(vm, elem) {
            vm.getRealtag = function(t){
                if(t.tagName.indexOf('AOYOU') != -1){
                    var _ob = null;
                    var str = t.tagName.toLowerCase().replace(':','-');
                    _ob = avalon.superGetElementeByClass(t,str);
                    if(_ob.length>0){
                        t = _ob[0];
                    }
                }
                return t;
            }
			vm.hidetip = function(){
				elem.childNodes[0].style.display = "none";
			}
			vm.toggletip = function(){
				elem.childNodes[0].style.display == ""?elem.childNodes[0].style.display ="none":elem.childNodes[0].style.display ="";
			}
            if(vm.mouseclickout == true){
                avalon.bind(document.body, 'click', function () {
                    vm.hidetip();
                });
            }
		},
		$ready: function (vm,_elem) {
            vm.usezindex = vm._getMaxzindex();
            var mainElement = avalon.normalGetElementeByClass('main');
            _elem = _elem.childNodes[0];
vm._getViewportSize = { w: (window.innerWidth) ? window.innerWidth : (document.documentElement && document.documentElement.clientWidth) ? document.documentElement.clientWidth : (document.body ? document.body.offsetWidth : 0), h: (window.innerHeight) ? window.innerHeight : (document.documentElement && document.documentElement.clientHeight) ? document.documentElement.clientHeight : (document.body ? document.body.offsetHeight : 0) }
            vm.showtip = function(){
                if(vm.content != undefined && vm.content != ""){
                    var o  = vm.getRealtag(vm.linkobj);
                    vm._showToolTip(_elem,{width:200},o)
                }
            }
            vm._getMousePos = function(ev) {
                if (!ev) {
                    ev = this.getEvent();
                }
                if (ev.pageX || ev.pageY) {
                    return {
                        x: ev.pageX,
                        y: ev.pageY
                    };
                }
                if (document.documentElement && document.documentElement.scrollTop) {
                    return {
                        x: ev.clientX + document.documentElement.scrollLeft - document.documentElement.clientLeft,
                        y: ev.clientY + document.documentElement.scrollTop - document.documentElement.clientTop
                    };
                }
                else if (document.body) {
                    return {
                        x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
                        y: ev.clientY + document.body.scrollTop - document.body.clientTop
                    };
                }
            }
            vm._getTextSize = function(text) {
                var span = document.createElement("span");
                var result = {};
                result.width = span.offsetWidth;
                result.height = span.offsetWidth;
                span.style.visibility = "hidden";
                document.body.appendChild(span);
                if (typeof span.textContent != "undefined")
                    span.textContent = text;
                else span.innerText = text;
                result.width = span.offsetWidth - result.width;
                result.height = span.offsetHeight - result.height;
                span.parentNode.removeChild(span);
                return result;
            }
            vm._addTips = function(tipObj,param) {
                    tipObj = vm.getRealtag(tipObj);
                    tipObj.tip = vm.content;
                    avalon.bind(tipObj, "mouseenter", function (e) {
                        if(vm.content != undefined && vm.content != ""){
                            if(vm.showflag == true){
                                vm._showToolTip(_elem,param, tipObj, e);
                            }
                        }
                    })
                    if(vm.mouseleave){
                        avalon.bind(tipObj, "mouseleave", vm.hidetip);
                    }
            }
            vm._showToolTip = function(el,param, linkObj, e) {
                var ev = e || window.event;
                var mosPos = vm._getMousePos(ev);
                var upMouseLeft = 8, downMouseLeft = 13; //div水平方向在上面/下面偏移鼠标位置
                var div = el;
                var _left,_top;
                if (param && param.width) {//如未设置，默认一行显示
                    if (vm._getTextSize(div.innerHTML).width < param.width) {
                        div.style.maxWidth = param.width + "px";
                    } else {
                        div.style.width = param.width + "px";
                    }

                }
                if(vm.mouseclickout == true){
                    if(avalon.isIE()){
                        ev.cancelBubble = true;
                    }else{
                        ev.stopPropagation();
                    }
                }

                div.style.display = ""; //must before set opr to get offsetHeight...
                avalon.nextTick(function(){//增加延时
                    ///set tooltip position
                    if (linkObj.offsetTop > div.offsetHeight) {
                        _top = linkObj.offsetTop-div.offsetHeight;
                    }
                    else {
                        _top = linkObj.offsetHeight+linkObj.offsetTop;

                    }
                    if (mosPos.x + div.offsetWidth + document.documentElement.clientLeft > vm._getViewportSize.w - 20) {
                        _left = linkObj.offsetLeft - upMouseLeft;
                    } else {
                        _left =  linkObj.offsetLeft + upMouseLeft;
                    }
                    div.style.left = _left +'px';
                    div.style.top = _top +'px';
                });
                ///hide tooltip after some time
                if (param && param.time) {
                    setTimeout(vm.hidetip(), param.time);
                }
            }
             var usetooltipArr = avalon.normalElementSetAttr('tooltip',vm.fromtarget);
            if(usetooltipArr != undefined && usetooltipArr.length>0){
                    vm._addTips(usetooltipArr[0],{ width: 200 });
            }else if(vm.linkobj != null){
                vm._addTips(vm.linkobj,{ width: 200 });
            }
    	}
	});
	var widget = avalon.components["aoyou:tooltip"];
  return avalon
});