import React, { useContext } from "react";
import PropTypes from "prop-types";
import { StyleSheet, View } from "react-native";

import { SIZE_NAMES, GRID_UNITS, VERTICAL } from "../../shared/constants";
import { roundForPercentage } from "../../shared/methods";
import { ContainerSizeProp, DirectionProp } from "../../shared/props";
import { determineSize, isHidden } from "./methods";
import BlockProps from "./props";
import { GridContext } from "../grid";

// We need to ensure that stretch sizing wouldn't collapse to zero width when
// there are enough elements to already fill the line.
const ONE_UNIT_WIDTH = `${roundForPercentage(100 / GRID_UNITS)}%`;

const styles = StyleSheet.create({
  stretchSize: {
    flex: 1,
    flexBasis: ONE_UNIT_WIDTH,
  },
});

/**
 * Element representing a single cell in a grid structure.
 *
 * @type {React.FC<{size?: string | number, hidden?: boolean, visible?: boolean, style?: any, children?: any}>}
 */
const Block = ({ children, ...props }) => {
  const { gridContentDirection, gridSizeClass } = useContext(GridContext);

  // Ensure `isHidden` check happens after context is retrieved
  if (isHidden(SIZE_NAMES, gridSizeClass, props)) {
    return null;
  }

  // Determine the style property based on grid direction
  const styleProperty = gridContentDirection === VERTICAL ? "width" : "height";

  // Determine size
  const size = determineSize(SIZE_NAMES, gridSizeClass, props);
  const sizeStyle =
    size === "stretch" ? styles.stretchSize : { [styleProperty]: size };

  // Define flex direction based on grid direction
  const directionStyle = {
    flexDirection: gridContentDirection === VERTICAL ? "column" : "row",
  };

  return (
    <View style={[directionStyle, sizeStyle, props.style]}>{children}</View>
  );
};

Block.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  ...BlockProps,
};

Block.defaultProps = {
  children: null,
};

export default Block;
