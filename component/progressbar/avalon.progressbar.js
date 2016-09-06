define(["avalon", "css!./avalon.progressbar.css"], function(avalon) {
    // 园的半径，边框宽度
    function circleValueList(r, bw) {
        var arr = [],
            r = r - bw,
            arc,
            x,
            y,
            res
        for(var i = 0; i <= 100; i++) {
            arc = Math.PI / 2 - Math.PI / 50 * i
            x = Math.cos(arc) * r + r * 1 + bw * 1
            y = (1 - Math.sin(arc).toFixed(4)) * r + bw * 1
            res = (i ? " L" : "M") + x + " " + y + (i == 100 ? "Z" : "")
            arr.push(res)
        }
        return arr
    }

    var _interface = function () {};
    var barParElement,labelElement,barElement;
    var svgSupport = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect
    var simulateTimer;
    var defaultvalue = 0,defaultindeterminate = true;
    
    var tempstr = '<div ms-if="!circle" class="aoyou-progressbar aoyou-helper-reset aoyou-helper-clearfix aoyou-widget aoyou-widget-content aoyou-progressbar-normal" 	  ms-class-100="aoyou-progressbar-indeterminate:indeterminate"'+
        '	 ms-class-101="aoyou-progressbar-haslabel:label"'+
        '	 ms-class-102="aoyou-progressbar-right:inTwo"'+
        '	 ms-visible="toggle">'+
        '	<div ms-class-100="aoyou-helper-hidden:inTwo" class="aoyou-progressbar-label" ms-if="label">{{labelShower(value, \'l1\') | html}}'+
        '		<b ms-if="!inTwo" class="aoyou-progressbar-arrow"></b>'+
        '	</div>'+
        '	<div class="aoyou-progressbar-bar" ms-css-width="{{_cssMaker()}}">'+
        '		<div class="aoyou-progressbar-label" ms-if="_showLabel(label, inTwo)">{{labelShower(value) | html}}'+
        '		<b ms-if="inTwo" class="aoyou-progressbar-arrow"></b></div>'+
        '		<div class="aoyou-progressbar-overlay" ms-if="_indeterminate()">'+
        '		</div>'+
        '	</div>'+
        '	<div class="aoyou-progressbar-bar aoyou-progressbar-bar-right" ms-if="inTwo" ms-css-width="{{_cssMaker(\'inTwo\')}}">'+
        '		<div class="aoyou-progressbar-label" ms-if="_showLabel(label, inTwo)">'+
        '		<div class="aoyou-progressbar-overlay" ms-if="_indeterminate()">'+
        '		</div>{{labelShower(value, "inTwo") | html}}'+
        '		<b ms-if="inTwo" class="aoyou-progressbar-arrow"></b></div>'+
        '	</div>'+
        '</div>'+
        '<div ms-if="circle" class="aoyou-progressbar aoyou-helper-reset aoyou-helper-clearfix aoyou-widget aoyou-widget-content aoyou-progressbar-circle" ms-class-100="aoyou-progressbar-indeterminate:indeterminate" ms-class-101="aoyou-progressbar-haslabel:label" ms-css-height="circleRadius*2+\'px\'" ms-css-width="circleRadius*2+\'px\'">'+
        '	<div class="aoyou-helper-hidden aoyou-progressbar aoyou-progressbar-circle-par"></div>'+
        '	<div class="aoyou-progressbar-hidden aoyou-progressbar-circle-bar"></div>'+
        '	<svg ms-if="svgSupport"'+
        '	width="100%" '+
        '	height="100%" '+
        '	style="position:absolute;z-index:3;" '+
        '	version="1.1" '+
        '	xmlns="http://www.w3.org/2000/svg">'+
        '		<path ms-attr-d="circleCoordinates" '+
        '		ms-if="circleCoordinates" '+
        '		ms-attr-stroke="circleBorderColor" '+
        '		ms-attr-stroke-width="circleBorderWidth" '+
        '		stroke-linejoin="round" ms-attr-fill="circleColor"></path>'+
        '		<path ms-if="barCoordinates" '+
        '		ms-attr-d="barCoordinates" '+
        '		ms-attr-stroke="circleBarColor" '+
        '		ms-attr-stroke-width="circleBorderWidth" '+
        '		stroke-linejoin="round" '+
        '		fill="none"></path>'+
        '	</svg>'+
        '	<v:arc ms-if="!svgSupport"  '+
        '    filled="false" '+
        '    stroked="true" '+
        '    ms-css-left="circleBorderWidth+\'px\'" '+
        '    ms-css-top="circleBorderWidth+\'px\'" '+
        '    ms-css-height="(circleRadius-circleBorderWidth)*2+\'px\'" '+
        '    ms-css-width="(circleRadius-circleBorderWidth)*2+\'px\'" '+
        '    ms-attr-strokecolor="circleBarColor" '+
        '    ms-attr-strokeweight="circleBorderWidth +\'px\'" '+
        '    style="position:absolute;z-index:3;behavior:url(#default#VML);text-indent:-1000px;overflow:hidden;" '+
        '    startangle="0" '+
        '    ms-attr-endangle="angel">'+
        '	</v:arc>'+
        '   	<v:oval ms-if="!svgSupport"  '+
        '	stroked="true" '+
        '    ms-css-left="circleBorderWidth+\'px\'" '+
        '    ms-css-top="circleBorderWidth+\'px\'" '+
        '	ms-css-height="(circleRadius-circleBorderWidth)*2+\'px\'" '+
        '	ms-css-width="(circleRadius-circleBorderWidth)*2+\'px\'" '+
        '	ms-attr-fillcolor="circleColor" '+
        '	ms-attr-strokecolor="circleBorderColor" '+
        '	ms-attr-strokeweight="circleBorderWidth+\'px\'" '+
        '	style="position:absolute;z-index:2;behavior:url(#default#VML);"></v:oval>'+
        '    <div class="aoyou-progressbar-label"'+
        '	ms-css-line-height="circleRadius*2-4+\'px\'" '+
        '    ms-if="label">{{labelShower(value) | html}}</div>'+
        '</div>';

    avalon.component("aoyou:progressbar", {
        //外部标签属性
        toggle: true, //@config 组件是否显示，可以通过设置为false来隐藏组件
        value: false, //@config 当前进度值 0 - 100 or false
        label: true, //@config 是否在进度条上显示进度数字提示
        simulate: false, //@config 是否模拟进度条效果，默认为否，模拟的时候需要调用触发告知完成，模拟会采用模拟函数及算子进行模拟，取值为int表示动画效果间隔ms数
        indeterminate: false, //@config 是否不确定当前进度，现在loading效果
        countDown: false,//@config 倒计时
        inTwo: false, //@config 是否显示左右两段
        circle: false,//@config 圆形
        circleColor: "#ffffff",//@config 圆形填充色彩，可以配制为从皮肤中提取，只在初始化的时候提取
        circleBorderColor: "#dedede",//@config 圆形边框颜色，，可以配制为从皮肤中提取，只在初始化的时候提取
        circleBarColor: "#619FE8",//@config 圆形进度条边框颜色，可以配制为从皮肤中提取，只在初始化的时候提取
        circleRadius: 38,//@config 圆形的半径，可以配制为从皮肤中提取，只在初始化的时候提取
        circleBorderWidth: 4, //@config 圆形的边框宽度，可以配制为从皮肤中提取，只在初始化的时候提取
        success: false, //@config 是否完成，进度为100时或者外部将success置为true，用于打断模拟效果
        loadingstr:"loading...",
        failedstr:"failed!",
        completestr:"complete!",

        ended:false,
        circleCoordinates:"",
        barCoordinates:"",
        angel:0,
        successValue:100,
        $d:"",
        //@config aoyounit(vm, options, vms) 完成初始化之后的回调,call as element's method
        onInit: _interface,
        //@config simulater(value, vm) 模拟进度进行效果函数，参数为当前进度和vm，默认return value + 5 * Math.random() >> 0
        simulater:_interface,
        //@config getTemplate(tmp, opts) 用于修改模板的接口，默认不做修改
        //@config onChange(value) value发生变化回调，this指向vm
        onChange: _interface,
        //@config onComplete() 完成回调，默认空函数，this指向vm
        onComplete: _interface,
        //@config labelShower(value, isContainerLabel) 用于格式化进度条上label显示文字，默认value为false显示“loading…”，完成显示“complete!”，失败显示“failed!”，第二个参数是是否是居中显示的label，两段显示的时候，默认将这个label内容置空，只显示两边的label,this指向vm
        labelShower: _interface,
        circleBar:_interface,
        getLeft:_interface,
        _simulater:_interface,
        $remove:_interface,
        _cssMaker:_interface,
        _showLabel:_interface,
        _indeterminate:_interface,
        start:_interface,
        end:_interface,
        reset:_interface,
        progress:_interface,
        $template: tempstr,
        $init: function(vm, elem) {

            defaultvalue = vm.value;
            defaultindeterminate = vm.indeterminate;

            if (typeof vm.onInit === "function") {
                //vm.onInit(elem, vm, options, vms)
                vm.onInit.call(vm)
            }
            //跳步
            vm.simulater = function(i) {
                if(vm.countDown) return i - 5 * Math.random() >> 0
                return i + 5 * Math.random() >> 0
            }
            //进度条上方label显示的文字
            vm.labelShower = function(value, l1) {
                var value = l1 == "inTwo" ? 100 - (value || 0) : value
                var successValue = vm ? vm.successValue : 100
                if(l1 == "l1" && vm.inTwo) return ""
                if(value === false) return vm.loadingstr
                if(value === "failed") return vm.failedstr
                if(value == successValue) return vm.completestr
                return value + "%"
            }

            // 适用svg绘制圆圈的v生成方式
            // vml不走这个逻辑，有直接绘制圆弧的方法
            vm.circleBar = function(v) {
                if(vm.circle || !svgSupport) {
                    var v = v || vm.value || 0
                    v = v > 100 ? 100 : v > 0 ? v : 0
                    vm.barCoordinates = v == 100 ? vm.circleCoordinates : vm.$d.slice(0, v+1).join("") + (v < 100 && v ? "" : "Z")
                }
            }
            // 计算label tip的位置  并实现跳转
            vm.getLeft = function() {
                if(vm.circle || !labelElement || vm.inTwo) return
                var bw = barElement && barElement.offsetWidth || 0,
                    lw = labelElement.offsetWidth || 0,
                    bpw = barParElement && barParElement.offsetWidth || 0,
                    res = bpw - bw > lw + 2 ? bw - lw / 2 + 2 : bpw - lw
                res = res > 0 ? res : 0
                if(vm.value == 100){
                    res =  bpw - 2*lw+2;
                }
                labelElement.style.left =  res + 'px'
            }
            // 设置bar元素宽度
            vm._cssMaker = function(inTwo) {
                if(vm.value === false && vm.indeterminate || vm.value == 100) return inTwo ? 0 : "100%"
                return inTwo ? 100 - (vm.value || 0) + "%" : (vm.value || 0) + "%"
            }

        },
        $ready: function (vm, elem) {
            if(vm.label) {
                var nodes = elem.getElementsByTagName("div")
                avalon.each(nodes, function(i, item) {
                    var ele = avalon(item)
                    if(vm.circle) {
                        if(ele.hasClass("aoyou-progressbar-circle-par")) {
                            barParElement = ele
                        } else if(ele.hasClass("aoyou-progressbar-circle-bar")) {
                            barElement = ele
                        }
                    } else {
                        if(ele.hasClass("aoyou-progressbar-label")) {
                            labelElement = item
                        } else if(ele.hasClass("aoyou-progressbar-bar")) {
                            barElement = item
                            barParElement = item.parentNode
                        }
                    }
                })
            }

            // 进度条模拟
            vm._simulater = function() {
                if(vm.simulate !== false && !vm.indeterminate) {
                    clearTimeout(simulateTimer)
                    simulateTimer = setTimeout(function() {
                        if(vm.success || vm.ended || vm.indeterminate) return clearTimeout(simulateTimer)
                        var v = vm.simulater(vm.value || 0, vm)
                        if(vm.success) {
                            v = vm.successValue
                            vm.value =  v
                            return
                        }
                        if(vm.ended) return
                        if(vm.countDown) {
                            if(v <= 0) return
                        } else {
                            if(v >= 100){
                                vm.value =  100;
                                return;
                            }
                        }
                        vm.value =  v
                        simulateTimer = setTimeout(arguments.callee, vm.simulate)
                    }, vm.simulate)
                }
            }


            vm.$d = svgSupport && vm.circle && circleValueList(vm.circleRadius, vm.circleBorderWidth) || []
            vm.circleBar()
            vm.circleCoordinates = vm.$d.join("")
            // 开启模拟效果
            vm._simulater()



            vm.$remove = function() {
                elem.innerHTML = elem.textContent = ""
            }

            // 不知当前进度
            vm._indeterminate = function() {
                return vm.indeterminate && vm.value == false && !vm.inTwo
            }
            // 进度条分成左右两段显示的时候是否显示label
            vm._showLabel = function(label, inTwo) {
                return label && inTwo
            }
         

            //@interface start() 开始进度推进，该接口适用于模拟进度条
            vm.start = function() {
                vm.indeterminate = false
                vm.ended = false
                vm._simulater()
            }

            //@interface end(value) 结束进度推进，该接口适用于模拟进度条，value为100表示结束，failed表示失败，undefine等于pause，其他则终止于value，并在label上显示
            vm.end = function(value) {
                clearTimeout(simulateTimer)
                vm.ended = true
                if(value != void 0) vm.value = value
            }

            //@interface reset(value) 重置设置项，参数可选，为需要重设的值
            vm.reset = function(value) {
                var obj = {}
                avalon.mix(obj, {
                    value: value != void 0 ? value : defaultvalue
                    , indeterminate: defaultindeterminate
                    , success: false
                })
                avalon.mix(vm, obj)
                vm.ended = false
                vm.successValue = vm.countDown ? 0 : 100
                vm.value = vm.countDown ? 100 : vm.value
                vm._simulater()
            }

            //@interface progress(value) 设置value值，其实也可以直接设置vm.value
            vm.progress = function(value) {
                vm.value = value
            }
            vm.$watch("success", function(newValue) {
                if(newValue && vm.simulate) vm.value = vm.successValue
                if(newValue) vm.onComplete.call(vm)
            });
            vm.$watch("value", function(newValue) {
                if(newValue == vm.successValue) vm.success = true
                vm.circle && vm.circleBar()
                vm.getLeft()
                vm.angel = 360 * newValue / 100
                vm.onChange && vm.onChange.call(vm, newValue)
            });

        }
    });
})