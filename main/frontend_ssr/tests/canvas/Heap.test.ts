import { beforeEach, describe, expect, it } from "vitest";
import Heap from "../../canvas/graph/Heap";

let heap = new Heap();

beforeEach(() => {
  heap = new Heap();
});

describe("Heap", () => {
  it("should start empty", () => {
    expect(heap.front()).toBe(null);
  });

  it("should enqueue and dequeue elements in the correct order", () => {
    heap.push("test", 17);
    heap.push("test", 7);
    heap.push("test", 90);

    if (!heap.front()) throw new Error("No front after pushing elements");

    expect(heap.front()?.weight).toBe(7);

    const first = heap.pop();
    const second = heap.pop();
    const third = heap.pop();

    expect(first.weight).toBe(7);
    expect(second.weight).toBe(17);
    expect(third.weight).toBe(90);
    expect(heap.front()).toBe(null);
  });

  it("should handle arrays of numbers in arbitrary order", () => {
    const count = 1000;
    const arr: number[] = [];

    for (let i = 0; i < count; i++) {
      arr.push(Math.floor(Math.random() * 100));
    }

    for (const randomNumber of arr) {
      heap.push("test", randomNumber);
    }

    const resultSortedArr: number[] = [];

    for (let i = 0; i < count; i++) {
      const lowestNumber = heap.pop().weight;
      resultSortedArr.push(lowestNumber);
    }

    expect(resultSortedArr.length).toBe(count);

    for (let i = 1; i < count; i++) {
      expect(resultSortedArr[i]).toBeGreaterThanOrEqual(resultSortedArr[i - 1]);
    }
  });
});
