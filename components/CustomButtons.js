import * as React from "react";
import { View } from "react-native";
import { Col, Row, Grid } from "react-native-easy-grid";
import { Button, Text } from "native-base";

export default function CustomButtons(props) {
  const Buttons = [];
  props.buttons.forEach((label, index) => {
    let custom = false;
    if (label === "custom") custom = true;
    if (props.selectedIndex === index) {
      Buttons.push(
        <Col style={custom ? { width: 100 } : null} key={index}>
          <Button block onPress={() => props.onPress(index)}>
            <Text>{label}</Text>
          </Button>
        </Col>
      );
    } else {
      Buttons.push(
        <Col style={custom ? { width: 100 } : null} key={index}>
          <Button bordered block onPress={() => props.onPress(index)}>
            <Text>{label}</Text>
          </Button>
        </Col>
      );
    }
  });

  return (
    <View style={props.style}>
      <Grid>{Buttons}</Grid>
    </View>
  );
}
