import { generateFruitPosition } from "../utility";
import {
  FruitNotFoundError,
  GameLogicValidationError,
  SnakeOutOfBoundError,
} from "./errors";

function checkIsNot180DegreeTurn(
  currentVelX: Velocity,
  currentVelY: Velocity,
  nextVelX: Velocity,
  nextVelY: Velocity
) {
  // Check for straight movement, 180-degree turn.
  // This occurs when the snake is moving along one axis (X or Y)
  // and then tries to move in the exact opposite direction on the same axis.
  if (
    // Right to left
    (currentVelX === 1 &&
      nextVelX === -1 &&
      currentVelY === 0 &&
      nextVelY === 0) ||
    // Left to right
    (currentVelX === -1 &&
      nextVelX === 1 &&
      currentVelY === 0 &&
      nextVelY === 0) ||
    // Down to up
    (currentVelY === 1 &&
      nextVelY === -1 &&
      currentVelX === 0 &&
      nextVelX === 0) ||
    // Up to down
    (currentVelY === -1 &&
      nextVelY === 1 &&
      currentVelX === 0 &&
      nextVelX === 0)
  ) {
    return false;
  }

  // Check for diagonal movement, 180-degree turn:
  // This occurs when the snake is moving diagonally and then
  // tries to move in the exact opposite diagonal direction.
  if (currentVelX === nextVelX * -1 && currentVelY === nextVelY * -1) {
    return false;
  }

  // If the movement does not reverse direction, it is valid.
  return true;
}

function checkSnakeInArena(
  currentX: Snake["x"],
  currentY: Snake["y"],
  width: State["width"],
  height: State["height"]
) {
  // Snake out of bound
  if (currentX < 0 || currentY < 0 || currentX >= width || currentY >= height) {
    return false;
  }

  return true;
}

function checkIfFoundFruit(
  currentX: Snake["x"],
  currentY: Snake["y"],
  fruit: Fruit
) {
  if (currentX === fruit.x && currentY === fruit.y) return true;

  return false;
}

export function runGame(gameState: State, clientTicks: Tick[]): State {
  // Snake current velocity
  let currentVelX = gameState.snake.velX;
  let currentVelY = gameState.snake.velY;

  // Snake position in the arena
  let currentX = gameState.snake.x;
  let currentY = gameState.snake.y;

  let fruitFound: boolean = false;
  // Move the snake
  clientTicks.forEach((movement, tickIndex) => {
    // Ignore the rest of the movements if fruit is found
    if (fruitFound) return;

    const nextVelX = movement.velX;
    const nextVelY = movement.velY;

    const isNot180DegreeTurn = checkIsNot180DegreeTurn(
      currentVelX,
      currentVelY,
      nextVelX,
      nextVelY
    );

    if (isNot180DegreeTurn === false)
      throw new GameLogicValidationError(
        `Movement at ticks.[${tickIndex}] is invalid. 180 degree turn is not allowed`
      );

    // Update the snake velocity
    currentVelX = nextVelX;
    currentVelY = nextVelY;

    // Update the snake position
    currentX += currentVelX;
    currentY += currentVelY;

    // Check to make sure snake does not go out of bound
    const isStillInArena = checkSnakeInArena(
      currentX,
      currentY,
      gameState.width,
      gameState.height
    );

    // Snake went out of bound
    if (!isStillInArena) {
      throw new SnakeOutOfBoundError(
        `Game '${gameState.gameId}' is over! Snake went out of bounds`,
        gameState.gameId
      );
    }

    fruitFound = checkIfFoundFruit(currentX, currentY, gameState.fruit);
  });

  // List of moves given by client should lead to a fruit
  if (!fruitFound)
    throw new FruitNotFoundError("Ticks does not lead to a fruit");

  const newFruit = generateFruitPosition(gameState.width, gameState.height);

  const newGameState: State = {
    ...gameState,
    // Increment score by 1
    score: gameState.score + 1,
    fruit: newFruit,
    snake: {
      x: currentX,
      y: currentY,
      velX: currentVelX,
      velY: currentVelY,
    },
  };

  return newGameState;
}
