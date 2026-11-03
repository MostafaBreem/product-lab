import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { analytics, NavigationBar, Screen, Txt } from '@lab/app-kit';
import { useStore } from '../state';

/** "Not in this demo" (build-spec.md > Decided; copy g28, g29). */
export function Stub({ from, back = true }: { from: string; back?: boolean }) {
  const { s } = useStore();
  useEffect(() => { analytics.track('stub_opened', { target: from }); }, [from]);
  return (
    <Screen top={back ? <NavigationBar leading="back" onLeading={() => router.back()} /> : undefined}>
      <View style={{ gap: 8, paddingTop: 24 }}>
        <Txt role="heading/lg">{s.stub.title}</Txt>
        <Txt role="body/md" color="color/text/content/secondary/default" wrap>{s.stub.body}</Txt>
      </View>
    </Screen>
  );
}
