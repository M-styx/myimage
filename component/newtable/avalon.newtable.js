//var tempstr='<div class="aoyou-newtable-container"><nav class="navbar" ms-if="bar===true" ms-css-text-align="title_align">{{title}}</nav><div style="overflow:auto;" ms-css-height="height"><table class="table table-hover"><thead style="background-color: white"><tr><th ms-repeat="cols" ms-css-width="{{el.width}}" ms-visible="el.disabled">{{el.display}}</th></tr></thead><tbody><tr ms-repeat-r="_cells"  ms-class="{{(alternatecolor && $index%2==0)?"aoyou-newtable-oddrowcolor":"aoyou-newtable-evenrowcolor"}}" ><td ms-visible="cols[$index-1].disabled" ms-class-1="aoyou-newtable-cell" ms-class-2="aoyou-newtable-textalign-center"  ms-repeat-c="r" ms-css-width="{{cols[$index-1].width}}" ms-attr-title="(cols[$index-1].type == "select" ? cols[$index-1].option[c] : c)" ms-visible="$index>0"><span ms-if="$index>0">{{(cols[$index-1].render ? cols[$index-1].render(c, r, $outer.$index, $index) : c)|html}}</span></td></tr></tbody></table></div><div ms-css-height="{{footerheight}}">{{footer|html}}</div></div>';



