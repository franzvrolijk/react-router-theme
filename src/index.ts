import { useEffect, useState } from "react";
import { ActionFunction, ActionFunctionArgs, LoaderFunction, LoaderFunctionArgs, useFetcher, useLoaderData } from "react-router";

/**
 * Use the theme value wherever you want (probably as the data-theme attribute on your html-tag)
 *
 * Use the setter wherever you want (probably in your own custom theme-selector componennt)
 *
 * @returns [theme, setTheme] A stateful theme variable value and it's setter
 */
export const useTheme = () => {
  const { theme: initialTheme } = useLoaderData() as { theme: string };
  if (!initialTheme) throw new Error("No theme returned from loader");

  const [theme, setTheme] = useState<string>(initialTheme);

  const fetcher = useFetcher();

  const changeTheme = (theme: string) => {
    setTheme(theme);
    localStorage.setItem("theme", theme);
    fetcher.submit({ theme: theme }, { method: "POST" });
  };

  // Sync theme updates across windows and tabs using local storage
  const localStorageEventHandler = (event: StorageEvent) => {
    if (event.key !== "theme" || event.oldValue === event.newValue || event.newValue === null) return;

    setTheme(event.newValue);
  };

  useEffect(() => {
    window.addEventListener("storage", localStorageEventHandler);
    return () => window.removeEventListener("storage", localStorageEventHandler);
  }, []);

  return [theme, changeTheme] as const;
};

/**
 * If you need custom logic in your route loader, use this to get the theme cookie value.
 *
 * If you don't, use the predefined {@link loader} instead.
 *
 * @example
 * ... loader = (args) => {
 *  ... // custom logic
 *
 *  return {
 *      theme: getThemeFromCookie(args.request),
 *      otherKey1: ...,
 *      otherKey2: ...
 *  };
 * }
 *
 * @param req the incoming request in your loader function
 * @param defaultTheme (optional) the theme to choose if the user has not yet selected a theme (default value is "default")
 * @returns value of the "theme" cookie if found, otherwise default
 */
export const getThemeFromCookie = (req: Request, defaultTheme?: string) => {
  const cookieHeader = req.headers.get("Cookie");
  if (!cookieHeader) return defaultTheme ?? "default";

  const themeMatch = cookieHeader.match(/theme=([^;]+)/);
  if (!themeMatch) return defaultTheme ?? "default";

  return themeMatch[1];
};

/**
 * If you need custom logic in your route action, use this to create the theme cookie.
 *
 * If you don't, use the predefined {@link action} instead.
 *
 * @example
 * ... action = (args) => {
 *  ... // custom logic
 *  return new Response(..., {
 *      headers: {
 *          "Set-Cookie": await createThemeCookie(args.request),
 *          ...
 *      }
 *  });
 * };
 * @param req the incoming action request sent from changeTheme in {@link useTheme}
 * @returns string value of the theme cookie (set the 'Set-Cookie' header value to this in the action response)
 */
export const createThemeCookie = async (req: Request) => {
  const formData = await req.formData();
  const theme = formData.get("theme");

  if (!theme) throw new Error("No theme specified in action form data");

  return `theme=${theme}; Path=/; Max-Age=31536000`;
};

/**
 * Export this loader from your route for the useTheme hook to work.
 *
 * If you need custom logic in your loader, see {@link getThemeFromCookie}
 *
 * @example export { loader, action } from "react-router-themes";
 */
export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  return { theme: getThemeFromCookie(args.request) };
};

/**
 * Export this action from your route for the useTheme hook to work.
 *
 * If you need custom logic in your action, see {@link createThemeCookie}
 *
 * @example export { loader, action } from "react-router-themes";
 */
export const action: ActionFunction = async (args: ActionFunctionArgs) => {
  return new Response(null, {
    headers: {
      "Set-Cookie": await createThemeCookie(args.request),
    },
  });
};
