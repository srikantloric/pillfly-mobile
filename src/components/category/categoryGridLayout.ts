import { HOME_CONTENT_PADDING_HORIZONTAL } from '../home/HomePromoBanner';

export const CATEGORY_GRID_COLUMNS = 3;
export const CATEGORY_GRID_GAP = 12;

export function categoryGridTileWidth(windowWidth: number): number {
  return Math.max(
    1,
    Math.floor(
      (windowWidth -
        HOME_CONTENT_PADDING_HORIZONTAL * 2 -
        CATEGORY_GRID_GAP * (CATEGORY_GRID_COLUMNS - 1)) /
        CATEGORY_GRID_COLUMNS,
    ),
  );
}
