import Head from 'next/head'
import React from 'react'
import api from '../src/server/endpoints';
import * as util from '../src/global/util';

export default class Generate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRunning: false,
      workouts: [],
      progress: null,
      selected: [],
    };
  }

  render() {
    return <div className="container">
      <Head>
        <title>Workout</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="horizontal">
          <div className="vertical">
            {
              !this.state.isRunning ? <button
                onClick={async () => {
                  const workoutCount = await api.StartGenerator.call('back_day', 5, 45);
                  this.setState({
                    isRunning: true,
                    workouts: new Array(workoutCount).fill(null)
                  });
                  this.getProgress();
                }}
                type="button"
              >
              Start
              </button> : null
            }
            {
              this.state.workouts.map((_, i) => this.renderWorkout(i))
            }
          </div>
          {
            this.state.workouts[0] && this.state.progress ? <div className="vertical">
              {
                renderWorkoutStats(this.state.workouts[0], this.state.progress)
              }
            </div> : null
          }
        </div>
      </main>

      <style jsx>{`
        .horizontal {
          flex: 1 1 0;
          display: flex;
        }

        .vertical {
          flex: 1 1 0;
          display: flex;
        }
      `}</style>
    </div>;
  }

  renderWorkout(i) {
    return <span>
      {
        this.state.isRunning ? <button
          onClick={async () => {
            const workout = await api.GenerateNext.call(i, []);
            if (workout) {
              const workoutObj = {
                time: util.timeString(workout.time),
                intensity: workout.intensity.toFixed(1),
                sets: `${workout.sets}`.split(','),
                activity: workout.activity.getMap()
              };
              this.state.workouts.splice(i, 1, workoutObj);
              this.setState({
                workouts: this.state.workouts
              });
            }
          }}
          type="button"
        >
        Next
        </button> : null
      }
      {
        this.state.workouts[i] ? this.renderWorkoutSets(i) : null
      }
    </span>;
  }

  renderWorkoutSets(i) {
    return <ol key="{i}">
      {
        this.state.workouts[i].sets.map((s, i) => <li key="{i}">{ s }</li>)
      }
    </ol>;
  }

  async getProgress() {
    const progress = await api.GetProgress.call(0);
    this.setState({ progress });
    setTimeout(() => this.getProgress(), 500);
  }
}

function renderWorkoutStats(workout, progress) {
  return <ul>
    <li>{ workout.time }</li>
    <li>{ workout.intensity }</li>
    <li></li>
    {
      activityToList(workout.activity).map(a => <li>{ a }</li>)
    }
    <li></li>
    <li>{ `generated${progress.isDone ? ' all' : ''} ${progress.generated}` }</li>
    <li>{ `remaining ${progress.filtered}` }</li>
  </ul>;
}

function activityToList(activity) {
  return Object.keys(activity)
    .sort((a, b) => activity[b] - activity[a])
    .map(key => `${key}: ${activity[key]}`);
}
