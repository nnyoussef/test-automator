/**
 * This file contains types used across the application.
 *
 */
type KeyValueMap<T = any> = Record<string, T>;
type ReadonlyKeyValueMap<T = any> = Readonly<KeyValueMap<T>>;
type FunctionMap<T = any, R = any> = ReadonlyKeyValueMap<(arg: T) => R>;
type Optional<T> = T | null | undefined;
type TextOrNumber = string | number;
type SingleOrArray<T> = T | Array<T>;
type CommonComponentAttribute = {
    role?: string;
    tag?: string;
    value?: TextOrNumber;
};

export type {
    KeyValueMap,
    ReadonlyKeyValueMap,
    FunctionMap,
    Optional,
    TextOrNumber,
    SingleOrArray,
    CommonComponentAttribute,
};
