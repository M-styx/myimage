require(["/component/base/mmRequest","/component/pager/avalon.pager","/component/dialog/avalon.dialog","/component/textbox/avalon.textbox","/component/dropdowncheckbox/avalon.dropdowncheckbox"],function (req) {
    var vm = avalon.define({
        $id:"aoyouimage",
        filtertoggle:false,
        filtersjcss:'none',
        imgMarginLeft:'25px',
        tablist:true,
        isshowmask:false,
        changeperPage:function(p){//切换每页显示多少条
          avalon.vmodels['pager01'].perPages = p;
        },
        imagedata:[],
        imagetype:[],
        currentfilter:[],
        showfilter:false,
        showpager:true,
        showlist:true,
        shownoresult:false,
        noresulttxt:'"哥斯拉怪兽"',
        imageeditinfo:[],
        showdia: function (id) {
            avalon.vmodels[id].toggle = true;
        },
        checkimg:function(idx){
            vm.imagedata[idx]['check'] = (vm.imagedata[idx]['check'] == "unchecked"?"checked":"unchecked");
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
                type: 'POST',
                url: url,
                data: '',
                headers: {},
                success: function(dat, status, xhr) {
                    var redata = avalon.parseJSON(dat);
                    if(redata){
                        vm.imageeditinfo = redata.data;
                    }
                },
                error: function(dat) {
                    console.log('没有获取数据');
                }
            });
        },
        getImgType:function(url){
            req.ajax({
                type: 'POST',
                url: url,
                data: '',
                headers: {},
                success: function(dat, status, xhr) {
                    var redata = avalon.parseJSON(dat);
                    if(redata){
                        vm.imagetype = redata.data;
                    }
                },
                error: function(dat) {
                    console.log('没有获取数据');
                }
            });
        },
        getImgInfo:function(url,para){
            req.ajax({
                type: 'POST',
                url: url,
                data: para,
                headers: {},
                success: function(dat, status, xhr) {
                    var redata = avalon.parseJSON(dat);
                    if(redata){
                        vm.imagedata = redata.data;
                        avalon.vmodels['pager01'].totalItems = redata.total;
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
        $copyrightsrc:{
            width:286,
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
        changetab:function (val) {
            vm.tablist = val;
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
        }

    });
    vm.getImgInfo('../json/imginfo.json',{'pagenum':0});
    vm.getImgType('../json/imgtype.json');
    vm.getImageEditInfo('../json/imgeditinfo.json');
    avalon.scan(document.body,vm);
})