define(['avalon', '../base/mmRequest', 'css!./avalon.newtable.css'], function(avalon, req) {
    var _interface = function () {};
    var tempstr=''+
        '<div class="aoyou-newtable-container" ms-css-width="width">'+
         '<nav class="navbar" ms-if="bar===true" ms-css-text-align="title_align">'+
         '{{title}}'+
         '</nav>'+
        '<div style="overflow:auto;" ms-css-height="height">'+
        '<table class="table table-hover">'+
        '<thead style="background-color: white" ms-if="th_display===true">'+
        '<tr>'+
        '<th ms-repeat="cols" ms-css-width="{{el.width}}" ms-visible="el.disabled" ms-class="aoyou-newtable-textalign-{{th_align}}">{{el.display}}</th>'+
        '</tr>'+
        '</thead>'+
        '<tbody>'+
        '<tr ms-repeat-r="_cells"  ms-class="{{(alternatecolor && $index%2==0)?\'aoyou-newtable-oddrowcolor\':\'aoyou-newtable-evenrowcolor\'}}" >'+
        '<td ms-visible="cols[$index-1].disabled" ms-class-1="aoyou-newtable-cell" ms-class-2="aoyou-newtable-textalign-{{cols[$index-1].text_align}}" ms-class-3="border{{bordertype}}" ms-repeat-c="r" ms-css-width="{{cols[$index-1].width}}" ms-attr-title="(cols[$index-1].type == \'select\' ? cols[$index-1].option[c] : c)">'+
        '<span ms-if="$index>0">{{c|html}}</span>'+
        '</td>'+
        '</tr>'+
        '</tbody>'+
        '</table>'+
        '</div>'+
        '<div ms-css-height="{{footerheight}}">'+
        '{{footer|html}}'+
        '</div>'+
        '<div class="grid_page_bar" ms-visible="pagerbar">'+
        '<aoyou:pager $id="$initpager" config="$pager"></aoyou:pager>'+
        '</div>'+
        '</div>';
    avalon.component("aoyou:newtable", {
        //外部标签属性
        title: '',
        height: '',
        width:'',
        footerheight:'',
        pagerbar:false,  // 是否显示分页
        footer:'',
        title_align:'center',
        th_align:'left',
        bordertype:'all',//边框展示状态 all bottom
        backcolor:'grey', //表格背景颜色
        th_display:true,
        autoLoad: true,  //是否自动加载数据
        //外部配置参数
        loadUrl: '',  //加载数据地址
        loadParam: {},
        alternatecolor:true, //行颜色显示 交替
        key: [],
        cols: [],  //列模型
        rows: [],  //行数据
        _cells: [],
        afterAjax: null,//各种回调
        //slot
        content: '',
        bar:false,
        $rowFilters: [],  //行过滤条件

        _page: 1,  //当前页
        _total: 0,  //全部记录数
        limit: 10,  //页大小

        //默认配置
        $template: tempstr,
        $buildCells:_interface,
        $ajax:_interface,
        reloadData:_interface,
        $construct: function (hooks, vmOpts, elemOpts) {
            var options = avalon.mix(hooks, vmOpts, elemOpts);
            hooks.singleSelect = !hooks.checkbox ? true : hooks.singleSelect;  //单选设置
            //初始化过滤数组
            for(var i=0; i<hooks.cols.length; i++) {
                if(!hooks.cols[i].hasOwnProperty('disabled')){
                    hooks.cols[i]['disabled'] = true;
                }
                if(!hooks.cols[i].hasOwnProperty('text_align')){
                    hooks.cols[i]['text_align'] = 'left';
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
            return options;
        },
        $init: function(vm, elem) {
            vm._cells.removeAll();
            vm.$buildCells = function(rows) {
                //vm._cells = ['2014-12-44','111','342','432423'];
                var _bgnum = 0;
                var _limitLength = rows.length;
                if(vm.pagerbar){
                    var page = avalon.vmodels['$initpager'];
                    _bgnum = (page.currentPage-1)*(vm.limit);
                    _limitLength = _bgnum+vm.limit;
                }
                for(var i = _bgnum; i < _limitLength; i ++) {
                    if(rows[i]){
                        var row = rows[i], r = [0];
                        r[0]=1;
                        for(var j = 0; j < vm.cols.length; j ++) {
                            var col = vm.cols[j];
                            r.push(row[col.name]);
                        }
                        vm._cells.push(r);
                    }
                }
            };
            vm.$ajax = function(url, param, successCallback, failCallback) {
                if (param == undefined || param == null) {
                    for (var k in vm.loadParam) {
                        if (vm.loadParam.hasOwnProperty(k)) {
                            p[k] = vm.loadParam[k];
                        }
                    }
                } else {
                    for (var k in param) {
                        p[k] = param[k];
                    }
                    vm.loadParam = param;
                }
                var p = {
                    page: vm._page,
                    limit: vm.limit
                };

                req.ajax({
                    type: 'get',
                    url: url,
                    data: p,
                    async: false,
                    dataType:"json",
                    success: function (dat, status, xhr) {
                        if (typeof dat === 'string') {
                            dat = avalon.parseJSON(dat);
                        }
                        if (dat.rspcod == '200') {
                            successCallback(dat, status, xhr);
                            if (typeof vm.afterAjax == 'function') {
                                vm.afterAjax(vm, dat);
                            }
                        } else {
                            vm._loadInfo = '<strong style="color:red">' + dat.rspmsg + '</strong>';
                        }
                    },
                    error: function (dat) {
                        if (typeof dat === 'string') {
                            dat = avalon.parseJSON(dat);
                        }
                        vm._loadInfo = '<strong style="color:red;">' + dat.status + '[' + dat.statusText + ']</strong>';
                    }
                });
            }
            vm.reloadData = function(p) {
                if(vm.loadUrl != '') {

                    vm.$ajax(vm.loadUrl, p, function(dat, status, xhr) {
                        if(dat.rspcod == '200') {
                            vm._cells.removeAll();
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
                            vm._total = dat.total;
                            if(p != undefined){
                                vm._page =p['pagenum'];
                            }
                        }
                    });
                }
            }
        },
        $ready: function (vm, elem) {
            if(vm.rows != undefined && vm.rows instanceof Array && vm.rows.length > 0) {
                vm.$buildCells(vm.rows);
                vm._total = vm.rows.size();
            }
            if(vm.autoLoad == true){
                vm.reloadData();
            }
           /* if(vm.autoLoad === true) {
                vm.reloadData();
                var pagev = avalon.vmodels['$initpager'];
                pagev.totalItems = vm._total;
            }*/
        }
    });
    var widget = avalon.components["aoyou:newtable"];
    return avalon
});