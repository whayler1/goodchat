const defaultState = {
  shouldShowHeroLink: true,
  shouldShowNav: false
};

const SHOW_HERO_LINK = 'navbar/show-hero-link';
const HIDE_HERO_LINK = 'navbar/hide-hero-link';
const SHOW_NAV = 'navbar/show-nav';
const HIDE_NAV = 'navbar/hide-nav';

export const showHeroLink = () => ({
  type: SHOW_HERO_LINK
});

export const hideHeroLink = () => ({
  type: HIDE_HERO_LINK
});

export const showNav = () => ({
  type: SHOW_NAV
});

export const hideNav = () => ({
  type: HIDE_NAV
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
  case SHOW_HERO_LINK:
    return {
      ...state,
      shouldShowHeroLink: true
    }
  case HIDE_HERO_LINK:
    return {
      ...state,
      shouldShowHeroLink: false
    }
  case SHOW_NAV:
    return {
      ...state,
      shouldShowNav: true
    }
  case HIDE_NAV:
    return {
      ...state,
      shouldShowNav: false
    }
  default:
    return state;
  }
}
