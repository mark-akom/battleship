const playerBoard = document.querySelector('.player-board');
const cpuBoard = document.querySelector('.cpu-board');
const userCordinateInput = document.querySelector('.cordinate-text');
const rotateBtn = document.querySelector('.rotate');
const placeShipBtn = document.querySelector('.placing-ship');
const shipType = document.querySelector('.ship-type');
const startGameBtn = document.querySelector('.start-game-container');
const startGameContainer = document.querySelector('.start-game-container');
const gameIntro = document.querySelector('.game-intro');
const cpuContainer = document.querySelector('.cpu');
const restartButton = document.querySelector('.reset-game');
const gameOverContainer = document.querySelector('.game-over-container');
const gameOverMsg = document.querySelector('.game-over-msg');
const playTurns = document.querySelector('.play-turns');

const battleGame = (function() {
    function shipFactory(len) {
        let length = len;
        let position = [];
        let sunk = false;

        function hit(cord) {
            position.map((pos, i) => {
                if (cord === pos) {
                    this.position[i] = "hit";
                }
            })
        }

        function isSunk() {
            if (this.position.length === 0) {
                this.sunk = false;
                return;
            }
            this.sunk = this.position.every(pos => pos === 'hit');
        }

        return Object.assign({}, { length, position, sunk, hit, isSunk })
    }

    function boardFactory() {
        const shipsOnBoard = [];
        const board = [
            ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""]
        ];

        function placeShip(cordinates) {
            const isEmpty = cordinates.every(cord => {
                let [row, col] = cord;
                if (this.board[row][col] === "") {
                    return true;
                } else {
                    return false;
                }
            })

            if (isEmpty) {
                const ship = shipFactory(cordinates.length);
                cordinates.forEach(cord => {
                    let [row, col] = cord;
                    this.board[row][col] = cord;
                    ship.position.push(cord);
                });
                shipsOnBoard.push(ship);
                return true;
            } else {
                return false;
            }
        }

        function receiveAttack(cord) {
            let [row, col] = cord;
            if (this.board[row][col] === cord) { // if the position has not been attacked
                this.board[row][col] = 'hit';

                // find the ship that has been hit
                shipsOnBoard.forEach(ship => {
                    ship.position.map(pos => {
                        if (pos === cord) {
                            ship.hit(cord);
                            ship.isSunk();
                        }
                    })
                });

                return true
            }
            
            if (this.board[row][col] === 'hit' || this.board[row][col] === 'miss') { // position has been attacked
                return null
            } else {
                this.board[row][col] = 'miss';
                return false;
            }
        }

        function hasAllShipBeenSunk() {
            return shipsOnBoard.every(ship => ship.sunk);
        }

        return Object.assign({}, { board, shipsOnBoard, placeShip, receiveAttack, hasAllShipBeenSunk });
    }

    function createPlayer(name) {
        let playerBoard = boardFactory();
        return Object.assign({}, { playerBoard });
    }

    function makeCordinate(cordinate, direction, len) {
        const generatedCordinates = [];
        let [row, col] = cordinate;
        row = parseInt(row);
        col = parseInt(col);

        if (direction === 'horizontal') {
            if (10 - col >= len) {
                for (let i = 0; i < len; i++) {
                    generatedCordinates.push(`${row}${col + i}`);
                }
            }
        }

        if (direction === 'vertical') {
            if (10 - row >= len) {
                for (let i = 0; i < len; i++) {
                    generatedCordinates.push(`${row + i}${col}`);
                }
            }
        }

        return generatedCordinates;
    }

    return {
        shipFactory,
        boardFactory,
        createPlayer,
        makeCordinate,
    }
})();

