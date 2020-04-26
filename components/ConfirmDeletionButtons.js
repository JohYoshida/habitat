import * as React from "react";
import { View } from "react-native";
import { Button, Text } from "native-base";

export function ConfirmDeletionButtons(props) {
  return (
    <View>
      <Button block danger onPress={props.confirm}>
        <Text>Are you sure?</Text>
      </Button>
      <Button block onPress={props.cancel}>
        <Text>Cancel</Text>
      </Button>
    </View>
  );
}
