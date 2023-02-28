<script lang="ts">
  import { onMount } from "svelte"
  import SoundItem from "./lib/SoundItem.svelte"
  import { appDataDir, join } from "@tauri-apps/api/path"
  import { writeFile } from "@tauri-apps/api/fs"

  let audioFileSelector: HTMLInputElement

  onMount(async () => {
    const fileReader = new FileReader()

    audioFileSelector.addEventListener("change", () => {
      fileReader.readAsDataURL(audioFileSelector.files[0])
      fileReader.addEventListener("loadend", async (event) => {
        const name = prompt("Name")

        console.log(name)

        const appDataDirPath = await appDataDir()
        // todo: store event.target.result in appdata path and maybe make name unique per an audio?
      })
    })
  })
</script>

<div class="fixed bg-black/50 w-full h-screen z-50 grid place-items-center">
  <div class="bg-black text-white flex flex-col rounded-lg px-10 py-6 gap-y-3">
    <p class="text-3xl font-bold">One More Step</p>
    <div class="pt-0.5" />
    <label class="py-1 w-full">
      <p class="text-lg font-semibold">Name</p>
      <input
        type="text"
        class="bg-black rounded-lg border-b border-gray-800 px-3 py-1 outline-none mt-1.5"
        placeholder="Name"
      />
    </label>
    <label class="py-1 w-full">
      <p class="text-lg font-semibold">Keybind</p>
      <input
        type="text"
        class="bg-black rounded-lg border-b border-gray-800 px-3 py-1 outline-none mt-1.5 cursor-pointer"
        placeholder="Click hero to bind keys"
        disabled
      />
    </label>
    <div class="py-3" />
    <div class="flex flex-row items-center justify-end w-full gap-x-4">
      <button
        class="transition duration-200 hover:bg-red-700 border border-red-700 rounded-lg px-4 py-1"
        >Cancel</button
      >
      <button
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
    <SoundItem />
    <SoundItem />
    <SoundItem />
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
