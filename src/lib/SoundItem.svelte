<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
  import { confirm } from "@tauri-apps/api/dialog"
  import {
    isRegistered,
    register,
    unregister,
  } from "@tauri-apps/api/globalShortcut"
  import { onDestroy } from "svelte"
  import { getInputKeybinding } from "./GetInputKeybinding"
  import {
    getAudioByName,
    getAudioConfigByName,
    removeAudioByName,
  } from "./SonaAudio"
  import type { SonaAudioConfigFile } from "./SonaAudioFile"

  let contextMenu: HTMLDivElement

  document.addEventListener("click", (event) => {
    try {
      if (!(event.target instanceof HTMLElement)) return
      if (contextMenu.contains(event.target)) return

      contextMenu.style.display = "none"
    } catch (e) {
      console.log(e)
    }
  })

  export let name: string = "Not Found"
  export let onRemove: () => any | Promise<any> = () => {}

  let image = "icon.ico"

  let audioConfig: SonaAudioConfigFile | null = null
  let audio: HTMLAudioElement | null = null
  let audioPlaying = false

  let keybindingInput: HTMLInputElement

  const preventPlaying = () => {
    const stopPlaying = () => audio.pause()
    audio.addEventListener("play", stopPlaying)

    return () => audio.removeEventListener("play", stopPlaying)
  }

  const removeAudio = async () => {
    const disarm = preventPlaying()
    if (!(await confirm("You sure?"))) return disarm()

    audio.remove()
    await removeAudioByName(audioConfig.name)
    onRemove()
  }

  const togglePlayAudio = () => {
    if (audio.paused) {
      audio.currentTime = 0
      audio.play()
    } else audio.pause()
  }

  const loadAudio = async () => {
    audioConfig = await getAudioConfigByName(name)

    isRegistered(audioConfig.keybinding).then(async (yes) => {
      if (yes) await unregister(audioConfig.keybinding)

      register(audioConfig.keybinding, () => {
        togglePlayAudio()
      }).catch(() => {
        audio = null
        audioConfig = null
      })
    })

    audio = new Audio(await getAudioByName(audioConfig.name))

    audio.addEventListener("pause", () => {
      audioPlaying = false
    })

    audio.addEventListener("play", () => {
      audioPlaying = true
    })

    audio.addEventListener("loadeddata", () => {
      console.log("loaded")
    })
  }

  loadAudio()

  onDestroy(() => {
    unregister(audioConfig.keybinding)
  })
</script>

{#if audio && audioConfig}
  <div
    class={`flex flex-col items-center cursor-pointer select-none relative rounded-lg transition duration-200 ${
      audioPlaying ? "bg-violet-500" : "hover:bg-white/5"
    } py-8`}
    on:contextmenu={(event) => {
      event.preventDefault()
      for (const otherContextMenu of document.querySelectorAll(
        ".context-menu"
      )) {
        if (!(otherContextMenu instanceof HTMLDivElement)) continue

        otherContextMenu.style.display = "none"
      }

      contextMenu.style.display = "block" // keep this line above the const rect = ...

      contextMenu.style.setProperty("--mouse-x", event.clientX + "px")
      contextMenu.style.setProperty("--mouse-y", event.clientY + "px")
    }}
    on:click={() => {
      togglePlayAudio()
    }}
  >
    <div
      class="context-menu bg-black/70 text-white rounded-lg p-2 fixed z-50 w-48 backdrop-blur filter gap-y-4 hidden left-0 top-0"
      bind:this={contextMenu}
      style="transform: translateX(min(var(--mouse-x), calc(100vw - 100%))) translateY(min(var(--mouse-y), calc(100vh - 100%)));"
    >
      <p
        class="text-base transition duration-300 hover:bg-white/30 py-1 px-4 rounded-lg"
      >
        Rename
      </p>
      <p
        class="text-base transition duration-300 hover:bg-white/30 py-1 px-4 rounded-lg"
        on:click={async () => {
          const disarm = preventPlaying()

          keybindingInput.disabled = false
          keybindingInput.focus()
          keybindingInput.click()

          document.addEventListener("click", (event) => {
            if (event.target != keybindingInput) return

            keybindingInput.disabled = true

            // todo: add changing keybinding and savng it

            disarm()
          })
        }}
      >
        Change keybinding
      </p>
      <p
        class="text-base transition duration-300 hover:bg-white/30 py-1 px-4 rounded-lg text-red-500"
        on:click={async () => {
          removeAudio()
        }}
      >
        Delete
      </p>
    </div>
    <div class="group relative">
      <img
        draggable="false"
        src={image}
        alt="Icon"
        class="object-contain w-[5.6rem] h-[5.6rem]"
      />
      <div
        class="absolute top-0 left-0 right-0 bottom-0 rounded-lg w-full h-full z-40 group-hover:opacity-100 transition duration-300 opacity-0"
      >
        <div
          class="bg-black/50 h-full w-full rounded-xl grid place-items-center"
        >
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="white"
              class="w-7 h-7"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
    <div class="py-2" />
    <div class="text-center">
      <p class="text-xl font-bold">{name.split(".sonaaudio")[0]}</p>
      <div class="relative">
        <input
          type="text"
          bind:value={audioConfig.keybinding}
          bind:this={keybindingInput}
          on:keydown={(event) => {
            audioConfig.keybinding = ""
            event.preventDefault()

            audioConfig.keybinding = getInputKeybinding(event)
          }}
          disabled
          class="w-36 appearance-none z-50 bg-transparent border-none text-base uppercase text-gray-300 text-center py-1 rounded-lg"
        />
      </div>
    </div>
  </div>
{:else}
  <p class="text-base">in loading</p>
{/if}
