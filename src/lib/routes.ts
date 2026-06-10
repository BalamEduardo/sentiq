import { getPublicEnv } from "@/config/env";
import { ROUTES } from "@/config/routes";

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return ROUTES.HOME;
  }

  const [path] = pathname.split(/[?#]/);
  const normalized = path.replace(/\/+$/, "");

  return normalized || ROUTES.HOME;
}

function isRouteOrSubroute(pathname: string, route: string): boolean {
  const normalizedPathname = normalizePathname(pathname);

  return (
    normalizedPathname === route || normalizedPathname.startsWith(`${route}/`)
  );
}

function encodeToken(token: string): string {
  return encodeURIComponent(token.trim());
}

export function buildSurveyQrPath(token: string): string {
  return `${ROUTES.SURVEY_QR}/${encodeToken(token)}`;
}

export function buildDeviceSurveyPath(token: string): string {
  return `${ROUTES.DEVICE_SURVEY}/${encodeToken(token)}`;
}

export function buildSurveyQrUrl(token: string): string {
  return new URL(buildSurveyQrPath(token), getPublicEnv().NEXT_PUBLIC_APP_URL)
    .href;
}

export function buildDeviceSurveyUrl(token: string): string {
  return new URL(
    buildDeviceSurveyPath(token),
    getPublicEnv().NEXT_PUBLIC_APP_URL,
  ).href;
}

export function isCaptureRoute(pathname: string): boolean {
  return (
    isRouteOrSubroute(pathname, ROUTES.SURVEY_QR) ||
    isRouteOrSubroute(pathname, ROUTES.DEVICE_SURVEY)
  );
}

export function isAppRoute(pathname: string): boolean {
  return isRouteOrSubroute(pathname, ROUTES.APP);
}

export function isPlatformAdminRoute(pathname: string): boolean {
  return isRouteOrSubroute(pathname, ROUTES.PLATFORM_ADMIN);
}

export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    ROUTES.HOME,
    ROUTES.PRIVACY,
    ROUTES.LOGIN,
    ROUTES.AUTH_CALLBACK,
    ROUTES.LOGOUT,
    ROUTES.THANK_YOU,
    ROUTES.INVALID_LINK,
  ];

  const normalizedPathname = normalizePathname(pathname);

  return publicRoutes.some((route) => normalizedPathname === route);
}
