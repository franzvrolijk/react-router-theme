# react-router-theme

## What

- ✅ SSR themes without flashing
- ✅ Immediate updates across windows and tabs
- ✅ Perfect for [daisyUI](https://daisyui.com/) themes
- ✅ Perfect for [Tailwind CSS data attribute](https://tailwindcss.com/docs/dark-mode#using-a-data-attribute) themes
- ✅ Compatible with system-preference dark mode for themes supporting it
- ✅ Made for React Router (v7) and Remix

## How

This package provides a useTheme-hook, along with a pre-defined loader and action, to simplify support for themes in server-side-rendered Remix/React Router apps. Utility functions for custom loaders and actions are also provided.

The hook assures that the user's preferred theme is stored in cookies and local storage when set, loaded by the server when rendering server-side, and immediately updated across all tabs and windows when updated.

### Installation

`npm install react-router-theme@latest`

### Usage

> [!NOTE]
> Make sure your application is set up to support themes through the `data-theme`-attribute (for instance by using daisyUI or custom Tailwind data attribute themes)

1. Export `{ loader, action }` from this package in the route rendering your `<html>`-tag
2. Call the `useTheme`-hook in the component, and use the return values to set and update the theme

```tsx
import { useFetcher, useLoaderData } from "react-router";
import { useTheme } from "react-router-theme";
export { loader, action } from "react-router-theme";

export default function Layout() {
  const loaderData = useLoaderData() as { theme: string };
  const fetcher = useFetcher();

  const [theme, setTheme] = useTheme(loaderData, fetcher);

  return (
    <html data-theme={theme}>
      ...
      <MyThemeSelector theme={theme} setTheme={setTheme}>
    </html>
  );
}
```

#### Custom loader and action

If you need to customize the loader or action on the given route (or simply don't want to use the provided ones) just make sure to:

- include `theme: getThemeFromCookie(request)` in your loader response

```ts
export const loader = (args) => {
  const otherData = ...;

  return {
    theme: getThemeFromCookie(args.request),
    otherData: otherData
  };
};
```

- return `await themeCookieResponse(request)` from your action if the form data matches `'action': 'themeChange'`

```ts
export const action = async (args) => {
  const formData = await args.request.formData();

  if (formData.get("action") === "themeChange") return await themeCookieResponse(args.request);

  // Other actions...
};
```

(custom responses are also fine, just include `Set-Cookie`-header using `await createThemeCookie(request)`)

```ts
return new Response(body, {
  headers: { "Set-Cookie": await createThemeCookie(args.request) },
});
```

#### Default theme

If the user has no theme cookie set, the returned theme will be `"default"`. To override this, pass your desired default value as a third parameter to the hook

```tsx
const [theme, setTheme] = useTheme(loaderData, fetcher, "myDefaultTheme");
```

#### Context and provider

If you need access to the theme or setter in a different route/component from where you call the useTheme-hook (for instance in a custom theme selector in your sidebar/footer/etc. ) you can use a React context and provider.

```tsx
// Create a context (do this in a separate file).
export const ThemeContext = createContext({
  theme: "",
  setTheme: (theme: string) => {},
});
```

```tsx
// Same as before...
export default function Layout() {
  const loaderData = useLoaderData() as { theme: string };
  const fetcher = useFetcher();

  const [theme, setTheme] = useTheme(loaderData, fetcher);

  return (
    // ...but wrapped with a provider
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <html data-theme={theme}>...</html>
    </ThemeContext.Provider>
  );
}
```

```tsx
// Use the context to retrieve the theme and setter, as opposed to params
export default function ThemeSelector() {
  const { theme, setTheme } = useContext(ThemeContext);

  return <>...</>;
}
```

Repository
https://github.com/franzvrolijk/react-router-theme

Bugs
https://github.com/franzvrolijk/react-router-theme/issues
