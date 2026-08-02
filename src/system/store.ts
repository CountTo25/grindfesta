import { get, readable, type Readable } from "svelte/store";

export function distinctArrayProjection<T, U>(
  source: Readable<T>,
  project: (value: T) => readonly U[],
): Readable<readonly U[]> {
  const initial = project(get(source));

  return readable(initial, (set) => {
    let current = initial;
    return source.subscribe((value) => {
      const next = project(value);
      if (current.length === next.length && current.every((v, i) => v === next[i])) return;
      current = next;
      set(next);
    });
  });
}
