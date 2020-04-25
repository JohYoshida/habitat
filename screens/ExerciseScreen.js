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

const URL = "https://habitat-server.herokuapp.com";

export default function ExerciseScreen(props) {
  const [exercises, setExercises] = React.useState([]);

  const getExercises = () => {
    fetch(`${URL}/exercises`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(json => {
        setExercises(json.data);
      });
  };

  // Assemble exercise list
  const ExercisesList = [];
  exercises.forEach((exercise, index) => {
    ExercisesList.push(
      <ListItem
        key={index}
        onPress={() =>
          props.navigation.navigate("View Exercise", { exercise, getExercises })
        }
      >
        <Text>{exercise.name}</Text>
      </ListItem>
    );
  });

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <View style={styles.container}>
          <Content padder>
            <List>{ExercisesList}</List>
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
