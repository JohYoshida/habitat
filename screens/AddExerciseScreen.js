import * as React from "react";
import { StyleSheet } from "react-native";
import { Input, ButtonGroup } from "react-native-elements";
import { Button, Container, Content, StyleProvider, Text } from "native-base";
import { URL } from "../constants/URLs";
import Colors from "../constants/Colors";
// Native base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

export default function AddExerciseScreen(props) {
  // Hooks for exercises
  const [exercise, setExercise] = React.useState();
  const [errorTextExercise, setErrorTextExercise] = React.useState();
  const inputExercise = React.createRef();

  // Hooks for mode
  const modeButtons = ["reps and sets", "time"];
  const [modeIndex, setMode] = React.useState(0);

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
        name: exercise,
        mode: modeButtons[modeIndex]
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
            autoFocus={true}
            placeholder={
              errorTextExercise ? errorTextExercise : "name of exercise"
            }
            onChangeText={text => {
              setErrorTextExercise(null);
              setExercise(text);
            }}
          />
          <ButtonGroup
            onPress={index => {
              if (index === 0) setMode(0);
              else if (index === 1) setMode(1);
            }}
            selectedIndex={modeIndex}
            buttons={modeButtons}
            selectedButtonStyle={styles.selectedButtonStyle}
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

const styles = StyleSheet.create({
  selectedButtonStyle: {
    backgroundColor: Colors.brandPrimary
  }
});
