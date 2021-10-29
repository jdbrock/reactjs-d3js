'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');

const BarContainer = require('./BarContainer');

const {
  CartesianChartPropsMixin,
} = require('../mixins');


module.exports = createReactClass({

  displayName: 'DataSeries',
  mixins: [CartesianChartPropsMixin],
  propTypes: {
    _data: PropTypes.array,
    series: PropTypes.array,
    grouped: PropTypes.bool,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    height: PropTypes.number,
    width: PropTypes.number,
    valuesAccessor: PropTypes.func,
    xAccessorBar: PropTypes.func,
    yAccessorBar: PropTypes.func,
    y0Accessor: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseLeave: PropTypes.func,
    hoverAnimation: PropTypes.bool, // TODO: prop types?
    xScale: PropTypes.any,
    yScale: PropTypes.any,
  },

  mixins: [CartesianChartPropsMixin],

  _renderBarSeries() {
    const { _data, valuesAccessor } = this.props;
    return _data.map((layer, seriesIdx) => (
      valuesAccessor(layer).map(segment => this._renderBarContainer(segment, seriesIdx))
    ));
  },

  _renderBarContainer(segment, seriesIdx) {
    const { color, colorsAccessor, colorsDomain, grouped, series, xScale, yScale } = this.props;
    const barHeight = Math.abs(yScale(this.props.y0Accessor(segment)) - yScale(this.props.yAccessorBar(segment)));
    const yWidth = yScale(this.props.y0Accessor(segment) + this.props.yAccessorBar(segment));
    const y = grouped ? yScale(this.props.yAccessorBar(segment)) : yWidth;
    const key = this.props.series[seriesIdx] + segment.data.x +segment[1];

    return (
      <BarContainer
        key={key}
        height={barHeight}
        width={xScale.bandwidth() }
        x={ xScale(this.props.xAccessorBar(segment)) }
        y={(this.props.yAccessorBar(segment) >= 0) ? y : y - barHeight}
        fill={this.props.color.colors(colorsAccessor(colorsDomain, seriesIdx))}
        hoverAnimation={this.props.hoverAnimation}
        onMouseOver={this.props.onMouseOver}
        onMouseLeave={this.props.onMouseLeave}
        datapoint={{
          xValue: this.props.xAccessorBar(segment),
          yValue: this.props.yAccessorBar(segment),
          seriesName: this.props.series[seriesIdx],
        }}
      />
    );
  },

  render() {
    return (
      <g>{this._renderBarSeries()}</g>
    );
  },
});
