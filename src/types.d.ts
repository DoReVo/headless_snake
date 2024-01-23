interface NewGameParameters {
  w: number;
  h: number;
}

interface Fruit {
  x: number;
  y: number;
}

type Velocity = -1 | 0 | 1;

interface Snake {
  x: number;
  y: number;
  // -1 = left, 0 = no movement, 1 = right
  velX: Velocity;
  // -1 = up, = no movement, 1 = down
  velY: Velocity;
}

interface State {
  gameId: string;
  width: number;
  height: number;
  score: number;
  fruit: Fruit;
  snake: Snake;
}

interface Tick {
  velX: Velocity;
  velY: Velocity;
}

interface ValidateGameBody extends State {
  ticks: Tick[];
}
