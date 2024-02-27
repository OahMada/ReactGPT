import { useRecordHotkeys } from 'react-hotkeys-hook';
import { useEffect } from 'react';
import styled from 'styled-components';

import { generateHotkeyLabel } from '../utils';
import { LocalStorageHotkeys, RecordingStopper } from '../types';
import { Button } from '../styles';

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
				<Button onClick={submit}>Done</Button>
			</StyledTd>
		);
	}
	return (
		<StyledTd>
			<Button
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
			>
				{keyBinding.label}
			</Button>
		</StyledTd>
	);
};

var StyledTd = styled.td<{ $newHotkey?: string }>`
	span {
		display: inline-block;
		width: 70%;

		/* (button height - font-size * line-height - border size) / 2  */
		padding: calc(((var(--util-icon-container-dimension) - var(--font-primary) * 1.5) - 2px) / 2);
		border: 1px solid var(--color-dark);
		margin-right: 5px;
		color: ${({ $newHotkey }) => ($newHotkey ? 'black' : 'var(--color-dark)')};
	}
`;
