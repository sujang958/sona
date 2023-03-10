import {
  exists,
  createDir,
  readDir,
  readBinaryFile,
  writeBinaryFile,
} from "@tauri-apps/api/fs"
import { BaseDirectory } from "@tauri-apps/api/path"
import type { SonaAudioConfigFile } from "./SonaAudioFile"
import { decode } from "@msgpack/msgpack"

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
