export function formatTitle(title: string): string {
  return title
    .split("_")
    .map((w) => {
      switch (w) {
        case "id":
        case "url":
        case "ds":
        case "ca":
        case "tls":
        case "iis":
        case "otlp":
          return w.toUpperCase();
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}
