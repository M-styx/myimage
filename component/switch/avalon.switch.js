define(['avalon', '../base/mmRequest', 'css!./avalon.switch.css'], function(avalon, req) {
    var _interface = function () {};
    
    var tempstr='<div class="aoyou-newswitch-icon"><i ms-class-1="aoyou-newswitch-icon-switch-{{initial}}" ms-click="_changeStatus" ></i><input type="text" ms-visible="false" ms-duplex-boolean="initial"/></div>';
    avalon.component("aoyou:switch", {
        initial:false, //设置初始状态
        onchangeStatus:_interface,
        $template: tempstr,
        _changeStatus:_interface, //内部接口,切换
        setStatus:_interface,
        $init: function(vm, elem) {
            vm._changeStatus = function(ev) {
                vm.initial = !vm.initial;
                if(vm.onchangeStatus != undefined){
                    vm.onchangeStatus(vm.initial);
                }
            };
            vm.setStatus = function (val) {
                vm.initial = val===true?true:false;
            };
        }
        
    });
    var widget = avalon.components["aoyou:switch"];
    return avalon;
    
});