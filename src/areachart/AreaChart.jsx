'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');

const d3 = require('d3');
const DataSeries = require('./DataSeries');
const { Chart, XAxis, YAxis, XGrid, YGrid } = require('../common');
const { CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin } = require('../mixins');

module.exports = createReactClass({

  displayName: 'AreaChart',

  propTypes: {
    margins: PropTypes.object,
    interpolate: PropTypes.bool,
    interpolationType: PropTypes.string,
    hoverAnimation: PropTypes.bool,
    data: PropTypes.array.isRequired,
  },

  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin],

  getDefaultProps() {
    return {
      colors: d3.scaleOrdinal(d3.schemeBlues[3].reverse()),
      // colors: d3.scaleOrdinal(d3.schemePastel2),

      margins: { top: 10, right: 20, bottom: 40, left: 45 },
      yAxisTickCount: 4,
      interpolate: false,
      interpolationType: null,
      className: 'rd3-areachart',
      hoverAnimation: true,
      data: [],
    };
  },

  render() {
    const props = this.props;
    let data = props.data;
    const interpolationType =
      props.interpolationType ||
      (props.interpolate ? 'cardinal' : 'linear');

    const { innerWidth, innerHeight, trans, svgMargins } = this.getDimensions();
    const yOrient = this.getYOrient();

    if (!Array.isArray(data)) {
      data = [data];
    }
    if (this.props.data && this.props.data.length < 1) {
      return null;
    }

    const yScale = d3.scaleLinear()
      .range([innerHeight, 0]);

    const xValues = [];
    const yValues = [];
    // const seriesNames = [];
    // const yMaxValues = [];
    const domain = props.domain || {};
    const xDomain = domain.x || [];
    const yDomain = domain.y || [];
    const seriesNames = Object.keys(data[0]).filter( f => f !== 'date') || [];

    const yMaxValues = d3.sum(seriesNames.map( n => {
        return d3.max(data.map( d => { return d[n]}))
    }))


    /* TODO - generalize. Only acceptint field date for x axis*/
    data.map( d => {
      xValues.push(d.date);
    })


    let xScale;
    if (xValues.length > 0 &&
      Object.prototype.toString.call(xValues[0]) === '[object Date]' &&
      props.xAxisTickInterval) {
      xScale = d3.scaleTime()
        .range([0, innerWidth]);
    } else {
      xScale = d3.scaleLinear()
        .range([0, innerWidth]);
    }

    const xdomain = d3.extent(xValues);
    if (xDomain[0] !== undefined && xDomain[0] !== null) xdomain[0] = xDomain[0];
    if (xDomain[1] !== undefined && xDomain[1] !== null) xdomain[1] = xDomain[1];
    xScale.domain(xdomain);
    const ydomain = [0, yMaxValues];
    if (yDomain[0] !== undefined && yDomain[0] !== null) ydomain[0] = yDomain[0];
    if (yDomain[1] !== undefined && yDomain[1] !== null) ydomain[1] = yDomain[1];

    yScale.domain(ydomain);

    const colorsDomain = Array.from(Array(seriesNames.length).keys())
    props.colors.domain(colorsDomain);

    const stack = d3.stack()
    stack.keys(seriesNames)

    const layers = stack(data)
    const dataSeries = layers.map((d, idx) => (
        <DataSeries
        key={idx}
        fill={props.colors(props.colorAccessor(d, idx))}
        // seriesName={d.name}
        index={idx}
        xScale={xScale}
        yScale={yScale}
        data={d}
        xAccessor={props.xAccessor}
        yAccessor={props.yAccessor}
        interpolationType={interpolationType}
        hoverAnimation={props.hoverAnimation}
      />

    ));

    return (
      <Chart
        viewBox={this.getViewBox()}
        legend={props.legend}
        data={data}
        margins={props.margins}
        width={props.width}
        height={props.height}
        title={props.title}
      >
        <g transform={trans} className={props.className}>
        <XGrid
            xAxisClassName="rd3-areachart-xaxis"
            xScale={xScale}
            xAxisTickValues={props.xAxisTickValues}
            xAxisTickInterval={props.xAxisTickInterval}
            xAxisTickCount={props.xAxisTickCount}
            xAxisLabel={props.xAxisLabel}
            xAxisLabelOffset={props.xAxisLabelOffset}
            tickFormatting={props.xAxisFormatter}
            tickStroke={props.xAxisTickStroke}
            tickTextStroke={props.xAxisTickTextStroke}
            xOrient={props.xOrient}
            yOrient={yOrient}
            margins={svgMargins}
            width={innerWidth}
            height={innerHeight}
            horizontalChart={props.horizontal}
            gridVertical={props.gridVertical}
            gridVerticalStroke={props.gridVerticalStroke}
            gridVerticalStrokeWidth={props.gridVerticalStrokeWidth}
            gridVerticalStrokeDash={props.gridVerticalStrokeDash}
          />
          <YGrid
            yAxisClassName="rd3-areachart-yaxis"
            yScale={yScale}
            yAxisTickValues={props.yAxisTickValues}
            yAxisTickInterval={props.yAxisTickInterval}
            yAxisTickCount={props.yAxisTickCount}
            yAxisLabel={props.yAxisLabel}
            yAxisLabelOffset={props.yAxisLabelOffset}
            tickFormatting={props.yAxisFormatter}
            tickStroke={props.yAxisTickStroke}
            tickTextStroke={props.yAxisTickTextStroke}
            xOrient={props.xOrient}
            yOrient={yOrient}
            margins={svgMargins}
            width={innerWidth}
            height={props.height}
            horizontalChart={props.horizontal}
            gridHorizontal={props.gridHorizontal}
            gridHorizontalStroke={props.gridHorizontalStroke}
            gridHorizontalStrokeWidth={props.gridHorizontalStrokeWidth}
            gridHorizontalStrokeDash={props.gridHorizontalStrokeDash}
          />
          {dataSeries}
          <XAxis
            xAxisClassName="rd3-areachart-xaxis"
            xScale={xScale}
            xAxisTickValues={props.xAxisTickValues}
            xAxisTickInterval={props.xAxisTickInterval}
            xAxisTickCount={props.xAxisTickCount}
            xAxisLabel={props.xAxisLabel}
            xAxisLabelOffset={props.xAxisLabelOffset}
            tickFormatting={props.xAxisFormatter}
            tickStroke={props.xAxisTickStroke}
            tickTextStroke={props.xAxisTickTextStroke}
            xOrient={props.xOrient}
            yOrient={yOrient}
            margins={svgMargins}
            width={innerWidth}
            height={innerHeight}
            horizontalChart={props.horizontal}
            gridVertical={props.gridVertical}
            gridVerticalStroke={props.gridVerticalStroke}
            gridVerticalStrokeWidth={props.gridVerticalStrokeWidth}
            gridVerticalStrokeDash={props.gridVerticalStrokeDash}
          />
          <YAxis
            yAxisClassName="rd3-areachart-yaxis"
            yScale={yScale}
            yAxisTickValues={props.yAxisTickValues}
            yAxisTickInterval={props.yAxisTickInterval}
            yAxisTickCount={props.yAxisTickCount}
            yAxisLabel={props.yAxisLabel}
            yAxisLabelOffset={props.yAxisLabelOffset}
            tickFormatting={props.yAxisFormatter}
            tickStroke={props.yAxisTickStroke}
            tickTextStroke={props.yAxisTickTextStroke}
            xOrient={props.xOrient}
            yOrient={yOrient}
            margins={svgMargins}
            width={innerWidth}
            height={props.height}
            horizontalChart={props.horizontal}
            gridHorizontal={props.gridHorizontal}
            gridHorizontalStroke={props.gridHorizontalStroke}
            gridHorizontalStrokeWidth={props.gridHorizontalStrokeWidth}
            gridHorizontalStrokeDash={props.gridHorizontalStrokeDash}
          />
        </g>
      </Chart>
    );
  },
});
