import React, { Component } from 'react';
import ReactApexChart from 'react-apexcharts';
import io from 'socket.io-client';
const socket = io.connect('http://localhost:3000', { transports: ['websocket'] });

let day1 = new Date();
day1.setDate(day1.getDay() - 1);

let day6 = new Date();
day6.setDate(day6.getDay() - 6);

let day12 = new Date();
day12.setDate(day12.getDay() - 12);

class App extends Component {

        state = {
            selection: 'one_day',
            options: {
                annotations: {
                },
                dataLabels: {
                    enabled: false
                },
                markers: {
                    size: 0,
                    style: 'hollow',
                },
                yaxis: {
                    labels: {
                        formatter: function (value) {
                            return value;
                        }
                    },
                },
                xaxis: {
                    type: 'datetime',
                    min: day1.getTime(),
                    max: new Date().getTime(),
                    tickAmount: 6,
                },
                tooltip: {
                    x: {
                        format: 'dd MMM yyyy'
                    }
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.9,
                        stops: [0, 100]
                    }
                }
            },
            series: [{
                name: 'BTC',
                data: [{ x: day12, y: 2324 }, { x: day6, y: 1731 }, { x: day1, y: 1133 }, { x: new Date(), y: 841 }]
            }],
        }

    componentDidMount = () => {
      socket.on('connect', () => {
        console.log('Connected to socket');
        socket.emit('room', '/BTC/regtest/inv');
        this.getBalance()
      });
    }

    getBalance = () => {
      let array = [{ x: day12, y: 2324 }, { x: day6, y: 1731 }, { x: day1, y: 1133 }, { x: new Date(), y: 841 }];
      socket.on('block', payload => {
        array.push({x: new Date(payload.time), y: payload.reward/100000000});
        this.setState({series: [{ data: array }] })
      });
    }

    componentWillUnmount = () => {
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }

    updateData(timeline) {
        this.setState({
            selection: timeline
        })

        switch (timeline) {
            case 'one_day':
                this.setState({
                    options: {
                        xaxis: {
                            min: day1.getTime(),
                            max: new Date().getTime(),
                        }
                    }
                })
                break;
            case 'six_days':
                this.setState({
                    options: {
                        xaxis: {
                            min: day6.getTime(),
                            max: new Date().getTime(),
                        }
                    }
                })
                break;
            case 'twelve_days':
                this.setState({
                    options: {
                        xaxis: {
                            min: day12.getTime(),
                            max: new Date().getTime(),
                        }
                    }
                })
                break;
            default:
        }
    }

    render() {

        return (
            <div id="chart">
                <div className="toolbar">
                    <button onClick={() => {this.updateData('one_day'); this.getBalance(1)}} id="one_day" className={(this.state.selection === 'one_day' ? 'active' : '')}>1D</button>
                    <button onClick={() => {this.updateData('six_days'); this.getBalance(6)}} id="six_days" className={(this.state.selection === 'six_days' ? 'active' : '')}>6D</button>
                    <button onClick={() => {this.updateData('twelve_days'); this.getBalance(12)}} id="twelve_days" className={(this.state.selection === 'twelve_days' ? 'active' : '')}>12D</button>
                </div>
                <ReactApexChart options={this.state.options} series={this.state.series} type="area" height="350" />
            </div>
        );
    }
}

export default App;