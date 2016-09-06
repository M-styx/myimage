define(['avalon','text!./avalon.baidumap.html'], function(avalon,template) {
	var _interface = function () {};
	avalon.component("aoyou:baidumap", {
        mapwidth:'600px',
        mapheight:'400px',
        mapcontrol:false,
        centerandzoom:[116.404, 39.915, 11],
        currentcity:"北京",
        mousewheelZoom:true,
        markers:null,
		//默认配置
		$template: template,
		$construct: function (hooks, vmOpts, elemOpts) {
			var options = avalon.mix(hooks, vmOpts, elemOpts);
			return options;
		},
		$ready: function (vm, elem) {
         	// 百度地图API功能
            var map = new BMap.Map(elem.childNodes[0]);    // 创建Map实例
            if(vm.mapcontrol == true){
                map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
            }
            if(vm.centerandzoom != undefined){
                map.centerAndZoom(new BMap.Point(vm.centerandzoom[0], vm.centerandzoom[1]), vm.centerandzoom[2]);
            }
              // 初始化地图,设置中心点坐标和地图级别
            if(vm.mapcontrol == true){
                map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
            }
            if(vm.currentcity){                
                map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
            }
            if(vm.mousewheelZoom == true){
                map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
            }
            if(vm.markers  != undefined && vm.markers != null && vm.markers.data.length>0){
                for(var i=0;i<vm.markers.data.length;i++){
                    var marker = new BMap.Marker(new BMap.Point(vm.markers.data[i][0],vm.markers.data[i][1]));  // 创建标注
                    var content = vm.markers.data[i][2];
                    map.addOverlay(marker);               // 将标注添加到地图中
                    addClickHandler(content,marker);
                }
                    function addClickHandler(content,marker){
                            marker.addEventListener("click",function(e){
                                openInfo(content,e)}
                            );
                        }
                    function openInfo(content,e){
                        var p = e.target;
                        var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
                        var infoWindow = new BMap.InfoWindow(content);  // 创建信息窗口对象 
                        map.openInfoWindow(infoWindow,point); //开启信息窗口
                    }
            }
		}
	});
	var widget = avalon.components["aoyou:baidumap"];
  return avalon
});



