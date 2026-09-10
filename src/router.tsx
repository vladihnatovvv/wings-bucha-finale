import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-7xl font-bold text-foreground">404</h1>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Сторінку не знайдено</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Сторінка, яку ви шукаєте, не існує або була переміщена.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            На головну
          </a>
        </div>
      </div>
    ),
    defaultErrorComponent: ({ error }: { error: Error }) => {
      console.error(error);
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Сторінка не завантажилась
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Сталася помилка. Спробуйте оновити сторінку або поверніться на головну.
            </p>
            <a
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              На головну
            </a>
          </div>
        </div>
      );
    },
  });

  return router;
};
