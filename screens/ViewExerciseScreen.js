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
import * as Haptics from 'expo-haptics';
import { BarChart, LineChart, Grid, XAxis, YAxis } from "react-native-svg-charts";
import * as shape from "d3-shape";
import { ConfirmDeletionButtons } from "../components/ConfirmDeletionButtons";
import {
  fetchExercise,
  fetchWorkouts,
  deleteExercise,
  deleteWorkout
} from "../functions/fetch";
import { assembleChartData, assembleWorkoutsList } from "../functions/viewExerciseScreenHelpers";
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

  // Hooks for chart
  const [chartData, setChartData] = React.useState({
    today: { data: [], dates: [], total: 0 },
    thisWeek: { data: [], dates: [], total: 0 },
    thisMonth: { data: [], dates: [], total: 0 },
    lifetime: { data: [], dates: [], total: 0 },
    cumulative: { data: [], total: 0 },
    workoutsList: []
  });
  const [displayChart, setDisplayChart] = React.useState(null);

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
        setChartData(assembleChartData(data));
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
  const name = props.route.params.exercise.name.toLowerCase();
  const mode = props.route.params.exercise.mode;
  const WorkoutsList = assembleWorkoutsList(chartData, name, mode, displayChart, setDisplayChart, workoutDeleteID, setWorkoutDeleteID);

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
        onPress={() => {
          setConfirmDeleteWorkout(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }}
      >
        <Text>Delete Workout</Text>
      </Button>
    );
  }

  // Conditionally render workout delete buttons in workout list2
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
        onLongPress={() => {
          setConfirmDeleteExercise(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }}
      >
        <Text>Hold to Delete {name}</Text>
      </Button>
    );
  }

  // Make main graph for display
  const LifetimeChart = makeBarChart(
    chartData.lifetime.data,
    chartData.lifetime.dates,
    "lifetime"
  );

  if (displayChart !== null) {
    let chart;
    if (displayChart == "cumulative") {
      // line chart
      chart = makeLineChart(chartData.cumulative.data, chartData.lifetime.dates, displayChart);
    } else {
      // bar chart
      chart = makeBarChart(chartData[displayChart].data, chartData[displayChart].dates, displayChart)
    }
    WorkoutsList.forEach((object, index) => {
      if (object && object.key == `${displayChart}-header`) {
        WorkoutsList.splice(index + 1, 0, chart).join();
      }
    });
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
          {LifetimeChart}
          {WorkoutsList}
          <View style={styles.buttons}>{DeleteExerciseButtons}</View>
        </Content>
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

const makeBarChart = (data, XAxisData, key) => {
  if (data && data.length > 1) {
    return (
      <View
        style={{ height: 300, padding: 10, flexDirection: "row" }}
        key={`${key} graph`}
      >
        <YAxis
          data={data}
          style={{ marginBottom: 30 }}
          contentInset={{ top: 10, bottom: 10 }}
          svg={{ fontSize: 10, fill: "grey" }}
          numberOfTicks={6}
          min={0}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <BarChart
            style={{ flex: 1 }}
            data={data}
            contentInset={{ top: 10, bottom: 10 }}
            svg={{ fill: "#2196F3"}}
            gridMin={0}
          >
            <Grid />
          </BarChart>
          <XAxis
            style={{ marginHorizontal: -10, height: 30 }}
            data={XAxisData}
            contentInset={{ left: 10, right: 10 }}
            svg={{ fontSize: 10, fill: "grey" }}
            formatLabel={(value, index) => XAxisData[index]}
            numberOfTicks={4}
          />
        </View>
      </View>
    );
  } else {
    return (
      <Text key="text" style={styles.emptyListText}>
        add more workouts to see this graph
      </Text>
    );
  }
}

// Make custom graph
const makeLineChart = (data, XAxisData, key) => {
  if (data && data.length > 1) {
    return (
      <View
        style={{ height: 300, padding: 10, flexDirection: "row" }}
        key={`${key} graph`}
      >
        <YAxis
          data={data}
          style={{ marginBottom: 30 }}
          contentInset={{ top: 10, bottom: 10 }}
          svg={{ fontSize: 10, fill: "grey" }}
          numberOfTicks={6}
          min={0}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <LineChart
            style={{ flex: 1 }}
            data={data}
            contentInset={{ top: 10, bottom: 10 }}
            svg={{ stroke: "#2196F3" }}
            gridMin={0}
          >
            <Grid />
          </LineChart>
          <XAxis
            style={{ marginHorizontal: -10, height: 30 }}
            data={XAxisData}
            contentInset={{ left: 10, right: 10 }}
            svg={{ fontSize: 10, fill: "grey" }}
            formatLabel={(value, index) => XAxisData[index]}
            numberOfTicks={4}
          />
        </View>
      </View>
    );
  } else {
    return (
      <Text key="text" style={styles.emptyListText}>
        add more workouts to see this graph
      </Text>
    );
  }
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
