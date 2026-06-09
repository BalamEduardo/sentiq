type DeviceSurveyPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams(): Array<{ token: string }> {
  return [{ token: "placeholder" }];
}

export default async function DeviceSurveyPage({
  params,
}: DeviceSurveyPageProps) {
  const { token } = await params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-normal">
        Encuesta en dispositivo
      </h1>
      <p className="text-muted-foreground">
        Placeholder para la encuesta en modo dispositivo.
      </p>
      <p className="text-sm text-muted-foreground">Token: {token}</p>
    </main>
  );
}
