import { useEffect, useState } from "react";

/**
 * See Readme: https://www.npmjs.com/package/react-router-theme
 */
export const useTheme = (loaderData: any, fetcher: any, defaultTheme?: string) => {
  let initialTheme: string;

  if (!loaderData || !("theme" in loaderData)) {
    throw new Error("Provided loader data does not contain theme.");
  }

  if (typeof loaderData.theme === "string") {
    initialTheme = loaderData.theme;
  } else if (loaderData.theme === null) {
    initialTheme = defaultTheme ?? "default";
  } else {
    throw new Error("Provider loader data contains an invalid value for theme.");
  }

  const [theme, setTheme] = useState<string>(initialTheme);

  const changeTheme = (theme: string) => {
    setTheme(theme);
    localStorage.setItem("theme", theme);
    fetcher.submit({ action: "themeChange", theme: theme }, { method: "POST" });
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
 * @param req incoming request in loader
 * @returns the value of the theme cookie if found, otherwise NULL
 */
export const getThemeFromCookie = (req: Request) => {
  const cookieHeader = req.headers.get("Cookie");
  if (!cookieHeader) return null;

  const themeMatch = cookieHeader.match(/theme=([^;]+)/);
  if (!themeMatch) return null;

  return themeMatch[1];
};

export const createThemeCookie = (formData: FormData) => {
  const theme = formData.get("theme");

  if (!theme) throw new Error("No theme specified in action form data");

  return `theme=${theme}; Path=/; Max-Age=31536000`;
};

export const loader = async (args: { request: Request }) => {
  return { theme: getThemeFromCookie(args.request) };
};

export const action = async (args: { request: Request }) => {
  const formData = await args.request.formData();

  if (formData.get("action") === "themeChange") return themeCookieResponse(formData);

  return new Response("Unknown action. Create a custom action function to handle non-theme related requests.", { status: 500 });
};

export const themeCookieResponse = (formData: FormData) => {
  return new Response(null, {
    headers: {
      "Set-Cookie": createThemeCookie(formData),
    },
  });
};
