export function matchAt(input: string, expression: RegExp, position: number) {
  return input.slice(position).match(expression)
}
