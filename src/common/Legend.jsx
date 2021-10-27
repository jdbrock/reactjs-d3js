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

    // debugger;

    const textStyle = props.legendStyle.textStyle;
    const legendItems = [];


    /* TODO - Legado !!!
      Deixar a entrada de dados flat para todos os graficos.
    */
    if (props.series !== undefined){

    props.series.map( (serie, idx) => {
      let itemStyle = Object.assign({},props.legendStyle.bulletStyle)
      itemStyle.color = props.colors(props.colorAccessor(props.colorsDomain, idx));

      legendItems.push(
        <li
          key={idx}
          className={props.itemClassName}
          style={itemStyle}
        >
          <span
            style={textStyle}
          >
            {serie}
          </span>
        </li>
      );

    })

  }else{
    props.data.forEach((series, idx) => {
      let itemStyle = Object.assign({},props.legendStyle.bulletStyle)
      itemStyle.color = props.colors(props.colorAccessor(series, idx));

      legendItems.push(
        <li
          key={idx}
          className={props.itemClassName}
          style={itemStyle}
        >
          <span
            style={textStyle}
          >
            {series.name}
          </span>
        </li>
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
      <ul
        className={props.className}
        style={legendBlockStyle}
      >
        {legendItems.reverse()}
      </ul>
    );
  },
});
