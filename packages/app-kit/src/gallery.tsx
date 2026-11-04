// Component gallery: every app-kit component with its variants and states, EN / AR, light / dark.
// Brand-free: fictional merchants and copy, no product name. Published to GitHub Pages by apps/gallery.
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme, type TypeRole } from './theme';
import * as fmt from './format';
import { Bar } from './components/Skeleton';
import { BottomSheet } from './components/BottomSheet';
import { Button } from './components/Button';
import { Chip } from './components/Chip';
import { Header } from './components/Header';
import { KeyValue } from './components/KeyValue';
import { ListGroup } from './components/ListGroup';
import { ListRow } from './components/ListRow';
import { NavigationBar } from './components/NavigationBar';
import { Notice } from './components/Notice';
import { PaymentCard } from './components/PaymentCard';
import { SectionHeader } from './components/SectionHeader';
import { SegmentedControl } from './components/SegmentedControl';
import { Tag } from './components/Tag';
import { ToastHost, useToast } from './components/Toast';
import { Txt } from './components/Txt';
type Lang = 'en' | 'ar';

export function Gallery() {
  const [lang, setLang] = useState<Lang>('en');
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');
  return (
    <ThemeProvider scheme={scheme} lang={lang}>
      <ToastHost bottomOffset={0}>
        <Body lang={lang} setLang={setLang} scheme={scheme} setScheme={setScheme} />
      </ToastHost>
    </ThemeProvider>
  );
}

const ar = (l: Lang, en: string, a: string) => (l === 'ar' ? a : en);

