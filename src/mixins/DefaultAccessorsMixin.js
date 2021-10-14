'use strict';

const PropTypes = require('prop-types');

module.exports = {
  propTypes: {
    xAccessor: PropTypes.func,
    yAccessor: PropTypes.func,
  },

  getDefaultProps() {
    return {
      xAccessorBar: (d) => d.data.x,
      yAccessorBar: (d) => d[1],

      xAccessor: (d) => d.x,
      yAccessor: (d) => d.y,
    };
  },
};
