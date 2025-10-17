/**
 * This file contains types used across the application.
 *
 */
type KeyValueMap<T = any> = Record<string, T>;
type ReadonlyKeyValueMap<T = any> = Readonly<KeyValueMap<T>>;
type FunctionMap<T, R> = ReadonlyKeyValueMap<(arg: T) => R | Function>;
type Optional<T> = T | null | undefined;
type TextOrNumber = string | number;
type SingleOrArray<T> = T | Array<T>;

export type { KeyValueMap, ReadonlyKeyValueMap, FunctionMap, Optional, TextOrNumber, SingleOrArray };
