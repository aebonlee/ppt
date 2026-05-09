import React from 'react';
import type { SlideData, ColorScheme, DesignTemplate } from '../../../types';
import { SummarySlide } from './SummarySlide';

interface Props { slide: SlideData; colors: ColorScheme; width: number; height: number; template: DesignTemplate; }

export const BackCoverSlide: React.FC<Props> = (props) => {
  return <SummarySlide {...props} />;
};
