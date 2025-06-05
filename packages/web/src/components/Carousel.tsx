import {
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
  Children,
  type ReactNode,
} from "react";
import clsx from "clsx";
import { ComponentEventHandler } from "types";

/*
 * CarouselIndicator
 * Carousel
 * CarouselList
 * CarouselItem
 */

const createDebounce = () => {
  let timeoutId: NodeJS.Timeout | null = null;
  return (fn: () => void, t: number) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn();
    }, t);
  };
};

const scrollDebounce = createDebounce();

interface CarouselContextValue {
  index: number;
  length: number;
}

interface CarouselActions {
  setLength: (length: number) => void;
  handleIndexChange?: ComponentEventHandler<{ index: number }, Record<string, unknown>, { index: number }>;
}

const CarouselContext = createContext<[CarouselContextValue, CarouselActions] | null>(null);

export function CarouselIndicator() {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('CarouselIndicator must be used within a Carousel');
  const [{ index, length }, { handleIndexChange }] = context;
  const indicator = Array.from({ length }, (_, i) => i);

  return (
    <div className="flex items-center justify-center py-2">
      {indicator.map((i) => {
        return (
          <button
            key={i}
            className={clsx(
              "mx-1 h-1 w-1 rounded-full focus-visible:bg-gray-800 dark:focus-visible:bg-gray-200",
              i === index ? "bg-gray-200" : "bg-gray-500"
            )}
            onClick={() => {
              if (handleIndexChange) {
                handleIndexChange({ index: i }, {}, { index: i });
              }
            }}
          />
        );
      })}
    </div>
  );
}

export function Carousel(props: {
  children: ReactNode;
  index: number;
  handleIndexChange?: ComponentEventHandler<{ index: number }, Record<string, unknown>, { index: number }>;
}) {
  const [length, setLength] = useState(Children.count(props.children));

  return (
    <CarouselContext.Provider
      value={[
        { index: props.index, length },
        { setLength, handleIndexChange: props.handleIndexChange },
      ]}
    >
      {props.children}
    </CarouselContext.Provider>
  );
}

export function CarouselList(props: { children: ReactNode }) {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('CarouselList must be used within a Carousel');
  const [{ index }, { setLength, handleIndexChange }] = context;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setLength(Children.count(props.children));
  }, [props.children]);

  useEffect(() => {
    const el = ref.current?.childNodes[index] as HTMLElement;
    if (el && el.parentNode) {
      (el.parentNode as HTMLElement).scrollLeft = el.offsetLeft;
    }
  }, []);

  useEffect(() => {
    const el = ref.current?.childNodes[index] as HTMLElement;
    if (el && el.parentNode) {
      (el.parentNode as HTMLElement).scrollTo({
        left: el.offsetLeft,
        behavior: "smooth",
      });
    }
  }, [index]);

  useEffect(() => {
    const handleScroll = () => {
      scrollDebounce(() => {
        if (!ref.current) return;
        const els = ref.current.childNodes;
        for (let i = 0; i < els.length; i++) {
          const el = els[i] as HTMLElement;
          if (Math.abs(el.offsetLeft - ref.current.scrollLeft) < 10) {
            if (handleIndexChange) {
              handleIndexChange({ index }, {}, { index: i });
            }
            break;
          }
        }
      }, 30);
    };

    const currentRef = ref.current;
    currentRef?.addEventListener("scroll", handleScroll);
    return () => {
      currentRef?.removeEventListener("scroll", handleScroll);
    };
  }, [index, handleIndexChange]);

  return (
    <section
      ref={ref}
      className="relative flex h-full w-full flex-1 snap-x snap-mandatory flex-row flex-nowrap overflow-scroll"
    >
      {props.children}
    </section>
  );
}

export function CarouselItem(props: { children: ReactNode }) {
  return (
    <div className="relative w-full flex-none snap-start snap-always overflow-hidden">
      {props.children}
    </div>
  );
}
