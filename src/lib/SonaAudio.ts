import {
  exists,
  createDir,
  readDir,
  readBinaryFile,
  writeBinaryFile,
  readTextFile,
  removeFile,
} from "@tauri-apps/api/fs"
import { BaseDirectory } from "@tauri-apps/api/path"
import type { SonaAudioConfigFile } from "./SonaAudioFile"
import { decode, encode } from "@msgpack/msgpack"

export const getAudioNames = async () => {
  if (!(await exists("audios/", { dir: BaseDirectory.AppLocalData })))
    await createDir("audios/", { dir: BaseDirectory.AppLocalData })

  const names = (await readDir("audios", { dir: BaseDirectory.AppLocalData }))
    .filter((audio) => audio.name.endsWith(".config.sonaaudio"))
    .map((v) => {
      let splitted = v.name.split(".")
      splitted.pop()
      splitted.pop()

      return splitted.join(".")
    })

  return names
}

export const getAudioConfigByName = async (
  name: string
): Promise<SonaAudioConfigFile> => {
  await getAudioNames()

  const file = await readBinaryFile(`audios/${name}.config.sonaaudio`, {
    dir: BaseDirectory.AppLocalData,
  })

  const audioFile = decode(file) as SonaAudioConfigFile

  return audioFile
}

export const getAudioByName = async (name: string): Promise<string> => {
  const audioFile = await readTextFile(`audios/${name}.sonaaudio`, {
    dir: BaseDirectory.AppLocalData,
  })

  return audioFile
}

/**
 * Removes an audio and a config file by name
 * @returns if false, not successfully removed
 */
export const removeAudioByName = async (name: string): Promise<boolean> => {
  const names = await getAudioNames()

  if (!names.includes(name)) return false

  await Promise.all([
    removeFile(`audios/${name}.sonaaudio`, {
      dir: BaseDirectory.AppLocalData,
    }),
    removeFile(`audios/${name}.config.sonaaudio`, {
      dir: BaseDirectory.AppLocalData,
    }),
  ])

  return true
}

export const updateAudioConfig = async (name: string, config: SonaAudioConfigFile) => {
  const names = await getAudioNames()

  if (!names.includes(name)) return false

  await writeBinaryFile(`audios/${name}.config.sonaaudio`, encode(config), {
    dir: BaseDirectory.AppLocalData,
  })

  return structuredClone(config)
}
