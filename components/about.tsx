import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getStyles } from './styles'
import { useSettings } from './settings'

export default function AboutScreen() {
  const { theme } = useSettings();
  const styles = getStyles(theme);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  return (
    <View style={styles.baseContainer}>
      <ScrollView contentContainerStyle={styles.padded}>
        <Text style={styles.title}>About SelfTalk 💭✨</Text>
        <Text style={styles.content}>
          Like most great ideas, SelfTalk was born from a lifetime of frustration. Ever since I was a kid,
          journaling just <Text style={styles.italic}>didn't click</Text> for me. I hated everything about it:{"\n\n"}
          ✏️ Writing with a pen or pencil.{"\n"}
          📖 Filling out pages of paper.{"\n"}
          📅 The pressure of dates.{"\n"}
          📝 Crafting complete, polished sentences to express my thoughts.{"\n\n"}
          And worst of all? Journaling was treated as this <Text style={styles.italic}>end-of-the-day ritual</Text>—something you do outside
          your regular life. Who had time for that? I was barely keeping up with my regular life as it was!{"\n\n"}
          But here’s the thing: I <Text style={styles.italic}>knew</Text> journaling was powerful. A way to dive deep into your mind, sort through
          your emotions, and make sense of the chaos. I wanted that so badly. And every failed attempt to
          “just sit and write” made me more frustrated.{"\n\n"}
          Then came my senior year of college. I met people like me—same quirks, same upbringing—but they
          <Text style={styles.italic}> could</Text> journal! The twist? Their "journals" weren't traditional at all. They found creative, personal
          ways to pour their thoughts into the world. Watching them unlock the mysteries of their minds
          sparked something in me.{"\n\n"}
          So, I asked myself: <Text style={styles.italic}>What feels natural to me?</Text> Growing up as an only child who spent way too much
          time online and gaming, the answer was obvious: texting. Looking at my message history, I realized...{"\n"}
          I was already journaling. I’d been sending long, detailed updates about my life to friends, essentially
          narrating my story in real time.{"\n\n"}
          And then it hit me: <Text style={styles.italic}>Why can’t I be that friend to myself?</Text> Why not text my thoughts, my feelings,
          my random musings, to me?{"\n\n"}
          Once the idea took root, I couldn’t stop. It took me three days to create the first version of
          SelfTalk—just enough to get it working for <Text style={styles.italic}>me</Text>. Fast forward a year, and 40,000 messages later
          (yes, really 😅), I knew I had to share it with the world.{"\n\n"}
          And now, here it is, packaged up and ready for you to use. Whether you’re a journaling pro or someone
          who’s never written a word, SelfTalk is here to help you connect with <Text style={styles.italic}>you</Text>—in a way that feels as
          effortless as texting a friend.{"\n\n"}
          Enjoy! 💌🌟
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}