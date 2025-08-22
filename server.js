const express = require("express");
const app = express();
const port = 3000;
let globalResultData = null;
let globalErrormsg = null;

app.use(express.json());


app.post("/api/echo", (req, res) => {
    res.json({you_sent: req.body});
});


/*
* (step 1) 기업 5개씩 종목 코드에 할당하기 ['005930' , ''] ..  아래 복붙해나가면서 수정, (step 2) git commit push 작업까지
* (step 3) 크롬 탭 들어가서 /api/hello 접속, 전체 복붙해서 메모장에 붙여넣고  s??.json 이름의 파일 저장하기
*                                                                                                                   (step 4) Excel columns 15 -> 파워쿼리 -> 전처리(종목코드명전체 <- 이 컬럼제거) -> 14 컬럼으로 맞춰야함
*/

// API 정보와 종목 코드 배열
const axios = require('axios');
const serviceKey = 'ILHpBh/Ei4zp88S4zdGSxnDALfZ76JTiJzofGsEYYiGpXldHO3QV39MxgM8sOjSxhLxHS9AV7XDjgoR3u3DGxw==';
const apiUrl = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';
const stockCodes = ['023530', '028260', '028300', '032830', '033780']; //4
/*
잘라내기 Ctrl + X






['034020', '035420', '035720', '035900', '041510']; //5

['051910', '055550', '058470', '066570', '068270']; //6

['078340', '086790', '090430', '096770', '097950']; //7

['105560', '112040', '128940', '205470', '207940']; //8

['214370', '225570', '237690', '247540', '259960']; //9

['263750', '272450', '278280', '293490', '329180']; //10
* */


async function fetchAndInsertStockData() {
    const allDataPromises = stockCodes.map(code => {
        const params = {
            serviceKey: serviceKey,
            resultType: 'json',
            beginBasDt: '20200101',
            endBasDt: '20250822',
            likeSrtnCd: code,
            numOfRows: 13000,
            pageNo: 1
        };
        return axios.get(apiUrl, {params});
    });

    try {
        globalErrormsg = allDataPromises;
        console.log(globalErrormsg)
        const responses = await Promise.all(allDataPromises);
        console.log(responses);
        let combinedData = [];

        for (const response of responses) {
            const rawData = response.data;
            const items = rawData.response.body.items.item;
            if (items) {
                const formattedData = items.map(item => ({
                    base_date: item.basDt,
                    short_code: item.srtnCd,
                    isin_code: item.isinCd,
                    item_name: item.itmsNm,
                    market_category: item.mrktCtg,
                    closing_price: parseInt(item.clpr),
                    compared_to_previous: parseInt(item.vs),
                    fluctuation_rate: parseFloat(item.fltRt),
                    market_price: parseInt(item.mkp),
                    high_price: parseInt(item.hipr),
                    low_price: parseInt(item.lopr),
                    trade_quantity: parseInt(item.trqu),
                    trade_price: parseInt(item.trPrc),
                    listed_stock_count: parseInt(item.lstgStCnt),
                    market_total_amount: parseInt(item.mrktTotAmt)
                }));

                console.log(`${formattedData[0].item_name || '종목 코드'}에 대한 데이터가 성공적으로 정형화되었습니다.`);

                combinedData = combinedData.concat(formattedData);

            }
        }
        globalResultData = combinedData;
    } catch (error) {
        globalErrormsg = error;
        console.error('API 호출 또는 데이터 처리 중 오류 발생:', error);
    }
}

fetchAndInsertStockData();

app.get("/api/hello", (req, res) => {
    if (globalResultData) {
        res.json(globalResultData);
    } else {
        res.status(503).json({message: globalErrormsg});
    }
});


app.listen(port, () => console.log(`Server running at http://0.0.0.0:${port}`));
