import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { SnackbarProvider, withSnackbar } from 'notistack';
import MediaControlCard from './components/BalanceCard';
import axios from 'axios';
import io from 'socket.io-client';
const socket = io.connect('http://localhost:3000', { transports: ['websocket'] });

class App extends React.Component {
  state = {
      message: 'This is a success message!',
      balance: 0,
  }
  componentDidMount = () => {
    socket.on('connect', () => {
        console.log('Connected to socket');
        socket.emit('room', '/BTC/regtest/inv');
        this.handleGetBalance();
        this.handleBlockEvent();
        this.handleTxEvent();
        });
  }

  handleBlockEvent = () => {
    socket.on('block', payload => {
            let message = `Recieved Block Reward ${payload.reward/100000000} BTC at ${new Date(payload.time).toLocaleString()}`;
            this.setState({message: message});
            this.handleClickVariant('success')();
            this.handleGetBalance();
        })
  }

  handleTxEvent = () => {
    socket.on('tx', payload => {
      let message = `Fee of -${payload.fee/100000000} BTC at ${new Date(payload.blockTimeNormalized).toLocaleString()}`;
      this.setState({message: message});
      this.handleClickVariant('error')();
      message = `Recieved ${payload.value/100000000} BTC at ${new Date(payload.blockTimeNormalized).toLocaleString()}`;
      this.setState({message: message});
      this.handleClickVariant('success')();
      this.handleGetBalance();
    })
  }

  handleGetBalance = () => {
    axios.get('http://localhost:3000/api/BTC/regtest/address/mnL48Dja4zP9WU4wN6mwmnyJJLyuzoW88x/balance')
    .then(res => {
      this.setState({balance: res.data.balance/100000000})
    })
  }

  handleClickVariant = variant => () => {
    this.props.enqueueSnackbar(this.state.message, { variant });
  };

  render() {
    return (
      <React.Fragment>
        <Button onClick={this.handleClickVariant('success')}>Generate a Block on Bitcore RegTest!</Button>
        <MediaControlCard balance={this.state.balance} />
      </React.Fragment>
    );
  }
}

App.propTypes = {
  enqueueSnackbar: PropTypes.func.isRequired,
};

const MyApp = withSnackbar(App);

function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={8}>
      <MyApp />
    </SnackbarProvider>
  );
}

export default IntegrationNotistack;