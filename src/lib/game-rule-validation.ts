/** Validate that the given movements
 * is valid
 */
function movementValidation(gameState: State, clientTicks: Tick[]) {
  let currentVelX = gameState.snake.velX;
  let currentVelY = gameState.snake.velY;

  clientTicks.forEach((movement) => {
    const nextVelX = movement.velX;
    const nextVelY = movement.velY;

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
  });
}

/**
 * Validate the list of moves given
 * by the client against our game rules
 */
export async function gameRuleValidation(
  gameState: State,
  clientTicks: Tick[]
) {}
