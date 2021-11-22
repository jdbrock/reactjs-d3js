'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');
const d3plus = require('d3plus-text');


module.exports = createReactClass({
  displayName: 'Cell',
  propTypes: {
    fill: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    label: PropTypes.string,
  },

  render() {
    const props = this.props;

    const textStyle = {
      textAnchor: 'middle',
      fontSize: props.fontSize,
    };

    const t = `translate(${props.x}, ${props.y}  )`;
    const label = [{text:props.label}]
    const id = 'treemap-cel-' + this.props.label.replace(/\s/g, '').replace(/[^\x00-\x7F]/g, "").replace(/\,/g, '');

    /*
    TODO: await on handleClick / _drillData to remove this settimeout
    */
    const delayLabel = (props) => {setTimeout(() => {
      new d3plus.TextBox()
      .data(label)
      .fontResize(true)
      .fontMax(36)
      // .fontMin(12)
      .fontWeight(800)
      .padding((d)=> {return props.width * .05})
      .fontColor('#FFFFFF')
      .width((d)=> {return props.width * .9})
      .height((d)=> {return props.height * 1})
      // .x((d)=> {return props.width * .05})
      .y(() => 0)
      .textAnchor('left')
      .select('#'+id)
      .overflow('visible')
      .verticalAlign('top')
      .render();
    }, 10)};


    return (
        <g transform={t} label={delayLabel(this.props)} id={id} onClick={()=>props.handleClick(this.props.label, 'down')}>
          <rect
            className="rd3-treemap-cell"
            width={props.width}
            height={props.height}
            fill={props.fill}
            onMouseOver={props.handleMouseOver}
            onMouseLeave={props.handleMouseLeave}
            strokeWidth="3"
            stroke='#FFFFFF'
          />
        </g>
    );
  },
});
