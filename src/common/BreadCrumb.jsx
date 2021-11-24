'use strict';

const React = require('react');
const createReactClass = require('create-react-class');


module.exports = createReactClass({
    displayName: 'BreadCrumb',
    render() {
        const breadcrumb = [];
        this.props.breadcrumb.reverse().map( (bc, i, {length}) => {
            let label = ''
            bc.label === 'Origin' ? label = this.props.title : label=bc.label

            if (i + 1 === length) {
                breadcrumb.push(<div key={bc.label} onClick={()=>bc.ev(bc.label, 'up')} style={{"paddingLeft":"4px"}}> { label } </div>)
            }else {
                breadcrumb.push(<div key={bc.label} onClick={()=>bc.ev(bc.label, 'up')} style={{"paddingLeft":"4px"}}> { label + " > "}  </div>)
            }
        })
        return (
            <div style={{display: "flex", "flexDirection": "row", "justify-content":"center"}}>
            {breadcrumb}
            </div>
        )
    }
})