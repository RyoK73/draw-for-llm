## How to Define

- Define using `const` with an arrow function

### Export

- Use `export {}` at the end of the file, not inline
- Use `export type` for a component's own data types, and have the caller declare the data type strictly

```ts
export { type PropType, func };
```
