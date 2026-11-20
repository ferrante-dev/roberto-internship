import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./ScrollAnimations.css";

let initialized = false;

const ScrollAnimations = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!initialized) {
        AOS.init({
          duration: 650,
          offset: 40,
          delay: 0,
          easing: "ease-out",
          once: true,
          mirror: false,
          anchorPlacement: "top-bottom",
        });

        initialized = true;
      } else {
        AOS.refreshHard();
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
};

export default ScrollAnimations;
