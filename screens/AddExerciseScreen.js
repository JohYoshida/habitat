import * as React from "react";
import { StyleSheet } from "react-native";
import { Input } from "react-native-elements";
import { Button, Container, Content, StyleProvider, Text } from "native-base";
import { postExercise } from "../functions/fetch";
import Colors from "../constants/Colors";
import CustomButtons from "../components/CustomButtons";
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
      postExercise(exercise, modeButtons[modeIndex]).then(() => {
        props.route.params.refreshLastScreen();
        props.navigation.goBack();
      });
    } else {
      let duplicate = false;
      exercises.forEach(item => {
        if (item.name === exercise) {
          duplicate = true;
          inputError();
        }
      });
      if (!duplicate) {
        postExercise(exercise, modeButtons[modeIndex]).then(() => {
          props.route.params.refreshLastScreen();
          props.navigation.goBack();
        });
      }
    }
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
          <CustomButtons
            onPress={index => {
              if (index === 0) setMode(0);
              else if (index === 1) setMode(1);
            }}
            selectedIndex={modeIndex}
            buttons={modeButtons}
            style={styles.buttons}
          />
        </Content>
        <Button block style={styles.buttons} onPress={submitExercise}>
          <Text>Submit</Text>
        </Button>
      </Container>
    </StyleProvider>
  );
}

const styles = StyleSheet.create({
  buttons: {
    margin: 10
  }
});
