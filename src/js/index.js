var imgeditstr = '<div class="dlgmaininfo clearfix">'+
    '          <div class="dlgimg"><img src="../images/img4-3.png" width="160px" height="120px"><span>编号: 93487532</span></div>'+
    '          <div class="dlginfo">'+
    '            <aoyou:textbox fronttitle="名称:" width="270px" value="imageeditinfo[0].name"></aoyou:textbox>'+
    '            <aoyou:textbox fronttitle="上传时间:" width="270px" value="imageeditinfo[0].time"></aoyou:textbox>'+
    '            <aoyou:textbox fronttitle="图片所属:" width="270px" value="imageeditinfo[0].imgsource"></aoyou:textbox>'+
    '            <aoyou:textbox fronttitle="类型:" width="270px" value="imageeditinfo[0].type"></aoyou:textbox>'+
    '            <aoyou:textbox fronttitle="尺寸:" width="270px" value="imageeditinfo[0].size"></aoyou:textbox>'+
    '            <aoyou:textbox fronttitle="大小:" width="270px" value="imageeditinfo[0].space"></aoyou:textbox>'+
    '          </div>'+
    '        </div>'+
    '        <div class="dlgother">'+
    '          <p>名称</p>'+
    '          <aoyou:textbox width="360px" value="imageeditinfo[0].name"></aoyou:textbox>'+
    '          <p class="keywords">关键词</p>'+
    '          <aoyou:textbox width="360px" type="textarea" height="50px" value="imageeditinfo[0].keywords" class="textarea"></aoyou:textbox><span class="exinfo">例如：景色、大海、山脉、自然</span>'+
    '          <aoyou:dropdowncheckbox config="$copyrightsrc" fronttitle="版权来源:" value="imageeditinfo[0].copyrightsrc"></aoyou:dropdowncheckbox>'+
    '          <div class="copyrighttime"><b>版权有效期:</b><i ms-class="checked:imageeditinfo[0].copyrighttime" ms-click="copyrightforever">永久使用</i></div>'+
    '          <aoyou:textbox fronttitle="摄影师:" width="265px" value="imageeditinfo[0].camerist"></aoyou:textbox>'+
    '        </div>'+
    '        <div class="dlgbtn">'+
    '          <button class="savebtn">保 存</button><span ms-click="saveclosefun" ms-class="checked:saveclose">保存并关闭</span><span class="uploader">上传者：白雪</span>'+
    '        </div>';
var uploadcontentstr = '<div class="dlgulcontent">'+
    '        <div class="dlgultarget"><span>目标位置</span><i>制定要存储文档的目标地理位置标签</i>'+
    '          <p>../<a ms-repeat="treelistnames" ms-visible="$index&gt;0">{{el.name}}/</a></p>'+
    '          <div ms-on-mouseenter="filterchooseon($event)" ms-on-mouseleave="filterchooseout" class="choosefilter"><span class="choose">选择</span>'+
    '            <div ms-visible="filterchoosetoggle" class="filtertree"><span ms-css-display="filterchoosesjcss" class="sj"></span>'+
    '              <p>全部</p>'+
    '              <div class="catalog"><a href="#" ms-click="changeTree(treelistnames.length-2)" class="first">返回上一级</a><a ms-repeat="treelistnames" ms-click="changeTree($index)" ms-class="current:$index==treelistnames.length-1" href="#"><b ms-if="$index>0">>&nbsp;</b>  {{el.name}}</a></div>'+
    '              <div class="list">'+
    '                <ul>'+
    '                  <li ms-repeat="temparr"><span ms-class="checked:el.checked"></span><i ms-click="clicktree(el.id,el.name,el.pId,$index)">{{el.name}}</i></li>'+
    '                </ul>'+
    '              </div>'+
    '            </div>'+
    '          </div>'+
    '        </div>'+
    '        <div class="dlgulchoose"><span>上传图片</span><i>浏览要上载的图片,支持多选</i><br>'+
    '          <aoyou:fileuploader config="$fileuploaderconfig" $id="uploader1"></aoyou:fileuploader><b>{{uploadingfiles.length>0?\'选中\'+uploadingfiles.length+\'张\':\'未选择任何文件\'}}</b>'+
    '        </div>'+
    '        <div class="dlguldetail">'+
    '          <ul>'+
    '            <li ms-repeat="uploadingfiles">{{el.name}}</li>'+
    '          </ul>'+
    '        </div>'+
    '      </div>';
