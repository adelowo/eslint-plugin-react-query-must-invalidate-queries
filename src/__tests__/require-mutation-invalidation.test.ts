import { RuleTester } from "@typescript-eslint/rule-tester";
import { requireMutationInvalidation } from "../rules/require-mutation-invalidation";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run("require-mutation-invalidation", requireMutationInvalidation, {
  valid: [
    {
      code: `
        useMutation({
          onSuccess: () => {
            queryClient.invalidateQueries(['todos']);
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            console.log('success');
            queryClient.invalidateQueries(['todos']);
            doSomethingElse();
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: async () => {
            await someOperation();
            queryClient.invalidateQueries(['todos']);
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: function() {
            queryClient.invalidateQueries(['todos']);
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            someFunction(() => {
              queryClient.invalidateQueries(['todos']);
            });
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            if (condition) {
              queryClient.invalidateQueries(['todos']);
            } else {
              queryClient.invalidateQueries(['other']);
            }
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            try {
              queryClient.invalidateQueries(['todos']);
            } catch (e) {
              console.error(e);
            }
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            const queries = ['todos'];
            queryClient.invalidateQueries(queries);
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            (async () => {
              await delay(100);
              queryClient.invalidateQueries(['todos']);
            })();
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            const client = queryClient;
            client.invalidateQueries(['todos']);
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            const { invalidateQueries } = queryClient;
            invalidateQueries(['todos']);
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            const invalidate = queryClient.invalidateQueries;
            invalidate(['todos']);
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            someOtherClient.invalidateQueries(['todos']);
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            queryClient.invalidateQueries(['todos']);
            queryClient.invalidateQueries(['users']);
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: async () => {
            await queryClient.invalidateQueries(['todos']);
            await queryClient.invalidateQueries(['users']);
            await queryClient.invalidateQueries(['posts']);
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            const client = queryClient;
            client.invalidateQueries(['todos']);
            client.invalidateQueries(['users']);
          }
        });
      `,
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            const { invalidateQueries } = queryClient;
            invalidateQueries(['todos']);
            invalidateQueries(['users']);
          }
        });
      `,
    }
  ],
  invalid: [
    {
      code: `
        useMutation({});
      `,
      errors: [{ messageId: "missingInvalidation" }],
    },
    {
      code: `
        useMutation({
          onSuccess: () => {}
        });
      `,
      errors: [{ messageId: "missingInvalidation" }],
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            console.log('success');
            doSomethingElse();
          }
        });
      `,
      errors: [{ messageId: "missingInvalidation" }],
    },
    {
      code: `
        useMutation();
      `,
      errors: [{ messageId: "missingInvalidation" }],
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            queryClient.invalidateQuery(['todos']);
          }
        });
      `,
      errors: [{ messageId: "missingInvalidation" }],
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            if (condition) {
              console.log('success');
            } else {
              doSomethingElse();
            }
          }
        });
      `,
      errors: [{ messageId: "missingInvalidation" }],
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            try {
              doSomething();
            } catch (e) {
              console.error(e);
            }
          }
        });
      `,
      errors: [{ messageId: "missingInvalidation" }],
    },
    {
      code: `
        useMutation({
          onSuccess: () => {
            (async () => {
              await delay(100);
              console.log('done');
            })();
          }
        });
      `,
      errors: [{ messageId: "missingInvalidation" }],
    }
  ],
}); 
