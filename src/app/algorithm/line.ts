export class Line {

  // Bresenham's Line Drawing Algorithm
  // https://rosettacode.org/wiki/Bitmap/Bresenham%27s_line_algorithm#JavaScript
  // Modded to not draw first pixel
  public static draw(x0: number, y0: number, x1: number, y1: number, pixel: (x, y) => void): void {
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = (dx > dy ? dx : -dy) / 2;

    while (x0 !== x1 || y0 !== y1) {
      const e2 = err;
      if (e2 > -dx) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dy) {
        err += dx;
        y0 += sy;
      }

      pixel(x0, y0);
    }
  }

}
