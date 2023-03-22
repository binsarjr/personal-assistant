import { DB } from '../Database'

export const setSibuk = async (sibuk: string) => {
  await DB.push(
    '/kesibukkan',
    {
      sibuk,
      sudahDiKasihTahu: [],
    },
    false,
  )
}
export const getSibuk = async () => {
  try {
    return (await DB.getData('/kesibukkan/sibuk')).trim() as string
  } catch (error) {
    return null
  }
}

export const setSudahDikasihTahu = async (jid: string) => {
  await DB.push('/kesibukkan/sudahDiKasihTahu[]', jid, true)
}

export const hasSudahDikasihTahu = async (jid: string) => {
  const sudahTahu = await DB.getObject<string[]>('/kesibukkan/sudahDiKasihTahu')
  return sudahTahu.includes(jid)
}
