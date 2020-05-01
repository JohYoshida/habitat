import * as React from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
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
import { fetchExercises } from "../functions/fetch";
import Colors from "../constants/Colors";
// Native Base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

export default function ExerciseScreen(props) {
  const [exercises, setExercises] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);

  // Get exercises when the screen mounts or state updates
  React.useEffect(
    () => {
      fetchExercises().then(data => {
        setExercises(data);
      });
    },
    [exercises.length] // only run when exercises.length changes
  );

  const onRefresh = React.useCallback(
    () => {
      setRefreshing(true);
      fetchExercises().then(data => {
        setExercises(data);
        setRefreshing(false);
      });
    },
    [refreshing]
  );

  // Assemble exercise list
  const ExercisesList = [];
  exercises.forEach((exercise, index) => {
    ExercisesList.push(
      <ListItem
        key={index}
        onPress={() =>
          props.navigation.navigate("View Exercise", {
            exercise,
            refreshLastScreen: onRefresh
          })
        }
      >
        <Text>{exercise.name}</Text>
      </ListItem>
    );
  });

  // Conditionally display exercise list or empty list text
  let ListDisplay;
  if (exercises.length === 0) {
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
          props.navigation.navigate("Add Exercise", {
            exercises,
            refreshLastScreen: onRefresh
          })
        }
      >
        <Text>go to add exercise</Text>
      </Button>
      <Button
        block
        bordered
        warning
        onPress={() =>
          props.navigation.navigate("Add Workout", {
            exercises,
            refreshLastScreen: onRefresh
          })
        }
      >
        <Text>go to add workout</Text>
      </Button>
      <Button
        block
        bordered
        warning
        onPress={() => fetchExercises().then(data => setExercises(data))}
      >
        <Text>Get exercises</Text>
      </Button>
    </View>
  );

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <View style={styles.container}>
          <Content
            padder
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
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
                  refreshLastScreen: onRefresh
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
                  refreshLastScreen: onRefresh
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
