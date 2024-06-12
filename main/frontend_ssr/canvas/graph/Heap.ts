export default class Heap<T> {
  heap: {
    weight: number;
    value: T;
  }[];

  get size() {
    return this.heap.length - 1;
  }

  constructor() {
    this.heap = [];
    // 0th node skipped to simplify math
    this.heap.push({
      weight: 0,
      value: null as T,
    });
  }

  front() {
    if (this.heap.length <= 1) {
      return null;
    }
    return this.heap[1];
  }

  push(value: T, weight: number) {
    this.heap.push({
      weight: weight,
      value: value,
    });

    let i = this.heap.length - 1;

    while (i > 1 && this.heap[i].weight < this.heap[Math.floor(i / 2)].weight) {
      // swap
      let tmp = this.heap[i];
      this.heap[i] = this.heap[Math.floor(i / 2)];
      this.heap[Math.floor(i / 2)] = tmp;

      // go next
      i = Math.floor(i / 2);
    }
  }

  pop() {
    if (this.heap.length === 1) {
      throw Error("Empty heap");
    }

    if (this.heap.length === 2) {
      return this.heap.pop()!;
    }

    const result = this.heap[1];

    // swap with last
    this.heap[1] = this.heap.pop()!;
    let i = 1;
    while (2 * i < this.heap.length) {
      if (
        2 * i + 1 < this.heap.length &&
        this.heap[2 * i + 1].weight < this.heap[2 * i].weight &&
        this.heap[i].weight > this.heap[2 * i + 1].weight
      ) {
        // swap right
        let tmp = this.heap[i];
        this.heap[i] = this.heap[2 * i + 1];
        this.heap[2 * i + 1] = tmp;
        i = 2 * i + 1;
      } else if (this.heap[i].weight > this.heap[2 * i].weight) {
        // swap left
        let tmp = this.heap[i];
        this.heap[i] = this.heap[2 * i];
        this.heap[2 * i] = tmp;
        i = 2 * i;
      } else {
        break;
      }
    }

    return result;
  }
}
