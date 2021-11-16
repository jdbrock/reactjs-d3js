'use strict';
const utils = require('../utils');


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
      tooltipFormat: (d, chart) => {
        return chart === 'barchart'
                  ? String( d.seriesName) + ':\n' + String( utils.nFormatter(d.height, 2))
                  : String( d.seriesName) + ':\n' + String( utils.nFormatter(d.yValue, 2))
      },
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
        child: this.props.tooltipFormat.call(this, dataPoint, this.props.chart),
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
