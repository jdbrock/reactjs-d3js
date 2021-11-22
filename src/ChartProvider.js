import ChartContext from './ChartContext';

const React = require('react');

module.exports = createReactClass({
    displayName: 'ChartProvider',


    getInitialState() {
        return {
          chartStyle:''
        };
      },


    render() {
        return (
            <ChartContext.Provider
                value={{
                    chartStyle:this.state.chartStyle,
                    setChartStyle: style => {
                        this.setState({
                            chartStyle:style
                        });
                    }
                }}
            >
                {this.props.children}

            </ChartContext.Provider>
        )
    }
})