/**
 *
 * @cnName 复选框列表
 * @enName checkboxlist
 * @introduce
 *    <p>通过checkboxlist可以方便的实现选框的全选、全不选，并可通过简单配置进行选中操作的回调处理，也可以通过多种方式来提供渲染选项视图所需要的数据</p>
 */

define(["avalon",
    "text!./avalon.checkboxlist.html",
    "css!./avalon.checkboxlist.css"
], function (avalon, template) {

    var _interface = function () {}

    avalon.component("aoyou:checkboxlist", {
        // 内部方法
        _clickOne: _interface,
        _clickAll: _interface,
        // 配置项
        data: [], //@config 所有选项值的集合，通过此数据来渲染初始视图。
        val: [], //@config 选中的checkbox value数组
        all: false, //@config 默认不选中所有选项+++
        alltext: "全部", //@config 显示"全部"按钮，方便进行全选或者全不选操作,不需要全选操作的话可以设置alltext为""
        type: "", //@config 内置type为week时的dat=a，用户只需配置type为week即可显示周一到周日的选项
        width:"200px",
        height:"atuo",
        singleselect:false,//是否单选默认多选
        // 回调方法
        onSelect: _interface,
        afterSelect:_interface,
        afterSelectAll:_interface,
        // 模板
        $template: template,

        $construct: function (aaa, bbb, ccc) {
            var options = avalon.mix(aaa, bbb, ccc)

            if (!options.data.length) {
                switch (options.type) {
                    // 配置了type为week的话，使用组件默认的提供的data
                    case "week":
                        var data = [
                            {text: '周一', value: 'MONDAY',check:false},
                            {text: '周二', value: 'TUESDAY',check:false},
                            {text: '周三', value: 'WEDNESDAY',check:false},
                            {text: '周四', value: 'THURSDAY',check:false},
                            {text: '周五', value: 'FRIDAY',check:false},
                            {text: '周六', value: 'SATURDAY',check:false},
                            {text: '周日', value: 'SUNDAY',check:false}
                        ];
                        break;
                    case ""://没有数据和类型的情况
                        var data = [];
                    default:
                        break;
                }
                options.data = data
            }
            avalon.each(options.data, function(i, it){
                if(it.check == undefined){
                    it.check = false;
                }
            })
            return options
        },

        $init: function (vm) {
            var val = vm.$model.val,newVal = []
            avalon.each(vm.data, function(i, newItem){
                var itemData = newItem.$model

                if(itemData.check ==true){
                    newVal.push(itemData.value)
                }
            })
            vm.val = newVal
            vm.all = vm.val.length === vm.data.length
        },

        $ready: function (vm,el) {

            vm._clickAll = function(e){
                var allflag = false;
                if(vm.val.length === vm.data.length){
                    vm.val = [];
                    avalon.each(vm.data, function(i, newItem){
                        if(newItem.value){
                            newItem.check = false;
                        }
                    })
                }else{
                    allflag = true;
                    avalon.each(vm.data, function(i, newItem){
                        if(newItem.value){
                            newItem.check = true;
                            vm.val.ensure(newItem.value);
                        }
                    })
                }
                    vm.all = vm.val.length === vm.data.length
                    vm.onSelect(e, vm.val)
                    vm.afterSelectAll(e, vm.data,allflag);
            }

            vm._clickOne = function(e, index){
                var flag = false;
                if(vm.data[index].check == true){
                    flag = true;
                }
                if(vm.singleselect == true){
                    for(var i=0,j=vm.data.length;i<j;i++){
                        vm.data[i].check = false;
                    }
                }
                if(flag){
                    vm.data[index].check = false;
                }else{
                    vm.data[index].check = !vm.data[index].check;
                }
                if(vm.data[index].check){
                    vm.val.ensure(vm.data[index].value);
                }else{
                    vm.val.remove(vm.data[index].value);
                }
                    vm.all = vm.val.length === vm.data.length
                    vm.onSelect(e, vm.val, index)
                    vm.afterSelect(e, vm.data[index].check, index);
            }
        }
    })

    return avalon;
});
/**
 @links
 [checkboxlist功能全览](avalon.checkboxlist.ex.html)
 [默认配置的checkboxlist组件](avalon.checkboxlist.ex1.html)
 [配置checkboxlist-duplex初始化初始选中的选项，而且可以通过duplex值的改变修正选中项状态](avalon.checkboxlist.ex2.html)
 [checkboxlist组件默认提供了type为week时的data](avalon.checkboxlist.ex3.html)
 [配置checkboxlist-fetch获取用户定义的所有选项值](avalon.checkboxlist.ex4.html)
 [配置onselect回调](avalon.checkboxlist.ex5.html)
 [配置data选项来渲染checkbox](avalon.checkboxlist.ex6.html)
 */
