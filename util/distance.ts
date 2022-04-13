const dist = (x1: number, y1: number, x2: number, y2: number) => {
  const xs = Math.pow(x1 - x2, 2)
  const ys = Math.pow(y1 - y2, 2)
  return Math.sqrt(xs + ys)
}

export default dist
