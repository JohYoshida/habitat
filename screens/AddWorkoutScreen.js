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

export default function AddWorkoutScreen(props) {
  // Hooks for sets, set input/errors
  const [sets, setSets] = React.useState();
  const [errorTextSets, setErrorTextSets] = React.useState();
  const [selectedSetsIndex, updateSetsIndex] = React.useState();
  const inputSets = React.createRef();
  const setsButtons = ["1", "2", "3", "custom"];

  // Hooks for reps, rep input/errors
  const [reps, setReps] = React.useState();
  const [errorTextReps, setErrorTextReps] = React.useState();
  const [selectedRepsIndex, updateRepsIndex] = React.useState();
  const inputReps = React.createRef();
  const repsButtons = ["5", "10", "custom"];

  const { exercises, getExercises } = props.route.params;

  // Submit form
  const submit = () => {
    props.navigation.goBack();
  };

  // Handle text input errors
  const inputError = id => {
    switch (id) {
      case "reps":
        inputReps.current.shake();
        setReps("");
        setErrorTextReps("invalid entry");
        break;
      case "sets":
        inputSets.current.shake();
        setSets("");
        setErrorTextSets("invalid entry");
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
          setErrorTextSets(null);
          setSets(text);
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
          setErrorTextReps(null);
          setReps(text);
        }}
      />
    );
  } else InputCustomReps = null;

  // Assemble Picker list
  // TODO: make this list update dynamically when new workout
  // is added from downstack of this screen 
  const PickerList = [];
  exercises.forEach((item, index) => {
    PickerList.push(<Picker.Item label={item.name} value={index} key={item.id} />);
  });

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <Content padder>
          <Form>
            <Item picker>
              <Picker placeholder="select a workout">{PickerList}</Picker>
            </Item>
            <Button
              block
              transparent
              onPress={() => props.navigation.navigate("Add Exercise", { exercises, getExercises })}
            >
              <Text>or add exercise</Text>
            </Button>
            <Item fixedLabel>
              <Label>Reps</Label>
            </Item>
            <ButtonGroup
              onPress={index => {
                updateRepsIndex(index);
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
              }}
              selectedIndex={selectedSetsIndex}
              buttons={setsButtons}
              selectedButtonStyle={{ backgroundColor: "#2196F3" }}
            />
            {InputCustomSets}
          </Form>

          <Button block onPress={submit}>
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
