# react-router-theme

Easy theme setup for React Router v7.

- Designed with CSS libraries that support the `<html data-theme="...">` attribute in mind, but use as you wish
- Stores theme in cookies for SSR
- Stores theme in local storage for sync with other tabs and windows.

# Installation

`npm install react-router-theme`

# Usage

Use the useTheme hook to get and set the theme value in your application.
Export the loader and action from the package if you don't need any custom logic.

```tsx
import { useFetcher, useLoaderData } from "react-router";
import { useTheme } from "react-router-theme";
export { loader, action } from "react-router-theme";

const MyComponent = () => {
  const loaderData = useLoaderData();
  const fetcher = useFetcher();
  const [theme, setTheme] = useTheme(loaderData, fetcher);

  return (
    <div data-theme={theme}>
      <button onClick={() => setTheme("dark")}>Dark Theme</button>
      <button onClick={() => setTheme("light")}>Light Theme</button>
    </div>
  );
};
```

If you need custom logic in your loader, just make sure to include the theme in the returned object (using getThemeFromCookie)

```ts
const loader = async (args) => {
    ...
    return { theme: await getThemeFromCookie(args.request), otherData: ... }
}
```

If you need custom logic in your action, just make sure to return a response with the 'Set-Cookie' header (using createThemeCookie)

```ts
const action = async (args) => {
  return new Reponse(null, {
    headers: {
      "Set-Cookie": await createThemeCookie(args.request),
    },
  });
};
```

Repository
https://github.com/franzvrolijk/react-router-theme

Bugs
https://github.com/franzvrolijk/react-router-theme/issues

Homepage
https://github.com/franzvrolijk/react-router-theme#readme
