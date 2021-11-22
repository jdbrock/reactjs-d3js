'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');

const d3 = require('d3');
const CellContainer = require('./CellContainer');

/* color accessors */
const { CartesianChartPropsMixin } = require('../mixins');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    data: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number,
  },

  getDefaultProps() {
    return {
      data: [],
    };
  },

  mixins: [CartesianChartPropsMixin],

  render() {
    const props = this.props;

    const treemap = d3.treemap()
                    .size([props.width, props.height]);

    // stratify the data: reformatting for d3.js
    var root = d3.stratify()
      .id(function(d) { return d.label; })
      .parentId(function(d) { return d.parent; })
      (props.data);

    root.sum(function(d) { return +d.value })

    const tree = treemap(root);

    let series = []
    root.children.map( d => {
      series.push(d.id)
    })

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

    const cells = tree.children.map((node, idx) => (
        <CellContainer
          key={idx}
          x={node.x0}
          y={node.y0}
          width={node.x1 - node.x0}
          height={node.y1 - node.y0}
          fill={this.props.color.colors(colorsAccessor(colorsDomain, idx))}

          label={node.data.label}
          fontSize={props.fontSize}
          textColor={props.textColor}
          hoverAnimation={props.hoverAnimation}
          drillData={props.drillData}
        />
    ), this);

    return (
      <g transform={props.transform} className="treemap">
        {cells}
      </g>
    );
  },
});
