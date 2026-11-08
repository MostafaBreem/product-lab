// Deep link vezeeta://appointments/<id>[?type=<reminder type>] (build-spec.md > Navigation; build-spec-rules.md > Edge states).
// Moved unresolved -> B2 · card on Upcoming -> B1 · unknown / resolved / past -> B1 + Toast link.changed. reminder_opened always logged when the type is known.
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useToast } from '@lab/app-kit';
import { ev } from '../../../domain/analytics';
import { linkData, linkTarget } from '../../../domain/push';
import { allBookings, now } from '../../../domain/server';
import { useStore } from '../../../state';
import { goTarget } from '../../../ui/notify';

export default function AppointmentLink() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const toast = useToast();
  const { lang } = useStore();
  useEffect(() => {
    const bs = allBookings();
    const d = linkData(id, type, bs);
    if (d) ev.reminderOpened({ type: d.type });
    goTarget(linkTarget(id, bs, now()), toast, lang);
  }, [id, type]);
  return <View />;
}
