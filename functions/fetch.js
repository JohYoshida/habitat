import { URL } from "../constants/URLs";

// Get a particular exercise from server
function fetchExercise(id) {
  return new Promise(resolve => {
    fetch(`${URL}/exercise/${id}`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(json => {
        resolve(json.data);
      });
  });
}

// Get all exercises from server
function fetchExercises() {
  return new Promise(resolve => {
    fetch(`${URL}/exercises`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(json => {
        resolve(json.data);
      });
  });
}

function postExercise(name, mode) {
  return new Promise(resolve => {
    fetch(`${URL}/exercise`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name, mode
      })
    })
      .then(() => resolve());
  });
}

// Delete a particular exercise by id
function deleteExercise(id, name) {
  return new Promise(resolve => {
    fetch(`${URL}/exercise`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "DELETE"
      },
      body: JSON.stringify({ id, name })
    })
      .then(() => resolve());
  });
}

// Get all workouts for an exercise from server
function fetchWorkouts(exercise_id) {
  return new Promise(resolve => {
    fetch(`${URL}/workouts/${exercise_id}`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(json => {
        resolve(json.data);
      });
  });
}

function postWorkout(body) {
  return new Promise(resolve => {
    fetch(`${URL}/workout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body
    })
      .then(() => resolve());
  });
}

function deleteWorkout(id, exercise_id, amount) {
  return new Promise(resolve => {
    fetch(`${URL}/workout`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "DELETE"
      },
      body: JSON.stringify({
        id,
        exercise_id,
        amount
      })
    })
    .then(() => resolve());
  })
}

export { fetchExercise, postExercise, deleteExercise, fetchExercises, fetchWorkouts, postWorkout, deleteWorkout };
