import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Container,
  Content,
  Icon,
  List,
  ListItem,
  Spinner,
  StyleProvider,
  Text
} from "native-base";
import ActionButton from "react-native-action-button";
import { URL } from "../constants/URLs";
import Colors from "../constants/Colors";
// Native Base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

export default function ExerciseScreen(props) {
  const [exercises, setExercises] = React.useState([]);
  const [isFetchingExercises, setIsFetchingExercises] = React.useState(false);

  // Get exercises when the screen mounts or state updates
  React.useEffect(
    () => {
      getExercises();
    },
    [exercises.length] // only run when exercises.length changes
  );

  // Get all exercises from server
  const getExercises = () => {
    setIsFetchingExercises(true);
    fetch(`${URL}/exercises`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(json => {
        setIsFetchingExercises(false);
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

  // Conditionally display exercise list, empty list text, or loading spinner
  let ListDisplay;
  if (isFetchingExercises) {
    ListDisplay = <Spinner color={Colors.brandPrimary} />;
  } else if (exercises.length === 0) {
    ListDisplay = (
      <Text style={styles.emptyListText}>
        exercises you add will appear here
      </Text>
    );
  } else ListDisplay = <List>{ExercisesList}</List>;

  // temporary buttons for ease of navigation
  const NavButtons = (
    <View>
      <Button
        block
        bordered
        warning
        onPress={() =>
          props.navigation.navigate("Add Exercise", { exercises, getExercises })
        }
      >
        <Text>go to add exercise</Text>
      </Button>
      <Button
        block
        bordered
        warning
        onPress={() =>
          props.navigation.navigate("Add Workout", { exercises, getExercises })
        }
      >
        <Text>go to add workout</Text>
      </Button>
      <Button block bordered warning onPress={getExercises}>
        <Text>Get exercises</Text>
      </Button>
    </View>
  );

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <View style={styles.container}>
          <Content padder>
            {NavButtons}
            {ListDisplay}
          </Content>
          <ActionButton buttonColor={Colors.brandPrimary}>
            <ActionButton.Item
              title="Add Exercise"
              buttonColor={Colors.brandPrimary}
              onPress={() =>
                props.navigation.navigate("Add Exercise", {
                  exercises,
                  getExercises
                })
              }
            >
              <Icon name="add" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            <ActionButton.Item
              title="Add Workout"
              buttonColor={Colors.brandPrimary}
              onPress={() =>
                props.navigation.navigate("Add Workout", {
                  exercises,
                  getExercises
                })
              }
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
  },
  emptyListText: {
    color: "#BDBDBD",
    textAlign: "center",
    marginVertical: 20
  }
});
