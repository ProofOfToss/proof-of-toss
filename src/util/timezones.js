import timezones from "timezones.json"

export const TIME_ZONES = [].concat.apply([], timezones.map((item) => {
  return item.utc
}));