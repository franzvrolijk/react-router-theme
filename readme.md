# react-router-theme

## What

- ✅ SSR themes without flashing
- ✅ Immediate updates across windows and tabs
- ✅ Perfect for [daisyUI](https://daisyui.com/) themes
- ✅ Perfect for [Tailwind CSS data attribute](https://tailwindcss.com/docs/dark-mode#using-a-data-attribute) themes
- ✅ Compatible with system-preference dark mode for themes supporting it
- ✅ Made for React Router (v7) and Remix

> [!NOTE]
> This is essentially a less featured version of [remix-themes](https://www.npmjs.com/package/remix-themes), ideal if you'd like to get up and running with SSR themes with the least amount of effort. For more advanced use cases, consider remix-themes.

## How

This package provides a useTheme-hook along with a pre-defined loader and action to simplify enabling "SSR themes". Utility functions for implementing this in custom loaders and actions are also provided.

### Installation

`npm install react-router-theme@latest`

### Usage

0. (Add support for data attribute themes by installing daisyUI or setting up themes with Tailwind CSS)
1. Find a suitable route (`root.tsx` or other root/layout routes are recommended to enable themes globally)
2. Import `useTheme` and export `{ loader, action }` from this package
3. Call the useTheme-hook and pass it your loader data and a fetcher instance.
4. Use the returned values according to your setup

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

Feel free to use a custom loader and/or action for the given route (just leave out the export(s) from step 2 if you do).
The only constraints your loader and action must follow for useTheme to work are:

- loader response must contain theme under the key `theme` (provided by `getThemeFromCookie()`)

```ts
export const loader = async (args) => {
  const otherData = ...;

  return { theme: await getThemeFromCookie(args.request), otherData: otherData };
};
```

- actions triggered by theme-change must return a response with a `Set-Cookie`-header (provided by `themeCookieResponse()`)

```ts
export const action = async (args) => {
  const formData = await args.request.formData();

  // Use formData to identify theme-change requests
  if (formData.get("theme"))
    return await themeCookieResponse(args.request);

  // Other actions
  ...
};
```

```ts
const action = async (args) => {
  const formData = await args.request.formData();

  if (formData.get("theme")) {
    const additionalData = ...;

    // Custom responses are also fine, just include the header using createThemeCookie
    return new Reponse(additionalData, {
      headers: { "Set-Cookie": await createThemeCookie(args.request) },
    });
  }

  // Other actions
  ...
};
```

#### Default theme

If the user has no theme cookie set, the included loader will return `"default"` as the default theme. To override this, either:

- check for default value and override

```tsx
const [theme, setTheme] = useTheme(loaderData, fetcher);

return <html data-theme={theme !== "default" ? theme : "myDefaultTheme"}>...</html>;
```

- use a custom loader and pass your desired default value to `getThemeFromCookie`.

```ts
export const loader = async (args) => {
  return { theme: await getThemeFromCookie(args.request, "myDefaultTheme") };
};
```

#### Context and provider

If you need access to the theme or setter in a different route/component from where you call the useTheme-hook (for instance in a custom theme selector in your sidebar/footer/etc. ) you can use a React context and provider.

```tsx
// Create a context
export const ThemeContext = createContext({
  theme: "default",
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
