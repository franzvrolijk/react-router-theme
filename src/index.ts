import { useEffect, useState } from "react";
import { ActionFunction, ActionFunctionArgs, FetcherWithComponents, LoaderFunction, LoaderFunctionArgs } from "react-router";

/**
 * See Readme: https://www.npmjs.com/package/react-router-theme
 */
export const useTheme = (loaderData: { theme: string }, fetcher: FetcherWithComponents<any>) => {
  const { theme: initialTheme } = loaderData;

  if (!initialTheme) throw new Error("No theme returned from loader");

  const [theme, setTheme] = useState<string>(initialTheme);

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

export const getThemeFromCookie = (req: Request, defaultTheme?: string) => {
  const cookieHeader = req.headers.get("Cookie");
  if (!cookieHeader) return defaultTheme ?? "default";

  const themeMatch = cookieHeader.match(/theme=([^;]+)/);
  if (!themeMatch) return defaultTheme ?? "default";

  return themeMatch[1];
};

export const createThemeCookie = async (req: Request) => {
  const formData = await req.formData();
  const theme = formData.get("theme");

  if (!theme) throw new Error("No theme specified in action form data");

  return `theme=${theme}; Path=/; Max-Age=31536000`;
};

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  return { theme: getThemeFromCookie(args.request) };
};

export const action: ActionFunction = async (args: ActionFunctionArgs) => {
  return await themeCookieResponse(args.request);
};

export const themeCookieResponse = async (req: Request) => {
  return new Response(null, {
    headers: {
      "Set-Cookie": await createThemeCookie(req),
    },
  });
};
