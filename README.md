# eslint-plugin-react-query-must-invalidate-queries

ESLint plugin to enforce best practices when working with [TanStack Query](https://tanstack.com/query/latest)

## Installation

```bash
npm install eslint-plugin-react-query-must-invalidate-queries --save-dev
# or
yarn add eslint-plugin-react-query-must-invalidate-queries --dev
# or
pnpm add eslint-plugin-react-query-must-invalidate-queries --save-dev
```

## Usage

Add `react-query-must-invalidate-queries` to the plugins section of your `.eslintrc` configuration file:

```js
{
  "plugins": ["react-query-must-invalidate-queries"],
  "rules": {
    "react-query-must-invalidate-queries/require-mutation-invalidation": "error" // or "warn"
  }
}
```

## Rules

### require-mutation-invalidation

🔧 This rule enforces that `useMutation` hooks include an `onSuccess` callback that
calls `invalidateQueries` to ensure data consistency.

#### Why?

When using mutations in React Query, it's important to invalidate related queries
after a successful mutation to ensure the UI reflects the latest server state without
having to do a lot of mental prep.

This rule helps prevent stale data by ensuring that mutations properly invalidate affected queries.

#### Rule Details

This rule enforces:

- Presence of an `onSuccess` callback in `useMutation` hooks
- The `onSuccess` callback must include a call to `invalidateQueries`

✅ Examples of **correct** code:

```js
useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});

useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    const { invalidateQueries } = queryClient;
    invalidateQueries({ queryKey: ["users"] });
  },
});

useMutation({
  mutationFn: updateUser,
  onSuccess: async () => {
    await someOtherOperation();
    await queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});
```

❌ Examples of **incorrect** code:

```js
useMutation({
  mutationFn: updateUser,
});

useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    console.log("Success!");
  },
});

useMutation({
  mutationFn: updateUser,
  onSuccess: () => {},
});
```

#### When Not To Use It

You might want to disable this rule if:

- You have mutations that intentionally don't need to invalidate any queries (e.g., analytics-only mutations)
- You're handling cache updates through other means like `setQueryData`
- You have a specific caching strategy that doesn't require query invalidation

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## License

MIT

## Resources

- [Rule Documentation](docs/rules/require-mutation-invalidation.md)
- [TanStack Query Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [TanStack Query Invalidation from Mutations](https://tanstack.com/query/latest/docs/react/guides/invalidations-from-mutations)
