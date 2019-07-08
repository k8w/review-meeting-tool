const API_BASE = 'http://192.168.1.164:9876'
var PageData = localStorage['PageData'] ? JSON.parse(localStorage['PageData']) : {};

function savePageData() {
    localStorage['PageData'] = JSON.stringify(PageData);
}

//定时刷新页面状态
function updateStatus(){
    $('#light').show();
    var finished = false;
    var timeout;
    var jqXHR = $.getJSON(API_BASE+'/status', function(data){
        clearTimeout(timeout)
        finished = true;

        if(data.errmsg){
            alert(data.errmsg);
            return;
        }

        $('#light').hide();
        if(PageData.meetingId){
            if(PageData.meetingId != data.meetingId){
                localStorage.removeItem('PageData');
                alert('环境已更改，请刷新页面')
                window.location.reload();
                return;
            }
        }
        else{
            PageData.meetingId = data.meetingId;
        }

        if(PageData.step !== data.step){
            PageData.step = data.step;
            refreshPage();
        }

        setTimeout(updateStatus, 1000)
    })

    //3秒超时
    setTimeout(function(){
        if(!finished){
            jqXHR.abort();
            updateStatus();
        }
    }, 3000)
}
PageData.meetingId && refreshPage();
updateStatus();

$('#check a').click(function(){
    $.get(API_BASE+'/check/'+$(this).data('score'), function(data){
        if(data.errmsg){
            alert(data.errmsg);
            hideModal();
            return;
        }

        PageData.isChecked = true;
        refreshPage();
    });
    showModal('请稍候...')
});

function showModal(str){
    $('.modal').text(str).show();
}

function hideModal(){
    $('.modal').hide();
}

function refreshPage() {
    hideModal();
    $('.main>div').hide();
    $('.main #'+PageData.step).show();

    if(PageData.step=='check'){
        if(PageData.isChecked){
            showModal('√ 投票成功，等待其它人');
        }
    }
    else if(PageData.step == 'vote'){
        !$('#vote-select').children().length && $.getJSON(API_BASE+'/voteOption', function (data) {
            data.forEach(function(v){
                $('#vote-select').append('<option value="'+v+'">'+v+'</option>')
                $('#vote-select').append('<option value="'+v+'">'+v+'</option>')
            })
        })

        if(PageData.isVoted){
            showModal('投票成功，可以关闭页面了~')
        }
    }

    savePageData();
}

$('#msg-submit').click(function(e){
    e.preventDefault();

    if(!$('#msg-content').val()){
        return;
    }

    $.getJSON(API_BASE+'/sendMsg', {
        type: $('#msg-type').val(),
        msg: $('#msg-content').val()
    }, function (data) {
        $('#msg-submit').attr('disabled',false).text('提 交')

        if(data.errmsg){
            alert(data.errmsg);
            return;
        }

        alert('发表成功')
        hideModal();
        $('#meeting form')[0].reset();
    })
    $('#msg-submit').attr('disabled',true).text('提交中...')
})

$('#vote-submit').click(function (e) {
    e.preventDefault();

    if(!$('#vote-select').val()){
        return;
    }
    if($('#vote-select').val().length>2){
        alert('最多选2项');
        return;
    }

    $.getJSON(API_BASE+'/vote', {
        option: $('#vote-select').val()
    }, function (data) {
        PageData.isVoted = true;
        refreshPage();
    });

    showModal('稍候...')
})