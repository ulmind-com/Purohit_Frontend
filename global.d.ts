import en from "./messages/en.json";

type Messages = typeof en;

declare global {
  // Use type safe message keys for next-intl
  interface IntlMessages extends Messages {}
}
