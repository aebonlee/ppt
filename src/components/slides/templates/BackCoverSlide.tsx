import React from 'react';
import type { SlideData, ColorScheme } from '../../../types';
import { SummarySlide } from './SummarySlide';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; }

export const BackCoverSlide: React.FC<Props> = (props) => {
  return <SummarySlide {...props} />;
};
