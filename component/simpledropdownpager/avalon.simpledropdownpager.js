/**
 * simpledropdownpager by hanggai
 */
define(["avalon", '../base/mmRequest', '../base/normalThings' , 'css!./avalon.simpledropdownpager.css'], function(avalon,req) {
    var _interface = function () {};
    //模板
    var tstr = '<div class="aoyou-simpledropdownpager"><label class="aoyou-simpledropdownpager-fronttitle">{{fronttitle}}</label>' +
    '<div class="aoyou-simpledropdownpager-maincontent"><div ms-class="aoyou-simpledropdownpager-div" ms-visible="dropdownshow">'+
        '<input unselectable="on" class="aoyou-simpledropdownpager-show-input aoyou-simpledropdownpager-input" ms-css-width="wgwidth" ms-duplex="duplexValue" ms-visible="contentinputshow" ms-on-click="contentclick($event)"/>'+
        '<div class="fuzzypart" ms-visible="fuzzypartshow"><input type="text" class="aoyou-simpledropdownpager-input fuzinput" ms-duplex-string="fuzzytext" ms-on-click="fuzzyinputclick($event)">'+
        '<ul class="aoyou-simpledropdownpager-ul" ms-class="aoyou-simpledropdownpager-ul">'+
        '    <div class="aoyou-selcity-sort"><div class="aoyou-dropdown-title-hrdiv"></div>'+
        '        <span class="aoyou-dropdown-title-span">按拼音排序</span>'+
        '    </div>'+'<li ms-repeat="normaloptions" ms-attr-thevalue="{{el.value}}" ms-on-click="_optionClick($event,el.$model)">{{el.name}}</li>'+
        '</ul>'+
        '<div class="wg-aoyou-selcity-page" ms-class="aoyou-simpledropdownpager-div unfuzzypager" ms-visible="!fuzzypagershow"><i class="dpprevimg" ms-on-click="_pagechangeFunc($event,\'prev\')"></i><div class="pagerdiv"><span ms-repeat="pagernumbuttons" ms-class="{{el.classname}}" ms-on-click="_pagerNumClickFunc($event,el.num)">{{el.num}}</span></div><i class="dpnextimg" ms-on-click="_pagechangeFunc($event,\'next\')"></i></div>'+
        '<div class="wg-aoyou-selcity-page" ms-class="aoyou-simpledropdownpager-div fuzzypager" ms-visible="fuzzypagershow"><i class="dpprevimg" ms-on-click="_fuzzypagechangeFunc($event,\'prev\')"></i><div class="pagerdiv"><span ms-repeat="fuzzypagernumbuttons" ms-class="{{el.classname}}" ms-on-click="_pagerNumClickFunc($event,el.num)">{{el.num}}</span></div><i class="dpnextimg" ms-on-click="_fuzzypagechangeFunc($event,\'next\')"></i></div>'+
        '</div></div></div></div>';
    function getdataFormReg(dt,_txt,ky){//从数据中获取正则匹配
        var _temfuzzydata = [];
        for (var i = 0; i < dt.length; i++) {//匹配
            var reg = new RegExp('^' + _txt + '.*$', 'im');
            if (reg.test(dt[i][ky]) ) {
                _temfuzzydata.push(dt[i]);
            }
        }
        return _temfuzzydata;
    }
    avalon.component("aoyou:simpledropdownpager", {
        // 配置项
        dropdownshow:true,//组件显示
        sourceFlag:{name: "name", value: "value"},//数据源的对应
        allsizeStr:'allsize',//共多少条的名字
        pagesizeString:"pagesize",//每页显示多少的名字
        currentpageString:"currentpage",//当前页的名字
        wgwidth:'250px',//组件宽度
        showsize:5,//每页显示的条数默认5条
        pullDataFuncUrl:"",//获取serverside的url
        serverside:false,//数据是否取自服务器
        fuzzyServerside:false,//模糊数据是否取自服务器
        fuzzycurrentpageString:"currentpage",
        fuzzypagesizeString:"pagesize",
        fuzzysourceflag:{name: "name", value: "value"},
        fuzzypullDataFuncUrl:"",
        fuzzyallsizeStr:'allsize',
        duplexValue:"",
        fronttitle:"",
        outervmid:null,//外部vm的$id
        //内部变量
        contentinputshow:true,
        fuzzypartshow:false,
        currentpage:1,//正常翻页当前页
        firstOpenFlag:true,
        pagernumbuttons:[],//页码
        normaloptions:[],//条目
        allsize:0,
        fuzzycurrentpage:1,//模糊匹配当前页
        fuzzyallsize:0,
        fuzzypagershow:false,
        fuzzypagernumbuttons:[],//模糊匹配页码
        fuzzytext:"",//模糊匹配的input的实时值
        isclickinput:false,
        // 内部方法
        _optionClick:_interface,
        _pagechangeFunc:_interface,
        _fuzzypagechangeFunc:_interface,
        _pagerNumClickFunc:_interface,
        pageNationMaker:_interface,
        getDataFromOption:_interface,
        getDataFromDatas:_interface,
        contentclick:_interface,
        _getMaxzindex:function(){
            var children = document.body.children,
                maxIndex = 10, //当body子元素都未设置zIndex时，默认取10
                zIndex;
            for (var i = 0, el; el = children[i++];) {
                if (el.nodeType === 1) {
                    zIndex = parseInt(avalon(el).css("z-index"), 10)
                    if (zIndex) {
                        maxIndex = Math.max(maxIndex, zIndex)
                    }
                }
            }
            return maxIndex + 1
        },
        fuzzyinputclick:function(e){
            e.stopPropagation();
        },
        // 回调方法
        pagePrevNextFunc:_interface,
        optionClickFunc:_interface,
        // 模板
        $template: tstr,
        $construct: function (defaultConfig, vmConfig, eleConfig) {
            if(vmConfig.duplexValue){
                defaultConfig.$template = defaultConfig.$template.replace(/duplexValue/g,vmConfig.duplexValue);
            }
            var options = avalon.mix(defaultConfig, vmConfig, eleConfig)
            return options
        },
        $init: function (vm,elem) {
            vm._pagerNumClickFunc = function(e,num){
                e.stopPropagation();
                if(vm.fuzzypagershow){
                    vm.fuzzycurrentpage = num;
                }else{
                    vm.currentpage = num;
                }
            }
            //创造页码,样式变化
            vm.pageNationMaker = function(psize,csize){
                if(vm.fuzzypagershow){
                    vm.fuzzypagernumbuttons = [];
                }
                if (psize > 0) {
                    if (csize) {
                        var k = Math.ceil(csize / 6);
                        var bgnum = k * 6;
                    }
                    for (var i = 0; i < psize; i++) {
                        var spclass = '';
                        if (i >= bgnum - 6 && i < bgnum) {
                            if (i+1 == csize) {
                                spclass = "currentshowspan currentpagespan";//初始化
                            } else {
                                spclass = "currentshowspan";
                            }
                        } else {
                            spclass = "hiddenspan";
                        }
                        if(vm.fuzzypagershow){
                            vm.fuzzypagernumbuttons.push({'classname':spclass,'num':i+1});

                        }else{
                            if(vm.firstOpenFlag){
                                vm.pagernumbuttons.push({'classname':spclass,'num':i+1});
                            }else{
                                vm.pagernumbuttons[i]['classname'] = spclass;
                            }
                        }
                    }
                }
            }

            //获取通用options下拉选中的情况 来自于options中的general_opts
            //每个option包含name value
            vm.getDataFromDatas = function(data,fuzzyflag) {
                var v_name = "name";
                var v_value = "value";
                if(fuzzyflag){
                    v_name = vm.fuzzysourceflag.name;
                    v_value = vm.fuzzysourceflag.value;
                }else{
                    v_name = vm.sourceFlag.name;
                    v_value = vm.sourceFlag.value;
                }
                if (Array.isArray(data)) {
                    var redata = [];
                    var _begnum = 0;
                    var _endnum = data.length;
                    if(data.length>vm.showsize){//请求的数据大于每页展示的条数则认为是整体数据请求
                        if(fuzzyflag){
                            _begnum = (vm.fuzzycurrentpage-1)*vm.showsize;
                        }else{
                            _begnum = (vm.currentpage-1)*vm.showsize;
                        }
                        _endnum = _begnum+vm.showsize;
                    }
                    for (var p = _begnum; p < _endnum; p++) {
                        if(data[p]){
                            redata.push({name:data[p][v_name],value:data[p][v_value]});
                        }
                    }
                    return redata;
                }
                return [];
            }
            //页码翻页点击变换
            vm._pagechangeFunc = function(e,type){
                e.stopPropagation();
                var pagesize = Math.ceil(vm.allsize / vm.showsize);
                var al = Math.ceil(pagesize / 6);
                if(type == 'next'){
                    if (vm.pagePrevNextFunc) {
                        vm.pagePrevNextFunc(event,'next');
                    }
                    if (vm.currentpage <= (al - 1) * 6) {//如果最后面不必执行
                        var z = Math.ceil((vm.currentpage + 6) / 6);
                        var bgnum = (z - 1) * 6;
                        var ednum = bgnum + 6;
                        vm.currentpage = bgnum + 1;
                    }
                }else if(type == 'prev'){
                    if (vm.pagePrevNextFunc) {
                        vm.pagePrevNextFunc(event,'prev');
                    }
                    if (vm.currentpage > 6) {//如果最后面不必执行
                        var z = Math.ceil((vm.currentpage - 6) / 6);
                        var bgnum = (z - 1) * 6;
                        var ednum = bgnum + 6;
                        vm.currentpage = bgnum + 1;
                    }
                }
            }
            //模糊匹配页码翻页点击变换
            vm._fuzzypagechangeFunc = function(e,type){
                e.stopPropagation();
                var pagesize = Math.ceil(vm.fuzzyallsize / vm.showsize);
                var al = Math.ceil(pagesize / 6);
                if(type == 'next'){
                    if (vm.currentpage <= (al - 1) * 6) {//如果最后面不必执行
                        var z = Math.ceil((vm.fuzzycurrentpage + 6) / 6);
                        var bgnum = (z - 1) * 6;
                        var ednum = bgnum + 6;
                        vm.fuzzycurrentpage = bgnum + 1;
                    }
                }else if(type == 'prev'){
                    if (vm.fuzzycurrentpage > 6) {//如果最后面不必执行
                        var z = Math.ceil((vm.fuzzycurrentpage - 6) / 6);
                        var bgnum = (z - 1) * 6;
                        var ednum = bgnum + 6;
                        vm.fuzzycurrentpage = bgnum + 1;
                    }
                }
            }
            //根据dataSource构建数据结构
            //从VM的配置对象提取数据源, dataSource为配置项的data数组，但它不能直接使用，需要转换一下
            //fuzzyflag是否处于模糊匹配状态
            vm.getDataFromOption = function() {
                var dtype = "json";//dataType
                var gettype = "get";//ajax的type
                var v_name = "name";
                var v_value = "value";
                if (vm.currentpage == undefined) {
                    vm.currentpage = 1;
                }
                vm.normaloptions = [];
                if(vm.fuzzypagershow){
                    v_name = vm.fuzzysourceflag.name;
                    v_value = vm.fuzzysourceflag.value;
                }else{

                    v_name = vm.sourceFlag.name;
                    v_value = vm.sourceFlag.value;
                }
                if(vm.fuzzypagershow){
                    var pushdata = {};//传递的参数
                    //模糊匹配的情况
                    if (vm.fuzzyServerside) {
                        if (vm.fuzzypagesizeString) {//如果显示条数名称需要配置的情况
                            pushdata[vm.fuzzypagesizeString] = vm.showsize;
                        }
                        if (vm.fuzzycurrentpageString) {//如果当前显示页名称需要配置的情况
                            pushdata[vm.fuzzycurrentpageString] = vm.fuzzycurrentpage;
                        }
                        if (vm.fuzzyPushdata) {//有参数的话合并
                            for (var m in vm.fuzzyPushdata) {
                                if(vm.fuzzyPushdata.hasOwnProperty(m)){
                                    pushdata[m] = vm.fuzzyPushdata[m];
                                }
                            }
                        }
                        if (vm.fuzzypullDataFuncUrl != "") {
                            req.ajax({
                                async:false,
                                type: gettype,
                                url: vm.fuzzypullDataFuncUrl,
                                dataType: dtype,
                                data: pushdata,
                                success: function (ob) {
                                    if (ob[0].data) {
                                        if (ob[0].data && ob[0].data.length > 0) {
                                            var afterregdata = [];
                                            afterregdata = getdataFormReg(ob[0].data,vm.fuzzytext,v_name);
                                            vm.normaloptions = vm.getDataFromDatas(afterregdata,true);
                                            if(afterregdata.length<(ob[0])[vm.fuzzyallsizeStr]){
                                                vm.fuzzyallsize =  afterregdata.length;
                                            }else{
                                                vm.fuzzyallsize = (ob[0])[vm.fuzzyallsizeStr];
                                            }
                                        }
                                    }
                                }, error: function (e) {
                                    console.log('ajax获取分页失败.');
                                }
                            });
                        }
                    }else {
                        if(vm.fuzzydata != undefined && vm.fuzzydata.length>0) {
                            if (Array.isArray(vm.fuzzydata)) {
                                var fzarray = [];
                                fzarray = getdataFormReg(vm.fuzzydata,vm.fuzzytext,v_name);
                                var bgnum = (vm.fuzzycurrentpage - 1) * (vm.showsize);
                                for (var p = 0; p < fzarray.length; p++) {
                                    if (p >= bgnum && p < bgnum + vm.showsize) {
                                        var temp = new Object();
                                        temp.value = fzarray[p][v_value];
                                        temp.name = fzarray[p][v_name];
                                        if (temp) {
                                            vm.normaloptions.push(temp);
                                        }
                                    }
                                }
                                vm.fuzzyallsize = fzarray.length;
                            }
                        }
                    }
                    var usepagesize = Math.ceil(vm.fuzzyallsize / vm.showsize);
                    if((Math.ceil((vm.fuzzycurrentpage + 6) / 6)-1)*6>=vm.fuzzycurrentpage){
                        vm.pageNationMaker(usepagesize,vm.fuzzycurrentpage);
                    }
                }else{
                    var pushdata = {};//传递的参数
                    //正常的情况
                    if (vm.serverside) {
                        if (vm.pagesizeString) {//如果显示条数名称需要配置的情况
                            pushdata[vm.pagesizeString] = vm.showsize;
                        }
                        if (vm.currentpageString) {//如果当前显示页名称需要配置的情况
                            pushdata[vm.currentpageString] = vm.currentpage;
                        }
                        if (vm.pushdata) {//有参数的话合并
                            for (var m in vm.pushdata) {
                                if(vm.pushdata.hasOwnProperty(m)){
                                    pushdata[m] = vm.pushdata[m];
                                }
                            }
                        }
                        if (vm.pullDataFuncUrl != "") {
                            req.ajax({
                                async:false,
                                type: gettype,
                                url: vm.pullDataFuncUrl,
                                dataType: dtype,
                                data: pushdata,
                                success: function (ob) {
                                    if (ob[0].data) {
                                        if (ob[0].data && ob[0].data.length > 0) {
                                            vm.normaloptions = vm.getDataFromDatas(ob[0].data);
                                            vm.allsize = (ob[0])[vm.allsizeStr];
                                        }
                                    }
                                }, error: function (e) {
                                    console.log('ajax获取分页失败.');
                                }
                            });
                        }
                    } else {
                        if(vm.data != undefined && vm.data.length>0) {
                            if (Array.isArray(vm.data)) {
                                var bgnum = (vm.currentpage - 1) * (vm.showsize);
                                for (var p = 0; p < vm.data.length; p++) {
                                    if (p >= bgnum && p < bgnum + vm.showsize) {
                                        var temp = new Object();
                                        temp.value = vm.data[p][v_value];
                                        temp.name = vm.data[p][v_name];
                                        if (temp) {
                                            vm.normaloptions.push(temp);
                                        }
                                    }
                                }
                                vm.allsize = vm.data.length;
                            }
                        }
                    }
                    var usepagesize = Math.ceil(vm.allsize / vm.showsize);
                    if((Math.ceil((vm.currentpage + 6) / 6)-1)*6>=vm.currentpage){
                        vm.pageNationMaker(usepagesize,vm.currentpage);
                    }
                }
            }
            vm.getDataFromOption();
            vm.firstOpenFlag = false;
        },
        $ready: function (vm,elem,_out) {
            var _outervm = null;
            if(vm.outervmid != null && vm.outervmid != undefined){
                _outervm = avalon.vmodels[vm.outervmid];//获取外部VM
            }else{
                _outervm = _out[_out.length-1];//获取外部VM
            }
            var inputele = avalon.superGetElementeByClass(elem,'aoyou-simpledropdownpager-show-input');//获取textbox中的input的element
            vm.fuzzytext = _outervm.duplexValue;
            vm._optionClick = function(e,dt){//option的点击事件
                vm.fuzzytext = dt.name;
                _outervm[vm.duplexValue] = dt.name;
                e.stopPropagation();
                if(vm.optionClickFunc != _interface){
                    vm.optionClickFunc(dt);
                }
            }
            if(inputele != undefined && inputele.length>0){
                var fuzzyele = avalon.superGetElementeByClass(elem,'fuzinput')[0];
                fuzzyele.style.width = inputele[0].clientWidth - 10 + 'px';
                vm.contentclick = function(){
                    var zid = vm._getMaxzindex();
                    if(zid != undefined){
                        avalon.superGetElementeByClass(elem,'aoyou-simpledropdownpager')[0].style.zIndex = zid;
                    }
                    vm.isclickinput = true
                    vm.contentinputshow = false;
                    vm.fuzzypartshow = true;
                    setTimeout(function(){fuzzyele.focus();},100);
                }
            }
            avalon.bind(document, 'click', function () {
                if(vm.isclickinput!= true){
                    vm.fuzzypartshow = false;
                    vm.contentinputshow = true;
                    avalon.superGetElementeByClass(elem,'aoyou-simpledropdownpager')[0].style.zIndex = '';
                    if(vm.fuzzytext == ''){
                        _outervm[vm.duplexValue] = '';
                    }
                }else{
                    vm.isclickinput = false;
                }
            });
            vm.$watch("currentpage", function (a, b) {//监视当前页
                vm.getDataFromOption();
            });
            vm.$watch("fuzzycurrentpage", function (a, b) {//监视当前页
                vm.getDataFromOption();
            });
            vm.$watch("fuzzytext", function (a, b) {//监视当前页
                function searchForData(ob,flag){
                    ob.fuzzypagershow = flag;
                    ob.getDataFromOption();
                }
                if(a == ''){
                    setTimeout(function(){searchForData(vm,false);vm.currentpage = 1;},500);
                }else{
                    setTimeout(function(){searchForData(vm,true)},500);
                }
            });
        }
    })

    var widget = avalon.components["aoyou:simpledropdownpager"];
    return avalon;
})
