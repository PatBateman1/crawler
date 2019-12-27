const  request = require("request");
const  cheerio = require("cheerio");
const       fs = require("fs");


const saveCompany = function (company) {
    const path = "./output/companies.txt";
    const output = JSON.stringify(company);
    fs.writeFile(path, output, function(error) {
       if (error === null) {
           console.log("Companies successfully saved");
       } else {
           console.log("error!", error);
       }
    });
};


const getCompanyName = function (c) {
    return c.text().split("\n")[2].trim().toLowerCase();
};


const getCompaniesFromBody = function (body) {
    const options = {
        decodeEntities: false
    };

    let companies = [];
    const selector = cheerio.load(body, options);
    const company = selector("#current-company-tags").children();

    for (let i = 0; i < company.length; i++) {
        let c = selector(company[i]);
        companies.push(getCompanyName(c));
    }

    saveCompany(companies);
};


const __main = function () {
    const url = "https://leetcode.com/problems/";
    request(url, function (err, res, body) {
        if (err === null && res.statusCode === 200) {
            console.log("successfully get company names");

            getCompaniesFromBody(body);

        } else {
            console.log("error!", err);
        }
    });
};


__main();
