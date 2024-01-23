export function generateFruitPosition(
  width: State["width"],
  height: State["height"]
): Fruit {
  const x = Math.floor(Math.random() * width);
  const y = Math.floor(Math.random() * height);

  return { x, y };
}
