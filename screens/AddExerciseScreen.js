import * as React from "react";
import { Input } from "react-native-elements";
import { Button, Container, Content, StyleProvider, Text } from "native-base";
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

export default function AddExerciseScreen(props) {
  const [exercise, setExercise] = React.useState();
  const [errorTextExercise, setErrorTextExercise] = React.useState();
  const inputExercise = React.createRef();

  const submit = () => {
    props.navigation.goBack();
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
          <Button block onPress={submit}>
            <Text>Submit</Text>
          </Button>
          <Button block warning onPress={inputError.bind(this, "exercise")}>
            <Text>exercise error</Text>
          </Button>
        </Content>
      </Container>
    </StyleProvider>
  );
}