function Body({ lang, setLang, scheme, setScheme }: { lang: Lang; setLang: (l: Lang) => void; scheme: 'light' | 'dark'; setScheme: (s: 'light' | 'dark') => void }) {
  const th = useTheme();
  const toast = useToast();
  const [seg, setSeg] = useState('7d');
  const [radio, setRadio] = useState(0);
  const [check, setCheck] = useState(true);
  const [sw, setSw] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const m = (h: number) => fmt.money(h, lang);
  const roles: TypeRole[] = ['display/lg', 'display/md', 'heading/lg', 'heading/md', 'heading/sm', 'body/lg', 'body/md', 'body/sm', 'label/lg', 'label/md', 'label/sm', 'caption'];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.t('color/bg/default') as string }}>
      {/* raw-ok: gallery page width 430 and section gap 32 have no token (gap scale stops at 24). */}
      <ScrollView contentContainerStyle={{ padding: th.t('space/padding/md'), gap: 32, maxWidth: 430, width: '100%', alignSelf: 'center', direction: th.isRTL ? 'rtl' : 'ltr' }}>
        <View style={{ gap: th.t('space/gap-y/xs') }}>
          <Txt role="display/md">{ar(lang, 'Components', 'المكوّنات')}</Txt>
          <Txt role="body/sm" color="color/text/content/secondary/default" wrap>app-kit · brand theme from tokens.json · Bawazek Sans · sample data</Txt>
          <SegmentedControl value={lang} onChange={setLang} options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]} />
          <SegmentedControl value={scheme} onChange={setScheme} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
        </View>

        <Section title="Button">
          <Button label={ar(lang, `Pay ${m(31250)}`, `ادفع ${m(31250)}`)} onPress={() => {}} />
          <Button label={ar(lang, `Pay ${m(31250)} now`, `ادفع ${m(31250)} الحين`)} tone="critical" onPress={() => {}} />
          <Button label={ar(lang, 'Paying…', 'جاري الدفع…')} loading={loading} onPress={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button variant="link" label={ar(lang, 'Choose what to pay', 'اختر دفعاتك')} />
            <Button variant="link" tone="critical" label={ar(lang, 'What happens next', 'وش يصير بعدين')} />
          </View>
          <Note>Primary · Primary Critical · Loading (tap) · Link · Link Critical</Note>
        </Section>

        <Section title="Tag · Chip">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: th.t('space/gap-x/xs') }}>
            <Tag tone="critical" label={fmt.overdueTag(3, lang)} />
            <Tag label="Default" /><Tag tone="success" label="Success" /><Tag tone="warning" label="Warning" /><Tag tone="info" label="Info" />
          </View>
          <View style={{ flexDirection: 'row' }}><Chip icon="coins" label={ar(lang, 'Earn cashback', 'اكسب كاش باك')} onPress={() => {}} /></View>
        </Section>

        <Section title="Header · Section header · Navigation bar">
          <Header title={ar(lang, 'Money', 'أموالك')} trailing={<Chip icon="coins" label={ar(lang, 'Earn cashback', 'اكسب كاش باك')} />} />
          <SectionHeader title={ar(lang, 'Upcoming', 'الدفعات الجاية')} action={ar(lang, 'History', 'سجل الدفعات')} onAction={() => {}} />
          <NavigationBar title={ar(lang, 'Overdue payment', 'دفعة متأخرة')} leading="back" onLeading={() => {}} />
          <NavigationBar title={ar(lang, 'Pay with', 'الدفع بـ')} leading="close" onLeading={() => {}} />
        </Section>

        <Section title="Segmented control">
          <SegmentedControl value={seg} onChange={setSeg} options={[{ value: '7d', label: ar(lang, '7 days', '7 أيام') }, { value: '30d', label: ar(lang, '30 days', '30 يوم') }, { value: 'all', label: ar(lang, 'All', 'الكل') }]} />
        </Section>

        <Section title="Payment card">
          <PaymentCard state="due" label={ar(lang, 'Next payment', 'الدفعة الجاية')} amount={m(31250)} dueLine={fmt.dueLine('2026-11-05', '2026-10-31', lang)}
            pay={{ label: ar(lang, `Pay ${m(31250)}`, `ادفع ${m(31250)}`), onPress: () => {} }} linksRow
            links={[{ label: ar(lang, 'Choose what to pay', 'اختر دفعاتك'), onPress: () => {} }, { label: ar(lang, 'Extend a payment', 'أجّل دفعة'), onPress: () => {} }]}
            summary={[{ k: ar(lang, 'Due in 30 days', 'موعدها بعد 30 يوم'), v: m(31250) }, { k: ar(lang, 'Total to pay', 'الإجمالي المستحق'), v: m(135000) }]} />
          <PaymentCard state="overdue" criticalFill tag={fmt.overdueTag(3, lang)} label={ar(lang, 'Amount overdue', 'المبلغ المتأخر')} amount={m(31250)} dueLine={ar(lang, 'Was due Wed 28 Oct', `كان موعدها ${fmt.dayDate('2026-10-28', 'ar')}`)} dueCritical
            pay={{ label: ar(lang, `Pay ${m(31250)} now`, `ادفع ${m(31250)} الحين`), critical: true, onPress: () => {} }} links={[{ label: ar(lang, 'What happens next', 'وش يصير بعدين'), critical: true, onPress: () => {} }]} />
          <PaymentCard state="caughtUp" label={ar(lang, 'Next payment', 'الدفعة الجاية')} title={ar(lang, "You're all caught up", 'ما عليك دفعات مستحقة')} dueLine={ar(lang, `${m(31250)} on Sat 28 Nov`, `${m(31250)} يوم ${fmt.dayDate('2026-11-28', 'ar')}`)}
            links={[{ label: ar(lang, 'Pay early', 'ادفع بدري'), onPress: () => {} }]} />
          <Note>States: Due · Overdue (critical fill) · Caught up</Note>
        </Section>

        <Section title="List row · List group">
          <ListGroup>
            <ListRow title={ar(lang, 'Souq Lane', 'سوق لين')} subtitle={ar(lang, 'Thu 5 Nov · 2 of 4', `${fmt.dayDate('2026-11-05', 'ar')} · 2 من 4`)} value={m(12500)} chevron leading={{ kind: 'logo', text: 'S', color: '#F5C400' }} onPress={() => {}} />
            <ListRow title={ar(lang, 'Dune Wear', 'ديون وير')} subtitle={ar(lang, 'Was due Wed 28 Oct', `كان موعدها ${fmt.dayDate('2026-10-28', 'ar')}`)} subtitleColor="color/text/content/critical/default" value={m(18750)} chevron leading={{ kind: 'logo', text: 'D', color: '#1A1A1A' }} onPress={() => {}} />
            <ListRow title={ar(lang, 'In-store Card', 'بطاقة المتجر')} subtitle={ar(lang, 'Shop in person, split in 4', 'تسوّق من المتاجر وقسّمها على 4 دفعات')} chevron leading={{ kind: 'icon', icon: 'credit-card' }} onPress={() => {}} />
            <ListRow title={ar(lang, 'Push reminders', 'إشعارات التطبيق')} subtitle={ar(lang, 'Before and after each due date', 'قبل وبعد كل موعد سداد')} quietValue={ar(lang, 'Always on', 'شغّالة دايم')} />
            <ListRow title={ar(lang, 'Loading', 'تحميل')} leading={{ kind: 'skeleton' }} />
          </ListGroup>
          <ListGroup>
            {[0, 1].map((i) => <ListRow key={i} title={ar(lang, i ? 'Until Wed 11 Nov' : 'Until Wed 4 Nov', i ? 'لين الأربعاء 11 نوفمبر' : 'لين الأربعاء 4 نوفمبر')} quietValue={`Fee ${m(5000)}`} selection={{ kind: 'radio', selected: radio === i }} onPress={() => setRadio(i)} />)}
            <ListRow title={ar(lang, 'Souq Lane', 'سوق لين')} subtitle={`Fee ${m(2000)}`} value={m(12500)} leading={{ kind: 'logo', text: 'S', color: '#F5C400' }} selection={{ kind: 'check', selected: check }} onPress={() => setCheck(!check)} />
            <ListRow title={ar(lang, 'Salary day reminder', 'تذكير يوم الراتب')} selection={{ kind: 'switch', value: sw, onChange: setSw }} />
          </ListGroup>
          <Note>Leading: Logo · Icon · Skeleton. Trailing: value · quiet value · chevron · Radio · Check · Switch</Note>
        </Section>

        <Section title="Key-value pair">
          <View style={{ flexDirection: 'row', gap: th.t('space/gap-x/sm'), backgroundColor: th.t('color/surface/secondary/default') as string, borderRadius: th.t('radius/md'), padding: th.t('space/padding/sm') }}>
            <KeyValue k={ar(lang, 'Due in 30 days', 'موعدها بعد 30 يوم')} v={m(31250)} /><KeyValue k={ar(lang, 'Total to pay', 'الإجمالي المستحق')} v={m(135000)} />
          </View>
          <View style={{ gap: th.t('space/gap-y/sm'), backgroundColor: th.t('color/surface/default') as string, borderRadius: th.t('radius/xl'), padding: th.t('space/padding/md') }}>
            <KeyValue layout="row" k={ar(lang, 'Order total', 'إجمالي الطلب')} v={m(50000)} />
            <KeyValue layout="row" strong k={ar(lang, 'Left to pay', 'المتبقي')} v={m(37500)} />
          </View>
        </Section>

        <Section title="Notice · Toast">
          <Notice tone="critical" title={ar(lang, "Payment didn't go through", 'ما تمّ الدفع')} body={ar(lang, 'Your bank declined it. No money was taken.', 'بنكك رفضها، وما انخصم منك شي.')} />
          <Notice icon="wifi-slash" title={ar(lang, "You're offline", 'ما فيه إنترنت')} body={ar(lang, 'Showing your last update, today 8:15 AM. Connect to pay or extend.', 'هذا آخر تحديث، اليوم 8:15 ص. اتصل بالإنترنت عشان تدفع أو تأجّل.')} />
          <Notice icon="bell-slash" title={ar(lang, 'Notifications are off', 'الإشعارات مقفلة')}><Button variant="link" label={ar(lang, 'Open iPhone Settings', 'افتح إعدادات الآيفون')} /></Notice>
          <View style={{ flexDirection: 'row', gap: th.t('space/gap-x/sm') }}>
            <Button full={false} variant="link" label="Toast · Success" onPress={() => toast({ tone: 'success', text: ar(lang, 'Reminders on', 'التذكيرات شغّالة') })} />
            <Button full={false} variant="link" label="Toast · Neutral" onPress={() => toast({ tone: 'neutral', text: ar(lang, 'Reminders are off. You can change this in Profile › Notifications.', 'التذكيرات مقفلة. تقدر تغيّر هذا من حسابك › الإشعارات.') })} />
          </View>
        </Section>

        <Section title="Bottom sheet">
          <Button variant="link" label={ar(lang, 'Open sheet', 'افتح الورقة')} onPress={() => setSheet(true)} />
          <BottomSheet visible={sheet} title={ar(lang, 'Pay next payment', 'ادفع الدفعة الجاية')} onClose={() => setSheet(false)}>
            <View style={{ gap: th.t('space/gap-y/3xs') }}><Txt role="body/sm" color="color/text/content/secondary/default">{ar(lang, 'Amount', 'المبلغ')}</Txt><Txt role="display/lg" tabular>{m(31250)}</Txt></View>
            <Button label={ar(lang, `Pay ${m(31250)}`, `ادفع ${m(31250)}`)} onPress={() => setSheet(false)} />
          </BottomSheet>
        </Section>

        <Section title="Skeleton">
          <View style={{ gap: th.t('space/gap-y/xs') }}><Bar w="30%" /><Bar w="55%" h={th.t('size/height/xs')} r={th.t('radius/sm')} /><Bar w="100%" h={th.t('size/height/md')} r={th.t('radius/md')} /></View>
        </Section>

        <Section title="Type roles">
          {roles.map((r) => <Txt key={r} role={r} numberOfLines={1}>{r} · {ar(lang, 'Pay', 'ادفع')} {m(31250)}</Txt>)}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const th = useTheme();
  return <View style={{ gap: th.t('space/gap-y/sm') }}><Txt role="heading/md">{title}</Txt>{children}</View>;
}
function Note({ children }: { children: React.ReactNode }) {
  return <Txt role="caption" color="color/text/content/tertiary/default">{children}</Txt>;
}
