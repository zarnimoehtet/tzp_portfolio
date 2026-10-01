import { Container, PillLink } from "./components";

export function MinimalNotFoundPage() {
  return (
    <Container className="flex min-h-[80svh] flex-col justify-center pt-28 pb-20">
      <p className="text-sm font-medium text-muted-ink">404</p>
      <h1 className="mt-4 font-display text-5xl tracking-[-0.035em] md:text-7xl">
        This frame is empty.
      </h1>
      <p className="mt-5 max-w-md text-base text-muted-ink">
        The page you were looking for has moved or never existed.
      </p>
      <div className="mt-10">
        <PillLink href="/">Return home</PillLink>
      </div>
    </Container>
  );
}
