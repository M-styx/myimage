//by hanggai
define(['avalon', '../base/normalThings','css!./avalon.smartdatepicker.css'], function(avalon) {
    //静态数据
    var tempstr = '<div class="smartdatepicker"><div class="lcontent">'+
'    <div class="clearfix">'+
'        <div class="smartdatepicker-con-fl">'+
'            <div class="smartdatepicker-tt">'+
'                <span class="icon-arr-leftdb" ms-click="_linkageDatepicker(\'prev\',\'year\')"></span>'+
'                <span class="icon-arr-left" ms-click="_linkageDatepicker(\'prev\',\'month\')"></span>'+
'                <label>{{dataTable_title1}}</label>'+
'            </div>'+
'            <table class="aoyou-smartdatepicker-datetable1">'+
'                <tr>'+
'                    <td class="live">日</td>'+
'                    <td>一</td>'+
'                    <td>二</td>'+
'                    <td>三</td>'+
'                    <td>四</td>'+
'                    <td>五</td>'+
'                    <td class="live">六</td>'+
'                </tr>'+
'                <tr ms-repeat="dateTable_1">'+
'                    <td ms-class="{{el.dayStyle}}" ms-repeat="dateTable_1[$index]" ms-on-click="_checkDateOfthis($event,el.dayStr,$index,$outer.$index,el.arrname,1,el.originalIdx)" ms-attr-innerIndex="$index" ms-attr-outerIndex="$outer.$index" ms-attr-datestr="el.dayStr" ms-attr-arrnameidx="1">{{el.daynum}}</td>'+
'                </tr>'+
'            </table>'+
'        </div>'+
'        <div class="smartdatepicker-con-fr">'+
'            <div class="smartdatepicker-tt">'+
'                <label>{{dataTable_title2}}</label>'+
'                <span class="icon-arr-right" ms-click="_linkageDatepicker(\'next\',\'month\')"></span>'+
'                <span class="icon-arr-rightdb" ms-click="_linkageDatepicker(\'next\',\'year\')"></span>'+
'            </div>'+
'            <table class="aoyou-smartdatepicker-datetable2">'+
'                <tr>'+
'                    <td class="live">日</td>'+
'                    <td>一</td>'+
'                    <td>二</td>'+
'                    <td>三</td>'+
'                    <td>四</td>'+
'                    <td>五</td>'+
'                    <td class="live">六</td>'+
'                </tr>'+
'                <tr ms-repeat="dateTable_2">'+
'                    <td ms-class="{{el.dayStyle}}" ms-repeat="dateTable_2[$index]" ms-on-click="_checkDateOfthis($event,el.dayStr,$index,$outer.$index,el.arrname,2,el.originalIdx)" ms-attr-innerIndex="$index" ms-attr-outerIndex="$outer.$index" ms-attr-datestr="el.dayStr" ms-attr-arrnameidx="2" ms-attr-arrname="el.arrname">{{el.daynum}}</td>'+
'                </tr>'+
'            </table>'+
'        </div>'+
'    </div>'+
'</div><div class="rcontent dateselect">'+
'    <div class="title-tt"><span class="tt-left">已选中日期</span><em'+
'            class="tt-right">清空<i'+
'            class="icon-del" ms-click="_emptySelectedDates()"></i></em></div>'+
'    <ul class="list-vertical">'+
'        <li ms-repeat="selectedDates" ms-hover="active"><i class="icon-delet" ms-click="deletFormArr($remove,$index)"></i>{{selectedDates[$index]}}</li>'+
'    </ul>'+
'</div></div>';
    var _interface = function(){};
    var mChineseName = ["","一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
    var now = new Date();
    var CY = now.getFullYear();
    var CM = now.getMonth()+1;
    var CD = now.getDate();
    avalon.component("aoyou:smartdatepicker", {
    dateTable_1:[],//1号日历
    dateTable_2:[],//2号日历
    dataTable_title1:"未获取到年月信息",
    dataTable_title2:"未获取到年月信息",
    useM:CM,//初始化正在使用的月份(一号日历)
    useY:CY,//初始化正在使用的年份(一号日历)
    newAddDates:[],//非初始化插入的日期
    selectedDates:[],//选中的日期
    _checkDateOfthis:_interface,
    _dateinfo:_interface,
    deletFormArr:_interface,
    _addDatesInfo:_interface,
    _emptySelectedDates:_interface,
    _linkageDatepicker:_interface,
    $template: tempstr,
    $init: function(vm, el) {
        var _datepart = '';
        var _selectpart = '';
        var selectedDates = [];//选中的日期初始化空
        var selectedDatesObj = {};//存放操作过的日期字典
        var temDates = {};//存放当前日历Vm的有效日期信息
        var datesInfoObj = {minmonth:CM,minyear:CY};
        var deleteDates = {};
            /*生成日历table不含表头 cy当前操作的年份 m当前操作的月份 tt当前操作的日历的头部--可选参数 aname当前转换到的日历arr的name*/                   
            _calmaker = function(cy,m,tt,aname){
                var staday = getStartWeek(cy,m);
                var mdays = getNowMonthDays(cy,m);
                var carr = [];
                temDates = {};
                    var d = 0;
                    for(var j=0;j<42;j++){
                        if(j>=staday && j<mdays+staday){
                            d++;
                            var o = new Object();
                            o.dayStyle = '';
                            o.daynum = d;
                            o.dayStr = cy+'-'+m+'-'+d;
                            o.originalIdx = j;
                            if(aname){
                                o.arrname = aname;
                            }
                            var tempstr = o.dayStr.replace(/-/g,"/");
                            var thissingleday = new Date(tempstr);
                            if(thissingleday){
                                o.dayName = thissingleday.getDay();
                            }
                            if(d == CD && m == CM && cy == CY){
                                o.dayStyle = 'now';
                            }
                            if((d<CD && m == CM) || (cy == CY && m < CM) || (cy<CY)){
                                if((o.dayName == 0) || (o.dayName == 6)){
                                    o.dayStyle = 'lived'; 
                                }else{
                                    o.dayStyle = 'out';
                                }
                            }else{
                                if((o.dayName == 0) || (o.dayName == 6)){
                                    o.dayStyle = 'live'; 
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
                            carr.push(o); 
                        }else{
                            carr.push({});
                        }
                    }
                if(vm.checkedDates){
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
            
            vm._checkDateOfthis = function(ev,thedate,innerIdx,outerIdx,arrname,datetitlenum,oid){
                ev.stopPropagation();
            if(arrname){
                    var ds = vm[arrname][outerIdx][innerIdx].dayStyle;//获取style
                    if(ds.indexOf('lived') == '-1' && ds.indexOf('out') == '-1'){//以往的日期不让点
                        var cc = avalon.normalGetElementeByClass('.select'); 
                        if(cc[0]){
                            var lastinnerIndex = avalon(cc[0]).attr('innerIndex');//上个选中框的坐标
                            var lastouterIndex = avalon(cc[0]).attr('outerIndex');
                            var lastArrName = 'dateTable_'+avalon(cc[0]).attr('arrnameidx');
                            var lastStyle = vm[lastArrName][lastouterIndex][lastinnerIndex].dayStyle;
                            if(lastStyle.indexOf('selected') != '-1'){//如果是选过的保持选过的状态
                                vm[lastArrName][lastouterIndex][lastinnerIndex].dayStyle = 'selected';
                            }else{//不是的话恢复到初始状态
                                vm[lastArrName][lastouterIndex][lastinnerIndex].dayStyle = vm[lastArrName][lastouterIndex][lastinnerIndex].oldStyle;
                                deleteDates[thedate] = 0;
                            }
                        }
                        if(ds.indexOf('select') != '-1' && ds.indexOf('selected') != '-1'){
                            vm.selectedDates.remove(thedate);
                            deleteDates[thedate] = 0;
                            vm[arrname][outerIdx][innerIdx].dayStyle = vm[arrname][outerIdx][innerIdx].oldStyle;
                        }else{                    
                            if(vm.selectedDates.size()==60){
                                alert("已达到最大可维护出发日期60个!");
                            }else{
                                vm.selectedDates.ensure(thedate);//无重复的添加
                                vm[arrname][outerIdx][innerIdx].dayStyle = 'selected';
                                if(vm['dataTable_title'+datetitlenum]){                                    
                                    selectedDatesObj[thedate] = [arrname,outerIdx,innerIdx,vm['dataTable_title'+datetitlenum],oid];
                                }
                                deleteDates[thedate] = 1;
                            }
                        }
                        //只要点击都会有框
                        if(vm[arrname][outerIdx][innerIdx].dayStyle == ""){
                            vm[arrname][outerIdx][innerIdx].dayStyle = 'select';
                        }else{                        
                            vm[arrname][outerIdx][innerIdx].dayStyle += ' select';
                        }
                    }
                }
        }
            
            //生成日历数据  chekcedDatesObj:已经选中的日期
            vm._dateinfo = function(m,y){
                vm.dataTable_title1 = mChineseName[m]+" "+y;//1表头日期
                vm.dateTable_1 = _calmaker(y,m,vm.dataTable_title1,'dateTable_1');
                if(m == 12){//12月的时候顺延到下一年
                    vm.dataTable_title2 = mChineseName[1]+" "+(y+1);//2表头日期
                    vm.dateTable_2 = _calmaker(y+1,1,vm.dataTable_title2,'dateTable_2');
                }else{
                    vm.dataTable_title2 = mChineseName[m+1]+" "+y;//2表头日期
                    vm.dateTable_2 = _calmaker(y,m+1,vm.dataTable_title2,'dateTable_2');
                }
            }
            
            //从数组中删除
            vm.deletFormArr = function(reFunc,idx){
                if(vm.selectedDates[idx]){
                    if(selectedDatesObj[(vm.selectedDates[idx])]){                        
                        var arrname = selectedDatesObj[(vm.selectedDates[idx])][0];
                        var outidx = selectedDatesObj[(vm.selectedDates[idx])][1];
                        var innidx = selectedDatesObj[(vm.selectedDates[idx])][2];
                        var ds = vm[arrname][outidx][innidx].dayStyle;
                        var os = vm[arrname][outidx][innidx].oldStyle;
                        if(ds.indexOf(' select') != '-1'){
                            if(os == ""){
                                vm[arrname][outidx][innidx].dayStyle = 'select';
                            }else{
                                vm[arrname][outidx][innidx].dayStyle = os+' select';
                            }
                        }else{
                            vm[arrname][outidx][innidx].dayStyle = os;
                        }
                    }
                    deleteDates[vm.selectedDates[idx]] = 0;
                }
                if(reFunc){                
                    reFunc();
                }
            }
            //添加选中的日期(参数可以是数组或者字符串)
            vm._addDatesInfo = function(darr){
                if(darr instanceof Array && darr.length>0){
                    for(var i = 0;i<darr.length;i++){
                        vm.newAddDates.ensure(darr[i]);
                        vm.selectedDates.ensure(darr[i]);
                        var thes = avalon.normalGetElementByAttr('datestr',darr[i]);
                        if(thes != undefined && thes.length>0){
                            selectedDatesObj[darr[i]] = getInfoFromDateTd(thes,vm,'selected');
                        }
                    }
                }else if(typeof darr == 'string'){
                    vm.newAddDates.ensure(darr);
                    vm.selectedDates.ensure(darr);
                    var thes = avalon.normalGetElementByAttr('datestr',darr);
                    if(thes != undefined && thes.length>0){
                        selectedDatesObj[darr] = getInfoFromDateTd(thes,vm,'selected');
                    }
                }
            }
            //清空选中数组
            vm._emptySelectedDates = function(){
                for(var i=0;i<vm.selectedDates.length;i++){
                    vm.deletFormArr(null,i);
                }
                vm.selectedDates = [];
            }
            //日历联动切换
            vm._linkageDatepicker = function(changeDrec,changety){
                if(changeDrec == 'prev'){
                    if(changety == 'month'){
                        if(vm.useM>1){
                            vm.useM = vm.useM-1;
                        }else{
                            vm.useM = 12;
                            vm.useY = vm.useY-1;
                        }
                    }else if(changety == 'year'){
                        vm.useY = vm.useY-1;
                    }
                }else if(changeDrec == 'next'){
                    if(changety == 'month'){
                        if(vm.useM==12){
                            vm.useM = 1;
                            vm.useY = vm.useY+1;
                        }else{
                            vm.useM = vm.useM+1;
                        }
                    }else if(changety == 'year'){
                        vm.useY = vm.useY+1;
                    }
                }
                vm._dateinfo(vm.useM,vm.useY);
            }
            
            if(vm.checkedDates){
                vm._dateinfo(parseInt(datesInfoObj.minmonth),parseInt(datesInfoObj.minyear));//初始化当月当年
            }else{
                vm._dateinfo(CM,CY);//初始化当月当年
            }
    }
    });
    var widget = avalon.components["aoyou:smartdatepicker"];
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
    function compareDateForUse(d1,d2){
        return Date.parse(d1)>=Date.parse(d2)
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