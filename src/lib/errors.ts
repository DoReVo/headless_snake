export class GameLogicValidationError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class SnakeOutOfBoundError extends GameLogicValidationError {
  public gameId: State["gameId"];

  constructor(msg: string, gameId: State["gameId"]) {
    super(msg);

    this.gameId = gameId;
  }
}

export class FruitNotFoundError extends GameLogicValidationError {
  constructor(msg: string) {
    super(msg);
  }
}

export class InvalidHttpMethodError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}
