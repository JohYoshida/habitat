import * as React from "react";
import {ListItem, Input} from "react-native-elements";

const moment = require("moment");

function assembleChartData(workouts) {
  workouts.reverse();
  const charts = {
    // bar chart or goal progress bar?
    today: {
      data: [],
      dates: [],
      total: 0
    },
    // bar chart
    thisWeek: {
      data: [],
      dates: [],
      total: 0
    },
    // bar chart
    thisMonth: {
      data: [],
      dates: [],
      total: 0
    },
    // bar chart
    lifetime: {
      data: [],
      dates: [],
      total: 0
    },
    // line chart
    cumulative: {
      data: [],
      total: 0
    },
    workoutsList: []
  };

  const todayList = ["Today"];
  const thisWeekList = ["This Week"];
  const thisMonthList = ["This Month"];

  workouts.forEach((workout, index) => {
    // Calculate difference in days between workout and now
    const diff = moment()
      .startOf("day")
      .diff(moment(workout.createdAt).startOf("day"), "days");
    let amount = calculateAmount(workout);

    // Insert data for lifetime chart
    charts.lifetime.total += amount;
    if (!charts.lifetime.data[diff]) {
      charts.lifetime.data[diff] = amount;
      charts.lifetime.dates[diff] = moment(workout.createdAt).format(
        "MM-DD-YYYY"
      );
    } else {
      charts.lifetime.data[diff] += amount;
    }

    // Insert data for today, thisWeek, thisMonth charts and lists
    if (diff == 0) {
      // Today
      charts.today.total += amount;
      charts.today.data.push(amount);
      let time = moment(workout.createdAt).format("hh:mm");
      charts.today.dates.push(time);
      // Add to list
      todayList.push(workout);
    }
    if (diff < 7) {
      // This week
      charts.thisWeek.total += amount;
      let data = charts.thisWeek.data;
      if (!data[diff]) {
        data[diff] = amount;
        let date = moment(workout.createdAt).format("MMM Do");
        charts.thisWeek.dates[diff] = date;
      } else {
        data[diff] += amount;
      }
      // Add to list
      if (diff != 0) {
        thisWeekList.push(workout);
      }
    }
    if (diff < 30) {
      // This month
      charts.thisMonth.total += amount;
      let data = charts.thisMonth.data;
      if (!data[diff]) {
        data[diff] = amount;
        let date = moment(workout.createdAt).format("MMM Do");
        charts.thisMonth.dates[diff] = date;
      } else {
        data[diff] += amount;
      }

      if (diff >= 7) {
        thisMonthList.push(workout);
      }
    }
  });

  // Replace nulls with zeroes
  cleanup(charts.cumulative, "MM-DD-YYYY");
  cleanup(charts.lifetime, "MM-DD-YYYY");
  cleanup(charts.thisWeek, "MMM Do");
  cleanup(charts.thisMonth, "MMM Do");
  // cleanup(charts.cumulative.data);
  // cleanup(charts.lifetime.data);
  // cleanup(charts.thisWeek.data);
  // cleanup(charts.thisMonth.data);
  // cleanup(charts.lifetime.dates);
  // cleanup(charts.thisWeek.dates);
  // cleanup(charts.thisMonth.dates);

  // Reverse order of data
  charts.today.data.reverse();
  charts.thisWeek.data.reverse();
  charts.thisWeek.dates.reverse();
  charts.thisMonth.data.reverse();
  charts.thisMonth.dates.reverse();
  charts.lifetime.data.reverse();
  charts.lifetime.dates.reverse();

  // Insert data for cumulative chart
  let cumulativeData = charts.cumulative.data;
  charts.lifetime.data.forEach((value, index) => {
    charts.cumulative.total = charts.lifetime.total;
    if (!cumulativeData[index]) {
      if (cumulativeData[index - 1]) {
        cumulativeData[index] = cumulativeData[index - 1] + value;
      } else {
        cumulativeData[index] = value;
      }
    } else {
      cumulativeData[index] += value;
    }
  });

  // Concatenate workout lists
  charts.workoutsList = todayList.concat(thisWeekList, thisMonthList);
  // Add cumulative marker
  charts.workoutsList.push("Cumulative");
  return charts;
}

// Calculate amount
function calculateAmount(workout) {
  let amount;
  if (workout.seconds) {
    amount = workout.seconds;
  } else {
    amount = workout.reps * workout.sets;
  }
  return amount;
}

// Remove null values and replace with zeroes or dates
function cleanup(dataset, format) {
  for (var i = 0; i < dataset.data.length; i++) {
    if (!dataset.data[i]) {
      dataset.data[i] = 0;
      if (dataset.dates) {
        dataset.dates[i] = moment()
        .subtract(i, "days")
        .format(format);;
      }
    }
  }
}

function assembleWorkoutsList(chartData, name, mode, displayChart, setDisplayChart, workoutDeleteID, setWorkoutDeleteID) {
  const WorkoutsList = [];
  chartData.workoutsList.forEach(item => {
    if (item == "Today") {
      let title = assembleTitle(mode, chartData.today.total, name);
      WorkoutsList.push(
        <ListItem
          key="today-header"
          title="Today"
          topDivider={true}
          bottomDivider={true}
          rightTitle={title}
          onPress={() => {
            if (displayChart === "today") {
              setDisplayChart(null);
            } else {
              setDisplayChart("today");
            }
          }}
        />
      );
    } else if (item == "This Week") {
      let title = assembleTitle(mode, chartData.thisWeek.total, name);
      WorkoutsList.push(
        <ListItem
          key="thisWeek-header"
          title="This Week"
          topDivider={true}
          bottomDivider={true}
          rightTitle={title}
          onPress={() => {
            if (displayChart === "thisWeek") {
              setDisplayChart(null);
            } else {
              setDisplayChart("thisWeek");
            }
          }}
        />
      );
    } else if (item == "This Month") {
      let title = assembleTitle(mode, chartData.thisMonth.total, name);
      WorkoutsList.push(
        <ListItem
          key="thisMonth-header"
          title="This Month"
          topDivider={true}
          bottomDivider={true}
          rightTitle={title}
          onPress={() => {
            if (displayChart === "thisMonth") {
              setDisplayChart(null);
            } else {
              setDisplayChart("thisMonth");
            }
          }}
        />
      );
    } else if (item == "Cumulative") {
      let title = assembleTitle(mode, chartData.cumulative.total, name);
      WorkoutsList.push(
        <ListItem
          key="cumulative-header"
          title="Cumulative"
          topDivider={true}
          bottomDivider={true}
          rightTitle={title}
          onPress={() => {
            if (displayChart === "cumulative") {
              setDisplayChart(null);
            } else {
              setDisplayChart("cumulative");
            }
          }}
        />
      );
    } else {
      let title;
      let timestamp = moment(item.createdAt).format("h:mm a MM-DD-YYYY");
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

  return WorkoutsList;
}

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

export {assembleChartData, assembleWorkoutsList};
