// Component metadata: one source for the docs site, components.json and llms.txt.
// usage = design/usage/<slug>.md (lab usage card). tokens = component token prefix in tokens.json.
export type PropMeta = { name: string; type: string; default?: string; description: string };
export type ComponentMeta = {
  name: string; slug: string; tokens: string; summary: string;
  props: PropMeta[]; variants?: string[]; states?: string[]; example: string; related: string[];
};

export const components: ComponentMeta[] = [
  {
    name: 'Button', slug: 'button', tokens: 'button', summary: 'One tap action. Primary = filled main action, Secondary = grey filled action next to or under the main one, Link = text-only secondary action.',
    props: [
      { name: 'label', type: 'string', description: 'Says exactly what the tap does; repeats the amount when it pays.' },
      { name: 'onPress', type: '() => void', description: 'Tap handler.' },
      { name: 'variant', type: "'primary' | 'secondary' | 'link'", default: "'primary'", description: 'Primary = one per view, full width. Secondary = grey filled (color/fill default / active / disabled, content-colour label, no outline), full width by default, any number per view. Link = text-only secondary.' },
      { name: 'tone', type: "'default' | 'critical'", default: "'default'", description: 'Critical for overdue or destructive actions.' },
      { name: 'loading', type: 'boolean', default: 'false', description: 'Primary (both tones) and Secondary: spinner + label, no press, while the action runs.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Primary and Secondary: grey fill (Secondary: disabled fill + disabled label), no press, label stays. Use when the action cannot run yet (nothing picked, loading, offline). Same look in both tones.' },
      { name: 'full', type: 'boolean', default: 'primary: true', description: 'Fill the parent width.' },
      { name: 'align', type: "'start' | 'center'", default: "start; center for a full link in a bottom sheet or Screen footer", description: 'Link only: label position inside a full-width link. Any secondary action under the main one is centred: bottom sheets, Screen footers, Payment card single link (2026-11-05).' },
    ],
    variants: ['Primary', 'Primary Critical', 'Secondary', 'Link', 'Link Critical'], states: ['Default', 'Pressed', 'Loading', 'Disabled'],
    example: `<Button label="Pay ⃁ 312.50" onPress={pay} />\n<Button variant="secondary" label="Pick another time" onPress={pick} />\n<Button variant="link" label="Choose what to pay" onPress={open} />`,
    related: ['Chip', 'ListRow', 'PaymentCard'],
  },
  {
    name: 'Tag', slug: 'tag', tokens: 'tag', summary: 'Short status label, not tappable.',
    props: [
      { name: 'label', type: 'string', description: '1–3 words.' },
      { name: 'tone', type: "'default' | 'critical' | 'success' | 'warning' | 'info'", default: "'default'", description: 'Meaning by colour + words.' },
    ],
    variants: ['Default', 'Critical', 'Success', 'Warning', 'Info'],
    example: `<Tag tone="critical" label="Overdue · 3 days" />`, related: ['Chip', 'PaymentCard'],
  },
  {
    name: 'Chip', slug: 'chip', tokens: 'chip', summary: 'Small pill action with an icon, e.g. in a header.',
    props: [
      { name: 'label', type: 'string', description: 'Short action label.' },
      { name: 'icon', type: 'IconName', description: 'Leading icon (Phosphor).' },
      { name: 'onPress', type: '() => void', description: 'Tap handler; 44 tap area via hit slop.' },
    ],
    states: ['Default', 'Pressed'], example: `<Chip icon="coins" label="Earn cashback" onPress={open} />`, related: ['Header', 'Button'],
  },
  {
    name: 'KeyValue', slug: 'key-value-pair', tokens: 'key-value', summary: 'A label and its value: summary insets, details cards, receipts.',
    props: [
      { name: 'k', type: 'string', description: 'The label.' },
      { name: 'v', type: 'string', description: 'The value (tabular figures).' },
      { name: 'layout', type: "'stacked' | 'row'", default: "'stacked'", description: 'Stacked = label over value; row = label start, value end.' },
      { name: 'strong', type: 'boolean', default: 'false', description: 'Row value in label/lg (totals).' },
    ],
    variants: ['Stacked', 'Row', 'Row strong'], example: `<KeyValue k="Total to pay" v="⃁ 1,350.00" />`, related: ['PaymentCard', 'ListRow'],
  },
  {
    name: 'Switch', slug: 'switch', tokens: 'switch', summary: 'On/off for a setting that applies at once.',
    props: [
      { name: 'value', type: 'boolean', description: 'On or off.' },
      { name: 'onValueChange', type: '(v: boolean) => void', description: 'Applies at once; no Save.' },
      { name: 'accessibilityLabel', type: 'string', description: 'Usually the row title.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'On or off, not pressable, dimmed (opacity/muted). State stays visible.' },
    ],
    states: ['Off', 'On'], example: `<ListRow title="Salary day reminder" selection={{ kind: 'switch', value, onChange: setValue }} />`, related: ['ListRow', 'Toast'],
  },
  {
    name: 'Toast', slug: 'toast', tokens: 'toast', summary: 'Short confirmation after an action; disappears on its own. One at a time.',
    props: [{ name: 'useToast()', type: "(m: { tone: 'success' | 'neutral'; text: string; bottomOffset?: number }) => void", description: 'Show a toast; wrap the app in <ToastHost>. bottomOffset = height of the lowest bar above the safe-area bottom for this toast (default: ToastHost bottomOffset, 83 = tab bar); 0 on screens with no bar.' }],
    variants: ['Success', 'Neutral'], example: `const toast = useToast();\ntoast({ tone: 'success', text: 'Reminders on' });`, related: ['Notice', 'Switch'],
  },
  {
    name: 'SegmentedControl', slug: 'segmented-control', tokens: 'segmented-control', summary: 'Switch between 2–4 views of the same content.',
    props: [
      { name: 'options', type: '{ value: T; label: string }[]', description: '2–4 options, 1–2 words each.' },
      { name: 'value', type: 'T', description: 'Selected option.' },
      { name: 'onChange', type: '(v: T) => void', description: 'Selection handler.' },
    ],
    states: ['Selected', 'Unselected'], example: `<SegmentedControl value={range} onChange={setRange} options={[{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: 'all', label: 'All' }]} />`, related: ['ListGroup'],
  },
  {
    name: 'Header', slug: 'header', tokens: 'header', summary: 'Large page title with an optional trailing control.',
    props: [
      { name: 'title', type: 'string', description: 'Page title (display/md).' },
      { name: 'trailing', type: 'ReactNode', description: 'Optional, usually a Chip.' },
    ],
    example: `<Header title="Money" trailing={<Chip icon="coins" label="Earn cashback" />} />`, related: ['Chip', 'NavigationBar'],
  },
  {
    name: 'SectionHeader', slug: 'section-header', tokens: 'section-header', summary: 'Titles a section; optional text action on the end.',
    props: [
      { name: 'title', type: 'string', description: 'Section title (heading/sm).' },
      { name: 'action', type: 'string', description: 'Optional link label.' },
      { name: 'onAction', type: '() => void', description: 'Link handler.' },
    ],
    example: `<SectionHeader title="Upcoming" action="History" onAction={open} />`, related: ['ListGroup'],
  },
  {
    name: 'ListRow', slug: 'list-row', tokens: 'list-row', summary: 'Tappable row: leading logo / icon, title, subtitle, value, chevron or a selection control.',
    props: [
      { name: 'title', type: 'string', description: 'Max 2 lines.' },
      { name: 'subtitle', type: 'string', description: 'Max 2 lines, wraps (large text).' },
      { name: 'value', type: 'string', description: 'Amount or value; never truncates.' },
      { name: 'quietValue', type: 'string', description: 'Secondary value (fees, "Always on").' },
      { name: 'leading', type: "{ kind: 'logo' | 'icon' | 'skeleton', … }", description: 'Logo tile, icon tile or loading tile.' },
      { name: 'chevron', type: 'boolean', description: 'Shows the row opens something.' },
      { name: 'selection', type: "{ kind: 'radio' | 'check', selected } | { kind: 'switch', value, onChange, disabled? }", description: 'Replaces the chevron. Switch disabled = locked row or offline (Switch Disabled on / off).' },
      { name: 'onPress', type: '() => void', description: 'Whole row taps.' },
    ],
    variants: ['Leading Logo / Icon / None', 'Selection None / Radio / Check / Switch'], states: ['Default', 'Pressed', 'Loading'],
    example: `<ListRow title="Noon" subtitle="Thu 5 Nov · 2 of 4" value="⃁ 125.00" chevron leading={{ kind: 'logo', text: 'n' }} onPress={open} />`, related: ['ListGroup', 'KeyValue', 'Switch'],
  },
  {
    name: 'ListGroup', slug: 'list-group', tokens: 'list-group', summary: 'Card that holds List rows; divider between rows, none after the last.',
    props: [
      { name: 'children', type: 'ListRow[]', description: 'Rows.' },
      { name: 'plain', type: 'boolean', default: 'false', description: 'No card: choice rows on a sheet.' },
    ],
    example: `<ListGroup>\n  <ListRow … />\n  <ListRow … />\n</ListGroup>`, related: ['ListRow', 'SectionHeader'],
  },
  {
    name: 'Card', slug: 'card', tokens: 'card', summary: 'Plain card surface that groups content: radius 20, inset 20, shadow sm. Not tappable.',
    props: [
      { name: 'children', type: 'ReactNode', description: 'Content (Figma: Content slot).' },
      { name: 'style', type: "Pick<ViewStyle, 'gap' | 'flexDirection' | 'alignItems' | 'justifyContent'>", description: 'Content layout only; padding, radius, fill and shadow are fixed.' },
    ],
    example: `<Card style={{ gap: th.t('space/gap-y/sm') }}>\n  <KeyValue layout="row" k="Order total" v="AED 1,250.00" />\n</Card>`, related: ['ListGroup', 'PaymentCard', 'KeyValue'],
  },
  {
    name: 'TabBar', slug: 'tab-bar', tokens: 'tab-bar', summary: 'Bottom navigation between the app\'s top-level sections.',
    props: [
      { name: 'items', type: '{ key; label; icon }[]', description: '4 tabs (Figma Tab bar (4)).' },
      { name: 'selected', type: 'string', description: 'Selected key.' },
      { name: 'onSelect', type: '(key: string) => void', description: 'Tab handler.' },
    ],
    states: ['Selected', 'Unselected'], example: `<TabBar items={tabs} selected="money" onSelect={go} />`, related: ['NavigationBar'],
  },
  {
    name: 'PaymentCard', slug: 'payment-card', tokens: 'payment-card', summary: 'Next payment at a glance + one Pay. States Due, Overdue, Caught up.',
    props: [
      { name: 'state', type: "'due' | 'overdue' | 'caughtUp'", description: 'Card state.' },
      { name: 'label · amount · title · dueLine · body', type: 'string', description: 'Header text; amount = total due next.' },
      { name: 'tag', type: 'string', description: 'Overdue tag text.' },
      { name: 'pay', type: '{ label; onPress; critical? }', description: 'The one Pay; label repeats the amount.' },
      { name: 'links', type: '{ label; onPress; critical?; helper? }[]', description: 'Secondary actions. With Pay: one link + its helper centred, two links split start / end (linksRow). No Pay (Caught up): start-aligned (2026-11-05).' },
      { name: 'summary', type: '{ k; v }[]', description: 'Key-value inset. One pair = one line, key start, value end (Key-value Row strong); two or more = columns (2026-11-05).' },
      { name: 'criticalFill', type: 'boolean', description: 'Critical tint. Not used by the app: overdue card stays neutral, red only on tag + due line (critic C1).' },
    ],
    variants: ['Due', 'Overdue', 'Caught up'], example: `<PaymentCard state="due" label="Next payment" amount="⃁ 312.50" dueLine="Due in 5 days · Thu 5 Nov" pay={{ label: 'Pay ⃁ 312.50', onPress: pay }} />`,
    related: ['Button', 'Tag', 'KeyValue', 'ListGroup'],
  },
  {
    name: 'NavigationBar', slug: 'navigation-bar', tokens: 'navigation-bar', summary: 'Top bar of pushed screens and sheets: back or close, centred title.',
    props: [
      { name: 'title', type: 'string', description: 'Screen title (heading/sm).' },
      { name: 'leading', type: "'back' | 'close'", description: 'Back mirrors in Arabic; close never mirrors.' },
      { name: 'onLeading', type: '() => void', description: 'Back / close handler.' },
    ],
    example: `<NavigationBar title="Overdue payment" leading="back" onLeading={router.back} />`, related: ['BottomSheet', 'Header'],
  },
  {
    name: 'BottomSheet', slug: 'bottom-sheet', tokens: 'bottom-sheet', summary: 'Focused task over the current screen: scrim, sheet pinned bottom, Navigation bar, content. A full-width link under the main action is centred (2026-11-05).',
    props: [
      { name: 'visible · onClose', type: 'boolean · () => void', description: 'Open state; close by x, swipe or scrim.' },
      { name: 'title · leading', type: "string · 'close' | 'back' | 'none'", description: 'Navigation bar inside the sheet.' },
      { name: 'dismissable', type: 'boolean', default: 'true', description: 'false while a payment runs: no x, no scrim tap.' },
    ],
    example: `<BottomSheet visible={open} title="Pay next payment" onClose={close}>…</BottomSheet>`, related: ['NavigationBar', 'Notice', 'Button'],
  },
  {
    name: 'Notice', slug: 'notice', tokens: 'notice', summary: 'Inline status: icon, title, optional body and link. Critical for errors, Neutral for plain status, Brand for a highlight, Success for a done state.',
    props: [
      { name: 'tone', type: "'critical' | 'neutral' | 'brand' | 'success'", default: "'neutral'", description: 'Critical = something failed. Brand = surface/brand highlight. Success = surface/success, text and icon success-on.' },
      { name: 'icon', type: 'IconName', default: "tone: warning-circle · info · info · check-circle", description: 'Neutral swaps (info, wifi-slash, bell-slash). Sits on the title\'s first line.' },
      { name: 'showIcon', type: 'boolean', default: 'true', description: 'Figma "Show icon". Off = text only.' },
      { name: 'title · body', type: 'string', description: 'What happened · what it means, what to do.' },
      { name: 'children', type: 'ReactNode', description: 'Figma "Show link": one Button variant="link" under the text, tone follows the notice. Screen readers: Critical = alert, Neutral = status.' },
    ],
    variants: ['Critical', 'Neutral', 'Brand', 'Success'], example: `<Notice tone="critical" title="Payment didn't go through" body="Your bank declined it. No money was taken." />`, related: ['Toast', 'BottomSheet'],
  },
  {
    name: 'TextField', slug: 'text-field', tokens: 'color/border', summary: 'Single-line input with label over a 48 field. Optional suffix, LTR prefix, inline error.',
    props: [
      { name: 'label', type: 'string', description: 'Field name (label/md), above the field, gap 8.' },
      { name: 'value · onChangeText', type: 'string · (v: string) => void', description: 'Controlled value (body/md).' },
      { name: 'placeholder', type: 'string', description: 'Example input, tertiary text.' },
      { name: 'prefix', type: 'string', description: 'Fixed lead text, e.g. "+20". LTR-isolated in both languages.' },
      { name: 'optional', type: 'string', description: 'Localized suffix from the caller, e.g. "(optional)". Not hardcoded.' },
      { name: 'error', type: 'string', description: 'Critical border + message under the field, role alert.' },
      { name: 'keyboardType · inputMode', type: 'KeyboardTypeOptions · InputMode', description: 'Keyboard for the value (phone-pad, email-address…).' },
      { name: 'testID', type: 'string', description: 'Test hook on the input.' },
    ],
    states: ['Default', 'Focus', 'Error'], example: `<TextField label="Mobile number" prefix="+20" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />`, related: ['Checkbox', 'Button'],
  },
  {
    name: 'Checkbox', slug: 'checkbox', tokens: 'color/fill/brand', summary: 'Checkbox row: 24 box + label, 44 min row, whole row taps.',
    props: [
      { name: 'checked · onChange', type: 'boolean · (v: boolean) => void', description: 'Checked state; tap toggles.' },
      { name: 'label', type: 'string', description: 'What the box agrees to or turns on (body/md, wraps).' },
      { name: 'testID', type: 'string', description: 'Test hook on the row.' },
    ],
    states: ['Unchecked', 'Checked'], example: `<Checkbox checked={offers} onChange={setOffers} label="Send me offers" />`, related: ['Switch', 'TextField'],
  },
  {
    name: 'Avatar', slug: 'avatar', tokens: 'color/fill/default', summary: 'Initials in a circle, for a person without a photo.',
    props: [
      { name: 'initials', type: 'string', description: '1–2 letters.' },
      { name: 'size', type: '40 | 56 | 72', default: '40', description: 'Text label/sm · label/md · label/lg. 72 renders at size/height/xl (64) until a 72 token exists.' },
    ],
    variants: ['40', '56', '72'], example: `<Avatar initials="MS" size={56} />`, related: ['ListRow'],
  },
];
