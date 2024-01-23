import { GameLogicValidationError } from "./errors";

interface HeightWidthVerification {
  width: State["width"];
  height: State["height"];
}

/** Verify client given height/width matches
 * with what we have.
 */
function verifyWidthHeightMatch(
  client: HeightWidthVerification,
  database: HeightWidthVerification
) {
  if (client.height !== database.height)
    throw new GameLogicValidationError(
      `Height does not match. Given '${client.height}' while in database '${database.height}'`
    );

  if (client.width !== database.width)
    throw new GameLogicValidationError(
      `Width does not match. Given '${client.width}' while in database '${database.width}'`
    );

  return true;
}

/** Validate client game state
 * and return game state that we stored in DB
 */
export async function clientStateValidation(
  clientState: State,
  db: KVNamespace
) {
  const gameId = clientState.gameId;

  // Make sure client gave us a gameId that is actually
  // in the database
  const gameState: State | null = await db.get(`game_state_${gameId}`, "json");

  if (!gameState)
    throw new GameLogicValidationError(`Game ID '${gameId}' not found`);

  // We could just stop validation here.
  // Because, all we care about is actually just the `ticks`.
  // If the client gave us the wrong state such as the wrong height,
  // it doesn't really affect us as we have the correct game state
  // stored.

  // But if we do want to validate that the rest of the state
  // from the client is valid, write individual functions
  // to validate different chunk of the state.

  // Example, verifying game height/width
  // given from the client actually matches
  // with what we have in the database
  verifyWidthHeightMatch(
    {
      height: clientState.height,
      width: clientState.width,
    },
    {
      height: gameState.height,
      width: gameState.width,
    }
  );

  return gameState;
}
