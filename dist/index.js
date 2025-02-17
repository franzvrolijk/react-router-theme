"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.themeAction = exports.themeLoader = exports.createThemeCookie = exports.getThemeFromCookie = exports.useTheme = void 0;
const react_1 = require("react");
const react_router_1 = require("react-router");
/**
 * Use the theme value wherever you want (probably as the data-theme attribute on your html-tag)
 *
 * Use the setter wherever you want (probably in your own custom theme-selector componennt)
 *
 * @returns [theme, setTheme] A stateful theme variable value and it's setter
 */
const useTheme = () => {
    const { theme: initialTheme } = (0, react_router_1.useLoaderData)();
    if (!initialTheme)
        throw new Error("No theme returned from loader");
    const [theme, setTheme] = (0, react_1.useState)(initialTheme);
    const fetcher = (0, react_router_1.useFetcher)();
    const changeTheme = (theme) => {
        setTheme(theme);
        localStorage.setItem("theme", theme);
        fetcher.submit({ theme: theme }, { method: "POST" });
    };
    // Sync theme updates across windows and tabs using local storage
    const localStorageEventHandler = (event) => {
        if (event.key !== "theme" || event.oldValue === event.newValue || event.newValue === null)
            return;
        setTheme(event.newValue);
    };
    (0, react_1.useEffect)(() => {
        window.addEventListener("storage", localStorageEventHandler);
        return () => window.removeEventListener("storage", localStorageEventHandler);
    }, []);
    return [theme, changeTheme];
};
exports.useTheme = useTheme;
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
const getThemeFromCookie = (req, defaultTheme) => {
    const cookieHeader = req.headers.get("Cookie");
    if (!cookieHeader)
        return defaultTheme !== null && defaultTheme !== void 0 ? defaultTheme : "default";
    const themeMatch = cookieHeader.match(/theme=([^;]+)/);
    if (!themeMatch)
        return defaultTheme !== null && defaultTheme !== void 0 ? defaultTheme : "default";
    return themeMatch[1];
};
exports.getThemeFromCookie = getThemeFromCookie;
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
const createThemeCookie = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const formData = yield req.formData();
    const theme = formData.get("theme");
    if (!theme)
        throw new Error("No theme specified in action form data");
    return `theme=${theme}; Path=/; Max-Age=31536000`;
});
exports.createThemeCookie = createThemeCookie;
/**
 * Export this loader from your route for the useTheme hook to work.
 *
 * If you need custom logic in your loader, see {@link getThemeFromCookie}
 *
 * @example export { loader, action } from "react-router-themes";
 */
const themeLoader = (args) => __awaiter(void 0, void 0, void 0, function* () {
    return { theme: (0, exports.getThemeFromCookie)(args.request) };
});
exports.themeLoader = themeLoader;
/**
 * Export this action from your route for the useTheme hook to work.
 *
 * If you need custom logic in your action, see {@link createThemeCookie}
 *
 * @example export { loader, action } from "react-router-themes";
 */
const themeAction = (args) => __awaiter(void 0, void 0, void 0, function* () {
    return new Response(null, {
        headers: {
            "Set-Cookie": yield (0, exports.createThemeCookie)(args.request),
        },
    });
});
exports.themeAction = themeAction;
