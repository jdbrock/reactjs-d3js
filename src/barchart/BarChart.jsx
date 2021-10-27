'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');

const d3 = require('d3');
const DataSeries = require('./DataSeries');
const { Chart, XAxis, XGrid, YGrid, YAxis, Tooltip } = require('../common');
const {
  CartesianChartPropsMixin,
  DefaultAccessorsMixin,
  ViewBoxMixin,
  TooltipMixin,
} = require('../mixins');

module.exports = createReactClass({

  displayName: 'BarChart',

  propTypes: {
    chartClassName: PropTypes.string,
    data: PropTypes.array.isRequired,
    hoverAnimation: PropTypes.bool,
    margins: PropTypes.object,
    rangeRoundBandsPadding: PropTypes.number,
    // https://github.com/mbostock/d3/wiki/Stack-Layout#offset
    stackOffset: PropTypes.oneOf(['silhouette', 'expand', 'wigget', 'zero']),
    grouped: PropTypes.bool,
    valuesAccessor: PropTypes.func,
    xAccessorBar: PropTypes.func,
    yAccessorBar: PropTypes.func,
    y0Accessor: PropTypes.func,
    title: PropTypes.string,
    xAxisClassName: PropTypes.string,
    yAxisClassName: PropTypes.string,
    yAxisTickCount: PropTypes.number,
    xIsDate: PropTypes.bool,
    color: PropTypes.object,
  },




  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin, TooltipMixin],

  getDefaultProps() {
    return {
      chartClassName: 'rd3-barchart',
      hoverAnimation: true,
      margins: { top: 10, right: 20, bottom: 40, left: 45 },
      rangeRoundBandsPadding: 0.25,
      stackOffset: 'zero',
      grouped: false,
      valuesAccessor: d => d,
      y0Accessor: d => d[0],
      xAxisClassName: 'rd3-barchart-xaxis',
      yAxisClassName: 'rd3-barchart-yaxis',
      yAxisTickCount: 4,
      xIsDate: false,
      color: {acessor:null, colors:null}
    };
  },


  getInitialState() {
    return {
      color: {
        accessor: this.props.color.accessor === 'Sequential'
                    ? this.props.colorAccessorSequential
                    : this.props.colorAccessorOrdinal,
        colors: this.props.color.colors ||  d3.scaleOrdinal(d3.schemeGnBu[9].reverse())
      }
    }
  },


  _getLabels(firstSeries) {
    // we only need first series to get all the labels
    const { valuesAccessor, xAccessorBar } = this.props;
    return valuesAccessor(firstSeries).map(xAccessorBar);
  },

  _stack(seriesNames) {
    // Only support columns with all positive or all negative values
    // https://github.com/mbostock/d3/issues/2265
    const { stackOffset, xAccessorBar, yAccessorBar, valuesAccessor } = this.props;
    return d3.stack()
              .keys(seriesNames)
              .order(d3.stackOrderNone)
              .offset(d3.stackOffsetNone);
  },

  render() {
    const props = this.props;
    const yOrient = this.getYOrient();

    const domain = props.domain || {};

    if (props.data.length === 0) {
      return null;
    }

    const _array = props.data
    const dataDict = {}

    _array.map( (elem, idxE) => {
        let bar;
        props.xIsDate ? bar = new Date(elem.x).toLocaleDateString() : bar = elem.x;
        if (typeof dataDict[bar] === 'undefined'){
          dataDict[bar] = {'x':bar, [elem.name]:+elem.y}
        }else{
          dataDict[bar][elem.name] = +elem.y
        }
    })
    const data = Object.keys(dataDict).map(function(key){
        return dataDict[key];
    });

    let series = new Set(props.data.map((item) => item.name));
    series = Array.from(series);
    const _data = this._stack(series)(data);
    const { innerHeight, innerWidth, trans, svgMargins } = this.getDimensions();

    const xScale = d3.scaleBand()
    .domain(data.map(d => d.x))
    .paddingInner(0.1)
    .paddingOuter(0.1)
    .range([0, innerWidth])

    const minYDomain = Math.min(0, d3.min(_data, (d) => (d[1])))
    const maxYDomain = d3.max(_data, (d) => (d[1]))
    const yDomain = ([d3.min(_data, d => d3.min(d, d => d[1])), d3.max(_data, d => d3.max(d, d => d[1]))])
    const yScale = d3.scaleLinear().range([innerHeight, 0]).domain(yDomain);

    const origArray = [...Array(data.length).keys()];
    let colorsDomain;
    this.props.color.accessor === 'Sequential'
      ? colorsDomain = origArray.map(x => x / data.length)
      : colorsDomain = series

    return (
      <span>
        <Chart
          viewBox={this.getViewBox()}
          legend={props.legend}
          data={props.data}
          margins={props.margins}
          colors={this.state.color.colors}
          colorAccessor={this.state.color.accessor}
          width={props.width}
          height={props.height}
          title={props.title}
          shouldUpdate={!this.state.changeState}
        >
          <g transform={trans} className={props.chartClassName}>
            <XGrid
              xAxisClassName={props.xAxisClassName}
              xAxisTickValues={props.xAxisTickValues}
              xAxisLabel={props.xAxisLabel}
              xAxisLabelOffset={props.xAxisLabelOffset}
              xScale={xScale}
              margins={svgMargins}
              tickFormatting={props.xAxisFormatter}
              tickStroke={props.yAxisTickStroke}
              tickTextStroke={props.yAxisTickTextStroke}
              width={innerWidth}
              height={innerHeight}
              horizontalChart={props.horizontal}
              xOrient={props.xOrient}
              yOrient={yOrient}
              gridVertical={props.gridVertical}
              gridVerticalStroke={props.gridVerticalStroke}
              gridVerticalStrokeWidth={props.gridVerticalStrokeWidth}
              gridVerticalStrokeDash={props.gridVerticalStrokeDash}
              gridTxtRotate={props.gridTxtRotate}
              gridTranslate={props.gridTranslate}
            />
            <YGrid
              yAxisClassName={props.yAxisClassName}
              yAxisTickValues={props.yAxisTickValues}
              yAxisLabel={props.yAxisLabel}
              yAxisLabelOffset={props.yAxisLabelOffset}
              yScale={yScale}
              margins={svgMargins}
              yAxisTickCount={props.yAxisTickCount}
              tickFormatting={props.yAxisFormatter}
              tickStroke={props.xAxisTickStroke}
              tickTextStroke={props.xAxisTickTextStroke}
              width={innerWidth}
              height={innerHeight}
              horizontalChart={props.horizontal}
              xOrient={props.xOrient}
              yOrient={yOrient}
              gridHorizontal={props.gridHorizontal}
              gridHorizontalStroke={props.gridHorizontalStroke}
              gridHorizontalStrokeWidth={props.gridHorizontalStrokeWidth}
              gridHorizontalStrokeDash={props.gridHorizontalStrokeDash}
              gridTxtRotate={props.gridTxtRotate}
              gridTranslate={props.gridTranslate}
            />
            <DataSeries
              yScale={yScale}
              xScale={xScale}
              margins={svgMargins}
              _data={_data}
              series={series}
              width={innerWidth}
              height={innerHeight}
              grouped={props.grouped}
              colors={this.state.color.colors}
              colorsDomain={colorsDomain}
              colorAccessor={this.state.color.accessor}
              hoverAnimation={props.hoverAnimation}
              valuesAccessor={props.valuesAccessor}
              xAccessorBar={props.xAccessorBar}
              yAccessorBar={props.yAccessorBar}
              y0Accessor={props.y0Accessor}
              onMouseOver={this.onMouseOver}
              onMouseLeave={this.onMouseLeave}
            />
            <YAxis
              yAxisClassName={props.yAxisClassName}
              yAxisTickValues={props.yAxisTickValues}
              yAxisLabel={props.yAxisLabel}
              yAxisLabelOffset={props.yAxisLabelOffset}
              yScale={yScale}
              margins={svgMargins}
              yAxisTickCount={props.yAxisTickCount}
              tickFormatting={props.yAxisFormatter}
              tickStroke={props.xAxisTickStroke}
              tickTextStroke={props.xAxisTickTextStroke}
              width={innerWidth}
              height={innerHeight}
              horizontalChart={props.horizontal}
              xOrient={props.xOrient}
              yOrient={yOrient}
            />
            <XAxis
              xAxisClassName={props.xAxisClassName}
              xAxisTickValues={props.xAxisTickValues}
              xAxisLabel={props.xAxisLabel}
              xAxisLabelOffset={props.xAxisLabelOffset}
              xScale={xScale}
              margins={svgMargins}
              tickFormatting={props.xAxisFormatter}
              tickStroke={props.yAxisTickStroke}
              tickTextStroke={props.yAxisTickTextStroke}
              width={innerWidth}
              height={innerHeight}
              horizontalChart={props.horizontal}
              xOrient={props.xOrient}
              yOrient={yOrient}
            />



          </g>
        </Chart>
        {(props.showTooltip ? <Tooltip {...this.state.tooltip} /> : null)}
      </span>
    );
  },
});
