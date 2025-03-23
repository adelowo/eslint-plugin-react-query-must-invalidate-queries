# Enforce invalidateQueries in useMutation onSuccess callbacks (require-mutation-invalidation)

This rule enforces that `useMutation` hooks include an `onSuccess` callback that calls `invalidateQueries` to ensure data consistency.

## Rule Details

When using mutations in React Query, it's important to invalidate related queries after a successful mutation to ensure the UI reflects the latest server state. This rule enforces that `useMutation` hooks include an `onSuccess` callback that calls `invalidateQueries`.

### ❌ Examples of incorrect code

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

### ✅ Examples of correct code

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

useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    const invalidate = queryClient.invalidateQueries;
    invalidate({ queryKey: ["users"] });
  },
});
```

## When Not To Use It

If you have mutations that intentionally don't need to invalidate any queries (e.g., analytics-only mutations) or if you're handling cache updates through other means like `setQueryData`, you might want to disable this rule.

## Further Reading

- [React Query Mutations - TanStack Query docs](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [Invalidation from Mutations - TanStack Query docs](https://tanstack.com/query/latest/docs/react/guides/invalidations-from-mutations)

