import { useLocalSearchParams } from 'expo-router';
import { Stub } from '../../../ui/Stub';
export default function MoneyStub() { const { from } = useLocalSearchParams<{ from: string }>(); return <Stub from={from ?? 'unknown'} />; }
