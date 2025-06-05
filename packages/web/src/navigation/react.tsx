import {
  createContext,
  useEffect,
  ReactNode,
  useRef,
  useContext,
  useState,
} from "react";
import { match, MatchFunction } from "path-to-regexp";

/*
 * type NavigationAttr
 * type RouteDefinition
 * NavigationProvider
 * useNavigation
 * NavigateLink
 */

interface RouteParams {
  [key: string]: string;
}

interface NavigationAttr {
  routes?: Record<string, unknown>;
  stack?: string[];
  match?: string;
  path?: string;
  params?: RouteParams;
  props?: unknown;
  referrer?: string;
}

type RouteDefinition = {};

export type RouteDefinitions = Record<string, RouteDefinition>;

function getPathnameAndSearchFromHash() {
  const hash = window.location.hash.split("#")[1] || "";
  const pathname = hash.split("?")[0];
  const search = hash.split("?")[1] || "";
  return { pathname, search };
}

type Navigation = {
  navigate: (path: string) => void;
  push: (path: string) => void;
  goBack: () => void;
  popTo: (path: string) => void;
  popToTop: () => void;
  getAttr: () => NavigationAttr;
};

type NavigationProviderProps = {
  children: ReactNode;
  initialPath: string;
  routes: RouteDefinitions;
};

const NavigationContext = createContext<Navigation | null>(null);

export function NavigationProvider({
  children,
  initialPath,
  routes,
}: NavigationProviderProps) {
  const stack = useRef<string[]>([]);
  const referrer = useRef<string>("");
  const [isInBrowser, setIsInBrowser] = useState(false);
  const [, setRender] = useState(Date.now());

  useEffect(() => {
    setIsInBrowser(true);
  }, []);

  useEffect(() => {
    if (isInBrowser) {
      window.addEventListener("popstate", (e) => {
        e.preventDefault();
        stack.current = e.state?.stack || [initialPath];
        setRender(Date.now());
      });

      const { pathname: pathname, search } = getPathnameAndSearchFromHash();
      const path = !pathname ? initialPath : pathname;
      stack.current.push(path);
      window.history.pushState(
        { stack: stack.current },
        "",
        `#${path}?${search}`
      );
      setRender(Date.now());
    }
  }, [isInBrowser]);

  const navigation: Navigation = {
    push: (path: string) => {
      referrer.current = stack.current[stack.current.length - 1];
      stack.current.push(path);
      window.history.pushState({ stack: stack.current }, "", `#${path}`);
      setRender(Date.now());
    },
    navigate: (path: string) => {
      referrer.current = stack.current[stack.current.length - 1];
      if (stack.current[stack.current.length - 1] !== path) {
        navigation.push(path);
      }
    },
    goBack: () => {
      referrer.current = stack.current[stack.current.length - 1];
      if (stack.current.length > 1) {
        window.history.back();
        stack.current.pop();
      }
      setRender(Date.now());
    },
    popTo: (targetPath: string) => {
      referrer.current = stack.current[stack.current.length - 1];
      const hasTargetPath = stack.current.includes(targetPath);
      if (hasTargetPath) {
        while (stack.current[stack.current.length - 1] !== targetPath) {
          window.history.back();
          stack.current.pop();
        }
      } else {
        stack.current[stack.current.length - 1] = targetPath;
        window.history.replaceState(
          { stack: stack.current },
          "",
          `#${targetPath}`
        );
      }
      setRender(Date.now());
    },
    popToTop: () => {
      referrer.current = stack.current[stack.current.length - 1];
      const hasTargetPath = stack.current.includes(initialPath);
      if (hasTargetPath) {
        while (stack.current[stack.current.length - 1] !== initialPath) {
          window.history.back();
          stack.current.pop();
        }
      } else {
        stack.current[stack.current.length - 1] = initialPath;
        window.history.replaceState(
          { stack: stack.current },
          "",
          `#${initialPath}`
        );
      }
      setRender(Date.now());
    },
    getAttr: () => {
      if (!isInBrowser) {
        return {};
      }

      const { pathname } = getPathnameAndSearchFromHash();
      const route = Object.keys(routes).find((r) => {
        const m: MatchFunction<Record<string, string>> = match(r);
        return m(pathname);
      });
      if (route) {
        const params = match<RouteParams>(route)(pathname) as {
          path: string;
          params: RouteParams;
        };
        return {
          routes,
          stack: stack.current,
          match: route,
          path: params.path,
          params: params.params,
          props: routes[route],
          referrer: referrer.current,
        };
      }
      return {};
    },
  };

  return (
    <NavigationContext.Provider value={navigation}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}

export function NavigateLink(props: {
  to: string;
  children: ReactNode;
  className?: string;
  method?: "navigate" | "push" | "goBack" | "popTo" | "popToTop";
  tabIndex?: number;
  onKeyPress?: (e: React.KeyboardEvent<HTMLAnchorElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLAnchorElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLAnchorElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const navigation = useNavigation();
  const method = props.method || "navigate";

  return (
    <a
      tabIndex={props.tabIndex}
      className={props.className}
      href={props.to}
      onClick={(e) => {
        e.preventDefault();
        if (method === "navigate") {
          navigation.navigate(props.to);
        } else if (method === "push") {
          navigation.push(props.to);
        } else if (method === "goBack") {
          navigation.goBack();
        } else if (method === "popTo") {
          navigation.popTo(props.to);
        } else if (method === "popToTop") {
          navigation.popToTop();
        }
      }}
    >
      {props.children}
    </a>
  );
}
