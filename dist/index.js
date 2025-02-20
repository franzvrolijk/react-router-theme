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
exports.themeCookieResponse = exports.action = exports.loader = exports.createThemeCookie = exports.getThemeFromCookie = exports.useTheme = void 0;
const react_1 = require("react");
/**
 * See Readme: https://www.npmjs.com/package/react-router-theme
 */
const useTheme = (loaderData, fetcher, defaultTheme) => {
    let initialTheme;
    if (!loaderData || !("theme" in loaderData)) {
        throw new Error("Provided loader data does not contain theme.");
    }
    if (typeof loaderData.theme === "string") {
        initialTheme = loaderData.theme;
    }
    else if (loaderData.theme === null) {
        initialTheme = defaultTheme !== null && defaultTheme !== void 0 ? defaultTheme : "default";
    }
    else {
        throw new Error("Provider loader data contains an invalid value for theme.");
    }
    const [theme, setTheme] = (0, react_1.useState)(initialTheme);
    const changeTheme = (theme) => {
        setTheme(theme);
        localStorage.setItem("theme", theme);
        fetcher.submit({ action: "themeChange", theme: theme }, { method: "POST" });
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
 * @param req incoming request in loader
 * @returns the value of the theme cookie if found, otherwise NULL
 */
const getThemeFromCookie = (req) => {
    const cookieHeader = req.headers.get("Cookie");
    if (!cookieHeader)
        return null;
    const themeMatch = cookieHeader.match(/theme=([^;]+)/);
    if (!themeMatch)
        return null;
    return themeMatch[1];
};
exports.getThemeFromCookie = getThemeFromCookie;
const createThemeCookie = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const formData = yield req.formData();
    const theme = formData.get("theme");
    if (!theme)
        throw new Error("No theme specified in action form data");
    return `theme=${theme}; Path=/; Max-Age=31536000`;
});
exports.createThemeCookie = createThemeCookie;
const loader = (args) => __awaiter(void 0, void 0, void 0, function* () {
    return { theme: (0, exports.getThemeFromCookie)(args.request) };
});
exports.loader = loader;
const action = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const formData = yield args.request.formData();
    if (formData.get("action") === "themeChange")
        return yield (0, exports.themeCookieResponse)(args.request);
    return new Response("Unknown action. Create a custom action function to handle non-theme related requests.", { status: 500 });
});
exports.action = action;
const themeCookieResponse = (req) => __awaiter(void 0, void 0, void 0, function* () {
    return new Response(null, {
        headers: {
            "Set-Cookie": yield (0, exports.createThemeCookie)(req),
        },
    });
});
exports.themeCookieResponse = themeCookieResponse;
