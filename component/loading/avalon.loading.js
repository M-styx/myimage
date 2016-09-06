define(["avalon","css!./avalon.loading.css",'../base/normalThings'], function (avalon) {
    var Loading = avalon.Loading = function () {}

    Loading.prototype = {
        _bgcolor:'#000',
        stop: function() {
            var content = this.target;
            if(this.loading){
                this.loading.parentNode.removeChild(this.loading);
            }
            delete this.loading;
        },
        start: function() {
            var _this = this;
            var target = _this.target;
            var content = avalon(target);
            var loading = this.loading;
            if (!loading) {
                loading = document.createElement("div");
                loading.className = "aoyou-loading";
                 var _bgcolor = '#000';
                loading.innerHTML = "<div class='aoyou-loading-mask' style='background-color:"+this._bgcolor+"'></div><i class='aoyou-loading-mask-i'></i>";
                document.body.appendChild(loading);
            }
            this.loading = loading;
            var ch = content[0].offsetHeight;
            var cw = content[0].offsetWidth;
            if (avalon(target)[0].tagName == "HTML") {
                ch = Math.max(avalon(target).height(), avalon(window).height());
                cw = Math.max(avalon(target).width(), avalon(window).width());
            }
            loading.style.height = ch+"px";
            loading.style.width = cw+"px";
            var _mask = avalon.superGetElementeByClass(loading,'aoyou-loading-mask');
            _mask[0].style.height = ch+"px";
            _mask[0].style.width = cw+"px";
            var _maskInnerI = avalon.superGetElementeByClass(loading,'aoyou-loading-mask-i');
            if (ch < 100) {
                _maskInnerI[0].style.height = ch+"px";
                _maskInnerI[0].style.width = ch+"px";
            }
            if(avalon(target)[0].tagName != "HTML"){
                var _ll = content[0].offsetLeft;
                var _tt = content[0].offsetTop;
                while (content[0] = content[0].offsetParent) {
                    _ll += content[0].offsetLeft; //叠加父容器的左边距
                    _tt += content[0].offsetTop; //叠加父容器的左边距
                }
                loading.style.top = _tt+"px";
                loading.style.left = _ll+"px";
            }else{
                loading.style.left = content[0].offsetLeft+"px";
                loading.style.top = content[0].offsetTop+"px";
            }            
            var icon = _maskInnerI[0];
            var h = ch,
                w = cw,
                top = 0,
                left = 0;
            var iconheight = avalon(icon).height();
            var iconwidth = avalon(icon).width();
            if (avalon(target)[0].tagName == "HTML") {
                h = avalon(window).height();
                w = avalon(window).width();
                var wscrollLeft= avalon(window).scrollLeft();
                var wscrollTop = avalon(window).scrollTop();
                top = (h - iconheight) / 2 + wscrollTop;
                left = (w - iconwidth) / 2 + wscrollLeft;
            } else {
                top = (h - iconheight) / 2;
                left = (w - iconwidth) / 2;
            }
            icon.style.top = top+"px";
            icon.style.left = left+"px";
        },
        init: function(settings) {
            settings = settings || {};
            if(!settings.target){
                settings.target = document.body.parentNode;
            }
            this.target = settings.target;
            if(settings._bgcolor){
                this._bgcolor = settings._bgcolor;
            }
            this.bindEvent();
        },
        bindEvent: function() {
            var _this = this;
            avalon.bind(this.target, 'stop', function() {
                _this.stop();
            });
        }
    }
    avalon.Loading = new Loading

    return avalon
})
