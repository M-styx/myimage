require(["/component/pager/avalon.pager"],function () {
    var vm = avalon.define({
        $id:"aoyouimage",
        filtertoggle:false,
        filtersjcss:'none',
        imgMarginLeft:'25px',
        tablist:true,
        changeperPage:function(p){//切换每页显示多少条
          avalon.vmodels['pager01'].perPages = p;
        },
        imagedata:[
            {name:"米兰大教堂",type:"JPG",size:"1920*1280",space:"1.6M",lastupdate:"2016-08-19 12:07",check:"unchecked"},
            {name:"米兰大教堂",type:"JPG",size:"1920*1280",space:"1.6M",lastupdate:"2016-08-19 12:07",check:"unchecked"},
            {name:"米兰大教堂",type:"JPG",size:"1920*1280",space:"1.6M",lastupdate:"2016-08-19 12:07",check:"unchecked"}
        ],
        checkimg:function(idx){
            vm.imagedata[idx]['check'] = (vm.imagedata[idx]['check'] == "unchecked"?"checked":"unchecked");
        },
        checkallimg:function(){
            for(var i=0,j=vm.imagedata.length;i<j;i++){
                vm.imagedata[i]['check'] = 'checked';
            }
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
            onJump:function(){
                alert(10);
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
    avalon.scan(document.body,vm);
})

