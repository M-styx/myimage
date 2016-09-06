/**
 *
 * @cnName 具有提示功能的输入框
 * @enName textbox
 * @introduce
 * <p>通过给简单的表单输入域设置不同的配置项可以使表单拥有舒服的视觉效果，也可以使其具有提示补全功能</p>
 */
define(["avalon",
    "text!./avalon.textbox.html",
    "css!./avalon.textbox.css","../base/normalThings",'../tooltip/avalon.tooltip'], function(avalon, template) {

    var _interface = function () {}

    avalon.component("aoyou:textbox", {
        // 内部变量
        $tp:{},
        fronttitle:"",
        lastalert:"",
        mtype:"",
        iconshow:false,
        _placeholderVisible: true,
        _focusing: false,
        _hovering: false,
        _isLowerEndBrowser: document.all && !window.atob, // IE 9 or lower

        // 内部方法
        _clickPlaceholder: _interface,
        _focus: _interface,
        _blur: _interface,
        _hover: _interface,

        // 配置项
        icontype:"",
        value: "",
        placeholder: "",
        type: "input",
        disabled: false,
        suggest: null,
        width:"",
        height:"",
        validation:"",
        // 回调方法

        // 模板
        $template: template,
        $construct: function (defaultConfig, vmConfig, eleConfig) {
            if(eleConfig.value){
                defaultConfig.$template = defaultConfig.$template.replace(/value/g,eleConfig.value);
            }
            var options = avalon.mix(defaultConfig, vmConfig, eleConfig)
            return options
        },

        $init: function (vm,el) {
            vm.$tp = {
                mouseclickout:true,
                mouseleave:false,
                linkobj:el,
                backgroundcolor:'#F08080'
            }
            if(vm.icontype != ""){
                vm.iconshow = true;
                vm.mtype = "aoyou-textbox-icon-"+vm.icontype;
            }
        },

        $ready: function (vm,elem) {
            vm._clickPlaceholder = function(e){
                var input = nextElementSibling(e.target)
                input.focus()
            }
            vm._focus = function(){
                vm._focusing = true
                vm._placeholderVisible = false
            }
            vm._blur = function(){
                vm._focusing = false
                if(vm.value === ""){
                    vm._placeholderVisible = true
                }
            }
            vm._hover = function(){
                if(!vm.disabled){
                    vm._hovering = true
                }
            }
            var _outervm = arguments[2][arguments[2].length-1];
            if(vm.validation != undefined && vm.validation != ""){
                var _tpcp = null;
                for(var f in vm.$refs){
                    if(f.indexOf('tooltip') != -1){
                        _tpcp = vm.$refs[f];
                        _tpcp.showflag = false;
                        break;
                    }
                }
                if(_outervm[vm.value] != undefined){
                    avalon.bind(elem,"click",function(e){
                        valiinput(_tpcp,vm.validation,_outervm[vm.value]);
                    });
                    _outervm.$watch(vm.value, function(data) {
                        valiinput(_tpcp,vm.validation,data);
                    });
                }else{
                    avalon.bind(elem,"click",function(e){
                        valiinput(_tpcp,vm.validation,vm.value);
                    });
                    vm.$watch(vm.value, function(data) {
                        valiinput(_tpcp,vm.validation,data);
                    });
                }

            }
        }
    })

    function nextElementSibling( el ) {
        do { el = el.nextSibling } while ( el && el.nodeType !== 1 );
        return el;
    }
    function valiinput(t,v,txt){
        var fl = false;
        if(v.indexOf('req') == -1 && txt == ''){
            fl = true;//如果没有要求必须填写则可以为空
        }
        var info = avalon.normalvalidation(txt,v);
        t.content = info;
        if(info == "" || fl){
            t.hidetip();
        }else{
            t.showtip();
        }
    }
    return avalon;
})
