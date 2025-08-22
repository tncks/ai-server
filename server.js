const express = require("express");
const app = express();
const port = 3000;
let globalResultData = null;

app.use(express.json());



app.post("/api/echo", (req, res) => {
    res.json({ you_sent: req.body });
});








// API 정보와 종목 코드 배열
const axios = require('axios');
const serviceKey = 'ILHpBh%2FEi4zp88S4zdGSxnDALfZ76JTiJzofGsEYYiGpXldHO3QV39MxgM8sOjSxhLxHS9AV7XDjgoR3u3DGxw%3D%3D';
const apiUrl = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';
const stockCodes = ['005930', '000660']; // 삼성전자, SK하이닉스

async function fetchAndInsertStockData() {
    const allDataPromises = stockCodes.map(code => {
        const params = {
            serviceKey: serviceKey,
            resultType: 'json',
            beginBasDt: '20250801',
            endBasDt: '20250821',
            likeSrtnCd: code,
            numOfRows: 60,
            pageNo: 1
        };
        return axios.get(apiUrl, { params });
    });

    try {
        const responses = await Promise.all(allDataPromises);
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
        console.error('API 호출 또는 데이터 처리 중 오류 발생:', error);
    }
}

fetchAndInsertStockData();

app.get("/api/hello", (req, res) => {
    if (globalResultData) {
        res.json(globalResultData);
    } else {
        res.status(503).json({ message: "데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요." });
    }
});




app.listen(port, () => console.log(`Server running at http://0.0.0.0:${port}`));
