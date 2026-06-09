type BranchSurveyPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams(): Array<{ token: string }> {
  return [{ token: "placeholder" }];
}

export default async function BranchSurveyPage({
  params,
}: BranchSurveyPageProps) {
  const { token } = await params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-normal">
        Encuesta por QR
      </h1>
      <p className="text-muted-foreground">
        Placeholder para la encuesta publica de sucursal.
      </p>
      <p className="text-sm text-muted-foreground">Token: {token}</p>
    </main>
  );
}
