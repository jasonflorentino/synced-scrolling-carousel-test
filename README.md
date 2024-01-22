# Synced Scrolling Carousel

Explorations for scrolling carousel that:

- Scrolls naturally.
- Snaps items to center.
- Identifies center item as 'active' item.
- Supports transform animations for active item.
- Syncs active item with thumbnails carousel below.
- Can indepenently scroll thumbnails and click to to choose next active Item.
- Works cross browser (Chrome, Firefox, Safari, mobile iOS)

## Working prototype

hand-rolled solution in `IntersectionCarousel.jsx` satisfies all criteria, but is specific to our usecase and potientially quite involved to maintain/expand later.

![scroll-demo](./demo/scroll-demo.gif)

## Other tests

`react-snap-carousel` library looked promising but couldn't quite get it to work as well as I'd like in time.

## Run

Built as a vite / react app

```
npm i
npm run dev
```

The vite server will be listening on http://localhost:5173/
