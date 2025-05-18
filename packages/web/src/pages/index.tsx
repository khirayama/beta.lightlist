import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { ButtonLink } from "components/LinkButton";

export default function IndexPage({ locale }) {
  const { t } = useTranslation("pages/index");

  return (
    <div>
      <header className="mx-auto max-w-2xl py-4 text-right">
        <a
          href="/?locale=en"
          className="rounded-sm px-4 py-2 focus-visible:bg-gray-200"
        >
          English
        </a>
        <a
          href="/?locale=ja"
          className="rounded-sm px-4 py-2 focus-visible:bg-gray-200"
        >
          日本語
        </a>
      </header>
      <div className="pb-8">
        <div className="pt-24 pb-4 text-center">
          <img
            src="/logo.svg"
            alt="Lightlist"
            className="m-auto w-[80px] py-4"
          />
          <h1 className="p-4 text-center">Lightlist</h1>
        </div>
        <div className="p-4 text-center">
          <ButtonLink href={`/register?locale=${locale}`}>
            {t("Get started")}
          </ButtonLink>
        </div>
        <div className="m-auto max-w-lg p-8 text-justify">
          <p className="my-4">
            {t("Lightlist is a simple task list service.")}
          </p>
          <p>
            {t(
              "It can be used as a ToDo list for task management or a shopping list. You can share lists with people who are not registered."
            )}
          </p>
        </div>
      </div>

      <div className="bg-gray-100 pt-8">
        <div className="relative mx-auto aspect-video max-w-3xl overflow-hidden">
          <img
            className="absolute bottom-[-100px] left-[32px] w-[80%] min-w-[320px] shadow-2xl"
            src={`/screenshot_${locale}_desktop.png`}
          />
          <img
            className="absolute right-[32px] bottom-[-60px] w-[24%] min-w-[105px] rotate-6 shadow-2xl"
            src={`/screenshot_${locale}_mobile.png`}
          />
        </div>
      </div>

      <footer className="p-12 text-center">
        <div className="p-4 text-center">
          <ButtonLink href={`/login?locale=${locale}`}>
            {t("Get started")}
          </ButtonLink>
        </div>
      </footer>
    </div>
  );
}

export const getServerSideProps = async ({ query, locale }) => {
  const l = query.locale || locale;
  return {
    props: {
      locale: l,
      ...(await serverSideTranslations(l, ["pages/index"])),
    },
  };
};
