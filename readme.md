# react-router-theme

Easy theme setup for React Router v7.

Designed with CSS libraries that support the `<html data-theme="...">` attribute in mind, but use as you wish.

This package stores the user's preferred theme in both cookies and local storage, to ensure the correct theme is rendered on the server (in SSR), and that all tabs/windows are immediately affected when changing themes.

# Installation

`npm install react-router-theme`

# Usage

Call the useTheme()-hook and pass it the loader data and a fetcher instance.
Export the loader and action from the package if you don't need any custom logic.

Ideally, call this hook once in your top-level/layout route, where your `<html>`-tag is rendered.

```tsx
import { useFetcher, useLoaderData } from "react-router";
import { useTheme } from "react-router-theme";
export { loader, action } from "react-router-theme";

export default function Layout() {
  const loaderData = useLoaderData();
  const fetcher = useFetcher();

  const [theme, setTheme] = useTheme(loaderData, fetcher);

  return (
    <html data-theme={theme}>
      ...
      <button onClick={() => setTheme("dark")}>Dark</button>
      <button onClick={() => setTheme("light")}>Light</button>
    </html>
  );
}
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
