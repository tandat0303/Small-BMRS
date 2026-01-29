let navigateFn: (path: string) => void;

export const setNavigator = (nav: typeof navigateFn) => {
  navigateFn = nav;
};

export const navigateTo = (path: string) => {
  if (navigateFn) navigateFn(path);
};
