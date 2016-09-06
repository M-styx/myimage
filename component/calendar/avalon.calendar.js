define(['avalon','text!./avalon.calendar.html', 'css!./avalon.calendar.css','../textbox/avalon.textbox','../singledatepicker/avalon.singledatepicker'], function(avalon , template) {
	var _interface = function () {};
	avalon.component("aoyou:calendar", {
		//外部标签属性
		textbox:{},
		datepicker:{},
		//外部配置参数
		onclicked: null,
		inputClick:_interface,
		//默认配置
		$template: template,
		$construct: function (hooks, vmOpts, elemOpts) {
			var options = avalon.mix(hooks, vmOpts, elemOpts);
			return options;
		},
		$ready: function (vm, elem) {
			var tb,sp;
			for(var o in vm.$refs){
				if(o.indexOf('singledatepicker') != -1){
					sp = vm.$refs[o];
				}else if(o.indexOf('textbox') != -1){
					tb = vm.$refs[o];
				}
			}
			var _afckfunc = sp.aftercheckfunc;
			var _affclfunc = sp.afterClearfunc;
			sp.aftercheckfunc = function(arr){
				tb.value = arr[0];
				if(_afckfunc){
					_afckfunc(arr);
				}
			}
			sp.afterClearfunc = function(){
				tb.value = '';
				if(_affclfunc){
					_affclfunc();
				}
			}

			avalon.bind(document.body, 'click', function () {
				sp._closepicker();
			});
			vm.inputClick = function(e){
				sp._togglepicker();
				e.stopPropagation();
			}
		}
	});
	var widget = avalon.components["aoyou:calendar"];
	return avalon
});