const gamePlay = (function() {
    let playerOne = battleGame.createPlayer();
    let playerCpu = battleGame.createPlayer();
    let cpuShots = [];
    let playerShots = [];

    function autoAddShip(shipLengths) {
        let currentPosition = 0;

        while (true) {
            let row = Math.floor(Math.random() * 10);
            let col = Math.floor(Math.random() * 10);
    
            let direction = Math.floor(Math.random() * 2);
    
            if (direction === 0) {
                direction = 'horizontal';
            } else {
                direction = 'vertical';
            }
    
            let cord = `${row}${col}`;
    
            let cordinateList = battleGame.makeCordinate(cord, direction, shipLengths[currentPosition]);            
            
            if (cordinateList.length > 0) {
                let result = playerCpu.playerBoard.placeShip(cordinateList);
    
                if (result) {
                    currentPosition += 1
                } else {
                }
            }

            if (currentPosition === shipLengths.length) {
                break;
            }
        }
    }

    function playerAttack(elm) {
        let cord = elm.getAttribute('id');
        if (playerShots.includes(cord)) {
            return;
        } 
        playerShots.push(cord);
        const attackResult = playerCpu.playerBoard.receiveAttack(cord);

        if (attackResult) {
            elm.classList.add('hit');
            if (playerCpu.playerBoard.hasAllShipBeenSunk()) {
                playerCpu.playerBoard.hasAllShipBeenSunk();
                gameOverMsg.textContent = 'Cpu has lost';
                gameOverContainer.style.display = 'flex';
            }
        } else {
            elm.classList.add('miss');
        }
    }

    function cpuAttack() {
        setTimeout(() => {
            const cord = generateCpuAttackCordinate();
            const attackResult = playerOne.playerBoard.receiveAttack(cord);
            let [row, col] = cord.split('');
            row = parseInt(row);
            col = parseInt(col);
            const elm = playerBoard.querySelectorAll('.row')[row].querySelectorAll('div')[col]
    
            if (attackResult) {
                elm.classList.add('hit');
                if (playerOne.playerBoard.hasAllShipBeenSunk()) {
                    gameOverMsg.textContent = 'Player One has lost';
                    gameOverContainer.style.display = 'flex';
                }
            } else {
                elm.classList.add('miss');
            }
            playTurns.textContent = 'Player One playing...'
        }, 500)

    }

    function generateCpuAttackCordinate() {
        let cordinate;

        while (true) {
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);
            cordinate = `${row}${col}`;
            if (cpuShots.includes(cordinate)) {
                continue;
            } else {
                cpuShots.push(cordinate);
                break;
            }
        }
        return cordinate;
    }

    function attackBoards(elm) {
            playerAttack(elm);
            playTurns.textContent = 'Cpu playing...';
            cpuAttack();
    }

    function resetGame() {
        playerCpu = battleGame.createPlayer();
        playerOne = battleGame.createPlayer();

        cpuContainer.style.display = 'none';
        startGameContainer.style.display = 'none';
        playTurns.textContent = 'Player One playing...'
        playTurns.style.display = 'none';

        cpuShots = [];
        playerShots = [];

        Array.from(playerBoard.querySelectorAll('.row')).forEach(row => {
            playerBoard.removeChild(row);
        })

        Array.from(cpuBoard.querySelectorAll('.row')).forEach(row => {
            cpuBoard.removeChild(row);
        })     
        
        gameDOM.buildCpuBoard();
        gameDOM.buildPlayerOneBoard();
    }

    function returnPlayerOne () {
        return playerOne;
    }

    function returnPlayerCpu() {
        return playerCpu
    }

    return {
        returnPlayerCpu,
        returnPlayerOne,
        autoAddShip,
        attackBoards,
        resetGame
    }
}())

