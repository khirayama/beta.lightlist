/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en"],
  },
  fallbackLng: {
    default: ["en"],
  },
  nonExplicitSupportedLngs: true,
};
