import config from "../../data/config.json"

export default function checkRouteLocale(nextState, replace) {
  const languageCode = config.languages.list.map((value) => {
    return value['code'];
  });

  const locale = nextState.params.locale;

  if(locale === undefined || false === languageCode.includes(locale)) {
    replace(`/${config.languages.list[0].code}${nextState.location.pathname}`);
  }
}