/*
    Different format for input data are allowed.
    Converts each one for rd3 internal format.
*/

const csvRows = (data) => {
    const dataDict = {}
    data.map( (elem, idxE) => {
        const bar = elem.x;
        if (typeof dataDict[bar] === 'undefined'){
          dataDict[bar] = {'x':bar, [elem.name]:+elem.y}
        }else{
          dataDict[bar][elem.name] = +elem.y
        }
    })

    let series = new Set(data.map((item) => item.name));
    series = Array.from(series);

    data = Object.keys(dataDict).map(function(key){
        return dataDict[key];
    });

    return [data, series]
}

/* FOR BARCHART ONLY. HAVE TO READAPT BARCHART TO RD3 STANDARD */
exports.formatInputData = (inputDataLayout, data) => {
    if (inputDataLayout === 'csvRows'){
        return csvRows(data)
    }
    else if (inputDataLayout === 'csvStandard'){
        let series = Object.keys(data[0]).filter( f => f !== 'x')
        return [data, series]
    }
}


/* CONVERT EXTERNAL INPUT TO RD3 API FORMAT */
/* RD3 FORMAT
[{
    name: 'series1',
    values: [{ x: 0, y: 20 }, { x: 1, y: 30 }, { x: 2, y: 10 }, { x: 3, y: 5 }, { x: 4, y: 8 }, { x: 5, y: 15 }, { x: 6, y: 10 }],
    strokeWidth: 3,
    strokeDashArray: '5,5'
}]
*/

/* CSV Standard
0:
Lib 1: "74.0"
Lib 2: "0.0"
Lib 3: "5.0"
Lib 4: "14.0"
Lib 5: "10.0"
Lib 6: "197.0"
Lib 7: "160.0"
x: "202044"
*/

const csvStandard2rd3 = (data, xIsDate, strokeWidth) => {

    let dataObj = []
    data.map( (d) =>  {

        for (const prop in d) {
            if (prop === 'x'){continue}
            let curObj = dataObj.filter(obj => {
                return obj.name === prop
            })
            curObj = curObj[0]
            if (curObj === undefined ){

                curObj = {'name': prop, 'strokeWidth':parseInt(strokeWidth),  'values': []}
                dataObj.push(curObj)
            }
            const x = xIsDate === true ? new Date(Date.parse(d.x)) : d.x;
            curObj['values'].push({x:x, y:parseFloat(d[prop])})
        }
    })
    let series = Object.keys(data[0]).filter( f => f !== 'x')

    return [dataObj, series]
}




const csvRows2rd3 = (data, xIsDate, strokeWidth) => {
    let dataObj = []
    data.map( (d) =>  {
        let curObj = dataObj.filter(obj => {
            return obj.name === d.name
        })
        // debugger
        curObj = curObj[0]
        if (curObj === undefined){
            curObj = {'name': d.name, 'strokeWidth':strokeWidth, 'values': []}
            dataObj.push(curObj)
        }
        const x = xIsDate === true ? new Date(d.x) : d.x;
        curObj['values'].push({x:x, y:d.y})
    })

    let series = new Set(data.map((item) => item.name));
    series = Array.from(series);

    return [dataObj, series]
};


exports.rd3FormatInputData = (inputDataLayout, data, xIsDate, strokeWidth) => {
    if (inputDataLayout === 'rd3'){
        return [data, data.map( d=> d.name)]
    }
    if (inputDataLayout === 'csvRows'){
        return csvRows2rd3(data, xIsDate, strokeWidth)
    }
    else if (inputDataLayout === 'csvStandard'){
        return csvStandard2rd3(data, xIsDate, strokeWidth)
    }
}




