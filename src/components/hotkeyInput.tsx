import { useRecordHotkeys } from 'react-hotkeys-hook';
import { forwardRef, useImperativeHandle } from 'react';

import { generateHotkeyLabel } from '../utils';
import { LocalStorageHotkeys, RecordingStopper } from '../types';

interface Hotkey {
	label: string;
	hotkey: string;
	purpose: string;
	id: string;
}

interface HotkeyInputProps {
	keyBinding: Hotkey;
	userDefinedHotkeys: LocalStorageHotkeys;
	setUserDefinedHotkeys: React.Dispatch<React.SetStateAction<LocalStorageHotkeys>>;
	stopOthers: RecordingStopper;
}

export var HotkeyInput = forwardRef<RecordingStopper, HotkeyInputProps>(
	({ keyBinding, userDefinedHotkeys, setUserDefinedHotkeys, stopOthers }, ref) => {
		let [keys, { start, stop, isRecording }] = useRecordHotkeys();
		let newHotkey = Array.from(keys).join('+');

		let submit = () => {
			stop();
			setUserDefinedHotkeys({ ...userDefinedHotkeys, [keyBinding.id]: newHotkey });
		};

		useImperativeHandle(ref, () => {
			if (isRecording) {
				return stop;
			}
		});

		if (isRecording) {
			return (
				<td>
					<span>{generateHotkeyLabel(newHotkey)}</span>
					<button onClick={submit}>Done</button>
				</td>
			);
		}
		return (
			<td
				onClick={() => {
					console.log(stopOthers);
					if (stopOthers) {
						stopOthers();
					}
					start();
				}}
			>
				{keyBinding.label}
			</td>
		);
	}
);
