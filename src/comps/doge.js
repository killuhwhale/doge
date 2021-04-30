/* Component to display doge data on a chart.
 *
 * Fetches data from the API and creates a chart.
 */
import React, { Component } from 'react'
import { Grid } from '@material-ui/core'
import { withTheme, withStyles } from '@material-ui/core/styles'
import Chart from 'chart.js/auto';

const MAX_WIDTH = 25
const readPhoto = () => {
  /* Reads image data into canvas.
  Returns:
    promise: resolves canvas with original image.

  */
  return new Promise(res => {
    const canvas = document.createElement('canvas');
    let img = new Image();
    img.setAttribute('crossOrigin', 'anonymous')
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      res(canvas);
    }
    img.src = 'https://dogecoin.com/assets/img/dogecoin-300.png'
  })
}

const scaleCanvas = (canvas, scale) => {
  /* Scales the size of a canvas.

  Args:
    canvas: The canvas to resize
    scale: The scale to use during resizing.
  Returns:
    scaledCanvas: A new canvas scaled from the original.
   */
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = canvas.width * scale;
  scaledCanvas.height = canvas.height * scale;

  scaledCanvas
    .getContext('2d')
    .drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

  return scaledCanvas;
};

let resizePhoto = () => {
  /* Resizes photo.

  Returns resized image. Currently image url is hardcoded in readPhoto().

  Returns:
    promise: resolves resized photo.
  */
  return new Promise((resolve) => {
    readPhoto().then(canvas => {
      while (canvas.width >= 2 * MAX_WIDTH) {
        canvas = scaleCanvas(canvas, .5);
      }

      if (canvas.width > MAX_WIDTH) {
        canvas = scaleCanvas(canvas, MAX_WIDTH / canvas.width);
      }

      let image = new Image();
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = canvas.toDataURL()
      resolve(image)
    })
  })
}

// A dataPoint represents the data for each day.
let dataPoint = () => {
  return { price: 0, tweets: [], date: null}
}

class Doge extends Component {
  constructor(props){
    super(props)
    this.state = {
        prices: [],  // list of doge coin prices from API
        tweets: [],  // list of tweets from API
        mergedData: {}  // Object of combined prices and tweets on key: ts
    }
  }

  componentDidMount(){
    /* Gets prices and tweets from API.

    Gets and combines data from API.
     */
    this.fetchDoge()
    .then( prices => {
      this.fetchTweets(prices)
      .then(tweets => {
        // Merges prices and tweets on timestamps.
        let mergedData = {}
        for(let price of prices){
          let dp = dataPoint()
          dp['price'] = price.price
          dp['date'] = new Date(price.ts*1000)
          mergedData[price.ts] = dp
        }

        for(let tweet of tweets){
          // if ts already exists
          if(Object.keys(mergedData).indexOf(tweet.ts.toString()) >= 0){
            mergedData[tweet.ts]['tweets'].push(tweet.tweet)
          }else{
            let dp = dataPoint()
            dp['date'] = new Date(tweet.ts*1000)
            dp['tweets'].push(tweet.tweet)
            mergedData[tweet.ts] = dp
          }
        }

        let timestamps = []
        let data = []
        // Extract data and labels
        for(let ts of Object.keys(mergedData)){
          let dp = mergedData[ts]
          timestamps.push(ts)
          data.push(dp)
        }
        console.log(mergedData)

        this.createChart(timestamps, data)
        this.setState({
          tweets: tweets,
          prices: prices,
          mergedData: mergedData
        })
      })
    })
  }

  fetchDoge(){
    return new Promise((res, rej) => {
      let isLocal = window.location.href.indexOf("localhost") > -1;
      let url = (!isLocal)? "https://dogec01n.herokuapp.com/doge/": "http://localhost:8000/doge/"
      fetch(url)
      .then(response => response.json())
      .then(data => {
          res(data)
      })
      .catch(err => {
          console.log(err)
      })
    })
  }

