import MeetingData from "./MeetingData";
import * as bodyParser from 'body-parser';
var express = require('express');
var app = express();
const meetingData = new MeetingData('data.txt');

app.use((req,res,next)=>{
    res.set({
        'Access-Control-Allow-Origin': '*'
    });

    next();
});
app.use(bodyParser.text())

app.get('/restart', function (req, res) {
    meetingData.data = {
        meetingId: Date.now(),
        step: 'check',
        checkData: [],
        tagDatas: [],
        voteData: []
    };

    res.end('会议开始了');
});

app.get('/setStep/:value', function (req, res) {
    if(['check','meeting','vote'].indexOf(req.params.value)==-1){
        res.end('Step不合法');
        return;
    }

    meetingData.data.step = req.params.value;
    meetingData.save();

    res.end('会议状态已变更为 '+req.params.value);
});

/** User 用 */
app.get('/status', (req,res)=>{
    let data = meetingData.data;

    if(!data){
        res.json({errmsg:'会议未开始'}).end();
        return;
    }

    res.json({
        meetingId: data.meetingId,
        step: data.step
    }).end();
})

app.get('/check/:score', (req,res)=>{
    var score = req.params.score;
    if(['1','2','3','4','5'].indexOf(score) == -1){
        res.json({errmsg:'非法操作'}).end();
        return;
    }

    meetingData.data.checkData.push(score);
    meetingData.save();
    res.json({}).end();
});

app.get('/sendMsg', (req,res)=>{
    var msg = req.query.msg;
    var type = req.query.type;
    var tag = '未分类';

    if(meetingData.data.tagDatas.filter(v=>v.tagName == tag).length){
        //已经有这个Tag
        meetingData.data.tagDatas.filter(v=>v.tagName == tag)[0][type].push(msg);
        meetingData.save();
    }
    else{
        var tagData = {
            tagName: tag,
            well:[], less:[], suggestion:[]
        }
        tagData[type].push(msg);
        meetingData.data.tagDatas.push(tagData);
        meetingData.save();
    }

    res.json({}).end();
});

app.get('/voteOption', (req,res)=>{
    res.json(meetingData.data.tagDatas.map(v=>v.tagName)).end();
})

app.get('/vote', (req,res)=>{
    var option = req.query.option;
    if(!Array.isArray(option) || option.length!=2){
        res.json({errmsg:'无效的选项'}).end();
        return;
    }

    meetingData.data.voteData.push(option[0]);
    meetingData.data.voteData.push(option[1]);
    meetingData.save();

    res.json({}).end();
});

/** End User 用 */

/** Server 用 */

app.get('/checkResult', (req,res)=>{
    var result = [];
    for(let i=5; i>=1; i--){
        result.push(meetingData.data.checkData.filter(v=>parseInt(v)==i).length)
    }
    res.json({
        result: result
    }).end();
});

app.get('/data',(req,res)=>{
    res.json(meetingData.data).end();
});

app.get('/tagDatas',(req,res)=>{
    res.json(meetingData.data.tagDatas).end();
});

app.post('/updateTagDatas', (req,res)=>{
    meetingData.data.tagDatas = JSON.parse(req.body);
    res.json({}).end();
});

app.get('/voteResult', (req,res)=>{
    var votes = meetingData.data.voteData;
    var result = [];
    votes.forEach(v=>{
        for(let i=0; i<result.length; i++){
            if(result[i].name == v){
                result[i].value += 1;
                return;
            }
        }

        result.push({
            name: v,
            value: 1
        });
    })

    result.sort((a,b)=>b.value-a.value)
    res.json(result).end();
})

/** End Server 用 */

var server = app.listen(9876, function () {
    console.log('Server started...');
});
