//by hanggai

//静态数据
define(['avalon', '../base/normalThings','css!./avalon.singledatepicker.css'], function(avalon) {
    var lf = '<div ms-visible="showpk" class="singledatepicker" ms-css-width="cpwidth">'+
        '            <div class="singledatepicker-tt">'+
        '                <span class="icon-arr-left" ms-click="_linkageDatepicker(\'prev\',\'month\')"></span>'+
        '                <span class="icon-arr-right" ms-click="_linkageDatepicker(\'next\',\'month\')"></span>'+
        '                <label><span class="yeartitlespan"><input class="yeartitleinput" type="text" ms-duplex="useY"><span class="pointerspan"><i class="iconup" ms-click="_linkageDatepicker(\'next\',\'year\')"></i><i class="icondown" ms-click="_linkageDatepicker(\'prev\',\'year\')"></i></span></span><span class="monthtitletext">{{dataTable_title1}}</span></label>'+
        '            </div>'+
        '            <table class="aoyou-smartdatepicker-datetable1">'+
        '                <thead><tr>'+
        '                    <th class="live">日</th>'+
        '                    <th>一</th>'+
        '                    <th>二</th>'+
        '                    <th>三</th>'+
        '                    <th>四</th>'+
        '                    <th>五</th>'+
        '                    <th class="live">六</th>'+
        '                </tr></thead>'+
        '                <tr ms-repeat="dateTable_1">'+
        '                    <td ms-hover="{{stylehover}}" ms-class="{{el.dayStyle}}" ms-repeat="dateTable_1[$index]" ms-click="_checkDateOfthis(el.dayStr,$index,$outer.$index,el.arrname,1,el.originalIdx)" ms-attr-innerIndex="$index" ms-attr-outerIndex="$outer.$index" ms-attr-datestr="el.dayStr" ms-attr-arrnameidx="1"><b ms-if="el.useday"></b><a href="javascript:;"><span class="basetxt">{{el.dayStr==nowdateStr?"今天":el.daynum}}</span><span class="orangetxt" ms-if="el.price">￥{{el.price}}起</span><i ms-attr-title="el.festival" class="festival" ms-if="el.festival"></i></a></td>'+
        '                </tr>'+
        '            </table>'+
        '        </div>';
    var _interface = function () {}
    var mChineseName = ["","1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
    var now = new Date();
    var _CY = now.getFullYear();
    var _CM = now.getMonth()+1;
    var _CD = now.getDate();
    avalon.component("aoyou:singledatepicker", {
    cpwidth:'100%',//组件宽度
    showpk:true,//是否显示组件
    dateTable_1:[],//1号日历
    dataTable_title1:"未获取到年月信息",
    nowdateStr:_CY+'-'+ _CM+'-'+_CD,
    useM:0,//初始化正在使用的月份(一号日历)
    useY:0,//初始化正在使用的年份(一号日历)
    newAddDates:[],//非初始化插入的日期
    selectedDates:[],////选中的日期初始化空
    singleSelect:false,//是否单选默认否
    stylehover:'borderb',
    lowerlimitday:0,
    upperlimitday:0,
    aftercheckfunc:_interface,
    _checkDateOfthis:_interface,
    _calmaker:_interface,
    _dateinfo:_interface,
    _linkageDatepicker:_interface,
    checkedDates:null,//外部接口 初始化选中日期 arry['2014-11-1']
    datesinfor:null,//外部接口 初始化日期数据 object:['2014-5-1':{'price':'150','festival':'劳动节'}]
    _closepicker:_interface,//外部接口 关闭日期选择
    _openpicker:_interface,//外部接口 打开日期选择
        _togglepicker:_interface,//外部接口 打开或关闭日期选择
    $template: lf,
    $init: function(vm, el) {
        var CY = now.getFullYear();
        var CM = now.getMonth()+1;
        var CD = now.getDate();
        var LY = null;
        var LM = null;
        var LD = null;
        for(var i in vm) { 
            if (vm.hasOwnProperty(i) && typeof vm[i] === "function") { 
                vm[i] = vm[i].bind(vm) 
            } 
        } 
        if(vm.upperlimitday && typeof vm.upperlimitday == 'string'){//如果存在限制时间配置
            var _upperlimitday = new Date(vm.upperlimitday.replace(/-/,"/"));
            CY = _upperlimitday.getFullYear();
            CM = _upperlimitday.getMonth()+1;
            CD = _upperlimitday.getDate();
        }
        if(vm.lowerlimitday && typeof vm.lowerlimitday == 'string'){//如果存在限制时间配置
            var _lowerlimitday = new Date(vm.lowerlimitday.replace(/-/,"/"));
            LY = _lowerlimitday.getFullYear();
            LM = _lowerlimitday.getMonth()+1;
            LD = _lowerlimitday.getDate();
        }
        vm.useM = CM;
        vm.useY = CY;
        var _datepart = '';
        var _selectpart = '';
        var selectedDatesObj = {};//存放操作过的日期字典
        var temDates = {};//存放当前日历Vm的有效日期信息
        var datesInfoObj = {minmonth:CM,minyear:CY};
        var deleteDates = {};
            /*生成日历table不含表头 cy当前操作的年份 m当前操作的月份 tt当前操作的日历的头部--可选参数 aname当前转换到的日历arr的name*/                   
            vm._calmaker = function(cy,m,tt,aname){
                var staday = getStartWeek(cy,m);
                var mdays = getNowMonthDays(cy,m);
                var carr = [];
                var hasLower = false;
                var lday_date = "";//下限的日期
                var hasdinfo = false;
                if(vm.datesinfor != undefined && vm.datesinfor != null){
                    hasdinfo = true;
                }
                if(LY != null && LM !=null && LD !=null){
                    hasLower = true;
                    lday_date = new Date((LY+"/"+LM+"/"+LD));
                }
                temDates = {};
                    var d = 0;
                    for(var j=0;j<42;j++){
                        if(j>=staday && j<mdays+staday){
                            d++;
                            var o = new Object();
                            o.dayStyle = '';
                            o.daynum = d;
                            o.dayStr = cy+'-'+m+'-'+d;
                            var tempstr = o.dayStr.replace(/-/g,"/");
                            var thissingleday = new Date(tempstr);
                            if(hasLower== true && compareDateForUse(thissingleday,lday_date,true)){
                                o.dayStyle = 'nouse';
                            }else{
                                if(hasdinfo){//有外部数据
                                    var _dinfo = vm.datesinfor[o.dayStr];
                                    if(_dinfo != undefined){
                                        for(var q in _dinfo){
                                            if(_dinfo.hasOwnProperty(q)){
                                                o[q] = _dinfo[q];
                                            }
                                        }
                                    }
                                }
                                o.originalIdx = j;
                                if(thissingleday){
                                    o.dayName = thissingleday.getDay();
                                }
                                if((d<CD && m == CM) || (cy == CY && m < CM) || (cy<CY)){
                                    o.dayStyle = 'out';
                                }else{
                                    o.useday = true;//可以使用的天
                                    if(aname){
                                        o.arrname = aname;
                                    }
                                }
                                o.oldStyle = o.dayStyle;//记录原来的样式
                                temDates[o.dayStr] = {dayStr:o.dayStr};
                                temDates[o.dayStr].originalIdx = j;
                                var idxinfo = getIndexInfo(j);
                                if(idxinfo){
                                    temDates[o.dayStr].outidx = idxinfo[0];
                                    temDates[o.dayStr].inneridx = idxinfo[1];
                                }
                            }
                            carr.push(o);
                        }else{
                            if(j>=mdays){
                                var o = new Object();
                                o.dayStyle = 'nouse';
                                carr.push(o);
                            }else{;
                                carr.push({});
                            }
                            
                        }
                    }
                if(vm.checkedDates != undefined && vm.checkedDates != null){
                    var nowStr = CY+'-'+CM+'-'+CD;
                    for(var i= 0;i<vm.checkedDates.length;i++){
                        var thisDateStr = vm.checkedDates[i];
                        //不能是过去的时间无法选中
                        if(compareDateForUse(thisDateStr,nowStr)){
                            var tempDatestr = thisDateStr.split('-');
                            if(tempDatestr && tempDatestr.length==3){
                                if(!datesInfoObj.minDate){
                                    datesInfoObj.minDate = thisDateStr;
                                    datesInfoObj.minyear = tempDatestr[0];
                                    datesInfoObj.minmonth = tempDatestr[1];
                                }
                                if(compareDateForUse(datesInfoObj.minDate,thisDateStr)){
                                    datesInfoObj.minDate = vm.checkedDates[i];
                                    datesInfoObj.minyear = tempDatestr[0];
                                    datesInfoObj.minmonth = tempDatestr[1];
                                    }
                                }
                                var fla = false;
                                for(var b in vm.selectedDates){
                                    if(vm.selectedDates[b] == thisDateStr){
                                        fla = true;
                                        break;
                                    }
                                }
                                if(!fla){
                                    if(!deleteDates.hasOwnProperty(thisDateStr)){
                                        vm.selectedDates.push(thisDateStr);
                                    }else if(deleteDates[thisDateStr] == 1){
                                        vm.selectedDates.push(thisDateStr);
                                    }
                                }
                            if(temDates[thisDateStr]){
                                if(!selectedDatesObj[thisDateStr]){
                                    selectedDatesObj[thisDateStr] = [aname,temDates[thisDateStr].outidx,temDates[thisDateStr].inneridx,tt,temDates[thisDateStr].originalIdx];
                                }
                                }
                            }
                    }
                    if(!datesInfoObj.minDate){
                        datesInfoObj.minDate = nowStr;
                        datesInfoObj.minyear = CY;
                        datesInfoObj.minmonth = CM;
                    }                                
                }
                if(vm.newAddDates.length>0){
                    for(var q= 0 ;q<vm.newAddDates.length;q++){
                        if(temDates[vm.newAddDates[q]]){
                            if(!selectedDatesObj[vm.newAddDates[q]]){
                                selectedDatesObj[vm.newAddDates[q]] = [aname,temDates[vm.newAddDates[q]].outidx,temDates[vm.newAddDates[q]].inneridx,tt,temDates[vm.newAddDates[q]].originalIdx];
                            }
                        }
                    }
                }
                if(vm.selectedDates.length>0){
                    var selectedArr = vm.selectedDates;
                    if(tt){
                        for(var p = 0;p < selectedArr.length;p++){
                            if(selectedDatesObj[selectedArr[p]]){
                                var dtTitle = selectedDatesObj[selectedArr[p]][3];//根据表头在字典里查找设为选中
                                if(dtTitle == tt){                                
                                    carr[selectedDatesObj[selectedArr[p]][4]].dayStyle = 'selected';
                                    if(aname){//刷新arrname防止隔页删除的BUG
                                        selectedDatesObj[selectedArr[p]][0] = aname;
                                    }
                                }
                            }
                        }
                    }
                }
                var temp = sliceArr(carr);
                return temp;
            }
            
            vm._checkDateOfthis = function(thedate,innerIdx,outerIdx,arrname,datetitlenum,oid){
            if(arrname){
                    if(vm.singleSelect == true){//单选的时候
                        for(var z = 0;z<vm.selectedDates.length;z++){
                            var _ob = vm['dateTable_1'];
                            if(selectedDatesObj[vm.selectedDates[z]]){
                                var _outindex = selectedDatesObj[vm.selectedDates[z]][1];
                                var _innerindex = selectedDatesObj[vm.selectedDates[z]][2];
                                (_ob[_outindex][_innerindex]).dayStyle = '' ;
                            }
                        }
                        vm.selectedDates = [];
                        deleteDates = {};                        
                    }
                    var ds = vm[arrname][outerIdx][innerIdx].dayStyle;//获取style
                    if(ds.indexOf('lived') == '-1' && ds.indexOf('out') == '-1'){//以往的日期不让点
                        if(ds.indexOf('select') != '-1' && ds.indexOf('selected') != '-1'){
                            vm.selectedDates.remove(thedate);
                            deleteDates[thedate] = 0;
                            vm[arrname][outerIdx][innerIdx].dayStyle = vm[arrname][outerIdx][innerIdx].oldStyle;
                        }else{
                            vm.selectedDates.ensure(thedate);//无重复的添加
                            vm[arrname][outerIdx][innerIdx].dayStyle = 'selected';
                            if(vm['dataTable_title'+datetitlenum]){
                                selectedDatesObj[thedate] = [arrname,outerIdx,innerIdx,CY+vm['dataTable_title'+datetitlenum],oid];
                            }
                            deleteDates[thedate] = 1;
                        }
                    }
                    if(vm.aftercheckfunc != _interface){
                        vm.aftercheckfunc();
                    }
                }
            }
            
            //生成日历数据  chekcedDatesObj:已经选中的日期
            vm._dateinfo = function(m,y){
                vm.dataTable_title1 = '年'+mChineseName[m];//1表头日期
                vm.dateTable_1 = vm._calmaker(y,m,y+vm.dataTable_title1,'dateTable_1');
            }
            
            //日历联动切换
            vm._linkageDatepicker = function(changeDrec,changety){
                if(changeDrec == 'prev'){
                    if(changety == 'month'){
                        if(vm.useM>1){
                            vm.useM = parseInt(vm.useM)-1;
                        }else{
                            vm.useM = 12;
                            vm.useY = parseInt(vm.useY)-1;
                        }
                    }else if(changety == 'year'){
                        vm.useY = parseInt(vm.useY)-1;
                    }
                }else if(changeDrec == 'next'){
                    if(changety == 'month'){
                        if(vm.useM==12){
                            vm.useM = 1;
                            vm.useY = parseInt(vm.useY)+1;
                        }else{
                            vm.useM = parseInt(vm.useM)+1;
                        }
                    }else if(changety == 'year'){
                        vm.useY = parseInt(vm.useY)+1;
                    }
                }
                vm._dateinfo(vm.useM,vm.useY);
            }
            
            if(vm.checkedDates){
                vm._dateinfo(parseInt(datesInfoObj.minmonth),parseInt(datesInfoObj.minyear));//初始化当月当年
            }else{
                vm._dateinfo(CM,CY);//初始化当月当年
            }
    },
    $ready:function(vm){
        vm._openpicker = function(){
             vm.showpk = true;
        }
        vm._closepicker = function(){
            vm.showpk = false;
        }
        vm._togglepicker = function(){
            vm.showpk = !vm.showpk;
        }
    }
    });
    var widget = avalon.components["aoyou:singledatepicker"];
    return avalon
});


    //工具方法开始
    //获取该月一号是周几
    function getStartWeek(y, m) {
        var odatef = new Date();
        odatef.setFullYear(y);
        odatef.setDate(1);
        odatef.setMonth(m-1)
        var fday = odatef.getDay(); 
        return fday;
    }

    //获取当月的阳历天数
    function getNowMonthDays(year, month) {
        var isy = false;
        if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) isy = true;
        switch (month) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                return 31;
            case 4:
            case 6:
            case 9:
            case 11:
                return 30;
            case 2:
                return isy ? 29 : 28;
        }
    }

    /*拆分数组以适应avalon循环*/
    function sliceArr(darr){
        var tablearr = [];
        if(darr &&  darr.length >0){                    
            for(i=0;i<42;i+=7){
                tablearr.push(darr.slice(i,i+7));
            }
        }
        return tablearr;
    }

    /*比较日期大于等于*/
    function compareDateForUse(d1,d2,tp){
        if(tp){
            return Date.parse(d1)>Date.parse(d2);
        }else{
            return Date.parse(d1)>=Date.parse(d2);
        }
    }
    
    /*获取index*/
    function getIndexInfo(num){
        var a,b;
        for(var j=1;j<7;j++){
            if(num<j*7){
                if(num == 0){
                    a = 0;
                    b = 0;
                }else{
                    a = j-1;
                    b = num%7;
                }
                break;
            }
        }
        return [a,b];
    }
    
    /*根据日期获取数据并且可以加样式  依赖于jquery*/
    function getInfoFromDateTd(thes,vmobj,stylestr){
            var obj = [];
            var oid = avalon(thes[0]).attr('outerIndex');
            var inid = avalon(thes[0]).attr('innerIndex');
            var arrid = avalon(thes[0]).attr('arrnameidx');
            var obinside = vmobj['dateTable_'+arrid][oid][inid];
            obj = ['dateTable_'+arrid,oid,inid,vmobj['dataTable_title'+arrid],obinside.originalIdx];
            if(stylestr){
                obinside.dayStyle = stylestr;
            }
        return obj;
    }