'use strict';

const   request = require("request");
const        fs = require("fs");

const fillQuestion = function(a, question, frequency) {
    a.title = question.title;
    a.difficulty = question.difficulty;
    const front = "https://leetcode.com/problems/";
    const back = question.title.toLowerCase().split(" ").join("-");
    a.link = front + back;
    a.frequency = frequency[4].toPrecision(4);

    return a;
};


const extractFromBody = function (questions, frequencies) {
    function answer() {
        this.title      = "";
        this.difficulty = "";
        this.frequency  = "";
        this.link       = "";
    }

    let answers = [];

    for (let i = 1; i < questions.length; i++) {
        let a = new answer();
        let question = questions[i];
        let frequency = frequencies[question.questionId];

        answers.push(fillQuestion(a, question, frequency));
    }

    return answers;
};


const saveJson = function (answers, company) {
    const path = `./output/${ company }.txt`;
    const answer = JSON.stringify(answers, null, 2);

    fs.writeFile(path, answer, function(err) {
        if (err === null) {
            console.log("file successfully saved!");
        } else {
            console.log("error!", err);
        }
    });
};


const craw = function (company) {
    const url = "https://leetcode.com/graphql";

    const cookie = '__cfduid=d851d010836b42e3e0d64fcac85774e371575704083; _ga=GA1.2.1614243766.1575704083; LEETCODE_SESS' +
        'ION=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfYXV0aF91c2VyX2lkIjoiMjMxMzY0NSIsIl9hdXRoX3VzZXJfYmFja2VuZCI6ImFsbG' +
        'F1dGguYWNjb3VudC5hdXRoX2JhY2tlbmRzLkF1dGhlbnRpY2F0aW9uQmFja2VuZCIsIl9hdXRoX3VzZXJfaGFzaCI6ImE3YzM2YzM3YTI2ZDc4O' +
        'GY5ZWJlYjdmNzNlZGViODkxYThjMDBjMjUiLCJpZCI6MjMxMzY0NSwiZW1haWwiOiJ6ejI3MDBAY29sdW1iaWEuZWR1IiwidXNlcm5hbWUiOiJQ' +
        'YXRCYXRlbWFuIiwidXNlcl9zbHVnIjoicGF0YmF0ZW1hbiIsImF2YXRhciI6Imh0dHBzOi8vYXNzZXRzLmxlZXRjb2RlLmNvbS91c2Vycy9wYXR' +
        'iYXRlbWFuL2F2YXRhcl8xNTc0ODA1NTQzLnBuZyIsInRpbWVzdGFtcCI6IjIwMTktMTItMTMgMjI6MzY6NTkuNDczNzg5KzAwOjAwIiwiSVAiOi' +
        'I3Mi4yMjkuMjU1LjEwIiwiSURFTlRJVFkiOiIyMWQ5N2IxMzkwMjZlODg1YjEwZmM3OTFhMmVkZjQ3NyIsIl9zZXNzaW9uX2V4cGlyeSI6MTIwO' +
        'TYwMH0.Wl-ZVIohYf06cD2cKMFus22qcpC5HBjpSwq85-PF6II; csrftoken=2SKdGr2DyczxkmiBtyVWyPqn6pnGcmvPCVTf98EWi3utEw6lq' +
        'ngu2kDJ8HLVUUnf; _gid=GA1.2.101684419.1577306237; __atuvc=3%7C49%2C7%7C50%2C4%7C51%2C2%7C52; c_a_u="UGF0QmF0ZW1' +
        'hbg==:1iki9h:HCRyM3PC9LFOzLVc1Wfsa6e-fw4"; _gat=1';

    const useragent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79." +
        "0.3945.88 Safari/537.36";

    const headers = {
        'cookie'       : cookie,
        'user-agent'   : useragent,
        'referer'      : 'https://leetcode.com/problemset/all/',
        'origin'       : 'https://leetcode.com',
        'content-type' : 'application/json',
        'Accept'       : '*/*',
        'Connection'   : 'keep-alive'
    };

    const body = {"operationName":"getCompanyTag","variables":{"slug":company},"query":"query getCompanyTag($slug: Strin" +
            "g!) {\n  companyTag(slug: $slug) {\n    name\n    translatedName\n    frequencies\n    questions {\n      ." +
            "..questionFields\n      __typename\n    }\n    __typename\n  }\n  favoritesLists {\n    publicFavorites {\n" +
            "      ...favoriteFields\n      __typename\n    }\n    privateFavorites {\n      ...favoriteFields\n      __" +
            "typename\n    }\n    __typename\n  }\n}\n\nfragment favoriteFields on FavoriteNode {\n  idHash\n  id\n  nam" +
            "e\n  isPublicFavorite\n  viewCount\n  creator\n  isWatched\n  questions {\n    questionId\n    title\n    t" +
            "itleSlug\n    __typename\n  }\n  __typename\n}\n\nfragment questionFields on QuestionNode {\n  status\n  qu" +
            "estionId\n  questionFrontendId\n  title\n  titleSlug\n  translatedTitle\n  stats\n  difficulty\n  isPaidOnl" +
            "y\n  topicTags {\n    name\n    translatedName\n    slug\n    __typename\n  }\n  frequencyTimePeriod\n  __t" +
            "ypename\n}\n"};

    const options = {
        url: url,
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
    };

    request(options, function (err, res, body) {
        if (err === null && res.statusCode === 200) {
            console.log("successfully request!");

            const data = JSON.parse(body);
            const questions = data.data.companyTag.questions;
            const frequencies = JSON.parse(data.data.companyTag.frequencies);
            const answers = extractFromBody(questions, frequencies);
            saveJson(answers, company);
        } else {
            console.log("error!ss", res.statusCode);
        }
    });
};


const __main = function() {
    const companyString = fs.readFileSync("./output/companies.txt", "utf-8");
    const companies = JSON.parse(companyString);

    for (let i = 0; i < companies.length; i++){
        let company = companies[i].replace(" ", "-");
        craw(company);
    }
};


__main();
