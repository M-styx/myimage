//by hanggai
var tempstr = '<div class="aoyou-dropdowncheckbox"><label class="aoyou-dropdowncheckbox-fronttitle" ms-visible="!fronttitle==\'\'">{{fronttitle}}</label><div ms-class="aoyou-dropdowncheckbox-dropdownpart"><div ms-class="aoyou-dropdowncheckbox-div"><div ms-click="aoyoucheck($event)" ms-class="aoyou-dropdowncheckbox-div-content" ms-css-width="width">{{checkedNames.length>0?"":defualttext}}{{checkedNames}}<i ms-if="!data_direction" ms-class="aoyou-dropdowncheckbox-downbtn"></i><i ms-if="data_direction" ms-class="aoyou-dropdowncheckbox-upbtn"></i></div></div><aoyou:checkboxlist config="$checkboxconfig" ms-visible="dropdownCheckboxShow"></aoyou:checkboxlist></div></div>';
define(['avalon','component/base/normalThings',"../checkboxlist/avalon.checkboxlist", 'css!./avalon.dropdowncheckbox.css'], function(avalon) {
    var _interface = function () {};
    avalon.component("aoyou:dropdowncheckbox", {   
        data_direction:false,
        aoyoucheck:_interface,
        $remove:_interface,
        aoyouselect:_interface,
        aoyouselectall:_interface,
        get_options:_interface,
        checkFunc:_interface,
        dataSource:[],
        usedata:[],
        checkedNames:[],
        checkeditems:[],
        sourceFlag:null,
        dropdownCheckboxShow:false,
        singleselect:false,
        fronttitle:"",
        width:"200px",
        height:"auto",
        defualttext:"请选择",
        alltext:"",//当singleselect=false才支持
        $checkboxconfig:{
            data:[],onSelect:_interface,afterSelectAll:_interface,alltext:""
        },
        $template: tempstr,
        $construct: function (hooks, vmOpts, elemOpts) {//配置项的合并
            var option = avalon.mix(hooks, vmOpts, elemOpts);
            return option;
        },
        $init: function(vm, el) {
            var elemParent = el.parentNode;
            var sourceFlag = {value:"value",text:"text",check:"check"};
            if(vm.sourceFlag){
                if(vm.sourceFlag.value){
                sourceFlag.value = vm.sourceFlag.value;
                }
                if(vm.sourceFlag.text){
                    sourceFlag.text = vm.sourceFlag.text;
                }
                if(vm.sourceFlag.check){
                    sourceFlag.check = vm.sourceFlag.check;
                }
            }
            for(var o in vm.dataSource.$model){
                vm.usedata[o] = vm.dataSource.$model[o];
                vm.usedata[o].value = vm.usedata[o][sourceFlag.value];
                vm.usedata[o].text = vm.usedata[o][sourceFlag.text];
                vm.usedata[o].check = vm.usedata[o][sourceFlag.check];
                if(vm.usedata[o].check == true){
                    vm.checkedNames.push(vm.usedata[o].text);
                    vm.checkeditems.push(vm.usedata[o].value);
                }else{
                    vm.usedata[o].check = false;
                }
            }
            vm.get_options = function (callback) {
                setTimeout(function () {
                    callback(vm.usedata);
                }, 0);
            };
            vm.aoyouselect = function (e, ck, index) {
                if(avalon.isIE()){
                    event.cancelBubble = true;
                }else{
                    event.stopPropagation();
                }
                    if(!vm.checkeditems.contains(vm.usedata[index].value)){
                        if(vm.singleselect == true){
                            vm.checkedNames = [];
                            vm.checkeditems = [];
                        }
                        vm.checkedNames.push(vm.usedata[index].text);
                        vm.checkeditems.push(vm.usedata[index].value);
                        if(vm.singleselect == true){
                            vm.dropdownCheckboxShow = false;
                        }
                    } else {
                    vm.checkedNames.remove(vm.usedata[index].text);
                    vm.checkeditems.remove(vm.usedata[index].value);
                }
                if(vm.checkFunc != undefined && vm.checkFunc != _interface){
                    vm.checkFunc(vm.usedata,vm.checkeditems,elemParent);
                }
            };
            vm.aoyouselectall = function(e, ckdata,ckval){
                if(avalon.isIE()){
                    event.cancelBubble = true;
                }else{
                    event.stopPropagation();
                }
                if(ckdata != undefined && ckdata.length>0){
                    vm.checkedNames = [];
                    vm.checkeditems = [];
                    for(var i=0,j=ckdata.length;i<j;i++){
                        if(ckval){
                            vm.checkedNames.push(ckdata[i].text);
                            vm.checkeditems.push(ckdata[i].value);
                        }
                    }
                }
            }
            vm.aoyoucheck = function (event) {
                vm.dropdownCheckboxShow = vm.dropdownCheckboxShow === false ? true : false;
                vm.data_direction = !vm.data_direction;
                if(avalon.isIE()){
                    window.event.cancelBubble = true;
                }else{
                    event.stopPropagation();
                }
            };
            avalon.bind(document, 'click', function () {
                vm.dropdownCheckboxShow = false;
            });
            if(vm.checkeditems != undefined && vm.checkeditems.length>0){
                vm.$checkboxconfig.val = vm.checkeditems.$model;//已选中的值
            }
            if(vm.alltext != "" && vm.singleselect != true){
                vm.$checkboxconfig.alltext = vm.alltext;
                vm.$checkboxconfig.afterSelectAll = vm.aoyouselectall;
            }
            if(vm.singleselect == true){
                vm.$checkboxconfig.singleselect = vm.singleselect;
            }
            if(vm.width){
                vm.$checkboxconfig.width = vm.width;
            }
            if(vm.height){
                vm.$checkboxconfig.height = vm.height;
            }
            vm.$checkboxconfig.data = vm.usedata;
            vm.$checkboxconfig.afterSelect = vm.aoyouselect;
        }
    });
    var widget = avalon.components["aoyou:dropdowncheckbox"];
    return avalon
});



