// Comment mode (was Inspect; web only, debug tool, user 2026-11-04, renamed 2026-11-05). Overlay moved to app-kit (web/lab-tools
// CommentMode, 2026-11-09); this file wires it to Tabby's store and screen link.
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Platform } from 'react-native';
import { CommentMode } from '@lab/app-kit';
import { useStore } from '../state';

/** Screen link with the state that shapes it: scenario, language, theme (+ network, pay result when not default). */
export function useScreenLink() {
  const { settings, lang, scheme } = useStore();
  return (href = Platform.OS === 'web' ? window.location.href : '') => {
    const u = new URL(href);
    const q = new URLSearchParams({ scenario: settings.scenario, lang, scheme });
    if (settings.net !== 'online') q.set('net', settings.net);
    if (settings.payResult !== 'success') q.set('pay', settings.payResult);
    return `${u.origin}${u.pathname}?${q}`;
  };
}

export function Inspector() {
  const st = useStore();
  const link = useScreenLink();
  return <CommentMode on={st.inspect} onStop={() => st.setInspect(false)} link={() => link()} copy={Clipboard.setStringAsync} />;
}
