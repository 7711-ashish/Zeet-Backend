
var express = require('express');
var router = express.Router();
const User = require("../db/User")
const https = require("https");
const axios = require('axios');

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();
let hour = today.getHours();
var hours = ""
console.log(hour)
if (hour > 9)
    hours = String(hour)
else {
    hours = '0' + String(hour)
}
today = yyyy + '-' + mm + '-' + dd + 'T' + hours + ':00';

router.get("/soil/:lat/:longi", async (req, res) => {

    let longi = req.params.longi
    let lat = req.params.lat

    console.log(longi)
    console.log(lat)

    https.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${longi}&hourly=soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm&timezone=IST`, (resp) => {

        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            const result = JSON.parse(data);
            var index = result.hourly.time.indexOf(today)
    
            const rslt = {
                soil_temperature_0cm: result.hourly.soil_temperature_0cm[index],
                soil_temperature_6cm: result.hourly.soil_temperature_6cm[index],
                soil_temperature_18cm: result.hourly.soil_temperature_18cm[index],
                soil_temperature_54cm: result.hourly.soil_temperature_54cm[index],
            }
            res.send(rslt);
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    })
})


router.get("/soil/moist/:lat/:longi", async (req, res) => {

    let longi = await req.params.longi
    let lat = await req.params.lat

    https.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${longi}&hourly=soil_moisture_0_1cm,soil_moisture_1_3cm,soil_moisture_3_9cm,soil_moisture_9_27cm,soil_moisture_27_81cm&timezone=IST`, (resp) => {

        const d = new Date();
        let hour = d.getHours();

        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            const result = JSON.parse(data);
            var index = result.hourly.time.indexOf(today)
            const rslt = {
                soil_moisture_0_1cm: result.hourly.soil_moisture_0_1cm[index],
                soil_moisture_1_3cm: result.hourly.soil_moisture_1_3cm[index],
                soil_moisture_3_9cm: result.hourly.soil_moisture_3_9cm[index],
                soil_moisture_9_27cm: result.hourly.soil_moisture_9_27cm[index],
                soil_moisture_27_81cm: result.hourly.soil_moisture_27_81cm[index]
            }
            res.send(rslt);
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    })
})


router.post("/current", async (req, res) => {

    let lat = req.body.lat;

    let lon = req.body.lon;

    const url = 'https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current_weather=true&daily=apparent_temperature_max,apparent_temperature_min,sunrise,sunset&timezone=IST'

    https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            const result = JSON.parse(data);

            const rslt = {
                temperature: result.current_weather.temperature,
                windspeed: result.current_weather.windspeed,
                winddirection: result.current_weather.winddirection,
                weathercode: result.current_weather.weathercode,
                time: result.current_weather.time,
                maxtemp: result.daily.apparent_temperature_max,
                mintemp: result.daily.apparent_temperature_min,
                sunrise: result.daily.sunrise[0],
                sunset: result.daily.sunset[0]
            }

            res.send(rslt);
        });
    }).on("error", (err) => {
        res.status(400).send("Error")
    })
})


router.post("/hourly-forecast", async (req, res) => {
    let lat = req.body.lat;

    let lon = req.body.lon;
    const url = 'https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&hourly=temperature_2m,relativehumidity_2m,dewpoint_2m,cloudcover,weathercode&timezone=IST';

    https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            const result = JSON.parse(data);
            let weathercodeFor4 = [];
            weathercodeFor4.push(result.hourly.weathercode[0]);
            weathercodeFor4.push(result.hourly.weathercode[24]);
            weathercodeFor4.push(result.hourly.weathercode[48]);
            weathercodeFor4.push(result.hourly.weathercode[72]);
            const relt = {

                temperature_2m: result.hourly.temperature_2m,
                relativehumidity: result.hourly.relativehumidity_2m,
                dewpoint: result.hourly.dewpoint_2m,
                cloudcover: result.hourly.cloudcover,
                weathercode: result.hourly.weathercode,
                weathercodeFor4: weathercodeFor4
            }
            res.send(relt);
        });
    }).on("error", (err) => {
        res.status(400).send("Error")
    })
})



router.get("/relativehumidity_2m", async (req, res) => {
    https.get('https://api.open-meteo.com/v1/forecast?latitude=16.85438&longitude=74.56417&hourly=relativehumidity_2m&timezone=IST', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            res.send(data);
        });
    }).on("error", (err) => {
        res.status(400).send("Error")
    })
})

router.get("/dewpoint_2m", async (req, res) => {
    https.get('https://api.open-meteo.com/v1/forecast?latitude=16.85438&longitude=74.56417&hourly=dewpoint_2m/timezone=IST', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            res.send(data);
        });
    }).on("error", (err) => {
        res.status(400).send("Error")
    })
})

router.get("/apparent_temperature", async (req, res) => {
    https.get('https://api.open-meteo.com/v1/forecast?latitude=16.85438&longitude=74.56417&hourly=apparent_temperature&timezone=IST', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            let result = JSON.parse(data)
            let r = 0;
            for (var i = 0; i < 24; i++) {
                r += result.hourly.apparent_temperature[i];
            }
            res.send(result.hourly.apparent_temperature);
        });
    }).on("error", (err) => {
        res.status(400).send("Error")
    })
})

router.get("/rain", async (req, res) => {
    https.get('https://api.open-meteo.com/v1/forecast?latitude=16.85438&longitude=74.56417&hourly=rain&timezone=IST', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            res.send(data);
        });
    }).on("error", (err) => {
        res.status(400).send("Error")
    })
})


router.post("/airqality_pm", async (req, res) => {

    let lat = req.body.lat;

    let lon = req.body.lon;

    const url = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=" + lat + "&longitude=" + lon + "&hourly=pm10,pm2_5&timezone=IST";

    https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            const result = JSON.parse(data);
            res.send({
                
                pm10 : result.hourly.pm10[hour],
            
                pm2_5 :  result.hourly.pm2_5[hour]
            });
        });
    })

})

router.post("/airqality_gas", async (req, res) => {
    let lat = req.body.lat;
    let lon = req.body.lon;
    const url = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=" + lat + "&longitude=" + lon + "&hourly=carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=IST";
    https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            console.log(JSON.parse(data));
            const result = JSON.parse(data);

            const fr = {

                nitrogen_dioxide :result.hourly.nitrogen_dioxide[hour],

                carbon_monoxide: result.hourly.carbon_monoxide[hour],

                sulphur_dioxide: result.hourly.sulphur_dioxide[hour],

                ozone : result.hourly.ozone[hour],

            }
            res.send(fr);
        });
    })

})






router.post(`/history/:start/:end`, async (req, res) => {
    let st = req.params.start;
    let en = req.params.end;
    const url = 'https://archive-api.open-meteo.com/v1/era5?latitude=16.85438&longitude=74.56417&start_date=' + st + '&end_date=' + en + '&hourly=temperature_2m&timezone=IST';
    https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {

            const result = JSON.parse(data);
            res.send(result.hourly.temperature_2m);
        });
    }).on("error", (err) => {
        res.status(400).send("Error")
    })
})

module.exports = router