import React, { Component, createContext } from "react";
import PropTypes from "prop-types";
import { Dimensions, StyleSheet, View } from "react-native";

import {
  BREAKPOINT_VALUES,
  SIZE_NAMES,
  HORIZONTAL,
  VERTICAL,
} from "../../shared/constants";

import { determineSizeClass } from "./methods";
import SizeSubscriber from "./Subscriber";
import Scrollable from "./Scrollable";

// Create a context for Grid
export const GridContext = createContext(null);

const styles = StyleSheet.create({
  horizontal: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  vertical: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  stretchable: {
    flex: 1,
  },
});

class Grid extends Component {
  constructor(props) {
    super(props);
    this.dimensionsRef = React.createRef();

    let width = 0;
    let height = 0;

    // Subscriber for components nested inside that take grid size.
    const gridComponentSizeProvider = new SizeSubscriber();
    let childrenReferenceSizeSubscriber;

    if (props.relativeTo === "window") {
      childrenReferenceSizeSubscriber = null;
      ({ width, height } = Dimensions.get("window"));
    } else if (props.relativeTo === "self") {
      childrenReferenceSizeSubscriber = gridComponentSizeProvider;
    } else if (props.relativeTo === "parent") {
      childrenReferenceSizeSubscriber =
        this.context?.referenceSizeProvider || null;

      if (this.context.referenceSizeProvider === null) {
        ({ width, height } = Dimensions.get("window"));
      }
    }

    this.state = {
      gridSizeClass: this.determineSize(
        props.breakpoints,
        props.horizontal,
        width,
        height
      ),
      gridSizeProvider: gridComponentSizeProvider,
      referenceSizeProvider: childrenReferenceSizeSubscriber,
    };
  }

  componentDidMount() {
    this.dimensionsRef.current = Dimensions.addEventListener(
      "change",
      this.windowResizeHandler
    );

    if (this.props.relativeTo === "parent") {
      if (this.context.referenceSizeProvider) {
        this.context.referenceSizeProvider.subscribe(this.updateSizeClass);
      }
    }
  }

  componentWillUnmount() {
    this.dimensionsRef.current.remove();

    if (this.props.relativeTo === "parent") {
      if (this.context?.referenceSizeProvider) {
        this.context.referenceSizeProvider.unsubscribe(this.updateSizeClass);
      }
    }
  }

  onLayoutHandler = ({
    nativeEvent: {
      layout: { width, height },
    },
  }) => {
    if (this.props.relativeTo === "self") {
      this.updateSizeClass(width, height);
    }
    this.updateSizeProvider(width, height);
  };

  determineSize = (breakpoints, horizontal, width, height) =>
    determineSizeClass(SIZE_NAMES, breakpoints, horizontal ? height : width);

  windowResizeHandler = ({ window: { width, height } }) => {
    if (
      this.props.relativeTo === "window" ||
      (this.props.relativeTo === "parent" &&
        this.context.referenceSizeProvider === null)
    ) {
      this.updateSizeClass(width, height);
    }
  };

  updateSizeClass = (width, height) => {
    const size = this.determineSize(
      this.props.breakpoints,
      this.props.horizontal,
      width,
      height
    );
    if (size !== this.state.gridSizeClass) {
      this.setState({ gridSizeClass: size });
    }
  };

  updateSizeProvider = (width, height) => {
    this.state.gridSizeProvider.update(width, height);
  };

  render() {
    const contextValue = {
      gridContentDirection: this.props.horizontal ? HORIZONTAL : VERTICAL,
      gridStretch: this.props.stretchable,
      gridSizeClass: this.state.gridSizeClass, // Added gridSizeClass to context
    };

    const view = (
      <View
        style={[
          this.props.horizontal ? styles.horizontal : styles.vertical,
          this.props.stretchable ? styles.stretchable : null,
          this.props.style,
        ]}
        onLayout={this.onLayoutHandler}
      >
        {this.state.gridSizeClass ? this.props.children : null}
      </View>
    );

    return (
      <GridContext.Provider value={contextValue}>
        {this.props.scrollable ? (
          <Scrollable
            horizontal={this.props.horizontal}
            stretch={this.props.stretchable}
          >
            {view}
          </Scrollable>
        ) : (
          view
        )}
      </GridContext.Provider>
    );
  }
}

Grid.propTypes = {
  breakpoints: PropTypes.arrayOf(PropTypes.number),
  horizontal: PropTypes.bool,
  scrollable: PropTypes.bool,
  stretchable: PropTypes.bool,
  relativeTo: PropTypes.oneOf(["window", "self", "parent"]),
  style: PropTypes.any,
  children: PropTypes.node.isRequired,
};

Grid.defaultProps = {
  breakpoints: BREAKPOINT_VALUES,
  horizontal: false,
  scrollable: false,
  stretchable: false,
  relativeTo: "window",
  style: {},
};

Grid.contextType = GridContext;

export default Grid;