  fetchTweets(prices){
    return new Promise((res, rej) => {
      const isLocal = window.location.href.indexOf("localhost") > -1
      const url = (!isLocal)? "https://dogec01n.herokuapp.com/tweets/": "http://localhost:8000/tweets/"
      fetch(url)
      .then(response => response.json())
      .then(data => {
        res(data)
      })
      .catch(err => {
          console.log(err)
      })
    })
  }

  createChart(timestamps, data){
    /* Creates a chart to display doge data.

    Displays Tweets and doge coin price on a chart.

    Args:
      timestamps: A list of ts of the day corresponding to the data.
      data: A list of data points; tweets and price

    */
    let tweets = data.map(dp => dp['tweets'])
    let ctx = document.getElementById('chart').getContext('2d');

    this.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps.map(ts => {
              return new Date(ts*1000).toLocaleDateString()
            }),
            datasets: [{
                label: 'Doge launched by Elon',
                data: data.map(dp => dp['price']),
                borderWidth: 3,
                borderColor: 'rgb(75, 192, 192)',
                pointStyle: 'rectRot',
                // Size of radius
                pointRadius: (context) => {
                  return tweets[context.dataIndex].length > 0 ?
                    15:
                    1;
                },
                // Size of width
                pointBorderWidth: (context) => {
                  return tweets[context.dataIndex].length > 0 ?
                    5:
                    1;
                },
                // Size of hover target area
                pointHitRadius: (context) => {
                  return tweets[context.dataIndex].length > 0 ?
                    5:
                    1;
                }

            }]
        },
        options: {
          scales: {
            y: {
                grid: {
                  color: 'blue'
                },
                ticks: {
                    color: "green",
                },
                title: {
                  display: true,
                  text: 'Price',
                  color: 'green',
                  font: {
                    family: 'Roboto',
                    size: 20,
                    weight: 'bold',
                    lineHeight: 1.2,
                  },
                  padding: {top: 20, left: 0, right: 0, bottom: 0}
                }
            },
            x: {
              grid: {
                color: 'blue'
              },
              ticks: {
                  color: "blue",
              },
              title: {
                display: true,
                text: 'To the moon #doge42069',
                color: 'blue',
                font: {
                  family: 'Roboto',
                  size: 20,
                  weight: 'bold',
                  lineHeight: 1.2,
                },
                padding: {top: 20, left: 0, right: 0, bottom: 0}
              }
            }
          },
          plugins: {
            tooltip: {
              enabled: true,
              usePointStyle: true,
              filter: (context) => {
                return tweets[context.dataIndex].length > 0
              },
              callbacks: {
                title: (context) =>  {
                  return context[0] != null?context[0].label: ""
                },
                label: (context) =>  {
                  return tweets[context.dataIndex].length > 0 ?
                    tweets[context.dataIndex]:
                    "";
                },
                labelColor: function(context) {
                  let tweetColor = {
                    borderColor: 'rgb(0, 0, 255)',
                    backgroundColor: 'rgb(0, 0, 255)',
                    borderWidth: 2,
                    borderDash: [2, 2],
                    borderRadius: 2,
                  }
                  let defaultColor = {
                    borderColor: 'rgb(255, 0, 0)',
                    backgroundColor: 'rgb(255, 0, 0)',
                    borderWidth: 2,
                    borderDash: [2, 2],
                    borderRadius: 2,
                  }
                  return  tweets[context.dataIndex].length > 0 ?
                    tweetColor:
                    defaultColor
                },
              }
            },
            legend: {
              labels: {
                usePointStyle: true,
              },
            }
          }
        }
    })

    // Resizes icon image then updates the chart.
    resizePhoto().then(image => {
      this.chart.data.datasets[0].pointStyle = (context) => {
        return tweets[context.dataIndex].length > 0 ?
          image:
          'circle';
      }
      this.chart.update();
    })
  }

  render(){
      return(
        <Grid item container align="center" alignItems="center" xs={12}>
            <Grid item xs={2}></Grid>
            <Grid item xs={8}>
              <canvas id="chart"></canvas>
            </Grid>
        </Grid>
      )
  }
}

export default Doge = withTheme(Doge);