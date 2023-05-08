import {
  exists,
  createDir,
  readDir,
  readBinaryFile,
  writeBinaryFile,
  readTextFile,
  removeFile,
  writeTextFile,
} from "@tauri-apps/api/fs"
import { BaseDirectory } from "@tauri-apps/api/path"
import type { SonaAudioConfigFile } from "./SonaAudioFile"
import { decode, encode } from "@msgpack/msgpack"
import { nanoid } from "nanoid"

export const getAudioIds = async () => {
  if (!(await exists("audios/", { dir: BaseDirectory.AppLocalData })))
    await createDir("audios/", { dir: BaseDirectory.AppLocalData })

  const ids = (await readDir("audios", { dir: BaseDirectory.AppLocalData }))
    .filter(
      (audio) => audio.name.endsWith(".config.sonaaudio") && !audio.children
    )
    .map((v) => {
      let splitted = v.name.split(".")
      splitted.pop()
      splitted.pop()

      return splitted.join(".")
    })

  return ids
}

export const getAudioConfigById = async (
  id: string
): Promise<SonaAudioConfigFile> => {
  await getAudioIds()

  const file = await readBinaryFile(`audios/${id}.config.sonaaudio`, {
    dir: BaseDirectory.AppLocalData,
  })

  const audioFile = decode(file) as SonaAudioConfigFile

  return audioFile
}

export const getAudioById = async (id: string): Promise<string> => {
  const audioFile = await readTextFile(`audios/${id}.sonaaudio`, {
    dir: BaseDirectory.AppLocalData,
  })

  return audioFile
}

/**
 * Removes an audio and a config file by name
 * @returns if false, not successfully removed
 */
export const removeAudioById = async (id: string): Promise<boolean> => {
  const ids = await getAudioIds()

  if (!ids.includes(id)) return false

  await Promise.all([
    removeFile(`audios/${id}.sonaaudio`, {
      dir: BaseDirectory.AppLocalData,
    }),
    removeFile(`audios/${id}.config.sonaaudio`, {
      dir: BaseDirectory.AppLocalData,
    }),
  ])

  return true
}

export const updateAudioConfig = async (
  id: string,
  config: SonaAudioConfigFile
) => {
  const ids = await getAudioIds()

  if (!ids.includes(id)) return false

  await writeBinaryFile(`audios/${id}.config.sonaaudio`, encode(config), {
    dir: BaseDirectory.AppLocalData,
  })

  return structuredClone(config)
}

export const addAudio = async (
  audioContent: string,
  config: SonaAudioConfigFile
) => {
  const audios = await getAudioIds()
  let id = nanoid()
  while (true) {
    if (!audios.includes(id)) break
    id = nanoid()
  }

  await writeTextFile(`audios/${id}.sonaaudio`, audioContent, {
    dir: BaseDirectory.AppLocalData,
  })
  await writeBinaryFile(`audios/${id}.config.sonaaudio`, encode(config), {
    dir: BaseDirectory.AppLocalData,
  })

  return true
}
