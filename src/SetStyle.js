import ChartContext from './ChartContext';
const React = require('react');

/*
    This components sets context variables.
    It will be outside of this application after migrate to React function components.
*/


module.exports = createReactClass({
    displayName: 'SetStyle',

    render() {

        this.contextType = ChartContext;
        const context = this.contextType._currentValue
        context.setChartStyle(this.props.style)

        return (
            null
        )
    }
})
