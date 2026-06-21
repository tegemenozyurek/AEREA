import React from 'react';
import { Linking, StyleSheet, Text, type TextStyle } from 'react-native';

type LinkableTextProps = {
  text: string;
  style?: TextStyle;
  linkStyle?: TextStyle;
};

type TextPart = { type: 'text' | 'link'; value: string };

function splitTextWithLinks(text: string): TextPart[] {
  const regex = /(https?:\/\/[^\s]+)/g;
  const parts: TextPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'link', value: match[1] });
    lastIndex = match.index + match[1].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: text }];
}

export default function LinkableText({ text, style, linkStyle }: LinkableTextProps) {
  const parts = splitTextWithLinks(text);

  return (
    <Text style={style}>
      {parts.map((part, index) =>
        part.type === 'link' ? (
          <Text
            key={`${part.value}-${index}`}
            style={[styles.link, linkStyle]}
            onPress={() => void Linking.openURL(part.value)}
          >
            {part.value}
          </Text>
        ) : (
          <Text key={`${index}-text`}>{part.value}</Text>
        ),
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    color: '#BAE6FD',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
