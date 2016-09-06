define(['avalon','css!./avalon.slider.css','../draggable/avalon.draggable'], function(avalon) {
    var _interface = function () {};var Handlers = [],handlers = [],FocusElement,Index=0;
    var tempstr = '<div class="aoyou-slider aoyou-widget aoyou-corner-all"'+
        '     ms-class-1 = "aoyou-slider-horizontal: orientation===\'horizontal\'"'+
        '     ms-class-2 = "aoyou-slider-vertical: orientation !== \'horizontal\'"'+
        '     ms-class-3="aoyou-state-disabled: disabled">'+
        '    <div class="aoyou-slider-range aoyou-widget-header aoyou-corner-all"'+
        '         ms-class-1 = "aoyou-slider-range-min:range===\'min\'"'+
        '         ms-class-2 = "aoyou-slider-range-max:range===\'max\'"'+
        '         ms-css-width = "{{range === \'max\' ? 100-percent : percent}}%"'+
        '         ms-css-left = "{{ $twohandlebars ? percent0 : \'auto\'}}%"'+
        '         ms-if = "range"'+
        '         style="width: 100%;">'+
        '    </div>'+
        '    <b  class="aoyou-slider-handle  aoyou-corner-all hander___flag"'+
        '        ms-css-left = "{{percent}}%"'+
        '        ms-data-axis = "$axis"'+
        '        ms-draggable'+
        '        data-draggable-start="dragstart"'+
        '        data-draggable-stop="dragend"'+
        '        data-draggable-drag="drag"'+
        '        data-draggable-containment="parent"'+
        '        ms-hover="aoyou-state-hover"'+
        '        ms-if = "!$twohandlebars"'+
        '    ></b>'+
        '    <b  class="aoyou-slider-handle  aoyou-corner-all"'+
        '        ms-css-left = "{{percent0}}%"'+
        '        ms-data-axis = "$axis"'+
        '        ms-draggable'+
        '        data-draggable-start="dragstart"'+
        '        data-draggable-stop="dragend"'+
        '        data-draggable-drag="drag"'+
        '        data-draggable-containment="parent"'+
        '        ms-hover="aoyou-state-hover"'+
        '        ms-if = "$twohandlebars"'+
        '    ></b>'+
        '    <b  class="aoyou-slider-handle  aoyou-corner-all"'+
        '        ms-css-left = "{{percent1}}%"'+
        '        ms-data-axis = "$axis"'+
        '        ms-draggable'+
        '        data-draggable-start="dragstart"'+
        '        data-draggable-stop="dragend"'+
        '        data-draggable-drag="drag"'+
        '        data-draggable-containment="parent"'+
        '        ms-hover="aoyou-state-hover"'+
        '        ms-if = "$twohandlebars"'+
        '    ></b>'+
        '</div>';

    avalon.component("aoyou:slider", {
        //外部标签属性
        width: -1,
        orientation: "horizontal", //@config 组件是水平拖动还是垂直拖动，垂直是“vertical”
        /**
         * @config 滑块是否显示滑动范围，配置值可以是true、min、max
         <p>true: 显示滑动范围</p>
         <p>min: 滑块值最小的一端固定</p>
         <p>max: 滑块值最大的一端固定</p>
         */
        range: 'min',
        step: 1, //@config 滑块滑动的步值
        value: 0, //@config 滑块的当前值，当range为true时，value是滑块范围表示的两个值，以“,”分隔
        values: null, //@config 当range为true时，values数组需要有两个值，表示滑块范围
        disabled: false, //@config 是否禁用滑块, 设为true时滑块禁用

        _dragEnd : false,
        percent : "0%",
        percent0:0,
        percent1:0,
        $axis:"x",
        $valueMin:"",
        $valueMax:'',
        $twohandlebars:false,
        onDragStart:_interface,
        onDrag:_interface,
        onDragEnd:_interface,
        correctValue:_interface,
        value2Percent:_interface,
        percent2Value:_interface,
        title: '',
        horiheight:'8px',  //灰色基底的水平高度
        $pixelTotal : 0,
        orix:'',
        dragstart:_interface,
        dragend:_interface,
        drag:_interface,
        dragCaculate:_interface,
        $template: tempstr,
        $init: function(vm, elem) {
            vm.correctValue = function(val) {
                var step = (vm.step > 0) ? vm.step : 1
                var stepLength
                try {
                    stepLength = step.toString().split(".")[1].length
                }
                catch (e) {
                    stepLength = 0
                }

                //console.log(val);
                var m = Math.pow(10, stepLength)
                var valModStep = (Number(val)-vm.$valueMin) * m % step * m
                var n = (Number(val)-Number(vm.$valueMin)) / step
                val = (Number(vm.$valueMin * m) + Number(valModStep * 2 >= step ? step * m * Math.ceil(n) : step * m * Math.floor(n))) / m
                //console.log("a:"+vm.$valueMin+"b"+Number(val)+"vm.$valueMin"+(Number(val)- Number(vm.$valueMin))+"final:"+val);
                return val
            }

            var isHorizontal = vm.orientation == "horizontal";
            //将整个slider划分为N等分, 比如100, 227
            var valueMin = vm.$valueMin
            var valueMax = vm.$valueMax
            var oRange = vm.range //true min max， 默认为false
            var values = vm.values
            var twohandlebars = oRange == true
            var value = Number(vm.value) //第几等份
            if (isNaN(value)) {
                var valVM = avalon.getModel(vm.value, vmodels);
                if (valVM) {
                    value = valVM[1][valVM[0]];
                }
            }
            // 固定最小的一边
            if (oRange === "min" && values) {
                value = values[0]
            } else if (oRange === "max" && values) { // 固定最大的一边
                value = values[1]
            }
            // 如果没有配置value和values,且range是min或者max，重置value
            if (!value && oRange === "min" && !values && value !== 0) {
                value =  valueMin || value;
            } else if (!value && oRange === 'max' && !values && value !== 0) {
                value = valueMax || value;
            }
            if (vm.step !== 1 && !/\D/.test(vm.step)) {
                value = vm.correctValue(value);
            }
            // 如果滑动块有双手柄，重置values
            if (twohandlebars) {
                if (Array.isArray(values)) {
                    values = values.length === 1 ? [values[0], values[0]] : values.concat()
                } else {
                    values = [valueMin, valueMax]
                }
            }


            vm.step = (vm.step > 0) ? vm.step : 1;

            vm.value = twohandlebars ? values.join() : value;
            vm.values = values;
            vm.$axis = isHorizontal ? "x" : "y";
            vm.$valueMin = valueMin;
            vm.$valueMax = valueMax;
            vm.$twohandlebars = twohandlebars;
            vm.$pixelTotal = 0;


            vm.value2Percent = function(val) { // 将value值转换为百分比
                if (val < vm.$valueMin) {
                    val = vm.$valueMin
                }
                if (val > vm.$valueMax) {
                    val = vm.$valueMax
                }
                return parseFloat(((val-vm.$valueMin) / (vm.$valueMax-vm.$valueMin) * 100).toFixed(5))
            }
            vm.percent2Value = function(percent) {//0~1
                var val = (vm.$valueMax-vm.$valueMin) * percent + Number(vm.$valueMin)
                val = vm.correctValue(val);
                return parseFloat(val.toFixed(3))
            }



            vm.percent = twohandlebars ? vm.value2Percent(Number(values[1]) - Number(values[0]) + Number(valueMin)) : vm.value2Percent(value);
            vm.percent0 = twohandlebars ? vm.value2Percent(values[0]) : 0;
            vm.percent1 = twohandlebars ? vm.value2Percent(values[1]) : 0;


            vm.dragstart = function(event, data) {
                vm.$pixelTotal = isHorizontal ? elem.offsetWidth : elem.offsetHeight
                Handlers = handlers;  // 很关键，保证点击的手柄始终在Handlers中，之后就可以通过键盘方向键进行操作
                data.started = !vm.disabled
                data.dragX = data.dragY = false
                Index = handlers.indexOf(data.element)
                data.$element.addClass("aoyou-state-active")
                vm.onDragStart.call(null, event, data);
            }
            vm.drag = function(event, data, keyVal) {
                vm.dragCaculate(event, data, keyVal)
                vm.onDrag(vm, data);
                vm._dragEnd = true;
            }
            vm.dragend = function(event,data){
                data.$element.removeClass("aoyou-state-active")
                vm.onDragEnd(vm, data);
                vm._dragEnd = false;
            }
            vm.$watch("value", function(val) {
                val = vm.correctValue(Number(val) || 0);
                if (!val || val < Number(vm.$valueMin)) {
                    val = 0;
                } else if (val > Number(vm.$valueMax)) {
                    val = vm.$valueMax;
                }
                vm.value = val;
                vm.percent = vm.value2Percent(val)
                
            })
            vm.dragCaculate = function(event, data, keyVal){
                if (isFinite(keyVal)) {
                    var val = keyVal
                } else {
                    var prop = vm.$axis ? "left" : "top"
                    var pixelMouse = data[prop] + parseFloat(data.$element.css("border-top-width"))
                    //如果是垂直时,往上拖,值就越大
                    var percent = (pixelMouse / vm.$pixelTotal) //求出当前handler在slider的位置
                    if (!vm.$axis) { // 垂直滑块，往上拖动时pixelMouse变小，下面才是真正的percent，所以需要调整percent
                        percent = Math.abs(1 - percent)
                    }
                    if (percent > 0.999) {
                        percent = 1
                    }
                    if (percent < 0.001) {
                        percent = 0
                    }
                    val = vm.percent2Value(percent)
                }
                if (twohandlebars) { //水平时，小的0在左边，大的1在右边，垂直时，小的0在下边，大的1在上边
                    if (Index === 0) {
                        var check = vm.values[1]
                        if (val > check) {
                            val = check
                        }
                    } else {
                        check = vm.values[0]
                        if (val < check) {
                            val = check
                        }
                    }
                    vm.values[Index] = val
                    vm["percent" + Index] = vm.value2Percent(val)
                    vm.value = vm.values.join()
                    vm.percent = vm.value2Percent(Number(vm.values[1]) - Number(vm.values[0]) + Number(valueMin))
                } else {
                    vm.value = val
                    vm.percent = vm.value2Percent(val)
                }
            }





        },
        $ready: function (vm, elem) {
            var a = elem.getElementsByTagName("b")
            for (var i = 0, el; el = a[i];i++) {

                if (!vm.$twohandlebars && avalon(el).hasClass("hander___flag")) {
                    handlers.push(el);
                    avalon(el).removeClass("hander___flag")
                    break;
                } else if ( vm.$twohandlebars && !avalon(el).hasClass("hander___flag")) {
                    handlers.push(el);
                }
            }
            //avalon(elem).css({display: "none", height:0, width: 0, padding: 0})
            avalon.scan(elem, [vm].concat(vm))

            avalon(document).bind("click", function(e) { // 当点击slider之外的区域取消选中状态
                e.stopPropagation();
                var el = e.target
                var Index = Handlers.indexOf(el)
                if (Index !== -1) {
                    if (FocusElement) {
                        FocusElement.removeClass("oni-state-focus");
                    }
                    FocusElement = avalon(el).addClass("oni-state-focus")
                } else if (FocusElement) {
                    FocusElement.removeClass("oni-state-focus")
                    FocusElement = null
                }
            })
        }
    });
});

