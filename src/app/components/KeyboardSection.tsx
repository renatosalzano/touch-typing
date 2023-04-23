import { FC, useState } from 'react'
import { Keyboard } from './keyboard/Keyboard'
import { KeyboardSettings } from './keyboard/KeyboardSettings'
import { getLayouts } from '../keyboard-layouts/layouts'

export const KeyboardSection: FC<{
  isTyping: boolean;
}> = ({
  isTyping
}) => {
    const [{ currentLayout, layouts, fingerPosition }, setKeyboardSettings] =
      useState({
        fingerPosition: true,
        currentLayout: "ANSI - United States QWERTY",
        layouts: getLayouts(),
      });
    return (
      <div className="keyboard-area">
        <KeyboardSettings
          layouts={layouts}
          setKeyboardSettings={setKeyboardSettings}
        />
        <Keyboard
          layout={currentLayout}
          fingerPosition={fingerPosition}
          activeKeyboard={isTyping}
        />
      </div>
    )
  }

export default KeyboardSection