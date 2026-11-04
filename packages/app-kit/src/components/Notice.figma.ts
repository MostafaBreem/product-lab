// url=https://www.figma.com/design/dfwTUEQywJK5T0wWKPhN9g/Bawazek-Components?node-id=85-339
// source=packages/app-kit/src/components/Notice.tsx
// component=Notice
// Parity: lab spec components/notice.md §9 Code map. Publish only after the Figma set is published (Show link lands with the Figma change).
import figma from 'figma'
const instance = figma.selectedInstance

const tone = instance.getEnum('Tone', { Critical: 'critical', Neutral: 'neutral' })
const title = instance.getString('Title')
const showBody = instance.getBoolean('Show body')
const body = instance.getString('Body')
const showIcon = instance.getBoolean('Show icon')

// Icon: snippet only when the swapped icon set has its own Code Connect template; else the kit default per tone applies.
const icon = instance.getInstanceSwap('Icon')
let iconCode
if (showIcon && icon && icon.type === 'INSTANCE' && icon.hasCodeConnect()) {
  iconCode = icon.executeTemplate().example
}

// Link: nested Button (Variant=Link) shown by "Show link"; its label comes from the Button's Label layer.
const showLink = instance.getBoolean('Show link')
let linkLabel
if (showLink) {
  const label = instance.findText('Label', { traverseInstances: true, path: ['Link'] })
  if (label && label.type === 'TEXT') linkLabel = label.textContent
}

export default {
  id: 'notice',
  imports: ['import { Notice, Button } from "@lab/app-kit"'],
  example: figma.code`<Notice
  tone="${tone}"
  title="${title}"${showBody ? figma.code`
  body="${body}"` : ''}${showIcon ? '' : `
  showIcon={false}`}${iconCode ? figma.code`
  icon={${iconCode}}` : ''}
>${linkLabel ? figma.code`
  <Button variant="link"${tone === 'critical' ? ' tone="critical"' : ''} label="${linkLabel}" onPress={onLink} />
` : ''}</Notice>`,
  metadata: { nestable: false },
}
