import { Dimensions } from 'react-native';

export const { width, height } = Dimensions.get('screen');

export const CARD = {
  WIDTH: width * 0.9,
  HEIGHT: height * 0.78,
  BORDER_RADIUS: 20,
};

export const ACTION_OFFSET = 100;