<script lang="ts">
  import { onMount } from "svelte"
  import SoundItem from "./lib/SoundItem.svelte"
  import { BaseDirectory } from "@tauri-apps/api/path"
  import { encode, decode } from "@msgpack/msgpack"
  import {
    exists,
    createDir,
    readDir,
    readBinaryFile,
    writeBinaryFile,
    writeTextFile,
  } from "@tauri-apps/api/fs"
  import type { SonaAudioConfigFile } from "./lib/SonaAudioFile"
  import { getAudioNames } from "./lib/SonaAudio"

  let audioFileSelector: HTMLInputElement

  let modalShown = false

  let audioContent: string = ""
  let audioName: string = ""
  let audioKeybind: string = ""
  let audios: string[] = []

  const loadAudio = async () => {
    audios = await getAudioNames()
  }

  const finishAddingAudio = async () => {
    if (audioName.length < 1) return

    const audios = await getAudioNames()

    if (audios.includes(audioName)) return await cancelAddingAudio()

    await writeTextFile(`audios/${audioName}.sonaaudio`, audioContent, {
      dir: BaseDirectory.AppLocalData,
    })
    await writeBinaryFile(
      `audios/${audioName}.config.sonaaudio`,
      encode({
        keybinding: audioKeybind,
        name: audioName,
      } as SonaAudioConfigFile),
      {
        dir: BaseDirectory.AppLocalData,
      }
    )

    await loadAudio()
    await cancelAddingAudio()
  }

  const cancelAddingAudio = async () => {
    audioContent = ""
    audioName = ""
    audioKeybind = ""

    modalShown = false
  }

  onMount(async () => {
    loadAudio()

    const fileReader = new FileReader()

    audioFileSelector.addEventListener("change", () => {
      fileReader.readAsDataURL(audioFileSelector.files[0])
      fileReader.addEventListener("loadend", async (event) => {
        audioContent = event.target.result.toString()

        modalShown = true
      })
    })
  })
</script>

<div
  class={`${
    modalShown ? "grid" : "hidden"
  } fixed bg-black/50 w-full h-screen z-50 place-items-center`}
>
  <div class="bg-black text-white flex flex-col rounded-lg px-10 py-6 gap-y-3">
    <p class="text-3xl font-bold">One More Step</p>
    <div class="pt-0.5" />
    <label class="py-1 w-full">
      <p class="text-lg font-semibold">Name</p>
      <input
        type="text"
        class="bg-black rounded-lg border-b border-gray-800 px-3 py-1 outline-none mt-1.5"
        placeholder="Name"
        bind:value={audioName}
      />
    </label>
    <label class="py-1 w-full">
      <p class="text-lg font-semibold">Keybind</p>
      <input
        type="text"
        class="bg-black rounded-lg border-b border-gray-800 px-3 py-1 outline-none mt-1.5 cursor-pointer"
        placeholder="Click hero to bind keys"
        bind:value={audioKeybind}
        on:keydown={(event) => {
          audioKeybind = ""
          event.preventDefault()

          const key = event.key.toUpperCase()

          audioKeybind = `${event.ctrlKey ? "Control" : ""}${
            event.shiftKey ? "+Shift" : ""
          }${event.altKey ? "+Alt" : ""}`
          if (audioKeybind.trim().length > 0) audioKeybind += "+"

          if (!["CONTROL", "SHIFT", "ALT"].includes(key)) audioKeybind += key

          // decision to make: prevent duplicated keybinding or leave it on purpose
        }}
      />
    </label>
    <div class="py-3" />
    <div class="flex flex-row items-center justify-end w-full gap-x-4">
      <button
        on:click={() => {
          cancelAddingAudio()
        }}
        class="transition duration-200 hover:bg-red-700 border border-red-700 rounded-lg px-4 py-1"
        >Cancel</button
      >
      <button
        on:click={() => {
          finishAddingAudio()
        }}
        class="transition duration-200 hover:bg-blue-700 border border-blue-700 rounded-lg px-4 py-1"
        >Add</button
      >
    </div>
  </div>
</div>

<input
  type="file"
  bind:this={audioFileSelector}
  class="hidden"
  accept="audio/*"
/>

<div class="w-full min-h-screen bg-[#111] text-white px-12 py-8">
  <div class="text-4xl font-bold">My Sounds</div>
  <div class="py-6" />
  <div
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
  >
    {#each audios as audio}
      <SoundItem name={audio} />
    {/each}
  </div>
</div>

<div class="fixed bottom-8 right-12">
  <button
    on:click={() => {
      audioFileSelector.click()
    }}
    class="rounded-full bg-blue-700 p-4 transition duration-300 hover:bg-blue-600"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="white"
      class="w-6 h-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  </button>
</div>
