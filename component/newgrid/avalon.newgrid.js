define(['avalon','../base/mmRequest', 'text!./avalon.newgrid.html','../tablecolumnresize/tablecolumnresize','../base/normalThings', 'css!./avalon.newgrid.css',"../pager/avalon.pager","../loading/avalon.loading"], function(avalon, req, template) {
	var _interface = function () {};
	avalon.component("aoyou:newgrid", {
		//外部标签属性
		title: '',
		tablewidth:'auto',
		height: 'auto',
		title_align:'left', 
		autoLoad: false,  //是否自动加载数据
		checkbox: true,  //是否显示checkbox
		singleSelect: false,
		editable: false,
		bar: true,  //*title*
		limit: 10,  //页大小
		toolbarshow:true,//是否显示工具栏
		filterbar:false,
		//外部配置参数
		loadUrl: '',  //加载数据地址
        filterUrl:'',//过滤数据地址
		loading:true,
		loadParam: {},
		deleteUrl: '',
		updateUrl: '',
		key: [],
		cols: [],  //列模型
		rows: [],  //行数据
		$pager:{},
		$selectedRows:[],
		$checkedRows:[],
		pagerbar:false,
		afterAjax: null,//各种回调
		onloaded: null,
		onreloaded: null,
		onrowclicked: null,
		onrowdbclicked: null,
		onrowselected: null,
		onready: null,
		//slot
		content: '',
		//内部属性
		$rowFilters: [],  //行过滤条件
        $filterrows:[],//过滤后的数据
		$keyIdx: [],
		$tmpData: {},
		$selected: 0,  //共选中行数
		$lastSelected: -1,  //最后一次选中行
		$lastSetectedTr:null,
		//内部接口
		$ajax: _interface,
		$trigger: _interface,
		$clearCells: _interface,
		$buildCells: _interface,
		$buildRowObj: _interface,
		$dealRemove: _interface,
		$clearfilter:_interface,
		$tableSizer:_interface,
		$getpagev:_interface,
		//view属性
        _useurl:'',
		_cells: [],
		_isTotal: false,
		_isLoading: false,
		_showButtons: false,
		_showFilter: false,
		_showAction: false,
		_allSelected: false,  //当前是否为全选
		_editIdx: -1,  //编辑行
		_scrollLeft: 0,  //横向滚动偏移量
		_page: 1,  //当前页
		_total: 0,  //全部记录数
		_loadInfo: '',
		//view接口
		_toggle: _interface,
		_filterRow: _interface,
		_clickCheckbox: _interface,
		_clickRow: _interface,
		_editRow: _interface,
		_removeRow:_interface,
		_addRow:_interface,
		_clickAction: _interface,
		_clickCell: _interface,
		_cancelEdit: _interface,
		_submitEdit: _interface,
		//对外方法
		reloadData: _interface,//刷新数据
        refreshData:_interface,//初始化包括翻页
		searchData:_interface,//根据参数查询
		getSelectedIdx: _interface,
		getSelectedRow: _interface,
		getRow: _interface,
		removeRow: _interface,
		removeSelectedRow: _interface,
		modifyRow: _interface,
		modifySelectRow: _interface,
		addRow: _interface,
		//默认配置
		$template: template,
		$construct: function (hooks, vmOpts, elemOpts) {
			var options = avalon.mix(hooks, vmOpts, elemOpts);
			hooks.singleSelect = !hooks.checkbox ? true : hooks.singleSelect;  //单选设置
			//初始化过滤数组
            if(hooks.checkbox == true){
                hooks.$rowFilters.push("");
            }
			for(var i=0; i<hooks.cols.length; i++) {
				if(!hooks.cols[i].hasOwnProperty('disabled')){
					hooks.cols[i]['disabled'] = true;
				}
				if(!hooks.cols[i].hasOwnProperty('editable')){
					hooks.cols[i]['editable'] = true;
				}
				hooks.$rowFilters.push('');
			}
			//初始化key索引
			for(var i=0; i<hooks.key.length; i++) {
				var k = hooks.key[i];
				for(var j=0; j<hooks.cols.length; j++) {
					var col = hooks.cols[j];
					if(k == col.name) {
						hooks.$keyIdx.push(j); break;
					}
				}
			}
			if(hooks.loadUrl != undefined && hooks.loadUrl != ""){
				if(hooks.filterUrl == "" || hooks.filterUrl == undefined){
					hooks.filterUrl = hooks.loadUrl;
				}
                hooks._useurl = hooks.loadUrl;//默认一进来使用url为loadUrl
			}
			return options;
		},
		$init: function(vm, elem) {
			vm.$getpagev = function(){
				var pv;
				for(var j in vm.$refs){//通过$ref来获取pager组件vmodel
					if(j.indexOf('pager') != -1){
						pv = vm.$refs[j];
					}
				}
				return pv;
			}
			vm.$trigger = function(ev, type) {
				switch (type) {
					case 'loaded':
						if(typeof vm.onloaded == 'function') {
							vm.onloaded(ev, vm);
						}
						break;
					case 'reloaded':
						if(typeof vm.onreloaded == 'function') {
							vm.onreloaded(ev, vm);
						}
						break;
					case 'rowclicked':
						if(typeof vm.onrowclicked == 'function') {
							vm.onrowclicked(ev, vm);
						}
						break;
					case 'rowdbclicked':
						if(typeof vm.onrowdbclicked == 'function') {
							vm.onrowdbclicked(ev, vm);
						}
						break;
					case 'rowselected':
						if(typeof vm.onrowselected == 'function') {
							vm.onrowselected(ev, vm);
						}
						break;
					case 'ready': 
						if(typeof vm.onready == 'function') {
							vm.onready(ev, vm);
						}
						break;
					default: break;
				}
			}
			vm.$clearCells = function() {
				vm.$lastSelected = -1;
				vm.$selected = 0;
				vm._allSelected = false;
				vm._cells.removeAll();
			}
			vm.$buildCells = function(rows) {
				vm.$checkedRows = {};
                var _bgnum = 0;
                var _limitLength = rows.length;
                if(vm.pagerbar){
					var page;
					for(var j in vm.$refs){
						if(j.indexOf('pager') != -1){
							page = vm.$refs[j];
						}
					}
                    _bgnum = (page.currentPage-1)*(vm.limit);
                    _limitLength = _bgnum+vm.limit;
                }
				for(var i = _bgnum; i < _limitLength; i ++) {
                    if(rows[i]){
                        var row = rows[i], r = [0];
                        if(rows[i].selected == 'true' || rows[i].selected == true) { 
                            r[0] = 1;
                        }
                        for(var j = 0; j < vm.cols.length; j ++) {
                            var col = vm.cols[j];
                            r.push(row[col.name]);
                        }
                        vm._cells.push(r);
						if(r[0] == 1){
							vm.$checkedRows[i] = {'index':i,'content':r.$model}
						}
                        if(rows[i].selected == 'true' || rows[i].selected == true) { 
                            r[0] = 1;
                            if(vm.singleSelect === true && vm.$lastSelected >= 0) {
                                vm._allSelected = true;
                                vm._cells[vm.$lastSelected].set(0, 0);
                            }else {
                                vm.$selected ++;
                                if(vm.$selected==vm.rows.length){
                                    vm._allSelected = true;
                                }
                            }
                            vm.$lastSelected = vm._cells.size() - 1;
                        }
                    }
				}
			}
			vm.$buildRowObj = function(idx) {
				var r = vm._cells[idx], obj = {};
				for(var i = 0; i < vm.cols.length; i ++) {
					var col = vm.cols[i];
					obj[col.name] = r[i + 1]; //第一个元素为selected
				}
				return obj;
			}
			vm.$dealRemove = function(arr) {
				arr.sort(function(a, b){
					return parseInt(b) - parseInt(a);  //从大到小排序
				});
				for(var i = 0; i < arr.length; i ++) {
					vm._cells.removeAt(arr[i]);
				}
				vm._allSelected = false;
			}
			vm.$ajax = function(url, param, successCallback, failCallback) {
				vm._isLoading = true;
				var p = {
					page: vm._page,
					limit: vm.limit
				};
				if(param == undefined || param == null) {
					for(var k in vm.loadParam) {
						if(vm.loadParam.hasOwnProperty(k)) {
							p[k] = vm.loadParam[k];
						}
					}
				}else {
					for(var k in param) {
						p[k] = param[k];
					}
					vm.loadParam = param;
				}
				req.ajax({
					type: 'get',
					url: url,
					data: p,
					async: false,
					dataType:"json",
					success: function(dat, status, xhr) {
						if(typeof dat ==='string'){
							dat = avalon.parseJSON(dat);
						}
						if(dat.rspcod == '200') {
							successCallback(dat, status, xhr);
							if(typeof vm.afterAjax == 'function') {
								vm.afterAjax(vm, dat);
							}
						}else {
							vm._loadInfo = '<strong style="color:red">' + dat.rspmsg + '</strong>';
						}
						vm._isLoading = false;
					},
					error: function(dat) {
						if(typeof dat ==='string'){
							dat = avalon.parseJSON(dat);
						}
						vm._loadInfo = '<strong style="color:red;">' + dat.status + '[' + dat.statusText + ']</strong>';
						vm._isLoading = false;
					}
				});
			}
			vm._toggle = function(ev, type, act) {
				switch(type) {
					case 'button':
						vm._showButtons = !vm._showButtons; break;
					case 'filter':
						vm._showFilter = !vm._showFilter; break;
					case 'action':
						act == 'in' ? vm._showAction = true : vm._showAction = false; break;
					default:
						break;
				}
			}
			//过滤行 idx:列索引 name:列模型name
			vm._filterRow = function(idx, name) {
				vm.$rowFilters[idx] = this.value;
                if(vm.filterUrl != undefined && vm.filterUrl != ""){
                    var _para = [];
                    for(var z=0,k= vm.cols.length;z<k;z++){
                        if(vm.cols[z] && vm.cols[z].name){
                            var _obb = {'name':vm.cols[z].name,keyvalue:vm.$rowFilters[z]};
                            _para.push(_obb);
                        }
                    }
                    vm._useurl = vm.filterUrl;
                    vm.refreshData(_para,true);
                }else{//通过循环找出所有符合条件的
                    vm.$filterrows = [];
                    for(var i=0;i<vm.rows.length;i++){
                        var result = false;
                        for(var j = 0; j < vm.cols.length; j ++) {
                            if(vm.$rowFilters[j] == undefined || vm.$rowFilters[j] == '' || vm.rows[i][vm.cols[j].name].indexOf(vm.$rowFilters[j]) >= 0) {
                                result = true;
                            }else {
                                result = false;
                                break;
                            }
                        }
                        if(result){
                            vm.$filterrows.push(vm.rows[i].$model);
                        }
                    }
                        vm._page = 1;
                        vm.$clearCells();
                        vm.$buildCells(vm.$filterrows);
                        vm._total = vm.$filterrows.length;
                    vm.$getpagev().totalItems = vm._total;
                }
			}
			vm._clickCheckbox = function(ev, idx) {
				if(idx == -1) {
					if(vm.singleSelect !== true) {
						vm._allSelected = !vm._allSelected;
						for(var i = 0; i < vm._cells.size(); i ++) {
							vm._cells[i].set(0, vm._allSelected ? 1 : 0);
						}
						vm.$selected = vm._allSelected ? vm._cells.size() : 0;
					}
				}else {
					if(vm._cells[idx][0] == 1) {
						delete vm.$checkedRows[idx];
						vm._cells[idx].set(0, 0);
						vm.$selected --;
						vm._allSelected = false;
						vm.$lastSelected = -1;
					}else {
						vm.$checkedRows[idx] = {'index':idx,'content':vm._cells[idx].$model};
						vm._cells[idx].set(0, 1);
						if(vm.singleSelect === true && vm.$lastSelected >= 0) {
							vm._cells[vm.$lastSelected].set(0, 0);
						}else {
							vm.$selected ++;
							if(vm._cells.length == vm.$selected){
								vm._allSelected = true;
							}
						}
						vm.$lastSelected = idx;
						vm.$trigger(vm.$buildRowObj(idx), 'rowselected');
					}
				}
			}
			vm._clickRow = function(ev, idx) {
				vm.$selectedRows = {'index':idx,'content':vm._cells[idx].$model};
				vm._clickCheckbox(ev, idx);
				var _tg = ev.currentTarget?ev.currentTarget:ev.target.parentNode;
				if(_tg.nodeName != 'TR'){//兼容早期浏览器
					while (_tg.nodeName != 'TR') {
						_tg = _tg.parentNode;
					}
				}
				var _tgtclass = (_tg.className?_tg.className:"");
				if((_tgtclass).indexOf('aoyou-newgrid-tr_selected') == -1){
					if(vm.$lastSetectedTr != null && vm.$lastSetectedTr != undefined){
						vm.$lastSetectedTr.className = "";
					}
					_tgtclass += ' aoyou-newgrid-tr_selected'
					_tg.className = _tgtclass;
					vm.$lastSetectedTr = _tg;
				}
				vm.$trigger(vm.$buildRowObj(idx), 'rowclicked');
			}
			vm._editRow = function(ev, idx) {
				var rowObj = vm.$buildRowObj(idx);
				if(vm.editable === true) {
					if(idx != vm._editIdx) {
						vm._editIdx = idx;
					}
					vm.$tmpData = rowObj;
				}
				vm.$trigger(rowObj, 'rowdbclicked');
			}
			vm._cancelEdit = function(ev, idx) {
				vm._editIdx = -1;
				vm.modifyRow(idx, vm.$tmpData);
				ev.stopPropagation();
				ev.cancelBubble = true;
			}
			vm._submitEdit = function(ev, idx) {
				if(confirm("确定保存数据？")){
					var rowObj = vm.$buildRowObj(idx);
					if(vm.updateUrl != '') {
						vm.$ajax(vm.updateUrl, rowObj, function(dat, status, xhr) {
							if(dat.rspcod == '200') {
								vm.$tmpData = rowObj;
								vm._cancelEdit(ev, idx);
								vm._loadInfo = '<strong style="color:blue;">' + dat.rspmsg + '</strong>';
							}
						});
					}else {
						vm.$tmpData = rowObj;
					}
					vm._editIdx = -1;
					ev.stopPropagation();
					ev.cancelBubble = true;
				}
			}
			vm._removeRow = function(ev, idx){
				if(confirm("确定删除该条数据？")){
					vm.removeRow([idx]);
				}
			}
			vm._addRow=function (ev,idx) {
				vm.addRow(ev);
			}
			vm._clickAction = function(ev, fun) {
				if(typeof fun == 'function') {
					fun(ev, vm);
				}
				ev.stopPropagation();
				ev.cancelBubble = true;
			}
			vm._clickCell = function(ev, fun, row, col, val) {
				if(typeof fun == 'function') {
					fun(ev, vm, row, col, val);
				}
			}
			//重新加载数据
			vm.reloadData = function(p) {
				if(vm.loading){
					avalon.Loading.init({
						_bgcolor:"#ccc",
						target: avalon.superGetElementeByClass(elem,'aoyou-newgrid-container')[0]
					});
					avalon.Loading.start();
				}
            if(vm.rows != undefined && vm.rows instanceof Array && vm.rows.length > 0) {
				//默认加载数据
				vm._page = 1;
				if(vm.loading){
				setTimeout(function(){avalon.Loading.stop();},1000);
				}
				vm.$clearCells();
				vm.$buildCells(vm.rows);
				vm._total = vm.rows.size();
                }else{
                    var useUrl = vm._useurl;
                    if(useUrl != '') {
                        vm.$ajax(useUrl, p, function(dat, status, xhr) {
                            if(dat.rspcod == '200') {
								setTimeout(function(){
									if(vm.loading) {
										avalon.Loading.stop();
									}
									vm.$clearCells();
									vm.$buildCells(dat.rows ? dat.rows : []);
									if(!vm.pagerbar){
										if(dat.total == vm._cells.size()) {
											vm._isTotal = true;
											vm._loadInfo = '<strong style="color:blue">无更多记录</strong>';
										}else {
											vm._isTotal = false;
											if(vm._cells.size() == 0) {
												vm._loadInfo = '<strong style="color:red;">未查询到记录</strong>';
											}else {
												vm._loadInfo = '<strong style="color:blue">数据加载成功</strong>';
											}
										}
									}
									if(dat.total && dat.total>=0){
										vm._total = dat.total;
									}else{
										vm._total = dat.rows?dat.rows.length:0;
									}
									if(p != undefined){
										vm._page =p['pagenum'];
									}
									vm.$trigger(dat, 'reloaded');
									vm.$getpagev().totalItems = vm._total;
								},1000);
							}
                        });
                    }
                }
			}
			vm.getSelectedIdx = function() {
				var arr = [];
				if(vm.singleSelect === true) {
					if(vm.$lastSelected != -1) {
						arr.push(vm.$lastSelected);
					}
				}else {
					for(var i = 0; i < vm._cells.size(); i ++) {
						if(vm._cells[i][0] == 1) {
							arr.push(i);
						}
					}
				}
				return arr;
			}
			vm.getSelectedRow = function() {
				var arr = [], arrIdx = vm.getSelectedIdx();
				for(var i = 0; i < arrIdx.length; i ++) {
					arr.push(vm.$buildRowObj(arrIdx[i]));
				}
				return arr;
			}
			vm.getRow = function(idxArr) {
				var arr = [];
				for(var i = 0; i < idxArr.length; i ++) {
					arr.push(vm.$buildRowObj(idxArr[i]));
				}
				return arr;
			}
			vm.removeRow = function(arr) {
				if(vm.deleteUrl != '' && vm.key.length > 0) {
					var vals = [];
					for(var i = 0; i < arr.length; i ++) {
						var v = '', r = vm._cells[arr[i]];
						for(var j = 0; j < vm.$keyIdx.length; j ++) {
							v += r[j + 1];
						}
						vals.push(v);
					}
					vm.$ajax(vm.deleteUrl, {deleteKey: vals.toString()}, function(dat, status, xhr) {
						if(dat.rspcod == '200') {
							vm.$dealRemove(arr);
							vm._total -= arr.length;
							vm._loadInfo = '<strong style="color:blue">已删除' + arr.length + '条数据</strong>';
						}
					});
				}else {
					vm.$dealRemove(arr);
					vm._loadInfo = '<strong style="color:blue">已删除' + arr.length + '条数据</strong>';
				}
				return arr.length;
			}
			vm.removeSelectedRow = function() {
				var arr = vm.getSelectedIdx();
				return vm.removeRow(arr);
			}
			vm.modifyRow = function(idx, data) {
				if(data) {
					var r = vm._cells[idx];
					for(var i=0; i<vm.cols.length; i++) {
						var col = vm.cols[i];
						if(data[col.name] != undefined) {
							r.set(i + 1, data[col.name])
						}
					}
				}
			}
			vm.modifySelectRow = function(data) {
				var arr = vm.getSelectedIdx();
				for(var i = 0; i < arr.length; i ++) {
					vm.modifyRow(arr[i], data);
				}
			}
			vm.addRow = function(arr) {
				if(arr && arr.length > 0) {
					vm.$buildCells(arr);
					vm._total = parseInt(vm._total) + parseInt(arr.length);
				}
			}
			vm.$clearfilter = function(){
				vm.$filterrows = [];
				for(var i = 0;i<vm.$rowFilters.length;i++){
					vm.$rowFilters[i] = "";//刷新时清空filter缓存
				}
				var inputs = avalon.superGetElementeByClass(elem,'aoyou-newgrid-filter-input',true);
				if(inputs != undefined && inputs.length>0){//刷新时清空filter的input框
					for(var i= 0;i<inputs.length;i++){
						inputs[i].value = "";
					}
				}
			}
            vm.refreshData = function(p,filtering){
                vm._loadInfo = "";
				if(filtering != true){
					vm._useurl = vm.loadUrl;
				}
				if(!filtering){
					vm.$clearfilter();
				}
                if(p){//p代表额外需要传的参数
                    p['pagenum'] = 1;
                    p['pagesize'] = vm.limit;
                    vm.reloadData(p);
                }else{
                    vm.reloadData({'pagenum':1,'pagesize':vm.limit});
                }
				vm.$getpagev().jumpPage(event,1);
            }
			vm.searchData = function(p){
				vm.$clearfilter();
				if(p){//p代表额外需要传的参数
					p['pagenum'] = 1;
					p['pagesize'] = vm.limit;
					vm.reloadData(p);
				}else{
					vm.reloadData({'pagenum':1,'pagesize':vm.limit});
				}
				vm.$getpagev().jumpPage(event,1);
			}
			vm.$tableSizer = function(){
				var contentele = avalon.normalGetElementeByClass('aoyou-newgrid-tablecontent-thead')[0];
				if(vm.tablewidth == 'auto'){
					vm.tablewidth = contentele.clientWidth+1+'px';
				}
				avalon.columnResize((avalon.superGetElementeByClass(elem,'aoyou-newgrid-margin_bottom2'))[0]);
			}
			if(vm.pagerbar){
				var datasL  = 0;
				if(vm.rows != undefined && vm.rows instanceof Array && vm.rows.length > 0){
					datasL = vm.rows.length;
				}else{
					datasL = vm._total;
				}
				vm.$pager = {//有关pager组件的配置
					showJumper:true,
                    showPageNumButtons:false,
					nextLastText:'<span class="aoyou-newgrid-pager-nextlast"></span>',
					prevFirstText:'<span class="aoyou-newgrid-pager-prevfirst"></span>',
					nextText:'<span class="aoyou-newgrid-pager-next"></span>',
					prevText:'<span class="aoyou-newgrid-pager-prev"></span>',
					alwaysShowNext:true,
					alwaysShowPrev:true,
                    alwaysShowFirst:true,
                    alwasyShowLast:true,
					perPages:vm.limit,
					totalItems:datasL,
					onJump:function(event, page){
                        if(vm.loadUrl != undefined && vm.loadUrl != ""){
							vm.reloadData({
                                'pagenum':page.currentPage,
                                'pagesize':vm.limit
                            });
                        }else{
                            if(vm.$filterrows.length>0){
                                vm._page = page.currentPage;
                                vm.$clearCells();
                                vm.$buildCells(vm.$filterrows);
                            }else{
                                if(vm.rows != undefined && vm.rows instanceof Array && vm.rows.length > 0) {
                                    vm._page = page.currentPage;
                                    vm.$clearCells();
                                    vm.$buildCells(vm.rows);
                                }
                            }
                        }
					}
				};
			}
		},
		$ready: function (vm, elem) {
			if(vm.autoLoad === true) {
				vm.reloadData();
			}
			vm.$trigger(elem, 'ready');
			vm.$tableSizer();
    	}
	});
	var widget = avalon.components["aoyou:newgrid"];
  return avalon
});