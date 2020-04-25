import * as React from "react";
import { Input } from "react-native-elements";
import { Button, Container, Content, StyleProvider, Text } from "native-base";
// Native base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

const URL = "https://habitat-server.herokuapp.com";

export default function ViewExerciseScreen(props) {
  const { id, name } = props.route.params.exercise;

  const deleteExercise = () => {
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
      });
  };

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <Content padder>
          <Button block bordered danger onPress={deleteExercise}>
            <Text>Delete</Text>
          </Button>
        </Content>
      </Container>
    </StyleProvider>
  );
}
