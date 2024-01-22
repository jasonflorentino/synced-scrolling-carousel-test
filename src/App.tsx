// import { Carousel, CarouselItem } from "./ReactSnapCarousel";
import {
  Carousel,
  CarouselItem,
  CarouselItemMarker,
} from "./IntersectionCarousel";
import "./App.css";

const styles = {
  active: {
    transition: "all 0.3s",
    transform: "scale(1.1)",
    outline: "2px solid blue",
    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
  },
};

const items = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  src: `https://picsum.photos/500?idx=${i}`,
}));

function App() {
  return (
    <main>
      {/* INTERSECTION */}
      <Carousel
        items={items}
        renderItem={(props) => (
          <CarouselItem key={props.item.id} {...props}>
            <img
              src={props.item.src}
              width="248"
              height="248"
              alt=""
              style={
                props.isActive ? styles.active : { transition: "all 0.3s" }
              }
            />
          </CarouselItem>
        )}
        renderItemMarkers={(props) => (
          <CarouselItemMarker key={props.item.id + "2"} {...props}>
            <img
              src={props.item.src}
              width="68"
              height="68"
              alt=""
              style={
                props.isActive ? styles.active : { transition: "all 0.3s" }
              }
            />
          </CarouselItemMarker>
        )}
      />

      {/* <Carousel
        items={items}
        renderItem={({ item, isSnapPoint, isActive }) => (
          <CarouselItem
            key={item.id + "2"}
            isSnapPoint={isSnapPoint}
            isActive={isActive}
          >
            <img src={item.src} width="250" height="250" alt="" />
          </CarouselItem>
        )}
      /> */}
    </main>
  );
}

export default App;
