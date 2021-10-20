'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');

const d3 = require('d3');
const CellContainer = require('./CellContainer');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    data: PropTypes.array,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
  },

  getDefaultProps() {
    return {
      data: [],
      colors: d3.scaleOrdinal(d3.schemePastel2),
      colorAccessor: (d, idx) => idx,
    };
  },

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

    const cells = tree.children.map((node, idx) => (
        <CellContainer
          key={idx}
          x={node.x0}
          y={node.y0}
          width={node.x1 - node.x0}
          height={node.y1 - node.y0}
          fill={props.colors(props.colorAccessor(node, idx))}
          label={node.data.label}
          fontSize={props.fontSize}
          textColor={props.textColor}
          hoverAnimation={props.hoverAnimation}
        />
    ), this);

    return (
      <g transform={props.transform} className="treemap">
        {cells}
      </g>
    );
  },
});
