/**
 * Created by haos on 24/04/2017.
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

router.get('/', (req, res, next) => {
    axios({
        url: 'https://stackoverflow.com/',
        method: 'GET',
    }).then((data) => {
        const $ = cheerio.load(data.data);
        let items = $('#question-mini-list div');
        var dataObj = {
            title: {}
        };
        let keyindex = 0;
        for (let i = 0; i < items.length; i++) {
            const titleInfo = items.eq(i).find('h3 .question-hyperlink').text();
            if (titleInfo && titleInfo !== dataObj.title[keyindex - 1]) {
                dataObj.title[keyindex] = titleInfo;
                keyindex++;
            }
        }
        Object.keys(dataObj.title).forEach((key) => {
            if(dataObj.title[key] && dataObj.title[key].match(/(SQL)|(sql)/g)) {
                console.log('huh, caught one')
            }
        });
        // console.log(dataObj);
        res.send(dataObj)
    }).catch((err) => {
        console.log(err);
        res.send(err)
    })
});

module.exports = router;
