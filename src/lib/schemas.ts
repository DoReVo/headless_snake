import Joi from "joi";

const GAME_WIDTH_SCHEMA = Joi.number();
const GAME_HEIGHT_SCHEMA = Joi.number();

const VELOCITY_SCHEMA = Joi.number().valid(-1, 0, 1);

export const NEW_GAME_SCHEMA: Joi.ObjectSchema<NewGameParameters> = Joi.object({
  w: GAME_WIDTH_SCHEMA.required(),
  h: GAME_HEIGHT_SCHEMA.required(),
});

export const VALIDATE_GAME_SCHEMA: Joi.ObjectSchema<ValidateGameBody> =
  Joi.object({
    gameId: Joi.string().trim().required(),
    width: GAME_WIDTH_SCHEMA.required(),
    height: GAME_HEIGHT_SCHEMA.required(),
    score: Joi.number().required(),
    fruit: Joi.object({
      x: Joi.number().required(),
      y: Joi.number().required(),
    }).required(),
    snake: Joi.object({
      x: Joi.number().required(),
      y: Joi.number().required(),
      velX: VELOCITY_SCHEMA.required(),
      velY: VELOCITY_SCHEMA.required(),
    }).required(),
    ticks: Joi.array()
      .items(
        Joi.object({
          velX: VELOCITY_SCHEMA.required(),
          velY: VELOCITY_SCHEMA.required(),
        })
      )
      .min(1)
      .required(),
  });
