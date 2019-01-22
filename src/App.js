import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { SnackbarProvider, withSnackbar } from 'notistack';
import io from 'socket.io-client';
const socket = io.connect('http://localhost:3000', { transports: ['websocket'] });

class App extends React.Component {
  state = {
      message: 'This is a success message!'
  }
  componentDidMount = () => {
    socket.on('connect', () => {
        console.log('Connected to socket');
        socket.emit('room', '/BTC/regtest/inv');
        this.streamEvent();
        });
  }

  streamEvent = () => {
    socket.on('block', payload => {
            let message = `Recieved ${payload.reward/100000000} BTC at ${new Date(payload.time).toLocaleString()}`;
            this.setState({message: message});
            this.handleClickVariant('success')();
        })
  }

  handleClickVariant = variant => () => {
    this.props.enqueueSnackbar(this.state.message, { variant });
  };

  render() {
    return (
      <React.Fragment>
        <Button onClick={this.handleClickVariant('success')}>Generate a Block on Bitcore RegTest!</Button>
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