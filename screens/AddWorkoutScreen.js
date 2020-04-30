import * as React from "react";
import { StyleSheet, View } from "react-native";
import { ButtonGroup } from "react-native-elements";
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
import { URL } from "../constants/URLs";
import Colors from "../constants/Colors";
import NumberPad from "../components/NumberPad";
// Native base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

export default function AddWorkoutScreen(props) {
  // Hooks for sets, set input/errors
  const setsButtons = ["1", "2", "3", "custom"];
  const [sets, updateSets] = React.useState("1");
  const [selectedSetsIndex, updateSetsIndex] = React.useState(0);

  // Hooks for reps, rep input/errors
  const repsButtons = ["5", "10", "custom"];
  const [reps, updateReps] = React.useState("0");
  const [selectedRepsIndex, updateRepsIndex] = React.useState(
    repsButtons.length - 1
  );

  // Hooks for time
  const [seconds, updateSeconds] = React.useState(0);
  const [minutes, updateMinutes] = React.useState(0);
  const [hours, updateHours] = React.useState(0);

  // Hoops for selecting an exercise
  const { exercise, getWorkouts, exercises, getExercises } = props.route.params;
  const [selectedExerciseIndex, setSelectedExercise] = React.useState(0);

  // Submit form
  const submitWorkout = () => {
    let exercise_id;
    let body = {};
    let totalSeconds = seconds + minutes * 60  + hours * 3600;
    if (exercises) {
      // navigated from ExerciseScreen
      body.exercise_id = exercises[selectedExerciseIndex].id;
      if (exercises[selectedExerciseIndex].mode === "reps and sets") {
        body.reps = reps;
        body.sets = sets;
      } else if (exercises[selectedExerciseIndex].mode === "time") {
        body.seconds = totalSeconds;
      }
    } else if (exercise) {
      // navigated from ViewExerciseScreen
      body.exercise_id = exercise.id;
      if (exercise.mode === "reps and sets") {
        body.reps = reps;
        body.sets = sets;
      } else if (exercise.mode === "time") {
        body.seconds = totalSeconds;
      }
    }
    body = JSON.stringify(body);
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

  // Conditional rendering for custom sets input
  let InputCustomSets;
  // if last button (custom option) is selected
  if (selectedSetsIndex == setsButtons.length - 1) {
    // display input
    InputCustomSets = (
      <NumberPad
        initialValue={0}
        mode={"number"}
        callback={text => {
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
      <NumberPad
        initialValue={0}
        mode={"number"}
        callback={text => {
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
  let SwitchButtonDisplay;
  const RepsAndSetsDisplay = (
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
    </View>
  );
  const TimeDisplay = (
    <View>
      <NumberPad
        mode={"time"}
        callback={string => {
          updateHours(Number(string.slice(0, 2)));
          updateMinutes(Number(string.slice(2, 4)));
          updateSeconds(Number(string.slice(4, 6)));
        }}
      />
    </View>
  );
  if (exercise) {
    if (exercise.mode === "reps and sets") {
      InputDisplay = RepsAndSetsDisplay;
    } else if (exercise.mode === "time") {
      InputDisplay = TimeDisplay;
    }
  }
  if (exercises) {
    if (exercises[selectedExerciseIndex].mode === "reps and sets") {
      InputDisplay = RepsAndSetsDisplay;
    } else if (exercises[selectedExerciseIndex].mode === "time") {
      InputDisplay = TimeDisplay;
    }
  }

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <Content padder>
          <Form>
            {ExerciseDisplay}
            {InputDisplay}
          </Form>
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
