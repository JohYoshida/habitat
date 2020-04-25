import * as React from "react";
import { StyleSheet } from "react-native";
import { ButtonGroup, Input } from "react-native-elements";
import {
  Button,
  Container,
  Content,
  Form,
  Item,
  Label,
  Picker,
  StyleProvider,
  Text
} from "native-base";
import Colors from "../constants/Colors";
// Native base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

const URL = "https://habitat-server.herokuapp.com";

export default function AddWorkoutScreen(props) {
  // Hooks for sets, set input/errors
  const [sets, updateSets] = React.useState();
  const [errorTextSets, updateErrorTextSets] = React.useState();
  const [selectedSetsIndex, updateSetsIndex] = React.useState();
  const inputSets = React.createRef();
  const setsButtons = ["1", "2", "3", "custom"];

  // Hooks for reps, rep input/errors
  const [reps, updateReps] = React.useState();
  const [errorTextReps, updateErrorTextReps] = React.useState();
  const [selectedRepsIndex, updateRepsIndex] = React.useState();
  const inputReps = React.createRef();
  const repsButtons = ["5", "10", "custom"];

  const { exercises, getExercises } = props.route.params;

  const [selectedExerciseIndex, setSelectedExercise] = React.useState(
    exercises.length > 0 ? exercises[0] : "add exercise"
  );

  // Submit form
  const submitWorkout = () => {
    let exercise_id = exercises[selectedExerciseIndex].id;
    fetch(`${URL}/workout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        exercise_id,
        reps,
        sets
      })
    })
      .then(res => res.json())
      .then(json => {
        props.navigation.goBack();
      });
  };

  // Handle text input errors
  const inputError = id => {
    switch (id) {
      case "reps":
        inputReps.current.shake();
        updateReps("");
        updateErrorTextReps("invalid entry");
        break;
      case "sets":
        inputSets.current.shake();
        updateSets("");
        updateErrorTextSets("invalid entry");
        break;
      default:
    }
  };

  // Conditional rendering for custom sets input
  let InputCustomSets;
  // if last button (custom option) is selected
  if (selectedSetsIndex == setsButtons.length - 1) {
    // display input
    InputCustomSets = (
      <Input
        ref={inputSets}
        value={sets}
        placeholder={errorTextSets ? errorTextSets : "number of sets"}
        onChangeText={text => {
          updateErrorTextSets(null);
          updateSets(text);
        }}
      />
    );
  } else InputCustomSets = null;

  // Conditional rendering for custom reps input
  let InputCustomReps;
  // if last button (custom option) is selected
  if (selectedRepsIndex == repsButtons.length - 1) {
    // display input
    InputCustomReps = (
      <Input
        ref={inputReps}
        value={reps}
        placeholder={errorTextReps ? errorTextReps : "number of reps"}
        onChangeText={text => {
          updateErrorTextReps(null);
          updateReps(text);
        }}
      />
    );
  } else InputCustomReps = null;

  // Assemble Picker list
  // TODO: make this list update dynamically when new workout
  // is added from downstack of this screen
  const PickerList = [];
  exercises.forEach((item, index) => {
    PickerList.push(
      <Picker.Item label={item.name} value={index} key={item.id} />
    );
  });

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <Content padder>
          <Form>
            <Item picker>
              <Picker
                selectedValue={selectedExerciseIndex}
                onValueChange={value => setSelectedExercise(value)}
                placeholder="select a workout"
              >
                {PickerList}
              </Picker>
            </Item>
            <Button
              block
              transparent
              onPress={() =>
                props.navigation.navigate("Add Exercise", {
                  exercises,
                  getExercises
                })
              }
            >
              <Text>or add exercise</Text>
            </Button>
            <Item fixedLabel>
              <Label>Reps</Label>
            </Item>
            <ButtonGroup
              onPress={index => {
                updateRepsIndex(index);
                if (repsButtons[index] !== "custom")
                  updateReps(repsButtons[index]);
                else updateReps("");
              }}
              selectedIndex={selectedRepsIndex}
              buttons={repsButtons}
              selectedButtonStyle={{ backgroundColor: "#2196F3" }}
            />
            {InputCustomReps}

            <Item fixedLabel>
              <Label>Sets</Label>
            </Item>
            <ButtonGroup
              onPress={index => {
                updateSetsIndex(index);
                if (setsButtons[index] !== "custom")
                  updateSets(setsButtons[index]);
                else updateSets("");
              }}
              selectedIndex={selectedSetsIndex}
              buttons={setsButtons}
              selectedButtonStyle={{ backgroundColor: "#2196F3" }}
            />
            {InputCustomSets}
          </Form>

          <Button block onPress={submitWorkout}>
            <Text>Submit</Text>
          </Button>

          <Button block warning onPress={inputError.bind(this, "reps")}>
            <Text>reps error</Text>
          </Button>
          <Button block warning onPress={inputError.bind(this, "sets")}>
            <Text>sets error</Text>
          </Button>
        </Content>
      </Container>
    </StyleProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa"
  },
  selectedButtonStyle: {
    backgroundColor: Colors.brandPrimary
  }
});
