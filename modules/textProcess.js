const request = require('request');

//Keywords for chinese question processing
const greatingKeyword_chinese = ["你好", "妳好", "您好", "嗨", "哈摟", "早安", "午安", "晚安"];
const introKeyword_chinese = ["名字", "叫", "稱呼", "稱謂"];
const jobKeyword_chinese = ["工作", "職位"];
const educationKeyword_chinese = ["教育", "學校", "大學", "系"];
const abilityKeyword_chinese = ["能力", "會什麼", "技能", "優勢", "優點"];
const interestKeyword_chinese = ["興趣", "喜歡", "愛"];
const leadershipKeyword_chinese = ["領導", "合作"];
const failureKeyword_chinese = ["失敗"];
const lineKeyword_chinse = ["line", "公司"];

/**
 * check the sentence has chinese character or not
 * @param text the sentence to check
 * @returns {boolean} true: has at least one chinese character. false: all english characters
 */
function checkHasChinese(text) {
    let reg = /[^\x00-\xff]/ig;
    return reg.test(text);
}

/**
 * check if this sentence contain at least one of the keywords
 * @param text the sentence the user asked
 * @param keywords array of keywords
 * @returns {boolean} return true if the sentence contain at least one keyword. Otherwise false
 */
function contain_chinese(text, keywords) {
    for (let i = 0; i < keywords.length; i++){
        if (text.indexOf(keywords[i]) !== -1){
            return true;
        }
    }
    return false;
}

/**
 * process and answer chinese questions
 * @param text the question
 * @returns {string} answer of string
 */
function answerChineseQuestions(text) {
    if (contain_chinese(text, introKeyword_chinese)){
        return "你好，我叫做張洛瑜，英文名字是Adrian Chang";
    }else if (contain_chinese(text, jobKeyword_chinese)){
        return "我現在是位剛畢業的資工系學生，希望可以找到一份工程師的工作";
    }else if (contain_chinese(text, educationKeyword_chinese)){
        return "我就讀的大學是台灣國立交通大學資訊工程學系，我將在今年2018年畢業，並且我最近才剛從美國Carnegie Mellon University交換學生回來";
    }else if (contain_chinese(text, abilityKeyword_chinese)){
        return "我是一位資工系的學生，我的興趣所在是做產品，熟悉的語言有Java, Javascript, C, C++，同時還會Python，在手機程式開發與網頁方面曾經做過多項project，因為我希望未來可以做出受大家喜歡的產品所以參與過幾個HCI的project，最後我曾經到美國Carneige Mellon University交換學生過，所以我能流利用英語與外國人溝通，最近為了增進自己的實力正在朝Deep Learning方向學習";
    }else if(contain_chinese(text, interestKeyword_chinese)){
        return "我喜歡非常喜歡創造產品，看著一個簡單的想法慢慢變成一個實實在在有用的產品那種成就感就是驅使我當電腦工程師的原因";
    }else if(contain_chinese(text, greatingKeyword_chinese)){
        return "你好啊，如果有什麼關於我的問題請盡量問，我會盡力回答你的";
    }else if (contain_chinese(text, leadershipKeyword_chinese)) {
        return "我是一個很喜歡和別人合作的人，對於領導人特別有興趣，我特別喜歡掌握狀況的感覺";
    }else if (contain_chinese(text, failureKeyword_chinese)) {
        return "我人生最大的失敗應該是學測劃錯卡，我是一個在時間急迫壓力下容易出錯的人，所以我習慣永遠預先完成作業以備不時之需";
    }else if (contain_chinese(text, lineKeyword_chinse)) {
        return "我之所以會想要申請Line公司的實習是因為Line是非常大的網路公司，每天在處理數百億的訊息，同時我也能遇到非常厲害的人，一起合作與互相激勵，這將是我學習非常好的地方";
    }else {
        return "不好意思 我不太能理解你的意思";
    }
}

/**
 * Query dialogflow for ai response for english sentence
 * call answerChineseQuestions to answer chinese sentence
 * @param text the question dialogflow has to respond to
 * @returns {Promise<any>}
 */
exports.processText = function processText(text) {
    console.log("text is " + text);
    return new Promise((resolve, reject) => {
        if(checkHasChinese(text)){
            try{
                let chineseAnswer = answerChineseQuestions(text);
                resolve(chineseAnswer);
            }catch (e) {
                reject("Can't answer this chinese question");
            }
        }else{
            const language = 'en';
            const sessionId = '12345';
            const myUrl = 'https://api.dialogflow.com/v1/query?v=2015091&lang=' + language
                + '&query=' + text
                + '&sessionId=' + sessionId
                + '&timezone=Asia/Hong_Kong';
            const options = {
                url: myUrl,
                headers: {
                    'Authorization': 'Bearer ' + process.env.myDialogFlowClientToken
                }
            };
            if (text === '') {
                resolve("Sorry I can't recognize that");
            }
            request(options, (err, res, body) => {
                if (!err && res.statusCode === 200) {
                    let bodyParsed = JSON.parse(body);
                    resolve(bodyParsed.result.fulfillment.speech);
                }else if (err) {
                    reject(err);
                }else{
                    reject("response with status code " + res.statusCode);
                }
            });
        }
    });
}