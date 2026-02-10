export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {locale === "pt" ? "Bem-vindo" : "Welcome"}
      </h1>
      <p className="text-lg text-gray-600">
        {locale === "pt"
          ? "Este site e alimentado pelo AngulaCMS."
          : "This site is powered by AngulaCMS."}
      </p>
    </div>
  );
}
