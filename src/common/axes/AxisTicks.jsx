'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const createReactClass = require('create-react-class');


module.exports = createReactClass({

  displayName: 'AxisTick',

  propTypes: {
    scale: PropTypes.func.isRequired,
    orient: PropTypes.oneOf(['top', 'bottom', 'left', 'right']).isRequired,
    orient2nd: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    horizontal: PropTypes.bool,
    tickArguments: PropTypes.array,
    tickValues: PropTypes.array,
    innerTickSize: PropTypes.number,
    outerTickSize: PropTypes.number,
    tickPadding: PropTypes.number,
    tickFormat: PropTypes.func,
    tickStroke: PropTypes.string,
    tickTextStroke: PropTypes.string,
    gridHorizontal: PropTypes.bool,
    gridVertical: PropTypes.bool,
    gridHorizontalStroke: PropTypes.string,
    gridVerticalStroke: PropTypes.string,
    gridHorizontalStrokeWidth: PropTypes.number,
    gridVerticalStrokeWidth: PropTypes.number,
    gridHorizontalStrokeDash: PropTypes.string,
    gridVerticalStrokeDash: PropTypes.string,
    gridText:PropTypes.object,
  },
  getDefaultProps() {
    return {
      innerTickSize: 6,
      outerTickSize: 6,
      tickStroke: '#000',
      tickPadding: 3,
      tickArguments: [10],
      tickValues: null,
      gridHorizontal: false,
      gridVertical: false,
      gridHorizontalStroke: '#D8D7D7',
      gridVerticalStroke: '#D8D7D7',
      gridHorizontalStrokeWidth: 0.4,
      gridVerticalStrokeWidth: 0.4,
      gridHorizontalStrokeDash: '5, 5',
      gridVerticalStrokeDash: '5, 5',
      gridText:{rotate:{
                    top:null,
                    right:null,
                    bottom:null,
                    left:null
                },
                translate:{
                  text:{x:0, y:0},
                  line:{x:0, y:0}
                },
                font:{
                  size:'1.0em',
                  weight:'.01'
                }
              }
    };
  },

  render() {
    const props = this.props;
    let tr;
    let trText;
    let gridTextRotate;
    let gridTextFontSize;
    let gridTextFontWeight;
    let textAnchor;
    let textTransform;
    let tickFormat;
    let y1;
    let y2;
    let dy;
    let x1;
    let x2;

    let gridStrokeWidth;
    let gridStroke;
    let gridStrokeDashArray;
    let x2grid;
    let y2grid;
    let gridOn = false;

    const sign = props.orient === 'top' || props.orient === 'right' ? -1 : 1;
    const tickSpacing = Math.max(props.innerTickSize, 0) + props.tickPadding;

    const scale = props.scale;

    let ticks;
    if (props.tickValues) {
      ticks = props.tickValues;
    } else if (scale.ticks) {
      ticks = scale.ticks.apply(scale, props.tickArguments);
    } else {
      ticks = scale.domain();
    }

    if (props.tickFormatting) {
      tickFormat = props.tickFormatting;
    } else if (scale.tickFormat) {
      tickFormat = scale.tickFormat.apply(scale, props.tickArguments);
    } else {
      tickFormat = (d) => d;
    }

    const adjustedScale = scale.bandwidth ? d => scale(d) + scale.bandwidth() / 2 : scale;

    // Still working on this
    // Ticks and lines are not fully aligned
    // in some orientations
    const adjustedScaleTransTxtX = (tick) => adjustedScale(tick) + props.gridText.translate.text.x;

    switch (props.orient) {
      case 'top':
        tr = (tick) => `translate(${adjustedScale(tick)},0)`;
        trText = (tick) => `translate(${adjustedScale(tick)},0)`;
        textAnchor = 'middle';
        y2 = props.innerTickSize * sign;
        y1 = tickSpacing * sign;
        dy = sign < 0 ? '0em' : '.71em';
        x2grid = 0;
        y2grid = -props.height;
        gridTextRotate = props.gridText.rotate.top;
        break;
      case 'bottom':
        tr = (tick) => `translate(${adjustedScale(tick)},0)`;
        trText = (tick) => `translate(${adjustedScaleTransTxtX(tick)},${props.gridText.translate.text.y})`;
        textAnchor = 'middle';
        y2 = props.innerTickSize * sign;
        y1 = tickSpacing * sign;
        dy = sign < 0 ? '0em' : '.71em';
        x2grid = 0;
        y2grid = -props.height;
        gridTextRotate = props.gridText.rotate.bottom;
        break;
      case 'left':
        tr = (tick) => `translate(0,${adjustedScale(tick)})`;
        trText = (tick) => `translate(0,${adjustedScale(tick)})`;
        textAnchor = 'end';
        x2 = props.innerTickSize * -sign;
        x1 = tickSpacing * -sign;
        dy = '.32em';
        x2grid = props.width;
        y2grid = 0;
        gridTextRotate = props.gridText.rotate.left;
        break;
      case 'right':
        tr = (tick) => `translate(0,${adjustedScale(tick)})`;
        trText = (tick) => `translate(0,${adjustedScale(tick)})`;
        textAnchor = 'start';
        x2 = props.innerTickSize * -sign;
        x1 = tickSpacing * -sign;
        dy = '.32em';
        x2grid = -props.width;
        y2grid = 0;
        gridTextRotate = props.gridText.rotate.right;
        break;
      default:
        break;
    }

    if (props.horizontalChart) {
      textTransform = 'rotate(-90)';
      [y1, x1] = [x1, -y1 || 0];

      switch (props.orient) {
        case 'top':
          textAnchor = 'start';
          dy = '.32em';
          break;
        case 'bottom':
          textAnchor = 'end';
          dy = '.32em';
          break;
        case 'left':
          textAnchor = 'middle';
          dy = sign < 0 ? '.71em' : '0em';
          break;
        case 'right':
          textAnchor = 'middle';
          dy = sign < 0 ? '.71em' : '0em';
          break;
        default:
          break;
      }
    }

    if (props.gridHorizontal) {
      gridOn = true;
      gridStrokeWidth = props.gridHorizontalStrokeWidth;
      gridStroke = props.gridHorizontalStroke;
      gridStrokeDashArray = props.gridHorizontalStrokeDash;
    } else if (props.gridVertical) {
      gridOn = true;
      gridStrokeWidth = props.gridVerticalStrokeWidth;
      gridStroke = props.gridVerticalStroke;
      gridStrokeDashArray = props.gridVerticalStrokeDash;
    }

    // return grid line if grid is enabled and grid line is not on at same position as other axis.
    const gridLine = (pos) => {
      if (gridOn
        && !(props.orient2nd === 'left' && pos === 0)
        && !(props.orient2nd === 'right' && pos === props.width)
        && !((props.orient === 'left' || props.orient === 'right') && pos === props.height)
      ) {
        return (
          <line style={{
            strokeWidth: gridStrokeWidth,
            shapeRendering: 'crispEdges',
            stroke: gridStroke,
            strokeDasharray: gridStrokeDashArray,
          }} x2={x2grid} y2={y2grid}
          />
        );
      }
      return null;
    };

    const optionalTextProps = textTransform ? {
      transform: textTransform,
    } : {};

    gridTextFontSize = props.gridText.font.size;
    gridTextFontWeight = props.gridText.font.weight;

    return (
    <g>
      {ticks.map((tick, idx) => (
          <g key={idx} className="tick" transform={tr(tick)} >
            {gridLine(adjustedScale(tick))}
            <line
              style={{
                shapeRendering: 'crispEdges',
                opacity: '1',
                stroke: props.tickStroke,
                strokeWidth: '0.5',
              }}
              x2={x2}
              y2={y2}
            />
          </g>
        ))
      }
      {ticks.map((tick, idx) => (
        <g className="tickText" transform={trText(tick)} >
            <text
              strokeWidth={gridTextFontWeight}
              dy={dy} x={x1} y={y1}
              style={{ stroke: props.tickTextStroke, fill: props.tickTextStroke, 'font-size': gridTextFontSize}}
              textAnchor={textAnchor}
              {...optionalTextProps}
              transform={gridTextRotate}
            >
              {`${tickFormat(tick)}`.split('\n').map((tickLabel, index) => (
                  <tspan x={x1 || 0} dy={dy} key={index}>
                    {tickLabel}
                  </tspan>
              ))}
            </text>
            </g>
            ))}
    </g>
    );
  },
});
