import { useRecordHotkeys } from 'react-hotkeys-hook';
import { useEffect } from 'react';
import styled from 'styled-components';

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
			<StyledTd $newHotkey={newHotkey}>
				<span>{newHotkey ? generateHotkeyLabel(newHotkey) : keyBinding.label}</span>
				<button onClick={submit} className='btn'>
					Done
				</button>
			</StyledTd>
		);
	}
	return (
		<StyledTd>
			<button
				onClick={() => {
					// run other hotkey's stop utility first
					let stopper = hotkeyRecordingStopperRef.get('stopper');
					if (stopper) {
						stopper();
					}
					start();
				}}
				data-tooltip-id='tip'
				data-tooltip-content='Click to change'
				className='btn'
			>
				{keyBinding.label}
			</button>
		</StyledTd>
	);
};

var StyledTd = styled.td<{ $newHotkey?: string }>`
	span {
		display: inline-block;
		width: 70%;
		border: 1px solid var(--color-dark);
		margin-right: 5px;
		color: ${({ $newHotkey }) => ($newHotkey ? 'black' : 'var(--color-dark)')};
	}
`;
