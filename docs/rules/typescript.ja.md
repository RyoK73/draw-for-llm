## 定義方法

- アロー関数を使用した`const`で定義する

### Export

- 文中ではなくファイル最後尾で`export {}`する
- コンポーネント固有のデータ型は`export type`し、コンポーネントの呼び出し側で`データ型を厳密に宣言する`

```ts
export { type PropType, func };
```
