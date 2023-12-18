import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'react-use';
import { compress, decompress } from 'lz-string';
import { useRef } from 'react';

import { useKeys, HotkeyMapData } from '../utils';
import { LocalStorageHotkeys, RecordingStopper } from '../types';

import { HotkeyInput } from '../components';

export var HotkeyMap = () => {
	let hotkeyRecordingStopperRef = useRef<RecordingStopper>(undefined);
	console.log(hotkeyRecordingStopperRef.current);

	let navigate = useNavigate();
	let hotkeyMapData = Object.entries(HotkeyMapData());
	let [userDefinedHotkeys, setUserDefinedHotkeys] = useLocalStorage<LocalStorageHotkeys>(
		'userDefinedHotkeys',
		{},
		{
			raw: false,
			serializer: (value) => compress(JSON.stringify(value)),
			deserializer: (value) => JSON.parse(decompress(value)),
		}
	);

	let clickExitButton = () => {
		navigate(-1);
	};

	let { 'Hotkey Map Page': hotkeyMapHotkeys } = HotkeyMapData();
	useKeys({ keyBinding: hotkeyMapHotkeys.exit.hotkey, callback: clickExitButton });

	return (
		<Section>
			<button onClick={clickExitButton} data-tooltip-id='hotkey' data-tooltip-content={hotkeyMapHotkeys.exit.label}>
				Exit
			</button>
			<div>
				{hotkeyMapData.map((item) => {
					let hotkeys = Object.entries(item[1]);
					return (
						<table key={item[0]}>
							<thead>
								<tr>
									<th>{item[0]}</th>
								</tr>
							</thead>
							<tbody>
								{hotkeys.map((hotkey) => {
									return (
										<tr key={hotkey[0]}>
											<HotkeyInput
												keyBinding={hotkey[1]}
												userDefinedHotkeys={userDefinedHotkeys}
												setUserDefinedHotkeys={setUserDefinedHotkeys}
												stopOthers={hotkeyRecordingStopperRef.current}
												ref={hotkeyRecordingStopperRef}
											/>
											<td>{hotkey[1].purpose}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					);
				})}
			</div>
		</Section>
	);
};

var Section = styled.section`
	font-size: 1.2rem;
`;
