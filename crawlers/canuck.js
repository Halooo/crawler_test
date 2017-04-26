/**
 * Created by haos on 25/04/2017.
 */
const axios = require('axios');
const cheerio = require('cheerio');

let latestData = {ads: {0: ['']}};

const crawler = {
    toStr: function(data) {
        if(data.ads){
            for (let item in data.ads) {
                data.ads[item] = data.ads[item].reduce(function(acc, val) {
                    return acc + ' - ' + val;
                })
            }
        }
        return data;
    },

    strToArr: function(data) {
        let resultArr = [];
        for (let item in data.ads) {
            resultArr.push(data.ads[item])
        }
        return resultArr;
    },

    _trimData: function (titleInfo) {
        const p = new Promise(function (resolve, reject) {
            let result = titleInfo.map((item, index) => {
                item = item.trim();
                return item;
            });
            resolve(result);
        });
        return p;
    },

    fetchData: function() {
        var _this = this;
        let p = new Promise(function(resolve, reject) {
            axios({
                url: 'http://www.canuckaudiomart.com/classifieds/all/',
                method: 'GET',
            }).then((data) => {
                const $ = cheerio.load(data.data);
                let items = $('.adverttable .ad');
                let dataObj = {
                    ads: {}
                };
                let keyindex = 0;
                for (let i = 0; i < items.length; i++) {
                    let titleInfo = items.eq(i).text().replace(/\t+/gm,'')
                        .replace(/\n+/gm, '-').replace(/(^-)|(\s-$)/, '')
                        .replace(/.*((DEALER AD)|(WANTED)).*/gm, '').split('-');

                    if (titleInfo.length > 1) {
                        titleInfo.shift();
                        _this._trimData(titleInfo).then(function(data) {
                            dataObj.ads[keyindex] = data.filter(function(item) {return item !== ''});
                            keyindex++;
                        });
                    }
                }
                resolve(dataObj);
            }).catch((err) => {
                reject(err);
            });
        });
        return p;
    }
};

setInterval(function() {
    crawler.fetchData().then(function (currData) {
        // console.log(currData);
        let temp = JSON.parse(JSON.stringify(currData));
        let dataStr = crawler.toStr(temp);

        let latestDataStr = crawler.toStr(latestData);
        let latestDataArr = crawler.strToArr(latestDataStr);


        if (latestDataStr.ads && dataStr.ads && (latestDataArr.indexOf(dataStr.ads[0]) === -1)) {
            let matchKeyWord = /((H|h)(D|d)\s?6(0|5)0)/g;
            for (let item in dataStr.ads) {
                if (dataStr.ads[item].match(matchKeyWord)) {
                    // send notification
                    axios({
                        url: 'https://hooks.slack.com/services/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',
                        method: 'POST',
                        data: {
                            "channel": "#messages",
                            "username": "Canuck",
                            "text": dataStr.ads[item],
                            "icon_emoji":":headphones:"
                        }
                    }).then((data) => {
                        console.log(data)
                    }).catch((err) => {
                        console.log(err)
                    })
                }
            }
        }
        console.log('finish')
        latestData = currData;
    }).catch(function (err) {
        console.error(err);
    });
}, 1000*60*2);
