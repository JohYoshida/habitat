import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Container,
  Content,
  Icon,
  List,
  ListItem,
  StyleProvider,
  Text
} from "native-base";
import ActionButton from "react-native-action-button";
import Colors from "../constants/Colors";
// Native Base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

export default function ExerciseScreen(props) {

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <View style={styles.container}>
          <Content padder>
          </Content>

          <ActionButton buttonColor={colors.brandPrimary}>
            <ActionButton.Item
              title="Add Exercise"
              buttonColor={colors.brandPrimary}
              onPress={() => props.navigation.navigate("Add Exercise")}
            >
              <Icon name="add" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item
              title="Add Workout"
              buttonColor={colors.brandPrimary}
              onPress={() => props.navigation.navigate("Add Workout")}
            >
              <Icon name="add" style={styles.actionButtonIcon} />
            </ActionButton.Item>
          </ActionButton>
        </View>
      </Container>
    </StyleProvider>
  );
}

const styles = StyleSheet.create({
  actionButtonIcon: {
    color: "white"
  },
  container: {
    flex: 1,
    backgroundColor: "#fafafa"
  }
});

const colors = {
  brandPrimary: Colors.brandPrimary
};
