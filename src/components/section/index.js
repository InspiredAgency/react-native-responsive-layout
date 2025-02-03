import React, { useContext } from "react";
import PropTypes from "prop-types";
import { StyleSheet, View } from "react-native";

import { DirectionProp } from "../../shared/props";
import { warn } from "../../utils";
import { GridContext } from "../grid";

const styles = StyleSheet.create({
  horizontal: {
    alignItems: "flex-start", // Required to support RN42+ due to a bug with wrap
    flexWrap: "wrap",
    flexDirection: "column",
  },
  vertical: {
    alignItems: "flex-start", // Required to support RN42+ due to a bug with wrap
    flexWrap: "wrap",
    flexDirection: "row",
  },
  stretch: {
    flex: 1,
    alignSelf: "stretch",
  },
});

/**
 * Component used to contain a group of Blocks.
 *
 * @type {React.FC<{stretch?: boolean, style?: any, children: any}>}
 */
const Section = ({ children, style, stretch }) => {
  const { gridContentDirection, gridStretch } = useContext(GridContext);

  if (process.env.NODE_ENV === "development") {
    warn(
      !gridStretch && !!stretch,
      "Using `stretch` on `Section` without using `stretchable` on `Grid` has no stretching effect because grid itself won't be stretched and section will just collapse so it won't be visible.\nPlease make `Grid` stretchable as well."
    );
  }

  return (
    <View
      style={[
        gridContentDirection === "vertical"
          ? styles.vertical
          : styles.horizontal,
        stretch ? styles.stretch : null,
        style,
      ]}
    >
      {children}
    </View>
  );
};

Section.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  stretch: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

Section.defaultProps = {
  style: {},
  stretch: false,
};

export default Section;
