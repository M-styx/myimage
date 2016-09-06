define(['avalon','text!./avalon.tags.html', 'css!./avalon.tags.css'], function(avalon , template) {
	var _interface = function () {};
	avalon.component("aoyou:tags", {
		//外部标签属性
		tagswidth:"",
		bgcolor: '#d3dadc',
		fontcolor:"",
		closeshow:true,
		data:[],
		srouceFlag:{name:"name",value:"value"},
		//内部接口
		tagsinfo:[],
		_closeTag: _interface,
		//view属性
		//对外方法
        afterClose:_interface,
		addData:_interface,
		setData: _interface,
		getData: _interface,
		//默认配置
		$template: template,
		$construct: function (hooks, vmOpts, elemOpts) {
			var options = avalon.mix(hooks, vmOpts, elemOpts);
			return options;
		},
		$init: function(vm, elem) {
			var _name = vm.srouceFlag.name;
			var _value = vm.srouceFlag.value;
			vm.setData = function(data) {
				vm.tagsinfo = [];
				for(var i=0,j=data.length;i<j;i++){
					var _ob = {};
					if(data[i][_name]){
						_ob.name = data[i][_name];
					}
					if(data[i][_value]){
						_ob.value = data[i][_value];
					}
					_ob.show = true;
					vm.tagsinfo.ensure(_ob);
				}
			}
			vm.addData = function(arr){
				if(arr && arr.length>0){
					for(var o in arr){
						var _ob = {};
						if(arr[o][_name]){
							_ob.name = arr[o][_name];
						}
						if(arr[o][_value]){
							_ob.value = arr[o][_value];
						}
						_ob.show = true;
						vm.tagsinfo.ensure(_ob);
					}
				}
			}
			vm.getData = function(){
				return vm.tagsinfo.$model;
			}
			vm._closeTag = function(num){
				vm.tagsinfo[num].show = false;
				if(vm.afterClose){
					vm.afterClose();
				}
			}
			if(vm.data != undefined && vm.data.length>0){
				vm.setData(vm.data.$model);
			}
		}
	});
	var widget = avalon.components["aoyou:tags"];
  return avalon
});



