// Taken from https://github.com/alabsi91/reanimated-color-picker/tree/main/ExampleExpo
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import ColorPicker, {
  OpacitySlider,
  PreviewText,
  RedSlider,
  GreenSlider,
  BlueSlider,
} from 'reanimated-color-picker';
import type { returnedResults } from 'reanimated-color-picker';

export default function ColorPickerThing({ value, setValue }: { value: string, setValue: (color: string) => void } ) {
  const [showModal, setShowModal] = useState(false);

  const selectedColor = useSharedValue(value);
  const backgroundColorStyle = useAnimatedStyle(() => ({ backgroundColor: selectedColor.value }));

  const onColorSelect = (color: returnedResults) => {
    selectedColor.value = color.hex;
    setValue(color.hex);
  };

  return (
    <>
      <Pressable style={{...styles.openButton, backgroundColor: value}} onPress={() => setShowModal(true)}>
        <Text style={styles.centeredText}>{value}</Text>
      </Pressable>

      <Modal onRequestClose={() => setShowModal(false)} visible={showModal} animationType='slide'>
        <Animated.View style={[styles.container, backgroundColorStyle]}>
          <View style={styles.pickerContainer}>
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
              <Text style={styles.sliderTitle}>Red</Text>
              <RedSlider style={styles.sliderStyle} />

              <Text style={styles.sliderTitle}>Green</Text>
              <GreenSlider style={styles.sliderStyle} />

              <Text style={styles.sliderTitle}>Blue</Text>
              <BlueSlider style={styles.sliderStyle} />

              <Text style={styles.sliderTitle}>Opacity</Text>
              <OpacitySlider style={styles.sliderStyle} />

              <View style={styles.previewTxtContainer}>
                <PreviewText colorFormat='rgba' />
              </View>
            </ColorPicker>
          </View>

          <Pressable style={styles.closeButton} onPress={() => setShowModal(false)}>
            <Text>Close</Text>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  centeredText: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: 'orange',
  },
  pickerContainer: {
    alignSelf: 'center',
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,

    elevation: 10,
  },
  sliderTitle: {
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 5,
    paddingHorizontal: 4,
  },
  sliderStyle: {
    borderRadius: 20,
    marginBottom: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  previewTxtContainer: {
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#bebdbe',
  },
  swatchesContainer: {
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#bebdbe',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 10,
  },
  swatchStyle: {
    borderRadius: 20,
    height: 30,
    width: 30,
    margin: 0,
    marginBottom: 0,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  openButton: {
    width: '100%',
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 10,
    marginVertical: 5,
    backgroundColor: '#fff',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    bottom: 10,
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 10,
    alignSelf: 'center',
    backgroundColor: '#fff',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});