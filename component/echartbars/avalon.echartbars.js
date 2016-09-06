define(['avalon','text!./avalon.echartbars.html'], function(avalon , template) {
	var _interface = function () {};
	avalon.component("aoyou:echartbars", {
		baroption:null,//echart的配置从外部读入
		barwidth:'600px',
		barheight:'400px',
		//默认配置
		$template: template,
		$construct: function (hooks, vmOpts, elemOpts) {
			var options = avalon.mix(hooks, vmOpts, elemOpts);
			return options;
		},
		$ready: function (vm, elem) {
			// 基于准备好的dom，初始化echarts实例
			var myChart = echarts.init(elem.childNodes[0]);

			if(vm.baroption != undefined && vm.baroption != null){
				// 使用刚指定的配置项和数据显示图表。
				myChart.setOption(vm.baroption);
			}
		}
	});
	var widget = avalon.components["aoyou:echartbars"];
	return avalon
});



