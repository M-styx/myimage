define(["avalon","css!./avalon.dropdownmenu.css"
], function (avalon) {
    var _interface = function () {};
    
    avalon.component("aoyou:dropdownmenu", {
        //外部配置
        mainiconclass:'',
        outerclass:'',
        data:[],
        menushow:false,
        //内部属性
        messagenum:'',
        mainicontypeclass:"",
        updownclass:"aoyou-dropdownmenu-updown-down",
        menuinfo:[],
        menuhover:_interface,
        cellClick:_interface,
        //对外方法
        afterClick:_interface,
        $template: '<ul ms-class-1="aoyou-dropdownmenu" ms-class-2="{{outerclass}}" ms-mouseenter="menuhover" ms-mouseleave="menuhover">'+
        '	<li class="aoyou-dropdownmenu_firstchild">'+
        '		<a href="#" class="aoyou-dropdownmenu_dropdown-toggle"><span ms-if="mainiconclass != \'\'" ms-class-1="aoyou-dropdownmenu-mainicon" ms-class-2="{{mainicontypeclass}}"></span><span ms-visible="messagenum!=\'\'" class="aoyou-dropdownmenu-circle">{{messagenum}}</span><span ms-class="{{updownclass}}"></span></a>'+
        '		<ul ms-visible="menushow" class="aoyou-dropdownmenu_ul">'+
        '			<li ms-on-click="cellClick($event,$index)" ms-repeat="menuinfo"  ms-class="{{$last?\'\':\'aoyou-dropdown_bor-b\'}}"><a><span ms-if="el.icontype!=\'\'" ms-class-1="icon-fx" ms-class-2="{{el.icontype}}"></span>{{el.content}}<span class="icon-num">{{el.messagenum}}</span></a></li>'+
        '		</ul>'+
        '	</li>'+
        '</ul>',
        $construct: function (hooks, vmOpts, elemOpts) {
            var menuinfo = [];
            if(vmOpts.data != undefined && vmOpts.data.length>0){
                for(var i=0,j=vmOpts.data.length;i<j;i++){
                    var _tep = {};
                    _tep.content = vmOpts.data[i].content || '';
                    _tep.href = vmOpts.data[i].href || '#';
                    _tep.icontype = vmOpts.data[i].icontype || '';
                    _tep.messagenum = vmOpts.data[i].messagenum || '';
                    menuinfo.push(_tep);
                }
            }
            hooks.menuinfo = menuinfo;
            var options = avalon.mix(hooks, vmOpts, elemOpts);
            return options;
        },
        $init:function (vm) {
            vm.cellClick = function(e,idx){
                e.stopPropagation();
                if(vm.afterClick != _interface){
                    vm.afterClick(vm.data.$model[idx]);
                }
            }
            vm.menuhover = function(){
                if(vm.updownclass=='aoyou-dropdownmenu-updown-up'){
                    vm.menushow = false;
                    vm.updownclass = "aoyou-dropdownmenu-updown-down";
                }else{
                    vm.menushow = true;
                    vm.updownclass = "aoyou-dropdownmenu-updown-up";
                }
            }
            if(vm.mainiconclass != ''){
                switch (vm.mainiconclass){
                    case 'user':
                    vm.mainicontypeclass = 'aoyou-dropdownmenu-mainicon-user';
                    break;
                    case 'mail':
                    vm.mainicontypeclass = 'aoyou-dropdownmenu-mainicon-mail';
                    break;
                }
            }
        }
    });
    var widget = avalon.components["aoyou:dropdownmenu"];

    return avalon;
});


