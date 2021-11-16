const d3 = require('d3');
const { number } = require('prop-types');

exports.calculateScales = (width, height, xValues, yValues, xDomain = [], yDomain = []) => {
  let xScale;
  if (xValues.length > 0 && Object.prototype.toString.call(xValues[0]) === '[object Date]') {
    xScale = d3.scaleTime()
      .range([0, width]);
  } else {
    /*
    TODO: allow select scale num, str, date
    xScale = d3.scaleBand()
    xScale.domain(xValues);
    */

    xScale = d3.scaleLinear()
    // xScale = d3.scaleBand()
      .range([0, width]);
  }
  const xdomain = d3.extent(xValues);
  if (xDomain[0] !== undefined && xDomain[0] !== null) xdomain[0] = xDomain[0];
  if (xDomain[1] !== undefined && xDomain[1] !== null) xdomain[1] = xDomain[1];
  xScale.domain(xdomain);

  // xScale.domain(xValues.sort());





  let yScale;
  if (yValues.length > 0 && Object.prototype.toString.call(yValues[0]) === '[object Date]') {
    yScale = d3.scaleTime()
      .range([height, 0]);
  } else {
    /* TODO: Allow scaleLog */
    yScale = d3.scaleLinear()
      .range([height, 0]);
  }

  yValues = yValues.map( y=>parseInt(y))
  const ydomain = d3.extent(yValues);
  if (yDomain[0] !== undefined && yDomain[0] !== null) ydomain[0] = yDomain[0];
  if (yDomain[1] !== undefined && yDomain[1] !== null) ydomain[1] = yDomain[1];
  yScale.domain(ydomain);

  return {
    xScale,
    yScale,
  };
};

// debounce from Underscore.js
// MIT License: https://raw.githubusercontent.com/jashkenas/underscore/master/LICENSE
// Copyright (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative
// Reporters & Editors
exports.debounce = (func, wait, immediate) => {
  let timeout;
  return function debounce(...args) {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

exports.flattenData = (data, xAccessor, yAccessor) => {
  const allValues = [];
  const xValues = [];
  const yValues = [];
  const coincidentCoordinateCheck = {};

  data.forEach((series, i) => {
    series.values.forEach((item, j) => {
      const x = xAccessor(item);

      // Check for NaN since d3's Voronoi cannot handle NaN values
      // Go ahead and Proceed to next iteration since we don't want NaN
      // in allValues or in xValues or yValues
      // if (isNaN(x)) {
      //   return;
      // }
      xValues.push(x);

      const y = yAccessor(item);
      // when yAccessor returns an object (as in the case of candlestick)
      // iterate over the keys and push all the values to yValues array
      let yNode;
      if (typeof y === 'object' && Object.keys(y).length > 0) {
        Object.keys(y).forEach((key) => {
          // Check for NaN since d3's Voronoi cannot handle NaN values
          // Go ahead and Proceed to next iteration since we don't want NaN
          // in allValues or in xValues or yValues
          if (isNaN(y[key])) {
            return;
          }
          yValues.push(y[key]);
          // if multiple y points are to be plotted for a single x
          // as in the case of candlestick, default to y value of 0
          yNode = 0;
        });
      } else {
        // Check for NaN since d3's Voronoi cannot handle NaN values
        // Go ahead and Proceed to next iteration since we don't want NaN
        // in allValues or in xValues or yValues
        if (isNaN(y)) {
          return;
        }
        yValues.push(y);
        yNode = y;
      }

      const xyCoords = `${x}-${yNode}`;
      if (coincidentCoordinateCheck.hasOwnProperty(xyCoords)) {
        // Proceed to next iteration if the x y pair already exists
        // d3's Voronoi cannot handle NaN values or coincident coords
        // But we push them into xValues and yValues above because
        // we still may handle them there (labels, etc.)
        return;
      }
      coincidentCoordinateCheck[xyCoords] = '';

      const pointItem = {
        coord: {
          x,
          y: yNode,
        },
        d: item,
        id: series.name + j,
        series,
        seriesIndex: i,
      };
      allValues.push(pointItem);
    });
  });

  return { allValues, xValues, yValues };
};


function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb) {
  return "#" + componentToHex(parseInt(rgb[0])) + componentToHex(parseInt(rgb[1])) + componentToHex(parseInt(rgb[2]));
}


exports.shade = (hex, percent) => {
  let red;
  let green;
  let blue;
  const min = Math.min;
  const round = Math.round;

  if (hex.length !== 7) {
    const rgb = hex.substring(4, hex.length-1)
         .replace(/ /g, '')
         .split(',');
    hex = rgbToHex(rgb)
  }
  if (hex.length > 10) { return hex; }


  const number = parseInt(hex.slice(1), 16);
  const R = number >> 16;
  const G = number >> 8 & 0xFF;
  const B = number & 0xFF;
  red = min(255, round((1 + percent) * R)).toString(16);
  if (red.length === 1) red = `0${red}`;
  green = min(255, round((1 + percent) * G)).toString(16);
  if (green.length === 1) green = `0${green}`;
  blue = min(255, round((1 + percent) * B)).toString(16);
  if (blue.length === 1) blue = `0${blue}`;
  return `#${red}${green}${blue}`;
};




exports.nFormatter = (num, digits) => {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}




exports.formatInputData = require('./input').formatInputData;
exports.rd3FormatInputData = require('./input').rd3FormatInputData;
