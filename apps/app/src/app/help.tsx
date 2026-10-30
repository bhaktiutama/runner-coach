import { REFERENCES, RULES, type EngineMessageKey } from '@run-coach/training-engine';
import { border, color, Icon, IconButton, radius, ring, shadow, size, space, Text } from '@run-coach/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { helpCatalog, type HelpTopic } from '@/i18n/help';
import { t } from '@/i18n/t';
import { et, refShort } from '@/lib/rationale';

const GRADE_DOT = {
  A: color.success,
  B: color.success,
  C: color.status.attentionInk,
  D: color.textMuted,
} as const;

/** 4.7 Panduan & istilah (F-20). Dibuka dari Profil atau tombol (i) dengan `?topic=`. */
export default function Help() {
  const { topic } = useLocalSearchParams<{ topic?: string }>();
  const { text: helpText, groups: HELP } = helpCatalog();
  const focused = HELP.flatMap((g) => g.topics).find((x) => x.id === topic);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));
  return (
    <Screen testID="screen-help">
      <View style={styles.top}>
        <IconButton icon="back" label={t('common.back')} onPress={back} />
        <Text variant="controlStrong" color="textMuted" align="center" style={styles.flex}>
          {helpText.title}
        </Text>
        <View style={styles.spacer} />
      </View>
      {focused ? (
        <View testID="help-focused">
          <TopicCard topic={focused} initiallyOpen />
        </View>
      ) : (
        <Text variant="subtitle" color="textMuted">
          {helpText.intro}
        </Text>
      )}
      {HELP.map((g) => (
        <View key={g.id} style={styles.group}>
          <Text variant="sectionCaps" color="textMuted" style={styles.groupTitle}>
            {g.title}
          </Text>
          <View style={styles.card}>
            {g.topics.map((x, i) => (
              <View key={x.id} style={i > 0 ? styles.sep : null}>
                <TopicCard topic={x} flat />
              </View>
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

function TopicCard({
  topic,
  initiallyOpen,
  flat,
}: {
  topic: HelpTopic;
  initiallyOpen?: boolean;
  flat?: boolean;
}) {
  const [open, setOpen] = useState(!!initiallyOpen);
  const [sources, setSources] = useState(false);
  const { text: helpText } = helpCatalog();
  const rule = topic.rule ? RULES[topic.rule] : undefined;
  const refs = rule ? rule.refs.map((id) => REFERENCES[id]).filter((r) => !!r) : [];
  return (
    <View style={flat ? styles.row : styles.focus}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        testID={`help-${topic.id}`}
        style={styles.head}
      >
        <Text variant="row" style={styles.flex}>
          {topic.rule ? `${topic.rule} · ${topic.title}` : topic.title}
        </Text>
        <Icon name={open ? 'minus' : 'plus'} size={space[4] + space[1] / 2} color={color.textMuted} />
      </Pressable>
      {open ? (
        <View style={styles.body}>
          <Text variant="bodySm">{topic.body}</Text>
          {rule ? (
            <View style={styles.meta}>
              <View style={styles.grade}>
                <View style={[styles.dot, { backgroundColor: GRADE_DOT[rule.grade] }]} />
                <Text variant="captionStrong">{et(`grade.${rule.grade}` as EngineMessageKey)}</Text>
              </View>
              {refs.length ? (
                <Pressable onPress={() => setSources(!sources)} accessibilityRole="button">
                  <Text variant="captionStrong" color="primaryInk" style={styles.underline}>
                    {sources ? t('preview.hideSources') : t('preview.sources')}
                  </Text>
                </Pressable>
              ) : (
                <Text variant="caption" color="textMuted">
                  {helpText.noSource}
                </Text>
              )}
            </View>
          ) : null}
          {sources
            ? refs.map((r) => (
                <Text
                  key={r.id}
                  variant="note"
                  color={r.url ? 'primaryInk' : 'textMuted'}
                  onPress={r.url ? () => void Linking.openURL(r.url!) : undefined}
                >
                  {refShort(r)}
                </Text>
              ))
            : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center' },
  spacer: { width: space[10] + space[1] },
  group: { gap: space[2] },
  groupTitle: { paddingLeft: space[1] },
  card: { backgroundColor: color.surface, borderRadius: radius.md, overflow: 'hidden', ...shadow.card },
  sep: { borderTopWidth: border.hairline, borderTopColor: color.line },
  row: { paddingHorizontal: space[4] },
  focus: {
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    ...ring(border.selected, color.text),
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: size.input },
  body: { gap: space[2], paddingBottom: space[4] },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space[2] + space[1] / 2, flexWrap: 'wrap' },
  grade: { flexDirection: 'row', alignItems: 'center', gap: space[1] + space[1] / 2 },
  dot: { width: space[2], height: space[2], borderRadius: radius.stadium },
  underline: { textDecorationLine: 'underline' },
});
