//=========================================
//   by hanggai
//==========================================
define(["avalon"], function(avalon) {
    avalon._normalAjax = function(opts) {        
        var myXMLHttpRequest = null;
        if (window.ActiveXObject) {
            myXMLHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            myXMLHttpRequest = new XMLHttpRequest();
        }
        if(opts.url != undefined && opts.url != ""){            
            myXMLHttpRequest.open('get', opts.url, true);
            //myXMLHttpRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            myXMLHttpRequest.onreadystatechange = function(){
                if (myXMLHttpRequest.readyState == 4 && myXMLHttpRequest.status == 200) {
                    var res = myXMLHttpRequest.responseText;
                    //var jsonObj = eval("("+res+")");
                    if(opts.success){
                        opts.success(res)
                    }
                }        
            }
            myXMLHttpRequest.send();
        }
    }
    avalon.normalGetElementeByClass = function(className){
         var all = document.all?document.all:document.getElementsByTagName('*');
       var elements = new Array();
        for ( var e = 0; e <all.length; e ++ ) {
          if (all[e].className == className) {
            elements[elements.length] = all[e];
            break ;
          }
        }
        return elements;
    }
    avalon.normalGetElementByAttr = function(attrName,useName){
        var all = document.hasOwnProperty('all')?document.all:document.getElementsByTagName('*');
        var elements = new Array();
        for ( var e = 0; e <all.length; e ++ ) {
        if (all[e].getAttribute(attrName) == useName ) {
        elements[elements.length] = all[e];
        break ;
        }
        }
        return elements;
    }
    avalon.normalElementSetAttr = function(attrName,useName){
        var all;
        if(document.hasOwnProperty){
            all = document.hasOwnProperty('all')?document.all:document.getElementsByTagName('*');
        }else{
            all = Object.prototype.hasOwnProperty.call(document)?document.all:document.getElementsByTagName('*');
        }
        var elements = new Array();
        for ( var e = 0; e <all.length; e ++ ) {
        if (all[e].getAttribute(attrName) == useName ) {
        elements[elements.length] = all[e];
        //break ;
        }
        }
        return elements;
    }
    avalon.isIE = function(){ //ie?
        if (!!window.ActiveXObject || "ActiveXObject" in window)
            return true;
        else
            return false;
    }
    //根据父级获取等于输入class的元素
    avalon.superGetElementeByClass = function(oParent, sClass,allflag){
        var aEle=oParent.getElementsByTagName('*');
        var aResult=[];
        var i=0;
        for(i=0,l=aEle.length;i<l;i++)
        {
            if(aEle[i].className==sClass || (aEle[i].className.indexOf(' '+sClass) != -1) ||  (aEle[i].className.indexOf(sClass+' ') != -1))
            {
                aResult.push(aEle[i]);
                if(!allflag){
                break ;
                }
            }
        }
        return aResult;
    }

    //获取某一个对象某种css属性的值
    avalon.getstyle = function (obj,name) {
        if(obj.currentStyle){
            return obj.currentStyle[name];
        }else{
            return getComputedStyle(obj,false)[name];
        }
    }
//obj element对象 获取对象的绝对位置
    avalon.getElemPos = function(obj){
        var pos = {"top":0, "left":0};
        if (obj.offsetParent){
            while (obj.offsetParent){
                pos.top += obj.offsetTop;
                pos.left += obj.offsetLeft;
                obj = obj.offsetParent;
            }
        }else if(obj.x){
            pos.left += obj.x;
            pos.top += obj.y;
        }
        return {x:pos.left, y:pos.top};
    }
    //obj 对象 attr 对象某一css属性 target 该属性将要变的目标值  outspeed 速度 越大越快  fn 回调函数
    avalon.startrun=function (obj,attr,target,outspeed,fn) {
        if(outspeed == undefined || !outspeed>0){
            outspeed = 8;
        }
        if(obj.timer){
            clearInterval(obj.timer);
        }
        obj.timer = setInterval(function(){
            var cur = 0;
            if(attr == "opacity"){
                cur = Math.round(parseFloat(avalon.getstyle(obj,attr))*100);
            }else{
                if(attr=='height' && avalon.isIE()){
                    cur = parseInt(parseFloat(obj.clientHeight));
                }else if(attr=='scrollTop')
                {
                    cur = parseInt(parseFloat(obj.scrollTop))
                }
                else{
                    cur = parseInt(avalon.getstyle(obj,attr));
                }
            }
            var speed = (target-cur)/outspeed;
            speed = speed>0?Math.ceil(speed):Math.floor(speed);
            
            if(cur == target){
                clearInterval(obj.timer);
                if(fn){
                    fn();
                }
            }else{
                if(attr == "opacity"){
                    obj.style.filter = "alpha(opacity="+(cur+speed)+")";
                    obj.style.opacity = (cur+speed)/100;
                }else if(attr=='scrollTop') {
                    obj.scrollTop = cur+speed;
                }else
                {
                    obj.style[attr] = cur + speed + "px";
                }
            }
        },30)
    }

    //验证工具
  avalon.normalvalidation = function(val, valids) {
      var info = '', reg = null, flag = true, validArr = valids.split(',');
      for(var i = 0; i < validArr.length; i ++) {
          var valid = validArr[i];
          switch(valid) {
              case 'req':
                  val !=""? (info = '') : (info = '必须填写'); break;
              case 'int':
                  reg = /^\-?\d+$/;
                  info = reg.test(val) ? '' : '请输入正确的整数'; break;
              case '+int':
                  reg = /^\+?[1-9][0-9]*$/;
                  info = reg.test(val) ? '' : '请输入正确的正整数'; break;
              case '-int':
                  reg = /^\-[1-9][0-9]*$/;
                  info = reg.test(val) ? '' : '请输入正确的负整数'; break;
              case 'float':
                  reg = /^(-?\d+)(\.\d+)?/;
                  info = reg.test(val) ? '' : '请输入正确的浮点数'; break;
              case '+float':
                  reg = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;
                  info = reg.test(val) ? '' : '请输入正确的正浮点数'; break;
              case '-float':
                  reg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/;
                  info = reg.test(val) ? '' : '请输入正确的负浮点数'; break;
              case 'ip':
                  reg = /^(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])$/;
                  info = reg.test(val) ? '' : 'IP地址有误'; break;
              case 'email':
                  reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]{2,5}$/;
                  info = reg.test(val) ? '' : '电子邮件地址有误'; break;
              case 'phone':
                  reg = /^(\(\d{3,4}\)|\d{3,4}-)?\d{7,8}$/;
                  info = reg.test(val) ? '' : '电话号码有误'; break;
              case 'mobile':
                  reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
                  info = reg.test(val) ? '' : '手机号码有误'; break;
              default:
                  if(valid != undefined){
                      if(valid.indexOf('len-') != -1){
                          var _bg = valid.indexOf('len');
                          var _bg_01 = valid.substr(_bg+4,valid.length);
                          if(_bg_01.indexOf('max-') != -1){
                            var _bg_02 = _bg_01.substr(_bg_01.indexOf('-')+1,valid.length);
                              info = val.length<parseInt(_bg_02) ? '' : '最多不能超过'+_bg_02+'个字符'; break;
                          }
                          if(_bg_01.indexOf('min-') != -1){
                              var _bg_02 = _bg_01.substr(_bg_01.indexOf('-')+1,valid.length);
                              info = val.length>=parseInt(_bg_02) ? '' : '最少不能少于'+_bg_02+'个字符'; break;
                          }

                      }else{
                          break;
                      }
                  }else{
                      break;
                  }
          }
          if(info != ''){
              break;
          }
      }
      return info;
  }
    
        
    return avalon
})



