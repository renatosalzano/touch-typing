import { us_qwerty } from "./ANSI/us_qwerty";
import { it_qwerty } from "./ISO/it_qwerty";

export const layouts = {
  ANSI: {
    'United States QWERTY': us_qwerty,
  },
  ISO: {
    'Italiano QWERTY': it_qwerty,
  },
};

export const getLayouts = () => {
  const list: string[] = [];
  Object.keys(layouts).forEach((standard) => {
    Object.keys((layouts as any)[standard]).forEach((layout) => {
      list.push(`${standard} - ${layout}`);
    });
  });
  return list;
};
