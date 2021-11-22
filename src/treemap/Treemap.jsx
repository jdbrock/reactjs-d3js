'use strict';

const d3 = require('d3');
const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');

const Chart = require('../common').Chart;
const DataSeries = require('./DataSeries');
const BreadCrumb = require('../common/BreadCrumb');

module.exports = createReactClass({

  displayName: 'Treemap',

  propTypes: {
    data: PropTypes.array,
    margins: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    title: PropTypes.string,
    textColor: PropTypes.string,
    fontSize: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    hoverAnimation: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      hoverAnimation: true,
      data: [],
      width: 400,
      heigth: 200,
      title: '',
      textColor: '#f7f7f7',
      fontSize: '0.85em',
      color: {
        accessor: 'Ordinal',
        colors: d3.scaleOrdinal(d3.schemeCategory10),
      },
    };
  },

  getInitialState() {
    return {
      data: this.props.data,
      dataInitial: this.props.data,
      bc:[],
    };
  },



  _recBreadCrumb(label, bc){
    const elem = this.state.dataInitial.filter(f=>f.label===label)
    if (elem.length > 0 &&
      this.state.dataInitial.filter(f=>f.parent===label).length > 0 ){
        bc.push({ev:this._drillData, label:label});
        this._recBreadCrumb(elem[0].parent, bc)
      }
    return bc.length > 0 ? bc : this.state.bc
  },


  _drillData(label, upDown) {
    /* state not initialized at the first time due to api lag */
    if (this.state.dataInitial && this.state.dataInitial.length < 1){
      this.setState({
        data: this.props.data,
        dataInitial: this.props.data
      }, () => {
        this._drillData(label, upDown)
      })
    }else{
      let bc = [];
      const breadcrumb = this._recBreadCrumb(label, bc)
      let fData = this.state;

      if (upDown === 'down'){
        fData = this.props.data
        .filter( d => d.parent===label )
        .map(  d => {
          return Object.assign({}, d, {
            parent:'Origin'
          });
        })
      }
      else if (upDown === 'up'){
        fData = this.state.dataInitial
        .filter( d => d.parent===label )
        .map(  d => {
          return Object.assign({}, d, {
            parent:'Origin'
          });
        })
      }
      if (fData.length === 0) {return }

      /* Add filtered origin */
      fData.push({
          "label": "Origin",
          "value": "",
          "parent": "",
      })

      this.setState({
        data: fData,
        bc: breadcrumb
        // dataLabel:label,
      });
    }
  },


  render() {

    // debugger;
    const props = this.props;
    if (this.props.data && this.props.data.length < 1) {
      return null;
    }

    return (
      <div>
      <Chart
        title={props.title}
        width={props.width}
        height={props.height}
        svgChart={props.svgChart}
        background={props.background}
        svgTitle={props.svgTitle}
        color={this.props.color}
      >
        <g className="rd3-treemap">
          <DataSeries
            data={this.state.data.length > 0 ? this.state.data : this.props.data}
            width={props.width}
            height={props.height}
            color={props.color}
            colorAccessor={props.colorAccessor}
            textColor={props.textColor}
            fontSize={props.fontSize}
            hoverAnimation={props.hoverAnimation}
            drillData={this._drillData}
          />
        </g>
      </Chart>
      <BreadCrumb breadcrumb={this.state.bc}/>
      </div>
    );
  },
});
