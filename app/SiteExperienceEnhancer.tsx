"use client";

import { useEffect } from "react";

export default function SiteExperienceEnhancer() {
  useEffect(() => {
    let disposed = false;

    const clearLegacyDefaultTopic = () => {
      if (disposed) return;
      const selectedOptions = Array.from(document.querySelectorAll<HTMLLabelElement>(".topic-option.selected"));

      selectedOptions.forEach((option) => {
        const topicName = option.querySelector<HTMLElement>(".topic-name")?.textContent?.trim();
        if (topicName !== "Pressure and Fluids") return;

        const input = option.querySelector<HTMLInputElement>('input[type="checkbox"]');
        if (input?.checked) input.click();
      });
    };

    const installScienceArtwork = () => {
      if (disposed) return;

      const hero = document.querySelector<HTMLElement>(".hero");
      if (hero && !hero.querySelector("[data-science-hero-art]")) {
        const image = document.createElement("img");
        image.src = "./science-hero.svg";
        image.alt = "";
        image.setAttribute("aria-hidden", "true");
        image.className = "science-hero-art";
        image.dataset.scienceHeroArt = "true";
        hero.appendChild(image);
      }

      const emptyPreview = document.querySelector<HTMLElement>(".empty-preview");
      if (emptyPreview && !emptyPreview.querySelector("[data-science-doodles]")) {
        const doodles = document.createElement("img");
        doodles.src = "./science-doodles.svg";
        doodles.alt = "";
        doodles.setAttribute("aria-hidden", "true");
        doodles.className = "science-doodle-strip";
        doodles.dataset.scienceDoodles = "true";
        emptyPreview.insertBefore(doodles, emptyPreview.firstChild);
      }
    };

    installScienceArtwork();

    // The legacy page component still hydrates with Pressure and Fluids selected.
    // Clear that exact default several times during hydration, then stop. This
    // does not affect any other topic and does not continue running afterwards.
    const retryTimers = [0, 80, 220, 500, 900, 1500].map((delay) =>
      window.setTimeout(clearLegacyDefaultTopic, delay),
    );

    const observer = new MutationObserver(() => installScienceArtwork());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      disposed = true;
      retryTimers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      document.querySelectorAll("[data-science-hero-art], [data-science-doodles]").forEach((element) => element.remove());
    };
  }, []);

  return null;
}
