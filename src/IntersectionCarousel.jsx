import { useRef, useEffect, useState } from "react";

const debug = console.log;

/** 0, 0.01, 0.02, ..., 0.98, 0.99, 1 */
// const thresholds = Array.from({ length: 101 }).map((_, i) => {
//   return Number((i * 0.01).toFixed(2));
// });

/** 0, 0.02, 0.04, ..., 0.96, 0.98, 1 */
const thresholds = Array.from({ length: 51 }).map((_, i) => {
  return Number((i * 0.02).toFixed(2));
});

/**
 * we need to know this to properly
 * measure where snapping points are
 */
const GAP = 16;

const styles = {
  ul: {
    display: "flex",
    overflowX: "scroll",
    width: "80vw",
    minWidth: "250px",
    maxWidth: "500px",
    scrollSnapType: "x mandatory",
    position: "relative",
    padding: "2rem",
  },
  li: {
    margin: `0 ${GAP}px`,
    scrollSnapAlign: "center",
  },
};

/**
 * Carousel
 * matched scroll-snap carousels.
 *
 * monitor scrolling events to know when
 * we should update the `activeId`. Which
 * ID we choose is determined by using
 * an Intersection Obeserver to know
 * which item is in the 'center'
 */
export function Carousel({ items, renderItem, renderItemMarkers, startId }) {
  const itemScrollerRef = useRef(null);
  const itemMarkerRef = useRef(null);
  const [activeItemId, setActiveItemId] = useState(startId ?? 0);

  /**
   * take mesurements for constant values.
   * also use those measurements to add extra
   * space to the front and back so we can
   * usually get the first and last items
   * scrolled into the center.
   *
   * TODO: handle recomputing measurements on window resize?
   */
  useEffect(() => {
    // ITEMS
    const itemNodes = itemScrollerRef.current.childNodes;
    itemScrollerRef.itemSize = itemNodes[0].offsetWidth + GAP * 2;

    itemScrollerRef.offset = Math.floor(
      itemNodes[0].offsetLeft -
        itemScrollerRef.current.clientWidth / 2 +
        itemNodes[0].offsetWidth / 2
    );

    // extra space on ends
    itemNodes[0].style.setProperty(
      "margin-left",
      itemScrollerRef.itemSize + "px"
    );
    itemNodes[itemNodes.length - 1].style.setProperty(
      "margin-right",
      itemScrollerRef.itemSize + "px"
    );

    // MARKERS

    const markerNodes = itemMarkerRef.current.childNodes;

    itemMarkerRef.itemSize = markerNodes[0].offsetWidth + GAP * 2;

    // extra space on ends
    markerNodes[0].style.setProperty(
      "margin-left",
      itemMarkerRef.itemSize + "px"
    );
    markerNodes[markerNodes.length - 1].style.setProperty(
      "margin-right",
      itemMarkerRef.itemSize + "px"
    );
  }, []);

  /**
   * handle observing when the items scroll
   * into the center of scrolling container.
   * This is how we know which item is 'active'
   * (by which is intersecting most with the center)
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        /** maintain which element is the center one */
        itemScrollerRef.center = _getMaxItersection(
          entries,
          itemScrollerRef.center
        );
        debug(
          "observer",
          entries.length,
          itemScrollerRef.center?.dataset.id,
          entries.map((entry) => {
            return [entry.target.dataset.id, entry.intersectionRatio].join();
          })
        );
      },
      {
        root: itemScrollerRef.current,
        /**
         * the root box should be as close as
         * possible to (but gt) the size of one element.
         * As long as we don't want a large portion
         * of non-active elements to be visible,
         * -20% on either side is a good balance for
         * the window widths + item sizes we're using.
         */
        rootMargin: "0% -20% 0% -20%",
        threshold: thresholds,
      }
    );
    if (itemScrollerRef.current) {
      for (const child of itemScrollerRef.current.childNodes) {
        observer.observe(child);
      }
    }
    return () => {
      if (itemScrollerRef.current) {
        for (const child of itemScrollerRef.current.childNodes) {
          observer.unobserve(child);
        }
      }
    };
  }, []);

  useEffect(() => {
    const listeners = [
      /**
       * `scrollend` was suppoted for Elements API in:
       * Edge 114    (Jun 2023)
       * Chrome 114  (May 2023)
       * Firefox 109 (Jan 2023)
       *
       * this is perfect. it fires only AFTER scroll-snap finishes settling
       * the elements inside the scrolling box. makes our job easy.
       */
      [
        "scrollend",
        (e) => {
          debug("scrollend", itemScrollerRef.center?.dataset.id, e);
          const activeId = Number(itemScrollerRef.center?.dataset.id ?? 0);
          setActiveItemId(activeId);
        },
      ],
      /**
       * Unfortch, Safari does not support `scrollend` on elements.
       * So before we can update the active ID we need to
       * deterine for ourselves when scrolling has ended.
       * (ie. when scroll-snap has done its thing and not
       * if scroll has ended between items)
       *
       * To do this, we check if the `scrollLeft` value
       * is a multiple of the 'snapping point' location--
       * IF the scrollWidth == numItems * itemWidth,
       * AND we snapped on item-left, then the Snapping Point
       * value would be 0 | itemWidth. But we snap in the center.
       * And we also add extra margin before the first element to allow
       * it to scroll into the center. This means our Snapping Point
       * is Offset by some amount from the "perfect" situation above.
       * (we compute and store this Offset during the first Effect).
       */
      [
        "scroll",
        (e) => {
          const { scrollLeft } = e.target;
          const { itemSize, offset } = itemScrollerRef;
          const atSnappingPoint =
            scrollLeft === 0 || scrollLeft % itemSize === offset;
          debug("scroll", itemScrollerRef.center?.dataset.id, atSnappingPoint, {
            scrollLeft,
            itemSize,
            offset,
            locked: itemScrollerRef.isClickTransitioning,
          });
          /**
           * to protect against trying to set the active ID during
           * programmatic scrolling (like when user selects from the
           * item markers), we maintain a lock `isClickTransitioning`
           * that we should take and release during programmatic scroll.
           */
          if (atSnappingPoint && !itemScrollerRef.isClickTransitioning) {
            debug("scroll polyfill scrollend");
            const activeId = Number(itemScrollerRef.center?.dataset.id ?? 0);
            setActiveItemId(activeId);
          }
        },
      ],
    ];
    // TODO: can you feature detect scrollend and only attach the relevant listener?
    if (itemScrollerRef.current) {
      for (const [event, listener] of listeners) {
        itemScrollerRef.current.addEventListener(event, listener);
      }
      return () => {
        for (const [event, listener] of listeners) {
          itemScrollerRef.current?.removeEventListener(event, listener);
        }
      };
    }
  }, []);

  /**
   * handle programmatic scroll adjustment
   * for MARKERS when the `activeItemId` changes.
   */
  useEffect(() => {
    const { current: markers } = itemMarkerRef;

    if (!markers.childNodes[activeItemId]) {
      return;
    }

    window.requestAnimationFrame(() => {
      itemScrollerRef.isClickTransitioning = true;
      markers.scrollTo({
        /**
         * since we know the activeItemId we can compute
         * exactly the expected scrollLeft value from the
         * DOM nodes.
         */
        left:
          markers.childNodes[activeItemId].offsetLeft -
          markers.clientWidth / 2 +
          markers.childNodes[activeItemId].offsetWidth / 2,
        behavior: "smooth",
      });
      itemScrollerRef.isClickTransitioning = false;
    });
  }, [activeItemId]);

  /**
   * handle programmatic scroll adjustment
   * for ITEMS when the `activeItemId` changes.
   */
  useEffect(() => {
    const { current: items } = itemScrollerRef;

    if (!items.childNodes[activeItemId]) {
      return;
    }

    window.requestAnimationFrame(() => {
      itemScrollerRef.isClickTransitioning = true;
      items.scrollTo({
        /**
         * since we know the activeItemId we can compute
         * exactly the expected scrollLeft value from the
         * DOM nodes.
         */
        left:
          items.childNodes[activeItemId].offsetLeft -
          items.clientWidth / 2 +
          items.childNodes[activeItemId].offsetWidth / 2,
        behavior: "smooth",
      });
      itemScrollerRef.isClickTransitioning = false;
    });
  }, [activeItemId]);

  const handleClickSet = (itemId) => {
    setActiveItemId(itemId);
  };

  return (
    <div>
      <ul style={styles.ul} ref={itemScrollerRef}>
        {items.map((item, i, arr) =>
          renderItem({
            item,
            i,
            isActive: item.id === activeItemId,
            setActiveItemId: handleClickSet,
            count: arr.length,
          })
        )}
      </ul>

      <div style={{ height: "10px", width: "100%" }} />

      <ul style={styles.ul} ref={itemMarkerRef}>
        {items.map((item, i, arr) =>
          renderItemMarkers({
            item,
            i,
            isActive: item.id === activeItemId,
            setActiveItemId: handleClickSet,
            count: arr.length,
          })
        )}
      </ul>
    </div>
  );
}

export function CarouselItem(props) {
  const { children } = props;

  return (
    <li
      style={{
        ...styles.li,
      }}
      data-id={props.item.id}
      onClick={() => {
        props.setActiveItemId(props.item.id);
      }}
    >
      {children}
    </li>
  );
}

/**
 * Same as CarouselItem. no need for anything different
 * right now.
 * All the styling comes from the consumer.
 */
export function CarouselItemMarker(props) {
  const { children } = props;

  return (
    <li
      style={{
        ...styles.li,
      }}
      data-id={props.item.id}
      onClick={() => {
        props.setActiveItemId(props.item.id);
      }}
    >
      {children}
    </li>
  );
}

/**
 * Safari fires IntersectionObserver events late/sporadically.
 * only return a new target el if it registers a significant
 * intersection ratio (>=0.5 ?). Otherwise return the currently
 * active element.
 */
function _getMaxItersection(entries, currActive) {
  let max = {
    target: currActive,
    intersectionRatio: 0.5,
  };
  for (const entry of entries) {
    if (entry.intersectionRatio >= max.intersectionRatio) {
      max = entry;
    }
  }
  return max.target;
}
