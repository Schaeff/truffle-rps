// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Bluebird makes promises easier
import { default as Promise } from 'bluebird'

// Import libraries we need.
import {
  default as Web3
} from 'web3';

// The contract helper lib
import {
  default as contract
} from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import rps_artifacts from '../../build/contracts/RPS.json'

// RPS is our usable abstraction, which we'll use through the code below.
var RPS = contract(rps_artifacts);

var accounts;
var account;
// The index of the current account we're controlling in the list of accounts
var index = 0;

const choice2choiceArg = {
  none: 0,
  rock: 1,
  paper: 2,
  scissors: 3
}

const choiceArg2choice = {
  0: 'none',
  1: 'rock',
  2: 'paper',
  3: 'scissors'
}

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the RPS abstraction for Use.
    RPS.setProvider(web3.currentProvider);
        // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      App.update();

    });
  },

  // subscribe to the game
  subscribe: function() {
    RPS.deployed().then(function(instance) {
      return instance.subscribe({
        from: web3.eth.accounts[index]
      })
    }).then(() => 
      App.update()
    )
  },

  // play. arg can be 'rock' 'paper' or 'scissors'
  play: function(choice) {
    RPS.deployed().then(function(instance) {
      return instance.play(choice2choiceArg[choice], {
        from: web3.eth.accounts[index]
      })
    }).then(() => 
      App.update()
    )
  },

  // changes the account we're controlling (can be 0 or 1)
  toggle: function() {
    index = (index + 1) % 2
    App.update();
  },

  update() {
    RPS.deployed().then(instance => {
      // list of promises to get the contract state
      var promises = [
        instance.p1(), 
        instance.p2(), 
        instance.p1().then(p => instance.playerChoice(p)), 
        instance.p2().then(p => instance.playerChoice(p)), 
        instance.getWinner()
      ]

      // this promise will resolve when all the promises have resolved, and the values are accessible as arguments in the function passed to 'spread'
      return Promise.all(promises).spread((p1, p2, c1, c2, winner) => {
        // get the DOM nodes
        var p1Element = document.getElementById("p1");
        var p2Element = document.getElementById("p2");
        var c1Element = document.getElementById("c1");
        var c2Element = document.getElementById("c2");
        var winnerElement = document.getElementById("winner");
        var currentPlayerElement = document.getElementById("currentPlayer");

        // update their values
        p1Element.innerHTML = p1;
        p2Element.innerHTML = p2;
        c1Element.innerHTML = choiceArg2choice[c1];
        c2Element.innerHTML = choiceArg2choice[c2];
        winnerElement.innerHTML = winner;
        currentPlayerElement.innerHTML = accounts[index];
      }) 
    })
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
      // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});