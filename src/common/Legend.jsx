'use strict';
import ChartContext from '../ChartContext';

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');

const d3 = require('d3');

module.exports = createReactClass({

  displayName: 'Legend',

  propTypes: {
    className: PropTypes.string,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    data: PropTypes.array.isRequired,
    itemClassName: PropTypes.string,
    margins: PropTypes.object,
    text: PropTypes.string,
    // width: PropTypes.number.isRequired,
  },

  getDefaultProps() {
    return {
      className: 'rd3-legend',
      itemClassName: 'rd3-legend-item',
      text: '#000',
      legendStyle: {
                textStyle:{
                  fontSize: '50%',
                  verticalAlign: 'top',
                },
                bulletStyle:{
                  lineHeight: '60%',
                  fontSize: '200%',
                }
              }
    }
  },



  render() {

    /* Context */
    this.contextType = ChartContext;
    const { chartStyle }  = this.contextType._currentValue;


    const props = this.props;
    const textStyle = props.legendStyle.textStyle;
    const legendItems = [];

    const fontSize = props.legendStyle.textStyle.fontSize;
    const fontWeight = props.legendStyle.textStyle.fontWeight;

    /* TODO - Legado !!!
      Deixar a entrada de dados flat para todos os graficos.
    */
   if (props.series !== undefined){
     props.series.map( (serie, idx) => {
       let itemStyle = Object.assign({},props.legendStyle.bulletStyle)
       itemStyle.color = props.color.colors(props.colorsAccessor(props.colorsDomain, idx));

        const rev_idx = props.series.length - idx
        legendItems.push(
          <g key={`series_circle:${idx}`}>
            <circle cx="30" cy={10 + 15 * rev_idx} r="4" fill={itemStyle.color} id="circle"/>
            <text
              className= {`rd3-legend-text ${chartStyle && chartStyle}` }
              x="42"
              y={14 + 15 * rev_idx}
            >
              {serie}
            </text>
          </g>
        );
      })
    }else{
      if (! props.color){ return []}
      props.data.forEach((series, idx) => {
        let itemStyle = Object.assign({},props.legendStyle.bulletStyle)
        itemStyle.color = props.color.colors(props.colorsAccessor(series, idx));

        const rev_idx = props.series.length - idx
        legendItems.push(
          <g key={`circle:${idx}`}>
            <circle cx="30" cy={10 + 15 * rev_idx} r="4" fill={itemStyle.color} id="circle"/>
            <text
              className= {`rd3-legend-text ${chartStyle && chartStyle}` }
              x="50"
              y={14 + 15 * rev_idx}
              // style={{'font-size':'0.8em'}}
            >
              {series.name}
            </text>
          </g>
        );
      });
    }
    return (
      legendItems
    );
  },
});


