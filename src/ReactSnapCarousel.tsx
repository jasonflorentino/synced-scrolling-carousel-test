/**
 * REACT SNAP CAROUSEL might be too finicky;
 * maybe i've missed something but my setup
 * doesn't quite work as nicely as their examples.
 */

import { CSSProperties } from "React";
import { useSnapCarousel } from "react-snap-carousel";

const styles = {
  root: { width: "100%" },
  scroll: {
    position: "relative",
    display: "flex",
    overflow: "auto",
    scrollSnapType: "x mandatory",
    maxWidth: "calc(89vw - 2rem)",
    padding: "2rem 0",
    // scrollPadding: "0 10%",
  },
  item: {
    width: "250px",
    height: "250px",
    marginRight: "1rem",
    flexShrink: 0,
  },
  itemSnapPoint: {
    scrollSnapAlign: "center",
  },
  isActive: {
    // width: "290px",
    // height: "290px",
    // outline: "2px solid blue",
    // transition: "all 0.3s",
    // transform: "scale(1.1)",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  nextPrevButton: {},
  nextPrevButtonDisabled: { opacity: 0.3 },
  pagination: {
    display: "flex",
  },
  paginationButton: {
    margin: "10px",
    padding: "4px",
  },
  paginationButtonActive: { opacity: 0.3 },
  pageIndicator: {
    display: "flex",
    justifyContent: "center",
  },
} satisfies Record<string, CSSProperties>;

interface CarouselProps<T> {
  readonly items: T[];
  readonly renderItem: (
    props: CarouselRenderItemProps<T>
  ) => React.ReactElement<CarouselItemProps>;
}

interface CarouselRenderItemProps<T> {
  readonly item: T;
  readonly isSnapPoint: boolean;
  readonly isActive: boolean;
}

export const Carousel = <T extends any>({
  items,
  renderItem,
}: CarouselProps<T>) => {
  const {
    scrollRef,
    pages,
    activePageIndex,
    prev,
    next,
    goTo,
    snapPointIndexes,
  } = useSnapCarousel();
  console.log("snapPointIndexes", snapPointIndexes);

  return (
    <div style={styles.root}>
      <ul style={styles.scroll} ref={scrollRef}>
        {items.map((item, i) =>
          renderItem({
            item,
            isSnapPoint: snapPointIndexes.has(i),
            isActive: activePageIndex === i,
          })
        )}
      </ul>
    </div>
  );
};

interface CarouselItemProps {
  readonly isSnapPoint: boolean;
  readonly children?: React.ReactNode;
  readonly isActive?: boolean;
}

export const CarouselItem = ({
  isSnapPoint,
  children,
  isActive,
}: CarouselItemProps) => (
  <li
    style={{
      ...styles.item,
      ...(isSnapPoint ? styles.itemSnapPoint : {}),
      ...(isActive ? styles.isActive : {}),
    }}
  >
    {children}
  </li>
);
