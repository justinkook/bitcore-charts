# Bitcore Notification Demo
BitPay Demo for TabConf 2019 using Create React App, Material-UI, and Bitcore-Node

How to use Bitcoin-node's sockets and API endpoints to create a payment notification system.

## Prerequisites 

[Node.js](https://nodejs.org/en/download/)

[MongoDB Installed](https://www.mongodb.com/download-center?jmp=nav)

[Set up Bitcore-Node](https://github.com/bitpay/bitcore/blob/master/packages/bitcore-node/docs/wallet-guide.md)

[Download Bitcoin-Core Client](https://bitcoin.org/en/download)

## Getting Started

**Install create-react-app**

```
npm install -g create-react-app
```

NPM packages used:

* **@material-ui/core** - *For Material-UI components*

* **@material-ui/icons** - *Icons from Material-UI*

* **notistack** - *Stacked snackbars*

* **axios** - *To GET Bitcore-node APIs*

* **socket.io-client** - *To use Bitcore-node sockets*

**Create a create-react-app called bitpay-demo and install the npm packages above**

```
create-react-app bitpay-demo
yarn add @material-ui/core @material-ui/icons notistack axios socket.io-client
```

**Add proxy settings to connect to Bitcore Node and change start script PORT=3006 in package.json**

```
{
  "name": "bitcore-charts",
  "version": "0.1.0",
  "private": false,
  "proxy": "http://localhost:3000",
  "dependencies": {
    "@material-ui/core": "^3.9.0",
    "@material-ui/icons": "^3.0.2",
    "axios": "^0.18.0",
    "notistack": "^0.4.1",
    "react": "^16.7.0",
    "react-dom": "^16.7.0",
    "react-scripts": "2.1.3",
    "socket.io-client": "^2.2.0"
  },
  "scripts": {
    "start": "PORT=3006 react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
```

**Delete all the files inside src folder except index.js and App.js.**

**We are going to use Material-UI component demos to quickly make a nice notification system.**

## Get your notistack snack here
[Material-UI notistack Snackbar Component](https://material-ui.com/demos/snackbars/#notistack)

**Copy the notistack component into App.js.**

**Update index.js to render IntegrationNotistack component**

```
import React from 'react';
import ReactDOM from 'react-dom';
import IntegrationNotistack from './App';

ReactDOM.render(<IntegrationNotistack />, document.getElementById('root'));
```

## Import the additional dependencies in App.js

```
import axios from 'axios';
import io from 'socket.io-client';
const socket = io.connect('http://localhost:3000', { transports: ['websocket'] });
```

## Initialize State

Under ```class App extends React.Component```

```
state = {
    message: 'This is a success message!',
    balance: 0,
}
```

**In the handleClickVariant function, change the static notification message to dynamically render based on the message state that we set above.**

```
handleClickVariant = variant => () => {
    this.props.enqueueSnackbar(this.state.message, { variant });
};
```

**Change 'warning' to 'success' and edit the button text.**

```
<Button onClick={this.handleClickVariant('success')}>Generate a Block on Bitcore RegTest!</Button>
```

**Create a function called componentDidMount that connects to the Bitcore-node socket when the page is loaded.**

```
componentDidMount = () => {
    socket.on('connect', () => {
        console.log('Connected to socket');
        socket.emit('room', '/BTC/regtest/inv');
    });
}
```

**Next create a function called handleBlockEvent to get a block object from the Bitcore-node socket when a block is generated. The socket event name is 'block'.**

> Update the message in state to the block reward recieved using setState() function, then call the handleClickVariant function to trigger the notification.

```
handleBlockEvent = () => {
    socket.on('block', block => {
        let message = `Recieved Block Reward ${block.reward/100000000} BTC at ${new Date(block.time).toLocaleString()}`;
        this.setState({message});
        this.handleClickVariant('success')();
    })
}
```

**Try to generate some blocks in the __Bitcoin Core debug console__ to see the notification!**

```
generate 3
```

**Next subscribe to the 'tx' socket to get data on a transaction payment, update the message state, then trigger the notification.**

```
handleTxEvent = () => {
    socket.on('tx', payload => {
      let message = `Fee of -${payload.fee/100000000} BTC at ${new Date(payload.blockTimeNormalized).toLocaleString()}`;
      this.setState({message: message});
      this.handleClickVariant('error')();
      message = `Recieved ${payload.value/100000000} BTC at ${new Date(payload.blockTimeNormalized.toLocaleString()}`;
      this.setState({message: message});
      this.handleClickVariant('success')();
    })
}
```

**Update componentDidMount to call handleTxEvent() and handleBlockEvent() on page load.**

```
componentDidMount = () => {
    socket.on('connect', () => {
        console.log('Connected to socket');
        socket.emit('room', '/BTC/regtest/inv');
        this.handleBlockEvent();
        this.handleTxEvent();
    });
}
```

**You should have a working notification system!!**

[Link to finished App.js](./src/App.js)

## Using Bitcore-node API

**Using axios, call a GET request to get the balance of an address. Then update the balance in state using setState().**

To get your address in Bitcoin-core -> debug console

```
getaccountaddress ""
```

> Change {your-address-here} to the account address.

```
handleGetBalance = () => {
    axios.get('http://localhost:3000/api/BTC/regtest/address/{your-address-here}/balance')
    .then(res => {
      this.setState({balance: res.data.balance/100000000})
    })
  }
```

