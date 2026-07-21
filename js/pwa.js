if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")

      .then(() => {
        console.log("Service Worker Registered");
      })

      .catch((error) => {
        console.error("SW Error:", error);
      });
  });
}
