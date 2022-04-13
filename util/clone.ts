export default function clone<T>(obj: T): T {
  return Object.create(
    Object.getPrototypeOf(obj),
    Object.getOwnPropertyDescriptors(obj),
  )
}
