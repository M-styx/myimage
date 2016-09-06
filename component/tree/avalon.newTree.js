//by hanggai
define(['avalon', '../base/mmRequest', "text!./avalon.newTree.html", "css!./avalon.newTree.css"], function(avalon, req,template) {
	var _interface = function () {},nodes_catch={},rename_catch={},renameState=true;
    var editTypeIcons = ['add','remove','rename'];
    //处理数据 因为avalon中的属性必须提前定义 否则可能出现异常
    function changeDataInfo(vop){
        if(vop){
            if(vop.data != undefined && vop.data.length>0){
                var startIDStr = '0';
                reBuildingData(vop.data,startIDStr);
            }
        }
    }
    //递归重构数据 z:重构的数据
    function reBuildingData(z,sstr){
        z.tid = sstr;
        z['renameShow'] = false;
        if(z.hasOwnProperty('length')){
            for(var i=0;i<z.length;i++){
                reBuildingData(z[i],z.tid+'-'+(i+1)); 
            }
        }
        if(!z.hasOwnProperty('checked')){
            z['t_checked'] = false;
        }
        if(!z.hasOwnProperty('expand')){
            z['expand'] = false;
        }
        if(!z.hasOwnProperty('edit')){
            z['edit'] = {add:false,remove:false,rename:false};
        }else{
            for(var i=0; editTypeIcons[i];i++){
                if(!z['edit'].hasOwnProperty(editTypeIcons[i])){
                    z['edit'][editTypeIcons[i]] = false;
                }
            }
        }
        z.isParent = false;
        if(z.hasOwnProperty('children')){
            if(z.children.length != undefined && z.children.length>0){
                z.isParent = true;
            }
            for(var i=0;i<z.children.length;i++){
                var temstr = sstr+'-'+(i+1);
                reBuildingData(z.children[i],temstr,z);
            }
        }else{
            z['children'] = [];
        }
    }
	avalon.component("aoyou:tree", {
//外部标签属性
		checkbox: false,
        bt_add:false,
        bt_remove:false,
        bt_rename:false,
		reverse: false,
		//外部配置参数
        checkboxType:"",
		url: '',
		param: {},
		data: [],
		onLoaded: null,
		onClicked: null,
		onChecked: null,
		onExpanded: null,
		onCollapsed: null,
		onReady: null,
		//内部属性
		$isInit: true,
		//内部接口
		$eventproxy: _interface,
        $eventExcute:_interface,
		$ajax: _interface,
		$getSelected: _interface,
		$setCheckbox: _interface,
		//view属性
		_isLoading: false,
		_loadInfo: '',
		//view接口
		_clickNode: _interface,
        _editNode:_interface,
        _inputClick:_interface,
		//对外方法
		getChecked: _interface,
		reloadData: _interface,
		setData: _interface,
		//默认配置
		$template: template,
		$construct: function (hooks, vmOpts, elemOpts) {//配置项的合并
            changeDataInfo(vmOpts);
			var option = avalon.mix(hooks, vmOpts, elemOpts);
			return option;
		},
		$dispose: function (vm, elem) {//组件移出dom时
			elem.innerHTML = elem.textContent = '';
            nodes_catch = {};
		},
		$init: function(vm, elem) {
			for(var i in vm) {
				if (vm.hasOwnProperty(i) && typeof vm[i] === "function") {
					vm[i] = vm[i].bind(vm)
				}
			}
			avalon.bind(document, 'click', function(e){
                if(renameState){
                    renameState = false;                    
                }else{
                    for(var k in rename_catch){
                        if(rename_catch[k]){
                            rename_catch[k]['renameShow'] = false;
                        }
                    }
                    rename_catch = {};//清缓存
                }
            })
			vm.$eventproxy = function(el, type) {//事件分发
                var ob = {};
                if(type){
                    if(typeof vm[type] == 'function') {
                        ob[type] = vm[type];
				    }
                }
                return ob;
			}
            vm.$eventExcute = function(type,el){
                var funcs =  vm.$eventproxy(elem,type);
                if(funcs.hasOwnProperty(type)){
                    if(el){
                        funcs[type](vm,elem,el);
                    }else{
                        funcs[type](vm,elem);
                    }
                }
            }
			vm.$ajax = function() {
				vm._isLoading = true;
				vm._loadInfo = '数据加载中...';
				var p = {};
				for(var k in vm.param) {
					if(vm.param.hasOwnProperty(k)) {
						p[k] = vm.param[k];
					}
				}
				req.ajax({
					type: 'get',
					url: vm.url,
					data: p,
					headers: {},
					success: function(data, status, xhr) {
						if(typeof data =='string'){
							data = avalon.parseJSON(data);
						}
						if(data.data){
							vm._loadInfo = '';
                            changeDataInfo(data);//ajax请求的数据在这里格式化
                            vm.data = data.data;
                        }else {
							vm._loadInfo = data.rspmsg;
						}
						vm._isLoading = false;
						vm.$eventExcute(data, 'onLoaded');
					},
					error: function(data) {
						vm._loadInfo = data.status + '[' + data.statusText + ']';
						vm._isLoading = false;
					}
				});
			}
			vm.$getSelected = function(dat) {
				var val = '';
				for(var i = 0; i < dat.size(); i ++) {
					if(dat[i].t_checked === true || dat[i].t_checked === 'true') {
						val += (dat[i].id + ',');
					}
					if(dat[i].children != undefined && dat[i].children.length > 0) {
						val += vm.$getSelected(dat[i].children);
					}
				}
				return val;
			}
			vm.$setCheckbox = function(el, checked) {
				//通过递归方式处理子checkbox	
				if(el.disabled == undefined || el.disabled === false || el.disabled === 'false') {
					el.t_checked = checked;
                    if(vm.checkbox && vm.checkboxType != ""){
                        if(el.children != undefined && el.children.length > 0) {
                            if(vm.checkboxType != ""){
                                if(vm.checkboxType == 'c'){
                                    for(var i = 0; i < el.children.length; i ++) {
                                        vm.$setCheckbox(el.children[i], checked);
                                    }
                                }
                            }
                        }
                    }
				}
			}
			vm._clickNode = function(ev, idx, el, type) {
				switch(type) {
					case 'oper':
						if(el.children != undefined && el.children.length > 0) {
							if(el.expand ===true || el.expand==='true') {
								el.expand = false;
								vm.$eventExcute('onCollapsed',el)
							}else {
								el.expand = true;
								vm.$eventExcute('onExpanded',el)
							}
						}
						break;
					case 'checkbox':
						vm.$setCheckbox(el, (el.t_checked===true||el.t_checked==='true'?false:true));
						if(el.t_checked === true || el.t_checked === 'true') {
							vm.$eventExcute('onChecked',el);
						}
						break;
					case 'node':
						if(el.disabled == undefined || el.disabled === false || el.disabled === 'false') {
							vm.$eventExcute('onClicked',el);
						}
						break;
					default:
						break;
				}
			}
            vm._editNode = function(ev, idx, el, type){
                switch(type) {
					case 'remove':
                        if(el.$up){
						  el.$up.remove(el)
                        }else{
                            el.$ups.el.$remove()
                        }
                        //--需要判断是否父级
                        //清除该节点缓存
                        delete nodes_catch[el.tid];
                        delete rename_catch[el.tid];
						break;
					case 'add':
                        var newNode = {children: [],edit: {add:true,remove:true,rename:true},expand: false,renameShow: false,text: "新建",t_checked:false,disabled:false,isParent:false};
                        el.children.push(newNode);
                        el.isParent = true;
                        //添加缓存节点
                        nodes_catch[el.tid+'-'+el.children.length] = el.children[el.children.length-1];
						break;
					case 'rename':
                        if(!el.renameShow){
                            el.renameShow = true;
                        }
                        if(rename_catch[el.tid]){
                            renameState = true;
                            el.renameShow = true;
                        }else{                        
                            rename_catch[el.tid] = el;
                            el.renameShow = true;
                            renameState= true;
                        }
						break;
					default:
						break;
				}
            }
            vm._inputClick = function(ev, idx, el){
                el.renameShow = true;
                renameState= true;
            }
			vm.getChecked = function() {
				var val = '';
				if(vm.checkbox === true) {
					val = vm.$getSelected(vm.data);
					val = val.substring(0, val.length - 1);
				}
				return val;
			}
			vm.reloadData = function() {
				if(vm.url != '') {
					vm.$ajax();
				}
			}
			vm.setData = function(dat) {
				vm.data.removeAll();
				vm.data.pushArray(dat);
			}
		},
		$ready: function (vm, elem) {
			if(vm.url != '') {
				vm.$ajax();
			}
            vm.$isInit = true;
            vm.$eventExcute('onReady');
        }
	});
	var widget = avalon.components["aoyou:tree"];
    return avalon
});