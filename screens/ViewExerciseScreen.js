import * as React from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { ListItem, Input } from "react-native-elements";
import {
  Button,
  Container,
  Content,
  List,
  StyleProvider,
  Text
} from "native-base";
import { ConfirmDeletionButtons } from "../components/ConfirmDeletionButtons";
import {
  fetchExercise,
  fetchWorkouts,
  deleteExercise,
  deleteWorkout
} from "../functions/fetch";
import Colors from "../constants/Colors";
// Native base theme requirements
import getTheme from "../native-base-theme/components";
import platform from "../native-base-theme/variables/platform";

const moment = require("moment");


export default function ViewExerciseScreen(props) {

  // Hook for storing workout data
  const [workouts, setWorkouts] = React.useState([]);

  // Hooks for deleting data
  const [workoutDeleteID, setWorkoutDeleteID] = React.useState(null);
  const [confirmDeleteWorkout, setConfirmDeleteWorkout] = React.useState(false);
  const [confirmDeleteExercise, setConfirmDeleteExercise] = React.useState(
    false
  );

  // Hooks for refreshing data
  const [refreshing, setRefreshing] = React.useState(false);
  const [lifetimeTotal, setLifetimeTotal] = React.useState(
    Number(props.route.params.exercise.lifetimeTotal)
  );

  // Get workouts when the screen mounts or state updates
  React.useEffect(
    () => {
      onRefresh();
      refreshLifetimeTotal();
    },
    [workouts.length] // only run when workouts.length changes
  );

  // Get and update workout data
  const onRefresh = React.useCallback(
    () => {
      const exercise_id = props.route.params.exercise.id;
      setRefreshing(true);
      // Get and set workouts from database
      fetchWorkouts(exercise_id).then(data => {
        setWorkouts(data);
        setRefreshing(false);
      });
    },
    [refreshing]
  );

  // Delete exercise from server database by id
  const removeExercise = () => {
    let { id, name } = props.route.params.exercise;
    deleteExercise(id, name).then(() => {
      props.route.params.refreshLastScreen();
      setConfirmDeleteExercise(false);
      props.navigation.goBack();
    });
  };

  // Delete workout from server database by id
  const removeWorkout = () => {
    // Calculate amount to decrease lifetimeTotal by
    let amount;
    workouts.forEach(workout => {
      if (workout.id === workoutDeleteID) {
        let { mode } = props.route.params.exercise;
        if (mode === "time") {
          amount = workout.seconds;
        } else if (mode === "reps and sets") {
          amount = workout.reps * workout.sets;
        }
      }
    });
    deleteWorkout(workoutDeleteID, props.route.params.exercise.id, amount).then(
      () => {
        setWorkoutDeleteID(null);
        setConfirmDeleteWorkout(false);
        onRefresh();
      }
    );
  };

  // Get the exercise again and refresh the lifetimeTotal
  const refreshLifetimeTotal = () => {
    const id = props.route.params.exercise.id;
    fetchExercise(id).then(exercise => {
      setLifetimeTotal(exercise.lifetimeTotal);
    });
  };

  // Assemble workouts list
  const WorkoutsList = [];
  const name = props.route.params.exercise.name.toLowerCase();
  const mode = props.route.params.exercise.mode;
  const today = Number(moment().format("DD"));
  let todayTotal = 0,
    yesterdayTotal = 0,
    thisWeekTotal = 0;
  let yesterdayList = [];
  workouts.forEach((workout, index) => {
    let { reps, sets, seconds, id, createdAt } = workout;
    let sum = reps * sets;
    let day = Number(moment(createdAt).format("DD"));
    let timestamp = moment(createdAt).format("h:mm a MM-DD-YYYY");
    if (today - day === 0) {
      todayTotal += sum;
      todayTotal += seconds;
    }
    if (today - day === 1) {
      yesterdayTotal += sum;
      yesterdayTotal += seconds;
      // Conditionally configure yesterday header
      let yesterdayTitle = assembleTitle(mode, yesterdayTotal, name);
      yesterdayList[0] = (
        <ListItem
          key="yesterday"
          title="Yesterday"
          topDivider={true}
          bottomDivider={true}
          rightTitle={yesterdayTitle}
        />
      );
    }
    if (today - day < 7) {
      // Push yesterday header into workout list
      WorkoutsList.push(yesterdayList.pop());
      thisWeekTotal += sum;
      thisWeekTotal += seconds;
    }
    // Configure and add workout list items
    let title;
    if (mode === "time") title = assembleTitle(mode, seconds, name);
    else title = assembleTitle(mode, sum, name);
    WorkoutsList.push(
      <ListItem
        key={id}
        title={
          mode === "time" ? `${seconds} seconds` : `${reps} reps, ${sets} sets`
        }
        rightTitle={title}
        subtitle={timestamp}
        onPress={() => {
          if (id === workoutDeleteID) {
            setWorkoutDeleteID(null);
          } else {
            setWorkoutDeleteID(id);
          }
        }}
      />
    );
  });

  // Configure and add today header
  let todayTitle = assembleTitle(mode, todayTotal, name);
  WorkoutsList.unshift(
    <ListItem
      key="today"
      title="Today"
      topDivider={true}
      bottomDivider={true}
      rightTitle={todayTitle}
    />
  );

  // Configure and add this week header
  let thisWeekTitle = assembleTitle(mode, thisWeekTotal, name);
  WorkoutsList.push(
    <ListItem
      key="thisWeek"
      title="This week"
      topDivider={true}
      bottomDivider={true}
      rightTitle={thisWeekTitle}
    />
  );

  // Configure and add lifetime header
  let lifetimeTitle = assembleTitle(mode, lifetimeTotal, name);
  WorkoutsList.push(
    <ListItem
      key="lifetime"
      title="Lifetime"
      bottomDivider={true}
      rightTitle={lifetimeTitle}
    />
  );

  // Conditionally display workouts list, empty list text, or loading spinner
  let ListDisplay;
  if (workouts.length === 0) {
    ListDisplay = (
      <Text style={styles.emptyListText}>
        workouts you add will appear here
      </Text>
    );
  } else ListDisplay = WorkoutsList;

  // Conditional rendering for workout delete/confirm buttons
  let DeleteWorkoutButtons;
  if (confirmDeleteWorkout) {
    DeleteWorkoutButtons = (
      <ConfirmDeletionButtons
        key={"confirmDelete"}
        confirm={removeWorkout}
        cancel={() => {
          setConfirmDeleteWorkout(false);
          setWorkoutDeleteID(null);
        }}
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

  // Conditionally render workout delete buttons in workout list
  if (workoutDeleteID !== null) {
    WorkoutsList.forEach((object, index) => {
      if (object && object.key === workoutDeleteID) {
        WorkoutsList.splice(index + 1, 0, DeleteWorkoutButtons).join();
      }
    });
  }

  // Conditional rendering for exercise delete/confirm buttons
  let DeleteExerciseButtons;
  if (confirmDeleteExercise) {
    DeleteExerciseButtons = (
      <ConfirmDeletionButtons
        confirm={removeExercise}
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
              refreshLastScreen: onRefresh
            })
          }
        >
          <Text>Add workout</Text>
        </Button>
        <Content
          padder
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {ListDisplay}
        </Content>
        <View style={styles.buttons}>{DeleteExerciseButtons}</View>
      </Container>
    </StyleProvider>
  );
}

// Assemble dyamic titles for WorkoutsList items
const assembleTitle = (mode, number, name) => {
  let title;
  if (mode === "time") {
    let hours = Math.floor(number / 3600);
    let minutes = Math.floor((number - hours * 3600) / 60);
    let seconds = Math.floor(number - hours * 3600 - minutes * 60);
    title = `${hours} h ${minutes} m ${seconds} s`;
  } else if (mode === "reps and sets") {
    title = `${number} ${name}`;
  }
  return title;
};

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
