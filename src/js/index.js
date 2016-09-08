require(["/component/pager/avalon.pager"],function () {
    var vm = avalon.define({
        $id:"aoyouimage",
        $pageropt:{
            showPages:0,
            showJumper:true,
            showPageNumButtons:false,
            prevText:'<img src="../images/prebtn.png"/>',
            nextText:'<img src="../images/nextbtn.png"/>',
            $$template: function (tmpl) {
                return "<span class='pagershow'>显示</span><div class='pagersel' ms-hover='on'>20<ul ms-duplex='perPages'><li ms-repeat='options'>{{el.text}}</li></ul></div>" + tmpl
            },
            options:[20,50,100]
        }
    });
    avalon.scan(document.body,vm);
})

