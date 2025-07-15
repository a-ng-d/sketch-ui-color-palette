import { uid } from 'uid'
import { Board } from '@penpot/plugin-types'
import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import processSelection from '../processSelection'
import { locales } from '../../content/locales'

const createPaletteFromDocument = async () => {
  const document = penpot.selection[0] as Board
  const backup = JSON.parse(
    document.getPluginData('backup')
  ) as FullConfiguration

  const now = new Date().toISOString()
  delete (backup as Partial<FullConfiguration>).libraryData
  backup.meta.id = uid()
  backup.meta.dates.openedAt = now
  backup.meta.dates.createdAt = now
  backup.meta.dates.updatedAt = now
  backup.meta.publicationStatus.isPublished = false
  backup.meta.publicationStatus.isShared = false
  backup.meta.creatorIdentity.creatorId = ''
  backup.meta.creatorIdentity.creatorFullName = ''
  backup.meta.creatorIdentity.creatorAvatar = ''

  document.setPluginData('id', backup.meta.id)
  document.setPluginData('createdAt', now)
  document.setPluginData('updatedAt', now)

  penpot.currentPage?.setPluginData(
    `palette_${backup.meta.id}`,
    JSON.stringify(backup)
  )
  penpot.ui.sendMessage({
    type: 'LOAD_PALETTE',
    data: backup,
  })
  processSelection()

  await new Promise((r) => setTimeout(r, 1000))
  await penpot.currentFile?.saveVersion(
    `${backup.base.name} - ${locales.get().events.paletteCreatedFromDocument}`
  )

  return backup
}

export default createPaletteFromDocument
