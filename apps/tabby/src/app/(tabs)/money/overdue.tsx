// Overdue payment screen merged into the Money tab (Overdue board comment 2026-11-05, mock money-overdue-merge-en-v2).
// Old links, reminders and history land on the Money tab.
import { Redirect } from 'expo-router';
import React from 'react';
export default function Overdue() { return <Redirect href="/money" />; }
