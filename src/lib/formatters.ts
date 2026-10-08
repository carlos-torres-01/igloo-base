const dateFormatters = {
  medium: new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }),
  long: new Intl.DateTimeFormat("es-CO", { dateStyle: "long" }),
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "long",
  timeStyle: "short",
})

export function formatDate(
  value: string | Date,
  style: keyof typeof dateFormatters = "medium"
) {
  return dateFormatters[style].format(new Date(value))
}

export function formatDateTime(value: string | Date) {
  return dateTimeFormatter.format(new Date(value))
}

export function toPercentage(ratio: number) {
  return Number((ratio * 100).toFixed(1))
}
