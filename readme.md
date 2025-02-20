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

The hook assures that the user's preferred theme is stored in cookies and local storage when set, loaded by the server when rendering server-side, and immediately visible across all tabs and windows when updated.

### Installation

`npm install react-router-theme@latest`

### Usage

> [!NOTE]
> Whilst you can apply your themes however you'd like, this package was designed and tested with data attribute themes. [This works out of the box with daisyUI](https://daisyui.com/docs/themes/), but if you'd like a custom Tailwind approach, you can have a look at [react-router-theme-example](https://github.com/franzvrolijk/react-router-theme-example).

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

If you need to customize the loader or action on the given route (or simply don't want to use the provided ones), just make sure to:

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

- return `themeCookieResponse(formData)` from your action if the form data matches `action: 'themeChange'`

```ts
export const action = async (args) => {
  const formData = await args.request.formData();
  const action = formData.get("action");

  if (action === "themeChange") return themeCookieResponse(formData);

  // Other actions...
};
```

(custom responses are also fine, just include `Set-Cookie`-header using `createThemeCookie(formData)`)

```ts
if (action === "themeChange") {
  const otherData = ...;

  return new Response(otherData, {
    headers: { "Set-Cookie": createThemeCookie(formData) },
  });
}
```

#### Default theme

If the user has no theme cookie set, the returned theme will be `"default"`. To specify a different default value, pass it as a third parameter to the hook:

```tsx
const [theme, setTheme] = useTheme(loaderData, fetcher, "myDefaultTheme");
```

#### Context and provider

If you need access to the theme or setter in a different route/component (for instance in a custom theme selector in your sidebar/footer/etc.), you can use a React context and provider.

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
// Use the context to access theme and setter
export default function ThemeSelector() {
  const { theme, setTheme } = useContext(ThemeContext);

  return <>...</>;
}
```

Repository
https://github.com/franzvrolijk/react-router-theme

Bugs
https://github.com/franzvrolijk/react-router-theme/issues
