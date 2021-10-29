'use strict';

import * as ReactDOM from 'react-dom'

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');
const Bar = require('./Bar');
const shade = require('../utils').shade;


module.exports = createReactClass({

  propTypes: {
    fill: PropTypes.string,
    onMouseOver: PropTypes.func,
    onMouseLeave: PropTypes.func,
  },


  getInitialState() {
    return {
      // fill is named as fill instead of initialFill to avoid
      // confusion when passing down props from top parent
      fill: this.props.fill,
    };
  },

  _animateBar() {
    const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
    this.props.onMouseOver.call(this, rect.right, rect.top, this.props.datapoint);
    this.setState({
      fill: shade(this.props.fill, 0.2),
    });
  },

  _restoreBar() {
    this.props.onMouseLeave.call(this);
    this.setState({
      fill: this.props.fill,
    });
  },

  render() {
    const props = this.props;

    // animation controller
    let handleMouseOver;
    let handleMouseLeave;
    if (props.hoverAnimation) {
      handleMouseOver = this._animateArea;
      handleMouseLeave = this._restoreArea;
    } else {
      handleMouseOver = handleMouseLeave = null;
    }

    return (
      <Bar
        {...props}
        fill={this.props.fill}
        // onMouseOver={handleMouseOver}
        // onMouseLeave={handleMouseLeave}


        onMouseOver={props.hoverAnimation ? this._animateBar : null}
        onMouseLeave={props.hoverAnimation ? this._restoreBar : null}
      />
    );
  },
});
