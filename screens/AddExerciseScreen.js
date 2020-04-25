import * as React from "react";
import { Input } from "react-native-elements";
import { Button, Container, Content, StyleProvider, Text } from "native-base";
// Native base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

const URL = "https://habitat-server.herokuapp.com";

export default function AddExerciseScreen(props) {
  const [exercise, setExercise] = React.useState();
  const [errorTextExercise, setErrorTextExercise] = React.useState();
  const inputExercise = React.createRef();

  const submitExercise = () => {
    const { exercises } = props.route.params;
    if (exercises.length === 0) {
      postExercise();
    } else {
      let duplicate = false;
      exercises.forEach(item => {
        if (item.name === exercise) {
          duplicate = true;
          inputError();
        }
      });
      if (!duplicate) postExercise();
    }
  };

  const postExercise = () => {
    fetch(`${URL}/exercise`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: exercise
      })
    })
      .then(res => res.json())
      .then(json => {
        props.route.params.getExercises();
        props.navigation.goBack();
      });
  };

  const inputError = () => {
    inputExercise.current.shake();
    setExercise("");
    setErrorTextExercise("an exercise with that name already exists");
  };

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <Content padder>
          <Input
            ref={inputExercise}
            value={exercise}
            placeholder={
              errorTextExercise ? errorTextExercise : "name of exercise"
            }
            onChangeText={text => {
              setErrorTextExercise(null);
              setExercise(text);
            }}
          />
          <Button block onPress={submitExercise}>
            <Text>Submit</Text>
          </Button>
          <Button block warning onPress={inputError}>
            <Text>exercise error</Text>
          </Button>
        </Content>
      </Container>
    </StyleProvider>
  );
}
