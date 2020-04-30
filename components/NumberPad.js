import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Input } from "react-native-elements";
import { Col, Row, Grid } from "react-native-easy-grid";
import { Button, Container, StyleProvider, Text, H3 } from "native-base";
import Colors from "../constants/Colors";
// Native base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

export default function NumberPad(props) {
  const initialValue = props.initialValue ? props.initialValue : "000000";
  const [mode, setMode] = React.useState(props.mode);
  const [hours, setHours] = React.useState(initialValue.slice(0, 2));
  const [minutes, setMinutes] = React.useState(initialValue.slice(2, 4));
  const [seconds, setSeconds] = React.useState(initialValue.slice(4, 6));
  const [amount, setAmount] = React.useState(() => {
    if (mode === "time") {
      return Number(initialValue) !== 0 ? Number(initialValue).toString() : "";
    } else if (mode === "number") {
      return "";
    }
  }

  );

  const updateAmount = value => {
    let num; // Up to 6 digits. No leading zeroes
    let str; // Will always be 6 digits, including any leading zeroes
    if (value === "back") {
      if (mode === "number" && amount.length === 1) {
        num = "0";
      } else {
        num = amount.slice(0, -1);
      }
      str = "000000".slice(0, -amount.length + 1) + num;
    } else {
      num = Number(amount + value);
      str = "000000".slice(0, -amount.length - 1) + num;
    }
    str += "000000";
    str = str.slice(0, 6);
    setHours(str.slice(0, 2));
    setMinutes(str.slice(2, 4));
    setSeconds(str.slice(4, 6));
    setAmount(num.toString().slice(0, 6));
    props.callback(str);
  };

  let Display;
  if (mode === "time") {
    Display = (
      <Button transparent block>
        <H3 style={styles.numberDisplay}>
          {hours} h {minutes} m {seconds} s
        </H3>
      </Button>
    );
  } else if (mode === "number") {
    Display = (
      <Button transparent block>
        <H3 style={styles.numberDisplay}>
          {amount}
        </H3>
      </Button>
    );
  }

  return (
    <View>
      <Grid>
        <Row>
          <Col>
            {Display}
          </Col>
          <Col>
            <Button transparent block onPress={() => updateAmount("back")}>
              <Text>{"<-"}</Text>
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button transparent block onPress={() => updateAmount("1")}>
              <Text>1</Text>
            </Button>
          </Col>
          <Col>
            <Button transparent block onPress={() => updateAmount("2")}>
              <Text>2</Text>
            </Button>
          </Col>
          <Col>
            <Button transparent block onPress={() => updateAmount("3")}>
              <Text>3</Text>
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button transparent block onPress={() => updateAmount("4")}>
              <Text>4</Text>
            </Button>
          </Col>
          <Col>
            <Button transparent block onPress={() => updateAmount("5")}>
              <Text>5</Text>
            </Button>
          </Col>
          <Col>
            <Button transparent block onPress={() => updateAmount("6")}>
              <Text>6</Text>
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button transparent block onPress={() => updateAmount("7")}>
              <Text>7</Text>
            </Button>
          </Col>
          <Col>
            <Button transparent block onPress={() => updateAmount("8")}>
              <Text>8</Text>
            </Button>
          </Col>
          <Col>
            <Button transparent block onPress={() => updateAmount("9")}>
              <Text>9</Text>
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button transparent block onPress={() => updateAmount("0")}>
              <Text>0</Text>
            </Button>
          </Col>
        </Row>
      </Grid>
    </View>
  );
}

const styles = StyleSheet.create({
  numberDisplay: {
    color: Colors.brandPrimary
  }
});
