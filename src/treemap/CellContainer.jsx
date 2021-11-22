'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');

const shade = require('../utils').shade;
const Cell = require('./Cell');


module.exports = createReactClass({

  displayName: 'CellContainer',

  propTypes: {
    fill: PropTypes.string,
  },

  getInitialState() {
    return {
      // fill is named as fill instead of initialFill to avoid
      // confusion when passing down props from top parent
      fill: this.props.fill,
      fillCtl: this.props.fill,
    };
  },

  statics: { getDerivedStateFromProps(props, current_state) {
    if (current_state.fillCtl !== props.fill) {
      return {
        fillCtl:props.fill,
        fill: props.fill,
      }
    }
    return null
  }},

  _animateCell() {
    this.setState({
      fill: shade(this.props.fill, 0.2),
    });
  },

  _restoreCell() {
    this.setState({
      fill: this.props.fill,
    });
  },


  render() {

    const props = this.props;
    // console.log(props.label)

    return (
      <Cell
        {...props}
        fill={this.state.fill}
        handleMouseOver={props.hoverAnimation ? this._animateCell : null}
        handleMouseLeave={props.hoverAnimation ? this._restoreCell : null}
        handleClick={props.drillData}
      />
    );
  },
});
