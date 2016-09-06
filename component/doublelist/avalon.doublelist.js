/**
 * @cnName doublelist组件
 * @enName doublelist
 * @introduce
 *  <p> 以左右列表形式展示实现的复选组件，不支持ms-duplex，请在onChange回调里面处理类似ms-duplex逻辑</p>
 */
define(["avalon", "css!./avalon.doublelist.css"], function(avalon) {
    var _interface = function () {};
    var tempstr = '<div class="aoyou-doublelist">'+
        '	<div class="aoyou-doublelist-menu" ms-css-width="{{width}}" ms-css-height="{{height}}">'+
        '		<ul ms-each-item="_leftItems">'+
        '			<li'+
        '                ms-class-1="aoyou-state-disabled: item.disabled"'+
        '                ms-class-2="aoyou-state-active: item.active"'+
        '				ms-visible="item.visible"'+
        '				ms-hover="aoyou-state-hover"'+
        '                ms-click="_leftToggleActive($index)" >'+
        '				{{item.name | html}}'+
        '			</li>'+
        '		</ul>'+
        '	</div>'+
        '	<div class="aoyou-doublelist-option">'+
        '		<div class="aoyou-dbl-button" ms-click="_moveToRight()">'+
        '			{{tpl_addBtnText|html}}'+
        '		</div>'+
        '		<div class="aoyou-dbl-button" ms-click="_moveToLeft()">'+
        '			{{tpl_removeBtnText|html}}'+
        '		</div>'+
        '	</div>'+
        '	<div class="aoyou-doublelist-menu" ms-css-width="{{width}}" ms-css-height="{{height}}">'+
        '		<ul ms-each-item="_rightItems">'+
        '            <li'+
        '                ms-class="aoyou-state-active: item.active"'+
        '                ms-visible="item.visible"'+
        '                ms-hover="aoyou-state-hover"'+
        '                ms-click="_rightToggleActive($index)" >'+
        '				{{item.name | html}}'+
        '            </li>'+
        '		</ul>'+
        '	</div>'+
        '	<div class="aoyou-doublelist-move">'+
        ' 		<div class="aoyou-moveup-button" ms-click="_change($event,\'up\')">'+
        '		</div>'+
        '		<div class="aoyou-movedown-button" ms-click="_change($event,\'down\')">'+
        '		</div>'+
        '	</div>'+
        '</div>';
    avalon.component("aoyou:doublelist", {
        // 内部变量
        _leftItems: [],
        _rightItems: [],

        // 内部方法
        _leftToggleActive: _interface,
        _rightToggleActive: _interface,
        _moveToRight: _interface,
        _moveToLeft: _interface,
        _initLeftItems: _interface,
        _initSelected: _interface,
        _change:_interface,

        // 配置项
        data: [],
        selected: [],  //默认选中项
        hideSelect: false,
        width:"",
        height:"",
        

        // 回调方法
        onChange: _interface,

        // 模板
        $template: tempstr,
        tpl_addBtnText:"&nbsp;添加&nbsp;&gt;",
        tpl_removeBtnText:"&lt;&nbsp;删除&nbsp;",

        $construct: function (aaa, bbb, ccc) {
            var options = avalon.mix(aaa, bbb, ccc)
            return options
        },

        $init: function (vm) {
            vm._initLeftItems = function(){
                if(vm.data && vm.data.length > 0){
                    vm._leftItems = []
                    vm._rightItems = []

                    avalon.each(vm.data, function(index, dataItem){
                        vm._leftItems.push({
                            name: dataItem.name,
                            value: dataItem.value,
                            active: false,
                            disabled: false,
                            visible: true
                        })
                    })
                }
            }

            vm._initSelected = function(){
                if(vm.data && vm.data.length > 0){
                    for(var i = 0, len = vm._leftItems.length; i < len; i++){
                        vm._leftItems[i].active = false
                    }

                    avalon.each(vm.selected, function(index, selectedItem){
                        for(var i = 0, len = vm._leftItems.length; i < len; i++){
                            if(selectedItem === vm._leftItems[i]['value']){
                                vm._leftItems[i].active = true
                            }
                        }
                    })
                }
            }

            if(vm.data && vm.data.length > 0){
                vm._initLeftItems()
            }

            if(vm.selected && vm.selected.length > 0){
                vm._initSelected()
            }
        },

        $ready: function (vm) {
            vm._leftToggleActive = function(index){
                var currentItem = vm._leftItems[index]

                if(currentItem.disabled){
                    return
                } else{
                    currentItem.active = !currentItem.active
                }
            }

            vm._rightToggleActive = function(index){
                var currentItem = vm._rightItems[index]
                currentItem.active = !currentItem.active
            }

            vm._change = function($event, upOrDown){
                var tar = vm._rightItems;
                if (tar.length == 0) return;
                var item1,item2 = null;
                var flag = true;
                if (upOrDown === "up") {
                    flag = tar[0].active;
                    for (var i = 0, len = tar.length; i < len; i++) {
                        if(tar[i].active){
                            tar[i].active = false;
                            if(!flag){
                                item1 = tar[i];
                                item2 = tar[i-1];
                                tar.set(i,item2);
                                tar.set(i-1,item1);
                            }
                        }
                    }
                }else{
                    flag = tar[tar.length-1].active;
                    for (var i = 0, len = tar.length-1; i < len; len--) {
                        if(tar[len].active){
                            tar[len].active = false;
                            if(!flag){
                                item1 = tar[len];
                                item2 = tar[len+1];
                                tar.set(len,item2);
                                tar.set(len+1,item1);
                            }
                        }
                    }

                }
            }

            //上下切换
            /*vm._change = function ($event, upOrDown) {
                var tar = vm._rightItems;
                //var tar = vmodel.selectTmpSelect;
                if (tar.length == 0) return;
                if (upOrDown === "up") {
                    for (var i = 0, len = tar.length; i < len; i++) {
                        for (var j = 0, jlen = vm._rightItems.length; j < jlen; j++) {
                            if (j == 0) continue;
                            if (vm._rightItems[j] == tar[i]) {
                                vm._rightItems.splice(j, 1);
                                vm._rightItems.splice(j - 1, 0, tar[i]);
                                break;
                            }
                        }
                        /!*for (var j = 0, jlen = vmodel.select.length; j < jlen; j++) {
                            if (j == 0) continue;
                            if (vmodel.select[j] == tar[i]) {
                                vmodel.select.splice(j, 1);
                                vmodel.select.splice(j - 1, 0, tar[i]);
                                break;
                            }
                        }*!/

                    }
                } else {
                    for (var i = 0, len = tar.length; i < len; i++) {
                        for (var j = 0, jlen = vm._rightItems.length; j < jlen; j++) {
                            if (j == jlen - 1) continue;
                            if (vm._rightItems[j] == tar[i]) {
                                vm._rightItems.splice(j, 1);
                                vm._rightItems.splice(j + 1, 0, tar[i]);
                                break;
                            }
                        }
                        /!*for (var j = 0, jlen = vmodel.select.length; j < jlen; j++) {
                            if (j == jlen - 1) continue;
                            if (vmodel.select[j] == tar[i]) {
                                vmodel.select.splice(j, 1);
                                vmodel.select.splice(j + 1, 0, tar[i]);
                                break;
                            }
                        }*!/
                    }
                }
                /!*vmodel.selectTmpSelect.clear();
                vmodel.dataTmpSelect.clear();
                vmodel._getSelect();*!/
            }*/

            vm._moveToRight = function(){
                moveToAnotherSide(vm._leftItems, vm._rightItems)
                removeActiveItems(vm._leftItems, vm.hideSelect)

                setTimeout(function(){
                    vm.onChange(getCurrentData(vm.$model._rightItems))
                }, 0)
            }

            vm._moveToLeft = function(){
                if(vm.hideSelect){
                    moveToAnotherSide(vm._rightItems, vm._leftItems)
                } else{
                    unDisabledItems(vm._rightItems, vm._leftItems)
                }

                setTimeout(function(){
                    vm.onChange(getCurrentData(vm.$model._rightItems))
                }, 0)
                // always remove active
                removeActiveItems(vm._rightItems, true)
            }

            vm.$watch("data", function(){
                vm._initLeftItems()
            })

            vm.$watch("selected", function(v){
                vm._initSelected()
            })
        }
    });

    function moveToAnotherSide(origin, target){
        avalon.each(origin, function(index, originItem){
            if(originItem.active){
                var targetItem = avalon.mix(true, {}, originItem.$model);
                targetItem.active = false;
                target.push(targetItem);
            }
        })
    }

    function unDisabledItems(origin, target){
        avalon.each(origin, function(index, originItem){
            if(originItem.active){
                avalon.each(target, function(targetIndex, targetItem){
                    if(originItem.value === targetItem.value){
                        target[targetIndex].disabled = false
                    }
                })
            }
        })
    }

    function removeActiveItems(activeItems, hideSelect){
        var activePositions = []

        avalon.each(activeItems, function(index, item){
            if(item.active){
                if(!hideSelect){
                    item.disabled = true
                } else{
                    activePositions.unshift(index)
                }
                item.active = false
            }
        })

        if(hideSelect) {
            for (var i in activePositions) {
                activeItems.splice(activePositions[i], 1)
            }
        }
    }

    function getCurrentData(rightItems){
        var currentData = []

        avalon.each(rightItems, function(index, item){
            currentData.push(item.value)
        })

        return currentData
    }

    function SwapArray(arr, index1, index2)
    {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
    }
    return avalon;
})