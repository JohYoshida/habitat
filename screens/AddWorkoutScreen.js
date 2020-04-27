import * as React from "react";
import { StyleSheet, View } from "react-native";
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
import NumberPad from "../components/NumberPad";
import Colors from "../constants/Colors";
// Native base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

const URL = "https://habitat-server.herokuapp.com";

export default function AddWorkoutScreen(props) {
  // Hooks for sets, set input/errors
  const setsButtons = ["1", "2", "3", "custom"];
  const [sets, updateSets] = React.useState();
  const [errorTextSets, updateErrorTextSets] = React.useState();
  const [selectedSetsIndex, updateSetsIndex] = React.useState(0);
  const inputSets = React.createRef();

  // Hooks for reps, rep input/errors
  const repsButtons = ["5", "10", "custom"];
  const [reps, updateReps] = React.useState();
  const [errorTextReps, updateErrorTextReps] = React.useState();
  const [selectedRepsIndex, updateRepsIndex] = React.useState(repsButtons.length - 1);
  const inputReps = React.createRef();

  // Hooks for time
  const [seconds, updateSeconds] = React.useState(0);
  const [minutes, updateMinutes] = React.useState(0);
  const [hours, updateHours] = React.useState(0);

  // Hook for input mode
  const [mode, setMode] = React.useState("repsAndSets");

  // Hoops for selecting an exercise
  const { exercise, getWorkouts, exercises, getExercises } = props.route.params;
  const [selectedExerciseIndex, setSelectedExercise] = React.useState(
    exercises && exercises.length > 0 ? exercises[0] : "add exercise"
  );

  // Submit form
  const submitWorkout = () => {
    let exercise_id;
    if (exercises) {
      // navigated from ExerciseScreen
      exercise_id = exercises[selectedExerciseIndex].id;
    } else if (exercise) {
      // navigated from ViewExerciseScreen
      exercise_id = exercise.id;
    }
    let body = {};
    if (mode === "repsAndSets") {
      body = JSON.stringify({
        exercise_id,
        reps,
        sets
      });
    } else if (mode === "time") {
      let totalSeconds = seconds + minutes * 60 + hours * 3600;
      console.log(totalSeconds);
      body = JSON.stringify({
        exercise_id,
        seconds: totalSeconds
      });
    }
    fetch(`${URL}/workout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body
    })
      .then(res => res.json())
      .then(json => {
        if (exercise) {
          getWorkouts();
        }
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
        keyboardType="numeric"
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
  if (exercises) {
    exercises.forEach((item, index) => {
      PickerList.push(
        <Picker.Item label={item.name} value={index} key={item.id} />
      );
    });
  } else if (exercise) {
    PickerList.push(
      <Picker.Item label={exercise.name} value={0} key={exercise.id} />
    );
  }

  // Conditional display for picker depending on where user navigated from
  let ExerciseDisplay;
  if (exercises) {
    // navigation from ExerciseScreen
    ExerciseDisplay = [
      <Item picker key={0}>
        <Picker
          selectedValue={selectedExerciseIndex}
          onValueChange={value => setSelectedExercise(value)}
          placeholder="select a workout"
        >
          {PickerList}
        </Picker>
      </Item>,
      <Button
        block
        transparent
        key={1}
        onPress={() =>
          props.navigation.navigate("Add Exercise", {
            exercises,
            getExercises
          })
        }
      >
        <Text>or add exercise</Text>
      </Button>
    ];
  } else if (exercise) {
    // navigation from ViewExerciseScreen
    ExerciseDisplay = [
      <Item picker key={0}>
        <Picker enabled={false}>
          <Picker.Item label={exercise.name} value={0} key={exercise.id} />
        </Picker>
      </Item>,
      <Button block transparent key={1} />
    ];
  }

  // Conditional rendering for reps and sets mode and time mode inputs
  let InputDisplay;
  if (mode === "repsAndSets") {
    InputDisplay = (
      <View>
        <Item fixedLabel>
          <Label>Reps</Label>
        </Item>
        <ButtonGroup
          onPress={index => {
            updateRepsIndex(index);
            if (repsButtons[index] !== "custom") updateReps(repsButtons[index]);
            else updateReps("");
          }}
          selectedIndex={selectedRepsIndex}
          buttons={repsButtons}
          selectedButtonStyle={styles.selectedButtonStyle}
        />
        {InputCustomReps}
        <Item fixedLabel>
          <Label>Sets</Label>
        </Item>
        <ButtonGroup
          onPress={index => {
            updateSetsIndex(index);
            if (setsButtons[index] !== "custom") updateSets(setsButtons[index]);
            else updateSets("");
          }}
          selectedIndex={selectedSetsIndex}
          buttons={setsButtons}
          selectedButtonStyle={styles.selectedButtonStyle}
        />
        {InputCustomSets}
        <Button block transparent onPress={() => setMode("time")}>
          <Text>switch to time</Text>
        </Button>
      </View>
    );
  } else if (mode === "time") {
    // Setup initial value
    let initialValue = `${hours.toString()}${minutes.toString()}${seconds.toString()}`;
    initialValue = "000000".slice(0, -initialValue.length) + initialValue;

    InputDisplay = (
      <View>
        <NumberPad
          initialValue={initialValue}
          callback={string => {
            updateHours(Number(string.slice(0, 2)));
            updateMinutes(Number(string.slice(2, 4)));
            updateSeconds(Number(string.slice(4, 6)));
          }}
        />
        <Button block transparent onPress={() => setMode("repsAndSets")}>
          <Text>switch to reps and sets</Text>
        </Button>
      </View>
    );
  }

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <Content padder>
          <Form>
            {ExerciseDisplay}
            {InputDisplay}
          </Form>
          <Button
            style={styles.buttons}
            block
            warning
            bordered
            onPress={inputError.bind(this, "reps")}
            >
            <Text>reps error</Text>
          </Button>
          <Button
            style={styles.buttons}
            block
            warning
            bordered
            onPress={inputError.bind(this, "sets")}
            >
            <Text>sets error</Text>
          </Button>
        </Content>
        <Button style={styles.buttons} block onPress={submitWorkout}>
          <Text>Submit</Text>
        </Button>
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
  },
  buttons: {
    margin: 10
  }
});
