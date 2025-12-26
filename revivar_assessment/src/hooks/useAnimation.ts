import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const useAnimation = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.image-card');
      gsap.fromTo(cards, 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, []);

  const animateCardCreation = () => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { scale: 0.8, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.8, 
          ease: "back.out(1.7)" 
        }
      );
    }
  };

  return { cardRef, gridRef, animateCardCreation };
};