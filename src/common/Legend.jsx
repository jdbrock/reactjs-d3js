'use strict';

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
    width: PropTypes.number.isRequired,
  },

  getDefaultProps() {
    return {
      className: 'rd3-legend',
      color: d3.scaleOrdinal(d3.schemeCategory10),
      colorAccessor: (d, idx) => idx,
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
    const props = this.props;
    const textStyle = props.legendStyle.textStyle;
    const legendItems = [];

    const fontSize = props.legendStyle.textStyle.fontSize;
    const fontWeight = props.legendStyle.textStyle.fontWeight;

    /* TODO - Legado !!!
      Deixar a entrada de dados flat para todos os graficos.
    */



   if (props.series !== undefined){
      const revColorsDomain = props.colorsDomain.reverse()
      props.series.reverse().map( (serie, idx) => {
        let itemStyle = Object.assign({},props.legendStyle.bulletStyle)
        itemStyle.color = props.colors(props.colorAccessor(revColorsDomain, idx));

        // console.log(idx , '-' , itemStyle.color)

        legendItems.push(
          <g>
            <circle cx="30" cy={10 + 12 * idx} r="4" fill={itemStyle.color} id="circle"/>
            <text
              x="42"
              y={14 + 12 * idx}
              style={{'font-size':fontSize}}
              stroke-width={fontWeight}
            >
              {serie} -  {itemStyle.color}
            </text>
          </g>
        );
      })
    }else{
      props.data.forEach((series, idx) => {
        let itemStyle = Object.assign({},props.legendStyle.bulletStyle)
        itemStyle.color = props.colors(props.colorAccessor(series, idx));

        legendItems.push(
          <g>
            <circle cx="30" cy={10 + 12 * idx} r="4" fill={itemStyle.color} id="circle"/>
            <text
              x="50"
              y={15 + 12 * idx}
              style={{'font-size':'0.8em'}}
            >
              {series.name}
            </text>
          </g>
        );
      });
    }


    const topMargin = props.margins.top;

    const legendBlockStyle = {
      wordWrap: 'break-word',
      width: props.width,
      paddingLeft: 0,
      marginBottom: 0,
      marginTop: topMargin,
      listStylePosition: 'inside',
    };

    return (
        legendItems
    );
  },
});


