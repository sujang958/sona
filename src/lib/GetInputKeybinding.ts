export const getInputKeybinding = (
  event: KeyboardEvent & {
    currentTarget: EventTarget & HTMLInputElement
  }
) => {
  let audioKeybind = ""
  event.preventDefault()

  const key = event.key.toUpperCase()

  audioKeybind = `${event.ctrlKey ? "Control" : ""}${
    event.shiftKey ? "+Shift" : ""
  }${event.altKey ? "+Alt" : ""}`
  if (audioKeybind.trim().length > 0) audioKeybind += "+"

  if (!["CONTROL", "SHIFT", "ALT"].includes(key)) audioKeybind += key

  return audioKeybind
}
