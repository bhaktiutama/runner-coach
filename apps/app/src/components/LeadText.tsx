import { fontFiles, Text } from '@run-coach/ui';
import type { ComponentProps } from 'react';

/** Teks dengan bagian sebelum ": " pertama ditebalkan (wireframe 1.3, 1.6: "<b>4 hari / minggu</b>: ..."). */
export function LeadText({
  text,
  separator = ': ',
  ...rest
}: { text: string; separator?: string } & ComponentProps<typeof Text>) {
  const i = text.indexOf(separator);
  // ": " tidak ikut tebal ("4 hari / minggu: ..."); "? " ikut ("Pindah HP? ...").
  const end = separator.startsWith(':') ? i : i + separator.trimEnd().length;
  if (i < 0)
    return (
      <Text variant="bodySm" {...rest}>
        {text}
      </Text>
    );
  return (
    <Text variant="bodySm" {...rest}>
      <Text variant="bodySm" style={{ fontFamily: fontFiles.ui700 }}>
        {text.slice(0, end)}
      </Text>
      {text.slice(end)}
    </Text>
  );
}
