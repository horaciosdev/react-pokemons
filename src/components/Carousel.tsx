import React, { useState, useEffect, useRef } from "react";
import { FaStepBackward, FaStepForward } from "react-icons/fa";
import "../styles/Carousel.css";

function Carousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setDragging(false);
    setDragStart({ x: 0, y: 0 });
    setDragEnd(0);
    setDragDelta(0);
  }, [images]);

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (event.deltaY < 0) {
        handlePrev();
      } else {
        handleNext();
      }
    };
    window.addEventListener("wheel", handleWheel, {
      passive: false,
    } as AddEventListenerOptions);
    return () => {
      window.removeEventListener("wheel", handleWheel, {
        passive: false,
      } as AddEventListenerOptions);
    };
  }, [handlePrev, handleNext]);

  //   const handleScroll = (event: WheelEvent) => {
  //     event.stopPropagation();
  //     event.preventDefault();

  //     if (event.deltaY < 0) {
  //       handlePrev();
  //     } else {
  //       handleNext();
  //     }
  //   };

  const handleDragStart = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    setDragging(true);
    setDragStart({ x: getX(event), y: getY(event) });
  };

  const handleDragEnd = (event: React.MouseEvent | React.TouchEvent) => {
    if (dragging) {
      setDragging(false);
      const endX = getX(event);
      setDragEnd(endX);
      const delta = endX - dragStart.x;
      if (delta > 50) {
        handlePrev();
      } else if (delta < -50) {
        handleNext();
      }
      setDragDelta(0);
    }
  };

  const getCoords = (
    event: React.MouseEvent | React.TouchEvent
  ): { x: number; y: number } => {
    let x, y;
    if (event instanceof TouchEvent) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    } else {
      x = (event as React.MouseEvent).clientX;
      y = (event as React.MouseEvent).clientY;
    }
    return { x, y };
  };

  let throttledFunction = false;
  window.addEventListener("mousemove", function () {});

  const handleDragMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!dragging) {
      return;
    }

    if (!throttledFunction) {
      throttledFunction = true;
      setTimeout(function () {
        throttledFunction = false;
      }, 100); // ajuste o intervalo aqui, por exemplo, 100ms
    }

    if (throttledFunction) {
      return;
    }

    const { x, y } = getCoords(event);
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    // Verifica se o movimento é predominantemente horizontal
    if (Math.abs(deltaY) >= Math.abs(deltaX) * 0.3) {
      return;
    }

    const carousel = carouselRef.current;
    if (!carousel) {
      return;
    }

    // calcula o deslocamento total do carrossel
    const carouselRect = carousel.getBoundingClientRect();
    const carouselStart = carouselRect.left + window.pageXOffset;
    const dragDistance = x - carouselStart - dragDelta;

    // move todas as imagens do carrossel pelo mesmo deslocamento
    for (let i = 0; i < carousel.children.length; i++) {
      const element = carousel.children[i] as HTMLElement;
      element.style.transform = `translateX(${dragDistance}px) rotateY(${
        dragDistance / 10
      }deg)`;
    }
  };

  const getX = (event: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in event) {
      return event.touches[0].clientX;
    } else {
      return event.clientX;
    }
  };

  const getY = (event: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in event) {
      return event.touches[0].clientY;
    } else {
      return event.clientY;
    }
  };

  return (
    <div className="carousel" ref={carouselRef}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`carousel-image ${index === currentIndex ? "active" : ""}`}
          style={{
            transform: `translateX(${
              (index - currentIndex) * (200 + 40)
            }px)            
            scale(${index === currentIndex ? "1.0" : "0.8"})
            rotateY(${
              index === currentIndex ? 0 : index > currentIndex ? -45 : 45
            }deg)
            translateY(${
              index === currentIndex ? "-10" : "0"
            }%)                        
            `,
            zIndex: `${
              index === currentIndex ? 0 : index > currentIndex ? -index : index
            }`,
          }}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onMouseMove={handleDragMove}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          onTouchMove={handleDragMove}
        >
          <img src={image} alt="" />
        </div>
      ))}
      <button className="carousel-prev" onClick={handlePrev}>
        <FaStepBackward />
      </button>
      <button className="carousel-next" onClick={handleNext}>
        <FaStepForward />
      </button>
    </div>
  );
}

export default Carousel;
