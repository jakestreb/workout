import Head from 'next/head'
import React from 'react'
import api from '../src/server/endpoints';
import * as util from '../src/global/util';

export default class Generate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRunning: false,
      workout: null,
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
                  await api.StartGenerator.call('back_day', 5, 45);
                  this.setState({ isRunning: true });
                  this.getProgress();
                }}
                type="button"
              >
              Start
              </button> : null
            }
            {
              this.state.isRunning ? <button
                onClick={async () => {
                  const workout = await api.GenerateNext.call(0, []);
                  if (workout) {
                    this.setState({
                      workout: {
                        time: util.timeString(workout.time),
                        intensity: workout.intensity.toFixed(1),
                        sets: `${workout.sets}`.split(','),
                        activity: workout.activity.getMap()
                      }
                    });
                  }
                }}
                type="button"
              >
              Next
              </button> : null
            }
            {
              this.state.workout ? renderWorkout(this.state.workout) : null
            }
          </div>
          {
            this.state.workout && this.state.progress ? <div className="vertical">
              {
                renderWorkoutStats(this.state.workout, this.state.progress)
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

  async getProgress() {
    const progress = await api.GetProgress.call(0);
    this.setState({ progress });
    setTimeout(() => this.getProgress(), 500);
  }
}

function renderWorkout(workout) {
  return <ol>
    {
      workout.sets.map(s => <li>{ s }</li>)
    }
  </ol>;
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
