export function watchedFormatted(watched: number | bigint) {
  return `${(Number(watched) / (1 * 60 * 1000) / 60).toFixed(1)}h`;
}
