'use strict';

const React = require('react');
const createReactClass = require('create-react-class');


module.exports = createReactClass({
    displayName: 'BreadCrumb',
    render() {
        const breadcrumb = [];
        this.props.breadcrumb.reverse().map( (bc, i, {length}) => {
            if (i + 1 === length) {
                breadcrumb.push(<div key={bc.label} onClick={()=>bc.ev(bc.label, 'up')} style={{"paddingLeft":"4px"}}> { bc.label } </div>)
            }else {
                breadcrumb.push(<div key={bc.label} onClick={()=>bc.ev(bc.label, 'up')} style={{"paddingLeft":"4px"}}> { bc.label + " > "}  </div>)
            }
        })
        return (
            <div style={{display: "flex", "flexDirection": "row"}}>
            {breadcrumb}
            </div>
        )
    }
})