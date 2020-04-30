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
import { URL } from "../constants/URLs";
import Colors from "../constants/Colors";
// Native base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

const moment = require("moment");

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

  // Delete exercise from server database by id
  const deleteExercise = () => {
    let { id, name } = props.route.params.exercise;
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

  // Delete workout from server database by id
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

  // Assemble workouts lists
  let todayTotal = 0,
    yesterdayTotal = 0,
    thisWeekTotal = 0,
    lifetimeTotal = 0;
  const TodaysList = [];
  const YesterdaysList = [];
  let name = props.route.params.exercise.name.toLowerCase();
  workouts.forEach((workout, index) => {
    let timestamp = moment(workout.createdAt).format("h:mm a MM-DD-YYYY");
    let sum = workout.sets * workout.reps;
    let diff = moment().diff(moment(workout.createdAt), "days");
    lifetimeTotal += sum;
    if (diff < 7) thisWeekTotal += sum;
    if (diff === 0) {
      // Construct TodaysList
      todayTotal += sum;
      TodaysList.unshift(
        <ListItem
          title={`${workout.reps} reps, ${workout.sets} sets`}
          rightTitle={`${sum} ${name}`}
          key={workouts.length - 1 - index}
          subtitle={timestamp}
          onPress={() => {
            if (workouts.length - 1 - index === workoutDeleteIndex) {
              setWorkoutDeleteIndex(null);
              setWorkoutDeleteID(null);
            } else {
              setWorkoutDeleteIndex(workouts.length - 1 - index);
              setWorkoutDeleteID(workout.id);
            }
          }}
        />
      );
    } else if (diff === 1) {
      // Construct YesterdaysList
      yesterdayTotal += sum;
      YesterdaysList.unshift(
        <ListItem
          title={`${workout.reps} reps, ${workout.sets} sets`}
          rightTitle={`${sum} ${name}`}
          key={workouts.length - 1 - index}
          subtitle={timestamp}
          onPress={() => {
            if (workouts.length - 1 - index === workoutDeleteIndex) {
              setWorkoutDeleteIndex(null);
              setWorkoutDeleteID(null);
            } else {
              setWorkoutDeleteIndex(workouts.length - 1 - index);
              setWorkoutDeleteID(workout.id);
            }
          }}
        />
      );
    }
  });
  TodaysList.unshift(
    <ListItem
      key="today"
      title="Today"
      topDivider={true}
      bottomDivider={true}
      rightTitle={`${todayTotal} ${name}`}
    />
  );
  YesterdaysList.unshift(
    <ListItem
      key="yesterday"
      title="Yesterday"
      topDivider={true}
      bottomDivider={true}
      rightTitle={`${yesterdayTotal} ${name}`}
    />
  );

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
    // TODO: display these buttons in other lists as well, or better yet,
    // find a way to combine all the lists without the headers messing things up
    TodaysList.splice(workoutDeleteIndex + 2, 0, DeleteWorkoutButtons).join();
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
  } else
    ListDisplay = (
      <View>
        <List>{TodaysList}</List>
        <List>{YesterdaysList}</List>
        <ListItem
          key="thisWeekTotal"
          title="This Week"
          topDivider={true}
          bottomDivider={true}
          rightTitle={`${thisWeekTotal} ${name}`}
        />
        <ListItem
          key="total"
          title="Lifetime Total"
          topDivider={true}
          bottomDivider={true}
          rightTitle={`${lifetimeTotal} ${name}`}
        />
      </View>
    );

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
        <Text>Delete {name}</Text>
      </Button>
    );
  }

  return (
    <StyleProvider style={getTheme(platform)}>
      <Container>
        <Button
          block
          bordered
          style={styles.buttons}
          onPress={() =>
            props.navigation.navigate("Add Workout", {
              exercise: props.route.params.exercise,
              getWorkouts
            })
          }
        >
          <Text>Add workout</Text>
        </Button>
        <Content padder>{ListDisplay}</Content>
        <View style={styles.buttons}>{DeleteExerciseButtons}</View>
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
  buttons: {
    margin: 10
  }
});
