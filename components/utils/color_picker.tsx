// Taken from https://github.com/alabsi91/reanimated-color-picker/tree/main/ExampleExpo
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import ColorPicker, {
  OpacitySlider,
  PreviewText,
  RedSlider,
  GreenSlider,
  BlueSlider,
} from 'reanimated-color-picker';
import type { returnedResults } from 'reanimated-color-picker';
import { useSettings } from '../settings';
import { getStyles } from '../styles';

export default function ColorPickerThing({ value, setValue }: { value: string, setValue: (color: string) => void } ) {
  const [showModal, setShowModal] = useState(false);

  const selectedColor = useSharedValue(value);
  const backgroundColorStyle = useAnimatedStyle(() => ({ backgroundColor: selectedColor.value }));

  useEffect(() => setValue(selectedColor.value), [showModal]);

  const onColorSelect = (color: returnedResults) => {
    selectedColor.value = color.hex;
  };

  const { theme } = useSettings();
  const styles = getStyles(theme);

  return (
    <>
      <Pressable style={[styles.colorPicker.openButton, { backgroundColor: value }]} onPress={() => setShowModal(true)}>
        <Text style={styles.colorPicker.centeredText}>{'#fff'}</Text>
      </Pressable>

      <Modal onRequestClose={() => setShowModal(false)} visible={showModal} animationType='slide'>
        <Animated.View style={[styles.colorPicker.container, backgroundColorStyle]}>
          <View style={styles.colorPicker.pickerContainer}>
            <ColorPicker
              value={value}
              sliderThickness={25}
              thumbSize={24}
              thumbShape='circle'
              onChange={onColorSelect}
              thumbAnimationDuration={100}
              adaptSpectrum
              boundedThumb
            >
              <Text style={styles.colorPicker.sliderTitle}>Red</Text>
              <RedSlider style={styles.colorPicker.sliderStyle} />

              <Text style={styles.colorPicker.sliderTitle}>Green</Text>
              <GreenSlider style={styles.colorPicker.sliderStyle} />

              <Text style={styles.colorPicker.sliderTitle}>Blue</Text>
              <BlueSlider style={styles.colorPicker.sliderStyle} />

              <Text style={styles.colorPicker.sliderTitle}>Opacity</Text>
              <OpacitySlider style={styles.colorPicker.sliderStyle} />

              <View style={styles.colorPicker.previewTxtContainer}>
                <PreviewText style={styles.colorPicker.sliderTitle} colorFormat='rgba' />
              </View>
            </ColorPicker>
          </View>

          <Pressable style={styles.colorPicker.closeButton} onPress={() => setShowModal(false)}>
            <Text>Close</Text>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
}