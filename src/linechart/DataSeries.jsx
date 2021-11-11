'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');

const d3 = require('d3');
const VoronoiCircleContainer = require('./VoronoiCircleContainer');
const Line = require('./Line');
const voronoi = require('d3-voronoi')


module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    color: PropTypes.func,
    colorAccessor: PropTypes.func,
    data: PropTypes.array,
    interpolationType: PropTypes.string,
    xAccessor: PropTypes.func,
    yAccessor: PropTypes.func,
    hoverAnimation: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      data: [],
      xAccessor: (d) => d.x,
      yAccessor: (d) => d.y,
      interpolationType: 'linear',
      hoverAnimation: false,
    };
  },

  _isDate(d, accessor) {
    return Object.prototype.toString.call(accessor(d)) === '[object Date]';
  },

  render() {
    const props = this.props;
    const xScale = props.xScale;
    const yScale = props.yScale;
    const xAccessor = props.xAccessor;
    const yAccessor = props.yAccessor;

    const interpolatePath = d3.line()
        .x((d) => props.xScale(xAccessor(d)))
        .y((d) => props.yScale(yAccessor(d)))
        .curve(d3.curveMonotoneX);


    if (this._isDate(props.data[0].values[0], xAccessor)) {
      interpolatePath.x(d => props.xScale(props.xAccessor(d).getTime()));
    } else {
      interpolatePath.x(d => props.xScale(props.xAccessor(d)));
    }

    const lines = props.data.map((series, idx) =>
        // debugger;
      (
        <Line
          path={interpolatePath(series.values)}
          stroke={props.color.colors(props.colorsAccessor(props.colorsDomain, idx))}

          // stroke={props.color.colors(props.colorsAccessor(series, idx))}
          strokeWidth={series.strokeWidth}
          strokeDashArray={series.strokeDashArray}
          seriesName={series.name}
          key={idx}
        />
      )
    );
    const voronoi = d3.voronoi()
      .x(d => xScale(d.coord.x))
      .y(d => yScale(d.coord.y))
      .extent([[0, 0], [props.width, props.height]]);

    let cx;
    let cy;
    let circleFill;

    const regions = voronoi(props.value).polygons().map( (polygon, idx) => {
      const point = polygon.data;
      delete polygon.data;
      const vnode = polygon;

      cx = props.xScale(point.coord.x);
      cy = props.yScale(point.coord.y);

      circleFill=props.color.colors(props.colorsAccessor(props.colorsDomain, idx));

      return (
        <VoronoiCircleContainer
          key={idx}
          circleFill={circleFill}
          vnode={vnode}
          hoverAnimation={props.hoverAnimation}
          cx={cx} cy={cy}
          circleRadius={props.circleRadius}
          onMouseOver={props.onMouseOver}
          dataPoint={{
            xValue: point.coord.x,
            yValue: point.coord.y,
            seriesName: point.series.name,
          }}
        />
      );
    });

    return (
      <g>
        <g>{regions}</g>
        <g>{lines}</g>
      </g>
    );
  },
});
