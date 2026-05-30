import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { getSession } from "./features/auth/client";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LearnIndexPage } from "./pages/LearnIndexPage";
import { ModulePage } from "./pages/ModulePage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signin",
  component: () => <AuthPage mode="signin" />,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: () => <AuthPage mode="signup" />,
});

async function requireUser() {
  const user = await getSession();
  if (!user) throw redirect({ to: "/signin" });
  return user;
}

async function requireAdminUser() {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "owner") throw redirect({ to: "/dashboard" });
  return user;
}

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: () => requireUser(),
  component: DashboardPage,
});

const learnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/learn",
  beforeLoad: () => requireUser(),
  component: LearnIndexPage,
});

const moduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/learn/$moduleId",
  beforeLoad: () => requireUser(),
  component: ModulePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: () => requireAdminUser(),
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  signUpRoute,
  dashboardRoute,
  learnRoute,
  moduleRoute,
  adminRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