avalon.library("aoyou", {
    $ready: function () {
        avalon.log("控件已经构建完毕")
    }
});
require(["/component/base/mmRequest","/component/base/normalThings","/component/pager/avalon.pager","/component/dialog/avalon.dialog","/component/textbox/avalon.textbox","/component/dropdowncheckbox/avalon.dropdowncheckbox","/component/fileuploader/avalon.fileuploader"],function (req) {
    function getTreeArr(_pid) {
        var arr = [];
        for(var i=0,j=vm.alltreeinfo.$model.length;i<j;i++){
            if(vm.alltreeinfo[i].pId == _pid){
                var _obj = vm.alltreeinfo.$model[i];
                _obj.checked=false
                arr.push(_obj);
            }
        }
        return arr;
    }
    var vm = avalon.define({
        $id:"aoyouimage",
        filtertoggle:false,  //筛选框是否出现
        filtersjcss:'none', //筛选 小三角的css
        tablist:true, //是否是列表样式
        isshowmask:false, //是否显示黑色浮层
        changeperPage:function(p){//切换每页显示多少条
            avalon.vmodels['pager01'].perPages = p;
            avalon.vmodels['pager02'].perPages = p;
        },
        imagedata:[],  //图片数据
        imagetype:[],  //筛选数据
        currentfilter:[], //当前选中的筛选条件
        showfilter:false, //是否显示筛选结果
        showpager:true, //是否显示分页
        showlist:true,  //是否显示列表项
        shownoresult:false, //是否显示无结果样式
        searchreq:'', //查询条件存储
        noresulttxt:'"哥斯拉怪兽"', //没有查询结果显示文字
        imageeditinfo:[], //图片编辑信息
        enlargeenable:false,//是否允许图片预览
        showenlarge:false, //是否显示放大图片
        enlargeleft:'', //放大图片的定位
        enlargetop:'', //放大图片的定位
        enlargeheight:'',//放大图片的高度
        enlargewidth:'', //放大图片的宽度
        enlargesrc:'',//放大图片的路径
        showpagerb:false,//是否显示底部分页
        filterchoosesjcss:false, //是否显示目录三角
        filterchoosetoggle:false, //是否显示目录
        settimeoutname:'',//设置延时名称
        alreadycheck:0, //已选中多少项
        baseinfodetail:false,//基本信息页面 是否展开详情
        saveclose:true,//是否允许保存并关闭
        showdia: function (id) {
            avalon.vmodels[id].toggle = true;
        },
        checkimg:function(idx){
            if(vm.imagedata[idx]['check'] == "unchecked"){
                vm.imagedata[idx]['check'] = "checked";
                vm.alreadycheck++;
            }else{
                vm.imagedata[idx]['check'] = "unchecked";
                vm.alreadycheck--;
                vm.alreadycheck = vm.alreadycheck<0?0:vm.alreadycheck;
            }
        },
        checkenlarge:function () {
            vm.enlargeenable = !vm.enlargeenable;
        },
        checkallclass:"unchecked",
        checkallimg:function(){
            if(vm.checkallclass == 'unchecked'){
                vm.checkallclass = 'checked'
                for(var i=0,j=vm.imagedata.length;i<j;i++){
                    vm.imagedata[i]['check'] = 'checked';
                }
                vm.alreadycheck = vm.imagedata.length;
            }else{
                vm.checkallclass = 'unchecked'
                for(var i=0,j=vm.imagedata.length;i<j;i++){
                    vm.imagedata[i]['check'] = 'unchecked';
                }
                vm.alreadycheck = 0;
            }
        },
        getImageEditInfo:function(url){
            req.ajax({
                type: 'GET',
                url: url,
                data: '',
                headers: {},
                dataType:"json",
                success: function(dat, status, xhr) {
                    //var redata = avalon.parseJSON(dat);
                    if(dat){
                        vm.imageeditinfo = dat.data;
                    }
                },
                error: function(dat) {
                    console.log('没有获取数据');
                }
            });
        },
        getImgType:function(url){
            req.ajax({
                type: 'GET',
                url: url,
                data: '',
                headers: {},
                dataType:"json",
                success: function(dat, status, xhr) {
                    if(dat){
                        vm.imagetype = dat.data;
                    }
                },
                error: function(dat) {
                    console.log('没有获取数据');
                }
            });
        },
        getImgInfo:function(url,para){
            req.ajax({
                type: 'GET',
                url: url,
                data: para,
                headers: {},
                dataType:"json",
                success: function(dat, status, xhr) {
                    if(dat){
                        vm.imagedata = dat.data;
                        avalon.vmodels['pager01'].totalItems = dat.total;
                        avalon.vmodels['pager02'].totalItems = dat.total;
                    }
                },
                error: function(dat) {
                    console.log('没有获取数据');
                }
            });
        },
        $pageropt:{
            showPages:0,
            perPages:12,
            showJumper:true,
            showPageNumButtons:false,
            prevText:'<img src="../images/prebtn.png"/>',
            nextText:'<img src="../images/nextbtn.png"/>',
            $$template: function (tmpl) {
                return "<span class='pagershow'>显示</span><div class='pagersel' ms-hover='on'>{{perPages}}<ul><li ms-click='changeperPage(el.text)' ms-repeat='options'>{{el.text}}</li></ul></div>" + tmpl
            },
            options:[20,50,100],
            onJump:function(ev,pg){
                vm.getImgInfo('../json/imginfo.json',{'pagenum':pg._currentPage});
                avalon.vmodels['pager01'].currentPage = pg._currentPage;
                avalon.vmodels['pager02'].currentPage = pg._currentPage;
            }
        },
        $imgeditopt:{
            content:imgeditstr,
            width:620,
            title:"编辑图片",
            onClose:function () {
                vm.isshowmask = false;
                document.body.style.overflow = 'auto';
            }
        },
        $imguploadopt:{
            content:uploadcontentstr,
            width:600,
            height:'500px',
            title:"选择图片",
            confirmText: "确定",
            cancelText: "取消",
            onClose:function () {
                vm.isshowmask = false;
                vm.treelistnames = [{id:268,name:"总目录",pid:0}];
                vm.temparr = vm.starttreearr.$model;
                vm.uploadingfiles = [];
            }
        },
        $copyrightsrc:{
            width:283,
            singleselect:true,
            sourceFlag:{value:"id",text:"name"},
            dataSource:[{name:'壹图',id:1},{name:'视觉中国',id:2},{name:'旅游局',id:3},{name:'供应商',id:4},{name:'个人',id:5}]
        },
        filteron:function (e) {
            vm.filtertoggle = true;
            vm.filtersjcss = "inline-block";
            e.stopPropagation();
        },
        filterout:function () {
            setTimeout(function () {
                vm.filtertoggle = false;
                vm.filtersjcss = 'none';
            },100);
        },
        filterchooseon:function (e) {
            vm.filterchoosetoggle = true;
            vm.filterchoosesjcss = "inline-block";
            e.stopPropagation();
        },
        filterchooseout:function () {
            setTimeout(function () {
                vm.filterchoosetoggle = false;
                vm.filterchoosesjcss = 'none';
            },100);
        },
        changetab:function (val) {
            vm.tablist = val;
            if(val){
                vm.showenlarge = false;
            }
        },
        checktype:function(idx,outer){
            var newarr = [];
            vm.imagetype[outer].info[idx]['check'] = !vm.imagetype[outer].info[idx]['check'];
            if(vm.imagetype[outer].info[idx]['check']){
                vm.currentfilter.push({"name":vm.imagetype[outer].info[idx]['type'],"index":idx,"outer":outer})
                vm.showfilter = true;
            }else{
                for(var i=0;i<vm.currentfilter.length;i++){
                    if(vm.currentfilter[i].name==vm.imagetype[outer].info[idx]['type']){
                        if(vm.currentfilter[i].index==idx && vm.currentfilter[i].outer == outer)
                            newarr.push(vm.currentfilter[i])
                    }
                }
                vm.currentfilter.removeAll(newarr);
                if(vm.currentfilter.length==0){
                    vm.showfilter = false;
                }
            }
        },
        removefilter:function (name,idx,outer) {
            var newarr = [];
            vm.imagetype[outer].info[idx]['check'] = !vm.imagetype[outer].info[idx]['check'];

            for(var i=0;i<vm.currentfilter.length;i++){
                if(vm.currentfilter[i].name==vm.imagetype[outer].info[idx]['type']){
                    if(vm.currentfilter[i].index==idx && vm.currentfilter[i].outer == outer)
                        newarr.push(vm.currentfilter[i])
                }
            }
            vm.currentfilter.removeAll(newarr);
            if(vm.currentfilter.length==0){
                vm.showfilter = false;
            }
        },
        removefilterall:function () {
            vm.currentfilter.removeAll();
            for(var i=0;i<vm.imagetype.length;i++){
                for(var j=0;j<vm.imagetype[i].info.length;j++){
                    vm.imagetype[i].info[j]['check'] = false;
                }
            }
            if(vm.currentfilter.length==0){
                vm.showfilter = false;
            }
        },
        edit:function (idx) {
            vm.isshowmask = true;
            vm.showdia('imgedit');
            document.body.style.overflow = 'hidden';
        },
        del:function (idx) {
            vm.imagedata.removeAt(idx);
        },
        search:function () {
            if(vm.searchreq=="咯咯咯"){
                vm.showlist = false;
                vm.shownoresult = true;
            }else{
                vm.showlist = true;
                vm.shownoresult = false;
            }
        },
        enlarge:function (type,idx) {
            //console.log(document.documentElement.scrollTop+"-----"+document.body.scrollTop);
            var pageWidth = window.innerWidth;
            var pageHeight = window.innerHeight;
            if(typeof pageWidth != "number"){
                if(document.compatMode == "number"){
                    pageWidth = document.documentElement.clientWidth;
                    pageHeight = document.documentElement.clientHeight;
                }else{
                    pageWidth = document.body.clientWidth;
                    pageHeight = document.body.clientHeight;
                }
            }
            var scrollTop=window.pageYoffset || (document.body.scrollTop+document.documentElement.scrollTop)

            if(type==1){
                var src  = this.currentSrc || this.src;
                vm.enlargesrc = "url("+src+")";
                var left = this.parentElement.offsetLeft + 170 + this.parentElement.parentElement.offsetLeft;
                var top = this.offsetTop + this.parentElement.parentElement.offsetTop - this.clientHeight * 1.5;
                vm.enlargeheight = this.clientHeight * 2.5;
                vm.enlargewidth = this.clientWidth * 2.5;
                if(left + this.clientWidth * 2.5 >pageWidth){
                    left = left-170-this.clientWidth * 2.5
                }
                if(top<scrollTop){
                    top = scrollTop
                }
                vm.enlargeleft = left;
                vm.enlargetop = top>0?top:0;
                vm.settimeoutname = setTimeout(function () {
                    vm.showenlarge = true;
                },1000)
            }else{
                clearTimeout(vm.settimeoutname);
                vm.showenlarge = false;
            }
        },
        backtop:function () {  //回到顶部
            //document.documentElement.scrollTop = document.body.scrollTop =0;
            //document.body.scrollTop =0;
            avalon.startrun(document.body,"scrollTop",0,4,null) ;
        },
        uploadfile:function () {
            vm.isshowmask = true;
            vm.showdia('imgupload');
        },
        getTreeJson:function(url,bgidx){
            req.ajax({
                type: 'GET',
                url: url,
                data: '',
                headers: {},
                dataType:"json",
                success: function(dat, status, xhr) {
                    if(dat){
                        vm.alltreeinfo = dat;
                        for(var i=0,j=vm.alltreeinfo.length;i<j;i++){
                            if(vm.alltreeinfo[i].pId == bgidx){
                                vm.temparr.push({name:vm.alltreeinfo[i].name,id:vm.alltreeinfo[i].id,checked:false});
                                vm.starttreearr.push({name:vm.alltreeinfo[i].name,id:vm.alltreeinfo[i].id});
                            }
                        }
                    }
                },
                error: function(dat) {
                    console.log('没有获取数据');
                }
            });
        },
        treelistnames:[{id:268,name:"总目录",pid:0}],
        alltreeinfo:[],
        temparr:[],
        starttreearr:[],
        clicktree:function(idx,name,pid,arridx){
            if(vm.treelistnames.length>0){
                var lastObj = vm.treelistnames[vm.treelistnames.length-1];
                for(var p=0,q=vm.temparr.length;p<q;p++){
                    if(vm.temparr[p].checked == true){
                        vm.temparr[p].checked = false;
                        break;
                    }
                }
                vm.temparr[arridx].checked = true;
                if(lastObj.id != idx){
                    if(lastObj.pid == pid){
                        vm.treelistnames.removeAt(vm.treelistnames.length-1);
                        vm.treelistnames.ensure({id:idx,name:name,pid:pid});
                    }else{
                        vm.treelistnames.ensure({id:idx,name:name,pid:pid});
                    }
                    var resultarr =  getTreeArr(idx);
                    if(resultarr && resultarr.length>0){
                        vm.temparr = resultarr;
                    }
                }
            }else{
                vm.treelistnames.ensure({id:idx,name:name,pid:pid});
                var resultarr =  getTreeArr(idx);
                if(resultarr && resultarr.length>0){
                    vm.temparr = resultarr;
                }
            }
        },
        changeTree:function(arrayidx){
            if(vm.treelistnames.length>0 && vm.treelistnames[arrayidx] != undefined){
                var _idx = vm.treelistnames[arrayidx].id;
                vm.treelistnames.splice(arrayidx+1,vm.treelistnames.length);
                var resultarr =  getTreeArr(_idx);
                if(resultarr && resultarr.length>0){
                    vm.temparr = resultarr;
                }
            }
        },
        togglebaseinfo:function () {
            vm.baseinfodetail = !vm.baseinfodetail;
        },
        download:function (url) {
            
        },
        copyrightforever:function () {
            vm.imageeditinfo[0].copyrighttime = !vm.imageeditinfo[0].copyrighttime;
        },
        saveclosefun:function () {
            vm.saveclose = !vm.saveclose;
        },
        deletemany:function () {
            for(var i=vm.imagedata.length-1;i>=0;i--){
                if(vm.imagedata.length>i){
                    if(vm.imagedata[i].check=="checked"){
                        vm.imagedata.removeAt(i);
                    }
                }
            }
        },
        downloadmany:function () {
            alert("打包下载")
        },
        tzedit:function (idx) {
            var url = window.location.href;
            if(url.indexOf('index')>0)
                url = url.replace('index','detail');
            window.location.href = url;
        },
        returnmain:function () {
            var url = window.location.href;
            if(url.indexOf('detail')>0)
                url = url.replace('detail','index');
            window.location.href = url;
        },
        uploadingfiles:[],
        $fileuploaderconfig:{
            uploadallbuttonshow:false,
            addButtonText:'选择文件',
            acceptFileTypes: "image.*,*.txt,*.js",
//                        serverConfig: {
//                            url: "../../Handler1.ashx",
//                            userName: undefined,
//                            password: undefined,
//                            keyGenUrl: "../../getFileKey.ashx"
//                        },
            onFileOverSize: function (fileObj) {
                alert(fileObj.name+"超出了文件尺寸限制")
            },
            onFilePoolOverSize: function (fileObj, poolSize) {
                alert("文件缓存池达已满，不能继续添加文件。")
            },
            onSameFileAdded: function () {
                alert("不能添加相同的文件");
            },
            showPreview:false,
            enableRemoteKeyGen: false,
            chunked: true,
            chunkSize: 1024*1024,
            getFileMessageText:function(fileObj){
                vm.uploadingfiles.push({name:fileObj.name});
                console.log(fileObj);
            }
        }
    });
    vm.getImgInfo('../json/imginfo.json',{'pagenum':0});
    vm.getImgType('../json/imgtype.json');
    vm.getImageEditInfo('../json/imgeditinfo.json');
    vm.getTreeJson('../json/testtreejson.json',268);
    window.onscroll = function(){

        var t = document.documentElement.scrollTop || document.body.scrollTop;
        if( t >= 35 ) {
            vm.showpagerb = true;
        } else {
            vm.showpagerb = false;
        }
    }
    avalon.scan();
});




