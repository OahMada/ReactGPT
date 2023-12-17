import { useForm } from 'react-hook-form';
import { useRecordHotkeys } from 'react-hotkeys-hook';
import { generateHotkeyLabel } from '../utils';
import { LocalStorageHotkeys } from '../types';

interface Hotkey {
	label: string;
	hotkey: string;
	purpose: string;
	id: string;
}

interface Input {
	input: string;
}

export var HotkeyInput = ({
	keyBinding,
	userDefinedHotkeys,
	setUserDefinedHotkeys,
}: {
	keyBinding: Hotkey;
	userDefinedHotkeys: LocalStorageHotkeys;
	setUserDefinedHotkeys: React.Dispatch<React.SetStateAction<LocalStorageHotkeys>>;
}) => {
	let [keys, { start, stop, isRecording }] = useRecordHotkeys();

	let newHotkey = Array.from(keys).join('+');
	let { register, handleSubmit } = useForm<Input>({
		values: {
			input: generateHotkeyLabel(newHotkey),
		},
	});

	let onsubmit = () => {
		stop();
		setUserDefinedHotkeys({ ...userDefinedHotkeys, [keyBinding.id]: newHotkey });
	};

	if (isRecording) {
		return (
			<td>
				<form onSubmit={handleSubmit(onsubmit)}>
					<input type='text' {...register('input')} />
					<button>Done</button>
				</form>
			</td>
		);
	}
	return <td onClick={() => start()}>{keyBinding.label}</td>;
};
