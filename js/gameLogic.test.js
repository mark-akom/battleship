import { battleGame } from './gameLogic';

describe('Ship factory function', () => {
    let ship;
    beforeEach(() => {
        ship = battleGame.shipFactory(4);
    })

    test("ships must be an object", () => {
        expect(typeof ship).toBe('object');
    });

    test("ships length number must be a number", () => {
        expect(typeof ship.length).toBe('number');
    });

    test("ship length should not be greater than 4", () => {
        expect(ship.length).toBeGreaterThanOrEqual(4);
    });

    test("ship length should be greater than 0", () => {
        expect(ship.length).toBeGreaterThan(0);
    });

    test("has the ship been sunk", () => {
        expect(ship.sunk).toBe(false);
    });

    test("has ship sunk when a position has been hit", () => {
        ship.isSunk();
        expect(ship.sunk).toBe(false)
    })
});

describe.only("Game Board", () => {
    let gameBoard;
    beforeEach(() => {
        gameBoard = battleGame.boardFactory();
    });

    test("game board must be an object", () => {
        expect(typeof gameBoard).toBe('object');
    });

    test("game board must be a 10 X 10", () => {
        const result = gameBoard.board.every(row => row.length === 10);
        expect(result).toBe(true);
    })

    test("Game board must be an array of 10 length", () => {
        expect(gameBoard.board.length).toBe(10);
    });
    
    test("ships on board must not overlap", () => {
        expect(gameBoard.placeShip(["23", "24", "25", "26"])).toBe(true);
        expect(gameBoard.placeShip(["01", "11", "21", "31"])).toBe(true);
    });

    test("ships on board must be a array", () => {
        expect(gameBoard.shipsOnBoard).toEqual([]);
    });

    test("there must be a ship on board", () => {
        gameBoard.placeShip(["23", "24", "25", "26"])
        expect(gameBoard.shipsOnBoard.length).toBe(1);
    })

    test("did attack hit a ship on the board", () => {
        gameBoard.placeShip(["23", "24", "25", "26"]);
        expect(gameBoard.receiveAttack("25")).toBe(true);
        expect(gameBoard.receiveAttack("23")).toBe(true);
        expect(gameBoard.receiveAttack("25")).toBe(null);
        expect(gameBoard.receiveAttack("33")).toBe(false);
    });

    test("has all ships been sunk", () => {
        gameBoard.placeShip(["23", "24", "25", "26"]);
        gameBoard.receiveAttack("23");
        gameBoard.receiveAttack("24");
        expect(gameBoard.hasAllShipBeenSunk()).toBe(false);
        gameBoard.receiveAttack("25");
        gameBoard.receiveAttack("26");
        expect(gameBoard.hasAllShipBeenSunk()).toBe(true);
    })

    test('make cordinates to place a ship', () => {
        expect(battleGame.makeCordinate("23", 'horizontal', 4)).toEqual(["23", "24", "25", "26"]);
        expect(battleGame.makeCordinate("28", 'horizontal', 4)).toEqual([]);
        expect(battleGame.makeCordinate("23", 'vertical', 4)).toEqual(["23", "33", "43", "53"]);
    })
})