import styled from 'styled-components';
import { useLocalStorage } from 'react-use';
import { compress, decompress } from 'lz-string';
import { useRef } from 'react';

import { HotkeyMapData } from '../utils';
import { LocalStorageHotkeys, RecordingStopper } from '../types';

import { HotkeyInput } from '../components';

export var HotkeyMap = () => {
	let hotkeyRecordingStopperRef = useRef<Map<'stopper', RecordingStopper>>(new Map()); // the initial value needs to be an object(or array, map) to properly save the `stop` util. https://stackoverflow.com/a/56444537/5800789

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

	return (
		<Section>
			<div className='table-container'>
				{hotkeyMapData.map((item) => {
					let hotkeys = Object.entries(item[1]);
					return (
						<table key={item[0]}>
							<caption>{item[0]}</caption>
							<thead>
								<tr>
									<th>Hotkey</th>
									<th>Description</th>
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
												hotkeyRecordingStopperRef={hotkeyRecordingStopperRef.current} // pass the ref value down to be altered
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
	margin: 0 auto;
	margin-top: var(--header-offset);

	.btn-container {
		display: flex;
		justify-content: flex-end;
		padding-bottom: 20px;
	}

	.table-container {
		width: var(--paragraph-width);
		padding-top: 10px;

		@media (width <= 46.875rem) {
			width: 100%;
		}
	}

	caption {
		margin-bottom: 8px;
		font-size: var(--font-big);
		font-weight: bold;
	}

	table {
		width: 100%;
		padding: 10px;
		border: 1px solid var(--color-dark);
		border-radius: var(--border-radius-big);

		&:not(:last-child) {
			margin-bottom: 10px;
		}

		th,
		td {
			padding: 8px;
			border-spacing: 0;
		}

		thead {
			background-color: var(--color-dark);
			font-size: var(--font-larger);

			th {
				&:nth-child(1) {
					width: 40%;
				}

				&:nth-child(2) {
					width: 60%;
				}
			}
		}

		tbody tr:nth-child(even) {
			background-color: var(--color-light);
		}

		tbody td {
			text-align: left;

			@media (width <= 28.125rem) {
				font-size: var(--font-small);
			}
		}
	}
`;
