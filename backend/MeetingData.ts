const fs = require('fs');

interface IMeetingData{
    meetingId: number,
    step: 'check' | 'msg' | 'vote',
    checkData: string[],
    tagDatas: {tagName:string, well:string[], less:string[], suggestion:string[]}[],
    voteData: string[]
}

export default class MeetingData{
    private filename:string;
    constructor(filename){
        this.filename = filename;
    }
    
    private _data:IMeetingData;

    set data(value:IMeetingData){
        this._data = value;
        this.save();
    }

    get data():IMeetingData {
        if(!this._data){
            this._data = fs.existsSync(this.filename) ? JSON.parse(fs.readFileSync(this.filename, 'utf8')) : null;
        }
        return this._data;
    }

    save(){
        fs.writeFile(this.filename, JSON.stringify(this._data), err=>{
            console.log(this._data);
            err && console.log('Save Data Error.');
        })
    }
}