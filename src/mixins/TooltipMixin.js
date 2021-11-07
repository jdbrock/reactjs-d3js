'use strict';


const PropTypes = require('prop-types');

module.exports = {

  propTypes: {
    showTooltip: PropTypes.bool,
    tooltipFormat: PropTypes.func,
  },

  getDefaultProps() {
    return {
      showTooltip: true,
      /* Sum */
      // tooltipFormat: (d) => String( d.seriesName) + ':\n' + String( d.yValue),

      /* Height */
      tooltipFormat: (d) => String( d.seriesName) + ':\n' + String( d.height) ,
    };
  },

  getInitialState() {
    return {
      tooltip: {
        x: 0,
        y: 0,
        child: '',
        show: false,
      },
      changeState: false,
    };
  },

  UNSAFE_componentWillReceiveProps() {
    this.setState({
      changeState: false,
    });
  },

  onMouseOver(x, y, dataPoint) {
    if (!this.props.showTooltip) {
      return;
    }
    this.setState({
      tooltip: {
        x,
        y,
        child: this.props.tooltipFormat.call(this, dataPoint),
        show: true,
      },
      changeState: true,
    });
  },

  onMouseLeave() {
    if (!this.props.showTooltip) {
      return;
    }
    this.setState({
      tooltip: {
        x: 0,
        y: 0,
        child: '',
        show: false,
      },
      changeState: true,
    });
  },
};
