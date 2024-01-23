import { Hono } from "hono";
import Joi from "joi";
import { generateFruitPosition } from "./utility";
import { nanoid } from "nanoid";
import { NEW_GAME_SCHEMA, VALIDATE_GAME_SCHEMA } from "./lib/schemas";
import { clientStateValidation } from "./lib/state-validation";
import { GameValidationLogicError } from "./lib/errors";

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

app.get("/new", async (c) => {
  try {
    // Validate query params
    const queryParams = await NEW_GAME_SCHEMA.validateAsync(c.req.query());

    const { w: width, h: height } = queryParams;

    // Generate a fruit position for the game
    const fruit = generateFruitPosition(width, height);

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
  } catch (error) {
    // Query params validation error
    if (Joi.isError(error)) {
      c.status(400);

      return c.json({ error: { message: error?.message } });
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

  return c.json({ message: "Yes" });
});

app.post("/validate", async (c) => {
  try {
    // Basic validation to make sure the data is in
    // the shape that we expect
    const body = await VALIDATE_GAME_SCHEMA.validateAsync(await c.req.json());

    // Validation to make sure the state
    // given by the client match with what we have stored in DB
    await clientStateValidation(body, c.env.SNAKE_DB);

    return c.json({ message: "ok" });
  } catch (error) {
    // Body validation failure
    if (Joi.isError(error)) {
      c.status(400);

      return c.json({ error: { message: error?.message } });
    } else if (error instanceof GameValidationLogicError) {
      console.error("Game validation logic error", error);

      return c.json({
        error: {
          message: error?.message,
        },
      });
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
