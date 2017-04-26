pragma solidity ^0.4.8;

contract RPS {
    enum choice {
        NULL,
        ROCK,
        PAPER,
        SCISSORS
    }
    
    // matrix in solidity o/ 
    mapping(uint=>mapping(uint=>uint)) rules;
    
    mapping(address=>choice) public playerChoice;
    
    address public p1;
    address public p2;
    
    function RPS() {
        rules[toUint(choice.ROCK)][toUint(choice.ROCK)] = 1;
        rules[toUint(choice.ROCK)][toUint(choice.PAPER)] = 0;
        rules[toUint(choice.ROCK)][toUint(choice.SCISSORS)] = 2;
        rules[toUint(choice.PAPER)][toUint(choice.ROCK)] = 2;
        rules[toUint(choice.PAPER)][toUint(choice.PAPER)] = 1;
        rules[toUint(choice.PAPER)][toUint(choice.SCISSORS)] = 0;
        rules[toUint(choice.SCISSORS)][toUint(choice.ROCK)] = 0;
        rules[toUint(choice.SCISSORS)][toUint(choice.PAPER)] = 2;
        rules[toUint(choice.SCISSORS)][toUint(choice.SCISSORS)] = 1;
    }
    
    function toUint(choice c) internal returns(uint) {
        if(c == choice.NULL) return 0;
        if(c == choice.ROCK) return 1;
        if(c == choice.PAPER) return 2;
        if(c == choice.SCISSORS) return 3;
    }
    
    function subscribe() {
        if(p1 != 0) {
            if(p2 != 0) {
                return;
            }
            p2 = msg.sender;
            return;
        }
        p1 = msg.sender;
    }
    
    modifier gameFull() {
        if(p1 == 0 || p2 == 0) throw;
        _;
    }
    
    modifier isRegistered() {
        if(!(msg.sender == p1 || p2 == msg.sender)) throw;
        _;
    }
    
    modifier notAlreadyPlayed() {
        if(playerChoice[msg.sender] != choice.NULL) throw;
        _;
    }
    
    modifier everyonePlayed() {
        if(!(
            playerChoice[p1] != choice.NULL && 
            playerChoice[p2] != choice.NULL
            )) return;
        _;
    }
    
    function play(choice pChoice) gameFull() isRegistered() notAlreadyPlayed() {
        playerChoice[msg.sender] = pChoice;        
    }
    
    function getWinner() constant everyonePlayed() returns(address) {
        uint winner = rules[toUint(playerChoice[p1])][toUint(playerChoice[p2])];
        if(winner == 0) return p2;
        if(winner == 2) return p1;
    }
}