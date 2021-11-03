'use strict';
import ChartContext from '../../ChartContext';

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');

const Legend = require('../Legend');
const d3 = require('d3');

module.exports = createReactClass({

  displayName: 'LegendChart',

  propTypes: {
    children: PropTypes.node,
    createClass: PropTypes.string,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    data: PropTypes.array,
    height: PropTypes.node,
    legend: PropTypes.bool,
    legendPosition: PropTypes.string,
    margins: PropTypes.object,
    sideOffset: PropTypes.number,
    svgClassName: PropTypes.string,
    title: PropTypes.node,
    titleClassName: PropTypes.string,
    viewBox: PropTypes.string,
    width: PropTypes.node,
  },

  getDefaultProps() {
    return {
      className: 'rd3-legend-chart',
      colors: d3.scaleOrdinal(d3.schemeCategory10),
      colorAccessor: (d, idx) => idx,
      data: [],
      legend: false,
      legendPosition: 'right',
      sideOffset: 90,
      svgClassName: 'rd3-chart',
      titleClassName: 'rd3-chart-title',
      title: '',
      svgTitle:{
                title:'Title',
                x:50,
                y:50,
                fontSize:'1.5em',
              },
      svgLegend:{
                position:{
                    x:'85%',
                    y:'20%'
                }},
      svgChart:{
                  width:'95%'
                }
    };
  },

  _renderLegend() {
    const props = this.props;

    if (props.legend) {
      return (
        <Legend
          // colors={props.colors}
          // colorAccessor={props.colorAccessor}
          // data={props.data}
          // colorsDomain={props.colorsDomain}
          // legendPosition={props.legendPosition}
          // margins={props.margins}
          // width={props.sideOffset}
          // series={props.series}
          // legendStyle={props.legendStyle}
          // svgLegend={props.svgLegend}
          {...this.props}

        />
      );
    }

    return null;
  },

  _renderTitle() {
    const props = this.props;

    const fontSize = props.svgTitle.fontSize;

    /* Context */
    this.contextType = ChartContext;
    const { chartStyle }  = this.contextType._currentValue;

    if (props.title !== '') {
      return (
          <text
            className= {`rd3-svg-title ${chartStyle && chartStyle}` }
            textAnchor="middle"
            y={props.svgTitle.y}
            x={props.svgTitle.x}
            // style={{'font-size':fontSize}}
          >
          {props.title}
          </text>
      );
    }
    return null;
  },

  _renderChart() {
    const props = this.props;
    return (

      <svg
        className={props.svgClassName}
        height="100%"
        viewBox={props.viewBox}
        width="100%"
      >
        <svg viewBox={props.viewBox} width={props.svgChart.width}>
          {this._renderTitle()}
          {props.children}
        </svg>
        <svg x={props.svgLegend.position.x} y={props.svgLegend.position.y}>
          {this._renderLegend()}
        </svg>
      </svg>
    );
  },

  render() {
    const props = this.props;

    return (
      <div
        className={props.className}
        style={{ display: 'grid', width: props.width, height: props.height, background:props.background }}
      >
          <div style={{ display:'flex',  width:props.width, height:props.height  }}>

            {this._renderChart()}
          </div>


      </div>
    );
  },
});
