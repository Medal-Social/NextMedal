import TextInputWithPresets from '@/sanity/ui/TextInputWithPresets';
import {
  MdFormatAlignCenter,
  MdFormatAlignJustify,
  MdFormatAlignLeft,
  MdFormatAlignRight,
  MdVerticalAlignBottom,
  MdVerticalAlignCenter,
  MdVerticalAlignTop,
  MdVerticalDistribute,
} from 'react-icons/md';
import { type FieldsetDefinition, defineField } from 'sanity';

export const alignmentFieldset: FieldsetDefinition = {
  name: 'alignment',
  title: 'Alignment',
  options: { columns: 2 },
};

export const alignItems = defineField({
  name: 'alignItems',
  title: 'Vertical alignment',
  type: 'string',
  components: {
    input: (props) => (
      <TextInputWithPresets
        presets={[
          { value: 'start', icon: MdVerticalAlignTop },
          { value: 'center', icon: MdVerticalAlignCenter },
          { value: 'end', icon: MdVerticalAlignBottom },
          { value: 'stretch', icon: MdVerticalDistribute },
        ]}
        {...props}
      />
    ),
  },
  initialValue: 'center',
  group: 'options',
});

export const textAlign = defineField({
  name: 'textAlign',
  title: 'Text alignment',
  type: 'string',
  components: {
    input: (props) => (
      <TextInputWithPresets
        presets={[
          { value: 'left', icon: MdFormatAlignLeft },
          { value: 'center', icon: MdFormatAlignCenter },
          { value: 'right', icon: MdFormatAlignRight },
          { value: 'justify', icon: MdFormatAlignJustify },
        ]}
        {...props}
      />
    ),
  },
  initialValue: 'center',
  group: 'options',
});
