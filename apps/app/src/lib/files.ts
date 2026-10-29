import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// File backup milik pengguna (TRD 3.3): native lewat share sheet, web lewat unduhan browser.

export async function shareTextFile(name: string, text: string): Promise<boolean> {
  if (process.env.EXPO_OS === 'web') {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }
  const f = new File(Paths.cache, name);
  if (f.exists) f.delete();
  f.create();
  f.write(text);
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(f.uri, { mimeType: 'application/json', dialogTitle: name, UTI: 'public.json' });
  return true;
}

export async function pickTextFile(): Promise<string | null> {
  const r = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });
  if (r.canceled || !r.assets?.[0]) return null;
  const asset = r.assets[0];
  if (process.env.EXPO_OS === 'web' && asset.file) return asset.file.text();
  return new File(asset.uri).text();
}
