'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const d3 = require('d3');
const createReactClass = require('create-react-class');
const utils = require('../utils');

const { Chart, XAxis, YAxis, XGrid, YGrid, Tooltip } = require('../common');
const DataSeries = require('./DataSeries');
const {
  CartesianChartPropsMixin,
  DefaultAccessorsMixin,
  ViewBoxMixin,
  TooltipMixin,
} = require('../mixins');

module.exports = createReactClass({

  displayName: 'LineChart',

  propTypes: {
    circleRadius: PropTypes.number,
    hoverAnimation: PropTypes.bool,
    margins: PropTypes.object,
    data: PropTypes.array.isRequired,
  },

  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin, TooltipMixin],

  getDefaultProps() {
    return {
      circleRadius: 4,
      className: 'rd3-linechart',
      hoverAnimation: true,
      margins: { top: 70, right: 20, bottom: 60, left: 60 },
      xAxisClassName: 'rd3-linechart-xaxis',
      yAxisClassName: 'rd3-linechart-yaxis',
      data: [],
      color: {
        accessor: 'Sequential',
        colors: d3.scaleSequential(d3.schemeTableau10),
      }
    };
  },

  _calculateScales: utils.calculateScales,
  _rd3FormatInputData: utils.rd3FormatInputData,

  render() {
    const props = this.props;

    if (this.props.data && this.props.data.length < 1) {
      return null;
    }

    let data;
    let series;
    [data, series] = this._rd3FormatInputData('linechart', props.inputDataLayout, props.data, props.xIsDate, props.strokeWidth)


    const { innerWidth, innerHeight, trans, svgMargins } = this.getDimensions();
    const yOrient = this.getYOrient();
    const domain = props.domain || {};

    if (!Array.isArray(data)) {
      data = [data];
    }

    // Returns an object of flattened allValues, xValues, and yValues
    const flattenedData = utils.flattenData(data, props.xAccessor, props.yAccessor);

    const allValues = flattenedData.allValues;
    const xValues = flattenedData.xValues;
    const yValues = flattenedData.yValues;
    const scales = this._calculateScales(
      innerWidth,
      innerHeight,
      xValues,
      yValues,
      domain.x,
      domain.y
    );

    let colorsDomain;
    let colorsAccessor;
    const origArray = Array.from(series.keys())

    if (this.props.color.accessor === 'Sequential'){
      colorsDomain = origArray.map(x => x / series.length)
      colorsAccessor = this.props.colorAccessorSequential
    }else{
      colorsDomain = series
      colorsAccessor = this.props.colorAccessorOrdinal
    }


    return (
      <span onMouseLeave={this.onMouseLeave}>
        <Chart
          viewBox={this.getViewBox()}
          legend={props.legend}
          sideOffset={props.sideOffset}
          data={data}
          margins={props.margins}
          color={this.props.color}
          colorsDomain={colorsDomain}
          colorsAccessor={colorsAccessor}
          width={props.width}
          height={props.height}
          title={props.title}
          shouldUpdate={!this.state.changeState}
          series={series}
          svgLegend={props.svgLegend}
          svgChart={props.svgChart}
          legendStyle={props.legendStyle}
          background={props.background}
          svgTitle={props.svgTitle}
        >
          <g transform={trans} className={props.className}>
            <XGrid
              xAxisClassName={props.xAxisClassName}
              xAxisTickValues={props.xAxisTickValues}
              xAxisTickCount={props.xAxisTickCount}
              xAxisTickInterval={props.xAxisTickInterval}
              xAxisOffset={props.xAxisOffset}
              xScale={scales.xScale}
              xAxisLabel={props.xAxisLabel}
              xAxisLabelOffset={props.xAxisLabelOffset}
              tickFormatting={props.xAxisFormatter}
              tickStroke={props.xAxisTickStroke}
              tickTextStroke={props.xAxisTickTextStroke}
              xOrient={props.xOrient}
              yOrient={yOrient}
              xTickFormat={props.xTickFormat}
              data={data}
              margins={svgMargins}
              width={innerWidth}
              height={innerHeight}
              horizontalChart={props.horizontal}
              stroke={props.axesColor}
              gridVertical={props.gridVertical}
              gridVerticalStroke={props.gridVerticalStroke}
              gridVerticalStrokeDash={props.gridVerticalStrokeDash}

              gridText={props.gridText}
              translateTickLabel_Y_X={props.translateTickLabel_Y_X}
              translateTickLabel_Y_Y={props.translateTickLabel_Y_Y}
              translateTickLabel_X_X={props.translateTickLabel_X_X}
              translateTickLabel_X_Y={props.translateTickLabel_X_Y}
              xIsDate={props.xIsDate}
            />
            <YGrid
              yAxisClassName={props.yAxisClassName}
              yScale={scales.yScale}
              yAxisTickValues={props.yAxisTickValues}
              yAxisTickCount={props.yAxisTickCount}
              yAxisOffset={props.yAxisOffset}
              yAxisLabel={props.yAxisLabel}
              yAxisLabelOffset={props.yAxisLabelOffset}
              tickFormatting={props.yAxisFormatter}
              tickStroke={props.yAxisTickStroke}
              tickTextStroke={props.yAxisTickTextStroke}
              xOrient={props.xOrient}
              yOrient={yOrient}
              margins={svgMargins}
              width={innerWidth}
              height={innerHeight}
              horizontalChart={props.horizontal}
              stroke={props.axesColor}
              gridHorizontal={props.gridHorizontal}
              gridHorizontalStroke={props.gridHorizontalStroke}
              gridHorizontalStrokeWidth={props.gridHorizontalStrokeWidth}
              gridHorizontalStrokeDash={props.gridHorizontalStrokeDash}

              gridText={props.gridText}
              translateTickLabel_Y_X={props.translateTickLabel_Y_X}
              translateTickLabel_Y_Y={props.translateTickLabel_Y_Y}
              translateTickLabel_X_X={props.translateTickLabel_X_X}
              translateTickLabel_X_Y={props.translateTickLabel_X_Y}
            />


            <DataSeries
              xScale={scales.xScale}
              yScale={scales.yScale}
              xAccessor={props.xAccessor}
              yAccessor={props.yAccessor}
              hoverAnimation={props.hoverAnimation}
              circleRadius={props.circleRadius}
              data={data}
              value={allValues}
              interpolationType={props.interpolationType}
              // colors={props.colors}
              // colorAccessor={props.colorAccessorOrdinal}
              color={props.color}
              colorsDomain={colorsDomain}
              colorsAccessor={colorsAccessor}
              width={innerWidth}
              height={innerHeight}
              onMouseOver={this.onMouseOver}
              voronoiStroke={props.voronoiStroke}
            />
            <XAxis
              xAxisClassName={props.xAxisClassName}
              xAxisTickValues={props.xAxisTickValues}
              xAxisTickCount={props.xAxisTickCount}
              xAxisTickInterval={props.xAxisTickInterval}
              xAxisOffset={props.xAxisOffset}
              xScale={scales.xScale}
              xAxisLabel={props.xAxisLabel}
              xAxisLabelOffset={props.xAxisLabelOffset}
              tickFormatting={props.xAxisFormatter}
              tickStroke={props.xAxisTickStroke}
              tickTextStroke={props.xAxisTickTextStroke}
              xOrient={props.xOrient}
              yOrient={yOrient}
              data={data}
              margins={svgMargins}
              width={innerWidth}
              height={innerHeight}
              horizontalChart={props.horizontal}
              stroke={props.axesColor}
              gridVertical={props.gridVertical}
              gridVerticalStroke={props.gridVerticalStroke}
              gridVerticalStrokeDash={props.gridVerticalStrokeDash}
            />
            <YAxis
              yAxisClassName={props.yAxisClassName}
              yScale={scales.yScale}
              yAxisTickValues={props.yAxisTickValues}
              yAxisTickCount={props.yAxisTickCount}
              yAxisOffset={props.yAxisOffset}
              yAxisLabel={props.yAxisLabel}
              yAxisLabelOffset={props.yAxisLabelOffset}
              tickFormatting={props.yAxisFormatter}
              tickStroke={props.yAxisTickStroke}
              tickTextStroke={props.yAxisTickTextStroke}
              xOrient={props.xOrient}
              yOrient={yOrient}
              margins={svgMargins}
              width={innerWidth}
              height={innerHeight}
              horizontalChart={props.horizontal}
              stroke={props.axesColor}
              gridHorizontal={props.gridHorizontal}
              gridHorizontalStroke={props.gridHorizontalStroke}
              gridHorizontalStrokeWidth={props.gridHorizontalStrokeWidth}
              gridHorizontalStrokeDash={props.gridHorizontalStrokeDash}
            />

          </g>
        </Chart>
        {(props.showTooltip ? <Tooltip {...this.state.tooltip} /> : null)}
      </span>
    );
  },
});
