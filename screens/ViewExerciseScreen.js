import * as React from "react";
import { View } from "react-native";
import { Input } from "react-native-elements";
import { Button, Container, Content, StyleProvider, Text } from "native-base";
// Native base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

const URL = "https://habitat-server.herokuapp.com";

export default function ViewExerciseScreen(props) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const deleteExercise = () => {
    const { id, name } = props.route.params.exercise;
    fetch(`${URL}/exercise`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "DELETE"
      },
      body: JSON.stringify({ name, id })
    })
      .then(res => res.json())
      .then(json => {
        props.route.params.getExercises();
        props.navigation.goBack();
        setConfirmDelete(false);
      });
  };

  const getWorkouts = () => {
    const exercise_id = props.route.params.exercise.id;
    fetch(`${URL}/workouts/${exercise_id}`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(json => {
        console.log(json);
      });
  };

  // Conditional rendering for delete/confirm buttons
  let DeleteButton;
  if (confirmDelete) {
    DeleteButton = (
      <View>
        <Button block danger onPress={deleteExercise}>
          <Text>Are you sure?</Text>
        </Button>
        <Button block onPress={() => setConfirmDelete(false)}>
          <Text>Cancel</Text>
        </Button>
      </View>
    );
  } else {
    DeleteButton = (
      <Button block bordered danger onPress={() => setConfirmDelete(true)}>
        <Text>Delete</Text>
      </Button>
    );
  }

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <Content padder>
          <Button block onPress={getWorkouts}>
            <Text>Get workouts</Text>
          </Button>
          {DeleteButton}
        </Content>
      </Container>
    </StyleProvider>
  );
}
