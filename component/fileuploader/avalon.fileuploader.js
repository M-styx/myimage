define(['avalon','text!./avalon.fileuploader.html','css!./avalon.fileuploader.css','../base/normalThings'],
    function(avalon, template) {
    var _interface = function () {};
    avalon.component("aoyou:fileuploader", {
        uploaderwidth:'400px',
        filepickerstr:'选择文件',
        uploadstartstr:'开始上传',
        thumb:true,//缩略图
        progress:true,//进度条
        fileinfolist:true,//文件列表
        swfstr:'Uploader.swf',//flash的地址
        severstr:'',//服务器
        acceptobj:{},
        filelist:[],
        afterpickfile:_interface,//选择文件之后的回调
        uploadeClickfunc:_interface,//点击上传的回调
        $template: template,
        $construct: function (hooks, vmOpts, elemOpts) {
            var options = avalon.mix(hooks, vmOpts, elemOpts);
            return options;
        },
        $init: function(vm, elem) {
        },
        $ready: function (vm, elem) {
            var webupopt = {
                // swf文件路径
                swf: vm.swfstr,

                // 文件接收服务端。
                server: vm.severstr,

                // 选择文件的按钮。可选。
                // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                pick: '.aoyou-fileuploader-picker',

                // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
                resize: false
            };
            if(vm.acceptobj.$model.hasOwnProperty('title')){
                webupopt.accept = vm.acceptobj.$model;
            }
            var uploader = WebUploader.create(webupopt);
            // 当有文件被添加进队列的时候
            uploader.on( 'fileQueued', function( file ) {
                var _obj = {fileID:file.id,fileName:file.name,uploadinfo:'等待上传...',ext:file.ext};
                vm.filelist.push(_obj);
                if(typeof(vm.afterpickfile) == 'function'){
                    vm.afterpickfile(_obj);
                }
                if(vm.thumb == true){
                    // 创建缩略图
                    // 如果为非图片文件，可以不用调用此方法。
                    uploader.makeThumb( file, function( error, src ) {
                        if ( error ) {
                            //不能预览
                            return;
                        }
                        var _imgstr = "<img src='"+ src +"'>";
                        $(".filelistitem-"+file.id).append(_imgstr);
                    }, '100', '100' );
                }
            });
            
            vm.uploadeClickfunc = function() {
                    uploader.upload();
            };
            if(vm.progress == true){
                // 文件上传过程中创建进度条实时显示。
                uploader.on( 'uploadProgress', function( file, percentage ) {
                    var $li = $( '.filelistitem-'+file.id ),$percent = $li.find('.aoyou-fileuploader-progressspan');

                    // 避免重复创建
                    if ( !$percent.length ) {
                        $percent = $('<p class="aoyou-fileuploader-progress"><span class="aoyou-fileuploader-progressspan">0%</span></p>')
                            .appendTo( $li )
                            .find('span');
                    }

                    $percent.css( 'width', percentage * 100 + '%' );
                    $percent.text(percentage * 100 + '%');

                });
            }

            // 文件上传成功，给item添加成功class, 用样式标记上传成功。
            uploader.on( 'uploadSuccess', function( file ) {
                for(var i=0;i<vm.filelist.length;i++){
                    if(vm.filelist[i].fileID == file.id){
                        vm.filelist[i].uploadinfo = '上传成功';
                        break;
                    }
                }
            });

            // 文件上传失败，显示上传出错。
            uploader.on( 'uploadError', function( file ) {
                for(var i=0;i<vm.filelist.length;i++){
                    if(vm.filelist[i].fileID == file.id){
                        vm.filelist[i].uploadinfo = '上传失败';
                        break;
                    }
                }
            });

            // 完成上传完了，成功或者失败，先删除进度条。
            uploader.on( 'uploadComplete', function( file ) {
                var $li = $( '.filelistitem-'+file.id ),$percent = $li.find('.aoyou-fileuploader-progress');
                setTimeout(function(){$percent.remove();},500);
            });
        }
    });
    var widget = avalon.components["aoyou:fileuploader"];
    return avalon
});