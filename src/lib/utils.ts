export function formatTitle(title: string): string {
  return title
    .split("_")
    .map((w) => {
      switch (w) {
        case "id":
        case "url":
        case "ca":
        case "tls":
          return w.toUpperCase();
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}
