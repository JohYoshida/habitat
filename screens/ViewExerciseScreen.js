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
import { LineChart, Grid, XAxis, YAxis } from "react-native-svg-charts";
import * as shape from "d3-shape";
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
  const [yesterdayIndex, setYesterdayIndex] = React.useState([]);

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

  // Hooks for list
  const [listData, setListData] = React.useState([]);

  // Hooks for graph
  const [graphData, setGraphData] = React.useState({
    main: { data: [], dates: [] },
    today: { data: [], dates: [] },
    yesterday: { data: [], dates: [] },
    thisWeek: { data: [], dates: [] }
  });
  const [displayGraph, setDisplayGraph] = React.useState(null);

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
        assembleData(data);
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

  // Assemble data for lists and graphs
  const assembleData = workouts => {
    const main = {
      data: [],
      dates: []
    };
    const today = {
      data: [],
      cumulative: [],
      dates: []
    };
    const yesterday = {
      data: [],
      cumulative: [],
      dates: []
    };
    const thisWeek = {
      data: [],
      cumulative: [],
      dates: []
    };
    const lifetime = {
      data: [],
      cumulative: [],
      dates: []
    };
    let workoutList = [];
    const todayList = [];
    const yesterdayList = [];
    const thisWeekList = [];
    const name = props.route.params.exercise.name.toLowerCase();
    const mode = props.route.params.exercise.mode;
    let place = "today";
    workouts.forEach((workout, index) => {
      let diff = moment()
        .startOf("day")
        .diff(moment(workout.createdAt).startOf("day"), "days");
      let timestamp = moment(workout.createdAt).format("h:mm a MM-DD-YYYY");
      // Calculate amount
      let amount;
      if (workout.seconds) {
        amount = workout.seconds;
      } else {
        amount = workout.reps * workout.sets;
      }
      // Insert data into graphData main array
      if (!main.data[diff]) {
        main.data[diff] = amount;
        main.dates[diff] = moment(workout.createdAt).format("MM-DD-YYYY");
      } else {
        main.data[diff] += amount;
      }
      // Insert data into graphData secondary arrays
      let title;
      if (diff === 0) {
        // Today
        today.data[index] = amount;
        today.cumulative[index - 1]
          ? (today.cumulative[index] = amount + today.cumulative[index - 1])
          : (today.cumulative[index] = amount);
        today.dates[index] = moment(workout.createdAt).format("hh:mm");
        todayList.push(workout);
      } else if (diff === 1) {
        // Yesterday
        yesterday.data[index] = amount;
        yesterday.cumulative[index - 1]
          ? (yesterday.cumulative[index] =
              amount + yesterday.cumulative[index - 1])
          : (yesterday.cumulative[index] = amount);
        yesterday.dates[index] = moment(workout.createdAt).format("hh:mm");
        yesterdayList.push(workout);
      } else if (diff < 7) {
        thisWeekList.push(workout);
      }
      if (diff < 7) {
        // This week
        thisWeek.data[index] = amount;
        thisWeek.cumulative[index - 1]
          ? (thisWeek.cumulative[index] =
              amount + thisWeek.cumulative[index - 1])
          : (thisWeek.cumulative[index] = amount);
        thisWeek.dates[index] = moment(workout.createdAt).format("MM-DD-YYYY");
      }
      // Lifetime
      lifetime.data[index] = amount;
      lifetime.cumulative[index - 1]
        ? (lifetime.cumulative[index] = amount + lifetime.cumulative[index - 1])
        : (lifetime.cumulative[index] = amount);
      lifetime.dates[index] = moment(workout.createdAt).format("MM-DD-YYYY");
    });
    for (var i = 0; i < main.data.length; i++) {
      if (!main.data[i]) {
        main.data[i] = 0;
        main.dates[i] = moment()
          .subtract(i, "days")
          .format("MM-DD-YY");
      }
    }
    // Reverse main graph datasets
    main.data.reverse();
    main.dates.reverse();
    let finalData = { main, today, yesterday, thisWeek, lifetime };
    // Filter out undefined entries
    for (var array in finalData) {
      if (finalData.hasOwnProperty(array)) {
        for (var list in finalData[array]) {
          if (finalData[array].hasOwnProperty(list)) {
            finalData[array][list] = finalData[array][list].filter(n => {
              if (n === 0) {
                return true;
              } else {
                return n;
              }
            });
          }
        }
      }
    }
    // Add titles to lists
    todayList.push("Today");
    yesterdayList.push("Yesterday");
    thisWeekList.push("This Week");
    // Combine lists
    workoutList = [].concat(yesterdayList.reverse(), thisWeekList.reverse());
    workoutList = [].concat(todayList.reverse(), workoutList);
    workoutList.push("Lifetime");
    // Update state
    setGraphData(finalData);
    setListData(workoutList);
  };

  // Assemble workouts list
  const WorkoutsList = [];
  const name = props.route.params.exercise.name.toLowerCase();
  const mode = props.route.params.exercise.mode;
  listData.forEach((item, index) => {
    let timestamp = moment(item.createdAt).format("h:mm a MM-DD-YYYY");
    let title;
    if (item === "Today") {
      let todayTitle = assembleTitle(
        mode,
        graphData.main.data.slice().reverse()[0],
        name
      );
      WorkoutsList.push(
        <ListItem
          key="today"
          title="Today"
          topDivider={true}
          bottomDivider={true}
          rightTitle={todayTitle}
          onPress={() => {
            if (displayGraph === "today") {
              setDisplayGraph(null);
            } else {
              setDisplayGraph("today");
            }
          }}
        />
      );
    } else if (item === "Yesterday") {
      let yesterdayTitle = assembleTitle(
        mode,
        graphData.main.data.slice().reverse()[1],
        name
      );
      WorkoutsList.push(
        <ListItem
          key="yesterday"
          title="Yesterday"
          topDivider={true}
          bottomDivider={true}
          rightTitle={yesterdayTitle}
          onPress={() => {
            if (displayGraph === "yesterday") {
              setDisplayGraph(null);
            } else {
              setDisplayGraph("yesterday");
            }
          }}
        />
      );
    } else if (item === "This Week") {
      let thisWeekTotal = graphData.thisWeek.data.reduce((a, b) => a + b, 0);
      let thisWeekTitle = assembleTitle(mode, thisWeekTotal, name);
      WorkoutsList.push(
        <ListItem
          key="thisWeek"
          title="This Week"
          topDivider={true}
          bottomDivider={true}
          rightTitle={thisWeekTitle}
          onPress={() => {
            if (displayGraph === "thisWeek") {
              setDisplayGraph(null);
            } else {
              setDisplayGraph("thisWeek");
            }
          }}
        />
      );
    } else if (item === "Lifetime") {
      let lifetimeTotal_2 = graphData.lifetime.data.reduce((a, b) => a + b, 0);
      let lifetimeTitle = assembleTitle(mode, lifetimeTotal_2, name);
      WorkoutsList.push(
        <ListItem
          key="lifetime"
          title="Lifetime"
          topDivider={true}
          bottomDivider={true}
          rightTitle={lifetimeTitle}
          onPress={() => {
            if (displayGraph === "lifetime") {
              setDisplayGraph(null);
            } else {
              setDisplayGraph("lifetime");
            }
          }}
        />
      );
    } else {
      if (mode === "time") title = assembleTitle(mode, item.seconds, name);
      else title = assembleTitle(mode, item.reps * item.sets, name);
      WorkoutsList.push(
        <ListItem
          key={item.id}
          title={
            mode === "time"
              ? `${item.seconds} seconds`
              : `${item.reps} reps, ${item.sets} sets`
          }
          rightTitle={title}
          subtitle={timestamp}
          onPress={() => {
            if (item.id === workoutDeleteID) {
              setWorkoutDeleteID(null);
            } else {
              setWorkoutDeleteID(item.id);
            }
          }}
        />
      );
    }
  });

  // Conditionally display workouts list, empty list text, or loading spinner
  let ListDisplay;
  if (workouts.length === 0) {
    ListDisplay = (
      <Text style={styles.emptyListText}>
        workouts you add will appear here
      </Text>
    );
    // } else ListDisplay = WorkoutsList;
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
  const MainGraph = makeGraph(
    graphData.main.data,
    graphData.main.dates,
    "main"
  );

  // Conditionally render secondary graphs in WorkoutsList
  if (displayGraph !== null) {
    let { cumulative, dates } = graphData[displayGraph];
    let graph = makeGraph(cumulative, dates, displayGraph);
    WorkoutsList.forEach((object, index) => {
      if (object && object.key === displayGraph) {
        WorkoutsList.splice(index + 1, 0, graph).join();
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
          {MainGraph}
          {ListDisplay}
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

// Make custom graph
const makeGraph = (data, XAxisData, key) => {
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
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <LineChart
            style={{ flex: 1 }}
            data={data}
            contentInset={{ top: 10, bottom: 10 }}
            svg={{ stroke: "#2196F3" }}
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
