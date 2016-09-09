require(["/component/base/mmRequest","/component/pager/avalon.pager"],function (req) {
    var vm = avalon.define({
        $id:"aoyouimage",
        filtertoggle:false,
        filtersjcss:'none',
        imgMarginLeft:'25px',
        tablist:true,
        changeperPage:function(p){//切换每页显示多少条
          avalon.vmodels['pager01'].perPages = p;
        },
        imagedata:[],
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
        }
    });
    vm.getImgInfo('../json/imginfo.json',{'pagenum':0});
    avalon.scan(document.body,vm);
})

