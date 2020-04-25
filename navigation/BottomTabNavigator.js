import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";

import TabBarIcon from "../components/TabBarIcon";
import HomeScreen from "../screens/HomeScreen";
import LinksScreen from "../screens/LinksScreen";
import ExerciseScreen from "../screens/ExerciseScreen";
import AddExerciseScreen from "../screens/AddExerciseScreen";
import ViewExerciseScreen from "../screens/ViewExerciseScreen";
import AddWorkoutScreen from "../screens/AddWorkoutScreen";

const INITIAL_ROUTE_NAME = "ExerciseStack";

const ExerciseStack = createStackNavigator();
function ExerciseStackScreen() {
  return (
    <ExerciseStack.Navigator>
      <ExerciseStack.Screen name="Exercise" component={ExerciseScreen} />
      <ExerciseStack.Screen name="Add Exercise" component={AddExerciseScreen} />
      <ExerciseStack.Screen
        name="View Exercise"
        component={ViewExerciseScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
      <ExerciseStack.Screen name="Add Workout" component={AddWorkoutScreen} />
    </ExerciseStack.Navigator>
  );
}

const BottomTab = createBottomTabNavigator();
export default function BottomTabNavigator({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({ headerTitle: getHeaderTitle(route) });

  return (
    <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Get Started",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="md-code-working" />
          )
        }}
      />
      <BottomTab.Screen
        name="ExerciseStack"
        component={ExerciseStackScreen}
        options={{
          title: "Exercise",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="md-stats" />
          )
        }}
      />
      <BottomTab.Screen
        name="Links"
        component={LinksScreen}
        options={{
          title: "Resources",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="md-book" />
          )
        }}
      />
    </BottomTab.Navigator>
  );
}

function getHeaderTitle(route) {
  const routeName =
    route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;

  switch (routeName) {
    case "Home":
      return "How to get started";
    case "Links":
      return "Links to learn more";
    case "ExerciseStack":
      return "Exercise";
    case "Plant Care":
      return "Plant Care";
  }
}