const gameDOM = (function(){
    //build out the game boards for both players
    let shipLengths = [4, 3, 3, 2, 2, 1, 1, 1];
    let playerOneCordDivs = [];
    let errorShips = []
    let currentPlacement = 0;

    function getShipLengths() {
        return shipLengths;
    }

    function buildPlayerOneBoard() {
        let playerOne = gamePlay.returnPlayerOne()
        playerOne.playerBoard.board.forEach((row, rowIndex) => {
            const divRow = document.createElement('div');
            divRow.classList.add('row');
            row.forEach((col, colIndex) => {
                const divCol = document.createElement('div');
                divCol.setAttribute('id', `${rowIndex}${colIndex}`);
                divCol.classList.add('cellCord');
                divRow.appendChild(divCol);
            });
            playerBoard.appendChild(divRow);
        });
    }

    function buildCpuBoard() {
        let playerCpu = gamePlay.returnPlayerCpu()
        playerCpu.playerBoard.board.forEach((row, rowIndex) => {
            const divRow = document.createElement('div');
            divRow.classList.add('row');
            row.forEach((col, colIndex) => {
                const divCol = document.createElement('div');
                divCol.setAttribute('id', `${rowIndex}${colIndex}`);
                divCol.classList.add('cellCord');
                divRow.appendChild(divCol);
            });
            cpuBoard.appendChild(divRow);
        })
    }

    function displayShip(cordinate, direction) {
        const shipCordinates = battleGame.makeCordinate(cordinate, direction, shipLengths[currentPlacement]);
        if (shipCordinates.length > 0) {
            shipCordinates.forEach(cord => {
                let [row, col] = cord;
                row = parseInt(row);
                col = parseInt(col);
                playerOneCordDivs.push(playerBoard.querySelectorAll('.row')[row].querySelectorAll('div')[col]);
            })
        }

        if (shipCordinates.length === 0)  {
            let [row, col] = cordinate;
            row = parseInt(row);
            col = parseInt(col);
            playerBoard.querySelectorAll('.row')[row].querySelectorAll('div')[col].classList.add('error');
            errorShips.push(playerBoard.querySelectorAll('.row')[row].querySelectorAll('div')[col]);
        }

        playerOneCordDivs.forEach(cordDiv => {
            cordDiv.classList.add('pre-occupied');
        })
    } 

    function removeDisplayShip() {
        playerOneCordDivs.forEach(cordDiv => {
            cordDiv.classList.remove('pre-occupied');
        })
        playerOneCordDivs = [];

        if (errorShips.length > 0) {
            errorShips[0].classList.remove('error');
            errorShips = [];
        }
    }

    function rotateShip(rotateValue) {
        if (userCordinateInput.value !== '') {
            removeDisplayShip();
            displayShip(validateCordinate(userCordinateInput.value), rotateValue);
        }
    }

    function pinShipToBoard() {
        const cordinates = [];
        let playerOne = gamePlay.returnPlayerOne();

        playerOneCordDivs.forEach(cell => {
            const cellCord = cell.getAttribute('id');
            cordinates.push(cellCord);
        });

        const checkResult = playerOne.playerBoard.placeShip(cordinates);
        if (checkResult) {
            playerOneCordDivs.forEach(cellCord => {
                cellCord.classList.add('occupied');
            });

            currentPlacement += 1;
            shipType.textContent = shipLengths[currentPlacement];

            if (currentPlacement === shipLengths.length) {
                gameIntro.style.display = 'none';
                startGameBtn.style.display = 'block';
                currentPlacement = 0;
            }
        }
        playerOneCordDivs = [];

    }

    function validateCordinate(cord) {
        const alpha = ['A', 'B', 'C', "D", 'E', "F", "G", 'H', 'I', 'J'];
        const numeric = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        let [row, col] = cord.split('');
        if (alpha.includes(row.toUpperCase()) && numeric.includes(col)) {
            cord = `${alpha.indexOf(row.toUpperCase())}${numeric.indexOf(col)}`
        } else {
            alert('Please provide a valid cordinate');
            return false;
        }

        return cord;
    }

    return {
        displayShip,
        removeDisplayShip,
        pinShipToBoard,
        getShipLengths,
        buildCpuBoard,
        buildPlayerOneBoard,
        rotateShip,
        validateCordinate
    }
}());

gameDOM.buildCpuBoard();
gameDOM.buildPlayerOneBoard();

userCordinateInput.addEventListener('input', function(e) {
    placeShipBtn.disabled = true;
    let cordinate = e.target.value;    
    
    if (cordinate.length === 2) {
        let validCord = gameDOM.validateCordinate(cordinate);
        if (validCord !== false) {
            gameDOM.displayShip(validCord, 'horizontal');
            placeShipBtn.disabled = false;
        }
    } 

    if (cordinate.length === 1 || cordinate.length > 2) {
        gameDOM.removeDisplayShip();
    }
    
});

rotateBtn.addEventListener('click', () => {
    const rotateValue = rotateBtn.getAttribute('id');

    gameDOM.rotateShip(rotateValue);

    if (rotateValue === 'horizontal') {
        rotateBtn.setAttribute('id', 'vertical');
    } else {
        rotateBtn.setAttribute('id', 'horizontal');
    }
});

placeShipBtn.addEventListener('click', function(e) {
    gameDOM.pinShipToBoard();
    userCordinateInput.value = '';
});

startGameBtn.addEventListener('click', function(e) {
    cpuContainer.style.display = 'block';
    startGameContainer.style.display = 'none';
    playTurns.style.display = 'block';
    let lengths = gameDOM.getShipLengths();
    gamePlay.autoAddShip(lengths);
})

cpuBoard.addEventListener('click', function(e) {
    gamePlay.attackBoards(e.target)
})

restartButton.addEventListener('click', () => {
    gameOverContainer.style.display = 'none';
    startGameBtn.style.display = 'none';
    gameIntro.style.display = 'block';
    gamePlay.resetGame();
})

// export { battleGame }