import * as React from "react";
import { StyleSheet, View } from "react-native";
import { ListItem, Input } from "react-native-elements";
import {
  Button,
  Container,
  Content,
  List,
  Spinner,
  StyleProvider,
  Text
} from "native-base";
import { ConfirmDeletionButtons } from "../components/ConfirmDeletionButtons";
import Colors from "../constants/Colors";
// Native base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

const moment = require("moment");

const URL = "https://habitat-server.herokuapp.com";

export default function ViewExerciseScreen(props) {
  const [confirmDeleteExercise, setConfirmDeleteExercise] = React.useState(
    false
  );
  const [confirmDeleteWorkout, setConfirmDeleteWorkout] = React.useState(false);
  const [workouts, setWorkouts] = React.useState([]);
  const [isFetchingWorkouts, setIsFetchingWorkouts] = React.useState(false);
  const [workoutDeleteIndex, setWorkoutDeleteIndex] = React.useState(null);
  const [workoutDeleteID, setWorkoutDeleteID] = React.useState(null);

  // Get workouts when the screen mounts or state updates
  React.useEffect(
    () => {
      getWorkouts();
    },
    [workouts.length] // only run when workouts.length changes
  );

  // Delete workout from server database by id
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
        setConfirmDeleteExercise(false);
      });
  };

  const deleteWorkout = () => {
    fetch(`${URL}/workout`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "DELETE"
      },
      body: JSON.stringify({ id: workoutDeleteID })
    })
      .then(res => res.json())
      .then(json => {
        setWorkoutDeleteID(null);
        setWorkoutDeleteIndex(null);
        getWorkouts();
      });
  };

  // Get all workouts matching exercise by id from server database
  const getWorkouts = () => {
    setIsFetchingWorkouts(true);
    const exercise_id = props.route.params.exercise.id;
    fetch(`${URL}/workouts/${exercise_id}`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(json => {
        setWorkouts(json.data);
        setIsFetchingWorkouts(false);
      });
  };

  // Assemble workouts list
  const WorkoutsList = [];
  workouts.forEach((workout, index) => {
    let timestamp = moment(workout.createdAt).format("h:mm a MM-DD-YYYY");
    let name = props.route.params.exercise.name.toLowerCase();
    let sum = `${workout.sets * workout.reps} ${name}`;
    WorkoutsList.push(
      <ListItem
        key={index}
        title={`${workout.reps} reps, ${workout.sets} sets`}
        rightTitle={sum}
        subtitle={timestamp}
        onPress={() => {
          if (index === workoutDeleteIndex) {
            setWorkoutDeleteIndex(null);
            setWorkoutDeleteID(null);
          } else {
            setWorkoutDeleteIndex(index);
            setWorkoutDeleteID(workout.id);
          }
        }}
      />
    );
  });

  // Conditional rendering for workout delete/confirm buttons
  let DeleteWorkoutButtons;
  if (confirmDeleteWorkout) {
    DeleteWorkoutButtons = (
      <ConfirmDeletionButtons
        key={"confirmDelete"}
        confirm={deleteWorkout}
        cancel={() => setConfirmDeleteWorkout(false)}
      />
    );
  } else {
    DeleteWorkoutButtons = (
      <Button
        block
        bordered
        danger
        key={"delete"}
        onPress={() => setConfirmDeleteWorkout(true)}
      >
        <Text>Delete Workout</Text>
      </Button>
    );
  }

  // Conditionally render delete buttons in workout list
  if (workoutDeleteIndex !== null) {
    WorkoutsList.splice(workoutDeleteIndex + 1, 0, DeleteWorkoutButtons).join();
  }

  // Conditionally display workouts list, empty list text, or loading spinner
  let ListDisplay;
  if (isFetchingWorkouts) {
    ListDisplay = <Spinner color={Colors.brandPrimary} />;
  } else if (workouts.length === 0) {
    ListDisplay = (
      <Text style={styles.emptyListText}>
        workouts you add will appear here
      </Text>
    );
  } else ListDisplay = <List>{WorkoutsList}</List>;

  // Conditional rendering for exercise delete/confirm buttons
  let DeleteExerciseButtons;
  if (confirmDeleteExercise) {
    DeleteExerciseButtons = (
      <ConfirmDeletionButtons
        confirm={deleteExercise}
        cancel={() => setConfirmDeleteExercise(false)}
      />
    );
  } else {
    DeleteExerciseButtons = (
      <Button
        block
        bordered
        danger
        onPress={() => setConfirmDeleteExercise(true)}
      >
        <Text>Delete {props.route.params.exercise.name}</Text>
      </Button>
    );
  }

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <Content padder>
          <Button
            block
            bordered
            onPress={() =>
              props.navigation.navigate("Add Workout", {
                exercise: props.route.params.exercise,
                getWorkouts
              })
            }
          >
            <Text>Add workout</Text>
          </Button>
          {ListDisplay}
        </Content>
        <View style={styles.deleteExerciseButtons}>
          {DeleteExerciseButtons}
        </View>
      </Container>
    </StyleProvider>
  );
}

const styles = StyleSheet.create({
  emptyListText: {
    color: "#BDBDBD",
    textAlign: "center",
    marginVertical: 20
  },
  deleteExerciseButtons: {
    margin: 10
  }
});
