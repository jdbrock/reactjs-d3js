'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');


module.exports = createReactClass({

  propTypes: {
    fill: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number,
    className: PropTypes.string,
  },

  getDefaultProps() {
    return {
      offset: 0,
      className: 'rd3-barchart-bar',
    };
  },

  render() {
    return (
      <rect
        className="rd3-barchart-bar"
        {...this.props}
        fill={this.props.fill}
      />
    );
  },
});
