import { Hono } from "hono";
import Joi from "joi";
import { generateFruitPosition } from "./lib/game";
import { nanoid } from "nanoid";
import { NEW_GAME_SCHEMA, VALIDATE_GAME_SCHEMA } from "./lib/schemas";
import { clientStateValidation } from "./lib/state-validation";
import {
  FruitNotFoundError,
  GameLogicValidationError,
  InvalidHttpMethodError,
  SnakeOutOfBoundError,
} from "./lib/errors";
import { runGame } from "./lib/game";

type Bindings = {
  SNAKE_DB: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (context) => {
  return context.json({
    message: "Hello from snake headless API",
    timestamp: new Date(),
  });
});

app.all("/new", async (c) => {
  try {
    // Only GET request is allowed
    if (c.req.method !== "GET")
      throw new InvalidHttpMethodError("Invalid method");

    // Validate query params
    const queryParams = await NEW_GAME_SCHEMA.validateAsync(c.req.query());

    const { w: width, h: height } = queryParams;

    // Generate a fruit position for the game
    const fruit = generateFruitPosition(width, height);

    // Give the game an ID
    const gameId = nanoid();

    // Create new game state
    const game: State = {
      gameId,
      width,
      height,
      score: 0,
      fruit: fruit,
      // Snake always start moving to the right
      snake: { x: 0, y: 0, velX: 1, velY: 0 },
    };

    // Save game state
    await c.env.SNAKE_DB.put(`game_state_${gameId}`, JSON.stringify(game));

    return c.json(game);
  } catch (error) {
    // Query params validation error
    if (Joi.isError(error)) {
      c.status(400);

      return c.json({ error: { message: error?.message } });
    } else if (error instanceof InvalidHttpMethodError) {
      c.status(405);

      return c.json({ error: { message: "Invalid Method" } });
    }

    // Unrecognized errors
    else {
      console.log("Unrecognized error", error);

      c.status(500);
      return c.json({
        error: { message: "Sorry, something on our server broke" },
      });
    }
  }
});

app.all("/validate", async (c) => {
  try {
    // Only POST request is allow
    if (c.req.method !== "POST")
      throw new InvalidHttpMethodError("Invalid method");

    // Basic validation to make sure the data is in
    // the shape that we expect
    const body = await VALIDATE_GAME_SCHEMA.validateAsync(await c.req.json());

    // Validation to make sure the state
    // given by the client match with what we have stored in DB
    const gameState = await clientStateValidation(body, c.env.SNAKE_DB);

    // Given the list of moves by the client, run the game against it.
    const newGameState = runGame(gameState, body.ticks);

    // Save new state
    await c.env.SNAKE_DB.put(
      `game_state_${newGameState.gameId}`,
      JSON.stringify(newGameState)
    );

    return c.json(newGameState);
  } catch (error) {
    // Body validation failure
    if (Joi.isError(error)) {
      c.status(400);

      return c.json({ error: { message: error?.message } });
    }
    // Snake went out of bound
    else if (error instanceof SnakeOutOfBoundError) {
      console.error("Game over, snake out of bound", error);

      // Delete the game
      await c.env.SNAKE_DB.delete(`game_state_${error.gameId}`);

      c.status(418);

      return c.json({ error: { message: error?.message } });
    }
    // Fruit not found
    else if (error instanceof FruitNotFoundError) {
      c.status(404);
      return c.json({ error: { message: error?.message } });
    }
    // Generic game logic error
    else if (error instanceof GameLogicValidationError) {
      console.error("Game validation logic error", error);

      c.status(400);

      return c.json({
        error: {
          message: error?.message,
        },
      });
    } else if (error instanceof InvalidHttpMethodError) {
      c.status(405);

      return c.json({ error: { message: "Invalid Method" } });
    }

    // Unrecognized errors
    else {
      console.log("Unrecognized error", error);

      c.status(500);
      return c.json({
        error: { message: "Sorry, something on our server broke" },
      });
    }
  }
});

export default app;
