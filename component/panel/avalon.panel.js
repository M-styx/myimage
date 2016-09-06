define(["avalon",
    "text!./avalon.panel.html",
    '../base/normalThings',
    "css!./avalon.panel.css",
    "../button/avalon.button"
], function (avalon, template) {
    var _interface = function () {};
    
    avalon.component("aoyou:panel", {
        toggle:true,
        uptool:true,
        title:"", //显示标题
        redtitle:"", //红色标记
        speed:8, //展开收起的速度
        iconsrc:"../../component/useimg/icon-detail.png", //左侧图标地址
        width:"",
        height:"35px",
        button:"", //button按钮或提示
        content:"",
        _upAndDown:_interface,   //内部
        _argsClick:_interface,  //点击展开收起图标调用方法  内部
        $template: template,
        defaultheight:200,
        $construct: function (aaa, bbb, ccc) {
            var options = avalon.mix(aaa, bbb, ccc);
            return options
        },
        $init:function (vm,elem) {

        },
        $ready:function (vm, elem) {
            var el;
            if(avalon.isIE()){
                if(elem){
                    var _arr = avalon.superGetElementeByClass(elem,'aoyou-panel-content');
                    if(_arr.length>0){
                        el = _arr[0];
                    }
                }
            }else{
                el = elem.childNodes[0].lastElementChild;
            }
            vm.defaultheight = avalon.getstyle(el,"height");
            if(vm.defaultheight == 'auto'){
                vm.defaultheight = el.clientHeight+"px";
            }
            if(vm.defaultheight.indexOf('px') != -1){
                vm.defaultheight = parseInt(vm.defaultheight.substr(0,vm.defaultheight.length-2));
            }
            vm._upAndDown = function () {
                if(vm.toggle){//展开
                    avalon.startrun(el,"height",vm.defaultheight,vm.speed);
                }else{//收回
                    avalon.startrun(el,"height",0,vm.speed);
                }
            }
            vm._argsClick=function() {
                vm.toggle = !vm.toggle;
                vm._upAndDown(vm.toggle);
            }
        }
    });
    var widget = avalon.components["aoyou:panel"];

    return avalon;
});


