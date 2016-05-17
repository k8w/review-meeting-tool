var tagDatas;
var currentTag = '未分类';
var dragItem = null;

function onDragStart(e){
    // e.originalEvent.dataTransfer.effectAllowed='move';
    dragItem = $(e.currentTarget);
}

function onDragOver(e){
    e.preventDefault();
    // e.originalEvent.dataTransfer.dropEffect='move';
    $(e.currentTarget).addClass('dragover')
}

function onDragLeave(e){
    $(e.currentTarget).removeClass('dragover')
}

function onDragEnd(e){
    $('#tags a').removeClass('dragover');
}

function onDrop(e) {
    var fromTag = currentTag;
    var data = dragItem.data();
    var toTag = $(e.currentTarget).data('tag');
    var msg;

    if(toTag == '新分类'){
        toTag = prompt('请输入新分类名：');

        if(!toTag || toTag=='新分类'){
            return;
        }
        else if(tagDatas.filter(v=>v.tagName==toTag).length==0){
            tagDatas.push({
                tagName: toTag,
                well: [],
                less: [],
                suggestion: []
            });
        }
    }

    for(let i=0; i<tagDatas.length; i++){
        if(tagDatas[i].tagName == fromTag){
            msg = tagDatas[i][data.type].splice([data.index], 1);
            break;
        }
    }

    for(let i=0; i<tagDatas.length; i++){
        if(tagDatas[i].tagName == toTag){
            tagDatas[i][data.type].push(msg);
            break;
        }
    }

    refresh();
}

function onSwitchTag(e){
    currentTag = $(e.currentTarget).data('tag');
    refresh();
}

function refresh(){
    //删除空TAG
    tagDatas = tagDatas.filter(v=>v.well.length||v.less.length||v.suggestion.length);

    //Header
    $('#tags').html('');
    tagDatas.forEach(v=>{
        let $a = $('<a>'+v.tagName+'('+(v.well.length+v.less.length+v.suggestion.length)+')'+'</a>');
        $a.data('tag', v.tagName);
        $a.on('dragover', onDragOver);
        $a.on('dragleave', onDragLeave);
        $a.on('drop', onDrop);
        $a.click(onSwitchTag);
        if(v.tagName==currentTag){
            $a.addClass('active');
        }
        $('#tags').append($a);
    });

    //新分类
    var $a = $('<a class="new">新分类</a>');
    $a.data('tag', '新分类');
    $a.on('dragover', onDragOver);
    $a.on('dragleave', onDragLeave);
    $a.on('drop', onDrop);
    $('#tags').append($a);

    //Content
    $('#msgs>.well>div, #msgs>.less>div, #msgs>.suggestion>div').remove();
    function addMsg(msg, idx, type){
        $div = $('<div draggable="true"></div>')
        $div.text(msg);
        $div.on('dragstart', onDragStart);
        $div.on('dragend', onDragEnd);
        $div.data('type', type);
        $div.data('index', idx);
        $('#msgs>.'+type).append($div);
    }

    for(let i=0; i<tagDatas.length; ++i){
        if(tagDatas[i].tagName == currentTag){
            tagDatas[i].well.forEach((msg,i)=>{
                addMsg(msg, i, 'well');
            })
            tagDatas[i].less.forEach((msg,i)=>{
                addMsg(msg, i, 'less');
            })
            tagDatas[i].suggestion.forEach((msg,i)=>{
                addMsg(msg, i, 'suggestion');
            })
            break;
        }
    }

    $.ajax({
        url: 'http://localhost:9876/updateTagDatas',
        method: 'POST',
        data: JSON.stringify(tagDatas),
        dataType: 'json',
        contentType: 'text/plain;charset=utf-8'
    })
}

function clear() {
    tagDatas = [];
    refresh();
}

$.getJSON('http://localhost:9876/tagDatas', function (data) {
    tagDatas = data;
    refresh();
})