# react-router-theme

Package for storing the user's preferred theme, making sure that:

- the correct theme is rendered on the server in SSR, removing the initial flash of default theme on load
- all tabs and windows displaying your app are immediately affected when changing themes

Ideal for (but not limited to) CSS libraries that support the `<html data-theme="...">` attribute, such as daisyUI.

Package contents:

- pre-made loader and action functions for React Router v7
- functions for storing and retrieving theme cookies (when not using the premade loader and action)
- useTheme-hook
  - returns both user preferred theme, as well as a setter that updates local state, cookies and local storage
  - registers event listener to theme-updates in local storage, allowing for immediate update for all tabs and windows

## Installation

`npm install react-router-theme@latest`

## Usage

Call the useTheme-hook and pass it your loader data and a fetcher instance.
Export the loader and action straight from the package if you don't need any custom logic.

Call this hook once in one of your top-level/layout routes, for instance where your `<html>`-tag is rendered.

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
      <MyThemeSelector theme={theme} setTheme={setTheme}>
    </html>
  );
}
```

### Custom loader and action

Feel free to use a custom loader or action for the given route, the only constraints are:

- loader response must contain theme under key `theme` (see `getThemeFromCookie`)

```ts
const loader = async (args) => {
  const otherData = ...;

  return { theme: await getThemeFromCookie(args.request), otherData: otherData };
};
```

- actions triggered by theme-change must return a response with a `Set-Cookie`-header (see`themeCookieResponse`)

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

Repository
https://github.com/franzvrolijk/react-router-theme

Bugs
https://github.com/franzvrolijk/react-router-theme/issues

Homepage
https://github.com/franzvrolijk/react-router-theme#readme
