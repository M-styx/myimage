require(["/component/base/mmRequest","/component/base/normalThings","/component/pager/avalon.pager","/component/dialog/avalon.dialog","/component/textbox/avalon.textbox","/component/dropdowncheckbox/avalon.dropdowncheckbox"],function (req) {
    function getTreeArr(_pid) {
        var arr = [];
        for(var i=0,j=vm.alltreeinfo.$model.length;i<j;i++){
            if(vm.alltreeinfo[i].pId == _pid){
                arr.push(vm.alltreeinfo.$model[i]);
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
        showdia: function (id) {
            avalon.vmodels[id].toggle = true;
        },
        checkimg:function(idx){
            vm.imagedata[idx]['check'] = (vm.imagedata[idx]['check'] == "unchecked"?"checked":"unchecked");
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
            }else{
                vm.checkallclass = 'unchecked'
                for(var i=0,j=vm.imagedata.length;i<j;i++){
                    vm.imagedata[i]['check'] = 'unchecked';
                }
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
                    }
                },
                error: function(dat) {
                    console.log('没有获取数据');
                }
            });
        },
        $pageropt:{
            showPages:0,
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
            }
        },
        $imgeditopt:{
            width:620,
            title:"编辑图片",
            onClose:function () {
                vm.isshowmask = false;
            }
        },
        $imguploadopt:{
            width:'600px',
            height:'500px',
            title:"选择图片",
            confirmText: "确定",
            cancelText: "取消",
            onClose:function () {
                vm.isshowmask = false;
                vm.treelistnames = [{id:268,name:"总目录",pid:0}];
                vm.temparr = vm.starttreearr.$model;
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
            var src  = this.currentSrc || this.src;
            vm.enlargesrc = "url("+src+")";
            var left = this.parentElement.offsetLeft + 170 + this.parentElement.parentElement.offsetLeft;
            var top = this.offsetTop + this.parentElement.parentElement.offsetTop - this.clientHeight * 1.5;
            vm.enlargeheight = this.clientHeight * 2.5;
            vm.enlargewidth = this.clientWidth * 2.5;
            if(left + this.clientWidth * 2.5 >window.innerWidth){
                left = left-170-this.clientWidth * 2.5
            }
            if(top<window.pageYOffset){
                top = window.pageYOffset
            }

            vm.enlargeleft = left;
            vm.enlargetop = top>0?top:0;

            if(type == 1){
                setTimeout(function () {
                    vm.showenlarge = true;
                }, 200);
            }else{
                vm.showenlarge = false;
            }
        },
        backtop:function () {  //回到顶部
            //document.documentElement.scrollTop = document.body.scrollTop =0;
            //document.body.scrollTop =0;
            avalon.startrun(document.body,"scrollTop",0,10,null) ;
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
                                vm.temparr.push({name:vm.alltreeinfo[i].name,id:vm.alltreeinfo[i].id});
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
        clicktree:function(idx,name,pid){
            if(vm.treelistnames.length>0){
                var lastObj = vm.treelistnames[vm.treelistnames.length-1];
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
    avalon.scan(document.body,vm);
});




