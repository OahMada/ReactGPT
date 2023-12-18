import { useRecordHotkeys } from 'react-hotkeys-hook';
import { useEffect } from 'react';

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
	hotkeyRecordingStopperRef: Map<'stopper', RecordingStopper>;
}

export var HotkeyInput = ({ keyBinding, userDefinedHotkeys, setUserDefinedHotkeys, hotkeyRecordingStopperRef }: HotkeyInputProps) => {
	let [keys, { start, stop, isRecording }] = useRecordHotkeys();
	let newHotkey = Array.from(keys).join('+');

	let submit = () => {
		stop();
		setUserDefinedHotkeys({ ...userDefinedHotkeys, [keyBinding.id]: newHotkey });
	};

	// save stop utility for later use
	useEffect(() => {
		if (isRecording) {
			hotkeyRecordingStopperRef.set('stopper', stop);
		}
	}, [hotkeyRecordingStopperRef, isRecording, stop]);

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
				let stopper = hotkeyRecordingStopperRef.get('stopper');
				if (stopper) {
					stopper();
					hotkeyRecordingStopperRef.clear();
				}
				start();
			}}
		>
			{keyBinding.label}
		</td>
	);
};
